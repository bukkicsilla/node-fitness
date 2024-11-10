const express = require("express");
const axios = require("axios");

const { NotFoundError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/jwt");

const router = new express.Router();
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";

router.get("/", (req, res, next) => {
  res.send("API FITNESS");
});

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
