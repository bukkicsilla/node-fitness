"use strict";
const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const apiFitnessRoutes = require("./routes/basic");
const { PORT } = require("./config");
const { authenticateJWT } = require("./middleware/jwt");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/", apiFitnessRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

/*app.get("/", (req, res) => {
  res.send("Hello World!");
});*/

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
