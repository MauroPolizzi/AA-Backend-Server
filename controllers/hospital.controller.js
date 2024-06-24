const { response } = require("express");
const HospitalModel = require("../models/hospital.model");
const UsusarioModel = require("../models/ususario.model");

const getHospital = async (req, res = response) => {

    const pagina = Number(req.query.pagina) || 0;

    // Con el populate devolvemos el objeto con el que esta referenciado en el modelo,
    // en este caso es el ususarioCreador (nombre del campo del modelo), y sacamos el nombre del usuario
    const [hospitalCollection, total] = await Promise.all([

        HospitalModel.find()
        .populate('ususarioCreador', 'nombre')
        .skip(pagina)
        .limit(10),

        HospitalModel.count()
    ]);

    res.status(200).json({
        ok: true,
        hospitalCollection,
        total
    });
}

const postHospital = async (req, res = response) => {

    try {

        const usuario = await UsusarioModel.findById(req.guid);
        // Obtenemos el guid del ususario quien crea el hospital de la requiered
        // Esto ya viene del middleware de validacion de token
        // el campo de 'ususarioCreador' de HospitalModel es requerido, por lo que lo seteamos 
        // al mandarlo por params
        const hospitalDestino = new HospitalModel( {ususarioCreador: req.guid, ...req.body} );

        await hospitalDestino.save();

        res.status(200).json({
            ok: true,
            message: 'Hospital creado',
            hospitalDestino,
            createdBy: usuario.nombre
        });
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error al intentar crear Hospital'
        })
    }
}

const putHospital = async (req, res = response) => {

    const _guid = req.params.guid;

    try {
        
        const hospitalDB = await HospitalModel.findById(_guid);

        if (!hospitalDB) {
            return res.status(404).json({
                ok: false,
                message: 'Hospital no encontrado'
            });
        }

        const { nombre, ...campos} = req.body;

        if(hospitalDB.nombre !== nombre){
            const nombreExiste = await HospitalModel.findOne({ nombre });
            if (nombreExiste) {
                return res.status(400).json({
                    ok: false,
                    message: 'El Nombre que desea proporcinar, ya esta siendo ocupado por otro Hospital'
                }); 
            }

            campos.nombre = nombre;

            const hospitalDestino = await HospitalModel.findByIdAndUpdate(_guid, campos, { new: true });

            res.status(200).json({
                ok: true,
                message: 'Hospital actualizado',
                hospitalDestino
            });
        }

    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error al intentar actualizar el hospital'
        });
    }
}

const deleteHospital = async (req, res = response) => {

   // Recuperamos el Guid de la url
   const _guid = req.params.guid;

   try {
       
       // Verificamos que exista el hospital
       const hospitalDB = await HospitalModel.findById(_guid);

       if(!hospitalDB){
           return res.status(404).json({
               ok: false,
               message: 'Hospital no encontrado'
           });
       }

       // Eliminamos el ususario
       await HospitalModel.findByIdAndDelete(_guid);

       res.status(200).json({
           ok: true,
           message: 'Hospital eliminado.',
           _guid,
           removedBy: req.guid
       });

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            ok: false,
            message: 'Error al intentar eliminar el hospital'
        });
    }
}

module.exports = {
    getHospital,
    postHospital,
    putHospital,
    deleteHospital
}