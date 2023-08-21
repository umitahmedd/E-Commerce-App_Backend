const client = require("./config/database");
const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const app = express();
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const AddUser = require("./model/UserReqs/AddUser")
const Login = require("./model/Login/Login")
const Islogedin = require("./model/Login/IsLogedIn")
const GetUserData = require("./model/UserReqs/GetUserData")
const GetUserCart = require("./model/UserReqs/GetUserCart")
const GetUserFavorites = require("./model/UserReqs/GetUserFavorites")
const DeleteFovorites = require("./model/FavoritesReqs/DeleteFovorites")
const deleteproductfromcart = require("./model/CartReqs/deleteProductFromCart")
const GetMostliked = require("./model/Home/GetMostLiked")
const AddToCart = require("./model/CartReqs/AddToCart")
const AddToFavorites = require("./model/FavoritesReqs/AddToFavorites")
const UserAuthorization = require("./Middleware/UserAuthorization")
const Authentication = require("./Middleware/Authentication")
const ReducingProductFromCart = require("./model/CartReqs/ReducingProductFromCart") 

app.use("/register"             ,                     AddUser)
app.use("/login"                ,                     Login)
app.use("/check-token"          , Authentication    , Islogedin)
app.use("/getuserdata"          , UserAuthorization , GetUserData)
app.use("/getusercart"          , UserAuthorization , GetUserCart)
app.use("/getuserfavorites"     , UserAuthorization , GetUserFavorites)
app.use("/deletefavorites"      , UserAuthorization , DeleteFovorites)
app.use("/addtofavorites"       , UserAuthorization , AddToFavorites)
app.use("/getmostliked"         ,                     GetMostliked)
app.use("/addtocart"            , UserAuthorization , AddToCart)
app.use("/deleteproductfromcart", UserAuthorization , deleteproductfromcart)
app.use("/reduceproductfromcart", UserAuthorization , ReducingProductFromCart)


app.listen(5002, '0.0.0.0', (err) => {
    !err ? (client.connect(), console.log('Server has started on port 5002')) : console.log(err);
});


 
