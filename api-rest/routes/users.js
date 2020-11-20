const express = require('express');
const router = express.Router();

router.get('/users/signin', (req,res) =>{
    res.render('Signin');
});

router.get('/users/signup', (req,res) =>{
    res.render('Signup');
});

module.exports = router;