const { request, response } = require('express');
const PacienteModel = require('../models/paciente.model');

const getPacientes = async (req = request, resp = response) => {

    const pagina = Number(req.query.pagina) || 0;

    const [pacienteCollection, total] = await Promise.all([
        
        PacienteModel.find( {}, 'Guid nombre apellido email')
            .skip(pagina)
            .limit(10),

        PacienteModel.count()
    ]);

    resp.json({
        ok: true,
        pacienteCollection,
        total
    });
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
    postPaciente
}