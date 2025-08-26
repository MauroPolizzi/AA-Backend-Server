const StrategieSearch = require('./strategie.search');
const MedicoModel = require('./../../models/medico.model');

class MedicoSearch extends StrategieSearch {
    async search(regExp) {
        return MedicoModel.find({ nombre: regExp }).populate('hospitalId', 'nombre');
    }
}

module.exports = MedicoSearch;