# Shorty — Acortador de URLs (VSDD)

Shorty es un sistema de acortamiento de URLs de alto rendimiento diseñado bajo la estricta metodología **Verified Spec-Driven Development (VSDD)**.

## 🚀 Arquitectura
- **Backend**: Node.js + Express + Prisma ORM + TypeScript
- **Base de Datos**: PostgreSQL
- **Frontend**: React 19 + Vite + TailwindCSS v4
- **Seguridad**: Helmet, express-rate-limit, validación estricta (Zod).

## 🛠 Instalación y Ejecución Local (Desarrollo)

Requiere Node.js v20+ y PostgreSQL ejecutándose.

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   cd frontend && npm install
   ```
2. **Configurar Base de Datos:**
   ```bash
   cp .env.example .env
   # Modifica DATABASE_URL si es necesario
   npx prisma migrate dev
   ```
3. **Ejecutar (Modo Dev):**
   - Backend: `npm run dev` en el directorio raíz.
   - Frontend: `npm run dev` en el directorio `/frontend`.

## 🐳 Ejecución con Docker (Producción)

Toda la aplicación puede ser levantada usando Docker Compose:

```bash
docker-compose up --build -d
```
Esto levantará:
- PostgreSQL en el puerto `5432`
- Backend API en `http://localhost:3000`
- Frontend UI en `http://localhost:80`

## 🧪 Pruebas (TDD)
El proyecto cuenta con cobertura de pruebas unitarias y de integración completas.
- Test de backend: `npx vitest run test`
- Test de frontend: `cd frontend && npx vitest run`

## 📚 Documentación Técnica
Revisa el directorio `/SDD` para ver la especificación funcional (`SPEC.md`), arquitectónica (`PLAN.md`) y el progreso de las tareas (`TASKS.md`).
