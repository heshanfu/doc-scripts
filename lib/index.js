"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.command = exports.execute = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _log = _interopRequireDefault(require("./log"));

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}

function _empty() {}

var execute = _async(function (cmd, options, webpackConfig) {
  return _continueIgnored(_catch(function () {
    var script = "./scripts/" + cmd + ".js";
    return _await(_fsExtra.default.access(_path.default.resolve(__dirname, script)), function () {
      return _continueIgnored(_catch(function () {
        return _awaitIgnored(require(script)(options, webpackConfig));
      }, function (e) {
        console.log(e && (e.stack || e.message) ? e.stack ? e.stack : e.message : e);
      }));
    });
  }, function () {
    _log.default.error('Executed a command that does not exist.');
  }));
});

exports.execute = execute;

var command = function command(options, webpackConfig) {
  _commander.default.arguments('<cmd>').action(_async(function (cmd) {
    return _awaitIgnored(execute(cmd, options, webpackConfig));
  }));

  _commander.default.parse(process.argv);
};

exports.command = command;