const { Router } = require("express");
const { check } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { login, googleSingIn, renewToken, returnClient_id } = require("../controllers/auth.controller");
const { validarCampos } = require("../middlewares/validator-campos");
const { validarJWT } = require("../middlewares/validator-token");

const authRouter = Router();

// Configurar limitador específico para login
// Previene ataques de fuerza bruta limitando intentos de autenticación
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos por ventana
    message: {
        ok: false,
        message: 'Demasiados intentos de login. Por favor, intente nuevamente en 15 minutos.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Usar email como key para rastrear intentos por cuenta de usuario
    // Esto proporciona mejor protección ya que rastrea por cuenta, no por IP
    keyGenerator: (req, res) => {
        return req.body.email || 'no-email';
    }
});

// Ruta de login
// Endpoint para la verificacion a traves de nuestras credenciales de BBDD
authRouter.post(
    '/',
    loginLimiter, // Aplicar rate limiting para prevenir ataques de fuerza bruta
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