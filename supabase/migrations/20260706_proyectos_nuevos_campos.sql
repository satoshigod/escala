-- Agrega campos de nivel de avance, modalidad de trabajo y roles buscados
-- a la tabla proyectos para el nuevo formulario de creación

ALTER TABLE proyectos
  ADD COLUMN IF NOT EXISTS nivel_avance text
    CHECK (nivel_avance IN ('tengo_la_idea','ya_empece','tengo_clientes','necesito_crecer','quiero_transformar')),
  ADD COLUMN IF NOT EXISTS modalidad_trabajo text
    CHECK (modalidad_trabajo IN ('remoto','presencial','hibrido')),
  ADD COLUMN IF NOT EXISTS roles_buscados text[] DEFAULT '{}';

COMMENT ON COLUMN proyectos.nivel_avance IS 'Etapa actual del proyecto en lenguaje universal';
COMMENT ON COLUMN proyectos.modalidad_trabajo IS 'Cómo trabaja el equipo del proyecto';
COMMENT ON COLUMN proyectos.roles_buscados IS 'Qué tipos de colaboradores busca el proyecto';
