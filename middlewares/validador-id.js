const { request, response } = require('express');
const mongoose = require('mongoose');

const validarIdMongo = (req = request, resp = response, next) => {

    const id = req.params.guid;

    // Validar que el ID no sea vacío, null o undefined
    if (!id || id.trim() === '') {
        return resp.status(400).json({
            ok: false,
            message: 'El ID es requerido'
        });
    }

    // Validar si es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return resp.status(400).json({
            ok: false,
            message: 'ID de MongoDB inválido'
        });
    }

    next();
}

module.exports = {
    validarIdMongo
}