const { ObjectId } = require('mongodb');
const Mongoose = require('mongoose').Mongoose;
const bcrypt = require('bcryptjs');
var mongoose = new Mongoose();
mongoose.connect("mongodb+srv://gbm99:salami99@clustersd.mdwel.mongodb.net/dbusers?retryWrites=true&w=majority",{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>console.log("Conected to dbusers")).catch(err => console.log(err));
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true},
    email: {type: String, required: true},
    password:{type: String, required: true},
    date: {type: Date, default: Date.now}
});

UserSchema.methods.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

UserSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User',UserSchema);