const apiCtrl = {};

apiCtrl.postReserve= (request, response) =>{

    var num = Math.floor(Math.random()*((11-5))+5);

    if(num < 8){
        response.status(200).json({
            result: 'OK'
        });
    }
    else{
        response.status(201).json({
            result:'KO'
        });
    }
};

module.exports = apiCtrl;
