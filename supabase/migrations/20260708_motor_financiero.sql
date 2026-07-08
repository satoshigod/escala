-- ============================================================
-- MOTOR FINANCIERO DE ESCALA
-- Migration: 20260708_motor_financiero.sql
--
-- Módulos:
--   1. Monedas y tasas de cambio
--   2. Wallets (multi-moneda, un registro por usuario+moneda)
--   3. Ledger de doble partida (inmutable)
--   4. Fondeos / Recaudo
--   5. Órdenes de pago
--   6. Auditoría financiera (inmutable)
--
-- Moneda base de reporting: USD
-- Monedas activas MVP: COP, MXN, CLP, ARS, PEN, USD, EUR, USDT, USDC
-- Proveedores MVP: breb (COP), binance (USDT/USDC)
-- ============================================================

-- ---- 1. ENUM TYPES ----------------------------------------

CREATE TYPE moneda_tipo AS ENUM (
  'COP', 'MXN', 'CLP', 'ARS', 'PEN', 'USD', 'EUR', 'USDT', 'USDC'
);

CREATE TYPE proveedor_pago AS ENUM (
  'breb',      -- BRE-B Colombia
  'binance',   -- Binance USDT/USDC
  'spei',      -- México (fase futura)
  'khipu',     -- Chile (fase futura)
  'wompi',     -- Colombia tarjetas (fase futura)
  'stripe',    -- Internacional (fase futura)
  'manual'     -- Transferencia manual verificada por admin
);

CREATE TYPE estado_fondeo AS ENUM (
  'iniciado',
  'instrucciones_enviadas',
  'pendiente_confirmacion',
  'validando',
  'completado',
  'fallido',
  'expirado',
  'cancelado'
);

CREATE TYPE estado_orden AS ENUM (
  'borrador',
  'pendiente',
  'en_revision',
  'aprobada',
  'rechazada',
  'cancelada',
  'pagada',
  'fallida',
  'reversada'
);

CREATE TYPE tipo_ledger AS ENUM ('debito', 'credito');

CREATE TYPE tipo_cuenta AS ENUM (
  'wallet_usuario',
  'puente_breb',
  'puente_binance',
  'puente_spei',
  'puente_khipu',
  'pagos_externos',
  'comisiones_escala',
  'retencion_fiscal',
  'reserva_sistema'
);

CREATE TYPE wallet_estado AS ENUM ('activo', 'suspendido', 'bloqueado', 'cerrado');

-- ---- 2. TASAS DE CAMBIO -----------------------------------
-- Historial inmutable de tasas diarias contra USD
-- El motor consulta esta tabla al momento de cada transacción

CREATE TABLE exchange_rates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moneda        moneda_tipo NOT NULL,
  tasa_usd      numeric(24, 10) NOT NULL, -- 1 moneda = N USD
  fuente        text NOT NULL DEFAULT 'manual', -- 'binance_api', 'fixer_io', 'manual'
  fecha         date NOT NULL DEFAULT CURRENT_DATE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  UNIQUE(moneda, fecha)
);

-- Índice para consultas de tasa del día
CREATE INDEX idx_exchange_rates_moneda_fecha ON exchange_rates(moneda, fecha DESC);

-- Insertar tasas iniciales aproximadas (el admin las actualiza diariamente)
INSERT INTO exchange_rates (moneda, tasa_usd, fuente, fecha) VALUES
  ('USD',  1.0,          'sistema', CURRENT_DATE),
  ('USDT', 1.0,          'sistema', CURRENT_DATE),
  ('USDC', 1.0,          'sistema', CURRENT_DATE),
  ('COP',  0.000245,     'sistema', CURRENT_DATE), -- ~$4,080 COP = 1 USD
  ('MXN',  0.058,        'sistema', CURRENT_DATE), -- ~17.2 MXN = 1 USD
  ('CLP',  0.001065,     'sistema', CURRENT_DATE), -- ~939 CLP = 1 USD
  ('ARS',  0.00109,      'sistema', CURRENT_DATE), -- ~920 ARS = 1 USD
  ('PEN',  0.267,        'sistema', CURRENT_DATE), -- ~3.74 PEN = 1 USD
  ('EUR',  1.08,         'sistema', CURRENT_DATE)  -- ~0.925 EUR = 1 USD
