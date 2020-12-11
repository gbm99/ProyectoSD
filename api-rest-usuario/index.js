'use strict'

const port = process.env.PORT || 5000;
const express = require('express');
const router = express();
const cookieParser = require('cookie-parser');
const path = require('path');
var http = require('http');
const bodyParser = require('body-parser');
const methodOverride = require("method-override");

// Settings
var exphbs = require('express-handlebars');
router.set('views', path.join(__dirname, 'views'));
router.engine('.hbs',exphbs({
    extname: '.hbs'
}));
router.set('view engine', '.hbs');
const User = require('./models/User');

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(methodOverride('_method'));
//Static Files
router.use(express.static(path.join(__dirname, 'public')));

router.get('/users/signin', (req,res) =>{
    res.render('users/Signin');
});

router.get('/users/signup', (req,res) =>{
    res.render('users/Signup');
});

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

http.createServer(router).listen(port, () => {
    console.log(`API RESTFUL CRUD ejecutandose en https://localhost:${port}/users/{colecciones}/{id}`);
});
