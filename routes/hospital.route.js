const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validator-token");
const { validarCampos } = require("../middlewares/validator-campos");
const { getHospitales, postHospital, putHospital, deleteHospital, getHospitalById } = require("../controllers/hospital.controller");

const hospitalRouter = Router();

// Get
hospitalRouter.get('/', [validarJWT], getHospitales);

// Get by Id
hospitalRouter.get('/:guid', [validarJWT], getHospitalById);

// Post
hospitalRouter.post(
    '/', 
    [
        validarJWT,
        check('nombre', 'El nombre es requerido').not().isEmpty(),
        validarCampos
    ], 
    postHospital);

// Put
hospitalRouter.put('/:guid', [validarJWT], putHospital);

// Delete
hospitalRouter.delete('/:guid', [validarJWT], deleteHospital);

module.exports = {
    hospitalRouter
}