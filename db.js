const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telegram_bot_game',
    'root',
    'root',
    {
        host: '94.26.224.222',
        port: '6432',
        dialect: 'postgres'
    }
)