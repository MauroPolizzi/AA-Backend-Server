
// Utilizamos el paquete previamente instalado de dotenv, para crear variables de entorno
// Estas mismas se las usas como 'process.env.TU_VARIABLE'
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./database/config');
const { router } = require('./routes/ususario.route');
const { routerAuth } = require('./routes/auth.router');

// Creamos el servidor de express
const app = express();

// Configuramos CORS
app.use( cors() );

// Realizamos la lectura de lo que viene desde el frontend
app.use( express.json() );

// Conectando a la BBDD
dbConnection();

// Creamos las rutas
app.use('/api/ususario', router); 
app.use('/api/login', routerAuth);

//Iniciamos el servidor y determinamos el puerto
app.listen( process.env.PORT, () => {
    console.log( `Servidor corriendo en puerto ${ process.env.PORT }` );
});