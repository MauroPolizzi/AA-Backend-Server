const { request, response } = require('express');
const PacienteModel = require('../models/paciente.model');

const getPacientes = async (req = request, resp = response) => {

    const pagina = Number(req.query.pagina) || 0;

    const [pacienteCollection, total] = await Promise.all([
        
        PacienteModel.find( {}, 
            'Guid nombre apellido tipoDocumento numeroDocumento fechaNacimiento genero tipoSangre telefono email direccion ciudad estado codigoPostal contactoEmergencia numeroSeguro alergias observaciones usuarioId activo img')
            .skip(pagina)
            .limit(10),

        PacienteModel.count()
    ]);

    resp.json({
        ok: true,
        pacienteCollection,
        total,
        pagina
    });
}

const getPacienteById = async (req = request, resp = response) => {

    const _guid = req.params.guid;

    try {
        const pacienteDB = await PacienteModel.findById(_guid);
        
        if (!pacienteDB) {
            return resp.status(404).json({
                ok: false,
                message: 'Paciente no encontrado'
            });
        }

        resp.status(200).json({
            ok: true,
            paciente: pacienteDB
        });

    } catch (error) {
        
        console.log(error);
        resp.status(500).json({
            ok: false,
            message: 'Error al intentar encontrar paciente'
        });
    }
}

const postPaciente = async (req = request, resp = response) => {

    try {
        const pacienteDestino = new PacienteModel( req.body );
        
        await pacienteDestino.save();

        resp.status(201).json({
            ok: true,
            message: 'Paciente creado',
            pacienteDestino
        });

    } catch (error) {
        console.log(error);

        resp.status(500).json({
            ok: false,
            message: 'Error al intentar crear Paciente'
        });
    }

}

module.exports = {
    getPacientes,
    getPacienteById,
    postPaciente
}