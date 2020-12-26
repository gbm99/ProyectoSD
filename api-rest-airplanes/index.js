const port = process.env.PORT || 3700;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
var MongoClient = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;


const URL_DB = "mongodb+srv://gbm99:salami99@ClusterSD.mdwel.mongodb.net";
const db =`db${'airplanes'}`;

//DB base de datos
var mongoClient = new MongoClient(URL_DB,{ useUnifiedTopology: true });
mongoClient.connect();

const Airplane = require('./models/Airplane');
//const Transactions = require('../models/Airplane');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

const Transaccion = {
readPreference: 'primary',
readConcern:{ level: 'local'},
writeConcern: {w: 'majority'}
}

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

app.get('/aviones', async(req,res) =>{
   
    const airplanes =  await Airplane.find().lean().sort({date: 'desc'});
    res.json({
        coleccion: db,
        elementos: airplanes
    })

});

app.post('/aviones/add', auth,async(req, res) =>{
    const {title, description, reserved}=req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please Write a Title.'});
    }
    if(!description){
        errors.push({text: 'Please Write a Description.'});
    }
    if(errors.length>0){
        res.send('Introduce bien los datos');
    }
    else{
        const newAirplane = new Airplane({title,description,reserved});
        await newAirplane.save(Transaccion);
        res.redirect('/aviones');
    }
});

app.get('/aviones/:id', async(req, res) =>{
    const airplane = await Airplane.findById(req.params.id).lean();
    res.json({
        coleccion: db,
        elemento: airplane
    })
});

app.put('/aviones/edit-airplane/:id', auth,async(req, res) =>{
    const {title, description, reserved}=req.body;
    await Airplane.findByIdAndUpdate(req.params.id, {title, description, reserved}).lean();
    res.redirect('/aviones');
});

app.post('/aviones/reserva/:id',async(req, res) =>{
    const {email,title}=req.body;
    const queId = req.params.id;
    var existe = await Airplane.findOne({_id:queId,title:title}).lean();
    if(existe){
        res.json({
            result:'OK'
        });
    }
    else{
        res.json({
            result:'NOEXISTE'
        });
    }
})

app.delete('/aviones/delete/:id',auth,async(req,res) =>{
    await Airplane.findByIdAndDelete(req.params.id);
    res.redirect('/aviones');
})

app.listen(port, () => {
    console.log(`API avion ejecutandose en http://localhost:${port}/aviones/{colecciones}/{id}`);
});

