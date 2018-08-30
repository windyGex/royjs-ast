(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("roy-ast", [], factory);
	else if(typeof exports === 'object')
		exports["roy-ast"] = factory();
	else
		root["roy-ast"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: No ESLint configuration found.\n    at Config.getLocalConfigHierarchy (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/config.js:255:39)\n    at Config.getConfigHierarchy (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/config.js:179:43)\n    at Config.getConfigVector (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/config.js:286:21)\n    at Config.getConfig (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/config.js:329:29)\n    at processText (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/cli-engine.js:163:33)\n    at CLIEngine.executeOnText (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint@4.19.1@eslint/lib/cli-engine.js:620:17)\n    at lint (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint-loader@1.9.0@eslint-loader/index.js:218:17)\n    at Object.module.exports (/Users/windyge/seek-workspace/roy-ast/node_modules/_eslint-loader@1.9.0@eslint-loader/index.js:213:21)");

/***/ })
/******/ ]);
});
//# sourceMappingURL=roy-ast.js.map