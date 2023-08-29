const router = require("express").Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const client = require("../../config/database");
const { json } = require("body-parser");
dotenv.config();
const { JWT_KEY } = process.env;

router.get("/", (req, res) => {
  try {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null;
    const decodeToken = jwt.decode(token, JWT_KEY);
    const user_id = decodeToken.user_id;

    client.query(
      "SELECT * FROM products INNER JOIN favorites ON favorites.product_id = products.product_id WHERE favorites.user_id = $1",
      [user_id],
      (err, result) => {
        if (err) {
          res.status(500), json({ message: err });
          console.log(err);
        }

        if (result.rows.length > 0) {
          const favorites = result.rows;
          res.status(200).json({ favorites });
        } else {
          res.status(204).json("favorites list is empty");
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500), json({ message: err });
  }
});

module.exports = router;
