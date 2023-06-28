const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validator-token");
const { validarCampos } = require("../middlewares/validator-campos");
const { getHospital, postHospital, putHospital, deleteHospital } = require("../controllers/hospital.controller");

const hospitalRouter = Router();

// Get
hospitalRouter.get('/', [validarJWT], getHospital);

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