const { Schema, model } = require('mongoose');

const UsuarioModel = Schema({

    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE'
    },
    google: {
        type: Boolean,
        default: false
    }
})

// Configuracion global del modelo de Usuario
// Sacamos los valores de __v y _id de la respuesta que devolvemos
// Creamos el campo Guid y le damos el valor de _id
// Esto es a modo visual y no afecta la BBDD
UsuarioModel.method('toJSON', function() {
    const {__v, _id, password, ...object} = this.toObject();
    object.Guid = _id;
    return object;
});

module.exports = model( 'usuario', UsuarioModel );