ON CONFLICT (moneda, fecha) DO NOTHING;

-- ---- 3. WALLETS -------------------------------------------
-- Un registro por usuario POR moneda
-- Los saldos NUNCA se guardan aquí — se calculan desde ledger_entries

CREATE TABLE wallets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  moneda        moneda_tipo NOT NULL,
  estado        wallet_estado NOT NULL DEFAULT 'activo',
  pais          text, -- ISO 3166-1 alpha-2: CO, MX, CL, AR, PE, EC, ES
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, moneda)
);

CREATE INDEX idx_wallets_usuario ON wallets(usuario_id);
CREATE INDEX idx_wallets_moneda ON wallets(moneda);

-- ---- 4. LEDGER DE DOBLE PARTIDA --------------------------
-- INMUTABLE: nunca DELETE ni UPDATE
-- Cada movimiento genera exactamente 2 entradas (débito + crédito)
-- La suma de débitos siempre = suma de créditos (balance = 0)

CREATE TABLE ledger_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                tipo_ledger NOT NULL,
  cuenta_origen       text NOT NULL,  -- 'wallet:{uuid}' o nombre de cuenta sistema
  cuenta_destino      text NOT NULL,
  monto               numeric(24, 6) NOT NULL CHECK (monto > 0),
  moneda              moneda_tipo NOT NULL,
  monto_usd           numeric(24, 6) NOT NULL, -- equivalente USD al momento
  tasa_usd            numeric(24, 10) NOT NULL, -- tasa usada para conversión
  referencia_tipo     text NOT NULL, -- 'fondeo', 'pago', 'comision', 'reversal', 'ajuste'
  referencia_id       uuid NOT NULL,  -- FK al objeto que generó el movimiento
  descripcion         text NOT NULL,
  idempotency_key     text UNIQUE NOT NULL,
  balance_antes       numeric(24, 6), -- saldo del wallet antes (para auditoría rápida)
  balance_despues     numeric(24, 6), -- saldo del wallet después
  metadata            jsonb DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid REFERENCES perfiles(id) ON DELETE SET NULL -- sistema o admin
);

-- Índices críticos para cálculo de saldos
CREATE INDEX idx_ledger_cuenta_origen ON ledger_entries(cuenta_origen);
CREATE INDEX idx_ledger_cuenta_destino ON ledger_entries(cuenta_destino);
CREATE INDEX idx_ledger_referencia ON ledger_entries(referencia_tipo, referencia_id);
CREATE INDEX idx_ledger_moneda ON ledger_entries(moneda);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);

-- ---- 5. FONDEOS / RECAUDO --------------------------------

CREATE TABLE fondeos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id             uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  usuario_id            uuid NOT NULL REFERENCES perfiles(id) ON DELETE RESTRICT,
  proveedor             proveedor_pago NOT NULL,
  moneda_origen         moneda_tipo NOT NULL, -- moneda en que paga el usuario
  moneda_destino        moneda_tipo NOT NULL, -- moneda en que se acredita el wallet
  monto_solicitado      numeric(24, 6) NOT NULL CHECK (monto_solicitado > 0),
  monto_recibido        numeric(24, 6), -- confirmado por el proveedor
  monto_usd             numeric(24, 6), -- equivalente USD al momento de acreditación
  tasa_cambio           numeric(24, 10) NOT NULL DEFAULT 1,
  comision_proveedor    numeric(24, 6) DEFAULT 0,
  comision_escala       numeric(24, 6) DEFAULT 0,
  monto_neto            numeric(24, 6), -- lo que efectivamente entra al wallet
  estado                estado_fondeo NOT NULL DEFAULT 'iniciado',
  referencia_proveedor  text,  -- ID de la transacción en BRE-B o Binance
  instrucciones_pago    jsonb, -- cuenta bancaria, dirección crypto, QR, referencia
  comprobante_url       text,
  direccion_crypto      text,  -- para Binance
  hash_tx               text,  -- hash de transacción blockchain
  razon_fallo           text,
  idempotency_key       text UNIQUE NOT NULL,
  expires_at            timestamptz, -- cuándo expira la referencia de pago
  confirmado_at         timestamptz,
  acreditado_at         timestamptz,
  metadata              jsonb DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fondeos_usuario ON fondeos(usuario_id);
