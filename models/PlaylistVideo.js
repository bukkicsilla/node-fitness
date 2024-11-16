const db = require("../db");

class PlaylistVideo {
  constructor(playlist_id, video_id) {
    this.playlist_id = playlist_id;
    this.video_id = video_id;
  }

  static async getPlaylistVideo(playlist_id, video_id) {
    const result = await db.query(
      `SELECT playlist_id, video_id
           FROM playlists_videos
           WHERE playlist_id = $1 AND video_id = $2`,
      [playlist_id, video_id]
    );
    const playlistVideo = result.rows[0];
    return playlistVideo;
  }

  static async addPlaylistVideo(playlist_id, video_id) {
    const result = await db.query(
      `INSERT INTO playlists_videos (playlist_id, video_id)
           VALUES ($1, $2)
           RETURNING playlist_id, video_id`,
      [playlist_id, video_id]
    );
    const playlistVideo = result.rows[0];
    return playlistVideo;
  }

  static async deletePlaylistVideo(playlist_id, video_id) {
    const result = await db.query(
      `DELETE FROM playlists_videos
           WHERE playlist_id = $1 AND video_id = $2
           RETURNING playlist_id, video_id`,
      [playlist_id, video_id]
    );
    return result.rowCount;
  }
}
module.exports = PlaylistVideo;
