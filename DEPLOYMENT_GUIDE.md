# Guía de Despliegue en la Nube

## Despliegue en Vercel (Recomendado)

### Paso 1: Preparar la aplicación para producción

La aplicación ya está lista para ser desplegada en la nube. Asegúrate de tener una cuenta en:

1. [Vercel](https://vercel.com/) - Para hospedar la aplicación web
2. [Supabase](https://supabase.io/) - Para la base de datos PostgreSQL

### Paso 2: Configurar Supabase

1. Crea una cuenta gratuita en [Supabase](https://supabase.io/)
2. Crea un nuevo proyecto
3. Copia la URL del proyecto y la API Key (Service Role) en un lugar seguro

### Paso 3: Desplegar en Vercel

#### Opción A: Usando el botón de deploy automático (más fácil)

1. Asegúrate de que tu código esté en un repositorio público de GitHub
2. Ve a [Vercel](https://vercel.com/)
3. Haz clic en "New Project" y selecciona tu repositorio
4. Vercel detectará automáticamente que es una aplicación Next.js
5. Agrega las siguientes variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: La clave de servicio de tu proyecto de Supabase
6. Haz clic en "Deploy"

#### Opción B: Usando la CLI de Vercel

1. Instala la CLI de Vercel:
```bash
npm i -g vercel
```

2. Navega al directorio del proyecto:
```bash
cd comment-tracker
```

3. Inicia sesión en Vercel:
```bash
vercel login
```

4. Despliega el proyecto:
```bash
vercel --env NEXT_PUBLIC_SUPABASE_URL=[tu_url_de_supabase] --env SUPABASE_SERVICE_ROLE_KEY=[tu_clave_de_servicio_de_supabase]
```

### Paso 4: Configurar Playwright para producción

Como la aplicación usa Playwright para scraping, necesitas asegurarte de que los navegadores estén disponibles en el entorno de producción. En Vercel, puedes hacer esto agregando una configuración especial:

Crea un archivo `vercel.json` en la raíz del proyecto:

```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 60
    }
  },
  "buildCommand": "npx playwright install-deps && npm run build"
}
```

### Paso 5: Variables de entorno requeridas

Asegúrate de configurar estas variables de entorno tanto en desarrollo como en producción:

```
NEXT_PUBLIC_SUPABASE_URL=Tu_URL_de_Supabase
SUPABASE_SERVICE_ROLE_KEY=Tu_Clave_de_Servicio_de_Supabase
```

### Paso 6: Configuración de la base de datos

Cuando se despliega por primera vez, debes crear las tablas en Supabase. Puedes hacerlo ejecutando el script de migración manualmente en el panel de SQL de Supabase o asegurándote de que el script de inicialización se ejecute durante el despliegue.

Las tablas necesarias son:

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

## Acceso Multiusuario

Una vez desplegado, cualquiera con la URL podrá acceder a la aplicación. Todos los usuarios compartirán la misma base de datos, lo que permite:

- Ver todos los comentarios registrados por otros usuarios
- Colaborar en el seguimiento de comentarios
- Acceder a dashboards con datos de todos los usuarios

## Consideraciones de Producción

### Seguridad
- La aplicación no tiene autenticación por defecto, por lo que cualquiera puede acceder a ella
- Si necesitas control de acceso, deberás agregar autenticación (por ejemplo, con Supabase Auth)
- La clave de servicio de Supabase otorga acceso total a la base de datos, así que mantenla segura

### Escalabilidad
- El scraping de Instagram puede consumir recursos, especialmente con muchos comentarios
- Considera límites de tasa para proteger contra abusos
- Supervisa el uso de recursos en Vercel

### Mantenimiento
- Los selectores de scraping pueden necesitar actualizaciones cuando Instagram cambie su interfaz
- Supervisa los errores de scraping en la base de datos
- Realiza copias de seguridad regulares de la base de datos en Supabase

## Posible migración a servidor privado

Si en el futuro decides pasar a un servidor privado:

1. Puedes exportar los datos de Supabase como backup
2. Configurar un servidor con Node.js
3. Instalar PostgreSQL localmente o en tu servidor
4. Restaurar los datos en tu base de datos local
5. Cambiar las variables de entorno para apuntar a tu base de datos local
6. Desplegar la aplicación en tu servidor (usando PM2, Docker, etc.)

La arquitectura está diseñada para facilitar esta transición.

## Solución de problemas comunes

### Error de scraping en producción
- Asegúrate de que Playwright esté correctamente instalado en el entorno de producción
- Verifica que los navegadores estén disponibles
- Comprueba si Instagram está bloqueando las solicitudes (posible rotación de IPs o headers)

### Problemas de conexión a la base de datos
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el firewall de Supabase permita conexiones desde tu aplicación

### Tiempos de respuesta lentos
- Considera optimizar consultas con índices adicionales
- Evalúa el uso de caching para operaciones repetidas
- Revisa el tamaño de la base de datos y considera estrategias de archivado