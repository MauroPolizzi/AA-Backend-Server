const { Router } = require('express');
const { check } = require('express-validator')

const { getUsuarios, postUsuario, putUsuario, deleteUsuario } = require('../controllers/ususario.controller');
const { validarCampos } = require('../middlewares/validator-campos');
const { validarJWT } = require('../middlewares/validator-token');

const router = Router();

// Get
router.get( '/', [validarJWT], getUsuarios);

// Post
router.post(
    '/',
    [
        // Para crear ususario se neceitara el token
        validarJWT,
        // Usuamos el check de la libreria de 'express-validator'
        check('nombre', 'El nombre es requerido').not().isEmpty(),
        check('password', 'El password es requerido').not().isEmpty(),
        check('email', 'El email es requerido').isEmail(),
        validarCampos
    ],
    postUsuario
);

// Put
router.put(
    '/:guid',
    [
        validarJWT,
        check('nombre', 'El nombre es requerido').not().isEmpty(),
        check('email', 'El email es requerido').isEmail(),
        validarCampos   
    ], 
    putUsuario);

// Delete
router.delete('/:guid', [validarJWT] , deleteUsuario);

module.exports = {
    router
}