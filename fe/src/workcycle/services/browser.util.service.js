/**
 * @namespace service.utils.browser
 */

/**
 * Logging prefix
 *
 * @private
 * @memberOf service.utils.browser
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[browser.utils.service]';

/**
 * Service that contains browser specific methods.
 *
 * @memberOf service.utils.browser
 * @const {Object}
 * @default
 */
const service = {};

/**
 * Go to location. This function allows unit testing on other components by mocking it.
 *
 * @memberOf service.utils.browser
 * @function goToLocation
 *
 * @param {String} newPath - location path
 */
service.goToLocation = (newPath) => {
  window.location = newPath;
};

/**
 * Update page title. This function allows unit testing on other components by mocking it.
 *
 * @memberOf service.utils.browser
 * @function setPageTitle
 *
 * @param {String} title - Page title
 */
service.setPageTitle = (title) => {
  document.title = title;
};

/**
 * Wrapper over setTimeout. This function allows unit testing on other components by mocking it.
 *  For example sinon has useFakeTimers, but when testing with jest you will need to use jest.useFakeTimers
 *  With this function we are sure that when timeouts are used we are calling this function.
 *
 * @method setTimeout
 * @memberOf service.utils.browser
 *
 * @param {Function} method - Function that will be called
 * @param {Number} timeout - time in ms
 */
service.setTimeout = (method, timeout) => {
  global.setTimeout(method, timeout);
};

/**
 * Wrapper over clearTimeout. This function allows unit testing on other components by mocking it.
 *  For example sinon has useFakeTimers, but when testing with jest you will need to use jest.useFakeTimers
 *  With this function we are sure that when timeouts are used we are calling this function.
 *
 * @method clearTimeout
 * @memberOf service.utils.browser
 *
 * @param {Number} timeoutIdentifier - timeout identifier
 */
service.clearTimeout = (timeoutIdentifier) => {
  global.clearTimeout(timeoutIdentifier);
};

service.log = (...args) => {
  global.console.log.apply(this, args);
};

service.warn = (...args) => {
  global.console.warn.apply(global, args);
};

service.error = (...args) => {
  global.console.error.apply(global, args);
};

service.copyToClipboard = (text) => {
  const textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
};

service.getAbsoluteLink = (link) => {
  const {
    host,
    protocol,
  } = window.location;

  return `${protocol}//${host}${link}`;
};

service.scrollToHash = () => {
  service.setTimeout(() => {
    if (window.location.hash) {
      const elemName = window.location.hash.substr(1);

      const element = document.querySelector(`a[name='${elemName}']`);
      if (element) {
        const elementTop = element.offsetTop;
        window.scrollTo(0, elementTop - 120); // header + fixed filter
      }
    }
  });
};

service.reloadPage = () => {
  window.location.reload();
};

export default service;
