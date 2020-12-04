'use strict'

const bcrypt = require('bcrypt');

// DEvuelve un hash con salt incluido formato
function encriptaPassword(password)
{
    return bcrypt.hash(password,10);
}

//Devuelve True or False
function comparaPassword(password,hash)
{
    return bcrypt.compare(password,hash);
}

module.exports = {
    encriptaPassword,
    comparaPassword
};