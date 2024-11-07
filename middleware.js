const ExpressError = require("./expressError");
const { UnauthorizedError } = require("./expressError");
function allowThis(req, res, next) {
  try {
    if (req.query.secret === "timetravel") {
      return next();
    } else {
      throw new UnauthorizedError();
    }
  } catch (err) {
    return next(err);
  }
}
module.exports = { allowThis };
