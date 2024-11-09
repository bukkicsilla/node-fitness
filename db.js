"use strict";
const { Client } = require("pg");
const { getDBUri } = require("./config");
const { getDatabaseUri } = require("./config");

//let DB_URI = "postgresql:///workout_flask";
/*let db = new Client({
  connectionString: getDBUri(),
});

db.connect();*/

let db;
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}

db.connect();

module.exports = db;
