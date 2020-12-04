'use strict'

const tokenService = require('./services/token.service');
const moment = require('moment');

//Datos Simulados
const miPass = '1234';
const usuario = {
    _id:"1234567890988765",
    email: 'gbm25@dtic.ua.es',
    displayName: 'gbm25',
    password: miPass,
    signupDate: moment().unix(),
    lastLogin: moment().unix()
};
console.log(usuario);

//Crear token...
const token = tokenService.creaToken(usuario);
console.log(token);

// Decodificamos un token...
tokenService.decodificaToken(token)
    .then(userID => {
        return console.log(`ID1: ${userID}`);
    })
    .catch(err =>console.log({Error1: err})
    );

const badToken = 'eyJ0eXAiOiMAL1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwOTg4NzY1IiwiaW50IjoxNjA1ODA4NTgwLCJleHAiOjE2MDY0MTMzODB9.BLCiEionUangucbGoULzauICGZT4FdUKXiKpW1iWwy8';
tokenService.decodificaToken(badToken)
    .then(userID => {
        return console.log(`ID2: ${userID}`);
    })
    .catch(err =>console.log({Error2: err})
    );