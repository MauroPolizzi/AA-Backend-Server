const { Router } = require('express');
const { getPacientes, postPaciente, getPacienteById } = require('../controllers/paciente.controller');

const pacienteRouter = Router();

// Get 
pacienteRouter.get( '/', getPacientes );

// Get By Id
pacienteRouter.get('/:guid', getPacienteById );

// Post
pacienteRouter.post( '/', postPaciente );

module.exports = {
    pacienteRouter
}