const apiCtrl = {};

const fetch = require('node-fetch');

const URL_WS = "https://localhost:3000/api";

apiCtrl.showElements=(req, res,next) =>{
    const queColeccion = req.params.colecciones;
    const queURL =`${URL_WS}/${queColeccion}`;
    fetch( queURL )
        .then(res => res.json())
        .then( json => {
            res.json({
                result:'OK',
                coleccion: queColeccion,
                elementos: json.elementos
            });
        }
    )
};

apiCtrl.showOneElement=(req, res,next) =>{
    const queColeccion = req.params.colecciones;
    const queId = req.params.id;
    const queURL =`${URL_WS}/${queColeccion}/${queId}`;
    fetch( queURL )
        .then(res => res.json())
        .then( json => {
            res.json({
                result:'OK',
                coleccion: queColeccion,
                elementos: json.elementos
            });
        }
    );
};

apiCtrl.postElement= (request, response) =>{
    const queColeccion = request.params.colecciones;
    const queURL =`${URL_WS}/${queColeccion}`;
    const nuevoElemento = request.body;
    const queToken = request.params.token;

    fetch( queURL, {
        method: 'POST',
        body: JSON.stringify(nuevoElemento),
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${queToken}`
        }

    } )
        .then(response => response.json())
        .then( json => {
            response.json({
                result:'OK',
                coleccion: queColeccion,
                nuevoElemento: json.elemento
            });
        }
    );
};

apiCtrl.putElement= (request, response, next) => {  
    const queColeccion = request.params.colecciones;
    const queId = request.params.id;
    const queURL =`${URL_WS}/${queColeccion}/${queId}`;
    const nuevoElemento = request.body;
    const queToken = request.params.token;

    fetch( queURL, {
        method: 'PUT',
        body: JSON.stringify(nuevoElemento),
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${queToken}`
        }

    } )
        .then(response => response.json())
        .then( json => {
            response.json({
                result: 'OK',
                colección: queColeccion,
                resultado: json.elemento
            });
        }
    );
}; 

apiCtrl.deleteElement= (request, response, next) => { 
    const queColeccion = request.params.colecciones;
    const queId = request.params.id;
    const queURL =`${URL_WS}/${queColeccion}/${queId}`;
    const nuevoElemento = request.body;
    const queToken = request.params.token;

    fetch( queURL, {
        method: 'DELETE',
        body: JSON.stringify(nuevoElemento),
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${queToken}`
        }

    } )
        .then(response => response.json())
        .then( json => {
            response.json({
                result:'OK',
                coleccion: queColeccion,
                _id: queId,
                nuevoElemento: json.elemento
            });
        }
    );
};

module.exports = apiCtrl;