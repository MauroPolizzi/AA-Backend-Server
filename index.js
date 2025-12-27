
// Utilizamos el paquete previamente instalado de dotenv, para crear variables de entorno
// Estas mismas se las usas como 'process.env.TU_VARIABLE'
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./database/config');

// Routers
const { usuarioRouter } = require('./routes/ususario.route');
const { authRouter } = require('./routes/auth.route');
const { hospitalRouter } = require('./routes/hospital.route');
const { medicoRouter } = require('./routes/medico.route');
const { searchRouter } = require('./routes/search.route');
const { fileuploadRouter } = require('./routes/file-upload.route');
const { pacienteRouter } = require('./routes/paciente.route');

// Creamos el servidor de express
const app = express();

// Configuramos CORS
app.use( cors() );

// Aqui hacemos que se despliegue al cliente lo que este en la carpeta 'public'
// Es una especie de frontend que tenemos
app.use( express.static('public') );

// Realizamos la lectura de lo que viene desde el frontend
app.use( express.json() );

// Conectando a la BBDD
dbConnection();

// Creamos las rutas
app.use('/api/usuario', usuarioRouter); 
app.use('/api/login', authRouter);
app.use('/api/hospital', hospitalRouter);
app.use('/api/medico', medicoRouter);
app.use('/api/todo', searchRouter);
app.use('/api/fileupload', fileuploadRouter);
app.use('/api/paciente', pacienteRouter);

//Iniciamos el servidor y determinamos el puerto
app.listen( process.env.PORT, () => {
    console.log( `Servidor corriendo en puerto ${ process.env.PORT }` );
});