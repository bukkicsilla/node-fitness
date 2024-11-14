const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");
//const { BCRYPT_WORK_FACTOR } = require("../config");
class Video {
  constructor(id, videoid, title, rating, exercise_name) {
    this.id = id;
    this.videoid = videoid;
    this.title = title;
    this.rating = rating;
    this.exercise_name = exercise_name;
  }
  static async getVideo(videoid, exercise_name) {
    const result = await db.query(
      `SELECT id, videoid, title, rating, exercise_name
           FROM videos
           WHERE videoid = $1 AND exercise_name = $2`,
      [videoid, exercise_name]
    );
    return result.rows[0];
  }
}
module.exports = Video;
