const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbairplanes?retryWrites=w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>console.log("Conected to dbairplanes")).catch(err => console.log(err));
const { Schema } = mongoose;

const AirplaneSchema = new Schema({
    title: { type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

/*const TransactionSchema = new Schema({
    userId: ObjectId,
    amount: Number,
    type: String
});                                             poner a la variable en otro programa el mismo nombre
                                                    |
                                                    |
                                                    v
en module exports exportamos con mongoose.model('Transactions',TransactionSchema)*/
module.exports = mongoose.model('Airplane',AirplaneSchema);