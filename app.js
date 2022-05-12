const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db');
const User = require('./models');

const token = '5305499568:AAHiWoeSoz2kugSSFSOqwfSbPeBPhjbcTLw';

const bot = new TelegramBot(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Let's start a HUNGRY GAAAAMES!!!! I guess random number in 0 - 9 for you and you should to guess it!`);
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId,'Guess my number, cheloveck!',gameOptions);
}

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log('Error connection to postgres', e);
    }

    bot.setMyCommands([
        {
            command:'start', description: 'First visit',
        },
        {
            command:'info', description: 'Send information about user',
        },
        {
            command:'game', description: 'Play game with AI',
        },
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await User.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/f80/4f2/f804f23c-2691-332d-92e2-78bff6b9d47e/2.webp')
                return bot.sendMessage(chatId, `Welcome aboard!`)
            } else if (text === '/info') {
                const user = await User.findOne({chatId});
                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}, in game you have this statistic: ${user.rightAnswers} right answers and ${user.wrongAnswers} wrong answers!`);
            } else if (text === '/game') {
                return startGame(chatId);
            } else {
                return bot.sendMessage(chatId, `${msg.from.first_name} ${msg.from.last_name}, please send another command, I dont understand you!`);
            }
        } catch (e) {
            return bot.sendMessage(chatId, 'Sorry we have some problems');
        }
    });

    bot.on('callback_query',  async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        const user = await User.findOne({chatId});

        if (data == chats[chatId]) {
            user.rightAnswers += 1;
            await bot.sendMessage(chatId,`You choose ${data} number and WIN!`, againOptions);
        } else if (data === '/again') {
            return startGame(chatId);
        } else {
            user.wrongAnswers += 1;
            await bot.sendMessage(chatId,`You choose ${data} number and LOOOOOSE! True number was ${chats[chatId]}!`, againOptions);
        }
        await user.save();
    })
}

start();