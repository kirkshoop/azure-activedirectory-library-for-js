'use strict'
/* Directive tells jshint that it, describe are globals defined by jasmine */
/* global it */
/* global describe */

describe('E2ETests', function () {
    var appRootUrl, appToGoListUrl, appHomeUrl, appTodoListUrl, username, password, appSetupUrl, unassignedUsername, unassignedPassword, index;
    var elementsArray = [
        'uirouter-nopopup-nohtml5-otherwise',
        'uirouter-nopopup-nohtml5-nootherwise',
        'uirouter-nopopup-html5-otherwise',
        'uirouter-nopopup-html5-nootherwise',
        'ngroute-nopopup-nohtml5-otherwise',
        'ngroute-nopopup-nohtml5-nootherwise',
        'ngroute-nopopup-html5-otherwise',
        'ngroute-nopopup-html5-nootherwise',
        'ngroute-popup-nohtml5-otherwise',
        'ngroute-popup-nohtml5-nootherwise',
        'ngroute-popup-html5-otherwise',
        'ngroute-popup-html5-nootherwise',
        'uirouter-popup-nohtml5-otherwise',
        'uirouter-popup-nohtml5-nootherwise',
        'uirouter-popup-html5-otherwise',
        'uirouter-popup-html5-nootherwise',
    ];
    appRootUrl = 'https://adaljstestapp.azurewebsites.net/'; //'https://adaljsnonangularapp.azurewebsites.net/'; //'http://localhost:44332/';
    appSetupUrl = appRootUrl + 'setup.html';
    appHomeUrl = appRootUrl + '#/Home';
    appToGoListUrl = appRootUrl + '#/ToGoList';
    appTodoListUrl = appRootUrl + '#/TodoList'
    username = "victor@tushartest.onmicrosoft.com";
    password = "user@1992";
    unassignedUsername = "pandu@tushartest2.onmicrosoft.com";
    unassignedPassword = "user@1992";

    var loadSetupPage = function () {
        browser.ignoreSynchronization = true;
        browser.get(appSetupUrl);
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.titleContains('Angular'), 3000, 'setup page not loaded');
    }

    var loginMethod = function (valUserName, valPassword, newUser, processResult) {
        element(by.id('cred_userid_inputtext')).isDisplayed().then(function (isDisplayed) {
            if (isDisplayed) {
                element(by.id('cred_userid_inputtext')).sendKeys(valUserName);
                sendLoginRequest(valPassword, processResult);
            }
            else if (newUser) {
                element(by.id('use_another_account_link')).click().then(function () {
                    element(by.id('cred_userid_inputtext')).sendKeys(valUserName);
                    sendLoginRequest(valPassword, processResult);
                });
            }
            else {
                element(by.id('victor_tushartest_onmicrosoft_com_link')).click().then(function () {
                    sendLoginRequest(valPassword, processResult);
                });
            }
        });
    };

    var sendLoginRequest = function (valPassword, processResult) {
        element(by.id('cred_password_inputtext')).sendKeys(valPassword);
        browser.sleep(2000);
        element(by.id('cred_sign_in_button')).click().then(function () {
            processResult();
        });
    };

    var logoutMethod = function () {
        element(by.id('logoutButton')).isDisplayed().then(function (isDisplayed) {
            if (isDisplayed) {
                element(by.id('logoutButton')).click().then(function () {
                    browser.sleep(2000);
                    browser.getCurrentUrl().then(function (url) {
                        expect(url).toContain(appRootUrl);
                    })
                });
            }
        });
    }

    for (index = 4; index < 8; index++) {
        (function (elementId) {

            it('tests login button ', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    element(by.id('loginButton')).click().then(function () {
                        var expectedResult = function () {
                            expect(browser.getCurrentUrl()).toContain(appRootUrl);
                            expect(browser.executeScript(function () {
                                return window.sessionStorage.getItem('adal.idtoken');
                            })).not.toBe(null);
                            //browser.setLocation('UserData');
                            //browser.getCurrentUrl().then(function (url) {
                            //    expect(url).toContain('UserData');
                            //    var ele = element(by.exactBinding('userInfo.userName'));
                            //    ele.getText().then(function (text) {
                            //        console.log(text);
                            //    });
                            //});
                        }
                        loginMethod(username, password, false, expectedResult);
                    });
                    logoutMethod();
                });
            });

            it('tests that navigating to protected route triggers login', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    element(by.id('todoListOption')).click().then(function () {
                        var expectedResult = function () {
                            expect(browser.getCurrentUrl()).toContain(appRootUrl);
                            expect(browser.executeScript(function () {
                                return window.sessionStorage.getItem('adal.idtoken');
                            })).not.toBe(null);
                        }
                        loginMethod(username, password, false, expectedResult);
                    });
                    logoutMethod();
                });
            });

            it('tests login with an unassigned user ', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    element(by.id('loginButton')).click().then(function () {
                        var expectedResult = function () {
                            browser.getCurrentUrl().then(function (url) {
                                expect(url).toContain(appRootUrl);
                                expect(element(by.id('logoutButton')).isDisplayed()).toBe(false);
                                browser.executeScript(function () {
                                    return {
                                        'error': window.sessionStorage.getItem('adal.error'),
                                        'idtoken': window.sessionStorage.getItem('adal.idtoken')
                                    };
                                }).then(function (storage) {
                                    expect(storage.error).toBe('access_denied');
                                    expect(storage.idtoken).toBe('');
                                });
                            });
                        }
                        loginMethod(unassignedUsername, unassignedPassword, true, expectedResult);
                    });
                    logoutMethod();
                });
            });
        })(elementsArray[index])
    }
});