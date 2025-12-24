const { Router } = require('express');
const { getPacientes, postPaciente } = require('../controllers/paciente.controller');

const pacienteRouter = Router();

// Get 
pacienteRouter.get( '/', getPacientes );

// Post
pacienteRouter.post( '/', postPaciente );

module.exports = {
    pacienteRouter
}