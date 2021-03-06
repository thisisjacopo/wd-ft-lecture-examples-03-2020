const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

// Session middleware packages
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const indexRouter = require("./routes/index-router");
const authRouter = require("./routes/auth-router");
const siteRouter = require("./routes/site-router");

const app = express();
const DB_NAME = "session-auth-demo";

// MONGOOSE CONNECTION
mongoose
  .connect(`mongodb://localhost:27017/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// MIDDLEWARE
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// SESSION MIDDLEWARE
// Checks incoming request: if there is a cookie, and if cookie has valid session id
app.use(
  session({
    secret: "bananarama",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 7 * 24 * 60 * 60, // Default value - 14 days
    }),
  })
);
// Checks the response if there is data on req.session

// ROUTES
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/", siteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
