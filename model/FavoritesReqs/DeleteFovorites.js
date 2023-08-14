const client = require("../../config/database");
const router = require('express').Router();
const {JWT_KEY} = process.env
const dotenv = require('dotenv');
dotenv.config();
const jwt = require("jsonwebtoken");

router.delete("/", (req,res)=>{
    try {
        const {favorites_id} = req.body
        const tokenHeader = req.headers.authorization
        const token = tokenHeader ? tokenHeader.replace("Bearer ", "") : null
        const decodedToken = jwt.decode(token, JWT_KEY)
        const user_id = decodedToken.user_id

        client.query("SELECT * FROM favorites WHERE favorite_id = $1 AND user_id = $2", [favorites_id, user_id], (err,result)=>{
            if (err){
                console.log(err);
                res.status(500).json({message: err})
            } 

            if(result.rows.length > 0){
                client.query("DELETE FROM favorites WHERE favorite_id = $1 AND user_id = $2", [favorites_id, user_id], (err2,result2)=>{
                    if (err2){
                        console.log(err2);
                        res.status(500).json({message: err2})
                    } 
                    res.status(200).json({message: "product was succesfully deleted of favorites list"})
                })
            }
            else{
                res.status(404).json({message: "could not find favorites"})
            }
            
        })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router