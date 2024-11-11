const express = require("express");
//const axios = require("axios");
//const bcrypt = require("bcrypt");
//const db = require("../db");
const User = require("../models/User");
const middleware = require("../middleware");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/jwt");
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

/*@app.route('/users/update/<int:user_id>', methods=['GET', 'POST'])
def update_user(user_id):
    '''Update user information.'''
    if "user_id" not in session:
        flash("Please login first!", "msguser")
        return redirect('/auth')
    user = User.query.get_or_404(user_id)
    form = UserUpdateForm(obj=user)
    if form.validate_on_submit():
        user.username = form.username.data
        user.email = form.email.data
        user.first_name = form.first_name.data
        user.last_name = form.last_name.data
        db.session.commit()
        return redirect(f'/profile/{user.username}')
    return render_template('update_user.html', form=form, user=user)*/

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:userid", ensureLoggedIn, async function (req, res, next) {
  try {
    //const validator = jsonschema.validate(req.body, userUpdateSchema);
    /*if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }*/

    const user = await User.update(req.params.userid, req.body);
    console.log("USer Edited", user);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** Update user, returning user */
/*router.patch("/:id", async function (req, res, next) {
  try {
    const { name, type } = req.body;
    const result = await db.query(
      `UPDATE users SET name=$1, type=$2
    WHERE id = $3
               RETURNING id, name, type`,
      [name, type, req.params.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});*/

module.exports = router;
