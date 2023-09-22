const express = require("express");

const ctrl = require("../../controllers/user");

const { validateBody, authenticate, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();


router.get("/current", authenticate, ctrl.getCurrent);

router.patch("/update_user", authenticate, validateBody(schemas.updateUserSchema), ctrl.updateUser);

router.patch("/update_password", authenticate, validateBody(schemas.updatePasswordSchema), ctrl.updatePassword);

router.delete("/delete_user", authenticate, ctrl.deleteUser);

router.patch("/update_avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;