const error_not_found = (req, res, next) => {
  //Handles when routes requested do not exist
  const error = new Error("Not found");
  error.status = 404;
  next(error);
};

const error_not_catched = (error, req, res, next) => {
  //Handles other errors
  if (!error.status) error.status = 500;
  res.status(error.status);
  res.render("error", { title: "Error", error, stack: true });
};

module.exports = {
  error_not_found,
  error_not_catched
};
