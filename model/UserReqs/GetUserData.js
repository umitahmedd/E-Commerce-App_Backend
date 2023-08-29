const client = require("../../config/database");
const router = require("express").Router();
const { JWT_KEY } = process.env;
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null;
  const decodeToken = jwt.decode(token, JWT_KEY);
  const userId = decodeToken.user_id;
  try {
    const user = await client.query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);

    const userData = user.rows[0];
    res.status(200).json({
      user_name: userData.user_name,
      user_mail: userData.user_mail,
      user_adress: userData.user_adress,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
