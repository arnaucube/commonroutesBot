const TelegramBot = require('node-telegram-bot-api');

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");

const config = require('./config');



let chatId = ''; // only one chatid

const bot = new TelegramBot(config.telegramToken, {polling: true});
bot.onText(/\/start/, (msg, match) => {
  console.log('chatId', chatId);
  if(chatId) {
    // only allow one chatId
  } else {
    chatId = msg.chat.id;
    console.log('chatId', chatId);
    var msg = `
      Wellcome to commonroutesTelegramBot. Available commands:
      /start
      /pong
      New messages will be send when new travels are published
    `;
    bot.sendMessage(chatId, msg);
  }
});

bot.onText(/\/ping/, (msg, match) => {
  if(chatId) {
    let msg = `pong
    Bot alive.`;
    bot.sendMessage(chatId, msg);
  }
});

var newtravelHandler = function(req, res) {
  console.log(req.body);
  let msg = `
    New ` + req.body.type + ` travel published:
    - 📣 title: ` + req.body.title + `
    - 📄 description: ` + req.body.description + `
    - 🌏 from: ` + req.body.from.name + `
    - 🌍 to: ` + req.body.to.name + `
    - 📆 date: ` + req.body.date + `
    - 💺 seats: ` + req.body.seats;
    if(req.body.package) {
      msg += `
      - 📦 can carry package`;
    }

    msg += `

  📱 Check all the info in the app, or in the web visualizer https://routes.fair.coop/app/#!/travel/` + req.body._id + `
          `;
  bot.sendMessage(chatId, msg);

  res.status(200).jsonp({});
}

// API
var apiRoutes = express.Router();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());

apiRoutes.route('/travel')
    .post(newtravelHandler);

app.use('/api', apiRoutes);
app.listen(config.port, 'localhost', function() {
    console.log("Node server running on http://localhost:" + config.port);
});
