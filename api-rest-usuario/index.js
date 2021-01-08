'use strict'

const port = process.env.PORT || 5000;
const express = require('express');
const router = express();
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var http = require('http');
const tokenService = require('../auth/services/token.service');
const moment = require('moment');

// Settings
const User = require('./models/User');
router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false}));
router.use(bodyParser.json());

var usuario;
var token;

router.post('/users/signup', async (req,res) =>{

    const {email,name,password,confirm_password}=req.body;
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
        res.render('/users/protected');
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
            usuario = {
                _id:"1234567890988765",
                email: email,
                displayName: name,
                password: password,
                signupDate: moment().unix(),
                lastLogin: moment().unix()
            };
            token = tokenService.creaToken(usuario);
            res.redirect('/users/cookieSet');
            
        }

    }

});

router.post('/users/signin',  async (req,res,next) =>{
    const{email,name,password}=req.body
    const NewUser=  await User.findOne({email: email});

    if(!NewUser){
        res.status(400).json({msg: 'Introduce the correct email'});
    }
    else{
        const match = await NewUser.matchPassword(password);
        if(match){
            usuario = {
                _id:"1234567890988765",
                email: email,
                displayName: name,
                password: password,
                signupDate: moment().unix(),
                lastLogin: moment().unix()
            };
            token = tokenService.creaToken(usuario);
            res.redirect('/users/cookieSet');
        }
        else{
            res.redirect('/users/400');
        }
    }
});

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
    res.status(200).json({msg:"Logged In!",token:token});
});

router.get('/users/400', (req,res) =>{
    
    res.status(400).json({msg: 'Introduce email and password'});
});

router.get('/users/protected',validateCookie,(req,res) =>{
    res.status(200).json({msg: 'You are authorized'});
});

router.get('/users/logout', (req,res) =>{
   req.session.destroy(function (err) {
       req.session = null;
       res.clearCookie('session_id');
    res.redirect('/users/protected');
   })
})

http.createServer(router).listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en http://localhost:${port}/users/{colecciones}/{id}`);
});
