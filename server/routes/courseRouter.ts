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

export default router;
