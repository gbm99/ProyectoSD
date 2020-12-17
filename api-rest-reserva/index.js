'use strict'

const port = process.env.PORT || 3300;
const express = require('express');
const path = require('path');
const logger = require('morgan');
var MongoClient = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

const URL_DB = "mongodb+srv://gbm99:salami99@ClusterSD.mdwel.mongodb.net";
const https = require('https');
const fs = require('fs');
const helmet = require("helmet");

const opciones = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const app = express();

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//DB base de datos
var mongoClient = new MongoClient(URL_DB,{ useUnifiedTopology: true });
mongoClient.connect();
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
    const db =`db${coleccion}`;
    
    request.collection = mongoClient.db(db).collection(coleccion);

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

async function listDatabases(){
    var databaslist = await mongoClient.db().admin().listDatabases();
    var array = [];
    databaslist.databases.forEach(db => array.push(db.name));
    return array;
};

app.get('/api',(request, response, next) => {
    console.log('GET /api');
    console.log(request.params);
    console.log(request.collection);
        
    listDatabases().then(v =>{
        response.json({
            result:"OK",
            colecciones: v
        })
    })
});

app.get('/api/:colecciones', (request, response,next) =>{

    request.collection.find({}).toArray(function(err, coleccion){
        if(err) return next(err);
        response.json({
            result: 'ok',
            coleccion: request.params.colecciones,
            elementos: coleccion
        })
    })
});

app.get('/api/:colecciones/:id', (request, response,next) =>{
const queId = request.params.id;
const queColeccion = request.params.colecciones;

    request.collection.find({_id:new objectID(queId)}).toArray(function(err, coleccion){
        if(err) return next(err);
        response.json({
            result: 'ok',
            coleccion: request.params.colecciones,
            elementos: coleccion
        })
    })

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
        {_id: new objectID(queId)}, 
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
        {_id: new objectID(queId)},
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
