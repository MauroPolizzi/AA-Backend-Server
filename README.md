# Backend Server - Sistema de Gestión Hospitalaria

Backend RESTful API para un sistema de gestión hospitalaria que permite administrar usuarios, hospitales y médicos con autenticación segura y gestión de archivos.

## Descripción

Este proyecto es un servidor backend desarrollado con Node.js y Express que proporciona una API completa para la gestión de un sistema hospitalario. El sistema permite la administración de usuarios con diferentes roles, hospitales y médicos asociados, además de incluir autenticación mediante JWT y Google OAuth.


## Arquitectura del Proyecto

El proyecto sigue el patrón **MVC** (Modelo-Vista-Controlador) con una estructura modular y escalable:

```
AA-Backend-Server/
├── controllers/          # Lógica de negocio
│   ├── auth.controller.js
│   ├── usuario.controller.js
│   ├── hospital.controller.js
│   ├── medico.controller.js
│   ├── search.controller.js
│   └── file-upload.controller.js
│
├── models/              # Esquemas de Mongoose
│   ├── ususario.model.js
│   ├── hospital.model.js
│   └── medico.model.js
│
├── routes/              # Definición de endpoints
│   ├── auth.route.js
│   ├── ususario.route.js
│   ├── hospital.route.js
│   ├── medico.route.js
│   ├── search.route.js
│   └── file-upload.route.js
│
├── middlewares/         # Middlewares personalizados
│   ├── validator-token.js
│   └── validator-campos.js
│
├── helpers/             # Funciones auxiliares
│   ├── token.js
│   ├── google-verify.js
│   └── update-img.js
│
├── strategies/          # Patrón Strategy
│
├── database/            # Configuración de BD
│   └── config.js
│
├── upload/              # Almacenamiento de archivos
│   ├── hospitales/
│   ├── medicos/
│   └── usuarios/
│
├── public/              # Frontend estático
│
├── .env                 # Variables de entorno
├── index.js             # Punto de entrada
└── package.json         # Dependencias
```


## Endpoints de la API

### Autenticación
- `POST /api/login` - Login con credenciales
- `POST /api/login/google` - Login con Google OAuth

### Usuarios
- `GET /api/usuario` - Obtener todos los usuarios
- `POST /api/usuario` - Crear nuevo usuario
- `PUT /api/usuario/:id` - Actualizar usuario
- `DELETE /api/usuario/:id` - Eliminar usuario

### Hospitales
- `GET /api/hospital` - Obtener todos los hospitales
- `POST /api/hospital` - Crear nuevo hospital
- `PUT /api/hospital/:id` - Actualizar hospital
- `DELETE /api/hospital/:id` - Eliminar hospital

### Médicos
- `GET /api/medico` - Obtener todos los médicos
- `POST /api/medico` - Crear nuevo médico
- `PUT /api/medico/:id` - Actualizar médico
- `DELETE /api/medico/:id` - Eliminar médico

### Búsqueda y Archivos
- `GET /api/todo/:termino` - Búsqueda global
- `PUT /api/fileupload/:tipo/:id` - Subir archivo/imagen


## Desarrollo

El proyecto utiliza nodemon para reinicio automático durante el desarrollo:

```bash
npm run start:dev
```