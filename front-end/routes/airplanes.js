const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");

const Airplane = require('../models/Airplane');
//const Transactions = require('../models/Airplane');

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

/*
async function updatePost(userId,reserva,req, title, description){
    const session=Airplane.startSession();
    (await session).startTransaction();
    try{
        const opts = {session};
        await Airplane.findByIdAndUpdate(req.params.id, {title, description}).lean();
        await Transactions(
              {userId:userId, amount: amount, type: "credit"}).save(opts);
        (await session).commitTransaction();
        (await session).endSession();
        return true;
    }catch (error){
        (await session).abortTransaction();
        (await session).endSession();
        throw error;
    }
}
*/
router.get('/aviones', async(req,res) =>{
   
    const airplanes =  await Airplane.find().lean().sort({date: 'desc'});
    res.render('airplanes/see-airplane', {airplanes});

});

router.get('/aviones/modify', auth,async(req,res) =>{
   
    const airplanes =  await Airplane.find().lean().sort({date: 'desc'});
    res.render('airplanes/all-airplanes', {airplanes});

});

router.get('/aviones/add',auth, (req,res) =>{
    res.render('airplanes/new_airplane');
});

router.post('/aviones/new-airplane', auth,async(req, res) =>{
    const {title, description}=req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please Write a Title.'});
    }
    if(!description){
        errors.push({text: 'Please Write a Description.'});
    }
    if(errors.length>0){
        res.render('airplanes/new_airplane', {
            errors,
            title,
            description
        });
    }
    else{
        const newAirplane = new Airplane({title,description});
        await newAirplane.save(Transaccion);
        res.redirect('/aviones/modify');
    }
});

router.get('/aviones/edit/:id', async(req, res) =>{
    const airplane = await Airplane.findById(req.params.id).lean();
    res.render('airplanes/edit-airplane', {airplane});
});

router.put('/aviones/edit-airplane/:id', auth,async(req, res) =>{
    const {title, description}=req.body;
    await Airplane.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/aviones/modify');
});

router.delete('/aviones/delete/:id',auth,async(req,res) =>{
    await Airplane.findByIdAndDelete(req.params.id);
    res.redirect('/aviones/modify');
})

module.exports = router;
