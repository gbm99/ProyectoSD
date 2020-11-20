const express = require('express');
const router = express.Router();

router.get('/api/aviones', (req,res) =>{
    res.send('Catálogo de ofertas de aviones');
});

module.exports = router;