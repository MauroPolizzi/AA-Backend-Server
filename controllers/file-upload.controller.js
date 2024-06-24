const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const path  = require('path');
const fs = require('fs');
const { updateImg } = require('../helpers/update-img');

const fileUpload = async (req, res = response) => {

    const {tabla, guid} = req.params;
    const tablasValidas = ['hospitales', 'medicos', 'usuarios'];
    
    // Validamos que solo sean de esas tablas
    if(!tablasValidas.includes(tabla)){
        
        return res.status(400).json({
            ok: true,
            message: 'Tablas no encontrada'
        });        
    }

    // Validamos que venga un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No se subio ningún archivo'
        });
    }
    
    // Capturamos el archivo de la requiered
    const file = req.files.img;
    // separamos el nombre del archivo
    const nombreCortado = file.name.split('.');
    const extencionFile = nombreCortado[ nombreCortado.length - 1 ];

    // Validamos las extenciones permitidas
    const extencionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    
    if (!extencionesValidas.includes(extencionFile)) {
        return res.status(400).json({
            ok: false,
            message: 'Archivo no valido. Extención del archivo no soportada. Extenciones permitidas: png, jpg, jpeg, gif.'
        });
    }

    // Pasando las validaciones
    // Generamos el nombre del archivo con la biblioteca uuid
    const nombreArchivo = `${ uuidv4() }.${ extencionFile }`;

    // Colocamos el archivo en el directorio correspondiente
    const path = `./upload/${tabla}/${nombreArchivo}`;
  
    // Movemos el archivo (codigo de la documentacion)
    // Use the mv() method to place the file somewhere on your server
    file.mv(path, (err) => {
        if (err){
            console.log(err);
            return res.status(500).json({
                ok: false,
                message: 'Error al guardar el archivo'
            });
        }

        // Actualizamos la BBDD con el archivo
        updateImg(tabla, guid, nombreArchivo);

        res.status(200).json({
            ok: true,
            message: 'Archivo guardado',
            nombreArchivo
        });
    });

}

const getFileUploadImg = (req, res = response) => {

    const {tabla, img} = req.params;
    
    // Construimos el path de donde esta la img
    const pathImg = path.join(__dirname, `../upload/${tabla}/${img}`);

    // devolvemos la img si existe el directorio, en caso contrario una img por defecto
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    }else{
        res.sendFile(path.join(__dirname, `../upload/no-img.jpg`));
    }
}

module.exports = {
    fileUpload,
    getFileUploadImg
}