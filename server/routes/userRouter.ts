import express from "express";
import userCtrl from "../controllers/userCtrl";
import authAdmin from "../middleware/auth/authAdmin";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.patch("/reset_password", authUser, userCtrl.resetPassword);

router.patch("/upload", authUser, userCtrl.uploadImg);

router.patch(
  "/update_oneComponent_user",
  authUser,
  userCtrl.updateOneComponentOfUser
);

router.get("/users", authUser, authAdmin, userCtrl.getUsers);

router.get("/usersPage", authUser, authAdmin, userCtrl.getUsersPage);

router.get(
  "/usersSearchPage",
  authUser,
  authAdmin,
  userCtrl.getUsersSearchPage
);

router.get("/search_user", authUser, userCtrl.getUserSearch);

router.get("/users/:id", authUser, userCtrl.getUser);

router.delete("/users/:id", authUser, authAdmin, userCtrl.deleteUser);

export default router;
