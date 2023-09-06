const express = require("express");

const ctrl = require("../../controllers/auth");

const { validateBody, authenticate, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();



router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.patch("/user", authenticate, validateBody(schemas.updateUserSchema), ctrl.updateUser);

router.patch("/update_password", authenticate, validateBody(schemas.updatePasswordSchema), ctrl.updatePassword);

router.delete("/user", authenticate, ctrl.deleteUser);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;