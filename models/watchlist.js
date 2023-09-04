
const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const watchlistSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    coinId: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }
}, { versionKey: false, timestamps: true });

watchlistSchema.post("save", handleMongooseError);

const addSchema = Joi.object({
    name: Joi.string()
        .required(),
    coinId: Joi.string().required()
})

const schemas = {
    addSchema,
}

const Watchlist = model("watchlist", watchlistSchema);

module.exports = {
    Watchlist,
    schemas
}