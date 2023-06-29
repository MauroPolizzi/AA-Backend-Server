const { response } = require("express");
const bcrypt = require('bcryptjs');
const UsusarioModel = require('../models/ususario.model');
const { generateJWT } = require("../helpers/token");
const { googleVerifyTOKEN } = require("../helpers/google-verify");

const login = async (req, res = response) => {

    try {

        // Desestructuramos la request
        const { email, password } = req.body;
        // Filtramos por email
        const ususarioDB = await UsusarioModel.findOne({ email });

        // Verificamos que exista
        if(!ususarioDB){
            return res.status(404).json({
                ok: false,
                message: 'Email no encontrado'
            });
        }

        // Comparamos la pass que paso el ususario con la encriptada en BBDD
        const validarPassword = bcrypt.compareSync(password, ususarioDB.password);
        
        // Si no es valida devolvemos Bad Request
        if(!validarPassword){
            return res.status(400).json({
                ok: false,
                message: 'Email o password incorrectos'
            });
        }

        // Aqui generamos el TOKEN - JWT
        // pasamos el _id, porque es el nombre del campo en BBDD
        // En el resto de la app lo usamos como Guid
        // En jwt.io me devuelve el payload con el campo guid, que es el guid del objeto que 
        // esta generando el token
        const token = await generateJWT(ususarioDB._id);

        // Devolvemos la respuesta con el TOKEN
        res.status(200).json({
            ok: true,
            message: 'Login successfull',
            token
        });

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            ok: false,
            message: 'Error al intentar ingresar'
        });
    }
}

const googleSingIn = async (req, res = response) => {

    try {
        
        // Mandamos el token que nos genera el boton de google
        const userAuth = await googleVerifyTOKEN(req.body.token);
        const { name, email, picture } = userAuth;

        const usuarioDB = await UsusarioModel.findOne({email});
        let usuarioDestino;

        // Generamos un nuevo usuario si no existe
        if (!usuarioDB) {
            usuarioDestino = new UsusarioModel({
                nombre: name,
                email,
                password: '@@@', // Esto es solo para que no choque con la validacion de passwprd
                img: picture,
                google: true
            });
        
        // Si existe el user, lo igualamos al que ya tenemos en BBDD
        }else{
            usuarioDestino = usuarioDB;
            usuarioDestino.google = true;
        }

        // Guardamos el user en BBDD
        await usuarioDestino.save();

        // Generamos su token del backend
        const token = await generateJWT(usuarioDestino._id);

        // Devolvemos la respons
        res.status(200).json({
            ok: true,
            userAuth,
            tokenServer: token
        })

    } catch (error) {
        
        console.log(error);
        res.status(400).json({
            ok: false,
            message: 'El token de Google incorrecto'
        })
    }

}

module.exports = {
    login,
    googleSingIn
}