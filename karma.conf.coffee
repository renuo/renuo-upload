'use strict'

browsers = ['PhantomJS']

if process.env.TRAVIS
  browsers.push('ChromeTravisCi', 'Firefox')
else if process.env.MULTIPLE_BROWSERS
  browsers.push('Chrome', 'Firefox')
else if process.env.CHROME_ONLY
  browsers[0] = 'Chrome'

module.exports = (config) ->
  config.set

    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ''


    # frameworks to use
    # available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine']


    # list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js'
      'bower_components/jasmine-ajax/lib/mock-ajax.js'
      {pattern: '.tmp/specs.js.map', included: false, served: true, watched: false, nocache: true}
      '.tmp/specs.js'
    ]


    # list of files to exclude
    exclude: [
      '**/*.swp'
    ]


    # preprocess matching files before serving them to the browser
    # available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.js': ['sourcemap']
    }


    # test results reporter to use
    # possible values: 'dots', 'progress'
    # available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots']


    # web server port
    port: 9876


    # enable / disable colors in the output (reporters and logs)
    colors: true


    # level of logging
    # possible values:
    # - config.LOG_DISABLE
    # - config.LOG_ERROR
    # - config.LOG_WARN
    # - config.LOG_INFO
    # - config.LOG_DEBUG
    logLevel: config.LOG_WARN


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true

    customLaunchers:
      ChromeTravisCi:
        base: 'Chrome',
        flags: ['--no-sandbox']

    # start these browsers
    # available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: browsers


    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: false

    # Concurrency level
    # how many browser should be started simultanous
    concurrency: Infinity
