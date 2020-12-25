const port = process.env.PORT || 3500;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
var MongoClient = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

const URL_DB = "mongodb+srv://gbm99:salami99@ClusterSD.mdwel.mongodb.net";
const db =`db${'hotels'}`;

//DB base de datos
var mongoClient = new MongoClient(URL_DB,{ useUnifiedTopology: true });
mongoClient.connect();

const Hotel = require('./models/Hotel');

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


app.get('/hoteles', async(request,response) =>{
   
    const hotels =  await Hotel.find().lean().sort({date: 'desc'});

        response.json({
            coleccion: db,
            elementos: hotels
        })


});

app.post('/hoteles/add', auth,async(req, res) =>{
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
        const newHotel = new Hotel({title,description});
        await newHotel.save(Transaccion);
        res.redirect('/hoteles');
    }
});

app.get('/hoteles/:id', async(req, res) =>{
    const hotel = await Hotel.findById(req.params.id).lean();
    
    res.json({
        coleccion: db,
        elemento: hotel
    })
});

app.put('/hoteles/edit-hotel/:id', auth,async(req, res) =>{
    const {title, description}=req.body;
    await Hotel.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/hoteles');
});

app.delete('/hoteles/delete/:id',auth,async(req,res) =>{
    await Hotel.findByIdAndDelete(req.params.id);
    res.redirect('/hoteles');
})

app.listen(port, () => {
    console.log(`API hotel ejecutandose en http://localhost:${port}/hoteles/{colecciones}/{id}`);
});

