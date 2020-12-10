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

router.get('/hoteles', async(req,res) =>{
   
    const hotels =  await Hotel.find().lean().sort({date: 'desc'});
    res.render('hotels/see-hotel', {hotels});

});

router.get('/hoteles/modify', async(req,res) =>{
   
    const hotels =  await Hotel.find().lean().sort({date: 'desc'});
    res.render('hotels/all-hotels', {hotels});

});

router.get('/hoteles/add', (req,res) =>{
    res.render('hotels/new_hotel');
});

router.post('/hoteles/new-hotel', async(req, res) =>{
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

router.put('/hoteles/edit-hotel/:id', async(req, res) =>{
    const {title, description}=req.body;
    await Hotel.findByIdAndUpdate(req.params.id, {title, description}).lean();
    res.redirect('/hoteles/modify');
});

router.delete('/hoteles/delete/:id',async(req,res) =>{
    await Hotel.findByIdAndDelete(req.params.id);
    res.redirect('/hoteles/modify');
})

module.exports = router;