var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['*.js'],
  framework: 'jasmine2',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  capabilities: {
    'browserName': 'chrome'
  },
  chromeOnly: true,

  onPrepare: function() {
        jasmine.getEnv().addReporter(
          new HtmlScreenshotReporter({
            dest: 'report',
            filename: 'tom-test-report.html'
          })
        );
     }

};
