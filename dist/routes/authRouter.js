"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authCtrl_1 = __importDefault(require("../controllers/authCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const valid_1 = require("../middleware/valid");
const router = express_1.default.Router();
router.post("/register", valid_1.validRegister, authCtrl_1.default.register);
router.post("/login", authCtrl_1.default.login);
router.post("/active", authCtrl_1.default.activeAccount);
router.get("/logout", authUser_1.default, authCtrl_1.default.logout);
router.get("/refresh_token", authCtrl_1.default.refreshToken);
router.post("/google_login", authCtrl_1.default.googleAccount);
router.post("/facebook_login", authCtrl_1.default.facebookAccount);
router.post("/login_sms", authCtrl_1.default.loginSmsAccount);
router.post("/verify_sms", authCtrl_1.default.verifySmsAccount);
router.post("/forgot_password", authCtrl_1.default.forgotPasswordAccount);
exports.default = router;
