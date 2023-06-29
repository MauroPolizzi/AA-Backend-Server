const { Router } = require("express");
const { check } = require("express-validator");
const { login, googleSingIn } = require("../controllers/auth.controller");
const { validarCampos } = require("../middlewares/validator-campos");

const authRouter = Router();

// Ruta de login
authRouter.post(
    '/', 
    [
        check('email', 'El email es requerido').isEmail(),
        check('password', 'El password es requerido').not().isEmpty(),
        validarCampos
    ],
    login
);

authRouter.post(
    '/google',
    [
        check('token', 'El token de Google es requerido').not().isEmpty(),
        validarCampos
    ], 
    googleSingIn);

module.exports = {
    authRouter
}