
//Parte implementada explicitamente en el api WS user

/*const cookieParser = require('cookie-parser');
router.use(cookieParser());

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
});*/
