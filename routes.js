const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const db = require("./db");
const User = require("./models/User");
const middleware = require("./middleware");
const {
  NotFoundError,
  BadRequestError,
  ExpressError,
} = require("./expressError");
const router = new express.Router();
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";
const BCRYPT_WORK_FACTOR = 12;

router.get("/", (req, res, next) => {
  res.send("API FITNESS");
});

/*def api_exercise_by_muscle(muscle):
    #muscle = request.args.get('muscle')
    res_exercises = requests.get(f"{BASE_URL_WORKOUT}/exercises?muscle={muscle}").json()
    return jsonify(res_exercises['exercises'])*/

/*router.get("/:handle", async function (req, res, next) {
        try {
          const company = await Company.get(req.params.handle);
          return res.json({ company });
        } catch (err) {
          return next(err);
        }
      });*/

router.get("/exercises/:muscle", async (req, res, next) => {
  const { muscle } = req.params;
  try {
    //const resExercises = await axios.get(
    // `${BASE_URL_WORKOUT}/exercises?muscle=${muscle}`
    //);
    const resExercises = await axios.get(`${BASE_URL_WORKOUT}/exercises`, {
      params: { muscle },
    });
    if (!resExercises) {
      throw new NotFoundError("No exercises found");
    }
    //console.log(resExercises.data.exercises);
    return res.status(200).json(resExercises.data.exercises);
  } catch (err) {
    return next(err);
  }
});

/*@app.route('/videos')
def get_videos():
    '''Get YoutTube videos with a specific exercise name from the workout API.'''
    if not_authorized():
        return redirect('/auth')
    name = request.args.get('name')
    res_videos = requests.get(f"{BASE_URL_WORKOUT}/videos?name={name}").json()
    #res = requests.get(f"{BASE_URL_WORKOUT}/videos").json()
    #return jsonify(res['videos'])
    return render_template('videos.html', name=name, videos=res_videos['videos']) */
router.get("/videos/:name", async (req, res, next) => {
  const { name } = req.params;
  try {
    const resVideos = await axios.get(`${BASE_URL_WORKOUT}/videos`, {
      params: { name },
    });
    if (!resVideos) {
      throw new NotFoundError("No videos found");
    }
    return res.status(200).json(resVideos.data.videos);
  } catch (err) {
    return next(err);
  }
});

//test db
router.get("/users", middleware.allowThis, async function (req, res, next) {
  try {
    //const results = await db.query(`SELECT * FROM users`);
    //return res.json(results.rows);
    let users = await User.getUsers();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

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
