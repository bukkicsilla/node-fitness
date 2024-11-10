const express = require("express");
//const axios = require("axios");
//const bcrypt = require("bcrypt");
//const db = require("../db");
const User = require("../models/User");
const middleware = require("../middleware");
const { ensureCorrectUser } = require("../middleware/jwt");
//const { BCRYPT_WORK_FACTOR } = require("../config");

/*const {
  NotFoundError,
  BadRequestError,
  ExpressError,
} = require("../expressError");*/

const router = new express.Router();
//const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";

router.get("/", middleware.allowThis, async function (req, res, next) {
  try {
    //const results = await db.query(`SELECT * FROM users`);
    //return res.json(results.rows);
    let users = await User.getUsers();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

/*router.get("/:id", async function (req, res, next) {
  try {
    let user = await User.getUserById(req.params.id);
    return res.json(user);
  } catch (e) {
    return next(e);
  }
});*/

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let user = await User.getUserById(req.params.id);
    await user.remove();
    return res.json({ msg: " user deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
