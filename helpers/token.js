const jwt = require('jsonwebtoken');

const generateJWT = ( guid ) => {

    // Hacemos que retorne una promise para poder trabajarlo
    // con el reject y resolves
    return new Promise( (resolves, reject) => {

        // Creamos el payload, que es lo que se grabara en el token
        const payload = {
            guid
        };


        // Como primer argumento el payload,
        // Segundo, la firma que tendran los tokens
        // Tercero, el tiempo activo que tendra, antes que exprire
        jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '12h'
        }, (err, token) => {
            
            if(err){
                console.log(err);
                reject('No se pudo generar el JWT');
            }else{
                // Devolvemos el token generado
                resolves(token);
            }
        });
    });
}

module.exports = {
    generateJWT
}