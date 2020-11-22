const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const Airplane = require('../models/Airplane');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

router.get('/aviones', async(req,res) =>{
   
    const airplanes =  await Airplane.find().lean().sort({date: 'desc'});
    res.render('airplanes/all-airplanes', {airplanes});

});

router.get('/aviones/add', (req,res) =>{
    res.render('airplanes/new_airplane');
});

router.post('/aviones/new-airplane', async(req, res) =>{
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
        await newAirplane.save();
        res.redirect('/aviones');
    }
});

module.exports = router;