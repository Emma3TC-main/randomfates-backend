# Initial Setup

## 1. Crear proyecto

```bash
mkdir randomfates-backend
cd randomfates-backend
```

---

## 2. Instalar Express

```bash
npm install express
```

Express será el servidor HTTP del backend.

---

## 3. Instalar Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

Esto creó:

```txt
prisma/
.env
schema.prisma
```

---

## 4. Error encontrado

Error:

```txt
Cannot find module 'src/index.ts'
```

### Causa

El proyecto ya no usaba `index.ts`.

Ahora usa:

```txt
server.ts
app.ts
```

### Solución

Cambiar:

```json
"dev": "ts-node-dev src/index.ts"
```

por:

```json
"dev": "ts-node-dev src/server.ts"
```
