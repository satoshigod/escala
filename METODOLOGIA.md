# Metodología de desarrollo

Guía transversal para desarrollar cualquier proyecto de software. No es específica de
ningún producto: son el mapa de en qué orden se construye y los principios que evitan
los errores más caros. Nació de las lecciones acumuladas construyendo un producto real,
destiladas aquí a su forma general.

Dos partes:

1. **Las capas** — en qué orden madura un producto y dónde encaja cada cosa.
2. **Los principios** — reglas que evitan rehacer trabajo, agrupadas por tema.

---

## Parte 1 — Las capas

El desarrollo se organiza en **capas estables de propósito**, no en una lista plana de
tareas. Cada funcionalidad nueva pertenece a una capa; si no encaja en ninguna, es señal
de que falta una capa. La estructura hace visibles las dependencias y el orden de
madurez, y evita construir capas altas sobre cimientos que aún no existen.

Estas capas son un punto de partida transversal. Los nombres y el número pueden ajustarse
por proyecto, pero el orden de madurez se mantiene: no se optimiza para escala antes de
tener producto, ni se monetiza antes de tener usuarios.

- **C0 — Cimientos técnicos.** Salud del código: que compile de forma verificable,
  componentes base, tokens de diseño, tests de la lógica crítica, deuda técnica bajo
  control. Es lo que hace que todo lo demás sea seguro de construir.

- **C1 — Infraestructura.** Base de datos, autenticación, almacenamiento, despliegue,
  observabilidad, seguridad. El andamiaje sobre el que corre el producto.

- **C2 — Producto central.** El núcleo: lo que el usuario viene a hacer. Suele ser la
  capa más grande. Todo lo demás existe para servir a esta.

- **C3 — Motores de dominio.** La lógica de negocio pesada y delicada (transacciones,
  cálculos financieros, máquinas de estado). Se aísla y se cubre con tests.

- **C4 — Confianza e identidad.** Reputación, verificación, permisos, cumplimiento.

- **C5 — Liquidez / arranque en frío.** Cómo el producto consigue sus primeros usuarios
  y mantiene los dos lados de un mercado si aplica.

- **C6 — Inteligencia.** Capa de datos avanzada: relaciones entre entidades, matching,
  modelos, automatización sobre lo que ya existe.

- **C7 — Comunidad y ecosistema.** Lo que hace que los usuarios se queden y traigan a
  otros: feed, rankings, eventos, referidos.

- **C8 — Marketing y adquisición orgánica.** SEO, contenido, landing pages, presencia.

- **C9 — Monetización.** Planes, suscripciones, comisiones. Solo tiene sentido con
  usuarios reales que ya obtienen valor.

- **C10 — Integraciones y cumplimiento.** Canales externos, firma, facturación, legal,
  apps móviles.

- **C11 — Campañas de adquisición.** Iniciativas concretas y temporales para conseguir
  usuarios. Son el piloto, no el producto.

**Regla de secuencia:** las capas altas dependen de las bajas. Optimizar rendimiento
(C0/C1 de escala) o monetizar (C9) antes de tener producto (C2) y usuarios (C5) es
trabajo prematuro que suele terminar revertido. Si no hay tracción, construir para
escala no compra nada.

---

## Parte 2 — Los principios

### Verificación

**Que compile no significa que funcione.** Verificar la compilación es necesario pero no
suficiente. Existe una clase entera de errores —orden de declaración, variables
inexistentes, relaciones de datos ambiguas— que solo aparece en ejecución. Hacen falta
dos verificaciones más que el compilador no da: abrir la página en un navegador y revisar
la consola, y ejercitar las APIs contra datos reales.

**Verificar antes de guardar, siempre por separado.** Comprobar que el build pasa primero
y mostrar el resultado; guardar los cambios solo si pasó. Nunca encadenar
"construir-y-guardar-y-publicar" en un solo paso: si algo falla en medio, se despliega
roto y nadie lo ve hasta que un usuario tropieza.

