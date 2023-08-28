const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");

const { User } = require("../models/user");
const cloudinary = require("../helpers/cloudinary");

const { HttpError, ctrlWrapper } = require("../helpers");

const { SECRET_KEY } = process.env;


const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

    res.status(201).json({
        firstName: newUser.firstName,
        userName: newUser.userName,
        email: newUser.email,
        avatarURL: newUser.avatarURL,
        
    })
}

const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }

    const payload = {
        id: user._id,
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

const getCurrent = async (req, res) => {
    const { email, avatarURL, } = req.user;

    res.json({
        email,
        avatarURL,
    })
}

const updateUser = async (req, res) => {
    const updateUserData = req.body;
    const { _id } = req.user;
    await User.findById({ _id });
    await User.findByIdAndUpdate(_id, updateUserData , { new: true });
   
    res.json(updateUserData);
}

const deleteUser = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndDelete(_id);
   
    res.json({
        message: "User deleted successfully"
    });
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
        message: "Logout success"
    })
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user;

    const options = {
        folder: `phonebook/userAvatar/${_id}`,
        resource_type: "auto",
    };

    cloudinary.uploader.upload_stream(options, async (error, result) => {
        if (error) {
            throw HttpError(500, "Upload failed");
        }
        const avatarURL = result.secure_url;

        if (!avatarURL) {
            throw HttpError(500, "Upload failed");
        }
        await User.findByIdAndUpdate(_id, { avatarURL });
        return res.status(200).json({ avatarURL });

    }).end(req.file.buffer);
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    updateUser: ctrlWrapper(updateUser),
    deleteUser: ctrlWrapper(deleteUser),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}