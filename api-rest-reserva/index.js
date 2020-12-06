'use strict'

const port = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongojs = require('mongojs');

const URL_DB = "localhost:27017/bdaviones";
const https = require('https');
const fs = require('fs');
const helmet = require("helmet");

const opciones = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const app = express();

//Routes
app.use(require('./routes/airplanes'));
app.use(require('./routes/cars'));
app.use(require('./routes/hotels'));
app.use(require('./routes/users'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//DB base de datos
var db = mongojs(URL_DB);
var id = mongojs.ObjectID;
//Middlewares
app.use(helmet());
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Settings
var exphbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs',exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.param("colecciones",(request,response,next,coleccion) => {
    console.log('param /api/:colecciones');
    console.log('colección', coleccion);

    request.collection = db.collection(coleccion);
    return next();
})

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

app.get('/api', (request, response, next) => {
    console.log('GET /api');
    console.log(request.params);
    console.log(request.collection);
        
    db.getCollectionNames((err,colecciones)=> {
        if(err) return next(err);
        console.log(colecciones);
        response.json({
            result :"OK",
        colecciones: colecciones
        });
    });

});

app.get('/api/:colecciones', (request, response,next) =>{
    console.log('GET /api/:colecciones');
    console.log(request.params);
    console.log(request.collection);

    request.collection.find((err,coleccion)=>{
        if(err) return next(err);
        console.log(coleccion);
        response.json({
            result :"OK",
            colección: request.params.colecciones,
            elementos: coleccion
        });
    });

    /*
    response.status(200).send({
        _id:`${ID}`,
        name: 'nom'


    })
    */
});

app.get('/api/:colecciones/:id', (request, response,next) =>{
const queId = request.params.id;
const queColeccion = request.params.colecciones;

    request.collection.findOne({_id: id(queId)}, (err,elemento)=>{
        if(err) return next(err);
        console.log(elemento);
        response.json({
            result :"OK",
            colección: queColeccion,
            elementos: elemento
        });
    });

    /*
    response.status(200).send({
        _id:`${ID}`,
        name: 'nom'


    })
    */
});

app.post('/api/:colecciones',auth, (request, response) =>{

    const nuevoElemento = request.body;

    request.collection.save(nuevoElemento,(err,elementoGuardado)=>{
        if(err) return next(err);
        console.log(elementoGuardado);
        response.json({
            result :"OK",
            colección: request.params.colecciones,
            elemento: elementoGuardado
        });
    });
    /*
    console.log(request.body);
    response.status(200).send({products: 'El producto se ha recibido'});
    */
});

app.put('/api/:colecciones/:id',auth, (req, res, next) => {  
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

app.delete('/api/:colecciones/:id',auth, (req, res, next) => { 
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
https.createServer(opciones,app).listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en https://localhost:${port}/api/{colecciones}/{id}`);
});
/*
app.listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/api/{colecciones}/{id}`);
});
*/
