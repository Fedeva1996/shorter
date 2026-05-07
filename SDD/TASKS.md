# Tareas (TASKS) — URL Shortener

> **Instrucciones para el Constructor:**
> 1. Test-First (TDD): Los tests van ANTES de la implementación.
> 2. Atómico: Trabaja UNA tarea a la vez. No te saltes el orden.
> 3. Zero Slop: No agregues funcionalidades "por si acaso". Cíñete al `SPEC.md`.
> 4. Marca con `[x]` al completar.

---

## Fase 0: Setup e Infraestructura

- [x] **T0.1** — Crear el archivo `docker-compose.yml` en la raíz del backend con el servicio `db` (PostgreSQL 15), variables de entorno (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`), volumen y health check.
- [x] **T0.2** — Inicializar proyecto backend Node.js (`npm init -y`, configurar `tsconfig.json`).
- [x] **T0.3** — Instalar dependencias del backend: `express`, `cors`, `zod`, `@prisma/client`, y devDependencies: `typescript`, `tsx`, `vitest`, `supertest`, `prisma`.
- [x] **T0.4** — Configurar `prisma/schema.prisma` con el modelo `UrlEntry` (`id`, `originalUrl`, `shortCode` único, `clicks`, `createdAt`, `lastClickedAt`). Ejecutar primera migración.
- [x] **T0.5** — Inicializar proyecto frontend con Vite (`npm create vite@latest frontend -- --template react-ts`) y agregar TailwindCSS.

---

## Fase 1: Backend — Pure Core

- [x] **T1.1** — Escribir tests unitarios en Vitest para `core/urlValidator.ts` verificando:
  - URLs válidas pasan.
  - Strings sin formato HTTP/HTTPS o URLs inválidas fallan (EC-01).
  - URLs de más de 2048 caracteres fallan (EC-02).
- [x] **T1.2** — Implementar `core/urlValidator.ts` usando Zod para satisfacer los tests.
- [x] **T1.3** — Escribir tests unitarios para `core/codeGenerator.ts`: debe retornar un string alfanumérico (a-zA-Z0-9) de exactamente 6 caracteres (RN-01).
- [x] **T1.4** — Implementar `core/codeGenerator.ts`.

---

## Fase 2: Backend — Capa de Efectos (API y Servicios)

- [x] **T2.1** — Escribir tests de integración con Supertest para `POST /api/v1/urls`:
  - Enviar URL válida → retorna 201 y la estructura JSON correcta.
  - Enviar URL inválida → retorna 400.
- [x] **T2.2** — Implementar `services/url.service.ts` (método `createUrl`) y `controllers/url.controller.ts`. El servicio debe contemplar hasta 3 reintentos en caso de colisión (código `P2002` de Prisma) según EC-03.
- [x] **T2.3** — Escribir test de integración para redirección `GET /{shortCode}`:
  - ShortCode válido → retorna 302 y header Location correcto (RN-02). A su vez, validar vía BD que el campo `clicks` se incrementó en 1 y `lastClickedAt` se actualizó.
  - Ejecutar 10 requests concurrentes (Promise.all) al mismo endpoint y validar que al final en base de datos los clics sumen exactamente +10 (validar operación atómica EC-05).
  - ShortCode inexistente → retorna 404 (EC-04).
- [ ] **T2.4** — Implementar el endpoint de redirección, asegurando usar la API atómica de Prisma (`increment: 1`).
- [ ] **T2.5** — Escribir test de integración para `GET /api/v1/urls/{shortCode}/stats`. Verificar respuestas 200 (con estadísticas correctas) y 404.
- [ ] **T2.6** — Implementar endpoint de stats en el controlador y servicio.
- [ ] **T2.7** — Configurar un Middleware de Express para capturar excepciones globales (ej. Errores de Zod 400 y Errores 500) devolviendo JSON limpio, y armar el pipeline completo de rutas en `app.ts`.

---

## Fase 3: Frontend (React)

- [ ] **T3.1** — Definir la interfaz TypeScript compartida para la respuesta de creación de URL.
- [ ] **T3.2** — Escribir test (RTL) para `ShortenerForm.tsx`: el formulario no debe permitir enviar el submit si el input está vacío o es una URL obviamente malformada.
- [ ] **T3.3** — Implementar `ShortenerForm.tsx`.
- [ ] **T3.4** — Implementar `ResultDisplay.tsx`, el cual recibe el shortCode generado y muestra el enlace completo (ej. `http://localhost:3000/aB3x9Z`) junto con un botón funcional de "Copiar al portapapeles".
- [ ] **T3.5** — Implementar `api/urlApi.ts` con fetch a `POST /api/v1/urls` del backend.
- [ ] **T3.6** — Orquestar los componentes en `App.tsx`, gestionando estados de "loading", "error" (mostrando un mensaje claro si la URL es inválida) y "success".

---

## Fase 4: Revisión y Cierre (VSDD)

- [ ] **T4.1** — Ejecutar toda la suite de tests (Backend y Frontend) y confirmar 100% verde.
- [ ] **T4.2** — Abrir sesión del Adversario pasándole los archivos críticos (`url.service.ts`, `url.controller.ts`, esquemas de Prisma y validaciones) para buscar brechas (focus en incrementos atómicos y bloqueos por unicidad).
- [ ] **T4.3** — Corregir hallazgos del Adversario si existieran, iterando hasta el `"VERIFICADO ✓"`.
- [ ] **T4.4** — Marcar Criterios de Éxito completados en el `SPEC.md`.