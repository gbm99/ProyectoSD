'use strict'

const port = process.env.PORT || 3100;
const express = require('express');
const logger = require('morgan');
const fetch = require('node-fetch');

const URL_WS = "https://localhost:3000/api";

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

    res.status(401).json({
        result: 'KO',
        mensajes: "Acceso no autorizado a este servicio"
    })
    return next(new Error("No has enviado el token a la cabecera"));
}

app.get('/api/:colecciones', (req, res,next) =>{
    const queColeccion = req.params.colecciones;
    const queURL =`${URL_WS}/${queColeccion}`;
    fetch( queURL )
        .then(res => res.json())
        .then( json => {
            res.json({
                result:'OK',
                coleccion: queColeccion,
                elementos: json.elementos
            });
        }
    )
});

app.get('/api/:colecciones/:id', (req, res,next) =>{
    const queColeccion = req.params.colecciones;
    const queId = req.params.id;
    const queURL =`${URL_WS}/${queColeccion}/${queId}`;
    fetch( queURL )
        .then(res => res.json())
        .then( json => {
            res.json({
                result:'OK',
                coleccion: queColeccion,
                elementos: json.elementos
            });
        }
    );
});

app.post('/api/:colecciones',auth, (request, response) =>{
    const queColeccion = request.params.colecciones;
    const queURL =`${URL_WS}/${queColeccion}`;
    const nuevoElemento = request.body;
    const queToken = request.params.token;

    fetch( queURL, {
        method: 'POST',
        body: JSON.stringify(nuevoElemento),
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${queToken}`
        }

    } )
        .then(response => response.json())
        .then( json => {
            response.json({
                result:'OK',
                coleccion: queColeccion,
                nuevoElemento: json.elemento
            });
        }
    );
    /*
    console.log(request.body);
    response.status(200).send({products: 'El producto se ha recibido'});
    */
});

app.put('/api/:colecciones/:id', (req, res, next) => {  
    const queId = req.params.id;
    const queColeccion = req.params.colecciones;
    const elementoNuevo = req.body;

    req.collection.update(
        {_id: id(queId)}, 
        {$set: elementoNuevo},
        {safe: true, multi: false},
        (err, result) => { 
        if (err) return next(err); 
            console.log(result);
            res.json({
                result: 'OK',
                colección: queColeccion,
                _id: queId,
                resultado: result
            });
        }
    ); 
}); 

app.delete('/api/:colecciones/:id', (req, res, next) => { 
    const queId = req.params.id;
    const queColeccion = req.params.colecciones;
 
    req.collection.remove(
        {_id: id(queId)},
        (err, result) => { 
            if (err) return next(err); 

                console.log(result);
                res.json({
                    result: 'OK',
                    colección: queColeccion,
                    _id: queId,
                    resultado: result
                });
        }
    ); 
});

app.listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/api/{colecciones}/{id}`);
});

