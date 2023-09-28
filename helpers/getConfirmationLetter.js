
const path = require("path");
const fs = require("fs");
const { BASE_URL } = process.env;

const getConfirmationLetter = (user) => {
    const htmlFilePath = path.join(__dirname, "./../views/email/confirmation.html");

    let htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

    htmlContent = htmlContent
        .replace("%USER_NAME%", user.firstName)
        .replace("%VERIFICATION_LINK%", `${BASE_URL}/api/auth/verify/${user.verificationCode}`);

    return htmlContent
}

module.exports = getConfirmationLetter;


