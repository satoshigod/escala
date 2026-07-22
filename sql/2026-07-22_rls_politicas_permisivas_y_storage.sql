-- =============================================================================
-- SEGURIDAD — politicas permisivas y storage
-- 5 politicas usaban USING(true) / WITH CHECK(true): cualquiera podia insertar
-- o actualizar esas tablas. Verificado como accede la app a cada una antes de
-- apretar, para no romper nada.
-- Aplicadas via conector (migraciones: rls_politicas_permisivas_corregidas,
-- storage_evidencias_politicas).
-- =============================================================================

-- TAREAS: el cliente SI escribe (workspace/constitucion crea y actualiza tareas),
-- asi que no se puede bloquear sin mas. Se limita al equipo del proyecto.
DROP POLICY IF EXISTS "Miembros pueden crear tareas"      ON tareas;
DROP POLICY IF EXISTS "Miembros pueden actualizar tareas" ON tareas;

CREATE POLICY tareas_insert_equipo ON tareas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM proyectos p
            WHERE p.id = tareas.proyecto_id AND p.fundador_id = auth.uid())
    OR EXISTS (SELECT 1 FROM postulaciones po
               JOIN roles r ON r.id = po.rol_id
               WHERE r.proyecto_id = tareas.proyecto_id
                 AND po.postulante_id = auth.uid() AND po.estado = 'aceptada')
  );

CREATE POLICY tareas_update_equipo ON tareas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM proyectos p
            WHERE p.id = tareas.proyecto_id AND p.fundador_id = auth.uid())
    OR EXISTS (SELECT 1 FROM postulaciones po
               JOIN roles r ON r.id = po.rol_id
               WHERE r.proyecto_id = tareas.proyecto_id
                 AND po.postulante_id = auth.uid() AND po.estado = 'aceptada')
  );

-- LOGROS, HISTORIAL, DOCUMENTOS: solo se escriben desde las APIs con service
-- role (verificado: ni una escritura desde el navegador). El service role ignora
-- RLS, asi que quitar las politicas permisivas no rompe nada y cierra la puerta
-- a inserciones directas con la anon key.
DROP POLICY IF EXISTS logros_insercion  ON logros_usuario;
DROP POLICY IF EXISTS logros_sistema    ON logros_usuario;
DROP POLICY IF EXISTS "Todos pueden insertar historial" ON historial_tareas;
DROP POLICY IF EXISTS documentos_proyecto_insercion     ON documentos_proyecto;

-- STORAGE (bucket 'evidencias'): tenia SELECT amplio (permitia LISTAR todos los
-- archivos) e INSERT abierto (cualquier anonimo podia SUBIR: abuso de storage).
-- Todas las subidas pasan por /api/upload con service role y el codigo solo usa
-- upload() y getPublicUrl(), nunca list(). Al ser bucket publico, los archivos
-- se siguen viendo por su URL directa.
DROP POLICY IF EXISTS "Cualquiera puede ver evidencias"   ON storage.objects;
DROP POLICY IF EXISTS "Cualquiera puede subir evidencias" ON storage.objects;
