let createError = require('http-errors');
let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let expressValidator = require('express-validator');
let fileUpload = require('express-fileupload');
let passport = require('passport');
let swaggerJsDoc = require('swagger-jsdoc');
let swaggerUi = require('swagger-ui-express');

//24.05.22
require('dotenv').config();

// init app
let app = express();

app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// set a public folder
app.use(express.static(path.join(__dirname, 'public')));

let config = require('./config/database.js');
// connect to db
mongoose.Promise = global.Promise;
mongoose.connect(config.database).then(() => {
  console.log("Database Connected Successfully!!");
}).catch(err => {
  console.log('Could not connect to the database', err);
  process.exit();
});

// swagger setup
let swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "ECMS API",
      description: "ECMS API Info",
      contact: {
        name: "HZITS"
      },
      servers: ["https://localhost:8000"]
    }
  },
  apis: ["./routes/admin_categories.js", "./routes/admin_pages.js", "./routes/admin_products.js", "./routes/cart.js", "./routes/pages.js", "./routes/products.js", "./routes/users.js"]
}

let swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// set global errors variable
app.locals.errors = null;

//
// Get Page Model
//
let Page = require('./models/page');

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
let Category = require('./models/category');

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

//express-validator middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.')
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

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// setting routes
let pages = require('./routes/pages.js');
let products = require('./routes/products.js');
let cart = require('./routes/cart.js');
let users = require('./routes/users.js');
let adminPages = require('./routes/admin_pages.js');
let adminCategories = require('./routes/admin_categories.js');
let adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// OAuth 2.0
app.get("/auth/google",
    passport.authenticate('google',{ scope: ["profile"] })
);
app.get('/auth/google/ecms',
    passport.authenticate('google', { failureRedirect: './login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');  
    });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

// start the server
app.listen(port, function (){
  console.log('Server started on port ' + port);
});

module.exports = app;
