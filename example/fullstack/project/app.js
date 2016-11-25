/*
* construct a express middleware instance
* */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); // 日志列表
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var community = require('./routes/community');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));    // log，专门打印http日志的
app.use(bodyParser.json());      // body json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // cookieparser
app.use(express.static(path.join(__dirname, 'public'))); // static resource server

app.use('/', routes); // routes source
app.use('/community', community); // api : community


// catch 404 and forward to error handler
// the last handle for no api filter
app.use(function(req, res, next) {
  var err = new Error('Not Found');   // create a err?
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
