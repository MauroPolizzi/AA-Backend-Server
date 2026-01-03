const { Router } = require('express');
const { check } = require('express-validator');
const { Genero, TipoSangre, TipoDocumento } = require('../models/enums');
const { getPacientes, postPaciente, putPaciente, getPacienteById } = require('../controllers/paciente.controller');
const { validarCampos } = require('../middlewares/validator-campos');

const pacienteRouter = Router();

// Get
pacienteRouter.get( '/', getPacientes );

// Get By Id
pacienteRouter.get('/:guid', getPacienteById );

// Post
pacienteRouter.post( '/', 
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('apellido', 'El apellido es obligatorio').not().isEmpty(),
        check('tipoDocumento', 'El tipo de documento es obligatorio').not().isEmpty(),
        check('tipoDocumento', 'El tipo de documento no es válido').isIn(Object.values(TipoDocumento)),
        check('numeroDocumento', 'El número de documento es obligatorio').not().isEmpty(),
        check('numeroDocumento', 'El número de documento debe ser numérico').isNumeric(),
        check('fechaNacimiento', 'La fecha de nacimiento es obligatoria').not().isEmpty(),
        check('fechaNacimiento', 'La fecha de nacimiento debe ser una fecha válida').isISO8601(),
        check('genero', 'El género es obligatorio').not().isEmpty(),
        check('genero', 'El género no es válido').isIn(Object.values(Genero)),
        check('tipoSangre', 'El tipo de sangre es obligatorio').not().isEmpty(),
        check('tipoSangre', 'El tipo de sangre no es válido').isIn(Object.values(TipoSangre)),
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('email', 'El email no es válido').isEmail(),
        check('direccion', 'La dirección es obligatoria').not().isEmpty(),
        check('usuarioId', 'El ID de usuario es obligatorio').not().isEmpty(),
        check('usuarioId', 'El ID de usuario debe ser un ObjectId válido').isMongoId(),
        validarCampos
    ], 
    postPaciente );

// Put
pacienteRouter.put('/:guid', 
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('apellido', 'El apellido es obligatorio').not().isEmpty(),
        check('tipoDocumento', 'El tipo de documento es obligatorio').not().isEmpty(),
        check('tipoDocumento', 'El tipo de documento no es válido').isIn(Object.values(TipoDocumento)),
        check('numeroDocumento', 'El número de documento es obligatorio').not().isEmpty(),
        check('numeroDocumento', 'El número de documento debe ser numérico').isNumeric(),
        check('fechaNacimiento', 'La fecha de nacimiento es obligatoria').not().isEmpty(),
        check('fechaNacimiento', 'La fecha de nacimiento debe ser una fecha válida').isISO8601(),
        check('genero', 'El género es obligatorio').not().isEmpty(),
        check('genero', 'El género no es válido').isIn(Object.values(Genero)),
        check('tipoSangre', 'El tipo de sangre es obligatorio').not().isEmpty(),
        check('tipoSangre', 'El tipo de sangre no es válido').isIn(Object.values(TipoSangre)),
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('email', 'El email no es válido').isEmail(),
        check('direccion', 'La dirección es obligatoria').not().isEmpty(),
        check('usuarioId', 'El ID de usuario es obligatorio').not().isEmpty(),
        check('usuarioId', 'El ID de usuario debe ser un ObjectId válido').isMongoId(),
        validarCampos
    ], 
    putPaciente)

module.exports = {
    pacienteRouter
}