import mongoose, { ConnectOptions } from "mongoose";

// const URI = process.env.MONGOOSE_URL;

mongoose
  .connect(process.env.MONGOOSE_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // poolSize: parseInt(process.env.POOL_SIZE!),
  } as ConnectOptions)
  .then((res) => {
    console.log("Connected database");
  })
  .catch((err) => {
    console.log(
      `Initial Distribution API Database connection error occured -`,
      err
    );
  });
