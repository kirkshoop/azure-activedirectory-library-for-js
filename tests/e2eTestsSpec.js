'use strict'
/* Directive tells jshint that it, describe are globals defined by jasmine */
/* global it */
/* global describe */

describe('E2ETests', function () {
    var appRootUrl, username, password, appSetupUrl, unassignedUsername, unassignedPassword, index, mainWindow;
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
    username = "victor@tushartest.onmicrosoft.com";
    password = "user@1992";
    unassignedUsername = "pandu@tushartest2.onmicrosoft.com";
    unassignedPassword = "user@1992";
    mainWindow = null;

    var loadSetupPage = function () {
        browser.ignoreSynchronization = true;
        browser.get(appSetupUrl);
        browser.wait(protractor.ExpectedConditions.titleContains('Angular'), 3000, 'setup page not loaded');
    }

    var loginMethod = function (valUserName, valPassword, otherUser, processResult, isPopup) {
        if (isPopup) {
            browser.getAllWindowHandles().then(function (handles) {
                mainWindow = handles[0];
                browser.switchTo().window(handles[1]);
                browser.executeScript('window.focus();');
            });
        }

        element(by.id('cred_userid_inputtext')).isDisplayed().then(function (isDisplayed) {
            if (isDisplayed) {
                element(by.id('cred_userid_inputtext')).sendKeys(valUserName);
                sendLoginRequest(valPassword, processResult);
            }
            else if (otherUser) {
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
        var signInButton = element(by.id('cred_sign_in_button'));
        browser.wait(protractor.ExpectedConditions.elementToBeClickable(signInButton), 1000).then(function () {
            signInButton.click().then(function () {
                if (mainWindow !== null) {
                    browser.switchTo().window(mainWindow);
                    mainWindow = null;
                }
                processResult();
            });;
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

    for (index = 0; index < 16; index++) {
        (function (elementId) {

            var isPopUp = elementId.indexOf('-popup-') > -1 ? true : false;

            it('tests login button', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    var startPageUrl;
                    browser.executeScript('return window.location.href').then(function (url) {
                        startPageUrl = url;
                    });

                    browser.sleep('500');

                    var homePageInputTextElementPresent = false;
                    if (isPopUp && elementId.indexOf('-otherwise') > -1) {
                        expect(element(by.id('homeInputText')).isPresent()).toBe(true);
                        homePageInputTextElementPresent = true;
                        element(by.id('homeInputText')).sendKeys('test input');
                    }

                    element(by.id('loginButton')).click().then(function () {
                        var expectedResult = function () {
                            expect(browser.getCurrentUrl()).toBe(startPageUrl);
                            expect(browser.executeScript(function () {
                                return window.sessionStorage.getItem('adal.idtoken');
                            })).not.toBe(null);

                            if (isPopUp && homePageInputTextElementPresent) {
                                expect(element(by.id('homeInputText')).getAttribute('value')).toBe('test input');
                            }
                            browser.sleep('1000');
                            browser.setLocation('UserData');
                            browser.sleep('500');
                            element(by.exactBinding('userInfo.userName')).getText().then(function (text) {
                                expect(text.toLowerCase()).toBe(username);
                            });
                            expect(element(by.exactBinding('userInfo.isAuthenticated')).getText()).toBe('true');
                        }
                        loginMethod(username, password, false, expectedResult, isPopUp);
                    });
                    logoutMethod();
                });
            });

            it('tests that navigating to protected route triggers login', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    var expectedUrl;
                    if (isPopUp) {
                        expectedUrl = elementId.indexOf('-html5-') > -1 ? appRootUrl + 'TodoList' : appRootUrl + '#/TodoList';
                    }
                    else {
                        browser.executeScript('return window.location.href').then(function (url) {
                            expectedUrl = url;
                        });
                    }
                    element(by.id('todoListOption')).click().then(function () {
                        var expectedResult = function () {
                            expect(browser.getCurrentUrl()).toBe(expectedUrl);
                            expect(browser.executeScript(function () {
                                return window.sessionStorage.getItem('adal.idtoken');
                            })).not.toBe(null);
                        }
                        loginMethod(username, password, false, expectedResult, isPopUp);
                    });
                    logoutMethod();
                });
            });

            it('tests login with an unassigned user', function () {
                loadSetupPage();
                element(by.id(elementId)).click().then(function () {
                    var startPageUrl;
                    browser.executeScript('return window.location.href').then(function (url) {
                        startPageUrl = url;
                    });
                    element(by.id('loginButton')).click().then(function () {
                        var expectedResult = function () {
                            browser.getCurrentUrl().then(function (url) {
                                expect(url).toBe(startPageUrl);
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
                        loginMethod(unassignedUsername, unassignedPassword, true, expectedResult, isPopUp);
                    });
                    logoutMethod();
                });
            });
        })(elementsArray[index])
    }
});