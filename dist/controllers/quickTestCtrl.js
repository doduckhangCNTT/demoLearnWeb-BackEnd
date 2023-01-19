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
const node_cache_1 = __importDefault(require("node-cache"));
const quickTestModel_1 = __importDefault(require("../models/quickTestModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const PageConfig = (req) => {
    const page = Number(req.query.page) * 1 || 1;
    const limit = Number(req.query.limit) * 1 || 2;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
const myCache = new node_cache_1.default({ stdTTL: 100, checkperiod: 120 });
const quickTestCtrl = {
    getQuickTests: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication 32" });
        }
        try {
            const quickTests = yield quickTestModel_1.default.find()
                .populate("user")
                .populate("category");
            res.json(quickTests);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getQuickTest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, error: "Please provide id quick test" });
        }
        try {
            const quickTest = yield quickTestModel_1.default.findOne({
                _id: req.params.id,
            }).populate("user");
            if (!quickTest) {
                return res
                    .status(400)
                    .json({ success: false, message: "Quick test not found" });
            }
            return res.json({ quickTest });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getQuickTestsToPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseQuickTestPage = myCache.get(key);
            res.json(cacheResponseQuickTestPage);
        }
        else {
            try {
                const { page, limit, skip } = PageConfig(req);
                const Data = yield quickTestModel_1.default.aggregate([
                    {
                        $facet: {
                            totalData: [
                                {
                                    $lookup: {
                                        from: "users",
                                        let: { user_id: "$user" },
                                        pipeline: [
                                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                            { $project: { password: 0 } },
                                        ],
                                        as: "user",
                                    },
                                },
                                { $unwind: "$user" },
                                {
                                    $lookup: {
                                        from: "categories",
                                        let: { category_id: "$category" },
                                        pipeline: [
                                            { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                                        ],
                                        as: "category",
                                    },
                                },
                                { $unwind: "$category" },
                                { $sort: { createdAt: -1 } },
                                { $skip: skip },
                                { $limit: limit },
                            ],
                            totalCount: [{ $count: "count" }],
                        },
                    },
                    {
                        $project: {
                            count: { $arrayElemAt: ["$totalCount.count", 0] },
                            totalData: 1,
                        },
                    },
                ]);
                const quickTests = Data[0].totalData;
                const count = Data[0].count;
                myCache.set(key, { quickTestsPage: quickTests, totalCount: count });
                res.json({ quickTestsPage: quickTests, totalCount: count });
            }
            catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }
    }),
    getQuickTestsSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 33" });
        try {
            let listTestSearch = [];
            const { page, limit, skip } = PageConfig(req);
            const searchQueryQuickTest = req.query.search;
            if (searchQueryQuickTest &&
                validateEmail(searchQueryQuickTest.toString())) {
                // const account = req.user.account;
                const user = yield userModel_1.default.findOne({ account: searchQueryQuickTest });
                // console.log("User: ", user);
                const userId = user === null || user === void 0 ? void 0 : user._id;
                // console.log("UserId: ", userId);
                if (!userId) {
                    return res.json({
                        msg: "User not found. You need write full name email want to search",
                    });
                }
                listTestSearch = yield quickTestModel_1.default.find({ user: userId })
                    .skip(skip)
                    .limit(limit)
                    .populate("user")
                    .populate("category");
            }
            else {
                listTestSearch = yield quickTestModel_1.default.find({
                    _id: { $eq: searchQueryQuickTest },
                })
                    .populate("user")
                    .populate("category");
            }
            res.json({ listTestSearch });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    createQuickTest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication 34" });
        }
        try {
            const { titleTest, category, time, description, image, questions, numberOfTimes, } = req.body;
            const newQuickTest = new quickTestModel_1.default({
                user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                titleTest,
                category,
                time,
                description,
                image,
                questions,
                numberOfTimes,
            });
            yield newQuickTest.save();
            res.json({
                newQuickTest,
                user: req.user,
                msg: "Create quick test successfully",
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    updateQuickTest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 35" });
        try {
            const { quickTest } = req.body;
            // console.log("Quick Test: ", quickTest);
            yield quickTestModel_1.default.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id,
            }, quickTest);
            return res.json({ success: true, message: "Added a question" });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteQuickTest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const quickTestId = req.params.id;
            const quickTest = yield quickTestModel_1.default.findOneAndDelete({
                _id: quickTestId,
            });
            return res.json({
                success: true,
                quickTest,
                msg: "Delete quick test successfully",
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 36" });
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, error: "Please provide id quick test" });
        }
        try {
            const question = yield quickTestModel_1.default.findOne({
                "questions._id": req.params.id,
            }, { "questions.$": 1 }).populate("user");
            if (!question) {
                return res
                    .status(400)
                    .json({ success: false, message: "Quick test not found" });
            }
            return res.json({ question });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    updateQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 37" });
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, error: "Please provide id quick test" });
        }
        try {
            const { newQuestion } = req.body;
            const quickQuestion = yield quickTestModel_1.default.findOneAndUpdate({
                "questions._id": req.params.id,
            }, { $set: { "questions.$": newQuestion } }, { new: true });
            if (!quickQuestion) {
                return res
                    .status(400)
                    .json({ success: false, message: "Quick test not found" });
            }
            return res.json({ quickQuestion, msg: "Update question successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 38" });
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, error: "Please provide id quick test" });
        }
        try {
            const quickQuestion = yield quickTestModel_1.default.findOneAndUpdate({
                "questions._id": req.params.id,
            }, { $pull: { questions: { _id: req.params.id } } }, { new: true });
            if (!quickQuestion) {
                return res
                    .status(400)
                    .json({ success: false, message: "Quick test not found" });
            }
            return res.json({ quickQuestion });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
};
exports.default = quickTestCtrl;
