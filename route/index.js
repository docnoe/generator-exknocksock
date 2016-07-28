'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');
var path = require('path');

var ComponentGenerator = yeoman.generators.NamedBase.extend({

    detectCodeLanguage: function() {
        this.usesCoffeeScript = true //fs.existsSync('./app.coffee');
        this.codeFileExtension = ".js";
        if (this.usesCoffeeScript) {
            this.codeFileExtension = ".coffee";
        }
    },

    askFor: function() {
      var done = this.async();
      this.log(this.yeoman);

      var prompts = [
        {
            type: 'list',
            name: 'routeType',
            message: 'What type of route do you want',
            choices: ["io"]
        },
        {
            when: function(response) {
              console.log(response.routeType);
              return (response.routeType == "io")
            },
            type: 'confirm',
            name: 'namespacedRoute',
            message: 'Should the route have sub-routes (namespace:anything)?',
        }
      ]
      this.prompt(prompts, function(props) {
          var routeType = props.routeType;
          if (routeType === "io") {
            routeType = props.namespacedRoute ? "io_namespaced" : "io_single";
          }
          this.longName = props.name;
          this.routeType = routeType;
          done();
      }.bind(this));
    },

    init: function() {
        var codeLanguage = this.usesCoffeeScript ? 'CoffeeScript' : 'JavaScript';
        console.log('Creating ' + this.routeType + ' route \'' + this.name + '\' (' + codeLanguage + ')...');
        this.dirname = './routes/';
        this.dest = this.dirname + this.name + this.codeFileExtension
    },

    template: function() {
        this.copy(this.routeType + this.codeFileExtension, this.dest);
    },

    addRouteRequire: function() {
        var appFile = 'app' + this.codeFileExtension;
        readIfFileExists.call(this, appFile, function(existingContents) {
            var token = '// yeoman route insert [leave this comment for yeoman]';
            if (this.usesCoffeeScript) {
                token = '# yeoman route insert [leave this comment for yeoman]'
            };
            var regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
                modulePath = this.dest,
                lineToAdd = this.usesCoffeeScript ? 'app.io.route \"' + this.name + '\", require \"' + modulePath + '\"' : 'app.io.route(\'' + this.name + '\', require(\'' + modulePath + '\'));',
                newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
            fs.writeFile(appFile, newContents);
            this.log(chalk.green('   registered ') + chalk.white(this.name) + chalk.green(' in ') + chalk.white(appFile));

            if (this.usesCoffeeScript) {
                if (fs.existsSync('gulpfile.coffee')) {
                    this.log(chalk.magenta('To include in build output, reference ') + chalk.white('\'' + modulePath + '\'') + chalk.magenta(' in ') + chalk.white('gulpfile.coffee'));
                }
            }
            if (fs.existsSync('gulpfile.js')) {
                this.log(chalk.magenta('To include in build output, reference ') + chalk.white('\'' + modulePath + '\'') + chalk.magenta(' in ') + chalk.white('gulpfile.js'));
            }
        });
    }

});

function readIfFileExists(path, callback) {
    if (fs.existsSync(path)) {
        callback.call(this, this.readFileAsString(path));
    }
}

module.exports = ComponentGenerator;
