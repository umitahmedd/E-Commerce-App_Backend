const jwt = require('jsonwebtoken')
const client = require('../config/database')
const { JWT_KEY } = process.env
const { JWT_REFRESH_KEY } = process.env

const Authentication = async (req, res, next) => {
    try {
        const tokenHeader = req.headers.authorization;
        const token = tokenHeader ? tokenHeader.replace('Bearer ', '') : null; 
        const tokenpayload = jwt.decode(token, JWT_KEY)
        const Token_user_id = tokenpayload.user_id
        const expirationTime = tokenpayload.exp * 1000;
        const Datenow = Date.now()
        const kalansure = expirationTime - Datenow 

        if (!token) return res.sendStatus(401)
        jwt.verify(token, JWT_KEY, async (err, payload) => {   
            if ((err && err.name === "TokenExpiredError") || kalansure < 900000) {
                const userOldToken = await client.query("SELECT user_token FROM users WHERE user_id = $1", [Token_user_id])
                const oldToken = userOldToken.rows[0].user_token;
                if(oldToken == token){
                    const userRefToken = await client.query("SELECT user_refresh_token FROM users WHERE user_id = $1", [Token_user_id])
                    const refreshToken = userRefToken.rows[0].user_refresh_token;
                    
                    jwt.verify(refreshToken, JWT_REFRESH_KEY, async (refreshErr, refreshPayload) => {
                        if (refreshErr) {
                            if (refreshErr.name === "TokenExpiredError") {
                                return res.status(403).json({ message: 'Refresh token expired' });
                            }
                            else {
                                console.log(refreshErr);
                                return res.status(400).json({ message: 'Error while verifying refresh token' });
                            }
                        }
                        else {
                            const newToken = jwt.sign(
                                { user_id: refreshPayload.user_id,authorization: refreshPayload.authorization},
                                JWT_KEY,
                                { expiresIn: '35m' } // 45m yap
                            )
                            await client.query("UPDATE users SET user_token = $1 WHERE user_id = $2 ", [newToken, Token_user_id])
                            console.log('yeni token verildi');
                            next();

                        }
                    })
                }
                else{
                    res.status(404).json({message: "Kullanim disi birakilmis bir token girdiniz"})
                }
            }
            else if (expirationTime - Datenow > 900000) {
                next()
                console.log('token gecerli');
                const timestamp1 = expirationTime;
                const date1 = new Date(timestamp1);
                const timestamp2 = Datenow;
                const date2 = new Date(timestamp2);
                console.log(date1);
                console.log(date2);
                console.log(expirationTime - Datenow);
            }
            else{
                res.status(500).json({Error: err})
                console.log(err);
            }
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(err);
    }
}
module.exports = Authentication;
