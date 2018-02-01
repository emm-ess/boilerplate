Frontend-Boilerplate
====================

Just a simple thing for highly optimized frontend-projects using [Gulp](https://gulpjs.com/) & [Webpack 2](https://webpack.js.org/. JavaScript is written in [TypeScript](https://www.typescriptlang.org/) and CSS is written in SASS. The project includes [normalize.css](https://github.com/JohnAlbin/normalize-scss) and [css-post-processors](http://postcss.org/) (namely: [autoprefixer](https://github.com/postcss/autoprefixer), [flexbugs-fixes](https://github.com/luisrudge/postcss-flexbugs-fixes) and [postcss-uncss](https://github.com/RyanZim/postcss-uncss)). For images [imagemin](https://github.com/sindresorhus/gulp-imagemin) is included and [svg-sprites](https://github.com/jkphl/gulp-svg-sprite) are generated on the fly. For old IE [svg4everybody](https://github.com/jonathantneal/svg4everybody) is included.


## Usage

* clone git-repository
* install dependencies `yarn install`
* run Gulp
    -> developing: `gulp serve`
    -> building: `gulp build`
    
    you can also serve the optimized files via `gulp serve --production`

