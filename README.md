# 📦 RandomFates Backend

Backend para un sistema de sorteos en tiempo real con arquitectura modular y motor de ejecución de resultados.

---

## 🚀 Stack

* Node.js
* TypeScript
* Express
* Prisma 7
* Prisma Driver Adapter (`@prisma/adapter-pg`)
* PostgreSQL (Supabase)

---

## 📁 Arquitectura

```txt
Controller → Service → Repository → Prisma → PostgreSQL
```

---

# ⚙️ Instalación desde cero

## 1. Clonar repositorio

```bash
git clone <repo-url>
cd randomfates-backend
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
PORT=3000

API_PREFIX=/v1

# Supabase PostgreSQL (POOLER - recomendado)
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa (migraciones)
DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7

BCRYPT_SALT_ROUNDS=10

CORS_ORIGIN=http://localhost:5173
```

---

## 4. Configuración Prisma (IMPORTANTE ⚠️) REVISAR

### 📌 schema.prisma

Debe quedar así:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

---

### 📌 prisma.config.ts (OBLIGATORIO en Prisma 7)

Crear o mantener este archivo:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});
```

---

## 5. Generar Prisma Client

```bash
npx prisma generate
```

---

## 6. Sincronizar base de datos

```bash
npx prisma db push
```

---

## 7. Ejecutar en desarrollo

```bash
npm run dev
```

---

## 🟢 Resultado esperado

```bash
RandomFates API running on http://localhost:3000/v1
```

---

# 🧠 Scripts disponibles

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

---

# 🧩 Notas importantes (PRISMA 7)

### ❗ Cambios clave respecto a Prisma clásico

* ❌ NO usar `datasource.url` en `schema.prisma`
* ❌ NO usar `directUrl` en schema
* ✔ Todo se configura en `prisma.config.ts`
* ✔ Se usa Driver Adapter (`@prisma/adapter-pg`)

---

# ⚠️ Posibles errores comunes

## 1. Prisma no conecta

Verificar:

```bash
echo $DATABASE_URL
```

---

## 2. Error de compilación TS

Asegurarse de:

```json
"moduleResolution": "node"
```

---

## 3. PrismaClient falla al iniciar

Revisar:

* `.env` cargado correctamente
* `DATABASE_URL` no vacío

---

# 🧱 Flujo del sistema

```txt
HTTP Request
   ↓
Express Router
   ↓
Controller
   ↓
Service (lógica de negocio)
   ↓
Repository
   ↓
Prisma Client
   ↓
Supabase PostgreSQL
```

---

# 🚀 Futuras mejoras

* WebSockets para resultados en vivo
* Execution Engine optimizado
* Rate limiting por usuario
* Logs de auditoría avanzados
* Background jobs para sorteos masivos

---

Si quieres, en el siguiente paso puedo ayudarte a hacer el **README tipo SaaS profesional (nivel startup)** con badges, diagramas y sección de arquitectura visual tipo system design.