CREATE INDEX idx_fondeos_wallet ON fondeos(wallet_id);
CREATE INDEX idx_fondeos_estado ON fondeos(estado);
CREATE INDEX idx_fondeos_proveedor ON fondeos(proveedor);
CREATE INDEX idx_fondeos_referencia ON fondeos(referencia_proveedor);

-- ---- 6. ÓRDENES DE PAGO ----------------------------------
-- Los pagos NO son automáticos en MVP.
-- El sistema genera la solicitud, el admin la ejecuta manualmente.

CREATE TABLE payment_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id             uuid REFERENCES proyectos(id) ON DELETE SET NULL,
  solicitante_id          uuid NOT NULL REFERENCES perfiles(id) ON DELETE RESTRICT,
  beneficiario_id         uuid NOT NULL REFERENCES perfiles(id) ON DELETE RESTRICT,
  wallet_origen_id        uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  wallet_destino_id       uuid REFERENCES wallets(id) ON DELETE SET NULL,
  moneda                  moneda_tipo NOT NULL,
  monto                   numeric(24, 6) NOT NULL CHECK (monto > 0),
  monto_usd               numeric(24, 6), -- calculado al crear
  tasa_cambio_creacion    numeric(24, 10) NOT NULL DEFAULT 1,
  tasa_cambio_ejecucion   numeric(24, 10), -- tasa al momento de pagar
  monto_ejecutado         numeric(24, 6), -- puede diferir del solicitado por tasa
  concepto                text NOT NULL,
  descripcion             text,
  estado                  estado_orden NOT NULL DEFAULT 'pendiente',
  -- Control de flujo de aprobación
  aprobado_por            uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  rechazado_por           uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  ejecutado_por           uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  reversado_por           uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  razon_rechazo           text,
  observaciones_admin     text,
  -- Pago externo
  metodo_pago_externo     text, -- 'transferencia', 'efectivo', 'crypto', etc.
  comprobante_url         text,
  numero_referencia       text,
  -- Relación con hitos/tareas (puente con motor Escala)
  hito_id                 uuid REFERENCES hitos(id) ON DELETE SET NULL,
  postulacion_id          uuid REFERENCES postulaciones(id) ON DELETE SET NULL,
  -- Control
  idempotency_key         text UNIQUE NOT NULL,
  metadata                jsonb DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  aprobado_at             timestamptz,
  ejecutado_at            timestamptz,
  reversado_at            timestamptz
);

CREATE INDEX idx_pr_solicitante ON payment_requests(solicitante_id);
CREATE INDEX idx_pr_beneficiario ON payment_requests(beneficiario_id);
CREATE INDEX idx_pr_proyecto ON payment_requests(proyecto_id);
CREATE INDEX idx_pr_estado ON payment_requests(estado);
CREATE INDEX idx_pr_wallet_origen ON payment_requests(wallet_origen_id);
CREATE INDEX idx_pr_hito ON payment_requests(hito_id);
CREATE INDEX idx_pr_postulacion ON payment_requests(postulacion_id);

-- ---- 7. AUDITORÍA FINANCIERA -----------------------------
-- INMUTABLE: nunca DELETE ni UPDATE
-- Cada acción del sistema o del admin genera un registro

