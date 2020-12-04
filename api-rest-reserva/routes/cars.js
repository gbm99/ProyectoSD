const express = require('express');
const router = express.Router();

router.get('/api/coches', (req,res) =>{
    res.send('Catálogo de ofertas de coches');
});

module.exports = router;