const { response, request } = require("express");

const HospitalModel = require("../models/hospital.model");
const MedicoModel = require("../models/medico.model");
const UsusarioModel = require("../models/ususario.model");

const HospitalSearch = require("../strategies/search/hospital.search");
const MedicoSearch = require("../strategies/search/medico.search");
const UsuarioSearch = require("../strategies/search/usuario.search");

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

const strategies = {
    hospital: new HospitalSearch(),
    medico: new MedicoSearch(),
    usuario: new UsuarioSearch()
}

const getAllByCollection = async (req = request, res = response) => {
    
    const {tabla, search} = req.params;
    const regExp = new RegExp(search ,'i');

    // Obtenemos la entidad a buscar que se representa con el nombre ed tabla
    const strategie = strategies[tabla];

    if(!strategie) {
        return res.status(400).json({
            ok: false,
            message: 'Tabla no encontrada'
        });
    }

    try {
        // Ejecutamos el metodo de busqueda segun la estrategia
        const data = await strategie.search(regExp);
        res.status(200).json({ ok: true, data });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error en la búsqueda. ' + err.message });
    }
}

module.exports = {
    getAll,
    getAllByCollection
}