---

# Documentación del Manifiesto: `package.json`

Este documento detalla la infraestructura de dependencias y scripts para el backend de **RandomFates**, diseñado bajo una arquitectura de **Monolito Modular**.

## 🛠 Scripts de Ciclo de Vida

| Script | Comando | Propósito Técnico |
| --- | --- | --- |
| **`dev`** | `ts-node-dev --respawn --transpile-only src/index.ts` | **Agilidad en Desarrollo:** Usa *hot-reload* para reiniciar el servidor automáticamente. La bandera `--transpile-only` es clave para que el motor de sorteos cargue instantáneamente sin esperar la validación completa de tipos en cada cambio. |
| **`build`** | `tsc` | **Preparación para Producción:** Transpila todo el código de TypeScript a JavaScript altamente optimizado en la carpeta `/dist`. Garantiza que el código final cumple con el estándar ES2022 definido. |
| **`start`** | `node dist/index.js` | **Rendimiento Máximo:** Ejecuta la aplicación compilada usando el motor nativo de Node.js. Al eliminar la capa de TypeScript en producción, se libera memoria y CPU para procesos críticos como el **Random Engine** y **WebSockets**. |

---

## Dependencias de Producción (`dependencies`)

### **Persistencia y Datos**

- **`prisma` & `@prisma/client` (`^7.8.0`)**
- **Por qué:** Es el núcleo de la integridad de datos del proyecto. Al estar alineado con el DER (Diagrama Entidad-Relación), Prisma garantiza que las transacciones de los sorteos sean **ACID** (Atómicas, Consistentes, Aisladas y Duraderas). La versión 7+ ofrece un rendimiento optimizado para consultas complejas y relaciones profundas.

### **Servidor Core**

- **`express` (`^5.2.1`)**
- **Por qué:** Se utiliza la versión 5.x por su soporte nativo superior para **Promesas y Async/Await**, eliminando la necesidad de _wrappers_ adicionales en los controladores. Es el estándar para manejar el enrutamiento de los módulos de `auth`, `raffles` y `billing`.

---

## Dependencias de Desarrollo (`devDependencies`)

### **Tipado Estático**

- **`typescript` (`^6.0.3`)**
- **Por qué:** Proporciona la seguridad de tipos necesaria para un sistema de sorteos. Evita errores humanos en el manejo de estados de pagos y resultados.

- **`@types/node` & `@types/express**`
- **Por qué:** Habilitan el autocompletado y la validación de contratos entre el servidor y las librerías nativas de Node (como el módulo `crypto` para la generación de números aleatorios seguros).

### **Tooling**

- **`ts-node-dev`**
- **Por qué:** Combina la capacidad de ejecutar TypeScript directamente con un observador de archivos, siendo la herramienta más eficiente para el flujo de trabajo modular propuesto.

---

## ⚠️ Notas de Configuración

1. **Módulos:** El proyecto está configurado como `commonjs` para maximizar la compatibilidad con el ecosistema actual de Prisma y Express 5.
2. **Punto de Entrada:** El archivo principal en desarrollo es `src/index.ts`, pero para despliegues se utiliza `dist/index.js`.

> **Recomendación de Seguridad:** No mover `prisma` a `devDependencies`. Aunque es una herramienta de generación, el CLI de Prisma se requiere en el entorno de producción para ejecutar las migraciones de base de datos (`prisma migrate deploy`) al actualizar el sistema.
