describe('TrackOurMoney App', function() {

  beforeEach(function() {
    browser.get('http://localhost:8080/');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('TrackOurMoney-Webapp to track personal and group financial transaction');
  });

  it('Invalid Login should show error message', function() {
    element(by.model('login.email')).sendKeys("krvikash35@gmail.com");
    element(by.model('login.password')).sendKeys("123423");
    element(by.id('loginButton')).click();
    browser.driver.sleep(2000, function(){
      expect(element(by.binding('authResMsg')).getText()).
      toEqual('Wrong password!');
    });
  });

  it('unAuthenticated user click account tab, should show login page', function() {
    element(by.id('accountTabButton')).click();
    expect(browser.getCurrentUrl()).toMatch("/main")
  });

  it('Any user click blog tab, should redirect to blog page', function() {
    element(by.id('blogTabButton')).click();
    browser.driver.sleep(1000, function(){
      expect(browser.getCurrentUrl()).toMatch("http://blog.trackourmoney.com/")
    });
  });

  it('when user logsin, redirect to transaction page', function() {
    element(by.model('login.email')).sendKeys("krvikash35@gmail.com");
    element(by.model('login.password')).sendKeys("1234");
    element(by.id('loginButton')).click();
    expect(browser.getCurrentUrl()).toMatch("/trx")
  });

  it('loggedIn user click account tab, show account page', function() {
    element(by.id('accountTabButton')).click();
    expect(browser.getCurrentUrl()).toMatch("/info")
  });

});
