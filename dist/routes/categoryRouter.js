"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryCtrl_1 = __importDefault(require("../controllers/categoryCtrl"));
const authAdmin_1 = __importDefault(require("../middleware/auth/authAdmin"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router
    .route("/category")
    .get(categoryCtrl_1.default.getCategories)
    .post(authUser_1.default, authAdmin_1.default, categoryCtrl_1.default.postCategory);
router
    .route("/category/:id")
    .put(authUser_1.default, authAdmin_1.default, categoryCtrl_1.default.updateCategory)
    .patch(authUser_1.default, authAdmin_1.default, categoryCtrl_1.default.patchCategory)
    .delete(authUser_1.default, authAdmin_1.default, categoryCtrl_1.default.deleteCategory);
exports.default = router;
