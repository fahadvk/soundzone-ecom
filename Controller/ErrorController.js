module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  // set locals, only providing error in development
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.render("error", {
    layout: "",
    status: err.status,
    message: err.message,
    code: err.statusCode,
  });
  // res.status(err.statusCode).json({ status: err.status, message: err.message });
};
