const jwt = require("jsonwebtoken");
const client = require("../config/database");
const { JWT_KEY } = process.env;
const { JWT_REFRESH_KEY } = process.env;

const UserAuthorization = (req, res, next) => {
  try {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null;

    jwt.verify(token, JWT_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log(err);
          res.status(401).json({ error: "Token expired" });
        } else {
          return res
            .status(400)
            .json({ message: "Error while verifying access token" });
        }
      } else {
        if (payload.authorization == "basic") {
          next();
        } else {
          res.status(401).json({ message: "Unauthorizated" });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = UserAuthorization;
