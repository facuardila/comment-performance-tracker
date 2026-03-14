# Instrucciones para subir el código a GitHub

## Paso 1: Abrir Terminal/CMD en la carpeta del proyecto

Abre tu terminal o consola de comandos y navega a la carpeta del proyecto:

```bash
cd /Users/facu/Documents/PROYECTOS/SUPERCOMPRA/comment-tracker
```

## Paso 2: Inicializar el repositorio Git

```bash
git init
```

## Paso 3: Añadir todos los archivos al repositorio

```bash
git add .
```

## Paso 4: Hacer el primer commit

```bash
git commit -m "Initial commit - Comment Performance Tracker MVP"
```

## Paso 5: Conectar con tu repositorio remoto de GitHub

Copia la URL de tu repositorio recién creado desde la página de GitHub (busca el botón verde "Code" y copia la URL HTTPS) y ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO_DE_GITHUB/comment-performance-tracker.git
```

Reemplaza "TU_USUARIO_DE_GITHUB" con tu nombre de usuario real de GitHub.

## Paso 6: Subir el código al repositorio remoto

```bash
git branch -M main
git push -u origin main
```

## Paso 7: Verificar que todo se haya subido correctamente

Ve a tu navegador y visita https://github.com/TU_USUARIO_DE_GITHUB/comment-performance-tracker para confirmar que todos los archivos se hayan subido correctamente.

## ¡Listo!

Ahora tu código está en GitHub y puedes proceder con el despliegue en Vercel siguiendo las instrucciones del archivo DEPLOYMENT_GUIDE.md.