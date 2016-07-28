express = require 'express.oi'
path = require 'path'
# favicon = require 'serve-favicon'
# logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'

app = express()

app.http().io()

# view engine setup
app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'

# uncomment after placing your favicon in /public
# app.use favicon "#{__dirname}/public/favicon.ico"
# app.use logger 'dev'
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

# require and use routes
app.io.route "foo", require "./routes/foo"
# yeoman route insert [leave this comment for yeoman]

# catch 404 and forward to error handler
app.use (req, res, next) ->
  err = new Error 'Not Found'
  err.status = 404
  next err

# error handlers
# development error handler
# will print stacktrace
if app.get('env') is 'development'
  app.use (err, req, res) ->
    res.status err.status or 500
    res.render 'error',
      message: err.message,
      error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res) ->
  res.status err.status or 500
  res.render 'error',
    message: err.message,
    error: {}

module.exports = app


# # express.oi examples
# app.io.route 'examples',
#   example: (req, res) ->
#     # Respond to current request
#     res.status(200).json message: 'This is my response'
#     # You can check if current request is a websocket
#     if req.isSocket
#       # Emit event to current socket
#       req.socket.emit 'message', 'this is a test'

#       # Emit event to all clients except sender
#       req.socket.broadcast.emit 'message', 'this is a test'

#       # sending to all clients in 'game' room(channel) except sender
#       req.socket.broadcast.to('game').emit 'message', 'nice game'

#       # sending to individual socketid, socketid is like a room
#       req.socket.broadcast.to(socketId).emit 'message', 'for your eyes only'

#       # sending to all clients, including sender
#       req.socket.server.emit 'message', 'for all'

#     # sending to all clients, including sender
#     app.io.emit 'message', 'this is a test'
#     # sending to all clients in 'game' room/channel, including sender
#     app.io.in('game').emit 'message', 'cool game'

# app.io.on "connection", ->
#   timeoutfunction = ->
#     app.io.emit "foo", "bar"
#   setTimeout timeoutfunction, 1000
