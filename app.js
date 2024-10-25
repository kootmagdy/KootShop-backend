const express = require("express");

const AppError = require("./utils/appError");
const golbalErrorHandler = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const app = express();
app.enable("trust proxy");
// 1) MIDDLEWARES
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(express.json()); // middleware that used to get the data from the request as json
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

// here is applied on all requests [Global middleware]
app.use((req, res, next) => {
  console.log("hey i'm global middleware");
  next();
});

app.use((req, res, next) => {
  console.log("hey i'm Time middleware");
  req.requestTime = new Date().toISOString();
  next();
});


app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

//handel not hit routes  ---- handel all routes that not responded from the upper routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // whenever pass something to next it  will be an error to skil all other next middle ware till go to ERROR MIDDLE WARE HANDELER
});

//ERROR HANDELING MIDDLEWARE
app.use(golbalErrorHandler);

module.exports = app;
