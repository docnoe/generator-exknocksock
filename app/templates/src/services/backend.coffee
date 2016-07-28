define [
  "knockout"
  "jquery"
  "socketio"
], (ko, $, io) ->
  io = io.connect()

  io.get = (what, cb) ->
    $.get "/#{what}", (data, err) ->
      if cb and data
        cb data

  io.post = (where, what, cb) ->
    $.post "/#{where}", what
    .done (data) ->
      cb data if cb

  return io
