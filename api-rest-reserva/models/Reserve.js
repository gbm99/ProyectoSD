const { ObjectId } = require('mongodb');
const Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
mongoose.connect("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbreserve?retryWrites=w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>console.log("Conected to dbreserve")).catch(err => console.log(err));
const { Schema } = mongoose;

const ReserveSchema = new Schema({
    email:{type: String, required: true},
    amount:{type: Number, required: true},
    type:{type: String, required: true},
    title: { type: String, required: false},
    serviceH: { type: String, required: false},
    serviceA: { type: String, required: false},
    serviceC: { type: String, required: false},
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

var Reserve = mongoose.model('Reserve',ReserveSchema);

module.exports = Reserve;
