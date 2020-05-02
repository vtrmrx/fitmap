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
        let selection = selectionArray[0], fills = selection.fills, strokes = selection.strokes, upperFill = fills[fills.length - 1], upperStroke = strokes[strokes.length - 1], hasVisibleFill = false, hasVisibleCenteredStroke = false;
        if (selection.type == 'RECTANGLE' || selection.type == 'ELLIPSE' || selection.type == 'VECTOR' || selection.type == 'BOOLEAN_OPERATION') {
            if (fills.length > 0) {
                hasVisibleFill = (upperFill.type === 'SOLID' && upperFill.opacity == 1 && upperFill.visible == true) ? true : false;
            }
            if (strokes.length > 0) {
                hasVisibleCenteredStroke = (selectionArray[0].strokeAlign !== 'OUTSIDE' && upperStroke.type === 'SOLID' && upperStroke.opacity == 1 && upperStroke.visible == true) ? true : false;
            }
            if (hasVisibleFill == true || hasVisibleCenteredStroke == true) {
                figma.showUI(__html__, { visible: true });
                figma.ui.postMessage({ type: 'INIT' });
                let currentPath = selection;
                await new Promise(function (resolve, reject) {
                    figma.ui.onmessage = function (value) {
                        resolve(handleMessage(currentPath, value));
                    };
                });
            }
            else {
                alert("Path's last stroke or fill must solid and visible");
                figma.closePlugin();
            }
        }
        else {
            alert("Selection must be a path");
            figma.closePlugin();
        }
    }
    else if (selectionArray.length == 0) {
        alert("Please select at least one path");
        figma.closePlugin();
    }
    else {
        alert("Please select a single path only");
        figma.closePlugin();
    }
}
async function handleMessage(path, message) {
    let workPath = path;
    if (message.type === 'CLOSE') {
        figma.closePlugin();
    }
    if ((message.type === 'REPLACE')) {
        workPath = figma.getNodeById(message.workPath.id);
        replacePath(path, message.bitmapData);
        if (path != workPath) {
            console.log('remove duplicate:');
            console.log(workPath);
            workPath.remove();
        }
        figma.closePlugin();
    }
    if (message.type === 'RASTERIZE') {
        let flattenedPath = workPath.clone();
        flattenedPath = figma.flatten([flattenedPath]);
        workPath = flattenedPath;
        if (message.roundSize == true) {
            path.resize(Math.round(workPath.width), Math.round(workPath.height));
            workPath.resize(Math.round(workPath.width), Math.round(workPath.height));
        }
        let vectorPaths = {};
        workPath.vectorPaths.forEach(function (item, index) {
            vectorPaths[index] = item;
        });
        let data = {
            workPath: workPath,
            height: (workPath.strokes.length > 0) ? workPath.height + workPath.strokeWeight : workPath.height,
            width: (workPath.strokes.length > 0) ? workPath.width + workPath.strokeWeight : workPath.width,
            x: (message.roundPosition == true) ? Math.round(workPath.x) : workPath.x,
            y: (message.roundPosition == true) ? Math.round(workPath.y) : workPath.y,
            strokeWeight: workPath.strokeWeight,
            strokeAlign: workPath.strokeAlign,
            strokes: workPath.strokes,
            vectorPaths: vectorPaths,
            fill: workPath.fills
        };
        figma.ui.postMessage(data);
    }
}
function replacePath(workPath, bitmapData) {
    let bitmapArray = Uint8Array.from(Object.values(bitmapData));
    let figmaImage = figma.createImage(bitmapArray);
    let imageHash = figmaImage.hash;
    let newPaint = {
        blendMode: 'NORMAL',
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
        scaleMode: 'CROP',
        scalingFactor: 1,
        type: 'IMAGE',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxnQkFBZ0I7QUFDeEQsc0NBQXNDLGVBQWU7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29kZS50c1wiKTtcbiIsImluaXQoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uKTtcbmFzeW5jIGZ1bmN0aW9uIGluaXQoc2VsZWN0aW9uQXJyYXkpIHtcbiAgICBpZiAoc2VsZWN0aW9uQXJyYXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IHNlbGVjdGlvbkFycmF5WzBdLCBmaWxscyA9IHNlbGVjdGlvbi5maWxscywgc3Ryb2tlcyA9IHNlbGVjdGlvbi5zdHJva2VzLCB1cHBlckZpbGwgPSBmaWxsc1tmaWxscy5sZW5ndGggLSAxXSwgdXBwZXJTdHJva2UgPSBzdHJva2VzW3N0cm9rZXMubGVuZ3RoIC0gMV0sIGhhc1Zpc2libGVGaWxsID0gZmFsc2UsIGhhc1Zpc2libGVDZW50ZXJlZFN0cm9rZSA9IGZhbHNlO1xuICAgICAgICBpZiAoc2VsZWN0aW9uLnR5cGUgPT0gJ1JFQ1RBTkdMRScgfHwgc2VsZWN0aW9uLnR5cGUgPT0gJ0VMTElQU0UnIHx8IHNlbGVjdGlvbi50eXBlID09ICdWRUNUT1InIHx8IHNlbGVjdGlvbi50eXBlID09ICdCT09MRUFOX09QRVJBVElPTicpIHtcbiAgICAgICAgICAgIGlmIChmaWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaGFzVmlzaWJsZUZpbGwgPSAodXBwZXJGaWxsLnR5cGUgPT09ICdTT0xJRCcgJiYgdXBwZXJGaWxsLm9wYWNpdHkgPT0gMSAmJiB1cHBlckZpbGwudmlzaWJsZSA9PSB0cnVlKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJva2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBoYXNWaXNpYmxlQ2VudGVyZWRTdHJva2UgPSAoc2VsZWN0aW9uQXJyYXlbMF0uc3Ryb2tlQWxpZ24gIT09ICdPVVRTSURFJyAmJiB1cHBlclN0cm9rZS50eXBlID09PSAnU09MSUQnICYmIHVwcGVyU3Ryb2tlLm9wYWNpdHkgPT0gMSAmJiB1cHBlclN0cm9rZS52aXNpYmxlID09IHRydWUpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1Zpc2libGVGaWxsID09IHRydWUgfHwgaGFzVmlzaWJsZUNlbnRlcmVkU3Ryb2tlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgdmlzaWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICdJTklUJyB9KTtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBhdGggPSBzZWxlY3Rpb247XG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS51aS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoaGFuZGxlTWVzc2FnZShjdXJyZW50UGF0aCwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUGF0aCdzIGxhc3Qgc3Ryb2tlIG9yIGZpbGwgbXVzdCBzb2xpZCBhbmQgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoXCJTZWxlY3Rpb24gbXVzdCBiZSBhIHBhdGhcIik7XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNlbGVjdGlvbkFycmF5Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGFsZXJ0KFwiUGxlYXNlIHNlbGVjdCBhdCBsZWFzdCBvbmUgcGF0aFwiKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFsZXJ0KFwiUGxlYXNlIHNlbGVjdCBhIHNpbmdsZSBwYXRoIG9ubHlcIik7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShwYXRoLCBtZXNzYWdlKSB7XG4gICAgbGV0IHdvcmtQYXRoID0gcGF0aDtcbiAgICBpZiAobWVzc2FnZS50eXBlID09PSAnQ0xPU0UnKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxuICAgIGlmICgobWVzc2FnZS50eXBlID09PSAnUkVQTEFDRScpKSB7XG4gICAgICAgIHdvcmtQYXRoID0gZmlnbWEuZ2V0Tm9kZUJ5SWQobWVzc2FnZS53b3JrUGF0aC5pZCk7XG4gICAgICAgIHJlcGxhY2VQYXRoKHBhdGgsIG1lc3NhZ2UuYml0bWFwRGF0YSk7XG4gICAgICAgIGlmIChwYXRoICE9IHdvcmtQYXRoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncmVtb3ZlIGR1cGxpY2F0ZTonKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHdvcmtQYXRoKTtcbiAgICAgICAgICAgIHdvcmtQYXRoLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdSQVNURVJJWkUnKSB7XG4gICAgICAgIGxldCBmbGF0dGVuZWRQYXRoID0gd29ya1BhdGguY2xvbmUoKTtcbiAgICAgICAgZmxhdHRlbmVkUGF0aCA9IGZpZ21hLmZsYXR0ZW4oW2ZsYXR0ZW5lZFBhdGhdKTtcbiAgICAgICAgd29ya1BhdGggPSBmbGF0dGVuZWRQYXRoO1xuICAgICAgICBpZiAobWVzc2FnZS5yb3VuZFNpemUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgcGF0aC5yZXNpemUoTWF0aC5yb3VuZCh3b3JrUGF0aC53aWR0aCksIE1hdGgucm91bmQod29ya1BhdGguaGVpZ2h0KSk7XG4gICAgICAgICAgICB3b3JrUGF0aC5yZXNpemUoTWF0aC5yb3VuZCh3b3JrUGF0aC53aWR0aCksIE1hdGgucm91bmQod29ya1BhdGguaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZlY3RvclBhdGhzID0ge307XG4gICAgICAgIHdvcmtQYXRoLnZlY3RvclBhdGhzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2ZWN0b3JQYXRoc1tpbmRleF0gPSBpdGVtO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICB3b3JrUGF0aDogd29ya1BhdGgsXG4gICAgICAgICAgICBoZWlnaHQ6ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGguaGVpZ2h0ICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGguaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGgud2lkdGggKyB3b3JrUGF0aC5zdHJva2VXZWlnaHQgOiB3b3JrUGF0aC53aWR0aCxcbiAgICAgICAgICAgIHg6IChtZXNzYWdlLnJvdW5kUG9zaXRpb24gPT0gdHJ1ZSkgPyBNYXRoLnJvdW5kKHdvcmtQYXRoLngpIDogd29ya1BhdGgueCxcbiAgICAgICAgICAgIHk6IChtZXNzYWdlLnJvdW5kUG9zaXRpb24gPT0gdHJ1ZSkgPyBNYXRoLnJvdW5kKHdvcmtQYXRoLnkpIDogd29ya1BhdGgueSxcbiAgICAgICAgICAgIHN0cm9rZVdlaWdodDogd29ya1BhdGguc3Ryb2tlV2VpZ2h0LFxuICAgICAgICAgICAgc3Ryb2tlQWxpZ246IHdvcmtQYXRoLnN0cm9rZUFsaWduLFxuICAgICAgICAgICAgc3Ryb2tlczogd29ya1BhdGguc3Ryb2tlcyxcbiAgICAgICAgICAgIHZlY3RvclBhdGhzOiB2ZWN0b3JQYXRocyxcbiAgICAgICAgICAgIGZpbGw6IHdvcmtQYXRoLmZpbGxzXG4gICAgICAgIH07XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKGRhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlcGxhY2VQYXRoKHdvcmtQYXRoLCBiaXRtYXBEYXRhKSB7XG4gICAgbGV0IGJpdG1hcEFycmF5ID0gVWludDhBcnJheS5mcm9tKE9iamVjdC52YWx1ZXMoYml0bWFwRGF0YSkpO1xuICAgIGxldCBmaWdtYUltYWdlID0gZmlnbWEuY3JlYXRlSW1hZ2UoYml0bWFwQXJyYXkpO1xuICAgIGxldCBpbWFnZUhhc2ggPSBmaWdtYUltYWdlLmhhc2g7XG4gICAgbGV0IG5ld1BhaW50ID0ge1xuICAgICAgICBibGVuZE1vZGU6ICdOT1JNQUwnLFxuICAgICAgICBmaWx0ZXJzOiB7XG4gICAgICAgICAgICBleHBvc3VyZTogMCxcbiAgICAgICAgICAgIGNvbnRyYXN0OiAwLFxuICAgICAgICAgICAgc2F0dXJhdGlvbjogMCxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLFxuICAgICAgICAgICAgdGludDogMFxuICAgICAgICB9LFxuICAgICAgICBpbWFnZUhhc2g6IGltYWdlSGFzaCxcbiAgICAgICAgaW1hZ2VUcmFuc2Zvcm06IFtbMSwgMCwgMF0sIFswLCAxLCAwXV0sXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHNjYWxlTW9kZTogJ0NST1AnLFxuICAgICAgICBzY2FsaW5nRmFjdG9yOiAxLFxuICAgICAgICB0eXBlOiAnSU1BR0UnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgfTtcbiAgICBsZXQgcmVjdCA9IGZpZ21hLmNyZWF0ZVJlY3RhbmdsZSgpO1xuICAgIGxldCBncm91cCA9IGZpZ21hLmdyb3VwKFt3b3JrUGF0aCwgcmVjdF0sIHdvcmtQYXRoLnBhcmVudCk7XG4gICAgZ3JvdXAubmFtZSA9IHdvcmtQYXRoLm5hbWU7XG4gICAgd29ya1BhdGgueCA9IE1hdGgucm91bmQod29ya1BhdGgueCk7XG4gICAgd29ya1BhdGgueSA9IE1hdGgucm91bmQod29ya1BhdGgueSk7XG4gICAgcmVjdC54ID0gKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC54IC0gd29ya1BhdGguc3Ryb2tlV2VpZ2h0IC8gMiA6IHdvcmtQYXRoLng7XG4gICAgcmVjdC55ID0gKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC55IC0gd29ya1BhdGguc3Ryb2tlV2VpZ2h0IC8gMiA6IHdvcmtQYXRoLnk7XG4gICAgcmVjdC5uYW1lID0gJ0JpdG1hcCc7XG4gICAgcmVjdC5maWxscyA9IHdvcmtQYXRoLmZpbGxzO1xuICAgIHdvcmtQYXRoLm5hbWUgPSAnVmVjdG9yJztcbiAgICB3b3JrUGF0aC5sb2NrZWQgPSB0cnVlO1xuICAgIHdvcmtQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICByZWN0LnJlc2l6ZSgod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLndpZHRoICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGgud2lkdGgsICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGguaGVpZ2h0ICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGguaGVpZ2h0KTtcbiAgICBncm91cC54ID0gd29ya1BhdGgueDtcbiAgICBncm91cC55ID0gd29ya1BhdGgueTtcbiAgICBjb25zdCBmaWxscyA9IGNsb25lKHdvcmtQYXRoLmZpbGxzKTtcbiAgICBmaWxsc1swXSA9IG5ld1BhaW50O1xuICAgIHJlY3QuZmlsbHMgPSBmaWxscztcbn1cbmZ1bmN0aW9uIGNsb25lKHZhbCkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGUgPT09ICdudW1iZXInIHx8XG4gICAgICAgIHR5cGUgPT09ICdzdHJpbmcnIHx8IHR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWwubWFwKHggPT4gY2xvbmUoeCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IG8gPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHZhbCkge1xuICAgICAgICAgICAgICAgIG9ba2V5XSA9IGNsb25lKHZhbFtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRocm93ICd1bmtub3duJztcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=