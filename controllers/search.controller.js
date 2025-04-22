const { response } = require("express");
const UsusarioModel = require("../models/ususario.model");
const MedicoModel = require("../models/medico.model");
const HospitalModel = require("../models/hospital.model");

const getAll = async (req, res= response) => {

    const search = req.params.search;
    
    // realizamos una exprecion regular, el segundo parametro me indica las flag que tendra,
    // en este caso es una busqueda insensible, esto quiere decir que NO debemos de escribir
    // exactamente igual a como esta en BBDD
    const regExp = new RegExp(search, 'i');

    const [usuarioCollection, medicosCollection, hospitalCollection] = 
        await Promise.all([
        
        UsusarioModel.find({ nombre: regExp }),
        MedicoModel.find({ nombre: regExp }),
        HospitalModel.find({ nombre: regExp })
    ]);

    res.status(200).json({
        ok: true,
        usuarios: usuarioCollection,
        medicos: medicosCollection,
        hospitales: hospitalCollection
    });
}

const getAllByCollection = async (req, res = response) => {
    
    const tabla = req.params.tabla;
    const search = req.params.search;
    const regExp = new RegExp(search ,'i');

    let data = [];
    
    switch (tabla) {
        case 'hospital':
            data = await HospitalModel.find({ nombre: regExp }).populate('ususarioCreador', 'nombre');
            break;
        case 'medico':
            data = await MedicoModel.find({ nombre: regExp }).populate('hospitalId', 'nombre');
            break;
        case 'usuario':
            data = await UsusarioModel.find({ nombre: regExp });
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Tabla no encontrada'
            });
    }

    res.status(200).json({
        ok: true,
        data
    });
}

module.exports = {
    getAll,
    getAllByCollection
}