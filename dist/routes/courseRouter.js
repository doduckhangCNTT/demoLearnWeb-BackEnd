"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseCtrl_1 = __importDefault(require("../controllers/course/courseCtrl"));
const authAdmin_1 = __importDefault(require("../middleware/auth/authAdmin"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/courses", authUser_1.default, courseCtrl_1.default.getCourses);
router.get("/course/:id", authUser_1.default, courseCtrl_1.default.getCourse);
router.get("/course/:courseId/chapter/:chapterId", authUser_1.default, authAdmin_1.default, courseCtrl_1.default.getChapterCourse);
router.get("/coursesPage", courseCtrl_1.default.getCoursesPage);
router.get("/coursesPageSearch", courseCtrl_1.default.getCoursesSearch);
router.post("/course/:courseId/chapter/:chapterId/lesson", authUser_1.default, authAdmin_1.default, courseCtrl_1.default.createLessonOfChapter);
router.post("/course", authUser_1.default, authAdmin_1.default, courseCtrl_1.default.createCourse);
router.patch("/chapter/course/:courseId", authUser_1.default, authAdmin_1.default, courseCtrl_1.default.createChapterOfCourse);
router
    .route("/courses/:courseId/chapter/:chapterId/lesson/:lessonId")
    .delete(authUser_1.default, authAdmin_1.default, courseCtrl_1.default.deleteLessonOfChapter)
    .patch(courseCtrl_1.default.updateLessonOfChapter);
// .patch(courseCtrl.updateCourse);
// .delete(courseCtrl.deleteCourse);
exports.default = router;
