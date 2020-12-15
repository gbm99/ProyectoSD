const passport = require('passport');
const User = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallBack: true
} ,async (email,password,done)=>{
    const user = await User.findOne({email: email});
    if(!user){
        return done(null, false, {message: 'Not user found'});
    }
    else{
        const match = await user.matchPassword(password);
        if(match){
            return done(null,user);
        }
        else{
            return done(null, false);
        }
    }
}));

passport.serializeUser((user, done) =>{
    done(null,user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) =>{
        done(err, user);
    });
});