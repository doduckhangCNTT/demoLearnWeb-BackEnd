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
const valid_1 = require("../../middleware/valid");
const courseModel_1 = __importDefault(require("../../models/courseModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const PageConfig = (req) => {
    const page = Number(req.query.page) * 1 || 1;
    const limit = Number(req.query.limit) * 1 || 3;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const courseCtrl = {
    createCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { name, thumbnail, description, accessModifier, category, videoIntro, format, price, oldPrice, courses, } = req.body;
            const newCourse = new courseModel_1.default({
                user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                name,
                thumbnail,
                description,
                accessModifier,
                category,
                videoIntro,
                format,
                price,
                oldPrice,
                courses,
            });
            yield newCourse.save();
            res.json({ newCourse, msg: "Course saved successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    createChapterOfCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const course = (yield courseModel_1.default.findOne({
                _id: req.params.courseId,
            }));
            if (!course) {
                return res.json({ msg: "Course not found" });
            }
            const chapter = req.body;
            const newCourse = Object.assign(Object.assign({}, course._doc), { content: [...course.content, chapter] });
            const courseChapter = yield courseModel_1.default.findOneAndUpdate({ _id: req.params.courseId, user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id }, newCourse, { new: true });
            if (!courseChapter) {
                return res.json({ msg: "Course not found" });
            }
            res.json({
                msg: "Created chapter successfully",
                content: courseChapter.content,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, error: "Invalid Authentication 43" });
        }
        try {
            const courses = yield courseModel_1.default.find()
                .populate("user")
                .populate("category");
            if (!courses) {
                return res.json({ msg: "No courses found" });
            }
            res.json(courses);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const course = yield courseModel_1.default.findOne({ _id: req.params.id }).populate("user");
            if (!course) {
                return res.json({ msg: "Course not found" });
            }
            res.json(course);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getChapterCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const course = yield courseModel_1.default.findOne({
                _id: req.params.courseId,
            }).populate("user");
            if (!course) {
                return res.json({ msg: "Course not found" });
            }
            course.content.forEach((chapter) => {
                var _a;
                if (((_a = chapter._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.chapterId) {
                    return res.json(chapter);
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getCoursesPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // if (!req.user) {
        //   return res
        //     .status(400)
        //     .json({ success: false, error: "Invalid Authentication" });
        // }
        const { page, skip, limit } = PageConfig(req);
        try {
            const courses = yield courseModel_1.default.find();
            const coursesValue = yield courseModel_1.default.find()
                .skip(skip)
                .limit(limit)
                .populate("user")
                .populate("category");
            res.json({ courses: coursesValue, totalCount: courses.length });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getCoursesSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // if (!req.user) {
        //   return res
        //     .status(400)
        //     .json({ success: false, error: "Invalid Authentication" });
        // }
        var _c;
        const { page, skip, limit } = PageConfig(req);
        try {
            const { search } = req.query;
            if ((0, valid_1.validEmail)((search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "")) {
                const user = yield userModel_1.default.findOne({ account: search });
                if (!user) {
                    return res.json({ success: false, msg: "User not found" });
                }
                const courses = yield courseModel_1.default.find();
                const coursesValue = yield courseModel_1.default.find({ user: user._id })
                    .skip(skip)
                    .limit(limit)
                    .populate("user")
                    .populate("category");
                res.json({ courses: coursesValue, totalCount: courses.length });
            }
            else if ((_c = search === null || search === void 0 ? void 0 : search.toString()) === null || _c === void 0 ? void 0 : _c.match(/^[0-9a-fA-F]{24}$/)) {
                const course = yield courseModel_1.default.findOne({ _id: search.toString() });
                res.json({ courses: course, totalCount: 1 });
            }
            else {
                const courses = yield courseModel_1.default.find({
                    name: (search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "",
                });
                const coursesValue = yield courseModel_1.default.find({
                    name: (search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "",
                })
                    .skip(skip)
                    .limit(limit)
                    .populate("user")
                    .populate("category");
                res.json({ courses: coursesValue, totalCount: courses.length });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    createLessonOfChapter: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(400).json({
                    success: false,
                    msg: "You no have permission to access this",
                });
            }
            const lesson = req.body;
            // console.log("Lesson: ", lesson);
            const value = yield courseModel_1.default.findOne({
                "content._id": req.params.chapterId,
            }, { "content.$": 1 });
            // console.log("Value: ", value);
            if (!value) {
                return res.json({ msg: "Course not found" });
            }
            const addLessonInChapter = Object.assign(Object.assign({}, value === null || value === void 0 ? void 0 : value.content[0]._doc), { lessons: [...value.content[0].lessons, lesson] });
            // console.log("Add Lesson: ", addLessonInChapter);
            const course = yield courseModel_1.default.findOneAndUpdate({
                "content._id": req.params.chapterId,
            }, {
                $set: { "content.$": addLessonInChapter },
            }, { new: true });
            // console.log("Course: ", course);
            res.json({ msg: "Add lesson successfully", content: course === null || course === void 0 ? void 0 : course.content });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    updateLessonOfChapter: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseId = req.params.courseId;
            const chapterId = req.params.chapterId;
            const lessonId = req.params.lessonId;
            // console.log({ lessonId, courseId, chapterId });
            // console.log("Body", req.body);
            const value = yield courseModel_1.default.updateOne({
                _id: `${courseId}`,
            }, { $set: { "content.$[element].lessons": req.body } }, { arrayFilters: [{ "element._id": `${chapterId}` }] });
            return res.json({ msg: "Update Lesson successfully", value });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteLessonOfChapter: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courseId = req.params.courseId;
            const chapterId = req.params.chapterId;
            const lessonId = req.params.lessonId;
            // console.log({ lessonId, courseId, chapterId });
            const value = yield courseModel_1.default.updateOne({
                _id: `${courseId}`,
            }, { $pull: { "content.$[element].lessons": { _id: `${lessonId}` } } }, { arrayFilters: [{ "element._id": `${chapterId}` }] });
            res.json(value);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
};
exports.default = courseCtrl;
