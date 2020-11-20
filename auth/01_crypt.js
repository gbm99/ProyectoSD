'use strict'

//Importamos módulo de criptografia
const bcrypt = require('bcrypt');

//Simulamos datos
const miPass = "miContraseña";
const badPass = "otropassword";

// Creamos un salt 
bcrypt.genSalt(10, (err, salt) => {
    console.log(`Salt1: ${salt}`);
    //Utilizamos el salt para generar el hash
    bcrypt.hash(miPass, salt, (err, hash) => {
        if(err) console.log(err);
        else console.log(`Hash1: ${hash}`);
    });
});

bcrypt.hash(miPass, 10, (err, hash) => {
    if(err) console.log(err);
    else{
        console.log(`Hash2 (password codificado): ${hash}`);

        //Comparamos con el pass correcto
        bcrypt.compare(miPass, hash, (err, result) =>{
            console.log(`Result2.1: ${result}`);
        });
        //Comparamos con otro pass
        bcrypt.compare(badPass, hash, (err, result) =>{
            console.log(`Result2.2: ${result}`);
        });
    } 
});