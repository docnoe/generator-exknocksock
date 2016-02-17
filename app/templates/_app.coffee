express = require 'express.oi'
path = require 'path'
favicon = require 'serve-favicon'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'

app = express()

app.http().io()


# view engine setup
app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'

# uncomment after placing your favicon in /public
# app.use favicon "#{__dirname}/public/favicon.ico"
app.use logger 'dev'
app.use bodyParser.json()
app.use bodyParser.urlencoded
  extended: false
app.use cookieParser()
if app.get('env') is 'development'
  console.log "using src"
  app.use "/", express.static path.join __dirname, 'src'
else
  console.log "using public"
  app.use "/", express.static path.join __dirname, 'public'

# require and use routes [leave this comment for yeoman]
# cloneRoute = require "./routes/clone"
# app.use "/clone", clone

# catch 404 and forward to error handler
app.use (req, res, next) ->
  err = new Error 'Not Found'
  err.status = 404
  next err

app.io.route "foo", {
  list: (req, res) ->
    res.json(foo)
}

app.io.on "connection", ->
  timeoutfunction = ->
    app.io.emit "foo", "bar"
  setTimeout timeoutfunction, 1000


# error handlers

# development error handler
# will print stacktrace
if app.get('env') is 'development'
  app.use (err, req, res, next) ->
    res.status err.status or 500
    res.render 'error',
      message: err.message,
      error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
  res.status err.status or 500
  res.render 'error',
    message: err.message,
    error: {}

module.exports = app
