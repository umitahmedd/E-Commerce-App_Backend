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
      "SELECT product_id FROM favorites WHERE user_id = $1",
      [user_id],
      (err, result) => {
        if (err) {
          res.status(500), json({ message: err });
          console.log(err);
        }
        if (result.rows.length > 0) {
          const favorites = result.rows;

          const favoriteIds = [];
          favorites.forEach((favorite) => {
            favoriteIds.push(favorite.product_id);
          });
          res
            .status(200)
            .json({ product_ids: favoriteIds, message: "product ids fetched" });
        } else if (result.rows.length == 0) {
          res.status(204).json({ message: "favorite list is empty" });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
});

module.exports = router;
