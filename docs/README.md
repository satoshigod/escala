# Documentación de Escala

> Documentación viva. Si cambias el sistema, actualiza el documento que corresponda.

| Documento | Qué contiene |
| --- | --- |
| [arquitectura.md](./arquitectura.md) | Qué es Escala, stack, mapa de módulos, patrones establecidos y convenciones que ya costaron bugs |
| [deuda-tecnica.md](./deuda-tecnica.md) | Deuda medida (no estimada) con impacto, esfuerzo y orden recomendado |
| [base-datos.md](./base-datos.md) | Las 42 tablas, constraints, RLS y reglas del motor financiero |

## Otras fuentes de verdad

- **`/desarrollo`** (en la app) — roadmap por capas. Es el registro cronológico de qué se construyó y por qué.
- **`/qa`** (en la app) — suite de pruebas manuales y automáticas.
- **`sql/`** — migraciones nombradas con su explicación.

## Reglas que no se rompen

1. Los saldos **nunca se almacenan**: se calculan desde `ledger_entries`.
2. El ledger es **inmutable**: sin DELETE ni UPDATE.
3. Toda operación financiera lleva `idempotency_key`.
4. Los **ids internos no se renombran** sin migración expand-migrate-contract.
5. **Verificar el build antes de commitear**, nunca encadenado.
6. Escala es **intermediario tecnológico**: no es parte, garante ni empleador.
