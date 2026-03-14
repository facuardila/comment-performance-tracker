# Ayuda para subir el código a GitHub

GitHub ya no acepta autenticación con contraseña para operaciones Git. Debes usar un token de acceso personal. Aquí están los pasos correctos:

## Paso 1: Crear un token de acceso personal en GitHub

1. Ve a https://github.com/settings/tokens
2. Haz clic en "Generate new token"
3. Selecciona "Fine-grained personal access token" o "Personal access token (classic)"
4. Si eliges Fine-grained:
   - Selecciona "Repository access" y elige el repositorio específico
   - En "Repository permissions", da permiso de "Contents" como "Read and Write"
5. Si eliges Classic:
   - Selecciona el alcance "repo"
6. Copia el token generado (guárdalo en un lugar seguro)

## Paso 2: Actualizar la URL remota para usar el token

En lugar de ingresar usuario y contraseña, puedes actualizar la URL remota para incluir el token:

```bash
git remote set-url origin https://facuardila:[TU_TOKEN_AQUI]@github.com/facuardila/comment-performance-tracker.git
```

Reemplaza [TU_TOKEN_AQUI] con el token que generaste.

## Paso 3: Intentar hacer push nuevamente

```bash
git push -u origin main
```

## Alternativa: Usar Git Credential Manager

Si usas Git Credential Manager, puedes almacenar tu token de forma segura:

```bash
git config --global credential.helper store
git push -u origin main
```

Cuando te pida credenciales, introduce tu nombre de usuario y el token (en lugar de la contraseña).

## Verificación

Puedes verificar que el remoto esté configurado correctamente con:

```bash
git remote -v
```

Esto debería mostrar la URL con tu token incluido.