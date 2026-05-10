# Backend Structure

## Arquitectura usada

```txt
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
```

---

## Carpetas principales

### modules/

Contiene los módulos del sistema:

- auth
- users
- raffles
- billing

---

### shared/

Código reutilizable:

- DTOs
- enums
- helpers
- constants

---

### infrastructure/

Servicios técnicos:

- prisma
- websocket
- security
