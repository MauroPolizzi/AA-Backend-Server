const { Schema, model } = require("mongoose");
const { Genero, TipoSangre, TipoDocumento } = require("./enums");

const PacienteModel = Schema({
    
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    tipoDocumento: {
        type: String,
        enum: Object.values(TipoDocumento),
        required: true
    },
    numeroDocumento: {
        type: Number,
        unique: true,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    genero: {
        type: String,
        enum: Object.values(Genero),
        required: true
    },
    tipoSangre: {
        type: String,
        enum: Object.values(TipoSangre),
        required: true
    },
    telefono: {
        type: Number,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
        type: String,
        required: true
    },
    ciudad: {
        type: String,
    },
    estado: {
        type: String,
    },
    codigoPostal: {
        type: Number
    },
    contactoEmergencia: {
        type: Number
    },
    numeroSeguro: {
        type: Number
    },
    alergias: {
        type: String
    }, 
    observaciones: {
        type: String
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },
    activo: {
        type: Boolean
    },
    img: {
        type: String
    }
}, { collection: 'pacientes' }); // nombre de la tabla/collection en BBDD mongo

// Índices para optimización de consultas
// numeroDocumento ya tiene índice único por la propiedad unique: true
PacienteModel.index({ nombre: 1 }); // Índice ascendente para búsquedas por nombre
PacienteModel.index({ apellido: 1 }); // Índice ascendente para búsquedas por apellido
PacienteModel.index({ activo: 1 }); // Índice para filtrar pacientes activos/inactivos
PacienteModel.index({ usuarioId: 1 }); // Índice para búsquedas por usuario asociado

// Índice compuesto para búsquedas combinadas (nombre + apellido + activo)
PacienteModel.index({ nombre: 1, apellido: 1, activo: 1 });

PacienteModel.methods.getAge = function () {
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Si todavía no cumplió años este año
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

// Configuracion global del modelo de Paciente
// Sacamos los valores de __v y _id de la respuesta que devolvemos
// Creamos el campo Guid y le damos el valor de _id
// Esto es a modo visual y no afecta la BBDD
PacienteModel.method('toJSON', function() {
    const {__v, _id, ...object} = this.toObject();
    object.Guid = _id;
    return object;
});

module.exports = model( 'paciente', PacienteModel );