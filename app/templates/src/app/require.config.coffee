# require.js looks for the following global when initializing
require =
  baseUrl: "."
  paths:
    bootstrap: "bower_modules/components-bootstrap/js/bootstrap.min"
    crossroads: "bower_modules/crossroads/dist/crossroads.min"
    hasher: "bower_modules/hasher/dist/js/hasher.min"
    jquery: "bower_modules/jquery/dist/jquery"
    knockout: "bower_modules/knockout/dist/knockout"
    "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections.min"
    signals: "bower_modules/js-signals/dist/signals.min"
    text: "bower_modules/requirejs-text/text"
    backend: "services/backend"
    socketio: "/socket.io/socket.io"
    # [Scaffolded plugin registrations will be inserted here. To retain this feature, don't remove this comment.]

  shim:
    bootstrap:
      deps: ["jquery"]
