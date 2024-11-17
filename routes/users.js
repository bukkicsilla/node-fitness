const express = require("express");
const User = require("../models/User");
const Exercise = require("../models/Exercise");
const UserVideo = require("../models/UserVideo");
const Playlist = require("../models/Playlist");
const middleware = require("../middleware");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/jwt");

const router = new express.Router();

function transformWord(word) {
  // Case 1: Capitalize a single word (e.g., "abdominals" -> "Abdominals")
  if (!word.includes("_")) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // Case 2: Replace underscore with space and capitalize each word (e.g., "lower_back" -> "Lower Back")
  return word
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

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

/*async function getMuscleGroups(exercises, userVideoIdSet) {
  const muscleGroups = {};

  await Promise.all(
    exercises.map(async (exercise) => {
      const exerciseWithVideos = await Exercise.getExerciseByName(
        exercise.name
      );
      //console.log("Exercise with Videos", exerciseWithVideos.videos);

      const videoIds = exerciseWithVideos.videos.map((video) => video.id);
      const hasUserVideos = videoIds.some((id) => userVideoIdSet.has(id));

      if (exerciseWithVideos.videos.length && hasUserVideos) {
        const transformedMuscle = transformWord(exercise.muscle);
        if (!muscleGroups[transformedMuscle]) {
          muscleGroups[transformedMuscle] = [];
        }
        muscleGroups[transformedMuscle].push({
          ...exercise,
          videos: exerciseWithVideos.videos.filter((video) =>
            userVideoIdSet.has(video.id)
          ),
        });
      }
    })
  );
  console.log("Muscle Groups", muscleGroups);
  return muscleGroups;
}

router.get("/:id/videos", async function (req, res, next) {
  try {
    const user = await User.getUserById(req.params.id);
    const userVideoIdSet = new Set(user.videoIds);
    console.log("Video Set", userVideoIdSet);
    const exercises = await Exercise.getExercises();
    const muscleGroups = await getMuscleGroups(exercises, userVideoIdSet);
    return res.json({
      muscle_groups: muscleGroups,
      ids: user.videoIds,
    });
  } catch (err) {
    return next(err);
  }
});*/

async function getMuscleGroups(exercises, userVideoIdSet) {
  const muscleGroups = {};

  exercises.forEach((exercise) => {
    const videos = exercise.videos.filter((video) =>
      userVideoIdSet.has(video.id)
    );
    if (videos.length) {
      const transformedMuscle = transformWord(exercise.muscle);
      if (!muscleGroups[transformedMuscle]) {
        muscleGroups[transformedMuscle] = [];
      }
      muscleGroups[transformedMuscle].push({
        ...exercise,
        videos,
      });
    }
  });

  return muscleGroups;
}

router.get("/:id/videos", async function (req, res, next) {
  try {
    const user = await User.getUserById(req.params.id);
    const userVideoIdSet = new Set(user.videoIds);
    const exercises = await Exercise.getExercisesWithVideos(); // Modify this to fetch all exercises with videos in one go
    const muscleGroups = await getMuscleGroups(exercises, userVideoIdSet);
    return res.json({
      muscle_groups: muscleGroups,
      ids: user.videoIds,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/playlists", async function (req, res, next) {
  try {
    const playlists = await Playlist.getPlaylistsByUser(req.params.id);
    return res.json({ playlists });
  } catch (err) {
    return next(err);
  }
});

router.get("/playlists/:playlistid/videos", async function (req, res, next) {
  try {
    const data = await Playlist.getPlaylistVideos(req.params.playlistid);
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/playlists-with-videos", async function (req, res, next) {
  try {
    const playlists = await Playlist.getAllPlaylistsWithVideosByUser(
      req.params.id
    );
    return res.json({ playlists });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    //let user = await User.getUserById(req.params.id);
    await UserVideo.deleteAllVideos(req.params.id);
    await Playlist.deleteAllPlaylists(req.params.id);
    await User.removeUser(req.params.id);
    return res.json({ msg: " user deleted" });
  } catch (e) {
    return next(e);
  }
});

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
    //console.log("User Edited", user);
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
