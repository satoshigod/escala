-- =============================================================================
-- CUSTODIA — ordenes de pago
-- Escala custodia y paga TODO. Cada movimiento de recursos son dos tramos con
-- confirmacion manual: pagador -> escala:custodia -> receptor.
-- Correr en el editor SQL de Supabase.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ordenes_pago (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_flujo        text NOT NULL,        -- local_repago | compra_maquina | arriendo | fondeo | reparto
  proyecto_id       uuid REFERENCES proyectos(id) ON DELETE SET NULL,
  pagador_id        uuid NOT NULL REFERENCES perfiles(id),
  receptor_id       uuid REFERENCES perfiles(id),   -- null si el receptor es externo
  receptor_externo  text,                            -- descripcion si el receptor no es usuario (arrendador, proveedor)
  monto             numeric NOT NULL CHECK (monto > 0),
  moneda            text NOT NULL DEFAULT 'COP',
  concepto          text NOT NULL,
  referencia_tipo   text,                 -- de donde nace (reporte_diario, fondeo_presupuesto, ...)
  referencia_id     uuid,
  estado            text NOT NULL DEFAULT 'pendiente_pago'
                      CHECK (estado IN ('pendiente_pago','pago_reportado','en_custodia','pago_emitido','completado','cancelado')),
  -- marcas de cada transicion
  pago_reportado_at timestamptz,          -- [2] pagador marco "ya pague"
  en_custodia_at    timestamptz,          -- [3] admin confirmo recepcion -> ledger tramo 1
  en_custodia_by    uuid,
  pago_emitido_at   timestamptz,          -- [4] admin marco "Escala pago al receptor"
  pago_emitido_by   uuid,
  completado_at     timestamptz,          -- [5] receptor confirmo -> ledger tramo 2 + "recibido"
  ref_pago_pagador  text,                 -- referencia BREB que reporta el pagador
  ref_pago_escala   text,                 -- referencia BREB de la transferencia de Escala al receptor
  nota              text,
  idempotency_key   text UNIQUE,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_pago_pagador  ON ordenes_pago(pagador_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_receptor ON ordenes_pago(receptor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_estado   ON ordenes_pago(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_proyecto ON ordenes_pago(proyecto_id);

-- RLS: las escrituras van por el service role (APIs) que bypassa RLS.
-- El pagador y el receptor pueden LEER sus propias ordenes desde el cliente.
ALTER TABLE ordenes_pago ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ordenes_pago_select_propias ON ordenes_pago;
CREATE POLICY ordenes_pago_select_propias ON ordenes_pago
  FOR SELECT USING (auth.uid() = pagador_id OR auth.uid() = receptor_id);

-- La cuenta 'escala:custodia' no necesita tabla propia: es una cuenta del ledger
-- (ledger_entries), igual que 'escala:comisiones'. El saldo en custodia se calcula
-- sumando el ledger de esa cuenta. No requiere DDL adicional.
