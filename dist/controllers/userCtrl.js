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
const PageConfig = (req) => {
    const page = Number(req.query.page) * 1 || 1;
    const limit = Number(req.query.limit) * 1 || 5;
    const skip = (page - 1) * limit;
    return { page, skip, limit };
};
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
const userCtrl = {
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 1" });
        }
        try {
            const users = yield userModel_1.default.find().select("-password").sort("-createdAt");
            res.json({ users });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    getUserSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 2" });
        }
        try {
            const users = yield userModel_1.default.find({
                name: { $regex: req.query.username },
            })
                .limit(10)
                .select("-password")
                .sort("-createdAt");
            res.json({ users });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 3" });
        }
        try {
            const user = yield userModel_1.default.findById(req.params.id).select("-password");
            if (!user)
                return res
                    .status(400)
                    .json({ success: false, msg: "Invalid Authentication 4" });
            res.json({ user });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    getUsersPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 5" });
        }
        const { skip, limit } = PageConfig(req);
        try {
            const users = yield userModel_1.default.find();
            const usersPage = yield userModel_1.default.find()
                .skip(skip)
                .limit(limit)
                .select("-password")
                .sort("-createdAt");
            res.json({ users: usersPage, totalCount: users.length });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    getUsersSearchPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 6" });
        }
        try {
            let users = [];
            const { search } = req.query;
            if (validateEmail(search ? search.toString() : "")) {
                users = yield userModel_1.default.find({ account: search });
            }
            else {
                if ((_a = search === null || search === void 0 ? void 0 : search.toString()) === null || _a === void 0 ? void 0 : _a.match(/^[0-9a-fA-F]{24}$/)) {
                    users = yield userModel_1.default.find({ _id: search });
                }
                else {
                    users = [];
                }
            }
            if (users.length <= 0) {
                return res.json({ success: false, msg: "User not found" });
            }
            res.json({ success: true, users, totalCount: 1 });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 7" });
        }
        try {
            const { name, avatar, bio, telephoneNumber } = req.body;
            yield userModel_1.default.findOneAndUpdate({ _id: req.params.id }, { name, avatar, bio, telephoneNumber });
            res.json({ success: true, msg: "Updated user successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    updateOneComponentOfUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 8" });
        }
        try {
            const { name, user } = req.body;
            yield userModel_1.default.findOneAndUpdate({ _id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id }, { [`${name}`]: user[`${name}`] });
            res.json({ success: true, msg: "Updated item successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 9" });
        }
        try {
            const user = yield userModel_1.default.findOneAndDelete({ _id: req.params.id });
            res.json({ success: true, user, msg: "Delete user successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "User not found" });
        if (req.user.type !== "register") {
            return res.status(400).json({
                msg: `Quick login account with ${req.user.type} can't use this function`,
            });
        }
        try {
            const { password } = req.body;
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, { password: passwordHash });
            res.json({ success: true, msg: "Updated password is successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    uploadImg: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 10" });
        }
        try {
            const { url } = req.body;
            yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, { avatar: url });
            res.json({ success: true, msg: "Updated item successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
};
exports.default = userCtrl;