**La verificación de ejecución tiene que estar automatizada.** Decir "hay que abrir la
página en el navegador" no es una mitigación real si nadie lo hace sistemáticamente. En
un proyecto con despliegue automático, un error de ejecución vive en producción hasta que
un usuario lo encuentra. La red de seguridad es una prueba de humo que carga las páginas
críticas en un navegador headless y golpea las APIs, corriendo sola tras cada despliegue.
Sin eso, "verificar en ejecución" es una buena intención que nadie ejecuta.

**Para testear lógica acoplada a la base, separar la fórmula del acceso.** La lógica de
negocio (el cálculo) y el acceso a datos (leer/escribir la base) son cosas distintas y
deben poder separarse. Cuando están mezcladas en una función, esa función no se puede
probar sin la base. La fórmula pura —la parte que solo depende de sus entradas— se extrae
a funciones sin dependencias y se cubre con tests rápidos. Esto se puede hacer sin tocar
el código de producción (una copia fiel de la fórmula que sirve de red), evitando el
círculo vicioso de tener que refactorizar lo delicado antes de tener con qué verificarlo.

### Datos

**Consultar el esquema, nunca asumirlo.** Antes de escribir una operación que lee o
escribe la base, consultar las columnas y restricciones reales de la tabla. Un nombre de
columna supuesto o un valor que la base no acepta produce fallos que compilan bien y solo
revientan en ejecución.

**Cambiar el código y migrar la base que lo valida van juntos.** Al cambiar un valor que
la base valida (un enum, una restricción CHECK), migrar también la base. No asumir que
acepta el valor nuevo: el código y las reglas de datos son un solo cambio, no dos.

**Nunca silenciar errores en operaciones sensibles.** Un manejo de error vacío en algo
que mueve dinero o datos críticos convierte un fallo en un silencio: la operación parece
funcionar y no lo hizo. Leer la respuesta y verificar el resultado antes de dar algo por
hecho.

### Modelado de dominio

**Separar cada evento de un flujo.** Al modelar un flujo con estados (especialmente de
dinero), separar explícitamente cada paso: informar, comprometerse, ejecutar y confirmar
son cosas distintas. Confundir "informar" con "ejecutar" —tratar un reporte como si fuera
el hecho— corrompe el estado. El "recibido" solo ocurre al final, no cuando alguien lo
anuncia.

### Refactor

**Migrar por semántica, no por coincidencia superficial.** En un refactor masivo, el
criterio de reemplazo es qué *es* el elemento y qué hace, no que comparta un valor de
estilo o un patrón textual. Buscar coincidencias sirve para encontrar candidatos, no para
definir el trabajo. Dos elementos con el mismo aspecto pueden tener roles distintos;
revisar cada uno antes de tocarlo. No migrar de más es preferible a romper algo que ya
funcionaba.

**Un refactor se mide por su objetivo, no por dejar cero coincidencias.** Está completo
cuando cumplió su propósito (que un patrón salga de un solo lugar y no esté duplicado), no
cuando no queda ni una coincidencia textual de lo que se estaba unificando. Cuando lo que
queda son cosas distintas que comparten una apariencia, el trabajo está hecho; forzarlas
es migrar de más.

**Cuando algo se repite más de tres veces, extraerlo.** La duplicación no cuesta líneas:
cuesta que los arreglos no se propaguen. El mismo bug arreglado en una copia sigue vivo en
las otras cuatro. Extraer el patrón a un solo lugar es lo que hace que un arreglo llegue a
todas partes.

### Arquitectura

**Definir los cimientos antes de construir encima.** Antes de construir muchas pantallas,
definir primero los componentes base y los tokens compartidos. El costo de establecerlos
al inicio es una fracción del costo de retrofitearlos después. Si una decisión de
fundamento —componentes, tokens, nombres, esquema— no se toma explícitamente al empezar,
se paga multiplicada por cada pantalla construida sin ella.

