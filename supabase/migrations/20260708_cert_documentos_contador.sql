-- Fase 4: Documentos profesionales de certificación en el perfil del especialista
--
-- Agrega dos columnas a perfiles para almacenar las URLs de los documentos
-- de certificación de contadores colombianos:
--   1. Tarjeta Profesional de Contador Público (anverso y reverso)
--   2. Certificado de Vigencia de Inscripción y Antecedentes Disciplinarios (JCC)
--
-- Estos documentos son opcionales pero suben el Escala Score y dan confianza
-- a los fundadores que buscan contadores para proyectos más formales.

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS cert_tarjeta_profesional_url text,
  ADD COLUMN IF NOT EXISTS cert_jcc_url text;
