import express from "express";
import courseCtrl from "../controllers/course/courseCtrl";
import authAdmin from "../middleware/auth/authAdmin";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.get("/courses", authUser, courseCtrl.getCourses);

router.get("/course/:id", authUser, courseCtrl.getCourse);

router.get(
  "/course/:courseId/chapter/:chapterId",
  authUser,
  authAdmin,
  courseCtrl.getChapterCourse
);

router.get("/coursesPage", courseCtrl.getCoursesPage);

router.get("/coursesPageSearch", courseCtrl.getCoursesSearch);

router.patch("/course", authUser, courseCtrl.updateCourse);

router.post(
  "/course/:courseId/chapter/:chapterId/lesson",
  authUser,
  authAdmin,
  courseCtrl.createLessonOfChapter
);

router.post("/course", authUser, authAdmin, courseCtrl.createCourse);

router.patch(
  "/chapter/course/:courseId",
  authUser,
  authAdmin,
  courseCtrl.createChapterOfCourse
);

router
  .route("/courses/:courseId/chapter/:chapterId/lesson/:lessonId")
  .delete(authUser, authAdmin, courseCtrl.deleteLessonOfChapter)
  .patch(courseCtrl.updateLessonOfChapter);
// .patch(courseCtrl.updateCourse);
// .delete(courseCtrl.deleteCourse);

/**Thêm thông tin khóa học được đăng kí bởi user */
router.post("/course/user", courseCtrl.addCourseSignedForUser);

router.delete("/course", authUser, courseCtrl.deleteCourse);

/**Lưu thông tin khóa học, bài test đã làm của user hiện tại */
router.post(
  "/course/lesson",
  authUser,
  courseCtrl.addLessonAndQuizLearnedForUser
);

export default router;
