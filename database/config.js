const mongoose = require('mongoose');

const dbConnection = async () => {

    try {
        
        await mongoose.connect(process.env.CONNECTION_BBDD, {
            // Estos atributos a partir de la v 6.0 de mongoose estan implicitos en el .connect
            //useNewUrlParser: true,
            //useUnifiedTopology: true,
            //useCreateIndex: true
        });

        console.log('BBDD Online.');

    } catch (error) {
        console.error(error);
        throw new Error('Error al intentar conectar la BBDD');
    }

}

module.exports = {
    dbConnection
}