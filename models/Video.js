const db = require("../db");
const { NotFoundError } = require("../expressError");
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

  static async addVideo({ videoid, title, rating, exercise_name }) {
    const result = await db.query(
      `INSERT INTO videos
             (videoid, title, rating, exercise_name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, videoid, title, rating, exercise_name`,
      [videoid, title, rating, exercise_name]
    );
    const video = result.rows[0];
    return video;
  }

  static async deleteVideo(id) {
    const result = await db.query(
      `DELETE FROM videos
           WHERE id = $1`,
      [id]
    );
    //const video = result.rows[0];
    //console.log("video deleted", video);
    /*if (!video) {
      throw new NotFoundError("Video not found");
    }*/
    return result.rowCount;
  }

  static async updateVideo(video_id, rating) {
    const result = await db.query(
      `UPDATE videos SET rating=$1
         WHERE id = $2
                 RETURNING id, rating`,
      [rating, video_id]
    );
    const video = result.rows[0];
    if (!video) throw new NotFoundError(`No uservideo`);
    return video;
  }

  static async getBestVideos() {
    const result = await db.query(
      `SELECT id, videoid, title, rating, exercise_name
      FROM videos ORDER BY rating DESC LIMIT 10`
    );
    return result.rows;
  }
}
module.exports = Video;
