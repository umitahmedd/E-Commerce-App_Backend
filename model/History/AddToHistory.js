const client = require("../../config/database");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;

router.post("/", (req, res) => {
  try {
    
    const HeaderToken = req.headers.authorization;
    const token = HeaderToken ? HeaderToken.replace("Bearer ", "") : null;
    const payload = jwt.decode(token, JWT_KEY);
    const { product_id } = req.body;
    const currentDate = new Date();
    const timestamp =  Math.floor(currentDate.getTime() / 1000);
    if (!token || !payload || !product_id) {
      res
        .status(404)
        .json({ message: "There is one or many Undefined values" });
      return;
    } else {
      const user_id = payload.user_id;
      client.query(
        "SELECT * FROM histories INNER JOIN history_user ON histories.history_id = history_user.history_id WHERE history_user.user_id = $1",
        [user_id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: err });
          }

          if (result.rows.length > 0) {
            const history_id = result.rows[0].history_id;
            client.query(
              "SELECT * FROM history_product WHERE product_id = $1 AND history_id = $2",
              [product_id, history_id],
              (err2, result2) => {
                if (err2) {
                  console.log(err2);
                  res.status(500).json({ message: err2 });
                }

                if (result2.rows.length === 0) {
                  client.query(
                    "INSERT INTO history_product(history_id, product_id, lookup_date) values($1,$2,$3)",
                    [history_id, product_id, timestamp],
                    (err3, result3) => {
                      if (err3) {
                        console.log(err3);
                        res.status(500).json({ message: err3 });
                      }
                      res.status(200).json({
                        message: `Product ${product_id} was added to history`,
                      });
                    }
                  );
                }

                if (result2.rows.length > 0) {
                  client.query(
                    "UPDATE history_product SET lookup_date = $1 where history_id = $2 AND product_id = $3",
                    [timestamp, history_id, product_id],
                    (err4, result4) => {
                      if (err4) {
                        console.log(err4);
                        res.status(500).json({ message: err4 });
                      }
                      res.status(200).json({
                        message: `lookup_date of product ${product_id} has changed`,
                      });
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong", error });
  }
});

module.exports = router;
