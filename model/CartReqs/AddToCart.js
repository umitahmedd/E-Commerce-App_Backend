const client = require("../../config/database");
const router = require('express').Router();
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const { JWT_KEY } = process.env

router.post("/", (req, res)=>{
    try {
        const HeaderToken = req.headers.authorization
        const token = HeaderToken ? HeaderToken.replace("Bearer ", "") : null

        
    } catch (error) {
        console.log(error);
    }
})