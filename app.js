const express = require('express');
const connectDB = require('./db');
const methodOverride = require('method-override');

const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const expressLayouts = require('express-ejs-layouts');

const app = express();
app.use(methodOverride('_method'));

app.use(session({
    secret: 'yoursecret',
    resave: true,
    saveUninitialized: true
}));
app.set("view engine", "ejs");
app.use(expressLayouts);


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
app.use('/', authRoutes);
app.use('/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.render("index",{ layout: false });
});

app.use(express.static('public'));

const mongoose = require("mongoose");
// Connect to the database
connectDB()
  .then(() => {
    console.log('Connected');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
// Routes
app.use('/users', require('./routes/users'));
module.exports = app;
