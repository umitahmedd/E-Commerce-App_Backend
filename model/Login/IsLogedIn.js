const client = require("../../config/database");
const router = require('express').Router();
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const { JWT_KEY } = process.env
const {JWT_REFRESH_KEY} = process.env


router.post("/",(req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        const token = tokenHeader ? tokenHeader.replace('Bearer ', '') : null;
        const decodeToken = jwt.decode(token, JWT_KEY);
        const user_id = decodeToken.user_id;
    
        client.query("SELECT user_token FROM users WHERE user_id = $1", [user_id], (err,result)=>{
            if(err){
                console.log(err);
                res.status(500).json({message: err})
            }

            if (result.rows.length > 0) {
                const databaseToken =  result.rows[0].user_token
                if(databaseToken == token){
                    res.status(200).json({isLogedIn: true})
                }
                else{
                    res.status(200).json({newToken: databaseToken,isLogedIn: true})
                    console.log("oturum yenilendi");
                }

            }
    
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;