const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
mongoose.createConnection("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbcars?retryWrites=true&w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>console.log("Conected to dbcars")).catch(err => console.log(err));
const { Schema } = mongoose;

const CarSchema = new Schema({
    title: { type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Car',CarSchema);