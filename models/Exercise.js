//const bcrypt = require("bcrypt");
const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");
//const { BCRYPT_WORK_FACTOR } = require("../config");
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
      `SELECT id, videoid, rating  FROM videos WHERE exercise_name = $1`,
      [name]
    );
    exercise.videos = videosResults.rows;
    return exercise;
  }
  // Fetch all exercises with their associated videos
  static async getExercisesWithVideos() {
    // Query to fetch exercises and their related videos in one go
    const result = await db.query(
      `SELECT 
         exercises.name AS exercise_name,
         exercises.exercise_type,
         exercises.muscle,
         exercises.equipment,
         exercises.difficulty,
         videos.id AS video_id,
         videos.videoid AS video_videoid,
         videos.title AS video_title,
         videos.rating AS video_rating
       FROM exercises
       LEFT JOIN videos ON exercises.name = videos.exercise_name
       ORDER BY exercises.name`
    );

    // Organize the result into a structured format
    const exercisesMap = {};

    result.rows.forEach((row) => {
      const exerciseName = row.exercise_name;

      // If the exercise is not yet in the map, add it
      if (!exercisesMap[exerciseName]) {
        exercisesMap[exerciseName] = {
          name: row.exercise_name,
          exercise_type: row.exercise_type,
          muscle: row.muscle,
          equipment: row.equipment,
          difficulty: row.difficulty,
          videos: [],
        };
      }

      // If there is a video for this exercise, add it to the exercise's videos list
      if (row.video_id) {
        exercisesMap[exerciseName].videos.push({
          id: row.video_id,
          videoid: row.video_videoid,
          title: row.video_title,
          rating: row.video_rating,
        });
      }
    });

    // Convert the map to an array of exercises
    return Object.values(exercisesMap);
  }
}
module.exports = Exercise;
