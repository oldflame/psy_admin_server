var express = require('express'),
  config = require('./config'),
  keygen = require('./keygen'),
  path = require('path'),
  jade = require('jade'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  mongoose = require('mongoose'),
  session = require('express-session'),
  mongoStore = require('connect-mongo')(session),
  helmet = require('helmet'),
  bodyParser = require('body-parser');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var enableCORS = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With,Access-Control-Allow-Origin');
  next();
};
app.use(enableCORS);
global.appRoot = path.resolve(__dirname)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');
helmet(app);
keygen.generate().then(() => {
  console.log("key From config", config.JWEKeySet)
});

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', () => {
  //and... we have a data store
  console.log('DB connection successful');
});

require('./models')(app, mongoose);
require('./routes')(app);

//setup utilities
app.utility = {};
app.utility.workflow = require('./util/workflow');

app.listen(process.env.PORT || 7000, () => {
  console.log("Server running at port ", process.env.PORT || 7000)
})