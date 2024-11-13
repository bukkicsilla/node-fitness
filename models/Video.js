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
}
module.exports = Video;
