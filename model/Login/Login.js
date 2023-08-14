const client = require("../../config/database");
const router = require('express').Router();
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const { JWT_KEY } = process.env
const {JWT_REFRESH_KEY} = process.env


router.post("/", async (req, res) => {
    const { user_mail, user_password } = req.body
    if (user_mail && user_password) {
        try {
            const resUser = await client.query("SELECT * FROM users WHERE user_mail = $1 ", [user_mail])
            const user = resUser.rows[0]
            if (user) {
                const isPasswordValid = await bcrypt.compare(user_password, user.user_password)
                if (isPasswordValid) {
                    const newToken = jwt.sign(
                        { user_id: user.user_id, authorization: "basic"},
                        JWT_KEY,
                        { expiresIn: '35m' }
                    )
                    const refreshToken = jwt.sign(
                        { user_id: user.user_id, authorization: "basic"},
                        JWT_REFRESH_KEY,
                        {
                            expiresIn: '30d'
                        }
                    )
                    const addToken = await client.query("UPDATE users SET user_token = $1 , user_refresh_token = $2 WHERE user_id=$3", [newToken, refreshToken, user.user_id])
                    res.status(200).json({
                        message: "Valid Token",
                        user_token : newToken,
                    })
                }
                else {
                    res.status(400).json({ message: "Invalid Credentials" });
                }
            }
            else {
                console.log("Kullanici Bulunamadi")
                res.status(404).json({ message: "Kullanici Bulunamadi" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "An error occurred " + err });
        }
    }
    else {
        res.status(403).json({ message: "Email and password are required" });
    }
})

module.exports = router;