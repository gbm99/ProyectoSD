'use strict'

const port = process.env.PORT || 5000;
const express = require('express');
const router = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
var http = require('http');
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
const tokenService = require('../auth/services/token.service');
const moment = require('moment');

// Settings
var exphbs = require('express-handlebars');
router.set('views', path.join(__dirname, 'views'));
router.engine('.hbs',exphbs({
    extname: '.hbs'
}));
const User = require('./models/User');
const { doesNotMatch } = require('assert');
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(methodOverride('_method'));

//Static Files
router.use(express.static(path.join(__dirname, 'public')));

router.post('/users/signup', async (req,res,next) =>{

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
            res.redirect('/users/cookieSet');
            
        }

    }

})

router.post('/users/signin',  async (req,res,next) =>{
    const{email,password}=req.body
    const NewUser=  await User.findOne({email: email});

    if(!NewUser){
        res.status(400).json({msg: 'Introduce the correct email'});
    }
    else{
        const match = await NewUser.matchPassword(password);
        if(match){
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
    res.status(200).json({msg:"Logged In!"});
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
