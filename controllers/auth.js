const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const path = require("path");

const { User } = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail, getConfirmationLetter } = require("../helpers");

const { SECRET_KEY } = process.env;


const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationCode = nanoid();

    const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        avatarURL,
        verificationCode,
        verificationCodeCreated: Date.now(),
        verificationCodeExpires: Date.now() + 21600000,
    });

    const htmlContent = getConfirmationLetter(newUser)

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: htmlContent
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        firstName: newUser.firstName,
        userName: newUser.userName,
        email: newUser.email,
        avatarURL: newUser.avatarURL,
    })
}

const verifyEmail = async (req, res) => {
    const { verificationCode } = req.params;
    const user = await User.findOne({ verificationCode });
    if (!user) {
        const message = "Email not found"
        res.redirect(`/api/auth/verified_page?error=true&message=${message}`)
    }

    if (user.verificationCodeExpires < Date.now()) {
        await User.findByIdAndDelete(user._id);

        const message = "Link has expired. Please sing up again"
        res.redirect(`/api/auth/verified_page?error=true&message=${message}`)
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verificationCode: "" });
    res.sendFile(path.join(__dirname, "./../views/email/verified.html"))
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email not found");
    }
    if (user.verify) {
        throw HttpError(401, "Email already verify");
    }

    const htmlContent = getConfirmationLetter(user)

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: htmlContent
    };

    await sendEmail(verifyEmail);

    res.json({
        message: "Verify email send success"
    })
}

const showVerifyPage = async (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/email/verified.html"))
}

const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }

    if (!user.verify) {
        throw HttpError(401, "Email not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }

    const payload = {
        email,
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
        token,
        "user": {
            firstName: user.firstName,
            userName: user.userName,
            email: user.email,
            avatarURL: user.avatarURL,
        }
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
        message: "Logout success"
    })
}

module.exports = {
    register: ctrlWrapper(register),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    showVerifyPage: ctrlWrapper(showVerifyPage),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
}