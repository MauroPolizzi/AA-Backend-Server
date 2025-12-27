const { response } = require("express");
const jwt = require("jsonwebtoken");

const validarJWT = (req, res = response, next) => {

    // Leemos el token desde los headers
    const token = req.header('x-token');

    // Si no existe, devolvemos 'Unauthorized'
    if(!token){
        return res.status(401).json({
            ok: false,
            message: 'Necesita una key especial para esta acción.'
        });
    }

    try {

        // Verificamos que el token sea valido
        const { guid } = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Porporcionamos en la request el guid que leemos del token
        // Esto para obtener en el controller el guid del ususario que realizo la peticion
        req.guid = guid;

        next();

    } catch (error) {
        
        console.log('Error en [validator-token.js]: ', error);
        res.status(500).json({
            ok: false,
            message: 'La key proporcionada no es valida'
        });
    }
}

module.exports = {
    validarJWT
}