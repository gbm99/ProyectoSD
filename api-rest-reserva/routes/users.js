const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser')
const User = require('../models/User');

router.use(cookieParser());


router.get('/users/signin', (req,res) =>{
    res.render('users/Signin');
});

router.get('/users/signup', (req,res) =>{
    res.render('users/Signup');
});

router.post('/users/signup', async (req,res) =>{
    const{email,name,password,confirm_password}=req.body;
    const errors = [];
    if(email.length < 4){
        errors.push({text: 'Email must be at least 4 characters'});
    }
    else if(name.length < 4){
        errors.push({text: 'Nombre must be at least 4 characters'});
    }
    else if(password != confirm_password){
        errors.push({text: 'Contraseña do not match'});
    }
    else if(password.length < 4){
        errors.push({text: 'Contraseña must be at least 4 characters'});
    }
    if(errors.length != 0){
        res.render('users/Signup',{errors,email,name,password,confirm_password});
    }
    else{
        const emailUser = await User.findOne({email: email});
        if(emailUser){
            res.send('Email is in already in use!');
        }
        else{
            const newUser = new User({name,email,password});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            res.redirect('/users/Signin');
        }

    }

})

function validateCookie(req,res,next){

    const {cookies} = req;
    if('session_id' in cookies) {
        console.log('Session ID Exists.');
        if(cookies.session_id=== '12345'){
            next();
        }
        else{
            return res.status(403).send({msg: 'Not Authenticated'});
        }
    }
    else{
         return res.status(403).send({msg: 'Not Authenticated'});
    }
}

router.get('/users/cookieSet', (req,res) =>{
    
    res.cookie('session_id', '12345');
    res.status(200).json({msg:"Logged In!"});
});

router.get('/users/protected',validateCookie,(req,res) =>{
    res.status(200).json({msg: 'You are authorized'});
});

module.exports = router;