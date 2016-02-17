'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');

var ClassGenerator = yeoman.generators.NamedBase.extend({

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
        console.log('Creating class \'' + this.name + '\' (' + codeLanguage + ')...');
        this.componentName = this.name;
        this.dirname = this.sourceBase + 'classes/';
        this.filename = this._.dasherize(this.name);
        this.viewModelClassName = this._.classify(this.name);
    },

    template: function() {
        this.copy('viewmodel' + this.codeFileExtension, this.dirname + this.filename + this.codeFileExtension);
    },

    addComponentRegistration: function() {
        var requireConfigFile = this.sourceBase + 'app/require.config' + this.codeFileExtension;
        readIfFileExists.call(this, requireConfigFile, function(existingContents) {
            var existingRegistrationRegex = new RegExp('\\bko\\.components\\.register\\(\s*[\'"]' + this.filename + '[\'"]');
            if (existingRegistrationRegex.exec(existingContents)) {
                this.log(chalk.white(this.filename) + chalk.cyan(' is already registered in ') + chalk.white(requireConfigFile));
                return;
            }
            var token = '// [Scaffolded classes registrations will be inserted here. To retain this feature, don\'t remove this comment.]';
            if (this.usesCoffeeScript) {
                token = '# [Scaffolded classes registrations will be inserted here. To retain this feature, don\'t remove this comment.]'
            };
            var regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
                modulePath = 'classes/' + this.filename,
                lineToAdd = this.usesCoffeeScript ? '\"' + this.filename + '\": \"' + modulePath + '\"' : '\"' + this.filename + '\": \"' + modulePath + '\",',
                newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
            fs.writeFile(requireConfigFile, newContents);
            this.log(chalk.green('   referenced ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(requireConfigFile));
        });
    }
});

function readIfFileExists(path, callback) {
    if (fs.existsSync(path)) {
        callback.call(this, this.readFileAsString(path));
    }
}

module.exports = ClassGenerator;