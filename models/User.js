const db = require("../db");
const { NotFoundError } = require("../expressError");
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

  static async getUserById(id) {
    const results = await db.query(
      `SELECT id, username, email, first_name, last_name
       FROM users
       WHERE id = $1`,
      [id]
    );
    const user = results.rows[0];
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return new User(
      user.id,
      user.username,
      user.email,
      user.first_name,
      user.last_name
    );
  }

  static async deleteUser(username) {
    const results = await db.query("DELETE FROM users WHERE username = $1", [
      username,
    ]);
    return results.rowCount;
  }
  async remove() {
    await db.query(
      `
      DELETE FROM users
      WHERE id = $1
    `,
      [this.id]
    );
  }
}
module.exports = User;
