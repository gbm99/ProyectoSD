const express = require('express');
const router = express.Router();

router.get('/api/hoteles', (req,res) =>{
    res.send('Catálogo de ofertas de hoteles');
});

module.exports = router;