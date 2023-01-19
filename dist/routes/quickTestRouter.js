"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quickTestCtrl_1 = __importDefault(require("../controllers/quickTestCtrl"));
const authAdmin_1 = __importDefault(require("../middleware/auth/authAdmin"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/quickTests", authUser_1.default, quickTestCtrl_1.default.getQuickTests);
router.get("/quickTestsPage", quickTestCtrl_1.default.getQuickTestsToPage);
router.get("/quickTestsSearch", quickTestCtrl_1.default.getQuickTestsSearch);
router.get("/quickTest/:id", authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.getQuickTest);
router.post("/quickTest", authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.createQuickTest);
router
    .route("/quickTest/:id")
    .patch(authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.updateQuickTest)
    .delete(authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.deleteQuickTest);
router.get("/quickTest/question/:id", authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.getQuestion);
router.patch("/quickTest/question/:id", authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.updateQuestion);
router.delete("/quickTest/question/:id", authUser_1.default, authAdmin_1.default, quickTestCtrl_1.default.deleteQuestion);
exports.default = router;
