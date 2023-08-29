const client = require("../../config/database");
const router = require("express").Router();
const { JWT_KEY } = process.env;
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { types } = require("pg");
types.setTypeParser(1700, (x) => parseFloat(x));

router.get("/", (req, res) => {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null;
  const decodeToken = jwt.decode(token, JWT_KEY);
  const user_id = decodeToken.user_id;
  console.log(user_id);

  try {
    client.query(
      "SELECT * FROM histories INNER JOIN history_user ON history_user.history_id = histories.history_id WHERE history_user.user_id = $1",
      [user_id],
      (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching history data." });
          return;
        }
        if (result.rows.length > 0) {
          const history_id = result.rows[0].history_id;
          console.log(history_id);
          client.query(
            "SELECT products.*, history_product.lookup_date FROM products INNER JOIN history_product ON history_product.product_id = products.product_id WHERE history_product.history_id = $1 ORDER BY lookup_date DESC ",
            [history_id],
            (err2, result2) => {
              if (err2) {
                console.log(err2);
                res
                  .status(500)
                  .json({
                    error: "An error occurred while fetching product data.",
                  });
                return;
              }
              if (result2.rows.length > 0) {
                const products = result2.rows;
                res
                  .status(200)
                  .json({
                    products: products,
                    message: "pulling product history was successful",
                  });
              } else if (result2.rows.length == 0) {
                res
                  .status(204)
                  .json({
                    products: [],
                    message:
                      "pulling product history was successful history is empty",
                  });
              }
            }
          );
        } else {
          console.log("Cart not found.");
          res
            .status(404)
            .json({
              products: [],
              message: "pulling product history was unsuccessful",
            });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred." });
  }
});

module.exports = router;
