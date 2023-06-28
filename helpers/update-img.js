const fs = require('fs');
const HospitalModel = require("../models/hospital.model");
const MedicoModel = require('../models/medico.model');
const UsusarioModel = require('../models/ususario.model');

const updateImg = async (tabla, guid, nombreArchivo) => {
    
    switch (tabla) {
        case 'hospitales':
            await updateImgHospital(tabla, guid, nombreArchivo);
            break;
        
        case 'medicos':
            await updateImgMedico(tabla, guid, nombreArchivo);
            break;

        case 'usuarios':
            await updateImgUsuario(tabla, guid, nombreArchivo);
            break;
    }
}

const updateImgHospital = async (tabla, guid, nombreArchivo) => {
    
    const hospital = await HospitalModel.findById(guid);
    if(!hospital){
        return false;
    }

    // Eliminamos la img anterior si ya tiene una
    const pathAnterior = `./upload/${tabla}/${hospital.img}`;
    deleteImg(pathAnterior);

    // Seteamos el valor de la img
    hospital.img = nombreArchivo;
    await hospital.save();
    return true;
}

const updateImgMedico = async (tabla, guid, nombreArchivo) => {
    
    const medico = await MedicoModel.findById(guid);
    if(!medico){
        return false;
    }

    // Eliminamos la img anterior si ya tiene una
    const pathAnterior = `./upload/${tabla}/${medico.img}`;
    deleteImg(pathAnterior);

    // Seteamos el valor de la img
    medico.img = nombreArchivo;
    await medico.save();
    return true;
}

const updateImgUsuario = async (tabla, guid, nombreArchivo) => {
    
    const usuario = await UsusarioModel.findById(guid);
    if(!usuario){
        console.log('Usuario no encontrado', guid);
        return false;
    }

    // Eliminamos la img anterior si ya tiene una
    const pathAnterior = `./upload/${tabla}/${usuario.img}`;
    deleteImg(pathAnterior);

    // Seteamos el valor de la img
    usuario.img = nombreArchivo;
    await usuario.save();
    return true;
}

const deleteImg = (path) => {
    // Usamos la libreria de File System para verificar si existe
    // el directorio y luego eliminarlo
    if(fs.existsSync(path)){
        fs.unlinkSync(path);
    }
}

module.exports = {
    updateImg
}