define(["knockout", "crossroads", "hasher"], function(ko, crossroads, hasher) {
  var Router, activateCrossroads;
  Router = function(config) {
    var currentRoute;
    currentRoute = this.currentRoute = ko.observable({});
    ko.utils.arrayForEach(config.routes, function(route) {
      return crossroads.addRoute(route.url, function(requestParams) {
        return currentRoute(ko.utils.extend(requestParams, route.params));
      });
    });
    return activateCrossroads();
  };
  activateCrossroads = function() {
    var parseHash;
    parseHash = function(newHash) {
      return crossroads.parse(newHash);
    };
    crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;
    hasher.initialized.add(parseHash);
    hasher.changed.add(parseHash);
    return hasher.init();
  };
  return new Router({
    routes: [
      {
        url: "",
        params: {
          page: "home-page"
        }
      }, {
        url: "{fallback}",
        params: {
          page: "home-page"
        }
      }
    ]
  });
});
