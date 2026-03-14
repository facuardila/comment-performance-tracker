# Comment Performance Tracker

Un sistema interno para agencias que permite a los community managers hacer un seguimiento del rendimiento de sus comentarios en Instagram, sin necesidad de credenciales de clientes ni APIs oficiales.

## Características

- **Quick Add**: Interfaz ultrarrápida para añadir comentarios de Instagram
- **Scraper de Instagram**: Extrae métricas públicas sin credenciales
- **Seguimiento histórico**: Almacena snapshots de métricas a lo largo del tiempo
- **Vista tipo base de datos**: Tabla filtrable y ordenable
- **Dashboard**: KPIs y gráficos de rendimiento
- **Importador XLSX**: Para datos históricos
- **Bookmarklet**: Herramienta para captura rápida desde Instagram

## Stack Tecnológico

- Next.js 14 con App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL)
- Playwright para scraping
- Recharts para gráficos
- xlsx para importador

## Instalación

1. Clona el repositorio:

```bash
git clone <repository-url>
cd comment-tracker
```

2. Instala las dependencias:

```bash
npm install
# o
pnpm install
```

3. Configura las variables de entorno:

Crea un archivo `.env.local` basado en `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Instala los navegadores de Playwright:

```bash
npx playwright install
```

5. Ejecuta la aplicación:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.io)
2. Crea un nuevo proyecto
3. Copia la URL del proyecto y la API Key (Service Role) en tu archivo `.env.local`
4. Ejecuta el script de migración para crear las tablas:

```sql
-- Tabla para comentarios seguidos
CREATE TABLE tracked_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL UNIQUE,
  normalized_url TEXT,
  platform TEXT DEFAULT 'instagram',
  post_url TEXT,
  comment_id TEXT,
  post_id TEXT,
  comment_text TEXT,
  comment_author TEXT,
  target_account TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  current_likes INTEGER DEFAULT 0,
  current_replies INTEGER DEFAULT 0,
  current_status TEXT DEFAULT 'pending' CHECK (current_status IN ('pending', 'active', 'deleted', 'not_found', 'private', 'error')),
  campaign_tag TEXT,
  cm_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para snapshots históricos
CREATE TABLE comment_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_comment_id UUID REFERENCES tracked_comments(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'deleted', 'not_found', 'private', 'error')),
  raw_json JSONB,
  response_time_ms INTEGER,
  error_message TEXT
);

-- Tabla para lotes de importación
CREATE TABLE import_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_rows INTEGER,
  success_rows INTEGER,
  failed_rows INTEGER
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_tracked_comments_source_url ON tracked_comments(source_url);
CREATE INDEX idx_tracked_comments_platform_status ON tracked_comments(platform, current_status);
CREATE INDEX idx_tracked_comments_last_checked ON tracked_comments(last_checked_at);
CREATE INDEX idx_comment_snapshots_comment_id ON comment_snapshots(tracked_comment_id);
CREATE INDEX idx_comment_snapshots_scraped_at ON comment_snapshots(scraped_at DESC);
```

## Cómo usar

### Quick Add (Principal)

1. Ve a `/comments/new`
2. Pega el enlace del comentario o post de Instagram
3. Selecciona o introduce tu nombre de CM
4. Añade una etiqueta de campaña si es relevante
5. Haz clic en "Save and Add Another" para continuar rápidamente

### Importar datos históricos

1. Ve a `/imports/new`
2. Sube un archivo .xlsx con columnas como `url`, `cm_name`, `campaign_tag`, etc.
3. El sistema procesará y añadirá los comentarios a la base de datos

### Ver comentarios seguidos

1. Ve a `/comments`
2. Usa filtros, búsquedas y ordenación para encontrar comentarios específicos
3. Actualiza métricas individuales o por lotes

### Dashboard

1. Ve a `/dashboard`
2. Consulta KPIs generales y tendencias
3. Identifica comentarios destacados y patrones de rendimiento

### Bookmarklet

1. Ve a `/tools`
2. Genera el bookmarklet y arrástralo a tu barra de favoritos
3. Úsalo en cualquier página de Instagram para añadir comentarios rápidamente

## Security Considerations

### Known Vulnerabilities
- The `xlsx` library has known vulnerabilities (Prototype Pollution and ReDoS)
- These vulnerabilities are related to the import functionality for XLSX files
- To mitigate risks:
  - Only import trusted XLSX files
  - Validate file contents before processing
  - Consider using CSV format as an alternative for data import
  - Monitor for updates to the xlsx library that address these issues

## Limitaciones del scraping

- Solo se pueden obtener métricas públicas
- El scraping puede fallar si Instagram cambia su estructura HTML
- Las tasas de solicitud pueden estar limitadas por Instagram
- Algunas métricas pueden no estar disponibles dependiendo de la configuración de privacidad

## Mantenimiento

- Los selectores DOM deben actualizarse periódicamente según los cambios en Instagram
- Monitorea los errores de scraping en la base de datos
- Realiza copias de seguridad regulares de la base de datos

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios importantes antes de enviar un PR.

## Licencia

MIT