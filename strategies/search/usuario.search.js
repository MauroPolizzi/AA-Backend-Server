const StrategieSearch = require('./strategie.search');
const UsusarioModel = require('./../../models/ususario.model');

class UsuarioSearch extends StrategieSearch {
    async search(regExp) {
        return UsusarioModel.find({ nombre: regExp });
    }
}

module.exports = UsuarioSearch;