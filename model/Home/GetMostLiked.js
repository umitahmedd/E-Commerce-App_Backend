const client = require("../../config/database");
const router = require('express').Router();

router.get("/", async (req, res) => {
    try {
        client.query("SELECT product_id, COUNT(user_id) AS user_count FROM favorites GROUP BY product_id ORDER BY user_count DESC LIMIT 20", (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({message: err.message});
            }
            if (result.rows.length > 0) {
                const products1 = result.rows;
                let productsId = []
                products1.forEach(product=>{
                    console.log(product.product_id);
                    productsId.push(product.product_id)
                    console.log(productsId);
                })

                const placeholders = productsId.map((_, i) => `$${i + 1}`).join(',');

                client.query(`select * from products where product_id IN ($1)`, productsId, (err2, result2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({message: "error"});
                    }
                    if (result2.rows.length > 0) {
                        const products = result2.rows;
                        res.status(200).json({products});
                    } else {
                        console.log("products list is empty");
                        res.status(204).json({message: "products list is empty"});
                    }
                })


            } else {
                console.log("products list is empty");
                res.status(204).json({message: "products list is empty"});
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: err.message});
    }
});

module.exports = router;