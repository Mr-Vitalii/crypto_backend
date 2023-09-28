const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        match: emailRegexp,
        unique: true,
        required: [true, 'Email is required'],
    },
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    token: {
        type: String,
        default: ""
    },
    avatarURL: {
        type: String,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        default: "",
    },
    verificationCodeCreated: {
        type: Date,
        default: "",
    },
    verificationCodeExpires: {
        type: Date,
        default: "",
    }
}, { versionKey: false, timestamps: true });

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
    firstName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

const emailSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
})

const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

const updateUserSchema = Joi.object({
    firstName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
})

const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
})


const schemas = {
    registerSchema,
    emailSchema,
    loginSchema,
    updateUserSchema,
    updatePasswordSchema
}

const User = model("user", userSchema);

module.exports = {
    User,
    schemas,
}