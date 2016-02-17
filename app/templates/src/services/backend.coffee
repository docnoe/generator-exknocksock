define [
  "knockout"
  "jquery"
  "socketio"
], (ko, $, io) ->
  io = io.connect()

  get: (what, cb) ->
    $.get "/#{what}", (data, err) ->
      if cb and data
        cb data

  post: (where, what, cb) ->
    $.post "/#{where}", what
      .done (data) ->
        console.log data

  on: (what, cb) ->
    io.on what, cb

