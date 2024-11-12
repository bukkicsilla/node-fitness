const bcrypt = require("bcrypt");
const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
class Exercise {
  constructor(
    name,
    exercise_type,
    muscle,
    equipment,
    difficulty,
    instructions
  ) {
    this.name = name;
    this.exercise_type = exercise_type;
    this.muscle = muscle;
    this.equipment = equipment;
    this.difficulty = difficulty;
    this.instructions = instructions;
  }
  static async getExercises() {
    const results = await db.query(`SELECT * FROM exercises`);
    const exercises = results.rows.map(
      (exercise) =>
        new Exercise(
          exercise.name,
          exercise.exercise_type,
          exercise.muscle,
          exercise.equipment,
          exercise.difficulty,
          exercise.instructions
        )
    );
    return exercises;
  }
  static async getExerciseByName(name) {
    const results = await db.query(`SELECT * FROM exercises WHERE name = $1`, [
      name,
    ]);
    const exercise = results.rows[0];
    if (!exercise) {
      throw new NotFoundError("User not found");
    }
    const videosResults = await db.query(
      `SELECT id, videoid FROM videos WHERE exercise_name = $1`,
      [name]
    );
    exercise.videos = videosResults.rows;
    return exercise;
  }
}
module.exports = Exercise;
