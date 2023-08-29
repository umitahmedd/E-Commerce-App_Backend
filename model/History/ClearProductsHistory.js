const client = require("../../config/database");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;

router.delete("/", (req, res) => {
  try {
    
    const HeaderToken = req.headers.authorization;
    const token = HeaderToken ? HeaderToken.replace("Bearer ", "") : null;
    const payload = jwt.decode(token, JWT_KEY);
    if (!token || !payload) {
      res
        .status(404)
        .json({ message: "There is one or many Undefined values" });
      return;
    } else {
      const user_id = payload.user_id;
      client.query("SELECT * FROM history_product INNER JOIN history_user ON history_user.history_id = history_product.history_id INNER JOIN users ON users.user_id = history_user.user_id WHERE history_user.user_id = $1 ", [user_id], (err, result)=>{
        if (err) {
          console.log(err);
          res.status(500).json({ message: err });
        }
        if (result.rows.length > 0){
          const history_id =  result.rows[0].history_id
          client.query("DELETE FROM history_product where history_id = $1", [history_id], (err2, result2)=>{
            if (err2) {
              console.log(err2);
              res.status(500).json({ message: err2 });
            }
            res.status(200).json({message: "History was cleared"})
          })
        }
        else{
          res.status(204).json({message: "history is empty "})
        }
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong", error });
  }
});

module.exports = router;
