# Especificación de Comportamiento (SPEC) — URL Shortener

> **Nota para la IA Constructor:** Este documento es la fuente de la verdad absoluta. No asumas comportamiento no definido aquí. Si algo es ambiguo, detente y pregunta al Arquitecto.

## 0. Contexto del Proyecto

- **Nombre del Proyecto:** Shorty (URL Shortener)
- **Tipo de Aplicación:** API REST + SPA Frontend
- **Stack Principal:** Node.js (Express) + TypeScript + Prisma ORM + PostgreSQL + React (Vite)
- **Versión:** v1.0

## 1. Visión General
Shorty es una aplicación que permite a los usuarios tomar URLs largas y convertirlas en enlaces cortos fáciles de compartir. Además, registra un contador de clics y la fecha del último acceso, sirviendo como una herramienta básica de redirección y analítica.

## 2. Requisitos Funcionales

* [ ] **RF1:** El usuario puede enviar una URL válida y recibir un código corto único de 6 caracteres alfanuméricos.
* [ ] **RF2:** Cuando un cliente HTTP navega a `/{shortCode}`, el sistema debe redirigirlo (HTTP 302) a la URL original.
* [ ] **RF3:** El sistema debe incrementar el contador de clics y actualizar la fecha de último acceso de forma atómica cada vez que se resuelve exitosamente una redirección.
* [ ] **RF4:** El usuario puede consultar las estadísticas básicas (URL original, clics creados, fecha creación, último acceso) de un código corto específico enviando una petición a la API.

## 3. Interfaces y Contratos

### 3.1 API REST (Backend)

```text
POST /api/v1/urls
  Request:  { "originalUrl": "https://example.com/very/long/path" }
  Response 201: { "id": "uuid", "shortCode": "aB3x9Z", "originalUrl": "https...", "createdAt": "ISO8601" }
  Response 400: { "error": "URL inválida o muy larga" }

GET /{shortCode}
  Response 302: Header Location: "https://example.com/..."
  Response 404: { "error": "Enlace no encontrado" }

GET /api/v1/urls/{shortCode}/stats
  Response 200: { "shortCode": "aB3x9Z", "originalUrl": "https...", "clicks": 5, "createdAt": "ISO", "lastClickedAt": "ISO" }
  Response 404: { "error": "Enlace no encontrado" }
```

### 3.2 Modelos de Datos (TypeScript / Prisma)

```typescript
// Frontend / Shared Interfaces
interface UrlEntry {
  id: string;           // UUID v4
  originalUrl: string;  // URL completa válida
  shortCode: string;    // Código de 6 caracteres (ej. aB3x9Z)
  clicks: number;       // Contador
  createdAt: string;    // ISO 8601
  lastClickedAt: string | null; // ISO 8601, null si nunca se ha hecho click
}
```

## 4. Catálogo de Casos Límite (Edge Cases)

* [ ] **EC-01:** ¿Qué pasa si la `originalUrl` no incluye `http://` o `https://`, o es un string inválido? → Retornar HTTP 400.
* [ ] **EC-02:** ¿Qué pasa si la `originalUrl` enviada excede los 2048 caracteres? → Retornar HTTP 400.
* [ ] **EC-03:** ¿Qué pasa si el código aleatorio generado para la URL tiene una colisión en la base de datos (Unique Constraint)? → El servicio debe capturar el error y reintentar generar un nuevo código hasta un máximo de 3 veces antes de fallar con HTTP 500.
* [ ] **EC-04:** ¿Qué pasa si se solicita redirigir a un código que no existe en la base de datos? → Retornar HTTP 404.
* [ ] **EC-05:** Condición de carrera en redirecciones concurrentes: si 10 usuarios hacen click a la vez en el mismo `shortCode`, el contador `clicks` debe sumar 10 exactamente, no perder escrituras. (Se debe usar un UPDATE atómico en la DB).
* [ ] **EC-06:** ¿Qué pasa si una IP intenta crear demasiadas URLs en poco tiempo? → Retornar HTTP 429 (Too Many Requests).
* [ ] **EC-07:** ¿Qué pasa si se envía a acortar una URL que ya existe en la base de datos? → El sistema debe comportarse de forma idempotente y retornar la entrada existente(200 OK) en lugar de crear una nueva (201 Created).

## 5. Reglas de Negocio

* [ ] **RN-01:** El código corto debe tener siempre exactamente 6 caracteres usando el alfabeto Base62 (`a-z, A-Z, 0-9`).
* [ ] **RN-02:** La redirección debe utilizar HTTP 302 (Found) para asegurar que los navegadores pasen por nuestro servidor en cada click y podamos contar las analíticas de forma precisa (un HTTP 301 podría ser cacheado por el navegador agresivamente).
* [ ] **RN-03:** El sistema debe rechazar la acortación de URLs que pertenezcan al dominio de la propia aplicación para evitar bucles de redirección.

## 6. Criterios de Éxito (Definition of Done)

* [x] Todos los tests unitarios del Pure Core pasan.
* [x] Tests de integración comprueban la correcta inserción, redirección (302) e incremento atómico de clics.
* [x] La interfaz web permite pegar la URL, obtener el enlace corto y tiene un botón para copiar al portapapeles.
* [x] El Adversario emite la sentencia `"VERIFICADO: El código cumple con el contrato y es robusto."`.