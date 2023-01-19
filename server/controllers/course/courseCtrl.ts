import { Response } from "express";
import { ICourses, IReqAuth } from "../../config/interface";
import { validEmail } from "../../middleware/valid";
import CourseModel from "../../models/courseModel";
import userModel from "../../models/userModel";

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
}

const PageConfig = (req: IReqAuth) => {
  const page = Number(req.query.page) * 1 || 1;
  const limit = Number(req.query.limit) * 1 || 3;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const courseCtrl = {
  createCourse: async (req: IReqAuth, res: Response) => {
    try {
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

      res.json({ newCourse, msg: "Course saved successfully" });
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
    // if (!req.user) {
    //   return res
    //     .status(400)
    //     .json({ success: false, error: "Invalid Authentication" });
    // }

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
    // if (!req.user) {
    //   return res
    //     .status(400)
    //     .json({ success: false, error: "Invalid Authentication" });
    // }

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

  createLessonOfChapter: async (req: IReqAuth, res: Response) => {
    try {
      if (!req.user) {
        return res.status(400).json({
          success: false,
          msg: "You no have permission to access this",
        });
      }

      const lesson = req.body as ILesson;
      // console.log("Lesson: ", lesson);

      const value = await CourseModel.findOne(
        {
          "content._id": req.params.chapterId,
        },
        { "content.$": 1 }
      );
      // console.log("Value: ", value);

      if (!value) {
        return res.json({ msg: "Course not found" });
      }

      const addLessonInChapter = {
        ...value?.content[0]._doc,
        lessons: [...value.content[0].lessons, lesson],
      };
      // console.log("Add Lesson: ", addLessonInChapter);
      const course = await CourseModel.findOneAndUpdate(
        {
          "content._id": req.params.chapterId,
        },
        {
          $set: { "content.$": addLessonInChapter },
        },
        { new: true }
      );

      // console.log("Course: ", course);

      res.json({ msg: "Add lesson successfully", content: course?.content });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateLessonOfChapter: async (req: IReqAuth, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const chapterId = req.params.chapterId;
      const lessonId = req.params.lessonId;

      // console.log({ lessonId, courseId, chapterId });
      // console.log("Body", req.body);
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

      // console.log({ lessonId, courseId, chapterId });
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
};

export default courseCtrl;
