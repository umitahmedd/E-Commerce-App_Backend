const client = require("../../config/database");
const router = require('express').Router();
const {JWT_KEY} = process.env
const dotenv = require('dotenv');
dotenv.config();
const jwt = require("jsonwebtoken");
const { types } = require('pg');
types.setTypeParser(1700, x => parseFloat(x));

router.get("/", (req, res) => {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader ? tokenHeader.replace('Bearer ', '') : null;
    const decodeToken = jwt.decode(token, JWT_KEY);
    const user_id = decodeToken.user_id;
    console.log(user_id);

    try {
        client.query("SELECT * FROM carts INNER JOIN cart_user ON cart_user.cart_id = carts.cart_id WHERE cart_user.user_id = $1", [user_id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: "An error occurred while fetching cart data." });
                return;
            }

            if (result.rows.length > 0){
                const cart_id = result.rows[0].cart_id
                console.log(cart_id);
                client.query("SELECT products.*, cart_product.product_total_price, cart_product.product_count, sellers.seller_name FROM products INNER JOIN cart_product ON cart_product.product_id = products.product_id INNER JOIN product_seller ON products.product_id = product_seller.product_id INNER JOIN sellers ON product_seller.seller_id = sellers.seller_id WHERE cart_product.cart_id = $1", [cart_id], (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                        res.status(500).json({ error: "An error occurred while fetching product data." });
                        return;
                    }
                    if (result2.rows.length > 0){
                        const products = result2.rows
                        res.status(200).json({products: products})
                    } 
                    else if (result2.rows.length == 0){
                        res.status(204).json({products: []})
                    }   
                })
            }
            else{
                console.log("Cart not found.");
                res.status(404).json({ products: [] });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "An error occurred." });
    }
});

module.exports = router;
