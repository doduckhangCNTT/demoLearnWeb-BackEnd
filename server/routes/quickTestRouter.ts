import express from "express";
import quickTestCtrl from "../controllers/quickTestCtrl";
import authAdmin from "../middleware/auth/authAdmin";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.get("/quickTests", authUser, quickTestCtrl.getQuickTests);

router.get("/quickTestsPage", quickTestCtrl.getQuickTestsToPage);

router.get("/quickTestsSearch", authUser, quickTestCtrl.getQuickTestsSearch);

router.get("/quickTest/:id", authUser, authAdmin, quickTestCtrl.getQuickTest);

router.post("/quickTest", authUser, authAdmin, quickTestCtrl.createQuickTest);

router
  .route("/quickTest/:id")
  .patch(authUser, authAdmin, quickTestCtrl.updateQuickTest)
  .delete(authUser, authAdmin, quickTestCtrl.deleteQuickTest);

router.get(
  "/quickTest/question/:id",
  authUser,
  authAdmin,
  quickTestCtrl.getQuestion
);

router.patch(
  "/quickTest/question/:id",
  authUser,
  authAdmin,
  quickTestCtrl.updateQuestion
);

router.delete(
  "/quickTest/question/:id",
  authUser,
  authAdmin,
  quickTestCtrl.deleteQuestion
);

export default router;