**Centralizar no es lo mismo que migrar.** Crear el mecanismo central (tokens,
componentes, un helper) y migrar todo el código viejo a él son dos trabajos distintos, y
el primero entrega la mayor parte del valor. Con el mecanismo creado, cambiar la cosa
central ya es tocar un solo lugar, aunque no se haya migrado ni una línea vieja. La
migración masiva es incremental y de bajo riesgo si se hace por partes; el código nuevo
adopta el mecanismo desde el primer día y el viejo se va sumando. No hay que bloquear el
valor del sistema esperando a reemplazarlo todo.

### Producto

**Una pantalla no está lista hasta que se pueda llegar a ella.** La ruta de entrada
—desde dónde se navega hasta la pantalla— es parte de la tarea, no un extra. Una pantalla
construida sin forma de llegar a ella es como si no existiera.

**Al tocar una pantalla, verificar que sus controles funcionen.** Sus enlaces y botones
deben llevar a algo real. Reportar los que estén rotos o sean de prueba en vez de dejarlos
pasar.

### Lenguaje y consistencia

**Al unificar nombres, no dejar duplicados visibles.** Cuando se consolida cómo se llama
algo, verificar que no queden dos entradas con la misma etiqueta visible. Los
identificadores internos pueden preservarse; lo que el usuario ve tiene que ser
consistente.

### Método de trabajo

**El entregable de un "proyecto" es una app en el stack establecido, no HTML suelto ni un
prototipo.** Cuando alguien pide "construir un proyecto" o "una app", el formato del
entregable es una aplicación real en el stack que el ecosistema ya usa (aquí: Next.js con
App Router, sobre Supabase, desplegada en Vercel), no un conjunto de archivos HTML sueltos.
Antes de escribir una sola línea, leer cómo está construido el proyecto de referencia —su
`package.json`, su estructura `app/`, sus `lib/`, cómo conecta auth y datos— y replicar esa
arquitectura. Empezar con el formato equivocado obliga a rehacer todo y deja a quien pidió
el trabajo sin saber qué se construyó.

**Un archivo maestro de contexto que sobreviva a la sesión.** Todo proyecto arranca con un
único archivo, versionado en el repo, que concentra: qué es, para quién, el stack, los IDs
de infraestructura, el estado actual, las reglas que no se rompen y las convenciones que
ya costaron errores. Es lo primero que se lee al empezar cada sesión y lo primero que se
actualiza al terminar una fase. Si hay dos fuentes de verdad, declarar cuál manda. Un
contexto que no se mantiene es peor que no tenerlo, porque se confía en él.

**Conectar las herramientas reales desde el primer día.** Conectar las tres piezas que
cierran el ciclo: el repositorio (traer y guardar código), la base de datos (verificar el
estado real en vez de asumirlo) y el despliegue (ver el resultado). Lo que no se puede
verificar se asume, y las suposiciones se pagan. Los secretos (tokens, llaves) se usan y
se limpian: nunca quedan escritos en configuración versionada, y se rotan si se exponen.

**Un plan de desarrollo estructurado, no una lista de tareas suelta.** Ver la Parte 1: el
trabajo se organiza en capas de propósito. La estructura convierte cientos de tareas
dispersas en un mapa donde se ve qué está hecho, qué falta, qué depende de qué y qué no
toca hacer todavía.

### Ritmo

**Decir explícitamente si se prefiere velocidad o verificación.** "Sigue" se interpreta
como avanzar, y avanzar sin verificar produce el trabajo de corregir después. La velocidad
no ahorra tiempo: lo mueve. Los días de más avance sin verificación son los días de más
correcciones al día siguiente. Elegir el modo a conciencia, según lo que esté en juego.

---

*Documento vivo. Cada error nuevo que enseñe algo transferible se destila aquí como un
principio general — el caso concreto queda en el registro del proyecto donde ocurrió; lo
que sube a este documento es la regla.*
