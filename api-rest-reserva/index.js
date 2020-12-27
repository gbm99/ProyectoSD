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
const fetch = require('node-fetch');
var AsynLock = require('async-lock');

const opciones = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};
const Reserve = require('./models/Reserve');

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

const Transaccion = {
    readPreference: 'primary',
    readConcern:{ level: 'local'},
    writeConcern: {w: 'majority'}
    }

async function updatePost(userId, title,res){
    const session=Reserve.startSession();
    
    const opts = {session};
    const newReserve = new Reserve({userId, amount: "1", type: "credit",title,reserved: "1"});
    const lock = new AsynLock();
    (await session).withTransaction(

        async function(){
                try{
                    if(await Reserve.findOne({title:title})){
                        throw new Error('It is already in a reserve');
                    }
                    else{
                        await lock.acquire("key",async function(){
                            await newReserve.save(Transaccion);
                        });
                        
                        (await session).commitTransaction();
                        (await session).endSession();
                        res.status(200).json({msg: 'Reserved Airplane!'});

                    }
                }catch(err){
                    console.log(err);
                    (await session).abortTransaction();
                    (await session).endSession();
                    res.status(400).json({msg: 'Transaction msg is already reserved!'});
                }
               },opts);                   
}

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

app.post('/api/:colecciones/:id/pago',auth, (request, response) =>{
    const queColeccion = request.params.colecciones;
    const queId = request.params.id;
    var URL_WS;
    if(queColeccion=="aviones"){
        URL_WS=3700;
    }
    else if(queColeccion=="coches"){
        URL_WS=3600;
    }
    else if(queColeccion=="hoteles"){
        URL_WS=3500;
    }
    else{
        response.json({
            result:'Error'
        });
    }
    const queURL =`http://localhost:${URL_WS}/${queColeccion}/reserva/${queId}`;
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
        .then( async function (json) {

            const {email,title}=request.body;
            console.log(json.result);
            if(json.result=='OK'){
                await updatePost(email, title,response); 
            }
            else{
                response.status(400).json({msg: 'That product does not exist!'});
            }

            
        });
    //falta parte banco
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
