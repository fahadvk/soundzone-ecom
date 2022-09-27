var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const AppError = require("./utils/apperr");
var indexRouter = require("./routes/user");
const ErrorHandler = require("./Controller/ErrorController");
//var usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin/admin");
const category = require("./routes/admin/category");
const productRouter = require("./routes/admin/products");
const multer = require("multer");
const hbs = require("hbs");
const { create } = require("hbs");

// const cartRouter = require("./routes/cart");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.join(__dirname, "/views/partials"));
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
hbs.registerHelper("eq",(x,y)=>{return x === y});
hbs.registerHelper("date",function(val){
 val = val.toUTCString().slice(0, 16);
  return val;

})

hbs.registerHelper("mult",function (value1,value2) {
  return value1 * value2;  
})
// app.use(logger("dev"));
app.use(express.json());
// app.use(
//   multer({ storage: filestorage, fileFilter: filefilter }).array("image", 10)
// );
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "myKey",
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 1800000 },
  })
);
app.use("/", indexRouter);
//app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/admin/category", category);
app.use("/admin/product", productRouter);
// app.use("/cart", cartRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find the${req.originalUrl}`, 404));
});
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

app.use(express.json());
// error handler
app.use(ErrorHandler);
// res.locals.message = err.message;
// res.locals.error = req.app.get("env") === "development" ? err : {};

// // render the error page
// res.status(err.status || 500);
// res.render("error", {
//   layout: "",
// });
// });

module.exports = app;
