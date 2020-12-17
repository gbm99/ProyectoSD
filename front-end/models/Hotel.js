const { ObjectId } = require('mongodb');
const Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
mongoose.connect("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbhotels?retryWrites=true&w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>console.log("Conected to dbhotels")).catch(err => console.log(err));
const { Schema } = mongoose;

const HotelSchema = new Schema({
    title: { type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Hotel',HotelSchema);