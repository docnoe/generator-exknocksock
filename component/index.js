'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');
var path = require('path');

var ComponentGenerator = yeoman.generators.NamedBase.extend({

    detectSourceBase: function() {
        var bowerrc = fs.readFileSync(".bowerrc");
        bowerrc = JSON.parse(bowerrc);
        this.sourceBase = bowerrc.directory.split("bower_modules")[0]
    },

    detectCodeLanguage: function() {
        this.usesCoffeeScript = fs.existsSync(this.sourceBase + 'app/startup.coffee')
        this.codeFileExtension = ".js";
        if (this.usesCoffeeScript) {
            this.codeFileExtension = ".coffee";
        }
    },

    init: function() {
        var codeLanguage = this.usesCoffeeScript ? 'CoffeeScript' : 'JavaScript';
        console.log('Creating component \'' + this.name + '\' (' + codeLanguage + ')...');
        this.filename = this._.dasherize(this.name);
        this.componentName = path.basename(this.filename);
        this.registeredName = this.filename.replace(/\//g, "-");
        this.dirname = this.sourceBase + 'components/' + this.filename + '/';
        this.viewModelClassName = this._.classify(this.name);
    },

    template: function() {
        this.copy('view.html', this.dirname + this.componentName + '.html');
        this.copy('viewmodel' + this.codeFileExtension, this.dirname + this.componentName + this.codeFileExtension);
    },

    addComponentRegistration: function() {
        var startupFile = this.sourceBase + 'app/startup' + this.codeFileExtension;
        readIfFileExists.call(this, startupFile, function(existingContents) {
            var existingRegistrationRegex = new RegExp('\\bko\\.components\\.register\\(\s*[\'"]' + this.registeredName + '[\'"]');
            if (existingRegistrationRegex.exec(existingContents)) {
                this.log(chalk.white(this.registeredName) + chalk.cyan(' is already registered in ') + chalk.white(startupFile));
                return;
            }
            var token = '// [Scaffolded component registrations will be inserted here. To retain this feature, don\'t remove this comment.]';
            if (this.usesCoffeeScript) {
                token = '# [Scaffolded component registrations will be inserted here. To retain this feature, don\'t remove this comment.]'
            };
            var regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
                modulePath = 'components/' + this.filename + '/' + this.componentName,
                lineToAdd = this.usesCoffeeScript ? 'ko.components.register \"' + this.registeredName + '\",\n    require: \'' + modulePath + '\'' : 'ko.components.register(\'' + this.registeredName + '\', { require: \'' + modulePath + '\' });',
                newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
            fs.writeFile(startupFile, newContents);
            this.log(chalk.green('   registered ') + chalk.white(this.registeredName) + chalk.green(' in ') + chalk.white(startupFile));

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