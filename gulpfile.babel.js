'use strict'

import gulp         from 'gulp'
import plugins      from 'gulp-load-plugins'
import log          from 'fancy-log'
import PluginError  from 'plugin-error'

import yargs                from 'yargs'
import rimraf               from 'rimraf'
import path                 from 'path'

import autoprefixer         from 'autoprefixer'
import flexbug              from 'postcss-flexbugs-fixes'
import uncss                from 'postcss-uncss'

import browserSync          from 'browser-sync'
import historyApiFallback   from 'connect-history-api-fallback'

import webpack              from 'webpack'
import webpackUnminify      from 'unminified-webpack-plugin'

const browser = browserSync.create()
const $ = plugins(); // loads all gulp-plugins
var PRODUCTION = !!(yargs.argv.production);
var SERVE = true;

const PATHS = {
    src: 'src',
    dist: 'dist'
}

// Build emails, run the server, and watch for file changes
gulp.task('default',
    gulp.series(clean, gulp.parallel(pages, svgSprite, images, copy), gulp.parallel(typescript, sass)));

// Build the "dist" folder by running all of the above tasks
gulp.task('build', (done) => {
    PRODUCTION = true;
    SERVE = false;
    gulp.series('default', usemin)(done);
});

//
gulp.task('serve',
  gulp.series('default', server, watch));


// functions

function clean(done) {
    rimraf(PATHS.dist, done);
}

// Compile layouts, pages, and partials into flat HTML files
function pages() {
  return gulp.src(PATHS.src+'/**/*.html')
    .pipe(gulp.dest(PATHS.dist));
}

// Compile Sass into CSS
function sass() {
  return gulp.src(PATHS.src+'/static/sass/{main,critical}.sass')
    .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
    .pipe($.sass({
      includePaths: ['node_modules/']
    })
    .on('error', $.sass.logError))
    .pipe($.if(PRODUCTION,
        $.postcss([
            // uncss({
            //     html: [PATHS.dist+'/**/*.html'],
            //     ignore: [
            //         /active/,
            //     ]
            // }),
            autoprefixer(),
            flexbug()
        ])))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist+'/static/css'));
}

function typescript(done) {
    let config = require('./webpack.config.js');

    config.watch = SERVE;

    if(PRODUCTION){
        //TODO
        // move to webpack config
        config.plugins = (config.plugins || []).concat([
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true
            }),
            new webpackUnminify()
        ])
    }

    webpack(
        config,
        function(err, stats) {
            if(err) throw new PluginError("webpack", err);
            log("[webpack]", stats.toString({}));
            done();
    });
}

function copy() {
  return gulp.src([PATHS.src+'/static/!(imgs|sass|typescript)**/*.*', PATHS.src+'/static/*.*'])
    .pipe(gulp.dest(PATHS.dist+'/static/'))
}

// Copy and compress images
function images() {
  return gulp.src(PATHS.src+'/static/imgs/**/*')
    .pipe($.if(PRODUCTION, $.imagemin()))
    .pipe(gulp.dest(PATHS.dist+'/static/imgs'));
}

function svgSprite() {
  return gulp.src(PATHS.src+'/static/imgs/svg-sprite/*.svg')
    .pipe($.svgSprite({
        shape: {
            spacing: {
                padding: 0
            },
            transform: ['svgo']
        },
        mode: {
            symbol: {
                common: 'svg',
                mixin: '',
                dimensions: '%s',
                dest: '.',
                bust: false,
                sprite: PATHS.dist+'/static/imgs/svg-sprite.svg',
                render: {
                    scss: {
                        dest: PATHS.src+'/static/sass/generated/_svg-sprite.scss'
                    }
                }
            }
        }
    }))
    .pipe(gulp.dest('.'));
}

function usemin() {
    return gulp.src(PATHS.dist+'/**/*.html')
        .pipe($.usemin({
            //TODO
            // htmlmin via usemin and fileglob gives errors
            // html:       [ $.htmlmin({ collapseWhitespace: true }) ],
            html:       [ $.htmlmin ],
            css:        [ $.cleanCss ],
            inlinecss:  [ $.cleanCss ]
        }))
        .pipe($.htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(PATHS.dist));
}

function reloadProd(done){
    if(PRODUCTION){
        usemin();
    }
    browser.reload();
    done();
}

// Start a server with LiveReload to preview the site in
function server(done) {
  browser.init({
    server: {
      baseDir: PATHS.dist,
      middleware: [historyApiFallback()]
    },
  });
  done();
}

// Watch for file changes
function watch() {
  gulp.watch(PATHS.dist+'/static/js/**/*.js').on('all', gulp.series(reloadProd));

  gulp.watch(PATHS.src+'/**/*.html').on('all',                               gulp.series(pages, reloadProd));
  gulp.watch(PATHS.src+'/static/sass/**/*.{sass,scss}').on('all',            gulp.series(sass, reloadProd));
  gulp.watch([PATHS.src+'/static/!(imgs|sass|typescript)**/*.*', PATHS.src+'/static/*.*']).on('all', gulp.series(copy, reloadProd));
  gulp.watch(PATHS.src+'/static/imgs/{**/*,!svg-sprite/}').on('all',         gulp.series(images, reloadProd));
  gulp.watch(PATHS.src+'/static/imgs/svg-sprite/*.svg').on('all',            gulp.series(svgSprite, sass, reloadProd));
}
