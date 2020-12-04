'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const SECRET = require('../config').SECRET;
const EXP_TIME = require('../config').TOKEN_EXP_TIME;

// Crear token
//
//DEvuelve un token tipo jwt
// Formato jwt tiene una estructura:
//      HEADER.PAYLOAD.VERIFY_SIGNATURE
//
// Donde:
//      HEADER( objeto JSON con algoritmo y .. codificado en formato base64url)
//          {
//              "typ"
//          }
//...
//      VERIFY_SIGANTURE;
//          HMACSHA256(base64UrlEncode(HEADER) + "." + base64UrlEncode(PAYLOAD), SECRET)
//
function creaToken(user){
    const payLoad = {
        sub: user._id,
        int: moment().unix(),
        exp: moment().add(EXP_TIME, 'minutes').unix()
    };
    return jwt.encode(payLoad,SECRET);
}

function decodificaToken( token ){
    return new Promise((resolve, reject) => {
        try{
            const payload = jwt.decode(token, SECRET, true);
            if(payload.exp <= moment().unix()) {
                reject({
                    status: 401,
                    message: 'El token ha expirado'
                });
            }
            resolve(payload.sub);
        }catch(err){
            reject({
                status: 500,
                message: 'El token no es valido',
            })
        }
    });
}

module.exports = {
    creaToken,
    decodificaToken
};