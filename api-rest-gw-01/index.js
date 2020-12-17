'use strict'

const port = process.env.PORT || 3100;
const express = require('express');
const logger = require('morgan');


const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";

//  API Controller
const {
    showElements,
    showOneElement,
    postElement,
    putElement,
    deleteElement
} = require("./controllers/api.controller");

//  API Controller
const {
    showElementsOfCar,
} = require("./controllers/cars.controller");

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

    res.status(401).json({
        result: 'KO',
        mensajes: "Acceso no autorizado a este servicio"
    })
    return next(new Error("No has enviado el token a la cabecera"));
}

app.get('/api/:colecciones', showElements);

app.get('/api/:colecciones/:id',showOneElement);

app.post('/api/:colecciones',auth,postElement);

app.put('/api/:colecciones/:id',auth,putElement); 

app.delete('/api/:colecciones/:id',auth,deleteElement);

app.get('/:colecciones',showElementsOfCar);

app.listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/api/{colecciones}/{id}`);
});

