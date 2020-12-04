'use strict'

const passService = require('./services/pass.service');
const moment = require('moment');

//Datos Simulados
const miPass = '1234';
const badPass = '6789';
const usuario = {
    _id:"1234567890988765",
    email: 'gbm25@dtic.ua.es',
    displayName: 'gbm25',
    password: miPass,
    signupDate: moment().unix(),
    lastLogin: moment().unix()
};

console.log(usuario);

//Encriptamos el password
passService.encriptaPassword(usuario.password)
    .then(hash => {
        usuario.password = hash;
        console.log(usuario);

        // Verificamos el password
        passService.comparaPassword(miPass, usuario.password)
            .then (isOk => {
                if(isOk){
                    console.log('p1: El pass es corrrecto');
                }
                else{
                    console.log('p1: El pass es incorrecto');
                }
            });

        // Verificamos el password con un erróneo
        passService.comparaPassword(badPass, usuario.password)
            .then (isOk => {
                if(isOk){
                    console.log('p2: El pass es corrrecto');
                }
                else{
                    console.log('p2: El pass es incorrecto');
                }
            });
    });