-- =============================================================================
-- PERFILES — roles Mentor y Empresa
-- El onboarding y /bienvenida ofrecen 6 roles (ideador, especialista, ejecutor,
-- capitalista, mentor, empresa) pero el CHECK solo aceptaba 5: quien elegia
-- Mentor o Empresa NO podia guardar su perfil (bug de produccion).
-- Se conserva 'angel' por compatibilidad con perfiles historicos.
-- Aplicada via conector (migracion: perfiles_rol_principal_mentor_empresa).
-- =============================================================================

ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_rol_principal_check;

ALTER TABLE perfiles
  ADD CONSTRAINT perfiles_rol_principal_check
  CHECK (rol_principal = ANY (ARRAY[
    'ideador'::text, 'capitalista'::text, 'especialista'::text,
    'ejecutor'::text, 'angel'::text, 'mentor'::text, 'empresa'::text
  ]));
