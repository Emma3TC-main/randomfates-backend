# RandomFates API - Endpoints y salidas estandarizadas

Base local: `http://localhost:3000/v1`

## Formato estándar de éxito

```json
{
  "success": true,
  "message": "Mensaje funcional",
  "data": {},
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "pages": 0
    }
  }
}
```

## Formato estándar de error

```json
{
  "success": false,
  "message": "Error de validación",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## Health

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| GET | `/health` | No | Estado general de la API |
| GET | `/health/db` | No | Verifica conexión con PostgreSQL |

## Autenticación

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| POST | `/auth/register` | No | Registrar organizador |
| POST | `/auth/login` | No | Valida credenciales e inicia desafío OTP |
| POST | `/auth/refresh` | No | Renovar access token |
| POST | `/auth/logout` | Sí | Revocar sesión |
| GET | `/auth/me` | Sí | Obtener usuario autenticado |
| POST | `/auth/otp/verify` | No | Verifica OTP y emite JWT |
| POST | `/auth/otp/resend` | No | Reenvía OTP y genera nuevo desafío |


## Sorteos

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| POST | `/raffles` | Sí | Crear sorteo en estado DRAFT |
| GET | `/raffles` | Sí | Listar sorteos propios; admin ve todos |
| GET | `/raffles/:id` | Sí | Ver detalle de sorteo |
| PATCH | `/raffles/:id` | Sí | Actualizar sorteo editable |
| POST | `/raffles/:id/publish` | Sí | Validar participantes + premios y activar |
| POST | `/raffles/:id/cancel` | Sí | Cancelar sorteo no finalizado |
| DELETE | `/raffles/:id` | Sí | Soft delete |
| GET | `/public/raffles/:publicToken` | No | Vista pública del sorteo |

## Participantes

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| POST | `/raffles/:raffleId/participants` | Sí | Registrar participante manual/API |
| GET | `/raffles/:raffleId/participants` | Sí | Listar participantes |
| POST | `/raffles/:raffleId/participants/bulk` | Sí | Carga masiva JSON estandarizada |
| DELETE | `/raffles/:raffleId/participants/:participantId` | Sí | Soft delete de participante |

## Premios

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| POST | `/raffles/:raffleId/prizes` | Sí | Crear premio |
| GET | `/raffles/:raffleId/prizes` | Sí | Listar premios |
| DELETE | `/raffles/:raffleId/prizes/:prizeId` | Sí | Eliminar premio |

## Ejecuciones y resultados

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| POST | `/raffles/:raffleId/executions` | Sí | Ejecutar sorteo con motor aleatorio verificable |
| GET | `/raffles/:raffleId/executions` | Sí | Historial de ejecuciones |
| GET | `/executions/:id` | Sí | Detalle de ejecución |
| GET | `/results/:id` | Sí | Resultado privado |
| GET | `/public/results/:verificationHash` | No | Resultado público por hash |
| GET | `/public/results/:verificationHash/verify` | No | Verificación pública básica |

## Billing / Premium

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| GET | `/billing/plans` | No | Listar planes |
| POST | `/billing/plans` | Admin | Crear plan |
| POST | `/billing/subscribe` | Sí | Crear suscripción pendiente de pago |
| GET | `/billing/subscription` | Sí | Consultar suscripción activa |
| POST | `/billing/payments/mock-approve` | Admin | Simular aprobación de pago |

## Administración

| Método | Endpoint | Auth | Uso |
|---|---|---:|---|
| GET | `/users` | Admin | Listar usuarios |
| GET | `/users/:id` | Admin | Obtener usuario |
| PATCH | `/users/:id/status` | Admin | Activar/desactivar o cambiar rol |
| GET | `/admin/audit-logs` | Admin | Consultar auditoría |
| GET | `/admin/kpis` | Admin | KPIs operativos |

## Estados implementados

### Sorteo
`DRAFT -> ACTIVE -> FINISHED` o `DRAFT/ACTIVE -> CANCELLED`.

### Ejecución
`PENDING -> VALIDATING -> IN_PROGRESS -> EMITTING_RESULT -> SUCCESS`.
En error: `FAILED`. En aborto futuro: `ABORTED`.

## Regla de integridad principal

El backend es la única fuente de verdad. El frontend solo representa animaciones y estados; la selección aleatoria, el snapshot de participantes, la persistencia de resultados, los hashes y los logs quedan en backend/base de datos.
