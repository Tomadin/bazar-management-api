# Bazar — Sistema de gestión

Aplicación full-stack para gestionar el stock, los clientes y las ventas de un bazar.
Monorepo con una **API REST** (Spring Boot) en la raíz y un **frontend React** (Vite) en
`frontend/`.

Permite administrar productos (con control de stock y reposición), clientes, registrar ventas
con detalle por ítem (descontando stock automáticamente), anular ventas (reponiendo stock) y
consultar reportes (bajo stock, resumen de ventas por día y mayor venta).

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API REST](#api-rest)
  - [Productos](#productos)
  - [Clientes](#clientes)
  - [Ventas](#ventas)
- [Modelos de datos (DTOs)](#modelos-de-datos-dtos)
- [Formato de errores](#formato-de-errores)
- [Reglas de negocio](#reglas-de-negocio)
- [Colección de Postman](#colección-de-postman)

---

## Tecnologías

**Backend**

- Java 17
- Spring Boot 3.5.16 (Web, Data JPA, Validation)
- Hibernate / JPA
- MySQL (driver `mysql-connector-j`)
- Lombok
- Maven (con wrapper `mvnw`)

**Frontend**

- React 18
- Vite 8
- React Router
- `fetch` nativo (cliente de API centralizado)
- CSS plano

---

## Estructura del proyecto

```
bazar/
├─ pom.xml                       # proyecto Maven (backend)
├─ mvnw / mvnw.cmd               # Maven wrapper
├─ src/main/java/com/tomadin/bazar/
│  ├─ controllers/               # ProductoController, ClienteController, VentaController
│  ├─ services/                  # lógica de negocio (interfaces + implementaciones)
│  ├─ repositories/              # repositorios Spring Data JPA
│  ├─ entities/                  # Producto, Cliente, Venta, DetalleVenta
│  ├─ dtos/                      # request/ y response/
│  ├─ mappers/                   # entidad <-> DTO
│  ├─ enums/                     # EstadoProducto, EstadoCliente, EstadoVenta
│  └─ exceptions/                # ApiError, GlobalExceptionHandler, NotFound/Conflict
├─ src/main/resources/
│  ├─ application.properties.example   # plantilla de configuración (versionada)
│  └─ application.properties           # configuración local (no versionada)
│
└─ frontend/
   ├─ vite.config.js             # proxy /api -> http://localhost:8081
   └─ src/
      ├─ api/                    # http.js (cliente central) + productos/clientes/ventas
      ├─ components/             # NavBar, Modal, Field, ErrorBanner, Loading, ReponerStockModal
      ├─ hooks/                  # useApi (carga/error/recarga)
      ├─ pages/                  # ProductosPage, ClientesPage, VentasPage, ReportesPage
      ├─ utils/                  # format.js (moneda y fecha)
      └─ styles.css              # estilos globales
```

---

## Requisitos previos

- **JDK 17** (o superior)
- **MySQL** en ejecución (por defecto en `localhost:3306`)
- **Node.js 18+** y **npm** (para el frontend)

---

## Puesta en marcha

### Backend

1. **Crear la base de datos** en MySQL (el nombre por defecto es `bazar_db`):

   ```sql
   CREATE DATABASE bazar_db;
   ```

   > Las tablas se crean/actualizan solas al arrancar (`spring.jpa.hibernate.ddl-auto=update`).

2. **Configurar la conexión.** A partir de la plantilla provista, generar el archivo de
   configuración local:

   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```

   Completar en `application.properties` los datos de conexión a la base de datos:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bazar_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=usuario
   spring.datasource.password=contraseña
   ```

3. **Levantar la API** (puerto **8081**):
   ```bash
   ./mvnw spring-boot:run        # Linux/macOS
   mvnw.cmd spring-boot:run      # Windows
   ```
   La API queda disponible en `http://localhost:8081/api/v1`.

### Frontend

Desde la carpeta `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo de Vite levanta en `http://localhost:5173` y **redirige `/api`** hacia
`http://localhost:8081` (proxy configurado en `vite.config.js`), así que el front llama a rutas
relativas `/api/v1/...` sin problemas de CORS.

> Para un build de producción: `npm run build` (genera `frontend/dist/`).

---

## API REST

Base: `http://localhost:8081/api/v1`

### Productos

| Método | Ruta                                | Descripción                                  | Respuestas                                            |
| ------ | ----------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| GET    | `/productos?incluirInactivos=false` | Lista productos (solo activos por defecto)   | 200 `ProductoResponse[]`                              |
| GET    | `/productos/falta_stock`            | Productos **ACTIVO** con stock < 15          | 200 `ProductoResponse[]`                              |
| GET    | `/productos/{id}`                   | Un producto por id                           | 200 · 404                                             |
| POST   | `/productos`                        | Crea un producto                             | 201 · 400                                             |
| PATCH  | `/productos/{id}/stock`             | **Descuenta** stock. Body `{ cantidad > 0 }` | 200 · 409 (stock insuficiente / inactivo) · 404 · 400 |
| PATCH  | `/productos/{id}/stock/reponer`     | **Aumenta** stock. Body `{ cantidad > 0 }`   | 200 · 409 (inactivo) · 404 · 400                      |
| PATCH  | `/productos/{id}/activar`           | Reactiva un producto inactivo                | 200 · 409 (ya activo)                                 |
| DELETE | `/productos/{id}`                   | Baja lógica (pasa a INACTIVO)                | 204 · 409 (ya inactivo)                               |

### Clientes

| Método | Ruta                               | Descripción                               | Respuestas                      |
| ------ | ---------------------------------- | ----------------------------------------- | ------------------------------- |
| GET    | `/clientes?incluirInactivos=false` | Lista clientes (solo activos por defecto) | 200 `ClienteResponse[]`         |
| GET    | `/clientes/{id}`                   | Un cliente por id                         | 200 · 404                       |
| POST   | `/clientes`                        | Crea un cliente                           | 201 · 409 (DNI duplicado) · 400 |
| PUT    | `/clientes/{id}`                   | Actualiza un cliente                      | 200 · 404 · 409 · 400           |
| PATCH  | `/clientes/{id}/activar`           | Reactiva un cliente inactivo              | 200 · 409                       |
| DELETE | `/clientes/{id}`                   | Baja lógica (pasa a INACTIVO)             | 204 · 409                       |

### Ventas

| Método | Ruta                              | Descripción                                           | Respuestas                                                       |
| ------ | --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/ventas`                         | Historial de ventas                                   | 200 `VentaResponse[]`                                            |
| GET    | `/ventas/{id}`                    | Una venta (incluye `detalles`)                        | 200 · 404                                                        |
| POST   | `/ventas`                         | Registra una venta y descuenta stock                  | 201 · 409 (cliente/producto inactivo o stock insuficiente) · 400 |
| PATCH  | `/ventas/{id}/cancelar`           | Anula la venta y repone el stock                      | 200 · 404 · 409                                                  |
| GET    | `/ventas/fecha/{fecha}`           | Resumen de ventas **ACTIVA** de un día (`yyyy-MM-dd`) | 200 `ResumenVentasDia`                                           |
| GET    | `/ventas/mayor_venta`             | Venta de mayor monto (solo ACTIVA)                    | 200 `MayorVenta` · 404 (sin ventas)                              |
| GET    | `/ventas/productos/{codigoVenta}` | Renglones de una venta                                | 200 `DetalleVentaResponse[]` · 404                               |

---

## Modelos de datos (DTOs)

**ProductoRequest**

```json
{
  "nombre": "string (2–50 caracteres)",
  "marca": "string (2–15 caracteres)",
  "costo": "number (≥ 0.01, hasta 6 enteros y 2 decimales)",
  "cantidadDisponible": "entero (≥ 0)"
}
```

**ProductoResponse**

```json
{
  "id": 1,
  "nombre": "Silla gamer reclinable",
  "marca": "Redragon",
  "costo": 250000.0,
  "cantidadDisponible": 14,
  "estado": "ACTIVO"
}
```

**ClienteRequest**

```json
{
  "nombre": "string (2–12)",
  "apellido": "string (2–12)",
  "dni": "string (exactamente 8 dígitos)"
}
```

**ClienteResponse**

```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Mendez",
  "dni": "30111222",
  "estado": "ACTIVO"
}
```

**VentaRequest**

```json
{
  "clienteId": 1,
  "items": [{ "productoId": 1, "cantidad": 2 }]
}
```

**VentaResponse**

```json
{
  "id": 3,
  "fechaVenta": "2026-06-30",
  "total": 2456.95,
  "estado": "ACTIVA",
  "cliente": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Mendez",
    "dni": "30111222",
    "estado": "ACTIVO"
  },
  "detalles": [
    {
      "productoId": 1,
      "nombreProducto": "Silla reclinable",
      "cantidad": 2,
      "subtotal": 2456.95
    }
  ]
}
```

**Reposición / descuento de stock** — `PATCH .../stock` y `.../stock/reponer`

```json
{ "cantidad": 10 }
```

**Resumen de ventas por día** — `GET /ventas/fecha/{fecha}`

```json
{ "fecha": "2026-06-30", "cantidadVentas": 5, "montoTotal": 5408.26 }
```

**Mayor venta** — `GET /ventas/mayor_venta`

```json
{
  "codigoVenta": 3,
  "total": 2456.95,
  "cantidadProductos": 27,
  "nombreCliente": "Rodrigo",
  "apellidoCliente": "Sanchez"
}
```

---

## Formato de errores

Todas las respuestas de error (400 / 404 / 409 / 500) usan el mismo formato `ApiError`:

```json
{
  "timestamp": "2026-06-30T17:05:00.123",
  "status": 409,
  "error": "Conflict",
  "message": "Texto legible para mostrar al usuario.",
  "path": "/api/v1/productos/1/stock",
  "validationErrors": null
}
```

- **Errores generales** (404, 409, 500, JSON malformado): usar el campo `message`.
- **Errores de validación de formularios** (400): `message` es genérico ("Error de validación…") y
  el detalle por campo está en `validationErrors`, p. ej.:
  ```json
  {
    "validationErrors": {
      "nombre": "El nombre no puede estar vacío.",
      "dni": "El DNI debe ser un número válido de 8 dígitos."
    }
  }
  ```

El frontend usa `message` para alertas generales y `validationErrors` para marcar errores campo por
campo en los formularios (ver `frontend/src/api/http.js`).

---

## Reglas de negocio

- **Baja lógica (soft-delete):** productos y clientes no se borran; pasan a `INACTIVO`. Pueden
  reactivarse. Las listas devuelven solo activos salvo que se pase `incluirInactivos=true`.
- **Stock:** al registrar una venta se descuenta el stock de cada producto; si no alcanza, la venta
  falla con `409`. Anular una venta (`/cancelar`) repone el stock de sus ítems.
- **Bajo stock:** un producto activo se considera "bajo stock" cuando `cantidadDisponible < 15`
  (se refleja con un badge en el frontend y en el endpoint `/productos/falta_stock`).
- **Ventas y clientes/productos inactivos:** no se puede vender a un cliente inactivo ni incluir un
  producto inactivo en una venta (`409`).
- **Reportes** (solo ventas `ACTIVA`): el resumen por día cuenta cantidad y monto total; la mayor
  venta es la de monto más alto, con `cantidadProductos` = total de unidades vendidas.

---

## Colección de Postman

En la raíz del repositorio se incluye `bazar-management-api.postman_collection.json`, que puede
importarse en Postman para probar todos los endpoints contra `http://localhost:8081`.

---

## Estados (enums)

| Enum             | Valores              |
| ---------------- | -------------------- |
| `EstadoProducto` | `ACTIVO`, `INACTIVO` |
| `EstadoCliente`  | `ACTIVO`, `INACTIVO` |
| `EstadoVenta`    | `ACTIVA`, `ANULADA`  |
