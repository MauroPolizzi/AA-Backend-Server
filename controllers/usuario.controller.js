
const { response } = require('express');
const bcrypt = require('bcryptjs') 
const UsusarioModel = require('../models/ususario.model');
const { generateJWT } = require('../helpers/token');

const getUsuarios = async (req, res) => {

    // Obtenemos el valor del query params que vendra como 'pagina', y transformamos su valor en numero
    const pagina = Number(req.query.pagina) || 0;

    // Usamos una Promise.all que ejecuta en simultaneo varias promesas
    // y devuelve un array de resultados, segun el orden que las ejecuta
    // en este caso el 'ususarioCollection' tendra el valor de la priemra
    // y 'total' de la segunda
    // usamos desestructuracion para sacar los resultados que queremos, para
    // luego mostrarlos en la respuesta
    const [usuarioCollection, total] = await Promise.all([

        UsusarioModel.find( {}, 'Guid nombre email img role google')
            .skip(pagina)
            .limit(5),

        UsusarioModel.count()
    ]);

    res.json({
        ok: true,
        usuarioCollection,
        total
    });
}

const postUsuario = async (req, res = response) => {
    
    // Desestructuramos la requiure que viene del front
    const { email, password } = req.body;

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
        const usuarioDestino = new UsusarioModel( req.body );

        // Generamos un salt para encriptar
        const salt = bcrypt.genSaltSync();
        // Realizamos el hash de la password, y mandamos el salt
        usuarioDestino.password = bcrypt.hashSync(password, salt);

        // Generamos un token con el _id generado por mongoose
        const token = await generateJWT(usuarioDestino._id);

        // Grabamos en BBDD
        await usuarioDestino.save();

        // Buscamos el usuario quien lo creo
        const createdByUser = await UsusarioModel.findById(req.guid);

        // Devolvemos la respuesta
        res.json({
            ok: true,
            message: 'Ususario creado',
            usuarioDestino,
            token,
            createdByUser
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
        const usuarioDestino = await UsusarioModel.findByIdAndUpdate(_guid, campos, { new: true });

        // Devolvemos la respuesta
        res.status(200).json({
            ok: true,
            message: 'Usuario actualizado!',
            usuarioDestino,
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
            message: 'Error al intentar eliminar el usuario'
        });
    }
} 

module.exports = {
    getUsuarios,
    postUsuario,
    putUsuario,
    deleteUsuario
}