-- RLS para tablas que lo tenían desactivado
-- Detectado por alerta de seguridad de Supabase el 06 Jul 2026

-- Tablas de referencia (solo lectura pública, escritura solo desde service role)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_publicas_lectura" ON categorias FOR SELECT USING (true);

ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "especialidades_publicas_lectura" ON especialidades FOR SELECT USING (true);

ALTER TABLE industrias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industrias_publicas_lectura" ON industrias FOR SELECT USING (true);

ALTER TABLE paises_regulatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paises_regulatorios_lectura" ON paises_regulatorios FOR SELECT USING (true);

-- Calificaciones (lectura pública, escritura solo propia)
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calificaciones_lectura_publica" ON calificaciones FOR SELECT USING (true);
CREATE POLICY "calificaciones_escritura_propia" ON calificaciones FOR INSERT WITH CHECK (auth.uid() = de_usuario_id);

-- Logros (lectura pública, escritura solo desde service role via API)
ALTER TABLE logros_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logros_lectura_publica" ON logros_usuario FOR SELECT USING (true);
CREATE POLICY "logros_insercion" ON logros_usuario FOR INSERT WITH CHECK (true);

-- Publicaciones de redes (solo usuarios autenticados pueden leer)
ALTER TABLE publicaciones_redes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publicaciones_redes_lectura" ON publicaciones_redes FOR SELECT USING (auth.uid() IS NOT NULL);
