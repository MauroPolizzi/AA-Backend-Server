const { request, response } = require('express');
const PacienteModel = require('../models/paciente.model');
const UsusarioModel = require('../models/ususario.model');

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

        const { numeroDocumento, email, usuarioId } = req.body;

        // Verificar ambos campos que deben ser unicos por paciente en paralelo
        // Tambien que exista el usuario
        const [pacienteNumeroDocumento, pacienteEmail, usuarioExistente] = await Promise.all([
            PacienteModel.findOne({numeroDocumento}),
            PacienteModel.findOne({email}),
            UsusarioModel.findById(usuarioId)
        ]);

        if(pacienteNumeroDocumento) {
            return resp.status(400).json({
                ok: false,
                message: 'El numero de documento ya esta registrado en otro paciente'
            });
        }

        if(pacienteEmail) {
            return resp.status(400).json({
                ok: false,
                message: 'El email ya esta registrado en otro paciente'
            });
        }

        if(!usuarioExistente) {
            return resp.status(404).json({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        }

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