
function errorMiddleware(err, req, res, next) {
  console.error("Server Error:", err);

  let statusCode = err.statusCode || err.status || 500;
  let message = "Something went wrong. Please try again.";

  // Invalid JSON request
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON request.";
  }

  // MySQL duplicate entry
  else if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "This record already exists.";
  }

  // MySQL foreign key constraint
  else if (
    err.code === "ER_ROW_IS_REFERENCED_2" ||
    err.code === "ER_NO_REFERENCED_ROW_2"
  ) {
    statusCode = 409;
    message = "This operation cannot be completed because related records exist.";
  }

  // File upload errors
  else if (err.name === "MulterError") {
    statusCode = 400;
    message = "File upload failed. Please check the selected file.";
  }

  // Known client errors
  else if (statusCode >= 400 && statusCode < 500) {
    message = err.message || "Invalid request.";
  }

  // Development-only debugging details
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.debug = {
      error: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
}

export default errorMiddleware;
