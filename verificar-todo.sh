#!/bin/bash

echo "=========================================="
echo "VERIFICACION COMPLETA - TODA LA SESION"
echo "=========================================="

echo ""
echo "--- ARCHIVOS (existencia) ---"

ARCHIVOS=(
  "app/api/proyectos/route.js"
  "app/api/tareas/route.js"
  "app/proyectos/page.js"
  "app/proyectos/[id]/workspace/tareas/page.js"
  "app/onboarding/page.js"
  "app/api/usuarios/route.js"
  "app/admin-escala/page.js"
  "app/api/paises/route.js"
  "app/api/email/route.js"
  "app/desarrollo/page.js"
  "app/api/especialidades/route.js"
  "app/api/categorias/route.js"
  "app/api/postulaciones/route.js"
  "app/comercial/page.js"
  "app/api/proyectos/[id]/route.js"
  "app/api/upload/route.js"
  "app/api/industrias/route.js"
  "app/aportes/page.js"
  "app/buscar/page.js"
  "app/directorio/page.js"
  "app/dashboard/page.js"
  "app/qa/page.js"
)

FALTANTES=0
for f in "${ARCHIVOS[@]}"; do
  if [ -f "$f" ]; then
    echo "OK   $f"
  else
    echo "FALTA $f"
    FALTANTES=$((FALTANTES+1))
  fi
done

echo ""
echo "--- CONTENIDO (no solo existencia) ---"

check_content() {
  local file=$1
  local pattern=$2
  local label=$3
  if [ -f "$file" ]; then
    count=$(grep -c "$pattern" "$file" 2>/dev/null)
    if [ "$count" -gt 0 ]; then
      echo "OK   $label ($count)"
    else
      echo "VACIO $label - patron no encontrado en archivo existente"
    fi
  else
    echo "FALTA $label - archivo no existe"
  fi
}

check_content "app/api/proyectos/route.js" "industria, pais, estado" "proyectos acepta industria/pais/estado"
check_content "app/api/tareas/route.js" "TAREAS_PAIS" "tareas tiene TAREAS_PAIS"
check_content "app/proyectos/page.js" "paisesDB" "proyectos tiene selector pais dinamico"
check_content "app/proyectos/[id]/workspace/tareas/page.js" "esTareaRegulatoria" "tareas workspace tiene distincion regulatoria"
check_content "app/onboarding/page.js" "especialidadesDB" "onboarding tiene especialidad dinamica"
check_content "app/api/usuarios/route.js" "export async function DELETE" "usuarios tiene DELETE"
check_content "app/admin-escala/page.js" "especialidadesDB" "admin tiene tab especialidades"
check_content "app/admin-escala/page.js" "eliminarProyecto" "admin tiene eliminar proyecto"
check_content "app/admin-escala/page.js" "eliminarUsuario" "admin tiene eliminar usuario"
check_content "app/admin-escala/page.js" "prompt(" "admin pide doble confirmacion"
check_content "app/api/postulaciones/route.js" "pais," "postulaciones trae campo pais"
check_content "app/comercial/page.js" "Convenios estrategicos" "comercial tiene fase convenios"
check_content "app/api/proyectos/[id]/route.js" "export async function DELETE" "proyectos id tiene DELETE cascada"
check_content "app/aportes/page.js" "Evidencia" "aportes tiene campo evidencia"
check_content "app/buscar/page.js" "mostrarFiltrosAvanzados" "buscar tiene filtros avanzados"
check_content "app/directorio/page.js" "mostrarFiltrosAvanzados" "directorio tiene filtros avanzados"
check_content "app/dashboard/page.js" "conectadoRealtime" "dashboard tiene realtime"
check_content "app/dashboard/page.js" "mios.map" "dashboard recorre todos los proyectos"
check_content "app/qa/page.js" "id: '" "qa tiene tests (deberian ser 27)"

echo ""
echo "--- VALOR TOTAL DESARROLLO ---"
if [ -f "app/desarrollo/page.js" ]; then
  suma=$(grep -o "valor_hecho: [0-9]*" app/desarrollo/page.js | awk -F': ' '{sum+=$2} END {print sum}')
  echo "Suma valor_hecho: $suma"
else
  echo "FALTA app/desarrollo/page.js"
fi

echo ""
echo "=========================================="
echo "RESUMEN: $FALTANTES archivos faltantes de ${#ARCHIVOS[@]} totales"
echo "=========================================="
