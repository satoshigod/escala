# ESCALA — instrucciones para agentes

**Antes de escribir cualquier código, lee `ESCALA_MASTER_CONTEXT.md` en la raíz.**
Contiene el modelo de negocio, los patrones establecidos, las convenciones que ya
costaron bugs, y dónde está cada cosa.

Después mira `/desarrollo` → pestaña **Lecciones** en la app: 10 errores reales
del proyecto con la regla que los evita. De 628 commits, 230 fueron correcciones;
la mayoría se pudo evitar leyendo lo que ya estaba documentado.

## Las 3 reglas que más se rompieron

1. **Verifica el esquema real antes de escribir en la base.** No asumas nombres
   de columna: `referencia_tipo` no es `tipo_referencia`, `tasa_usd` es NOT NULL,
   y el enum `tipo` solo acepta `debito`/`credito`. Estos cuatro juntos hicieron
   que ninguna comisión se registrara nunca, fallando en silencio.
2. **Verifica el build antes de commitear.** Nunca `build && commit && push`
   encadenados: así llegó un build roto a producción.
3. **Una pantalla no está lista sin su ruta de entrada.** Tres pantallas
   centrales del piloto quedaron sin enlace y nadie podía llegar a ellas.

## Documentación

- `ESCALA_MASTER_CONTEXT.md` — contexto completo (empieza aquí)
- `docs/` — arquitectura, base de datos, deuda técnica, escalabilidad, navegación
- `/desarrollo` en la app — roadmap por capas y lecciones aprendidas
- `sql/` — migraciones nombradas con su explicación

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
