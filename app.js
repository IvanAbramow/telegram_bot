const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');

// replace the value below with the Telegram token you receive from @BotFather
const token = '5305499568:AAHiWoeSoz2kugSSFSOqwfSbPeBPhjbcTLw';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Let's start a HUNGRY GAAAAMES!!!! I guess random number in 0 - 9 for you and you should to guess it!`)
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId,'Guess my number, cheloveck!',gameOptions);
}

const start = () => {
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

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/f80/4f2/f804f23c-2691-332d-92e2-78bff6b9d47e/2.webp')
            return bot.sendMessage(chatId, `Welcome aboard!`)
        } else if (text === '/info') {
            return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}!`)
        } else if (text === '/game') {
            return startGame(chatId);
        } else {
            return bot.sendMessage(chatId, `${msg.from.first_name} ${msg.from.last_name}, please send another command, I dont understand you!`)
        }
    })

    bot.on('callback_query',  async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === chats[chatId]) {
            return await bot.sendMessage(chatId,`You choose ${data} number and WIN!`, againOptions);
        } else if (data === '/again') {
            return startGame(chatId);
        } else {
            return bot.sendMessage(chatId,`You choose ${data} number and LOOOOOSE! True number was ${chats[chatId]}!`, againOptions);
        }
    })
}

start();