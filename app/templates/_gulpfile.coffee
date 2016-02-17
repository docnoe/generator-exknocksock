# Node modules

fs = require("fs")
vm = require("vm")
merge = require("deeply")
chalk = require("chalk")
es = require("event-stream")

# Gulp and plugins
gulp = require("gulp")
rjs = require("gulp-requirejs-cdnbundler")
concat = require("gulp-concat")
clean = require("gulp-clean")
replace = require("gulp-replace")
uglify = require("gulp-uglify")
htmlreplace = require("gulp-html-replace")
browserSync = require("browser-sync").create()
gutil = require("gulp-util")
rename = require("gulp-rename")

<% if (usesCoffeeScript) { %>
coffee = require("gulp-coffee")
sourcemaps = require("gulp-sourcemaps")
<% } %>

<% if (usesCoffeeScript) { %>
# Compile all .coffee files, producing .js
gulp.task "coffee", ->
  gulp.src('./<%= sourceBase %>/**/*.coffee')
  .pipe(sourcemaps.init())
  .pipe(coffee(bare: true)
  .on("error", gutil.log))
  .pipe(sourcemaps.write())
  .pipe gulp.dest('./<%= sourceBase %>/')
<% } %>


# Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task "js", <% if (usesCoffeeScript) { %>['coffee'] <% } %>, ->
  # Config
  requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync("<%= sourceBase %>/app/require.config.js") + "; require;")
  requireJsOptimizerConfig =
    out: "scripts.js"
    baseUrl: "./<%= sourceBase %>"
    name: "app/startup"
    paths:
      requireLib: "bower_modules/requirejs/require"
      socketio: "empty:"

    include: [
      "requireLib"
      "components/nav-bar/nav-bar"
      "components/home-page/home"
      # [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]
    ]

    insertRequire: ["app/startup"]

  # If you want parts of the site to load on demand, remove them from the 'include' list
  # above, and group them into bundles here.
  # 'bundle-name': [ 'some/module', 'another/module' ],
  # 'another-bundle-name': [ 'yet-another-module' ]

    bundles: {}
    optimize: "none"


  rjs(requireJsRuntimeConfig, requireJsOptimizerConfig)
  # .pipe(uglify(preserveComments: "some"))
  .pipe gulp.dest("./public/")


# Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task "css", ->
  bowerCss = gulp.src("<%= sourceBase %>/bower_modules/components-bootstrap/css/bootstrap.min.css").pipe(replace(/url\((')?\.\.\/fonts\//g, "url($1fonts/"))
  appCss = gulp.src("<%= sourceBase %>/css/*.css")
  combinedCss = es.concat(bowerCss, appCss).pipe(concat("css.css"))
  fontFiles = gulp.src("./<%= sourceBase %>/bower_modules/components-bootstrap/fonts/*",
    base: "./<%= sourceBase %>/bower_modules/components-bootstrap/"
  )
  es.concat(combinedCss, fontFiles).pipe gulp.dest("./public/")


# Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task "html", ->
  gulp.src("./<%= sourceBase %>/index.html").pipe(htmlreplace(
    css: "css.css"
    js: "scripts.js"
  )).pipe gulp.dest("./public/")


# Removes all files from ./public/
gulp.task "clean", ->
  gulp.src("./public/**/*",
    read: false
  ).pipe clean()

gulp.task "copyWWW", ->
  gulp.src "bin/www"
  .pipe rename "www.coffee"
  .pipe gulp.dest "bin/"

gulp.task "sync", ->
  browserSync server:
    baseDir: "./public/"
  return

gulp.task "debugSync", ->
  browserSync.init
    proxy: "localhost:3000"
    port: 4000
    ws: true
  return

gulp.task "reload", ->
  browserSync.reload()
  return

gulp.task "production", [
  "html"
  "js"
  "css"
  "sync"
], ->
  gulp.watch ["<%= sourceBase %>/**/*.html"], [
    "html"
    "reload"
  ]
  gulp.watch [
    "<%= sourceBase %>/**/*.js"
    "<%= sourceBase %>/**/*.coffee"
  ], [
    "js"
    "reload"
  ]
  gulp.watch ["<%= sourceBase %>/**/*.css"], [
    "css"
    "reload"
  ]
  console.log "\nPlaced optimized files in " + chalk.magenta("dist/\n")
  return

gulp.task "debug", [
  <% if (usesCoffeeScript) { %>"coffee" <% } %>
  "debugSync"
], ->
  <% if (usesCoffeeScript) { %>
  gulp.watch ["<%= sourceBase %>/**/*.coffee"], ["coffee"]
  <% } %>

  gulp.watch [
    "<%= sourceBase %>/**/*.js"
    "<%= sourceBase %>/**/*.html"
  ], ["reload"]
  gulp.watch ["bin/www"], ["copyWWW"]
  return

gulp.task "default", [
  "html"
  "js"
  "css"
], (callback) ->
  callback()
  console.log "\nPlaced optimized files in " + chalk.magenta("dist/\n")
  return