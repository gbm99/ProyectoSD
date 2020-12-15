const helpers = {};
helpers.isAthenticated = (req, res, next) => {
 if(req.isAthenticated()) {
     return next();
 }
 res.redirect('/users/signin');
};

module.exports = helpers;