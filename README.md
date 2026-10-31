# ANEXAR — Consultoría Contable & Tecnológica
### Plataforma SaaS Text-to-SQL de Grado Financiero & Embudo de Consultoría B2B

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg)](https://www.prisma.io/)
[![Zero Retention](https://img.shields.io/badge/Security-Zero--Retention-emerald.svg)](#politica-zero-retention)

---

## 🏛️ Visión y Modelo Dual

**Anexar** es una solución arquitectónica integral concebida por **ANEXAR — Consultoría Contable & Tecnológica**. La plataforma opera bajo un **modelo dual**:

1. **Open Source & Self-Hosted SaaS:** Una herramienta analítica de Text-to-SQL ultra-segura, autoalojable y gratuita para que directores financieros, analistas contables y desarrolladores exploren sus datos en lenguaje natural.
2. **Embudo de Servicios Profesionales B2B:** El canal de atracción para empresas medianas y corporativas con datos fragmentados, múltiples sistemas desconectados (SAP, Tango, Bejerman, Odoo, QuickBooks) o sin una base de datos centralizada, que requieren consultoría contable senior, auditoría de balances, saneamiento de bases y proyectos de modern data warehousing.

---

## 📂 1. Estructura de Árbol del Monorepo

El repositorio sigue una arquitectura de monorepo estricto con dos directorios principales (`/api-rest` y `/web-app`) orquestados en la raíz mediante `docker-compose.yml`:

```
Anexar/
├── .gitignore
├── docker-compose.yml              # Orquestación local (API, WebApp, Postgres)
├── README.md                       # Documentación arquitectónica y operacional
│
├── api-rest/                       # BACKEND REST API
│   ├── Dockerfile                  # Multi-stage build Node.js 22 Alpine
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma           # Esquema interno PostgreSQL (Railway)
│   └── src/
│       ├── config/
│       │   └── env.ts              # Validación de variables de entorno con Zod
│       ├── types/
│       │   └── index.ts            # Interfaces de Adaptadores, Firewall, Umbrales y Schemas
│       ├── adapters/               # Patrón Adapter / Factory Multi-Fuente
│       │   ├── DatabaseAdapter.ts  # Contrato/Interface base
│       │   ├── PostgresAdapter.ts  # Driver PG con transacciones READ ONLY aisladas
│       │   ├── MemoryFileAdapter.ts# Parser Excel/CSV con SQLite WebAssembly en RAM
│       │   └── AdapterFactory.ts   # Factory Pattern extensible (MySQL, SQLServer, Mongo)
│       ├── firewall/
│       │   └── SqlFirewall.ts      # Inspección AST estricta con node-sql-parser
│       ├── services/
│       │   ├── prisma.service.ts   # Singleton del cliente Prisma
│       │   ├── textToSql.service.ts# Motor de inferencia SQL con Vercel AI SDK
│       │   ├── thresholdEvaluator.service.ts # Evaluador numérico de alarmas en SQL
│       │   └── googleCalendar.service.ts     # Integración Google OAuth2 y eventos RRULE
│       ├── controllers/
│       │   ├── analytics.controller.ts # Text-to-SQL y Adapter Orchestration
│       │   ├── strategy.controller.ts  # CRUD de Estrategias, Marketplace y Social
│       │   ├── alert.controller.ts     # Gestión de Alertas y Sincronización Calendar
│       │   ├── lead.controller.ts      # Embudo B2B: Captura de Leads corporativos
│       │   └── auth.controller.ts      # Google OAuth y tokens de desarrollo
│       ├── routes/
│       │   ├── analytics.routes.ts
│       │   ├── strategy.routes.ts
│       │   ├── alert.routes.ts
│       │   ├── lead.routes.ts
│       │   └── auth.routes.ts
│       ├── middleware/
│       │   ├── upload.middleware.ts    # Multer memoryStorage (Zero-Retention)
│       │   └── errorHandler.middleware.ts
│       └── server.ts               # Servidor Express y Seed de Plantillas Estándar
│
└── web-app/                        # FRONTEND SINGLE PAGE APPLICATION
    ├── Dockerfile                  # Multi-stage build Nginx Alpine
    ├── nginx.conf                  # Reverse proxy y entrega de estáticos
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── index.html
    ├── tailwind.config.js          # Configuración estética corporativa
    ├── postcss.config.js
    └── src/
        ├── index.css
        ├── main.tsx
        ├── App.tsx                 # Coordinador Landing vs. Dashboard
        ├── types/
        │   └── index.ts
        ├── store/                  # Estado Efímero en Zustand (Zero-Retention)
        │   ├── useConnectionStore.ts # Credenciales y archivos en RAM volátil
        │   └── useStrategyStore.ts   # Ejecución analítica y Marketplace
        └── components/
            ├── landing/            # Módulo 1: Embudo B2B & Landing Page
            │   ├── LandingPage.tsx
            │   ├── HeroSection.tsx
            │   ├── ServicesGrid.tsx
            │   ├── InteractiveDemo.tsx
            │   ├── ArchitectureShowcase.tsx
            │   ├── LeadContactForm.tsx
            │   └── Footer.tsx
            └── dashboard/          # Módulos 2, 3 y 4: Consola Analítica SaaS
                ├── QueryConsole.tsx
                ├── ConnectionModal.tsx
                └── MarketplaceModal.tsx
```

---

## 🔒 2. Core Multi-Fuente, Adapter Pattern y Política Zero-Retention

### 2.1. Estado Efímero (Zero-Retention)
En concordancia con los estándares de compliance contable y confidencialidad corporativa:
- **Las credenciales de bases de datos de los clientes, contraseñas, URLs y archivos subidos NUNCA se persisten en la base de datos interna de Prisma.**
- Viven exclusivamente en el estado de **Zustand** del navegador y se transmiten por solicitud vía payload/headers o multipart (`multer.memoryStorage()`).
- Tras responder la consulta, las conexiones se cierran inmediatamente y los buffers en RAM son liberados por el Garbage Collector de Node.js.

### 2.2. Patrón Adapter / Factory
Se implementó la interfaz `DatabaseAdapter` y la clase `AdapterFactory` para desacoplar el consumo analítico del motor subyacente:
- **`PostgresAdapter`:** Conexión directa a PostgreSQL. Ejecuta las consultas dentro de un bloque explícito `BEGIN TRANSACTION READ ONLY; ... COMMIT;` con límites de tiempo (`statement_timeout = 15000;`).
- **`MemoryFileAdapter`:** Recibe archivos `.xlsx`, `.xls` o `.csv` desde memoria RAM, infiere los tipos de columna, crea tablas dinámicas en una base de datos **SQLite WebAssembly** (`sql.js`) y ejecuta la consulta analítica con cero escrituras en disco.
- **Extensibilidad Diseñada:** La arquitectura cuenta con puntos de inserción nativos para adaptadores de MySQL (`mysql2`), SQL Server (`mssql`) y MongoDB.

### 2.3. Firewall SQL con Inspección de AST
Antes de tocar cualquier motor de base de datos, toda consulta generada por el LLM o introducida por el usuario pasa por `SqlFirewall`:
- Parsea la consulta a un **Árbol de Sintaxis Abstracta (AST)** mediante `node-sql-parser`.
- Verifica que el tipo de sentencia sea estrictamente `select`.
- Bloquea cualquier comando DDL (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`).
- Bloquea cualquier comando DML (`INSERT`, `UPDATE`, `DELETE`, `MERGE`, `REPLACE`).
- Prohíbe consultas múltiples o encadenadas por punto y coma (prevención de stacked queries).
- Filtra funciones y procedimientos peligrosos (`pg_sleep`, `xp_cmdshell`, `INTO OUTFILE`).

---

## 📊 3. Estrategias, Comunidad y Marketplace

La base de datos interna de **Prisma** (alojada en PostgreSQL / Railway) administra exclusivamente la metadata de la plataforma:
- **CRUD de Estrategias:** Almacena plantillas de prompts, SQL base verificado, tipo de gráfico (`BAR`, `LINE`, `PIE`, `TABLE`), parámetros dinámicos y visibilidad (`PUBLIC` / `PRIVATE`).
- **Monetización (`isPremium`):** Soporta modelos freemium donde ciertas estrategias avanzadas están reservadas para clientes corporativos de la consultora.
- **Motor Social:** Puntuación de 1 a 5 estrellas (`StrategyRating`) y comentarios jerárquicos anidados (`StrategyComment`).
- **Plantillas Predefinidas de KPIs Contables & Operativos:**
  1. *EBITDA y Margen Operativo Mensual*
  2. *Aging de Cuentas por Cobrar (Créditos Morosos)*
  3. *Rotación de Inventario y Días Calle de Stock (DSI)*
  4. *Conciliación Bancaria vs. Libro Mayor*

---

## 🔔 4. Alertas y Google Calendar OAuth2

- **Evaluador de Umbrales:** `ThresholdEvaluator` analiza en tiempo de ejecución las columnas numéricas de los resultados SQL frente a operadores (`<`, `>`, `<=`, `>=`, `==`, `!=`), detectando anomalías como caídas de margen de EBITDA por debajo del 20% o mora mayor a 90 días.
- **Sincronización con Google Calendar:** Integración con la API oficial de Google (`googleapis`) mediante OAuth2 (`offline access`). Cuando se activa una alerta, el sistema genera automáticamente un evento recurrente en el calendario primario del usuario aplicando la especificación **RFC 5545 RRULE** (ej. `RRULE:FREQ=DAILY;BYHOUR=9;BYMINUTE=0`) con deep-links a la plataforma Anexar.

---

## 🚀 5. Despliegue y Puesta en Marcha Local

### Prerrequisitos
- [Docker](https://www.docker.com/) y Docker Compose instalados.
- Node.js v20+ (opcional para desarrollo sin contenedores).

### Levantar todo el stack con Docker Compose
```bash
# 1. Clonar el repositorio
git clone https://github.com/LucianoMassa98/Anexar.git
cd Anexar

# 2. Iniciar contenedores en segundo plano
docker-compose up -d --build

# 3. Verificar estado de los servicios
docker-compose ps
```

- **Frontend WebApp:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:4000/health](http://localhost:4000/health)
- **Postgres Interno:** `localhost:5432` (db: `anexar_internal_db`)

---

## 🌐 6. Variables de Entorno

### Backend (`/api-rest/.env`)
```ini
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Base interna en Railway o local
DATABASE_URL="postgresql://anexar_admin:anexar_secret_key_2026@localhost:5432/anexar_internal_db?schema=public"

# Seguridad y Autenticación
JWT_SECRET="anexar_super_secret_jwt_key_at_least_32_characters"
JWT_EXPIRES_IN="7d"

# Inteligencia Artificial (Vercel AI SDK)
OPENAI_API_KEY="sk-proj-tu-api-key"
OPENAI_MODEL="gpt-4o"

# Google Calendar OAuth2
GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
```

### Frontend (`/web-app/.env`)
```ini
VITE_API_URL="http://localhost:4000"
```

---

## 💼 7. Contacto & Servicios de Consultoría B2B

Para proyectos de consultoría, saneamiento de bases contables, centralización de ERPs o implementación corporativa de Anexar SaaS:

- **Empresa:** ANEXAR — Consultoría Contable & Tecnológica
- **Sitio Web & Demo:** [http://localhost:3000](http://localhost:3000)
- **Repositorio Oficial:** [https://github.com/LucianoMassa98/Anexar.git](https://github.com/LucianoMassa98/Anexar.git)
- **SLA de Respuesta:** Menos de 24 horas hábiles tras el envío del formulario de contacto.
