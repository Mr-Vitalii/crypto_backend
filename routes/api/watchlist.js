
const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/watchlist");

const { validateBody, isValidId, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/watchlist");


router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addAsset);

router.get("/", authenticate, ctrl.getAll);

router.delete("/:id", authenticate, ctrl.deleteAsset);


module.exports = router;