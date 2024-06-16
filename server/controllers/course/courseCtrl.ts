import { Response } from "express";
import { ICourseOfUser, ICourses, IReqAuth } from "../../config/interface";
import { validEmail } from "../../middleware/valid";
import CourseModel from "../../models/courseModel";
import userModel from "../../models/userModel";
import Users from "../../models/userModel";
import { ObjectId } from "mongodb";

interface IChapter {
  _id?: string;
  name: string;
  lessons: ILesson[];
}
export interface ILesson {
  name: string;
  url:
    | string
    | File
    | {
        public_id: string;
        secure_url: string;
      };
  description: string;
  quiz?: { quizId: string; completed: boolean; status: string };
  statusDoQuiz?: string;
}

const PageConfig = (req: IReqAuth) => {
  const page = Number(req.query.page) * 1 || 1;
  const limit = Number(req.query.limit) * 1 || 3;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const courseCtrl = {
  /**
   * Tạo mới khóa học
   * @param req Request
   * @param res Response
   */
  createCourse: async (req: IReqAuth, res: Response) => {
    try {
      if (req && req.body) {
        const {
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
        } = req.body;

        const newCourse = new CourseModel({
          user: req.user?._id,
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
        await newCourse.save();
        res.status(200).json({ newCourse, msg: "Course saved successfully" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Cập nhật thông tin khóa học
   * @param req
   * @param res
   */
  updateCourse: async (req: IReqAuth, res: Response) => {
    try {
      if (req && req.body) {
        // 1. Kiểm tra khóa học có tồn tại
        const course = await CourseModel.findById({ _id: req.body._id });

        if (course) {
          // 2. Cập nhật thông tin khóa học
          const courseUpdated = { ...course._doc, ...req.body };
          const response = await CourseModel.findByIdAndUpdate(
            course._id,
            courseUpdated
          );
          if (response) {
            // 3. Thông báo
            res
              .status(200)
              .json({ success: true, msg: "Update course successfully." });
          }
        } else {
          res.status(500).json({ success: false, error: "Course not found" });
        }
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Xóa thông tin khóa học
   * @param req
   * @param res
   */
  deleteCourse: async (req: IReqAuth, res: Response) => {
    try {
      if (req && req.body) {
        // 1. Kiểm tra khóa học có tồn tại
        const course = await CourseModel.findById({ _id: req.body.courseId });
        if (course) {
          const response = await CourseModel.findByIdAndDelete(
            req.body.courseId
          );
          if (response) {
            res
              .status(200)
              .json({ success: true, msg: "Delete course successfully." });
          }
        } else {
          res.status(500).json({ success: false, error: "Course not found" });
        }
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createChapterOfCourse: async (req: IReqAuth, res: Response) => {
    try {
      const course = (await CourseModel.findOne({
        _id: req.params.courseId,
      })) as ICourses;

      if (!course) {
        return res.json({ msg: "Course not found" });
      }
      const chapter: IChapter = req.body;

      const newCourse = {
        ...course._doc,
        content: [...course.content, chapter],
      };

      const courseChapter = await CourseModel.findOneAndUpdate(
        { _id: req.params.courseId, user: req.user?._id },
        newCourse,
        { new: true }
      );
      if (!courseChapter) {
        return res.json({ msg: "Course not found" });
      }

      res.json({
        msg: "Created chapter successfully",
        content: courseChapter.content,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCourses: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Authentication 43" });
    }
    try {
      const courses = await CourseModel.find()
        .populate("user")
        .populate("category");

      if (!courses) {
        return res.json({ msg: "No courses found" });
      }

      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCourse: async (req: IReqAuth, res: Response) => {
    try {
      const course = await CourseModel.findOne({ _id: req.params.id }).populate(
        "user"
      );

      if (!course) {
        return res.json({ msg: "Course not found" });
      }

      res.json(course);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getChapterCourse: async (req: IReqAuth, res: Response) => {
    try {
      const course = await CourseModel.findOne({
        _id: req.params.courseId,
      }).populate("user");

      if (!course) {
        return res.json({ msg: "Course not found" });
      }

      course.content.forEach((chapter) => {
        if (chapter._id?.toString() === req.params.chapterId) {
          return res.json(chapter);
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCoursesPage: async (req: IReqAuth, res: Response) => {
    const { page, skip, limit } = PageConfig(req);
    try {
      const courses = await CourseModel.find();

      const coursesValue = await CourseModel.find()
        .skip(skip)
        .limit(limit)
        .populate("user")
        .populate("category");

      res.json({ courses: coursesValue, totalCount: courses.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getCoursesSearch: async (req: IReqAuth, res: Response) => {
    const { page, skip, limit } = PageConfig(req);
    try {
      const { search } = req.query;

      if (validEmail(search?.toString() ? search.toString() : "")) {
        const user = await userModel.findOne({ account: search });

        if (!user) {
          return res.json({ success: false, msg: "User not found" });
        }
        const courses = await CourseModel.find();

        const coursesValue = await CourseModel.find({ user: user._id })
          .skip(skip)
          .limit(limit)
          .populate("user")
          .populate("category");

        res.json({ courses: coursesValue, totalCount: courses.length });
      } else if (search?.toString()?.match(/^[0-9a-fA-F]{24}$/)) {
        const course = await CourseModel.findOne({ _id: search.toString() });

        res.json({ courses: course, totalCount: 1 });
      } else {
        const courses = await CourseModel.find({
          name: search?.toString() ? search.toString() : "",
        });

        const coursesValue = await CourseModel.find({
          name: search?.toString() ? search.toString() : "",
        })
          .skip(skip)
          .limit(limit)
          .populate("user")
          .populate("category");

        res.json({ courses: coursesValue, totalCount: courses.length });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Thêm mới bài học cho chappter
   */
  createLessonOfChapter: async (req: IReqAuth, res: Response) => {
    try {
      if (!req.user) {
        return res.status(400).json({
          success: false,
          msg: "You no have permission to access this",
        });
      }
      const lesson = req.body as ILesson;
      const value = await CourseModel.findOne(
        {
          "content._id": req.params?.chapterId,
        },
        { "content.$": 1 }
      );

      console.log("value123: ", {
        value,
        lesson,
      });

      if (!value) {
        return res.json({ msg: "Course not found" });
      }

      if (value.content && value.content[0]) {
        const addLessonInChapter = {
          ...value?.content[0]._doc,
          lessons: [...value.content[0].lessons, lesson],
        };

        console.log("addLessonInChapter: ", addLessonInChapter);

        const course = await CourseModel.findOneAndUpdate(
          {
            "content._id": req.params?.chapterId,
          },
          {
            $set: { "content.$": addLessonInChapter },
          },
          { new: true }
        );

        console.log("course: ", course);

        res.json({ msg: "Add lesson successfully", content: course?.content });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateLessonOfChapter: async (req: IReqAuth, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const chapterId = req.params.chapterId;
      const lessonId = req.params.lessonId;
      const value = await CourseModel.updateOne(
        {
          _id: `${courseId}`,
        },
        { $set: { "content.$[element].lessons": req.body } },
        { arrayFilters: [{ "element._id": `${chapterId}` }] }
      );

      return res.json({ msg: "Update Lesson successfully", value });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteLessonOfChapter: async (req: IReqAuth, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const chapterId = req.params.chapterId;
      const lessonId = req.params.lessonId;
      const value = await CourseModel.updateOne(
        {
          _id: `${courseId}`,
        },
        { $pull: { "content.$[element].lessons": { _id: `${lessonId}` } } },
        { arrayFilters: [{ "element._id": `${chapterId}` }] }
      );
      res.json(value);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Thêm khóa học, chỉnh sửa tiến trình khóa học được đăng kí bởi user
   * @param req
   * @param res
   */
  addCourseSignedForUser: async (req: IReqAuth, res: Response) => {
    try {
      if (req && req.body && req.params) {
        const user = await Users.findOne({ _id: req.body.userId });
        const isExitCourseUser = user?.courses?.some(
          (course) => course.course.toString() === req.body.courseId.toString()
        );
        // Cập nhật tiến trình khóa học
        if (isExitCourseUser) {
          if (user && user.courses && user.courses.length) {
            const { courseId, progressLesson, lessonId } =
              req.body as ICourseOfUser;

            if (progressLesson !== null) {
              const filter = {
                _id: user._id,
                "courses.course": new ObjectId(courseId),
              };
              const update = {
                $set: {
                  "courses.$.progressLesson": progressLesson,
                  "courses.$.lessonId": lessonId,
                },
              };
              // Cập nhật lại thông tin tiến trình khóa học
              await Users.updateOne(filter, update);
            }
          }
        }
        // Thêm mới khóa học cho user đăng kí
        else {
          const { courseId } = req.body as ICourseOfUser;
          const courses = user?.courses || [];
          const coursesNew = [
            ...courses,
            { course: courseId, progressLesson: 0, lessonId: "" },
          ];

          await Users.findOneAndUpdate(
            {
              _id: req.body.userId,
            },
            {
              $set: { courses: coursesNew },
            }
          );
        }
      }
      res
        .status(200)
        .json({ success: true, msg: "Course signed successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCourseSignedOfUser: async (req: IReqAuth, res: Response) => {
    try {
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Thêm bài học đã học và quiz test đã làm cho user
   * @param req
   * @param res
   */
  addLessonAndQuizLearnedForUser: async (req: IReqAuth, res: Response) => {
    try {
      if (req && req.body) {
        console.log("Body: ", req.body);
        const user = await Users.findOne({ _id: req.body.userId });

        if (user && user.courses) {
          const courseNow = user.courses.find(
            (course) =>
              course.course.toString() === req.body.courseId.toString()
          );
          // Tồn tại thông tin khóa học người dùng đang học
          if (courseNow) {
            if (courseNow.lessons && courseNow.lessons.length) {
              // Kiểm tra xem lesson đã tồn tại
              const lessonNow = courseNow.lessons.find(
                (lesson) =>
                  lesson.lessonId?.toString() === req.body.lessonId?.toString()
              );
              console.log("lessonNow: ", lessonNow);
              // Thêm mới bài học vào danh đã học của user
              if (!lessonNow) {
                // Thông tin bài học đã xem
                let lessonNew: any = {
                  lessonId: req.body.lessonId,
                };
                if (req.body && req.body.quiz) {
                  lessonNew.quiz = {
                    quizId: req.body.quiz.quizId,
                    completed: req.body.quiz.completed,
                  };
                }
                console.log("LESSON: ", lessonNew);
                // Thêm bài học mới vào danh sách đã xem trong khóa học tương ứng
                await Users.updateOne(
                  {
                    _id: req.body.userId, // Tìm theo User
                    "courses.course": req.body.courseId, // Tìm tiếp theo id khóa học
                  },
                  {
                    $push: {
                      "courses.$.lessons": lessonNew,
                    },
                  }
                );
                res.status(200).json({ success: true, msg: "" });
              }
            }
            // Thêm mới lesson đầu tiền cho khóa học
            else {
              let lessonNew: any = {
                lessonId: req.body.lessonId,
              };

              if (req.body && req.body.quiz) {
                lessonNew.quiz = {
                  quizId: req.body.quiz.quizId,
                  completed: req.body.quiz.completed,
                };
              }
              console.log("LessonNew: ", lessonNew);
              // Lưu vào trong db
              await Users.updateOne(
                {
                  _id: req.body.userId, // Tìm theo User
                  "courses.course": req.body.courseId, // Tìm tiếp theo id khóa học
                },
                {
                  $set: {
                    "courses.$.lessons": [lessonNew],
                  },
                }
              );
            }
          } else {
            res
              .status(500)
              .json({ success: false, error: "Not found course you learning" });
          }
        } else {
          res
            .status(500)
            .json({ success: false, error: "User not found. You need login!" });
        }
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default courseCtrl;
