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
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.id;
            delete ret.password;
            ret.Guid = doc._id;
            return ret;
        }
    }
})

module.exports = model( 'usuario', UsuarioModel );