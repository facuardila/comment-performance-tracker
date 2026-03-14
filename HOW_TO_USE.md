# Comment Performance Tracker - Guía de Uso

## Introducción

El Comment Performance Tracker es una herramienta interna para agencias que permite a los community managers hacer un seguimiento del rendimiento de sus comentarios en Instagram, sin necesidad de credenciales de clientes ni APIs oficiales.

## Cómo Empezar

### 1. Instalación y Configuración Inicial

1. Asegúrate de tener Node.js instalado en tu sistema
2. Clona el repositorio y navega al directorio del proyecto
3. Ejecuta `npm install` para instalar las dependencias
4. Configura las variables de entorno en un archivo `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de proyecto de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de servicio de Supabase
5. Instala los navegadores de Playwright: `npx playwright install`
6. Inicia la aplicación: `npm run dev`

### 2. Configuración de la Base de Datos

La aplicación requiere una base de datos PostgreSQL. Recomendamos usar Supabase:
1. Crea una cuenta gratuita en supabase.com
2. Crea un nuevo proyecto
3. Copia la URL del proyecto y la API Key (Service Role) en tu archivo `.env.local`
4. Las tablas se crearán automáticamente cuando inicies la aplicación

## Funcionalidades Principales

### 1. Quick Add (Interfaz Principal)

La interfaz Quick Add es el corazón del producto, diseñada para un uso diario ultra-rápido por parte de los community managers.

**Acceso**: `/comments/new`

**Pasos para usar**:
1. Navega a `/comments/new`
2. Pega el enlace del comentario o post de Instagram
3. Introduce tu nombre de CM
4. Añade una etiqueta de campaña si es relevante
5. Opcionalmente, añade la cuenta objetivo y notas
6. Haz clic en "Save" o "Save and Add Another" para continuar rápidamente

**Características**:
- Muy rápida: pegar URL y enviar en 2 segundos
- Persistencia de CM name y campaign tag en localStorage
- Botón "Save and add another" para añadir múltiples comentarios rápidamente
- Mostrar últimos comentarios añadidos

### 2. Importador XLSX (Datos Históricos)

Para cargar datos históricos desde un archivo Excel.

**Acceso**: `/imports/new`

**Pasos para usar**:
1. Navega a `/imports/new`
2. Arrastra o selecciona un archivo .xlsx
3. El sistema detectará automáticamente las columnas
4. Mapea las columnas si es necesario (url, cm_name, campaign_tag, etc.)
5. Procesa la importación

**Formato esperado**:
- Columnas recomendadas: `url`, `cm_name`, `campaign_tag`, `target_account`, `notes`
- La columna `url` es obligatoria

### 3. Vista de Comentarios (Base de Datos)

Una vista tipo base de datos para explorar todos los comentarios seguidos.

**Acceso**: `/comments`

**Funcionalidades**:
- Búsqueda por texto
- Filtros por plataforma, estado, campaña, CM
- Ordenación por diferentes columnas
- Paginación
- Selección múltiple
- Exportación a CSV
- Actualización de métricas seleccionadas
- Ver detalles de comentario

### 4. Detalle de Comentario

Vista detallada de un comentario específico con toda la información y evolución temporal.

**Acceso**: `/comments/[id]`

**Contenido**:
- Metadatos completos del comentario
- Enlace original
- Estado actual
- Gráficos de evolución de likes
- Gráficos de evolución de replies
- Gráficos de evolución de engagement total
- Tabla de snapshots históricos
- Notas editables

### 5. Dashboard

Panel de control con KPIs y métricas generales.

**Acceso**: `/dashboard`

**KPIs mostrados**:
- Total de comentarios seguidos
- Distribución de estados (activos vs eliminados vs no encontrados)
- Total de likes acumulados
- Total de replies acumulados
- Total de engagement acumulado

**Gráficos disponibles**:
- Top 10 comentarios por engagement
- Top 10 cuentas objetivo
- Evolución de likes por día
- Evolución de replies por día
- Evolución de engagement total por día
- Ranking por CM
- Ranking por campaña
- Comentarios con mayor velocidad de crecimiento

### 6. Bookmarklet (Captura Rápida)

Herramienta para capturar rápidamente comentarios desde Instagram web.

**Acceso**: `/tools`

**Configuración**:
1. Navega a `/tools`
2. Arrastra el enlace del bookmarklet a tu barra de favoritos
3. Cuando estés en una página de Instagram, haz clic en el bookmarklet
4. Se abrirá la interfaz Quick Add con la URL pre-rellenada

## Buenas Prácticas

### Para Community Managers

1. **Uso diario**: Utiliza la interfaz Quick Add para añadir comentarios inmediatamente después de publicarlos
2. **Etiquetas de campaña**: Usa etiquetas consistentes para agrupar comentarios relacionados
3. **Nombres de CM**: Usa nombres consistentes para facilitar el seguimiento
4. **Actualización regular**: Refresca las métricas regularmente para mantener los datos actualizados

### Para Administradores

1. **Monitoreo**: Revisa regularmente el dashboard para identificar tendencias
2. **Limpieza**: Elimina comentarios irrelevantes o duplicados periódicamente
3. **Backup**: Realiza copias de seguridad regulares de la base de datos
4. **Mantenimiento**: Mantén actualizados los selectores de scraping según los cambios en Instagram

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **Scraping**: La aplicación depende del scraping de Instagram, lo que puede verse afectado por cambios en la interfaz
2. **Métricas públicas**: Solo se pueden obtener métricas públicamente visibles
3. **Tasas de solicitud**: Instagram puede limitar las solicitudes automatizadas
4. **Privacidad**: Algunos comentarios pueden no ser accesibles debido a configuraciones de privacidad

### Consideraciones de Seguridad

1. **Vulnerabilidad de xlsx**: La biblioteca xlsx tiene vulnerabilidades conocidas (Prototype Pollution y ReDoS)
2. **Archivos confiables**: Solo importes archivos XLSX de fuentes confiables
3. **Validación**: Valida siempre el contenido de los archivos antes de procesarlos

## Solución de Problemas

### Problemas Comunes

1. **Error de scraping**: Si un comentario no se puede scrapear, revisa el estado en la base de datos
2. **Conexión a Supabase**: Asegúrate de que las variables de entorno estén correctamente configuradas
3. **Playwright**: Si el scraping falla, asegúrate de que los navegadores de Playwright estén instalados

### Depuración

1. Revisa los logs de la aplicación para mensajes de error
2. Verifica el estado de los comentarios en la base de datos
3. Comprueba que las URLs de Instagram sean válidas y accesibles públicamente

## Mantenimiento

### Actualizaciones Regulares

1. **Selectores de scraping**: Actualiza los selectores DOM cuando Instagram cambie su interfaz
2. **Dependencias**: Mantén actualizadas las dependencias del proyecto
3. **Base de datos**: Realiza backups regulares y optimiza índices según sea necesario

### Escalabilidad

1. **Rendimiento**: Para grandes volúmenes de datos, considera optimizar consultas y añadir índices
2. **Scraping**: Implementa colas y rate limiting para grandes volúmenes de scraping
3. **Almacenamiento**: Considera estrategias de archivado para datos históricos antiguos

## Conclusión

El Comment Performance Tracker proporciona una solución completa para que las agencias sigan el rendimiento de los comentarios de Instagram de sus community managers. Con su interfaz optimizada para un uso diario y sus potentes capacidades de análisis, es una herramienta invaluable para medir y mejorar el impacto de las estrategias de engagement en redes sociales.