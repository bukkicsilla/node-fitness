const bcrypt = require("bcrypt");
const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
class User {
  constructor(id, username, password, email, first_name, last_name) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
  }

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT  id,
                   username,
                  password,
                  email,
                  first_name,
                  last_name
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    console.log("user", user);

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ username, password, email, first_name, last_name }) {
    const duplicateCheck = await db.query(
      `SELECT username
         FROM users
         WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
         (username,
          password,
          email,
          first_name,
          last_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING username, email, first_name, last_name`,
      [username, hashedPassword, email, first_name, last_name]
    );

    const user = result.rows[0];

    return user;
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

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT id, username,
              email,
                  first_name,
                  last_name
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];
    console.log("user by username", user);

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
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
