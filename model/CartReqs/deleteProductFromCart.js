const client = require("../../config/database");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;
const dotenv = require("dotenv");
dotenv.config();

router.delete("/", (req, res) => {
  try {
    const { product_id } = req.body;
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null;
    const decodedToken = jwt.decode(token, JWT_KEY);
    const user_id = decodedToken.user_id;
    client.query(
      "SELECT * FROM cart_product INNER JOIN cart_user ON cart_user.cart_id = cart_product.cart_id INNER JOIN users ON cart_user.user_id = users.user_id WHERE users.user_id =$1 AND cart_product.product_id = $2",
      [user_id, product_id],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: err });
        }
        if (result.rows.length > 0) {
          console.log("product id : " + result.rows[0].product_id);
          client.query(
            "DELETE FROM cart_product USING cart_user INNER JOIN users ON cart_user.user_id = users.user_id WHERE cart_product.cart_id = cart_user.cart_id AND users.user_id =$1 AND cart_product.product_id = $2 ",
            [user_id, product_id],
            (err2, result2) => {
              if (err2) {
                console.error(err2);
                res
                  .status(500)
                  .json({ message: "İşlem sırasında bir hata oluştu." });
              }

              res.status(200).json({ message: "Ürün başarıyla silindi." });
              console.log("urun basariyla silindi ");
            }
          );
        } else {
          res.status(404).json({ message: "Veriler bulunamadi" });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ message: err });
    console.log(err);
  }
});

module.exports = router;
