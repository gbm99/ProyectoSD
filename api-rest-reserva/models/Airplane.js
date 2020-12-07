const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbairplanes?retryWrites=w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
const { Schema } = mongoose;

const AirplaneSchema = new Schema({
    title: { type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Airplane',AirplaneSchema);