const client = require("../../config/database");
const router = require('express').Router();

router.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT product_id, COUNT(user_id) AS user_count FROM favorites GROUP BY product_id ORDER BY user_count DESC LIMIT 40");

        if (result.rows.length > 0) {
            const products1 = result.rows;
            let productsId = products1.map(product => product.product_id);

            // Prepare the placeholders and query string for IN clause
            const placeholders = productsId.map((_, idx) => `$${idx + 1}`).join(',');
            const queryStr = `SELECT * FROM products WHERE product_id IN (${placeholders})`;

            const productsResult = await client.query(queryStr, productsId);

            if (productsResult.rows.length > 0) {
                res.status(200).json({ products: productsResult.rows });
            } else {
                res.status(204).json({ message: "products list is empty" });
            }
        } else {
            res.status(204).json({ message: "products list is empty" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
