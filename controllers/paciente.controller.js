const { request, response } = require('express');
const PacienteModel = require('../models/paciente.model');
const UsusarioModel = require('../models/ususario.model');

const getPacientes = async (req = request, resp = response) => {

    try {
        
        const pagina = Number(req.query.pagina) || 0;
    
        const [pacienteCollection, total] = await Promise.all([
    
            PacienteModel.find( { activo: true },
                'Guid nombre apellido tipoDocumento numeroDocumento fechaNacimiento genero tipoSangre telefono email direccion ciudad estado codigoPostal contactoEmergencia numeroSeguro alergias observaciones activo img')
                .select('nombre apellido numeroDocumento fechaNacimiento telefono email img')
                .populate('usuarioId', 'nombre email role')
                .skip(pagina)
                .limit(10),
    
            PacienteModel.countDocuments({ activo: true })
        ]);
    
        return resp.json({
            ok: true,
            pacienteCollection,
            total,
            pagina
        });

    } catch (error) {
        console.log(error);
        return resp.status(500).json({
            ok: false,
            message: 'Error al intentar obtener la lista de pacientes'
        });
    }
}

const getPacienteById = async (req = request, resp = response) => {

    const _guid = req.params.guid;

    try {
        const pacienteDB = await PacienteModel.findById(_guid)
            .populate('usuarioId', 'nombre email role');
        
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

const putPaciente = async (req = request, resp = response) => {

    const _guid = req.params.guid;

    try {

        const pacienteDB = await PacienteModel.findById(_guid);

        if(!pacienteDB){
            return resp.status(404).json({
                ok: false,
                message: 'Paciente no encontrado'
            });
        }

        // Extraemos los campos únicos y el usuarioId para validarlos
        const { numeroDocumento, email, usuarioId, ...campos } = req.body;

        // Preparar validaciones en paralelo
        const validaciones = [];

        // Solo validar numeroDocumento si cambió
        if(pacienteDB.numeroDocumento !== numeroDocumento) {
            validaciones.push(
                PacienteModel.findOne({ numeroDocumento, _id: { $ne: _guid } })
            );
        } else {
            validaciones.push(Promise.resolve(null));
        }

        // Solo validar email si cambió
        if(pacienteDB.email !== email) {
            validaciones.push(
                // Excluimos el paciente actual de la busqueda
                PacienteModel.findOne({ email, _id: { $ne: _guid } })
            );
        } else {
            validaciones.push(Promise.resolve(null));
        }

        // Validar que el usuario exista si cambió
        if(pacienteDB.usuarioId.toString() !== usuarioId) {
            validaciones.push(
                UsusarioModel.findById(usuarioId)
            );
        } else {
            validaciones.push(Promise.resolve(true)); // Usuario ya validado
        }

        // Ejecutar todas las validaciones en paralelo
        const [numeroDocumentoExiste, emailExiste, usuarioExistente] = await Promise.all(validaciones);

        if(numeroDocumentoExiste) {
            return resp.status(400).json({
                ok: false,
                message: 'El numero de documento ya esta siendo ocupado por otro paciente'
            });
        }

        if(emailExiste) {
            return resp.status(400).json({
                ok: false,
                message: 'El email ya esta siendo ocupado por otro paciente'
            });
        }

        if(!usuarioExistente) {
            return resp.status(404).json({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        }

        // Agregar los campos validados
        campos.numeroDocumento = numeroDocumento;
        campos.email = email;   
        campos.usuarioId = usuarioId;

        const pacienteDestino = await PacienteModel.findByIdAndUpdate(_guid, campos, { new: true })
            .populate('usuarioId', 'nombre email role');

        return resp.status(200).json({
            ok: true,
            message: 'Paciente actualizado',
            pacienteDestino
        });

    } catch (error) {

        console.log(error);
        resp.status(500).json({
            ok: false,
            message: 'Error al intentar actualizar al paciente'
        });
    }
}

const deletePaciente = async (req = request, resp = response) => {

    const _guid = req.params.guid;

    try {

        // Borrado lógico - marcar como inactivo
        const paciente = await PacienteModel.findByIdAndUpdate(
            _guid,
            { activo: false },
            { new: true }
        );

        if(!paciente) {
            return resp.status(404).json({
                ok: false,
                message: 'Paciente no encontrado'
            });
        }

        return resp.status(200).json({
            ok: true,
            message: 'Paciente eliminado correctamente',
            paciente: {
                _id: paciente._id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                activo: paciente.activo
            }
        });

    } catch (error) {

        console.log(error);

        if(error.name === 'CastError') {
            return resp.status(400).json({
                ok: false,
                message: 'ID de paciente inválido'
            });
        }

        resp.status(500).json({
            ok: false,
            message: 'Error al intentar eliminar paciente'
        });
    }
}

module.exports = {
    getPacientes,
    getPacienteById,
    postPaciente,
    putPaciente,
    deletePaciente
}