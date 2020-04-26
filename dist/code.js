/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

init(figma.currentPage.selection);
async function init(selectionArray) {
    if (selectionArray.length == 1) {
        let fills = selectionArray[0].fills;
        let strokes = selectionArray[0].strokes;
        let upperFill = fills[fills.length - 1];
        let upperStroke = strokes[strokes.length - 1];
        let hasVisibleFill;
        let hasVisibleCenteredStroke;
        if (fills.length > 0) {
            hasVisibleFill = (upperFill.type === 'SOLID' && upperFill.opacity == 1 && upperFill.visible == true) ? true : false;
        }
        else {
            hasVisibleFill = false;
        }
        if (strokes.length > 0) {
            hasVisibleCenteredStroke = (selectionArray[0].strokeAlign !== 'OUTSIDE' && upperStroke.type === 'SOLID' && upperStroke.opacity == 1 && upperStroke.visible == true) ? true : false;
        }
        else {
            hasVisibleCenteredStroke = false;
        }
        if (hasVisibleFill == true || hasVisibleCenteredStroke == true) {
            figma.showUI(__html__, { visible: true });
            figma.ui.postMessage('initialize');
            await new Promise(function (resolve, reject) {
                figma.ui.onmessage = function (value) {
                    resolve(handleMessage(selectionArray, value)),
                        reject(console.log("Failed to rasterize selection"));
                };
            });
        }
        else {
            alert("Path's last stroke or fill must solid and visible");
            figma.closePlugin();
        }
    }
    else if (selectionArray.length == 0) {
        alert('Please select at least one path');
        figma.closePlugin();
    }
    else {
        alert('Please select a single path only');
        figma.closePlugin();
    }
}
async function handleMessage(originalPath, message) {
    let workPath = originalPath;
    if (message.type === 'CLOSE') {
        figma.closePlugin();
    }
    else if (message.type === 'RASTERIZE') {
        if (message.flatten == true) {
            workPath = figma.flatten(workPath);
        }
        else {
            workPath = workPath[0];
        }
        if (message.roundSize == true) {
            workPath.resize(Math.round(workPath.width), Math.round(workPath.height));
        }
        let vectorPaths = {};
        workPath.vectorPaths.forEach(function (item, index) {
            vectorPaths[index] = item;
        });
        let data = {
            height: (workPath.strokes.length > 0) ? workPath.height + workPath.strokeWeight : workPath.height,
            width: (workPath.strokes.length > 0) ? workPath.width + workPath.strokeWeight : workPath.width,
            x: (message.roundPosition == true) ? Math.round(workPath.x) : workPath.x,
            y: (message.roundPosition == true) ? Math.round(workPath.y) : workPath.y,
            strokeWeight: workPath.strokeWeight,
            strokeAlign: workPath.strokeAlign,
            strokes: workPath.strokes,
            paths: vectorPaths,
            fill: workPath.fills
        };
        figma.ui.postMessage(data);
    }
    else if ((message.type === 'REPLACE')) {
        console.log(message);
        replacePath(workPath[0], message.bitmapData);
        figma.closePlugin();
    }
}
function replacePath(workPath, bitmapData) {
    console.log('replace path!');
    let bitmapArray = Uint8Array.from(Object.values(bitmapData));
    let figmaImage = figma.createImage(bitmapArray);
    let imageHash = figmaImage.hash;
    let newPaint = {
        blendMode: "NORMAL",
        filters: {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0
        },
        imageHash: imageHash,
        imageTransform: [[1, 0, 0], [0, 1, 0]],
        opacity: 1,
        scaleMode: "CROP",
        scalingFactor: 1,
        type: "IMAGE",
        visible: true
    };
    let rect = figma.createRectangle();
    let group = figma.group([workPath, rect], workPath.parent);
    group.name = workPath.name;
    workPath.x = Math.round(workPath.x);
    workPath.y = Math.round(workPath.y);
    rect.x = (workPath.strokes.length > 0) ? workPath.x - workPath.strokeWeight / 2 : workPath.x;
    rect.y = (workPath.strokes.length > 0) ? workPath.y - workPath.strokeWeight / 2 : workPath.y;
    rect.name = 'Bitmap';
    rect.fills = workPath.fills;
    workPath.name = 'Vector';
    workPath.locked = true;
    workPath.visible = false;
    rect.resize((workPath.strokes.length > 0) ? workPath.width + workPath.strokeWeight : workPath.width, (workPath.strokes.length > 0) ? workPath.height + workPath.strokeWeight : workPath.height);
    group.x = workPath.x;
    group.y = workPath.y;
    const fills = clone(workPath.fills);
    fills[0] = newPaint;
    rect.fills = fills;
}
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGdCQUFnQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29kZS50c1wiKTtcbiIsImluaXQoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uKTtcbmFzeW5jIGZ1bmN0aW9uIGluaXQoc2VsZWN0aW9uQXJyYXkpIHtcbiAgICBpZiAoc2VsZWN0aW9uQXJyYXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgbGV0IGZpbGxzID0gc2VsZWN0aW9uQXJyYXlbMF0uZmlsbHM7XG4gICAgICAgIGxldCBzdHJva2VzID0gc2VsZWN0aW9uQXJyYXlbMF0uc3Ryb2tlcztcbiAgICAgICAgbGV0IHVwcGVyRmlsbCA9IGZpbGxzW2ZpbGxzLmxlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdXBwZXJTdHJva2UgPSBzdHJva2VzW3N0cm9rZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCBoYXNWaXNpYmxlRmlsbDtcbiAgICAgICAgbGV0IGhhc1Zpc2libGVDZW50ZXJlZFN0cm9rZTtcbiAgICAgICAgaWYgKGZpbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhc1Zpc2libGVGaWxsID0gKHVwcGVyRmlsbC50eXBlID09PSAnU09MSUQnICYmIHVwcGVyRmlsbC5vcGFjaXR5ID09IDEgJiYgdXBwZXJGaWxsLnZpc2libGUgPT0gdHJ1ZSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYXNWaXNpYmxlRmlsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJva2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhc1Zpc2libGVDZW50ZXJlZFN0cm9rZSA9IChzZWxlY3Rpb25BcnJheVswXS5zdHJva2VBbGlnbiAhPT0gJ09VVFNJREUnICYmIHVwcGVyU3Ryb2tlLnR5cGUgPT09ICdTT0xJRCcgJiYgdXBwZXJTdHJva2Uub3BhY2l0eSA9PSAxICYmIHVwcGVyU3Ryb2tlLnZpc2libGUgPT0gdHJ1ZSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYXNWaXNpYmxlQ2VudGVyZWRTdHJva2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzVmlzaWJsZUZpbGwgPT0gdHJ1ZSB8fCBoYXNWaXNpYmxlQ2VudGVyZWRTdHJva2UgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IHRydWUgfSk7XG4gICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSgnaW5pdGlhbGl6ZScpO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGhhbmRsZU1lc3NhZ2Uoc2VsZWN0aW9uQXJyYXksIHZhbHVlKSksXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coXCJGYWlsZWQgdG8gcmFzdGVyaXplIHNlbGVjdGlvblwiKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoXCJQYXRoJ3MgbGFzdCBzdHJva2Ugb3IgZmlsbCBtdXN0IHNvbGlkIGFuZCB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzZWxlY3Rpb25BcnJheS5sZW5ndGggPT0gMCkge1xuICAgICAgICBhbGVydCgnUGxlYXNlIHNlbGVjdCBhdCBsZWFzdCBvbmUgcGF0aCcpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ1BsZWFzZSBzZWxlY3QgYSBzaW5nbGUgcGF0aCBvbmx5Jyk7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShvcmlnaW5hbFBhdGgsIG1lc3NhZ2UpIHtcbiAgICBsZXQgd29ya1BhdGggPSBvcmlnaW5hbFBhdGg7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0NMT1NFJykge1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09ICdSQVNURVJJWkUnKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLmZsYXR0ZW4gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgd29ya1BhdGggPSBmaWdtYS5mbGF0dGVuKHdvcmtQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdvcmtQYXRoID0gd29ya1BhdGhbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2Uucm91bmRTaXplID09IHRydWUpIHtcbiAgICAgICAgICAgIHdvcmtQYXRoLnJlc2l6ZShNYXRoLnJvdW5kKHdvcmtQYXRoLndpZHRoKSwgTWF0aC5yb3VuZCh3b3JrUGF0aC5oZWlnaHQpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmVjdG9yUGF0aHMgPSB7fTtcbiAgICAgICAgd29ya1BhdGgudmVjdG9yUGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZlY3RvclBhdGhzW2luZGV4XSA9IGl0ZW07XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgIGhlaWdodDogKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC5oZWlnaHQgKyB3b3JrUGF0aC5zdHJva2VXZWlnaHQgOiB3b3JrUGF0aC5oZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC53aWR0aCArIHdvcmtQYXRoLnN0cm9rZVdlaWdodCA6IHdvcmtQYXRoLndpZHRoLFxuICAgICAgICAgICAgeDogKG1lc3NhZ2Uucm91bmRQb3NpdGlvbiA9PSB0cnVlKSA/IE1hdGgucm91bmQod29ya1BhdGgueCkgOiB3b3JrUGF0aC54LFxuICAgICAgICAgICAgeTogKG1lc3NhZ2Uucm91bmRQb3NpdGlvbiA9PSB0cnVlKSA/IE1hdGgucm91bmQod29ya1BhdGgueSkgOiB3b3JrUGF0aC55LFxuICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiB3b3JrUGF0aC5zdHJva2VXZWlnaHQsXG4gICAgICAgICAgICBzdHJva2VBbGlnbjogd29ya1BhdGguc3Ryb2tlQWxpZ24sXG4gICAgICAgICAgICBzdHJva2VzOiB3b3JrUGF0aC5zdHJva2VzLFxuICAgICAgICAgICAgcGF0aHM6IHZlY3RvclBhdGhzLFxuICAgICAgICAgICAgZmlsbDogd29ya1BhdGguZmlsbHNcbiAgICAgICAgfTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoZGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKChtZXNzYWdlLnR5cGUgPT09ICdSRVBMQUNFJykpIHtcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIHJlcGxhY2VQYXRoKHdvcmtQYXRoWzBdLCBtZXNzYWdlLmJpdG1hcERhdGEpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlcGxhY2VQYXRoKHdvcmtQYXRoLCBiaXRtYXBEYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ3JlcGxhY2UgcGF0aCEnKTtcbiAgICBsZXQgYml0bWFwQXJyYXkgPSBVaW50OEFycmF5LmZyb20oT2JqZWN0LnZhbHVlcyhiaXRtYXBEYXRhKSk7XG4gICAgbGV0IGZpZ21hSW1hZ2UgPSBmaWdtYS5jcmVhdGVJbWFnZShiaXRtYXBBcnJheSk7XG4gICAgbGV0IGltYWdlSGFzaCA9IGZpZ21hSW1hZ2UuaGFzaDtcbiAgICBsZXQgbmV3UGFpbnQgPSB7XG4gICAgICAgIGJsZW5kTW9kZTogXCJOT1JNQUxcIixcbiAgICAgICAgZmlsdGVyczoge1xuICAgICAgICAgICAgZXhwb3N1cmU6IDAsXG4gICAgICAgICAgICBjb250cmFzdDogMCxcbiAgICAgICAgICAgIHNhdHVyYXRpb246IDAsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMCxcbiAgICAgICAgICAgIHRpbnQ6IDBcbiAgICAgICAgfSxcbiAgICAgICAgaW1hZ2VIYXNoOiBpbWFnZUhhc2gsXG4gICAgICAgIGltYWdlVHJhbnNmb3JtOiBbWzEsIDAsIDBdLCBbMCwgMSwgMF1dLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBzY2FsZU1vZGU6IFwiQ1JPUFwiLFxuICAgICAgICBzY2FsaW5nRmFjdG9yOiAxLFxuICAgICAgICB0eXBlOiBcIklNQUdFXCIsXG4gICAgICAgIHZpc2libGU6IHRydWVcbiAgICB9O1xuICAgIGxldCByZWN0ID0gZmlnbWEuY3JlYXRlUmVjdGFuZ2xlKCk7XG4gICAgbGV0IGdyb3VwID0gZmlnbWEuZ3JvdXAoW3dvcmtQYXRoLCByZWN0XSwgd29ya1BhdGgucGFyZW50KTtcbiAgICBncm91cC5uYW1lID0gd29ya1BhdGgubmFtZTtcbiAgICB3b3JrUGF0aC54ID0gTWF0aC5yb3VuZCh3b3JrUGF0aC54KTtcbiAgICB3b3JrUGF0aC55ID0gTWF0aC5yb3VuZCh3b3JrUGF0aC55KTtcbiAgICByZWN0LnggPSAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLnggLSB3b3JrUGF0aC5zdHJva2VXZWlnaHQgLyAyIDogd29ya1BhdGgueDtcbiAgICByZWN0LnkgPSAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLnkgLSB3b3JrUGF0aC5zdHJva2VXZWlnaHQgLyAyIDogd29ya1BhdGgueTtcbiAgICByZWN0Lm5hbWUgPSAnQml0bWFwJztcbiAgICByZWN0LmZpbGxzID0gd29ya1BhdGguZmlsbHM7XG4gICAgd29ya1BhdGgubmFtZSA9ICdWZWN0b3InO1xuICAgIHdvcmtQYXRoLmxvY2tlZCA9IHRydWU7XG4gICAgd29ya1BhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgIHJlY3QucmVzaXplKCh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGgud2lkdGggKyB3b3JrUGF0aC5zdHJva2VXZWlnaHQgOiB3b3JrUGF0aC53aWR0aCwgKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC5oZWlnaHQgKyB3b3JrUGF0aC5zdHJva2VXZWlnaHQgOiB3b3JrUGF0aC5oZWlnaHQpO1xuICAgIGdyb3VwLnggPSB3b3JrUGF0aC54O1xuICAgIGdyb3VwLnkgPSB3b3JrUGF0aC55O1xuICAgIGNvbnN0IGZpbGxzID0gY2xvbmUod29ya1BhdGguZmlsbHMpO1xuICAgIGZpbGxzWzBdID0gbmV3UGFpbnQ7XG4gICAgcmVjdC5maWxscyA9IGZpbGxzO1xufVxuZnVuY3Rpb24gY2xvbmUodmFsKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5tYXAoeCA9PiBjbG9uZSh4KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgbyA9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdmFsKSB7XG4gICAgICAgICAgICAgICAgb1trZXldID0gY2xvbmUodmFsW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgJ3Vua25vd24nO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==