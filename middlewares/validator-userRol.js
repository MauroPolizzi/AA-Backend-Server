const { response } = require("express");
const UsuarioModel  = require("../models/ususario.model");

const validarADMIN_ROL = async (req, res = response, next) => {
    
    // Leemos el id del usuario (que realizará la acción) desde los headers
    const guidUser = req.guid;
    // Leemos el id del usuario al cual se le ejecutará una acción
    const guiduserToModified = req.params.guid;

    try {

        // Buscamos el usuario en BBDD
        const usuarioBBDD = await UsuarioModel.findById(guidUser);

        // Si no existe, devolvemos mensaje
        if(!usuarioBBDD){
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Verificamos si poseé un rol de admin para realizar cualqueir accion que lo requiera
        // Tambien verificamos si es el usuario que realiza la acción la realiza sobre si mismo
        if(usuarioBBDD.role !== 'ADMIN_ROLE' && guidUser !== guiduserToModified){
            return res.status(403).json({
                ok: false,
                message: 'El usuario no poseé autorización para realizar la acción'
            });
        }
        
        // Ejecutamos el proceso
        next();

    } catch (error) {
        
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error al realizar la acción'
        });
    }
}

module.exports = {
    validarADMIN_ROL
}