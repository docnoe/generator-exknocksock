module.exports =
  foo: (req, res) ->
    data = req.data
    res.send data
  bar: (req, res) ->
    req.socket.emit "bar"
