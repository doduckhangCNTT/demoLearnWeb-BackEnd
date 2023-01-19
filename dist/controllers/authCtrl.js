"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken_1 = require("../config/generateToken");
const valid_1 = require("../middleware/valid");
const sendMail_1 = __importDefault(require("../config/sendMail"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const node_fetch_1 = __importDefault(require("node-fetch"));
const sendSMS_1 = require("../config/sendSMS");
const client = new google_auth_library_1.OAuth2Client(process.env.MAIL_CLIENT_ID);
const authCtrl = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, account, password } = req.body;
            if (!name || !account || !password) {
                return res.json({ success: false, msg: "Invalid information" });
            }
            const user = yield userModel_1.default.findOne({ account });
            if (user) {
                return res.json({ success: false, msg: "User already exists" });
            }
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const newUser = { name, account, password: passwordHash };
            // Tao accesstoken
            const access_token = (0, generateToken_1.generateActiveToken)({ newUser });
            const url = `${process.env.BASE_URL}/active/${access_token}`;
            // Check register with pass or phone
            // console.log("ValidEmail: ", validEmail(account));
            if ((0, valid_1.validEmail)(account)) {
                (0, sendMail_1.default)(account, url, "Verify your email");
                return res.json({
                    success: true,
                    access_token,
                    msg: "Please check your email.",
                });
            }
            else if ((0, valid_1.validPhone)(account)) {
                (0, sendSMS_1.sendSms)(account, url, " Access Learn Web ");
                return res.json({
                    success: true,
                    access_token,
                    msg: "Please check your phone.",
                });
            }
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { account, password } = req.body;
            if (!account || !password) {
                return res.json({ success: false, msg: "Invalid information" });
            }
            if (!(0, valid_1.validEmail)(account)) {
                return res.json({ success: false, msg: "Email incorrect format" });
            }
            const user = yield userModel_1.default.findOne({ account });
            if (!user) {
                return res.json({ success: false, msg: "User not found" });
            }
            loginUser(user, password, res);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 11" });
        try {
            res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
            yield userModel_1.default.findOneAndUpdate({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, { rf_token: "" });
            res.json({ success: true, msg: "Logged out" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) {
                return res.json({
                    success: false,
                    msg: "You need Login or Register to watch courses, quickTest ...",
                });
            }
            const decoded = (jsonwebtoken_1.default.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`));
            if (!decoded.id) {
                return res
                    .status(400)
                    .json({ success: false, msg: "You need Login or Register 2" });
            }
            const user = yield userModel_1.default.findById(decoded.id).select("-password +rf_token");
            if (!user) {
                return res.status(400).json({ success: false, msg: "User not found" });
            }
            // if (rf_token !== user.rf_token) {
            //   return res
            //     .status(400)
            //     .json({ success: false, msg: "You need Login or Register 3" });
            // }
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
            yield userModel_1.default.findOneAndUpdate({ _id: user._id }, { rf_token: refresh_token });
            res.json({
                success: true,
                msg: "Refresh token was successfully",
                user,
                access_token,
                refresh_token,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    activeAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { active_token } = req.body;
            const decoded = (jsonwebtoken_1.default.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`));
            const { newUser } = decoded;
            // console.log("Decoded: ", decoded);
            if (!newUser) {
                console.log("IV");
                return res
                    .status(400)
                    .json({ success: false, msg: "Invalid Authentication 12" });
            }
            const user = yield userModel_1.default.findOne({ account: newUser.account });
            if (user) {
                return res
                    .status(400)
                    .json({ success: false, msg: "User already exists" });
            }
            const new_user = new userModel_1.default(newUser);
            yield new_user.save();
            res.json({ success: true, msg: "Register successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    googleAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            const verify = yield client.verifyIdToken({
                idToken: token,
                audience: process.env.MAIL_CLIENT_ID,
            });
            console.log({ verify });
            const { email, email_verified, name, picture } = (verify === null || verify === void 0 ? void 0 : verify.getPayload());
            console.log({ email, email_verified, name, picture });
            if (!email_verified)
                return res.status(400).json({ msg: "Email is not verified" });
            const password = email + "You secret your account";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: email });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const newUser = {
                    name,
                    account: email,
                    password: passwordHash,
                    avatar: picture,
                    type: "google",
                };
                registerUser(newUser, res);
            }
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    facebookAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userID, accessToken } = req.body;
            // truy cập để lấy path https://developers.facebook.com/docs/graph-api/overview/
            const URL = `https://graph.facebook.com/v4.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
            const data = yield (0, node_fetch_1.default)(URL)
                .then((res) => res.json())
                .then((res) => {
                return res;
            });
            const { email, name, picture } = data;
            const avatar = picture.data.url;
            const password = email + "You secret your account";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: email });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const newUser = {
                    name,
                    account: email,
                    password: passwordHash,
                    avatar,
                    type: "facebook",
                };
                registerUser(newUser, res);
            }
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    loginSmsAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { phone } = req.body;
            const data = yield (0, sendSMS_1.smsOTP)(phone, "sms");
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    verifySmsAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { phone, code } = req.body;
            const data = yield (0, sendSMS_1.smsVerify)(phone, code);
            if (!(data === null || data === void 0 ? void 0 : data.valid))
                return res.status(400).json({ msg: "Invalid Authentication 13" });
            const password = phone + "You secret your account";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: phone });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const newUser = {
                    name: phone,
                    account: phone,
                    password: passwordHash,
                    type: "login",
                };
                registerUser(newUser, res);
            }
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    forgotPasswordAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { account } = req.body;
            if (!account)
                return res
                    .status(400)
                    .json({ success: false, msg: "Invalid account." });
            const user = yield userModel_1.default.findOne({ account });
            if (!user)
                return res
                    .status(400)
                    .json({ success: false, msg: "You need to login or register." });
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const url = `${process.env.BASE_URL}/reset_password/${access_token}`;
            if ((0, valid_1.validEmail)(account)) {
                (0, sendMail_1.default)(account, url, "Forgot password your email");
                return res.json({
                    success: true,
                    access_token,
                    msg: "Please check your email.",
                });
            }
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
};
const loginUser = (user, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const check = yield bcrypt_1.default.compare(password, user.password);
    if (!check)
        return res.json({ success: false, msg: "User password mismatch" });
    const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
    yield userModel_1.default.findOneAndUpdate({ _id: user._id }, { rf_token: refresh_token });
    res.json({
        success: true,
        msg: "Login successful",
        access_token,
        refresh_token,
        user: Object.assign(Object.assign({}, user._doc), { password: "" }),
    });
});
const registerUser = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new userModel_1.default(user);
    const access_token = (0, generateToken_1.generateAccessToken)({ id: newUser._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: newUser._id }, res);
    res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 3600 * 24 * 60 * 60 * 1000, // 30 day
    });
    newUser.rf_token = refresh_token;
    yield newUser.save();
    res.json({
        success: true,
        msg: "Login successful",
        access_token,
        refresh_token,
        user: Object.assign(Object.assign({}, newUser._doc), { password: "" }),
    });
});
exports.default = authCtrl;
