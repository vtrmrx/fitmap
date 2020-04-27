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
        let selectionType = selectionArray[0].type;
        //if(selectionType == 'RECTANGLE' || selectionType == 'LINE' || selectionType == 'ELLIPSE' || selectionType == 'POLYGON' || selectionType == 'STAR' || selectionType == 'VECTOR' || selectionType == 'TEXT' || selectionType == 'BOOLEAN_OPERATION' ) {}
        if (selectionType == 'VECTOR') {
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
        else {
            alert('Selection must be a path');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLGdCQUFnQjtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJpbml0KGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbik7XG5hc3luYyBmdW5jdGlvbiBpbml0KHNlbGVjdGlvbkFycmF5KSB7XG4gICAgaWYgKHNlbGVjdGlvbkFycmF5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIGxldCBzZWxlY3Rpb25UeXBlID0gc2VsZWN0aW9uQXJyYXlbMF0udHlwZTtcbiAgICAgICAgLy9pZihzZWxlY3Rpb25UeXBlID09ICdSRUNUQU5HTEUnIHx8IHNlbGVjdGlvblR5cGUgPT0gJ0xJTkUnIHx8IHNlbGVjdGlvblR5cGUgPT0gJ0VMTElQU0UnIHx8IHNlbGVjdGlvblR5cGUgPT0gJ1BPTFlHT04nIHx8IHNlbGVjdGlvblR5cGUgPT0gJ1NUQVInIHx8IHNlbGVjdGlvblR5cGUgPT0gJ1ZFQ1RPUicgfHwgc2VsZWN0aW9uVHlwZSA9PSAnVEVYVCcgfHwgc2VsZWN0aW9uVHlwZSA9PSAnQk9PTEVBTl9PUEVSQVRJT04nICkge31cbiAgICAgICAgaWYgKHNlbGVjdGlvblR5cGUgPT0gJ1ZFQ1RPUicpIHtcbiAgICAgICAgICAgIGxldCBmaWxscyA9IHNlbGVjdGlvbkFycmF5WzBdLmZpbGxzO1xuICAgICAgICAgICAgbGV0IHN0cm9rZXMgPSBzZWxlY3Rpb25BcnJheVswXS5zdHJva2VzO1xuICAgICAgICAgICAgbGV0IHVwcGVyRmlsbCA9IGZpbGxzW2ZpbGxzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgbGV0IHVwcGVyU3Ryb2tlID0gc3Ryb2tlc1tzdHJva2VzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgbGV0IGhhc1Zpc2libGVGaWxsO1xuICAgICAgICAgICAgbGV0IGhhc1Zpc2libGVDZW50ZXJlZFN0cm9rZTtcbiAgICAgICAgICAgIGlmIChmaWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaGFzVmlzaWJsZUZpbGwgPSAodXBwZXJGaWxsLnR5cGUgPT09ICdTT0xJRCcgJiYgdXBwZXJGaWxsLm9wYWNpdHkgPT0gMSAmJiB1cHBlckZpbGwudmlzaWJsZSA9PSB0cnVlKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc1Zpc2libGVGaWxsID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3Ryb2tlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaGFzVmlzaWJsZUNlbnRlcmVkU3Ryb2tlID0gKHNlbGVjdGlvbkFycmF5WzBdLnN0cm9rZUFsaWduICE9PSAnT1VUU0lERScgJiYgdXBwZXJTdHJva2UudHlwZSA9PT0gJ1NPTElEJyAmJiB1cHBlclN0cm9rZS5vcGFjaXR5ID09IDEgJiYgdXBwZXJTdHJva2UudmlzaWJsZSA9PSB0cnVlKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc1Zpc2libGVDZW50ZXJlZFN0cm9rZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1Zpc2libGVGaWxsID09IHRydWUgfHwgaGFzVmlzaWJsZUNlbnRlcmVkU3Ryb2tlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgdmlzaWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSgnaW5pdGlhbGl6ZScpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnbWEudWkub25tZXNzYWdlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGhhbmRsZU1lc3NhZ2Uoc2VsZWN0aW9uQXJyYXksIHZhbHVlKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHJhc3Rlcml6ZSBzZWxlY3Rpb25cIikpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJQYXRoJ3MgbGFzdCBzdHJva2Ugb3IgZmlsbCBtdXN0IHNvbGlkIGFuZCB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGVydCgnU2VsZWN0aW9uIG11c3QgYmUgYSBwYXRoJyk7XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNlbGVjdGlvbkFycmF5Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGF0IGxlYXN0IG9uZSBwYXRoJyk7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbGVydCgnUGxlYXNlIHNlbGVjdCBhIHNpbmdsZSBwYXRoIG9ubHknKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG9yaWdpbmFsUGF0aCwgbWVzc2FnZSkge1xuICAgIGxldCB3b3JrUGF0aCA9IG9yaWdpbmFsUGF0aDtcbiAgICBpZiAobWVzc2FnZS50eXBlID09PSAnQ0xPU0UnKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ1JBU1RFUklaRScpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZmxhdHRlbiA9PSB0cnVlKSB7XG4gICAgICAgICAgICB3b3JrUGF0aCA9IGZpZ21hLmZsYXR0ZW4od29ya1BhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd29ya1BhdGggPSB3b3JrUGF0aFswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZS5yb3VuZFNpemUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgd29ya1BhdGgucmVzaXplKE1hdGgucm91bmQod29ya1BhdGgud2lkdGgpLCBNYXRoLnJvdW5kKHdvcmtQYXRoLmhlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2ZWN0b3JQYXRocyA9IHt9O1xuICAgICAgICB3b3JrUGF0aC52ZWN0b3JQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdmVjdG9yUGF0aHNbaW5kZXhdID0gaXRlbTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgaGVpZ2h0OiAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLmhlaWdodCArIHdvcmtQYXRoLnN0cm9rZVdlaWdodCA6IHdvcmtQYXRoLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLndpZHRoICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGgud2lkdGgsXG4gICAgICAgICAgICB4OiAobWVzc2FnZS5yb3VuZFBvc2l0aW9uID09IHRydWUpID8gTWF0aC5yb3VuZCh3b3JrUGF0aC54KSA6IHdvcmtQYXRoLngsXG4gICAgICAgICAgICB5OiAobWVzc2FnZS5yb3VuZFBvc2l0aW9uID09IHRydWUpID8gTWF0aC5yb3VuZCh3b3JrUGF0aC55KSA6IHdvcmtQYXRoLnksXG4gICAgICAgICAgICBzdHJva2VXZWlnaHQ6IHdvcmtQYXRoLnN0cm9rZVdlaWdodCxcbiAgICAgICAgICAgIHN0cm9rZUFsaWduOiB3b3JrUGF0aC5zdHJva2VBbGlnbixcbiAgICAgICAgICAgIHN0cm9rZXM6IHdvcmtQYXRoLnN0cm9rZXMsXG4gICAgICAgICAgICBwYXRoczogdmVjdG9yUGF0aHMsXG4gICAgICAgICAgICBmaWxsOiB3b3JrUGF0aC5maWxsc1xuICAgICAgICB9O1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZShkYXRhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKG1lc3NhZ2UudHlwZSA9PT0gJ1JFUExBQ0UnKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgcmVwbGFjZVBhdGgod29ya1BhdGhbMF0sIG1lc3NhZ2UuYml0bWFwRGF0YSk7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gcmVwbGFjZVBhdGgod29ya1BhdGgsIGJpdG1hcERhdGEpIHtcbiAgICBjb25zb2xlLmxvZygncmVwbGFjZSBwYXRoIScpO1xuICAgIGxldCBiaXRtYXBBcnJheSA9IFVpbnQ4QXJyYXkuZnJvbShPYmplY3QudmFsdWVzKGJpdG1hcERhdGEpKTtcbiAgICBsZXQgZmlnbWFJbWFnZSA9IGZpZ21hLmNyZWF0ZUltYWdlKGJpdG1hcEFycmF5KTtcbiAgICBsZXQgaW1hZ2VIYXNoID0gZmlnbWFJbWFnZS5oYXNoO1xuICAgIGxldCBuZXdQYWludCA9IHtcbiAgICAgICAgYmxlbmRNb2RlOiBcIk5PUk1BTFwiLFxuICAgICAgICBmaWx0ZXJzOiB7XG4gICAgICAgICAgICBleHBvc3VyZTogMCxcbiAgICAgICAgICAgIGNvbnRyYXN0OiAwLFxuICAgICAgICAgICAgc2F0dXJhdGlvbjogMCxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLFxuICAgICAgICAgICAgdGludDogMFxuICAgICAgICB9LFxuICAgICAgICBpbWFnZUhhc2g6IGltYWdlSGFzaCxcbiAgICAgICAgaW1hZ2VUcmFuc2Zvcm06IFtbMSwgMCwgMF0sIFswLCAxLCAwXV0sXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHNjYWxlTW9kZTogXCJDUk9QXCIsXG4gICAgICAgIHNjYWxpbmdGYWN0b3I6IDEsXG4gICAgICAgIHR5cGU6IFwiSU1BR0VcIixcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgIH07XG4gICAgbGV0IHJlY3QgPSBmaWdtYS5jcmVhdGVSZWN0YW5nbGUoKTtcbiAgICBsZXQgZ3JvdXAgPSBmaWdtYS5ncm91cChbd29ya1BhdGgsIHJlY3RdLCB3b3JrUGF0aC5wYXJlbnQpO1xuICAgIGdyb3VwLm5hbWUgPSB3b3JrUGF0aC5uYW1lO1xuICAgIHdvcmtQYXRoLnggPSBNYXRoLnJvdW5kKHdvcmtQYXRoLngpO1xuICAgIHdvcmtQYXRoLnkgPSBNYXRoLnJvdW5kKHdvcmtQYXRoLnkpO1xuICAgIHJlY3QueCA9ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGgueCAtIHdvcmtQYXRoLnN0cm9rZVdlaWdodCAvIDIgOiB3b3JrUGF0aC54O1xuICAgIHJlY3QueSA9ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGgueSAtIHdvcmtQYXRoLnN0cm9rZVdlaWdodCAvIDIgOiB3b3JrUGF0aC55O1xuICAgIHJlY3QubmFtZSA9ICdCaXRtYXAnO1xuICAgIHJlY3QuZmlsbHMgPSB3b3JrUGF0aC5maWxscztcbiAgICB3b3JrUGF0aC5uYW1lID0gJ1ZlY3Rvcic7XG4gICAgd29ya1BhdGgubG9ja2VkID0gdHJ1ZTtcbiAgICB3b3JrUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgcmVjdC5yZXNpemUoKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC53aWR0aCArIHdvcmtQYXRoLnN0cm9rZVdlaWdodCA6IHdvcmtQYXRoLndpZHRoLCAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLmhlaWdodCArIHdvcmtQYXRoLnN0cm9rZVdlaWdodCA6IHdvcmtQYXRoLmhlaWdodCk7XG4gICAgZ3JvdXAueCA9IHdvcmtQYXRoLng7XG4gICAgZ3JvdXAueSA9IHdvcmtQYXRoLnk7XG4gICAgY29uc3QgZmlsbHMgPSBjbG9uZSh3b3JrUGF0aC5maWxscyk7XG4gICAgZmlsbHNbMF0gPSBuZXdQYWludDtcbiAgICByZWN0LmZpbGxzID0gZmlsbHM7XG59XG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlID09PSAnbnVtYmVyJyB8fFxuICAgICAgICB0eXBlID09PSAnc3RyaW5nJyB8fCB0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsLm1hcCh4ID0+IGNsb25lKHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodmFsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWwpIHtcbiAgICAgICAgICAgICAgICBvW2tleV0gPSBjbG9uZSh2YWxba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyAndW5rbm93bic7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9