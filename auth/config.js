module.exports = {
    port: process.env.PORT || 3000,
    db: process.env.MONGODB || 'mongodb://localhost:2707/SD',
    SECRET: 'miclavesecretadetoken',
    TOKEN_EXP_TIME: 7*24*60 // 7 dias expresado en minutos
};