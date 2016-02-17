'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');

var BindingGenerator = yeoman.generators.NamedBase.extend({

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
        console.log('Creating binding \'' + this.name + '\' (' + codeLanguage + ')...');
        this.componentName = this.name;
        this.dirname = this.sourceBase + 'bindings/';
        this.filename = this._.camelize(this.name);
        this.viewModelClassName = this._.classify(this.name);
    },

    template: function() {
        this.copy('binding' + this.codeFileExtension, this.dirname + this.filename + this.codeFileExtension);
    }

});

module.exports = BindingGenerator;