const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require("method-override");

const Hotel = require('../models/Hotel');

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

router.get('/hoteles', async(req,res) =>{
   
    const hotels =  await Hotel.find().lean().sort({date: 'desc'});
    res.render('hotels/see-hotel', {hotels});

});

router.get('/hoteles/modify', auth,async(req,res) =>{
   
    const hotels =  await Hotel.find().lean().sort({date: 'desc'});
    res.render('hotels/all-hotels', {hotels});

});

router.get('/hoteles/add', auth,(req,res) =>{
    res.render('hotels/new_hotel');
});

router.post('/hoteles/new-hotel', auth,async(req, res) =>{
    const {title, description}=req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please Write a Title.'});
    }
    if(!description){
        errors.push({text: 'Please Write a Description.'});
    }
    if(errors.length>0){
        res.render('hotels/new_hotel', {
            errors,
            title,
            description
        });
    }
    else{
        const newHotel = new Hotel({title,description});
        await newHotel.save(Transaccion);
        res.redirect('/hoteles/modify');
    }
});

router.get('/hoteles/edit/:id', async(req, res) =>{
    const hotel = await Hotel.findById(req.params.id).lean();
    res.render('hotels/edit-hotel', {hotel});
});

router.put('/hoteles/edit-hotel/:id', auth,async(req, res) =>{
    const {title, description}=req.body;
    await Hotel.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/hoteles/modify');
});

router.delete('/hoteles/delete/:id',auth,async(req,res) =>{
    await Hotel.findByIdAndDelete(req.params.id);
    res.redirect('/hoteles/modify');
})

module.exports = router;
