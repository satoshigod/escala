-- Asignar rol_nombre a las tareas de constitución de los 7 países
-- Estructura: { nombre, categoria, rol_nombre } donde rol_nombre es 'abogado' o 'contador'
-- Las tareas que ya existen se mantienen; solo se agrega el rol correcto a cada una.

-- COLOMBIA
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SAS ante notaría o documento privado", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Acta de constitución firmada"},
  {"nombre": "Registro en Cámara de Comercio", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Certificado de existencia y representación legal"},
  {"nombre": "Redactar estatutos sociales", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Estatutos firmados"},
  {"nombre": "Inscripción de libros contables ante Cámara de Comercio", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Libros inscritos"},
  {"nombre": "Obtener NIT en la DIAN", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "RUT empresarial con NIT"},
  {"nombre": "Configurar facturación electrónica DIAN", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Habilitación de facturador electrónico"},
  {"nombre": "Definir régimen tributario (simple o común)", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Documento de régimen y obligaciones"},
  {"nombre": "Apertura de libros contables y plan de cuentas", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Plan de cuentas configurado"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'Colombia';

-- ARGENTINA
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SAS o SRL ante IGJ o registro provincial", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Acta constitutiva registrada"},
  {"nombre": "Redactar estatutos o contrato social", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Estatutos firmados"},
  {"nombre": "Inscripción en el registro societario provincial", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Certificado de inscripción"},
  {"nombre": "Obtener CUIT en AFIP", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "CUIT empresarial activo"},
  {"nombre": "Elegir régimen tributario AFIP", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Documento de régimen seleccionado"},
  {"nombre": "Configurar facturación electrónica AFIP", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Punto de venta habilitado"},
  {"nombre": "Apertura de libros contables", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Libros rubricados"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'Argentina';

-- CHILE
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SpA o SRL en Registro de Empresas (REA)", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Certificado de constitución REA"},
  {"nombre": "Redactar estatutos sociales", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Estatutos firmados"},
  {"nombre": "Inscripción en el Conservador de Bienes Raíces si aplica", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Inscripción completada"},
  {"nombre": "Obtener RUT empresa en SII", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "RUT empresarial activo"},
  {"nombre": "Inicio de actividades en el SII", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Confirmación de inicio de actividades"},
  {"nombre": "Configurar facturación electrónica SII", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Folios de factura electrónica activos"},
  {"nombre": "Apertura de libros contables", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Libros contables inicializados"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'Chile';

-- MÉXICO
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SA de CV o SAPI ante notario público", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Escritura constitutiva protocolizada"},
  {"nombre": "Redactar estatutos sociales", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Estatutos aprobados"},
  {"nombre": "Inscripción en el Registro Público de Comercio", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Folio mercantil"},
  {"nombre": "Obtener RFC en el SAT", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "RFC empresarial activo"},
  {"nombre": "Alta en IMSS e INFONAVIT si aplica", "categoria": "Laboral", "rol_nombre": "contador", "entregable": "Registro patronal"},
  {"nombre": "Configurar facturación electrónica CFDI", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Certificado de sello digital (CSD)"},
  {"nombre": "Apertura de libros contables y plan de cuentas", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Plan de cuentas configurado"},
  {"nombre": "Definir régimen fiscal", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Documento de régimen y obligaciones"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'México';

-- PERÚ
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SAC o SRL en SUNARP", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Partida registral de la empresa"},
  {"nombre": "Redactar minuta de constitución", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Minuta firmada por notario"},
  {"nombre": "Inscripción en Registros Públicos (SUNARP)", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Asiento de inscripción"},
  {"nombre": "Obtener RUC en SUNAT", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "RUC empresarial activo"},
  {"nombre": "Definir régimen tributario SUNAT", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Documento de régimen seleccionado"},
  {"nombre": "Configurar comprobantes electrónicos", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Sistema de emisión electrónica habilitado"},
  {"nombre": "Apertura de libros contables", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Libros legalizados"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'Perú';

-- ESPAÑA
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir SL en el Registro Mercantil", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Escritura de constitución inscrita"},
  {"nombre": "Redactar estatutos sociales", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Estatutos aprobados por notario"},
  {"nombre": "Obtener NIF empresa en Hacienda", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "NIF empresarial activo"},
  {"nombre": "Alta en IAE (Impuesto Actividades Económicas)", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Alta en censos de Hacienda"},
  {"nombre": "Configurar facturación electrónica AEAT", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Certificado digital instalado"},
  {"nombre": "Apertura de libros contables (Plan General Contable)", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Libros contables legalizados"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'España';

-- ESTADOS UNIDOS
UPDATE public.paises_regulatorios
SET tareas = '[
  {"nombre": "Constituir LLC o C-Corp en el estado elegido", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Articles of Organization / Incorporation"},
  {"nombre": "Redactar Operating Agreement o Bylaws", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Acuerdo operativo firmado"},
  {"nombre": "Registrar Registered Agent", "categoria": "Legal", "rol_nombre": "abogado", "entregable": "Confirmación de registered agent"},
  {"nombre": "Obtener EIN en el IRS", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "EIN confirmado por IRS"},
  {"nombre": "Definir estructura fiscal (LLC, S-Corp, C-Corp)", "categoria": "Tributario", "rol_nombre": "contador", "entregable": "Documento de elección fiscal"},
  {"nombre": "Configurar contabilidad y software (QuickBooks u otro)", "categoria": "Contable", "rol_nombre": "contador", "entregable": "Sistema contable configurado"},
  {"nombre": "Abrir cuenta bancaria empresarial", "categoria": "Bancario", "rol_nombre": "contador", "entregable": "Constancia de apertura de cuenta"}
]'::jsonb
WHERE nombre = 'Estados Unidos';
