'use strict'

const port = process.env.PORT || 4000;
const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";

function auth(req,res,next){
    if(!req.headers.authorization ) {
        res.status(401).json({
            result: 'KO',
            mensajes: "No has enviado el token en la cabecera"
        })
        return next();
    }

    console.log(req.headers.authorization);

    if(req.headers.authorization.split(" ")[1] === "MITOKEN123456789"){
        req.params.token = req.headers.authorization.split(" ")[1];
        return next();
    }

    res.json({
        result: 'KO',
        mensajes: "Acceso no autorizado a este servicio"
    })
    return next(new Error("No has enviado el token a la cabecera"));
}

//  API Controller
const {
    postReserve
} = require("./controllers/api.controller");

app.get('/bank',auth, postReserve);

app.listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/bank`);
});
