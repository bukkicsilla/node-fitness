const express = require("express");
const Playlist = require("../models/Playlist");
const PlaylistVideo = require("../models/PlaylistVideo");
const { ensureLoggedIn } = require("../middleware/jwt");
const router = new express.Router();

router.post(
  "/videos/:name/:video_id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { video_id, name } = req.params;
      //const { name } = req.body;
      const userid = res.locals.user.userid;
      const existing_playlist = await Playlist.getPlaylist(name, userid);
      if (!existing_playlist) {
        const newPlaylist = await Playlist.addPlaylist(name, userid);
        const pv = await PlaylistVideo.addPlaylistVideo(
          newPlaylist.id,
          video_id
        );
        return res.status(201).json({ msg: "New Playlist added" });
      }
      const existing_pv = await PlaylistVideo.getPlaylistVideo(
        existing_playlist.id,
        video_id
      );
      if (existing_pv) {
        return res.json({ msg: "Video already added to the playlist" });
      }
      const pv = await PlaylistVideo.addPlaylistVideo(
        existing_playlist.id,
        video_id
      );
      return res.json({ msg: "Video adeed to the Playlist" });
    } catch (err) {
      return next(err);
    }
  }
);

/*Delete a video from a playlist. 
If the playlist is empty after the deletion, the playlist is also deleted.*/
router.delete(
  "/videos/:name/:video_id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { name, video_id } = req.params;
      const userid = res.locals.user.userid;
      const playlist = await Playlist.getPlaylist(name, userid);
      await PlaylistVideo.deletePlaylistVideo(playlist.id, video_id);
      const playlist2 = await Playlist.getPlaylistVideos(playlist.id);
      const firstVideo = playlist2.videos[0];
      if (firstVideo.id) {
        return res.json({ msg: "Video deleted from the playlist" });
      }
      await Playlist.deletePlaylist(name, userid);
      return res.json({ msg: "Video and Playlist deleted." });
    } catch (err) {
      return next(err);
    }
  }
);

/*Delete a playlist, not for production*/
/*router.delete("/:name/:userid", async function (req, res, next) {
  try {
    const { name, userid } = req.params;
    await Playlist.deletePlaylist(name, userid);
    return res.json({ msg: "Playlist deleted" });
  } catch (err) {
    return next(err);
  }
});*/

/*Delete a video from a playlist, not for production*/
/*router.delete("/plv/:playlist_id/:video_id", async function (req, res, next) {
  try {
    const { playlist_id, video_id } = req.params;
    await PlaylistVideo.deletePlaylistVideo(playlist_id, video_id);
    return res.json({ msg: "PlaylistVideo entry deleted" });
  } catch (err) {
    return next(err);
  }
});*/

module.exports = router;
