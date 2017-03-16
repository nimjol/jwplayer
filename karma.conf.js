/* eslint-env node */
/* eslint no-process-env: 0 */
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
    var env = process.env;
    var isJenkins = !!process.env.JENKINS_HOME;
    var serverPort = process.env.KARMA_PORT || 9876;
    var testReporters = [
        // 'dots', // "dots" is useful for writing browser console logs to stdio
        'spec',
        'coverage'
    ];
    if (isJenkins) {
        testReporters.push('junit');
    }
    var packageInfo = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));

    config.set({

        // baseUrl: '.',
        frameworks: ['qunit'],
        reporters: testReporters,
        port: serverPort, // web server port
        colors: !isJenkins, // colors in the output (reporters and logs)
        autoWatch: false, // watch file and execute tests whenever any file changes
        singleRun: 1, // if true, Karma captures browsers, runs the tests and exits

        client: {
            useIframe: false // use a new window for each test
        },

        // Possible values:
        // config.LOG_DISABLE
        // config.LOG_ERROR
        // config.LOG_WARN
        // config.LOG_INFO
        logLevel: config.LOG_DEBUG, // LOG_DEBUG is useful for writing karma server network status messages to stdio
        // logLevel: config.LOG_INFO,

        browsers: [
            'PhantomJS',
            'Chrome',
            //'Safari', // experiencing issues with safari-launcher@1.0.0 and Safari 9.1.1
            'Firefox'
        ],

        customLaunchers: require( './test/karma/browserstack-launchers' ),

        browserStack: {
            username:  env.BS_USERNAME,
            accessKey: env.BS_AUTHKEY,
            name: 'Unit Tests',
            project: 'jwplayer',
            build: '' + (env.JOB_NAME || 'local' ) + ' ' +
            (env.BUILD_NUMBER || env.USER) + ' ' +
            (env.GIT_BRANCH || '') +' '+
            packageInfo.version,
            timeout: 300 // 5 minutes
        },

        // to avoid DISCONNECTED messages when connecting to BrowserStack
        browserDisconnectTimeout : 20 * 1000, // default 2000
        browserDisconnectTolerance : 1, // default 0
        browserNoActivityTimeout : 10 * 1000, //default 10000
        captureTimeout : 120 * 1000, //default 60000

        files : [
            //3rd Party Code
            // { pattern: 'node_modules/handlebars/dist/*.js', included: false },
            // { pattern: 'node_modules/handlebars-loader/*.js', included: false },
            // { pattern: 'node_modules/jquery/dist/*.js', included: false },
            // { pattern: 'node_modules/phantomjs-polyfill/*.js', included: false },
            // { pattern: 'node_modules/intersection-observer/intersection-observer.js', included: false },
            // { pattern: 'node_modules/requirejs/require.js', included: true },
            // { pattern: 'node_modules/requirejs-handlebars/*.js', included: false },
            // { pattern: 'node_modules/requirejs-text/*.js', included: false },
            // { pattern: 'node_modules/simple-style-loader/addStyles.js', included: false },
            // { pattern: 'node_modules/underscore/*.js', included: false },
            // { pattern: 'node_modules/sinon/**/*.js', included: false },

            // Require Config
            // { pattern: 'test/config.js', included: true },

            // Source
            // { pattern: 'src/js/**/*.js', included: false },
            // { pattern: 'src/css/**/*.less', included: false },
            // { pattern: 'src/templates/**/*.html', included: false },

            // Tests
            // { pattern: 'test/data/*.js', included: false },
            // { pattern: 'test/data/*.json', included: false },
            // { pattern: 'test/data/*.xml', included: false },
            // { pattern: 'test/mock/*.js', included: false },
            // { pattern: 'test/unit/*.js', included: false },
            // { pattern: 'src/js/polyfills/*.js' },
            { pattern: 'test-context.js' },
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // source files, that you want to generate coverage for
            'test-context.js': ['webpack'],
            // 'src/js/*.js': ['webpack', 'coverage'],
            // 'src/js/!(polyfill)/*.js': ['webpack']
        },
        coverageReporter: {
            type: 'html',
            dir: 'reports/coverage'
        },
        webpack: {
            umdNamedDefine: true,
            resolve: {
                modulesDirectories: [
                    'src/js/',
                    'src',
                    'src/js/polyfills/',
                    'node_modules'
                ],
                alias: {
                    'test/underscore': '../../node_modules/underscore/underscore.js',
                    'jquery': '../../node_modules/jquery/dist/jquery.js',
                    'sinon': '../../node_modules/sinon/pkg/sinon.js',
                    'data': '../../test/data',
                    'mock': '../../test/mock',
                }
            },
            module: {
                umdNamedDefine: true,
                loaders: [
                    {
                        test: /\.less$/,
                        loaders: [
                            'simple-style-loader',
                            'css',
                            'autoprefixer?browsers=' + encodeURIComponent('> 1%'),
                            'less?compress',
                        ]
                    },
                    {
                        test: /\.html$/,
                        include: [
                            /src/,
                        ],
                        loader: 'handlebars-loader'
                    },
                    {
                        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                        loader: 'file-loader?name=[name].[ext]'
                    },
                    {
                        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                        loader: 'file-loader?name=[name].[ext]'
                    },
                    {
                        test: /\.js/,
                        exclude: /node_modules/,
                        query: {
                            presets: ['es2015']
                        },
                        loader: 'babel-loader'
                    }
                ],
                noParse: [
                    /node_modules\/sinon\//,
                    /node_modules\/jquery\//
                ]
            },
            plugins: [
                new webpack.optimize.LimitChunkCountPlugin({
                    maxChunks: 1
                }),
                new webpack.DefinePlugin({
                    __SELF_HOSTED__: true,
                    __REPO__ : '\'\'',
                    __DEBUG__ : false,
                    __BUILD_VERSION__:  '\'' + '7.10.0' + '\'',
                    __FLASH_VERSION__: 11.2
                })
            ]
        },
        // number of browsers to run at once
        concurrency: Infinity
    });
};
