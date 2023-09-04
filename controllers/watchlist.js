const { Watchlist } = require("../models/watchlist");

const { HttpError, ctrlWrapper } = require("../helpers");


const addCoin = async (req, res) => {
    const { _id: owner } = req.user;
    const result = await Watchlist.create({ ...req.body, owner });
    res.status(201).json(result);
}


const getAllCoins = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const result = await Watchlist.find({ owner }, "-createdAt -updatedAt", { skip, limit }).populate("owner", "name");
    res.json(result);
}

const deleteCoin = async (req, res) => {
    const { id } = req.params;
    const result = await Watchlist.findByIdAndRemove(id);
    if (!result) {
        throw HttpError(404, "Not found");
    }
    res.json({
        id,
        message: "Delete success"
    })
}


module.exports = {
    addCoin: ctrlWrapper(addCoin),
    getAllCoins: ctrlWrapper(getAllCoins),
    deleteCoin: ctrlWrapper(deleteCoin)
}