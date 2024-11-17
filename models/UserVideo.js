const db = require("../db");
class UserVideo {
  constructor(user_id, video_id, rating) {
    this.user_id = user_id;
    this.video_id = video_id;
    this.rating = rating;
  }

  static async getUserVideo(user_id, video_id) {
    const result = await db.query(
      `SELECT user_id, video_id, rating
           FROM users_videos
           WHERE user_id = $1 AND video_id = $2`,
      [user_id, video_id]
    );
    const userVideo = result.rows[0];
    return userVideo;
  }

  static async addUserVideo(userid, videoid, rating) {
    const result = await db.query(
      `INSERT INTO users_videos (user_id, video_id, rating)
           VALUES ($1, $2, $3)
           RETURNING user_id, video_id, rating`,
      [userid, videoid, rating]
    );
    const userVideo = result.rows[0];
    return userVideo;
  }

  static async deleteUserVideo(user_id, video_id) {
    const result = await db.query(
      `DELETE FROM users_videos
           WHERE user_id = $1 AND video_id = $2
           RETURNING user_id, video_id`,
      [user_id, video_id]
    );
    return result.rowCount;
  }

  static async deleteAllVideos(userid) {
    const result = await db.query(
      `DELETE FROM users_videos
           WHERE user_id = $1
           RETURNING user_id`,
      [userid]
    );
    return result.rowCount;
  }

  static async updateUserVideo(userid, video_id, rating) {
    const result = await db.query(
      `UPDATE users_videos SET rating=$1
         WHERE user_id = $2 AND video_id = $3
                 RETURNING user_id, video_id, rating`,
      [rating, userid, video_id]
    );
    const uservideo = result.rows[0];

    if (!uservideo) throw new NotFoundError(`No uservideo`);
    return uservideo;
  }

  static async getAllUserVideos(video_id) {
    const result = await db.query(
      `SELECT user_id, video_id, rating
           FROM users_videos
           WHERE video_id = $1`,
      [video_id]
    );
    const userVideos = result.rows;
    return userVideos;
  }
}
module.exports = UserVideo;
