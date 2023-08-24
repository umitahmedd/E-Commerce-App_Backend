const client = require("../../config/database");
const router = require('express').Router();
const dotenv = require('dotenv')
dotenv.config()
const jwt = require("jsonwebtoken")
const { JWT_KEY } = process.env

router.post("/", (req, res) => {
    try {
        const HeaderToken = req.headers.authorization
        const token = HeaderToken ? HeaderToken.replace("Bearer ", "") : null
        const payload = jwt.decode(token, JWT_KEY)
        const { product_id } = req.body
        if (!token || !payload || !product_id) {
            res.status(404).json({ message: 'There is one or many Undefined values' })
            return
        }
        else {
            const user_id = payload.user_id
            client.query("SELECT * FROM favorites WHERE product_id = $1 AND user_id = $2", [product_id,user_id], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ message: err })
                }
                if(result.rows.length == 0){
                    client.query("INSERT INTO favorites (product_id, user_id) values ($1, $2) ", [product_id,user_id], (err2, result2) => {
                        if (err2) {
                            console.log(err2);
                            res.status(500).json({ message: err2 })
                        }
                        res.status(200).json({message : `product with product_id: ${product_id} was added to favorites`})
                    })
                }
                else if (result.rows.length > 0){
                    client.query("DELETE FROM favorites WHERE product_id = $1 AND user_id = $2", [product_id, user_id], (err3,result3)=>{
                        if (err3){
                            console.log(err3);
                            res.status(500).json({message: err3})
                        } 
                        res.status(200).json({message: ` ${product_id} product was succesfully deleted of favorites list`})
                    })
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrond", error})
    }
})

module.exports = router