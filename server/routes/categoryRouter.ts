import express from "express";
import categoryCtrl from "../controllers/categoryCtrl";
import authAdmin from "../middleware/auth/authAdmin";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router
  .route("/category")
  .get(categoryCtrl.getCategories)
  .post(authUser, authAdmin, categoryCtrl.postCategory);

router
  .route("/category/:id")
  .put(authUser, authAdmin, categoryCtrl.updateCategory)
  .patch(authUser, authAdmin, categoryCtrl.patchCategory)
  .delete(authUser, authAdmin, categoryCtrl.deleteCategory);

export default router;
