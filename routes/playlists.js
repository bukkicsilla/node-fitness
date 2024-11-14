const express = require("express");
const User = require("../models/User");
const Exercise = require("../models/Exercise");
const router = new express.Router();

/*@app.route('/auth/playlists/add/<int:video_id>', methods=['GET', 'POST'])
    def add_to_playlist(video_id):
        '''Add a video to a playlist.'''
        #duplicate video warning ... !!!
        form = PlaylistForm()
        if form.validate_on_submit():
            name = form.name.data
            existing_playlist = Playlist.query.filter(Playlist.name==name, Playlist.user_id==session['user_id']).first()
            if not existing_playlist:
                playlist = Playlist(name=name, user_id=session['user_id'])  
                db.session.add(playlist)
                db.session.commit()
                pl = Playlist.query.filter(Playlist.name==name, Playlist.user_id==session['user_id']).first()
                pv = PlaylistVideo(playlist_id=pl.id, video_id=video_id)
                db.session.add(pv)
                db.session.commit()
                return redirect('/auth/playlists')
            existing_pv = PlaylistVideo.query.filter(PlaylistVideo.playlist_id==existing_playlist.id, PlaylistVideo.video_id==video_id).first()
            if existing_pv:
                print("existing_pv", existing_pv)
                flash('Video already added to the playlist', 'msguser')
                return redirect('/auth/playlists')
            pv = PlaylistVideo(playlist_id=existing_playlist.id, video_id=video_id)
            db.session.add(pv)
            db.session.commit()
            return redirect('/auth/playlists')
        else:
            return render_template('add_to_playlist.html', form=form)*/

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

router.post("/:id", async function (req, res, next) {
  try {
    const { video_id } = req.params;
    const { name } = req.body;
    const existing_playlist = await User.getPlaylistByName(name, req.user.id);
    if (!existing_playlist) {
      const playlist = await User.addPlaylist(name, req.user.id);
      await User.addPlaylistVideo(playlist.id, video_id);
      return res.redirect("/auth/playlists");
    }
    const existing_pv = await User.getPlaylistVideo(
      existing_playlist.id,
      video_id
    );
    if (existing_pv) {
      return res.json({ msg: "Video already added to the playlist" });
    }
    await User.addPlaylistVideo(existing_playlist.id, video_id);
    return res.redirect("/auth/playlists");
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    await User.deletePlaylistVideo(req.params.id, req.user.id);
    return res.redirect("/auth/playlists");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
