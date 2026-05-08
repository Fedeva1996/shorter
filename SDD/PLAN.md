# Plan Técnico (PLAN) — URL Shortener

> **Nota para la IA Constructor:** La arquitectura, el stack y los límites de pureza aquí definidos son mandatorios.

## 1. Stack Tecnológico

### Backend
| Componente | Tecnología | Notas |
|---|---|---|
| Runtime / Lenguaje | Node.js 20+ / TypeScript 5.x | |
| Framework | Express.js | Middleware de JSON, CORS |
| Seguridad | express-rate-limit, helmet | Middlewares de protección (Tasa y Cabeceras) |
| ORM | Prisma | Client generado fuertemente tipado |
| Base de Datos | PostgreSQL 15+ | |
| Validación | Zod | Para validar la `originalUrl` |
| Testing | Vitest (o Jest) + Supertest | Base de datos efímera para integración |

### Frontend
| Componente | Tecnología | Notas |
|---|---|---|
| Lenguaje | TypeScript 5.x | |
| Framework | React 18 + Vite | |
| Estilos | TailwindCSS | |
| HTTP Client | Fetch API nativo | |
| Testing | Vitest + React Testing Library | |

### Infraestructura
- **Docker Compose:** Para levantar el contenedor de PostgreSQL en entorno local (`dev`).

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│  DOCKER COMPOSE (dev)                                       │
│                                                             │
│  ┌───────────────┐      ┌───────────────┐      ┌─────────┐ │
│  │  SPA React    │ HTTP │  Node API     │ TCP  │  Postgres │ │
│  │  Vite         │─────▶│  Express      │─────▶│  DB     │ │
│  │  :5173        │      │  :3000        │      │  :5432  │ │
│  └───────────────┘      └───────────────┘      └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Estructura de Carpetas (Backend):**
```text
src/
  ├── core/            → [Pure Core] codeGenerator.ts, urlValidator.ts
  ├── routes/          → Express Routers
  ├── controllers/     → url.controller.ts (Lógica HTTP)
  ├── services/        → url.service.ts (Reglas ORM, transacciones)
  ├── prisma/          → schema.prisma
  └── app.ts           → Configuración de Express
```

## 3. Mapa de Límites de Pureza (Purity Boundary Map)

### ✅ Pure Core (Cero I/O)

| Módulo | Clase / Archivo | Responsabilidad |
|---|---|---|
| Backend | `core/codeGenerator.ts` | Funciones puras para generar strings aleatorios en Base62 (6 caracteres). |
| Backend | `core/urlValidator.ts` | Esquemas Zod para validar `originalUrl` (formato URI, max 2048 chars). |
| Frontend| `utils/formatters.ts` | Formatear fechas para la UI, etc. |

> **Regla:** Ningún archivo de `core/` puede importar `prisma`, `express` ni realizar operaciones de lectura/escritura o llamadas a red.

### ⚠️ Effectful Shell (I/O Permitido)

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| Backend | `controllers/url.controller.ts` | Mapeo de Request/Response HTTP, manejo de códigos de estado. |
| Backend | `services/url.service.ts` | Instanciación del PrismaClient. Ejecución de Queries, reintentos de colisión de shortCodes, incrementos atómicos (`update`). |
| Backend | `services/url.service.ts` | Instanciación del PrismaClient. Ejecución de Queries, reintentos de colisión, incrementos atómicos (`update`), idempotencia. |
| Backend | `middlewares/rateLimiter.ts` | Implementación de express-rate-limit. |
| Frontend| `api/urlApi.ts` | Llamadas Fetch hacia la API del Backend. |

## 4. Estrategia de Testing (TDD)

- **Backend (Unitario):** Se testean exhaustivamente las validaciones Zod y el algoritmo generador de Base62 en aislamiento (Vitest).
- **Backend (Integración):** Se levanta la DB PostgreSQL, se arranca Express y con Supertest se simulan llamadas HTTP para verificar las reglas de negocio (creación, error 404, incrementos atómicos, colisiones DB).
- **Frontend (Unitario):** Testear el componente del formulario asegurando que muestra errores cuando el input está vacío y permite copiar el link al éxito.

## 5. Decisiones Técnicas y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| **Colisiones de ShortCode** | Baja al inicio, sube con el uso | En el `UrlService`, capturar el error `P2002` (Unique constraint failed) de Prisma y aplicar un bucle de reintento de creación hasta 3 veces con un nuevo código generado. |
| **Race conditions (Contador Clics)** | Alta | Usar operaciones de incremento atómico de base de datos en lugar de leer y luego sumar. En Prisma: `update({ data: { clicks: { increment: 1 } } })`. |
| **Abuso de API (Spam)** | Media | Usar `express-rate-limit` por IP. Proveer Idempotencia (retornar código existente) para ahorrar base de datos. |
| **Redirection Loops** | Media | Validar en Zod `urlValidator.ts` que el host de la URL no coincida con el dominio de la propia aplicación. |
| **Alucinaciones IA** | Alta | Usar un `PROMPT_BUILDER` estricto y respetar a rajatabla que el código mínimo necesario es el único permitido (YAGNI). |
| **Decisión técnica adicional a revisar:** | Baja | En el bucle de reintentos de colisión (P2002), actualmente se reintenta asumiendo que la colisión fue en shortCode. Con @unique en originalUrl, un P2002 podría ser también de originalUrl. Sin embargo, este caso ya no puede ocurrir en producción normal porque el findUnique previo lo intercepta antes del create. Solo podría ocurrir en una carrera extrema, que el findUnique inicial elimina en la práctica. |