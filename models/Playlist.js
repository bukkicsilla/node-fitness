const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");
class Playlist {
  constructor(id, name, user_id) {
    this.id = id;
    this.name = name;
    this.user_id = user_id;
  }
  /*static async getPlaylists() {
    const results = await db.query(`SELECT * FROM playlists`);
    const playlists = results.rows.map(
      (playlist) => new Playlist(playlist.id, playlist.name, playlist.user_id)
    );
    return playlists;
  }*/
  static async getPlaylistsByUser(userid) {
    const results = await db.query(
      `SELECT * FROM playlists WHERE user_id = $1`,
      [userid]
    );
    const playlists = results.rows;
    return playlists;
  }
  static async getPlaylistVideos(playlistid) {
    const results = await db.query(`SELECT * FROM playlists WHERE id = $1`, [
      playlistid,
    ]);
    const playlist = results.rows[0];
    const videosResults = await db.query(
      `SELECT playlists.id, playlists.name, videos.id, videos.videoid FROM playlists
        LEFT JOIN playlists_videos ON playlists.id = playlists_videos.playlist_id
        LEFT JOIN videos ON playlists_videos.video_id = videos.id
        WHERE playlists.id = $1`,
      [playlistid]
    );
    playlist.videos = videosResults.rows.map((row) => {
      return { id: row.id, videoid: row.videoid };
    });
    return playlist;
  }

  static async getAllPlaylistsWithVideosByUser(userid) {
    const playlistsResults = await db.query(
      `SELECT * FROM playlists WHERE user_id = $1`,
      [userid]
    );
    const playlists = playlistsResults.rows;

    // Loop through each playlist to get associated videos
    for (let playlist of playlists) {
      const videosResults = await db.query(
        `SELECT videos.id, videos.videoid, videos.exercise_name FROM playlists
           LEFT JOIN playlists_videos ON playlists.id = playlists_videos.playlist_id
           LEFT JOIN videos ON playlists_videos.video_id = videos.id
           WHERE playlists.id = $1`,
        [playlist.id]
      );
      playlist.videos = videosResults.rows.map((row) => ({
        id: row.id,
        videoid: row.videoid,
        exercise_name: row.exercise_name,
      }));
    }
    return playlists;
  }

  static async getPlaylist(name, userid) {
    const result = await db.query(
      `SELECT id, name, user_id
           FROM playlists
           WHERE name = $1 AND user_id = $2`,
      [name, userid]
    );
    const playlist = result.rows[0];
    return playlist;
  }

  static async addPlaylist(name, userid) {
    const result = await db.query(
      `INSERT INTO playlists (name, user_id)
           VALUES ($1, $2)
           RETURNING id, name, user_id`,
      [name, userid]
    );
    const playlist = result.rows[0];
    return playlist;
  }

  static async deletePlaylist(name, userid) {
    const result = await db.query(
      `DELETE FROM playlists
           WHERE name = $1 AND user_id = $2
           RETURNING name`,
      [name, userid]
    );

    return result.rowCount;
  }
}
module.exports = Playlist;
