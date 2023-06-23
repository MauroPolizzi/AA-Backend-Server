
const { response } = require('express');
const bcrypt = require('bcryptjs') 
const UsusarioModel = require('../models/ususario.model');
const { generateJWT } = require('../helpers/token');

const getUsuarios = async (req, res) => {

    const ususarioCollection = await UsusarioModel.find( {}, 'Guid nombre email role google');

    res.json({
        ok: true,
        ususarioCollection,
        GetBy: req.guid
    });
}

const postUsuario = async (req, res = response) => {
    
    // Desestructuramos la requiure que viene del front
    const { email, password, nombre } = req.body;

    try {
        
        // Filtramos por el email que nos mandan
        const existe = await UsusarioModel.findOne({email});

        // Validamos
        if(existe){
            return res.status(400).json({
                ok: false,
                message: 'El email ya esta registrado'
            });
        }

        // Si llegamos aqui, podemos crear el usuario
        // Realizamos una instancia de UsuarioModel
        const ususarioDestino = new UsusarioModel( req.body );

        // Generamos un salt para encriptar
        const salt = bcrypt.genSaltSync();
        // Realizamos el hash de la password, y mandamos el salt
        ususarioDestino.password = bcrypt.hashSync(password, salt);

        // Generamos un token con el _id generado por mongoose
        const token = await generateJWT(ususarioDestino._id);

        // Grabamos en BBDD
        await ususarioDestino.save();

        // Devolvemos la respuesta
        res.json({
            ok: true,
            message: 'Ususario creado',
            ususarioDestino,
            token,
            createdBy: req.guid
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: 'Error al intentar crear Usuario'
        });
    }
}

const putUsuario = async (req, res = response) => {

    // Recuperamos el Guid desde la url
    const _guid = req.params.guid;

    try {

        const usuarioDB = await UsusarioModel.findById(_guid);

        if(!usuarioDB){
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }

        // Actualizamos el Usuario
        // Extraemos los campos que no vamos a mandar
        const {password, google, email, ...campos} = req.body;

        // Si el Email de la req es distinto al que tenemos en BBDD, actualizamos el campo
        if(usuarioDB.email !== email){
            // Verificamos que el mail nuevo no coincida con alguno que tengamos en BBDD
            const existeEmail = await UsusarioModel.findOne({ email });
            if(existeEmail){
                return res.status(400).json({
                    ok: false,
                    message: 'El Email que desea proporcinar, ya esta siendo ocupado por otro Usuario'
                });
            }
        }

        // Mandamos el email
        campos.email = email;

        // Buscamos y actualizamos (persiste en BBDD)
        const ususarioDestino = await UsusarioModel.findByIdAndUpdate(_guid, campos, { new: true });

        // Devolvemos la respuesta
        res.status(200).json({
            ok: true,
            message: 'Usuario actualizado!',
            ususarioDestino,
            modifiedBy: req.guid
        });

    } catch (error) {
        
        console.log(error);
        
        res.status(500).json({
            ok: false,
            message: 'Error al intentar actualizar el ususario'
        });
    }
}

const deleteUsuario = async (req, res = response) => {
    
    // Recuperamos el Guid de la url
    const _guid = req.params.guid;

    try {
        
        // Verificamos que exista el ususario
        const ususarioDB = await UsusarioModel.findById(_guid);

        if(!ususarioDB){
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminamos el ususario
        await UsusarioModel.findByIdAndDelete(_guid);

        res.status(200).json({
            ok: true,
            message: 'Usuario eliminado.',
            _guid,
            removedBy: req.guid
        });

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            ok: false,
            message: 'Error al intentar eliminar el ususario'
        });
    }
} 

module.exports = {
    getUsuarios,
    postUsuario,
    putUsuario,
    deleteUsuario
}