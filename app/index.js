'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var languageChoice = {
    coffee: 'CoffeeScript',
    js: 'JavaScript'
};

var ExKnockGenerator = yeoman.generators.Base.extend({
    init: function() {
        this.pkg = require('../package.json');

        this.on('end', function() {
            if (!this.options['skip-install']) {
                // Figure out whether we have an internet connection. If not, need to
                // pass --offline to bower otherwise it won't fall back on cache.
                require('dns').resolve('example.com', function(isOffline) {
                    console.log('Installing dependencies in ' + (isOffline ? 'offline' : 'online') + ' mode...');
                    if (isOffline) {
                        // Patch bowerInstall to pass --offline
                        this.bowerInstall = (function(originalFunction) {
                            return function(paths, options, cb) {
                                options = options || {};
                                options.offline = true;
                                return originalFunction.call(this, paths, options, cb);
                            };
                        })(this.bowerInstall);
                    }

                    this.installDependencies();

                    if (this.includeTests) {
                        // Install test dependencies too
                        var bowerArgs = ['install'];
                        if (isOffline) {
                            bowerArgs.push('--offline');
                        }
                        this.spawnCommand('bower', bowerArgs, {
                            cwd: 'test'
                        });
                    }
                }.bind(this));
            }
        });
    },

    askFor: function() {
        var done = this.async();
        this.log(this.yeoman);
        this.log(chalk.magenta('You\'re using the fantastic Knockout app generator.'));

        var prompts = [{
            name: 'name',
            message: 'What\'s the name of your new site?',
            default: path.basename(process.cwd())
        }, {
            type: 'list',
            name: 'codeLanguage',
            message: 'What language do you want to use?',
            choices: [languageChoice.coffee, languageChoice.js]
        }, {
            type: 'confirm',
            name: 'useStylus',
            message: 'Do you want to use stylus as css pre-processor?',
            default: true
        }, {
            type: 'confirm',
            name: 'includeTests',
            message: 'Do you want to include automated tests, using Jasmine and Karma?',
            default: true
        }, {
            name: 'sourceBase',
            message: 'How should your source directory be called? ',
            default: "src"
        }, {
            name: 'distBase',
            message: 'How should your dist directory be called? ',
            default: "public"
        }];

        this.prompt(prompts, function(props) {
            this.longName = props.name;
            this.slugName = this._.slugify(this.longName);
            this.usesCoffeeScript = props.codeLanguage === languageChoice.coffee;
            this.useStylus = props.useStylus;
            this.includeTests = props.includeTests;
            this.sourceBase = props.sourceBase;
            this.distBase = props.distBase;
            done();
        }.bind(this));
    },

    templating: function() {
        var excludeExtension = this.usesCoffeeScript ? ".js" : ".coffee";

        this._processDirectory('src', this.sourceBase, excludeExtension);
        this._processDirectory('bin', "bin", excludeExtension);
        this._processDirectory('views', "views", excludeExtension);
        this._processDirectory('routes', "routes", excludeExtension);
        this.template('_package.json', 'package.json');
        this.template('_bower.json', 'bower.json');
        if (this.usesCoffeeScript) {
            this.template('_gulpfile.coffee', 'gulpfile.coffee');
            this.template('_app.coffee', 'app.coffee');
        } else {
            this.template('_gulpfile.js', 'gulpfile.js');
            this.template('_app.js', 'app.js');
        }
        this.template('_gitignore', '.gitignore');
        this.copy('bowerrc', '.bowerrc');

        if (this.includeTests) {
            // Set up tests
            this._processDirectory('test', 'test', excludeExtension);
            this.copy('bowerrc_test', 'test/.bowerrc');
            this.copy('karma.conf.js');
        }

        // Explicitly copy the .js files used by the .ts output, since they're otherwise excluded
    },

    _processDirectory: function(source, destination, excludeExtension) {
        var root = this.isPathAbsolute(source) ? source : path.join(this.sourceRoot(), source);
        var files = this.expandFiles('**', {
            dot: true,
            cwd: root
        }).filter(function(filename) {
            if (excludeExtension) {
                if (typeof excludeExtension !== "string") { //not a string = is array of extensions
                    return excludeExtension.indexOf(path.extname(filename)) === -1;
                }
                return path.extname(filename) !== excludeExtension;
            }
            return true
        });

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var src = path.join(root, f);
            if (path.basename(f).indexOf('_') == 0) {
                var dest = path.join(destination, path.dirname(f), path.basename(f).replace(/^_/, ''));
                this.template(src, dest);
            } else {
                var dest = path.join(destination, f);
                this.copy(src, dest);
            }
        }
    }
});

module.exports = ExKnockGenerator;
