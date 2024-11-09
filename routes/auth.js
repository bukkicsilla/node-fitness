const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const db = require("../db");
const User = require("../models/User");
const middleware = require("../middleware");
const { BCRYPT_WORK_FACTOR } = require("../config");

const {
  NotFoundError,
  BadRequestError,
  ExpressError,
} = require("../expressError");

const router = new express.Router();
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";

//authorization
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, email, first_name, last_name } = req.body;
    if (!username || !password || !email || !first_name || !last_name) {
      throw new ExpressError("username and password required", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING username`,
      [username, hashedPassword, email, first_name, last_name]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new BadRequestError("Username and password required");
    }
    const results = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];
    console.log("user", user);
    if (user) {
      if ((await bcrypt.compare(password, user.password)) === true) {
        return res.json({ message: "Logged in!" });
      }
    }
    throw new BadRequestError("Invalid user/password");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
