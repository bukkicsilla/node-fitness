const express = require("express");
const axios = require("axios");
const router = new express.Router();
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";

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

module.exports = router;
