const client = require("../../config/database");
const router = require('express').Router();
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const { JWT_KEY } = process.env

router.post("/", async (req, res) => {
    try {
        const { user_name, user_mail, user_adress, user_password } = req.body
        if (user_name && user_mail && user_adress && user_password) {
            const currentDate = new Date();
            const dateString = currentDate.toISOString();

            const oldUser = await client.query("SELECT * FROM users where user_mail = $1", [user_mail])

            if (oldUser.rows.length > 0) {
                res.status(400).json({ message: "User Already Exits. Please Login" })
                return
            }

            if (oldUser.rows.length === 0) {
                let encryptedPassword = await bcrypt.hash(user_password, 10)
                const newUser = await client.query("WITH newUser AS (INSERT INTO users (user_name, user_mail, user_adress, user_password) values ($1,$2,$3,$4) RETURNING user_id) SELECT user_id FROM newUser", [user_name, user_mail, user_adress, encryptedPassword])
                const user_id = newUser.rows[0].user_id;
                const newCart = await client.query("WITH newCart AS (INSERT INTO carts(cart_quantity, cart_created_date, cart_total_price) VALUES ($1, $2, $3) RETURNING cart_id) SELECT cart_id FROM newCart;", [0, dateString, 0.00]);
                const cart_id = newCart.rows[0].cart_id;
                const cart_user = await client.query("INSERT INTO cart_user(user_id, cart_id) VALUES ($1, $2);", [user_id, cart_id]);
                const token = jwt.sign(
                    { user_id: user_id,authorization: "basic"},
                    JWT_KEY,
                    {
                        expiresIn: '35m'
                    }
                )
                const addUserToken = client.query("UPDATE users SET user_token = $1 WHERE user_id = $2 ", [token, user_id])
                res.status(201).json({ message: "User Successfully Added" })
            }
        }
        else {
            res.status(401).json({ message: "Please Complete All requested" })
        }
    } catch (err) {
        console.log(err)
    }
})

module.exports = router;