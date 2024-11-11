"use strict";
require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "fitness-secret";

const PORT = +process.env.PORT || 3001;
const FITNESS_DB = "postgresql:/workout_flask";
/*const FITNESS_DB =
  "postgresql://postgres.jljzqisclorjmtmwcnog:FlaskW0rk0ut42.@aws-0-us-west-1.pooler.supabase.com:6543/postgres";*/

function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:/workout_flask_test"
    : process.env.DATABASE_URL || FITNESS_DB;
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green);
console.log("SECRET_KEY:".blue, SECRET_KEY);
console.log("PORT:".blue, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".red, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
