const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");

const Car = require('../models/Car');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(methodOverride('_method'));

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

router.get('/coches', async(req,res) =>{
   
    const cars =  await Car.find().lean().sort({date: 'desc'});
    res.render('cars/see-car', {cars});

});

router.get('/coches/modify', auth,async(req,res) =>{
   
    const cars =  await Car.find().lean().sort({date: 'desc'});
    res.render('cars/all-cars', {cars});

});

router.get('/coches/add', auth, (req,res) =>{
    res.render('cars/new_car');
});

router.post('/coches/new-car', auth,async(req, res) =>{
    const {title, description}=req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please Write a Title.'});
    }
    if(!description){
        errors.push({text: 'Please Write a Description.'});
    }
    if(errors.length>0){
        res.render('cars/new_car', {
            errors,
            title,
            description
        });
    }
    else{
        const newCar = new Car({title,description});
        await newCar.save(Transaccion);
        res.redirect('/coches/modify');
    }
});

router.get('/coches/edit/:id', async(req, res) =>{
    const car = await Car.findById(req.params.id).lean();
    res.render('cars/edit-car', {car});
});

router.put('/coches/edit-car/:id',auth, async(req, res) =>{
    const {title, description}=req.body;
    await Car.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/coches/modify');
});

router.delete('/coches/delete/:id',auth,async(req,res) =>{
    await Car.findByIdAndDelete(req.params.id);
    res.redirect('/coches/modify');
})

module.exports = router;