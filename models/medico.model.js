
const { Schema, model } = require('mongoose');

const MedicoModel = Schema({

    nombre: {
        type: String,
        required: true
    },
    especialidad: {
        type: String,
        require: true
    },
    img: {
        type: String
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: true
    }
}, { collection: 'medicos' }); // Colocamos el nombre de como saldra la collection en BBDD (Lo que seria la tabla)

// Configuracion global del modelo de Usuario
// Sacamos los valores de __v y _id de la respuesta que devolvemos
// Creamos el campo Guid y le damos el valor de _id
// Esto es a modo visual y no afecta la BBDD
MedicoModel.method('toJSON', function() {
    const {__v, _id, ...object} = this.toObject();
    object.Guid = _id;
    return object;
});

module.exports = model( 'medico', MedicoModel );