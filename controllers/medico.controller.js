const { response } = require("express");
const MedicoModel = require("../models/medico.model");

const getMedicos = async (req, res = response) => {

    // Obtenemos la paginacion desde la solicitud
    const pagina = Number(req.query.pagina) || 0;

    const [medicoCollection, total] = await Promise.all([

        MedicoModel.find( {}, 'Guid nombre especialidad img' )
            .populate('usuarioId', 'nombre')
            .populate('hospitalId', 'nombre')
            .skip(pagina)
            .limit(10),

        MedicoModel.count()
    ]);

    res.status(200).json({
        ok: true,
        medicoCollection,
        total
    });
}

const getMedicoById = async (req, res = response) => {
    
    const _guid = req.params.guid;

    try {
        const medicoDB = await MedicoModel.findById(_guid);

        if(!medicoDB) {
            return res.status(404).json({
                ok: false,
                message: 'Medico no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoDB
        });
    
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error al intentar encontrar medico'
        });
    }
}

const postMedico = async (req, res = response) => {

    try {

        // Creamos el medico
        const medicoDestino = new MedicoModel( { usuarioId: req.guid, ...req.body } );

        await medicoDestino.save();

        res.status(200).json({
            ok: true,
            message: 'Medico creado',
            medicoDestino
        });   

    } catch (error) {
        
        console.log(error);
        
        res.status(500).json({
            ok: false,
            message: 'Error al intentar crear Medico'
        });
    }
}

const putMedico = async (req, res = response) => {

    const _guid = req.params.guid;

    try {
        
        const medicoDB = await MedicoModel.findById(_guid); 

        if(!medicoDB){
            return res.status(404).json({
                ok: false,
                message: 'Medico no encontrado'
            });
        }

        const { nombre, ...campos } = req.body;

        if (medicoDB.nombre !== nombre) {
            const nombreExiste = await MedicoModel.findOne({ nombre });
            if (nombreExiste) {
                return res.status(400).json({
                    ok: false,
                    message: 'El Nombre que desea proporcinar, ya esta siendo ocupado por otro Medico'
                });
            }
        }

        campos.nombre = nombre;

        const medicoDestino = await MedicoModel.findByIdAndUpdate(_guid, campos, { new: true });

        res.status(200).json({
            ok: true,
            message: 'Medico actualizado',
            medicoDestino
        });

    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error al intentar actualizar medico'
        });
    }
}

const deleteMedico = async (req, res = response) => {

    // Recuperamos el Guid de la url
    const _guid = req.params.guid;

    try {
        
        // Verificamos que exista el ususario
        const medicoDB = await MedicoModel.findById(_guid);

        if(!medicoDB){
            return res.status(404).json({
                ok: false,
                message: 'Medico no encontrado'
            });
        }

        // Eliminamos el ususario
        await MedicoModel.findByIdAndDelete(_guid);

        res.status(200).json({
            ok: true,
            message: 'Medico eliminado.',
            _guid,
            removedBy: req.guid
        });

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            ok: false,
            message: 'Error al intentar eliminar el medico'
        });
    }
}

module.exports = {
    getMedicos,
    getMedicoById,
    postMedico,
    putMedico,
    deleteMedico
}