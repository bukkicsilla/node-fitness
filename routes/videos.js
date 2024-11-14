const express = require("express");
const axios = require("axios");
const User = require("../models/User");
//const Exercise = require("../models/Exercise");
const Video = require("../models/Video");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/jwt");
const BASE_URL_WORKOUT = "https://api-workout-sq1f.onrender.com/api/workout";
const router = new express.Router();

/*@app.route('/auth/videos/add/<name>/<videoid>')
def auth_save_video(name, videoid):
    '''Save a video to the database with authentication.'''
    local_video = Video.query.filter(Video.videoid==videoid, Video.exercise_name == name).first()
    if not local_video:
        videos = requests.get(f"{BASE_URL_WORKOUT}/videos/videoid?videoid={videoid}").json()
        video = videos['videos'][0]
        new_video = Video(videoid=video['videoid'], 
                      title=video['title'], 
                      rating=video['rating'],
                      exercise_name=video['exercise_name'])
        db.session.add(new_video)
        db.session.commit()
        uv = UserVideo(user_id=session['user_id'], video_id=new_video.id)
        db.session.add(uv)
        db.session.commit()
        return redirect('/auth/my_videos')
    user_video = UserVideo.query.filter(UserVideo.user_id==session['user_id'], UserVideo.video_id == local_video.id).first()
    if not user_video:
        uv = UserVideo(user_id=session['user_id'], video_id=local_video.id)
        db.session.add(uv)
        db.session.commit()
        return redirect('/auth/my_videos')
    flash('Video already added', 'msguser')
    return redirect("/")*/

/*@app.route('/auth/videos/delete/<int:id>')
def auth_delete_video(id):
    '''Delete a video to the database with authentication.'''
    user_video = UserVideo.query.filter(UserVideo.user_id==session['user_id'], UserVideo.video_id == id).first()
    db.session.delete(user_video)
    db.session.commit()
    return redirect('/auth/my_videos')*/

router.post("/:name/:videoid", ensureLoggedIn, async function (req, res, next) {
  try {
    const { name, videoid } = req.params;
    let video;
    if (!name || !videoid) {
      throw new BadRequestError("Missing required fields");
    }
    if (!res.locals.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    console.log(res.locals.user);
    const localVideo = await Video.getVideo(videoid, name);
    console.log(localVideo);
    if (!localVideo) {
      const videos = await axios.get(`${BASE_URL_WORKOUT}/videos/videoid`, {
        params: { videoid },
      });
      console.log("Videos", videos);
      //video = videos.data.videos[0];
    }

    return res.json({ msg: "Video added", localVideo });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    await User.deleteUserVideo(req.user.id, req.params.id);
    return res.redirect("/auth/my_videos");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
