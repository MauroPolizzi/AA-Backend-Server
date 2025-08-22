const { Router } = require("express");
const { check } = require("express-validator");
const { login, googleSingIn, renewToken, returnClient_id } = require("../controllers/auth.controller");
const { validarCampos } = require("../middlewares/validator-campos");
const { validarJWT } = require("../middlewares/validator-token");

const authRouter = Router();

// Ruta de login
// Endpoint para la verificacion a traves de nuestras credenciales de BBDD
authRouter.post(
    '/', 
    [
        check('email', 'El email es requerido').isEmail(),
        check('password', 'El password es requerido').not().isEmpty(),
        validarCampos
    ],
    login
);

// Endpoint para la verificacion a traves de Google
authRouter.post(
    '/google',
    [
        check('token', 'El token de Google es requerido').not().isEmpty(),
        validarCampos
    ], 
    googleSingIn
);

// Endpoint para la renovacion de un token
authRouter.get('/renew', validarJWT, renewToken);

// Endpoint para obtener el client_id
authRouter.get('/config', returnClient_id);

module.exports = {
    authRouter
}