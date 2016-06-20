#!/usr/bin/env coffee

# Module dependencies.
app = require '../app'
debug = require('debug') '<%= slugName %>:server'
http = require 'http'
fs = require 'fs'

# Normalize a port into a number, string, or false.
normalizePort = (val) ->
  port = parseInt val, 10

  # named pipe
  if isNaN port
    val
  # port number
  else if port >= 0
    port

# Event listener for HTTP server "error" event.
onError = (error) ->
  if error.syscall isnt 'listen'
    throw error

  bind = if typeof port is 'string' then "Pipe #{port}" else "Port #{port}"

  # handle specific listen errors with friendly messages
  switch error.code
    when 'EACCES'
      console.error "#{bind} requires elevated privileges"
      process.exit 1
    when 'EADDRINUSE'
      console.error "#{bind} is already in use"
      port++
      server.listen port
      # process.exit 1
    else
      throw error

# Event listener for HTTP server "listening" event.
onListening = ->
  addr = server.address()
  bind = if typeof addr is 'string' then "pipe #{addr}" else "port #{addr.port}"
  debug "Listening on #{bind}"
  console.log "Listening on #{bind}"
  fs.writeFile ".port", addr.port, (err) ->
    console.log err if err

# Get port from environment and store in Express.
port = normalizePort(process.env.PORT) or '3000'
app.set 'port', port

# Create HTTP server.
server = http.createServer app
io = app.http().io
io.attach(server)

# Listen on provided port, on all network interfaces.
server.on 'error', onError
server.on 'listening', onListening
server.listen port
