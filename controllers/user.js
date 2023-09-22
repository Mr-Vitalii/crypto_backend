const bcrypt = require("bcrypt");


const { User } = require("../models/user");
const cloudinary = require("../helpers/cloudinary");

const { HttpError, ctrlWrapper } = require("../helpers");



const getCurrent = async (req, res) => {
    const { email } = req.user;
    const user = await User.findOne({ email });
    res.json({
        firstName: user.firstName,
        userName: user.userName,
        email: user.email,
        avatarURL: user.avatarURL,
    })
}

const updateUser = async (req, res) => {
    const updateUserData = req.body;
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, updateUserData, { new: true });

    res.json({
        firstName: user.firstName,
        userName: user.userName,
        email: user.email,
        avatarURL: user.avatarURL,
    })
}

const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { _id } = req.user;
    const user = await User.findById({ _id });
    const passwordCompare = await bcrypt.compare(oldPassword, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Invalid data");
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const data = {
        password: hashPassword
    }

    await User.findByIdAndUpdate(_id, data, { new: true });

    res.status(200).json({
        message: "Password updated"
    });
}

const deleteUser = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndDelete(_id);

    res.json({
        message: "User deleted successfully"
    });
}


const updateAvatar = async (req, res) => {
    const { _id } = req.user;

    const options = {
        folder: `crypto/userAvatar/${_id}`,
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
    getCurrent: ctrlWrapper(getCurrent),
    updateUser: ctrlWrapper(updateUser),
    updatePassword: ctrlWrapper(updatePassword),
    deleteUser: ctrlWrapper(deleteUser),
    updateAvatar: ctrlWrapper(updateAvatar),
}