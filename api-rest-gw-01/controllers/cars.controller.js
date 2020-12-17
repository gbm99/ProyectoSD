const carsCtrl = {};

const fetch = require('node-fetch');
DOMParser = require('dom-parser');

const URL_WS = "http://localhost:9000";

carsCtrl.showElementsOfCar=function(req){
    const queColeccion = req.params.colecciones;
    const queURL =`${URL_WS}/${queColeccion}`;
    fetch( queURL )
        .then((response) => {
            return response.text();
        })
        .then((html)=> {
            var parser = new DOMParser();

            var doc = parser.parseFromString(html,"text/html");
            console.log(doc);
            return doc;
        })
        .catch((err) => {
            console.log("Failed to fech");
        });

};

module.exports = carsCtrl;