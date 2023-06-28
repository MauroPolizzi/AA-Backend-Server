const { Router } = require("express");
const { validarJWT } = require("../middlewares/validator-token");
const { getAll, getAllByCollection } = require("../controllers/search.controller");

const searchRouter = Router();

searchRouter.get('/:search', [validarJWT], getAll);

searchRouter.get('/:tabla/:search', [validarJWT], getAllByCollection);

module.exports = {
    searchRouter
}