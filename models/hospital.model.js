
const { Schema, model } = require('mongoose');

const HospitalModel = Schema({

    nombre: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    ususarioCreador: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    }
}, { collection: 'hospitales' }); // Colocamos el nombre de como saldra la collection en BBDD (Lo que seria la tabla)

// Configuracion global del modelo de Usuario
// Sacamos los valores de __v y _id de la respuesta que devolvemos
// Creamos el campo Guid y le damos el valor de _id
// Esto es a modo visual y no afecta la BBDD
HospitalModel.method('toJSON', function() {
    const {__v, _id, ...object} = this.toObject();
    object.Guid = _id;
    return object;
});

module.exports = model( 'hospital', HospitalModel );