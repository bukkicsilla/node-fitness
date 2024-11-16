const express = require("express");
const User = require("../models/User");
//const Exercise = require("../models/Exercise");
const Playlist = require("../models/Playlist");
const PlaylistVideo = require("../models/PlaylistVideo");
const { ensureLoggedIn } = require("../middleware/jwt");
const router = new express.Router();

/*    @app.route('/auth/playlists/<playlist_name>/delete/<int:video_id>')
    def delete_from_playlist(playlist_name, video_id):
        '''Delete a video from a playlist.'''
        playlist = Playlist.query.filter(Playlist.name==playlist_name, Playlist.user_id==session['user_id']).first()
        le = len(playlist.videos)
        pv = PlaylistVideo.query.filter(PlaylistVideo.playlist_id==playlist.id, PlaylistVideo.video_id==video_id).first()
        db.session.delete(pv)
        db.session.commit()
        if le > 1:
            return redirect('/auth/playlists')
        db.session.delete(playlist)
        db.session.commit()
        return redirect('/auth/playlists')*/

router.post("/:video_id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { video_id } = req.params;
    const { name } = req.body;
    const userid = res.locals.user.userid;
    const existing_playlist = await Playlist.getPlaylist(name, userid);
    if (!existing_playlist) {
      const newPlaylist = await Playlist.addPlaylist(name, userid);
      const pv = await PlaylistVideo.addPlaylistVideo(newPlaylist.id, video_id);
      return res
        .status(201)
        .json({ msg: "New Playlist added", newPlaylist, pv });
    }
    const existing_pv = await PlaylistVideo.getPlaylistVideo(
      existing_playlist.id,
      video_id
    );
    if (existing_pv) {
      return res.json({
        msg: "Video already added to the playlist.",
        existing_playlist,
        existing_pv,
      });
    }
    const pv = await PlaylistVideo.addPlaylistVideo(
      existing_playlist.id,
      video_id
    );
    return res.json({ msg: "Video adeed to the Playlist", pv });
  } catch (err) {
    return next(err);
  }
});

/*Delete a playlist*/
router.delete("/:name/:userid", async function (req, res, next) {
  try {
    const { name, userid } = req.params;
    await Playlist.deletePlaylist(name, userid);
    return res.json({ msg: "Playlist deleted" });
  } catch (err) {
    return next(err);
  }
});

/*Delete a video from a playlist*/
router.delete("/plv/:playlist_id/:video_id", async function (req, res, next) {
  try {
    const { playlist_id, video_id } = req.params;
    //console.log("playlist_id", playlist_id);
    //console.log("video_id", video_id);
    await PlaylistVideo.deletePlaylistVideo(playlist_id, video_id);
    return res.json({ msg: "PlaylistVideo entry deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