CREATE TABLE financial_audit (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operacion           text NOT NULL, -- 'fondeo.iniciado', 'pago.aprobado', etc.
  entidad_tipo        text NOT NULL, -- 'fondeo', 'payment_request', 'wallet', 'ledger'
  entidad_id          uuid NOT NULL,
  usuario_id          uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  administrador_id    uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  wallet_origen       text,
  wallet_destino      text,
  proyecto_id         uuid REFERENCES proyectos(id) ON DELETE SET NULL,
  monto               numeric(24, 6),
  moneda              moneda_tipo,
  monto_usd           numeric(24, 6),
  estado_anterior     text,
  estado_nuevo        text,
  -- Datos de sesión
  ip                  text,
  user_agent          text,
  pais_ip             text,
  -- Control de integridad
  observaciones       text,
  hash_interno        text, -- SHA256 del registro para verificación
  metadata            jsonb DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_audit_operacion ON financial_audit(operacion);
CREATE INDEX idx_fin_audit_entidad ON financial_audit(entidad_tipo, entidad_id);
CREATE INDEX idx_fin_audit_usuario ON financial_audit(usuario_id);
CREATE INDEX idx_fin_audit_admin ON financial_audit(administrador_id);
CREATE INDEX idx_fin_audit_created ON financial_audit(created_at DESC);

-- ---- 8. VISTAS CALCULADAS ---------------------------------

-- Saldo de wallet calculado desde ledger (NUNCA guardar saldo directamente)
CREATE OR REPLACE VIEW wallet_balances AS
SELECT
  w.id AS wallet_id,
  w.usuario_id,
  w.moneda,
  w.estado,
  w.pais,
  COALESCE(
    SUM(CASE
      WHEN le.cuenta_destino = 'wallet:' || w.id::text
        AND le.tipo = 'credito' THEN le.monto
      WHEN le.cuenta_origen = 'wallet:' || w.id::text
        AND le.tipo = 'debito' THEN -le.monto
      ELSE 0
    END), 0
  ) AS saldo_disponible,
  COALESCE(
    SUM(CASE
      WHEN le.cuenta_destino = 'wallet:' || w.id::text
        AND le.tipo = 'credito' THEN le.monto_usd
      WHEN le.cuenta_origen = 'wallet:' || w.id::text
        AND le.tipo = 'debito' THEN -le.monto_usd
      ELSE 0
    END), 0
  ) AS saldo_usd,
  COUNT(le.id) AS total_movimientos
FROM wallets w
LEFT JOIN ledger_entries le
  ON le.cuenta_origen = 'wallet:' || w.id::text
  OR le.cuenta_destino = 'wallet:' || w.id::text
GROUP BY w.id, w.usuario_id, w.moneda, w.estado, w.pais;

-- Saldo comprometido (pagos aprobados pendientes de ejecutar)
CREATE OR REPLACE VIEW wallet_comprometido AS
SELECT
  wallet_origen_id AS wallet_id,
  moneda,
  SUM(monto) AS monto_comprometido,
  SUM(monto_usd) AS monto_usd_comprometido,
  COUNT(*) AS ordenes_pendientes
FROM payment_requests
WHERE estado IN ('aprobada')
GROUP BY wallet_origen_id, moneda;

-- ---- 9. RLS -----------------------------------------------

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_propio" ON wallets
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "wallet_admin" ON wallets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_propio" ON ledger_entries
  FOR SELECT USING (
    cuenta_origen = 'wallet:' || (
      SELECT id::text FROM wallets WHERE usuario_id = auth.uid() LIMIT 1
    ) OR
    cuenta_destino = 'wallet:' || (
      SELECT id::text FROM wallets WHERE usuario_id = auth.uid() LIMIT 1
    )
  );
CREATE POLICY "ledger_admin" ON ledger_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

ALTER TABLE fondeos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fondeo_propio" ON fondeos
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "fondeo_insercion" ON fondeos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "fondeo_admin" ON fondeos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_solicitante" ON payment_requests
  FOR SELECT USING (
    auth.uid() = solicitante_id OR auth.uid() = beneficiario_id
  );
CREATE POLICY "pr_insercion" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = solicitante_id);
CREATE POLICY "pr_admin" ON payment_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

ALTER TABLE financial_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_only" ON financial_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates_lectura_publica" ON exchange_rates
  FOR SELECT USING (true);
CREATE POLICY "rates_admin" ON exchange_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
  );

-- ---- 10. FUNCIÓN: crear wallet si no existe ---------------

CREATE OR REPLACE FUNCTION crear_wallet_si_no_existe(
  p_usuario_id uuid,
  p_moneda moneda_tipo,
  p_pais text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE usuario_id = p_usuario_id AND moneda = p_moneda;

  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (usuario_id, moneda, pais)
    VALUES (p_usuario_id, p_moneda, p_pais)
    RETURNING id INTO v_wallet_id;
  END IF;

  RETURN v_wallet_id;
END;
$$;

-- ---- 11. FUNCIÓN: tasa de cambio del día -----------------

CREATE OR REPLACE FUNCTION tasa_del_dia(p_moneda moneda_tipo)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT tasa_usd
  FROM exchange_rates
  WHERE moneda = p_moneda
    AND fecha <= CURRENT_DATE
  ORDER BY fecha DESC
  LIMIT 1;
$$;

-- ---- FIN DEL MIGRATION ------------------------------------
