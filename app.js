var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var messages = require('express-messages');
var fileUpload = require('express-fileupload');
var passport = require('passport');

var config = require('./config/database.js');
// var port = 4000;

// init app
var app = express();

// connect to db
mongoose.Promise = global.Promise;
mongoose.connect(config.database).then(() => {
  console.log("Database Connected Successfully!!");
}).catch(err => {
  console.log('Could not connect to the database', err);
  process.exit();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// set a public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global errors variable
app.locals.errors = null;

//
// Get Page Model
//
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

//
// Get Category Model
//
var Category = require('./models/category');


// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

//
// express file upload middleware
//
app.use(fileUpload());

//
// body parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//express-validator middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  },
  customValidators: {
    isImage: function (value, filename) {
      let extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));

//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// cart get
app.get('*', function(req,res,next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// setting routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

// start the server
app.listen(port, function (){
  console.log('Server started on port ' + port);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
