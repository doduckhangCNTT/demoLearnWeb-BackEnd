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
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const categoryCtrl = {
    getCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield categoryModel_1.default.find().sort("-createdAt");
            res.json({ categories });
        }
        catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }),
    postCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid Authentication 24" });
        }
        try {
            const { name } = req.body;
            if (!name)
                return res
                    .status(404)
                    .json({ success: false, msg: "Name not provided" });
            const newCategory = new categoryModel_1.default({ name });
            yield newCategory.save();
            res.json({
                success: true,
                msg: "Category saved successfully",
                category: newCategory,
            });
        }
        catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }),
    updateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid Authentication 25" });
        }
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ msg: "Name not provided" });
            const category = yield categoryModel_1.default.findOneAndUpdate({ _id: req.params.id }, { name });
            if (!category) {
                return res
                    .status(400)
                    .json({ success: false, msg: "Category is not exists" });
            }
            res.json({ success: true, msg: "Update category successfully" });
        }
        catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }),
    patchCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid Authentication 26" });
        }
        try {
            const { quality } = req.body;
            const category = yield categoryModel_1.default.findOneAndUpdate({ _id: req.params.id }, { quality });
            if (!category) {
                return res
                    .status(400)
                    .json({ success: false, msg: "Category is not exists" });
            }
            res.json({ success: true, msg: "Update category successfully" });
        }
        catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }),
    deleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 27" });
        }
        try {
            const category = yield categoryModel_1.default.findOneAndDelete({
                _id: req.params.id,
            });
            if (!category) {
                return res
                    .status(400)
                    .json({ success: false, msg: "Category is not exists" });
            }
            res.json({ success: true, msg: "Successfully deleted category" });
        }
        catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }),
};
exports.default = categoryCtrl;
