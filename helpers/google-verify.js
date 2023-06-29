
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_ID_SECRET_CLIENT); // Especificamos el Id secret

async function googleVerifyTOKEN( token ) {
    // Llamamos a la funcion propia de la libreria de google-auth-library
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //console.log({payload});
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return payload;
}

module.exports = {
    googleVerifyTOKEN
}