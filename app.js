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

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with the origin of your React app
  credentials: true, // Allow credentials (cookies) to be sent in the request
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json()); // middleware that used to get the data from the request as json
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

// here is applied on all requests [Global middleware]
app.use((req, res, next) => {
  console.log("cookies: ",req.cookies);
  next();
});

app.use((req, res, next) => {
  //console.log("hey i'm Time middleware");
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
