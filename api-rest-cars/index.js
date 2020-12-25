const port = process.env.PORT || 3600;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
var MongoClient = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

const URL_DB = "mongodb+srv://gbm99:salami99@ClusterSD.mdwel.mongodb.net";
const db =`db${'cars'}`;

//DB base de datos
var mongoClient = new MongoClient(URL_DB,{ useUnifiedTopology: true });
mongoClient.connect();

const Car = require('./models/Car');

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

app.get('/coches', async(req,res) =>{
   
    const cars =  await Car.find().lean().sort({date: 'desc'});
    res.json({
        coleccion: db,
        elementos: cars
    })

});

app.post('/coches/add', auth,async(req, res) =>{
    const {title, description}=req.body;
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
        const newCar = new Car({title,description});
        await newCar.save(Transaccion);
        res.redirect('/coches');
    }
});

app.get('/coches/:id', async(req, res) =>{
    const car = await Car.findById(req.params.id).lean();
    res.json({
        coleccion: db,
        elemento: car
    })
});

app.put('/coches/edit-car/:id',auth, async(req, res) =>{
    const {title, description}=req.body;
    await Car.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/coches');
});

app.delete('/coches/delete/:id',auth,async(req,res) =>{
    await Car.findByIdAndDelete(req.params.id);
    res.redirect('/coches');
})

app.listen(port, () => {
    console.log(`API coche ejecutandose en http://localhost:${port}/hoteles/{colecciones}/{id}`);
});
