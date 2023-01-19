"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// const URI = process.env.MONGOOSE_URL;
mongoose_1.default
    .connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // poolSize: parseInt(process.env.POOL_SIZE!),
})
    .then((res) => {
    console.log("Connected database");
})
    .catch((err) => {
    console.log(`Initial Distribution API Database connection error occured -`, err);
});
