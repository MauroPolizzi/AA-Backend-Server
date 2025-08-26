const StrategieSearch = require('./strategie.search');
const HospitalModel = require('./../../models/hospital.model');

class HospitalSearch extends StrategieSearch {
    async search(regExp) {
        return HospitalModel.find({ nombre: regExp }).populate('ususarioCreador', 'nombre');
    }
}

module.exports = HospitalSearch;