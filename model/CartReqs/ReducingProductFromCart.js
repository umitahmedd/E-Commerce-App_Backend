const client = require("../../config/database");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;

router.patch("/", (req, res) => {
  try {
    const HeaderToken = req.headers.authorization;
    const token = HeaderToken ? HeaderToken.replace("Bearer ", "") : null;
    const payload = jwt.decode(token, JWT_KEY);
    const { product_id } = req.body;
    if (!token || !payload || !product_id) {
      res
        .status(404)
        .json({ message: "There is one or many Undefined values" });
      return;
    } else {
      const user_id = payload.user_id;
      client.query(
        "SELECT * FROM carts INNER JOIN cart_user ON carts.cart_id = cart_user.cart_id WHERE cart_user.user_id = $1",
        [user_id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: err });
          }
          if (result.rows.length > 0) {
            const cart_id = result.rows[0].cart_id;
            client.query(
              "SELECT product_price FROM products WHERE product_id = $1",
              [product_id],
              (err2, result2) => {
                if (err2) {
                  console.log(err2);
                  res.status(500).json({ message: err2 });
                }
                if (result2.rows.length > 0) {
                  const product_price = result2.rows[0].product_price;
                  client.query(
                    "SELECT * FROM cart_product WHERE cart_id = $1 AND product_id = $2",
                    [cart_id, product_id],
                    (err3, result3) => {
                      if (err3) {
                        console.log(err3);
                        res.status(500).json({ message: err3 });
                      } else if (result3.rows.length > 0) {
                        if (result3.rows[0].product_count > 1) {
                          const cart_product_id =
                            result3.rows[0].cart_product_id;
                          client.query(
                            "UPDATE cart_product SET product_total_price = product_total_price - $1 , product_count = product_count - $2 where cart_product_id = $3 ",
                            [product_price, 1, cart_product_id],
                            (err4, result4) => {
                              if (err4) {
                                console.log(err4);
                                res.status(500).json({ message: err4 });
                              }
                              res.status(200).json({
                                message: `product with product_id: ${product_id} was added to cart with cart_id: ${cart_id}`,
                              });
                            }
                          );
                        } else {
                          res.status(422).json({
                            message:
                              "left one product, you can't reduce product anymore",
                          });
                        }
                      }
                    }
                  );
                } else {
                  res.status(404).json({ message: "non" });
                }
              }
            );
          } else {
            res.status(404).json({ message: "non" });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: err });
  }
});

module.exports = router;
