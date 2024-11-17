const express = require("express");
const axios = require("axios");
const UserVideo = require("../models/UserVideo");
const Video = require("../models/Video");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/jwt");
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";
const router = new express.Router();

router.post("/:name/:videoid", ensureLoggedIn, async function (req, res, next) {
  try {
    const { name, videoid } = req.params;
    if (!name || !videoid) {
      throw new BadRequestError("Missing required fields");
    }
    if (!res.locals.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    const userid = res.locals.user.userid;
    const localVideo = await Video.getVideo(videoid, name);
    if (!localVideo) {
      const videos = await axios.get(`${BASE_URL_WORKOUT}/videos/videoid`, {
        params: { videoid },
      });
      const video = videos.data.videos[0];
      const newVideo = await Video.addVideo({ ...video });
      const newUserVideo = await UserVideo.addUserVideo(userid, newVideo.id, 5);
      return res.status(201).json({ msg: "New Video and UserVideo added" });
    }
    const uv = await UserVideo.getUserVideo(userid, localVideo.id);
    if (!uv) {
      const newUserVideo = await UserVideo.addUserVideo(
        userid,
        localVideo.id,
        5
      );
      return res.json({ msg: "New UserVideo added" });
    }
    return res.json({ msg: "Video already added" });
  } catch (err) {
    return next(err);
  }
});

/*It won't be neccessary during production*/
/*router.delete("/:id", async function (req, res, next) {
  try {
    await Video.deleteVideo(req.params.id);
    return res.json({ msg: "Video deleted" });
  } catch (err) {
    return next(err);
  }
});*/

router.delete("/uv/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    const userid = res.locals.user.userid;
    await UserVideo.deleteUserVideo(userid, req.params.id);
    return res.json({ msg: "UserVideo deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
