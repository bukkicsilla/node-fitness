const db = require("../db");
class User {
  constructor(id, username, password, email, first_name, last_name) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
  }
  static async getUsers() {
    const results = await db.query(`SELECT * FROM users`);
    const users = results.rows.map(
      (user) =>
        new User(
          user.id,
          user.username,
          user.password,
          user.email,
          user.first_name,
          user.last_name
        )
    );
    return users;
  }
  static async getUser(username) {
    const results = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);
    const user = results.rows[0];
    return new User(
      user.id,
      user.username,
      user.password,
      user.email,
      user.first_name,
      user.last_name
    );
  }
}
module.exports = User;
