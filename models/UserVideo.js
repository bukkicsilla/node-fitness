const db = require("../db");
const { NotFoundError } = require("../expressError");
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
    //console.log("userid", userid);
    //console.log("videoid", videoid);
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
}
module.exports = UserVideo;
