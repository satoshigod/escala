-- =============================================================================
-- INDICES DE ESCALABILIDAD
-- proyectos, perfiles y tareas solo tenian su primary key. Las politicas RLS
-- filtran por fundador_id, estado y proyecto_id, y RLS se evalua en CADA
-- consulta: sin indice, cada lectura escaneaba la tabla entera.
-- Con 1 proyecto no se nota; con 10.000 la pagina se cae.
-- Aplicada via conector (migracion: indices_escalabilidad_consultas_frecuentes).
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_proyectos_fundador  ON proyectos(fundador_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado    ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_escenario ON proyectos(escenario);

CREATE INDEX IF NOT EXISTS idx_perfiles_rol    ON perfiles(rol_principal);
CREATE INDEX IF NOT EXISTS idx_perfiles_ciudad ON perfiles(ciudad);

CREATE INDEX IF NOT EXISTS idx_tareas_proyecto ON tareas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado   ON tareas(estado);

CREATE INDEX IF NOT EXISTS idx_postulaciones_postulante ON postulaciones(postulante_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_rol        ON postulaciones(rol_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_proyecto_fecha ON mensajes(proyecto_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_roles_proyecto ON roles(proyecto_id);

CREATE INDEX IF NOT EXISTS idx_presupuesto_proyecto ON presupuesto_items(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_presupuesto_estado   ON presupuesto_items(estado_fondeo);

CREATE INDEX IF NOT EXISTS idx_leasing_beneficiaria ON contratos_leasing(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_leasing_angel        ON contratos_leasing(angel_id);
CREATE INDEX IF NOT EXISTS idx_leasing_estado       ON contratos_leasing(estado);
