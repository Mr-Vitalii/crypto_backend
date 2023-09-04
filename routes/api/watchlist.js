
const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/watchlist");

const { validateBody, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/watchlist");


router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addCoin);

router.get("/", authenticate, ctrl.getAllCoins);

router.delete("/:id", authenticate, ctrl.deleteCoin);


module.exports = router;