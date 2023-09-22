const { Watchlist } = require("../models/watchlist");

const { HttpError, ctrlWrapper } = require("../helpers");


const addCoin = async (req, res) => {
    const { _id: owner } = req.user;
    const result = await Watchlist.create({ ...req.body, owner });
    const coin = {
        coinId: result.coinId,
        name: result.name,
        owner: {
            _id: result.owner
        },
        id: result._id,
    };

    res.status(201).json(coin);
}


const getAllCoins = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const result = await Watchlist.find({ owner }, "-createdAt -updatedAt", { skip, limit }).populate("owner", "_id");
    res.json(result);
}

const deleteCoin = async (req, res) => {
    const { id } = req.params;
    const coinId = id;
    const result = await Watchlist.findOneAndRemove(coinId);
    if (!result) {
        throw HttpError(404, "Not found");
    }
    res.json({
        coinId,
        message: "Delete success"
    })
}


module.exports = {
    addCoin: ctrlWrapper(addCoin),
    getAllCoins: ctrlWrapper(getAllCoins),
    deleteCoin: ctrlWrapper(deleteCoin)
}