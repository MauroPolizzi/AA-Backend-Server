const { Router } = require("express");
const { getMedicos, postMedico, putMedico, deleteMedico, getMedicoById } = require('../controllers/medico.controller');
const { validarJWT } = require("../middlewares/validator-token");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validator-campos");

const medicoRouter = Router();

// Get
medicoRouter.get('/', [validarJWT], getMedicos);

// Get by Id
medicoRouter.get('/:guid', [validarJWT], getMedicoById);

// Post
medicoRouter.post(
    '/',
    [
        validarJWT,
        check('nombre', 'El nombre es requerido').not().isEmpty(),
        check('especialidad', 'La especialidad es requerida').not().isEmpty(),
        check('hospitalId', 'El hospitalId debe ser valido').isMongoId(), // Verificamos que sea un id valido generado por mongoose
        validarCampos
    ], 
    postMedico);

// Put
medicoRouter.put('/:guid', [validarJWT], putMedico);

// Delete
medicoRouter.delete('/:guid', [validarJWT], deleteMedico);

module.exports = {
    medicoRouter
}