-- =============================================================================
-- SEGURIDAD — vistas de saldos y permisos de funciones
-- Hallazgos del linter de Supabase. Ninguno rompe la app: se verifico antes que
-- el codigo no dependiera de lo que se restringe.
-- Aplicadas via conector (migraciones: wallet_views_security_invoker,
-- funciones_search_path_y_permisos, funciones_revoke_public_execute,
-- calcular_escala_score_solo_service_role).
-- =============================================================================

-- 1) VISTAS DE SALDOS (ERROR): eran SECURITY DEFINER, o sea se ejecutaban con
--    los permisos de su creador ignorando el RLS de quien consulta. Como
--    wallet_balances expone usuario_id + saldo de CADA wallet, quien pudiera
--    consultarla veia el dinero de todos. Nada en el codigo ni en la base
--    depende de ellas (los saldos se calculan con calcularSaldo() sobre
--    ledger_entries), asi que el cambio es seguro.
ALTER VIEW public.wallet_balances     SET (security_invoker = true);
ALTER VIEW public.wallet_comprometido SET (security_invoker = true);

-- 2) SEARCH_PATH FIJO (WARN x7): sin esto, quien controle el search_path puede
--    hacer que la funcion ejecute objetos suyos en lugar de los de public.
ALTER FUNCTION public.actualizar_timestamp_redes()                      SET search_path = public;
ALTER FUNCTION public.handle_updated_at()                               SET search_path = public;
ALTER FUNCTION public.handle_new_user()                                 SET search_path = public;
ALTER FUNCTION public.notificar_mensaje_nuevo()                         SET search_path = public;
ALTER FUNCTION public.calcular_escala_score(uuid)                       SET search_path = public;
ALTER FUNCTION public.crear_wallet_si_no_existe(uuid, moneda_tipo, text) SET search_path = public;
ALTER FUNCTION public.tasa_del_dia(moneda_tipo)                         SET search_path = public;

-- 3) PERMISOS DE EJECUCION (WARN): Postgres otorga EXECUTE a PUBLIC por defecto,
--    asi que revocar solo de anon/authenticated NO basta (heredan de PUBLIC).
--    Las funciones de trigger las invoca la base, nunca un usuario por REST.
--    crear_wallet_si_no_existe era SECURITY DEFINER y creaba wallets a peticion
--    de cualquiera SIN LOGIN.
REVOKE EXECUTE ON FUNCTION public.actualizar_timestamp_redes()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_mensaje_nuevo()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.crear_wallet_si_no_existe(uuid, moneda_tipo, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calcular_escala_score(uuid)   FROM PUBLIC, anon, authenticated;

-- service_role conserva acceso: es el rol que usan las APIs del servidor.
GRANT EXECUTE ON FUNCTION public.calcular_escala_score(uuid)    TO service_role;
GRANT EXECUTE ON FUNCTION public.crear_wallet_si_no_existe(uuid, moneda_tipo, text) TO service_role;

-- tasa_del_dia se deja publica: no es SECURITY DEFINER y solo lee tipos de
-- cambio, que no son informacion sensible.
