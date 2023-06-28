const { Router } = require("express");
const expressfileUpload = require('express-fileupload');
const { validarJWT } = require("../middlewares/validator-token");
const { fileUpload, getFileUploadImg } = require("../controllers/file-upload.controller");

const fileuploadRouter = Router();

// Pasamos por este middleware antes de llamar a la peticion
// revisar la documentacion de express-fileupload
// Gracias a este middleware tenemos acceso a la img en controller
fileuploadRouter.use(expressfileUpload());
fileuploadRouter.put('/:tabla/:guid', [validarJWT], fileUpload);
fileuploadRouter.get('/:tabla/:img', getFileUploadImg);

module.exports = {
    fileuploadRouter
}