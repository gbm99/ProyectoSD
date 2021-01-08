'use strict'

const port = process.env.PORT || 3000;
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
var Request = require("request-promise");

const tokenService = require('../auth/services/token.service');

const opciones = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const options = {
url: "http://localhost:4000/bank",
headers: {'Content-Type': 'application/json',
          'Authorization': `Bearer MITOKEN123456789`
}
}
var Reserve = require('./models/Reserve');

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
const { callbackify } = require('util');
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

function auth2(req,res,next){
    if(!req.headers.authorization.split(" ")[1] ) {
        res.status(401).json({
            result: 'KO',
            mensajes: "No has enviado el token en la cabecera"
        })
        return next();
    }
    const token = req.headers.authorization.split(" ")[1];
    tokenService.decodificaToken(token)
    .then(userID => {
        return next();
    })
    .catch(err =>console.log({Error1: err})
    );
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
    const newReserve = new Reserve({email: userId, amount: "1", type: "credit",title:title,reserved: "1"});
    const lock = new AsynLock();
    (await session).withTransaction(

        async function(){
                try{
                    if(await Reserve.findOne({title:title})){
                        throw new Error('It is already in a simple reserve');
                    }
                    else if(await Reserve.findOne({serviceH:title})){
                        throw new Error('It is already in a reservepack Hotel');
                    }
                    else if(await Reserve.findOne({serviceA:title})){
                        throw new Error('It is already in a reservepack Airplane');
                    }
                    else if(await Reserve.findOne({serviceC:title})){
                        throw new Error('It is already in a reservepack Car');
                    }
                    else{
                        
                        Request(options)
                        .then( async function (json) {
                            var jsson = JSON.parse(json);
                            console.log(jsson.result);
                            if(jsson.result=='KO'){
                                throw new Error('Not enough money');
                            }
                            else{
                                await lock.acquire("key",async function(){
                                    await newReserve.save(Transaccion);
                                });
                                res.json({
                                    result:'OKRESERVED'
                                });
                            }
                        })
                        .catch(err=>{
                            console.log(err);
                            res.json({
                                result:'ERRBANK'
                            });
                        });
                        (await session).commitTransaction();
                        (await session).endSession();
                    }
                }catch(err){
                    console.log(err);
                    (await session).abortTransaction();
                    (await session).endSession();
                    res.json({
                        result:'ALREADYRESERVED'
                    });
                }
               },opts);                   
}

async function updateTravelPacks(email, serviceH, serviceA, serviceC,res){
    const session=Reserve.startSession();
    
    const opts = {session};
    const newReserve = new Reserve({email:email, amount: "1", type: "credit",serviceH:serviceH, serviceA:serviceA, serviceC:serviceC,reserved: "1"});
    const lock = new AsynLock();

    (await session).withTransaction(

        async function(){
                try{
                    if(await Reserve.findOne({title:serviceH})){
                        throw new Error('It is already in a simple reserve');
                    }
                    else if(await Reserve.findOne({title:serviceA})){
                        throw new Error('It is already in a simple reserve');
                    }
                    else if(await Reserve.findOne({title:serviceC})){
                        throw new Error('It is already in a simple reserve');
                    }
                    else if(await Reserve.findOne({serviceH:serviceH})){
                        throw new Error('It is already in a reservepack Hotel');
                    }
                    else if(await Reserve.findOne({serviceA:serviceA})){
                        throw new Error('It is already in a reservepack Airplane');
                    }
                    else if(await Reserve.findOne({serviceC:serviceC})){
                        throw new Error('It is already in a reservepack Car');
                    }
                    else{
                        
                        Request(options)
                        .then( async function (json) {
                            var jsson = JSON.parse(json);
                            console.log(jsson.result);
                            if(jsson.result=='KO'){
                                throw new Error('Not enough money');
                            }
                            else{
                                await lock.acquire("key",async function(){
                                    await newReserve.save(Transaccion);
                                });
                                res.json({
                                    result:'OKRESERVED'
                                });
                            }
                        })
                        .catch(err=>{
                            console.log(err);
                            res.json({
                                result:'ERRBANK'
                            });
                        });
                        (await session).commitTransaction();
                        (await session).endSession();
                    }
                }catch(err){
                    console.log(err);
                    (await session).abortTransaction();
                    (await session).endSession();
                    res.json({
                        result:'ALREADYRESERVED'
                    });
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

app.post('/api/:colecciones/:id/pago',auth2, (request, response) =>{
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
                response.json({
                    result:'KOPRODUCT'
                });
            }

            
        });
});

app.post('/api/paqueteViaje/pago',auth2, (request, res) =>{

    var queURL =`http://localhost:3500/hoteles/reserva`;
    var {email, serviceH, serviceA, serviceC} = request.body;
    const queToken = request.params.token;

    fetch( queURL, {
        method: 'POST',
        body: JSON.stringify({title:serviceH}),
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${queToken}`
        }

    } )
        .then(response => response.json())
        .then( async function (json) {

            console.log(json.result);
            if(json.result=='OK'){
                queURL =`http://localhost:3700/aviones/reserva`;
                fetch( queURL, {
                    method: 'POST',
                    body: JSON.stringify({title:serviceA}),
                    headers: {'Content-Type': 'application/json',
                              'Authorization': `Bearer ${queToken}`
                    }
            
                } )
                    .then(response => response.json())
                    .then( async function (json) {
            
                        console.log(json.result);
                        if(json.result=='OK'){
                            queURL =`http://localhost:3600/coches/reserva`;
                            fetch( queURL, {
                                method: 'POST',
                                body: JSON.stringify({title:serviceC}),
                                headers: {'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${queToken}`
                                }

                            } )
                                .then(response => response.json())
                                .then( async function (json) {

                                    console.log(json.result);
                                    if(json.result=='OK'){ 
                                        await updateTravelPacks(email, serviceH, serviceA, serviceC,res);
                                    }
                                    else{
                                        res.json({
                                            result:'KOCAR'
                                        });
                                    }
                                })
                                .catch(function(error){
                                    console.log('hubo un error: ' + error.message);
                                });
                        }
                        else{
                            res.json({
                                result:'KOAIRPLAIN'
                            });
                        }
                    })
                    .catch(function(error){
                        console.log('hubo un error: ' + error.message);
                    });
            }
            else{
                res.json({
                    result:'KOHOTEL'
                });
            }
        })
        .catch(function(error){
            console.log('hubo un error: ' + error.message);
        });
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

app.delete('/api/borrarReserva',auth2, async (req, res, next) => { 
    var elementoNuevo = req.body;

    if(await Reserve.findOneAndRemove(elementoNuevo)){
        res.json({
            result: 'BORRADO'
        });
    }
    else{
        res.json({
            result: 'NOEXISTE'
        });
    }
});

https.createServer(opciones,app,function(socket){
socket.write('Send a message');

socket.on("data", function(data){
    console.log('Received: %s [it is %d bytes long]',
    data.toString().replace(/(\n)/gm,""),
    data.length);
});
}).listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en https://localhost:${port}/api/{colecciones}/{id}`);
});
/*
app.listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/api/{colecciones}/{id}`);
});
*/
