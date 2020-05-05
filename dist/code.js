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
        if (selection.type == 'RECTANGLE' || selection.type == 'ELLIPSE' || selection.type == 'VECTOR' || selection.type == 'BOOLEAN_OPERATION' || selection.type == 'POLYGON' || selection.type == 'STAR' || selection.type == 'LINE' || selection.type == 'TEXT') {
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
            alert("Selection must be a simple path");
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
        workPath.name = 'workPath';
        replacePath(path, workPath, message.bitmapData, message.roundPosition);
        workPath.remove();
        //figma.closePlugin()
    }
    if (message.type === 'RASTERIZE') {
        let flattenedPath = workPath.clone();
        flattenedPath = figma.flatten([flattenedPath]);
        workPath = flattenedPath;
        if (message.roundSize == true) {
            console.log("round sizes");
            path.resize(Math.round(path.width), Math.round(path.height));
            workPath.resize(Math.round(workPath.width), Math.round(workPath.height));
        }
        if (message.roundPosition == true) {
            console.log("round positions");
            path.x = Math.round(path.x);
            path.y = Math.round(path.y);
        }
        workPath.resize(Math.round(workPath.width), Math.round(workPath.height));
        workPath.x = Math.round(workPath.x);
        workPath.y = Math.round(workPath.y);
        let vectorPaths = {};
        workPath.vectorPaths.forEach(function (item, index) {
            vectorPaths[index] = item;
        });
        console.log(workPath.strokeCap);
        let data = {
            workPath: workPath,
            height: (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.height + workPath.strokeWeight : workPath.height,
            width: (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.width + workPath.strokeWeight : workPath.width,
            x: (message.roundPosition == true) ? Math.round(workPath.x) : workPath.x,
            y: (message.roundPosition == true) ? Math.round(workPath.y) : workPath.y,
            strokeWeight: workPath.strokeWeight,
            strokeAlign: (typeof path.cornerRadius == 'undefined') ? 'CENTER' : workPath.strokeAlign,
            strokeCap: workPath.strokeCap,
            strokes: workPath.strokes,
            vectorPaths: vectorPaths,
            fill: workPath.fills
        };
        figma.ui.postMessage(data);
    }
}
function replacePath(originalPath, workPath, bitmapData, roundPosition) {
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
    let group = figma.group([originalPath, rect], originalPath.parent);
    group.name = originalPath.name;
    if (roundPosition == true) {
        originalPath.x = Math.round(originalPath.x);
        originalPath.y = Math.round(originalPath.y);
    }
    rect.x = (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? (workPath.x - workPath.strokeWeight / 2) : workPath.x;
    rect.y = (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.y - workPath.strokeWeight / 2 : workPath.y;
    rect.name = 'Bitmap';
    rect.fills = workPath.fills;
    originalPath.name = 'Vector';
    originalPath.locked = true;
    originalPath.visible = false;
    rect.resize((workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.width + workPath.strokeWeight : workPath.width, (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.height + workPath.strokeWeight : workPath.height);
    //group.x = originalPath.x
    //group.y = originalPath.y
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxnQkFBZ0I7QUFDeEQsc0NBQXNDLGVBQWU7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiaW5pdChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24pO1xuYXN5bmMgZnVuY3Rpb24gaW5pdChzZWxlY3Rpb25BcnJheSkge1xuICAgIGlmIChzZWxlY3Rpb25BcnJheS5sZW5ndGggPT0gMSkge1xuICAgICAgICBsZXQgc2VsZWN0aW9uID0gc2VsZWN0aW9uQXJyYXlbMF0sIGZpbGxzID0gc2VsZWN0aW9uLmZpbGxzLCBzdHJva2VzID0gc2VsZWN0aW9uLnN0cm9rZXMsIHVwcGVyRmlsbCA9IGZpbGxzW2ZpbGxzLmxlbmd0aCAtIDFdLCB1cHBlclN0cm9rZSA9IHN0cm9rZXNbc3Ryb2tlcy5sZW5ndGggLSAxXSwgaGFzVmlzaWJsZUZpbGwgPSBmYWxzZSwgaGFzVmlzaWJsZUNlbnRlcmVkU3Ryb2tlID0gZmFsc2U7XG4gICAgICAgIGlmIChzZWxlY3Rpb24udHlwZSA9PSAnUkVDVEFOR0xFJyB8fCBzZWxlY3Rpb24udHlwZSA9PSAnRUxMSVBTRScgfHwgc2VsZWN0aW9uLnR5cGUgPT0gJ1ZFQ1RPUicgfHwgc2VsZWN0aW9uLnR5cGUgPT0gJ0JPT0xFQU5fT1BFUkFUSU9OJyB8fCBzZWxlY3Rpb24udHlwZSA9PSAnUE9MWUdPTicgfHwgc2VsZWN0aW9uLnR5cGUgPT0gJ1NUQVInIHx8IHNlbGVjdGlvbi50eXBlID09ICdMSU5FJyB8fCBzZWxlY3Rpb24udHlwZSA9PSAnVEVYVCcpIHtcbiAgICAgICAgICAgIGlmIChmaWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaGFzVmlzaWJsZUZpbGwgPSAodXBwZXJGaWxsLnR5cGUgPT09ICdTT0xJRCcgJiYgdXBwZXJGaWxsLm9wYWNpdHkgPT0gMSAmJiB1cHBlckZpbGwudmlzaWJsZSA9PSB0cnVlKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJva2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBoYXNWaXNpYmxlQ2VudGVyZWRTdHJva2UgPSAoc2VsZWN0aW9uQXJyYXlbMF0uc3Ryb2tlQWxpZ24gIT09ICdPVVRTSURFJyAmJiB1cHBlclN0cm9rZS50eXBlID09PSAnU09MSUQnICYmIHVwcGVyU3Ryb2tlLm9wYWNpdHkgPT0gMSAmJiB1cHBlclN0cm9rZS52aXNpYmxlID09IHRydWUpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1Zpc2libGVGaWxsID09IHRydWUgfHwgaGFzVmlzaWJsZUNlbnRlcmVkU3Ryb2tlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgdmlzaWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICdJTklUJyB9KTtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBhdGggPSBzZWxlY3Rpb247XG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS51aS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoaGFuZGxlTWVzc2FnZShjdXJyZW50UGF0aCwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUGF0aCdzIGxhc3Qgc3Ryb2tlIG9yIGZpbGwgbXVzdCBzb2xpZCBhbmQgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoXCJTZWxlY3Rpb24gbXVzdCBiZSBhIHNpbXBsZSBwYXRoXCIpO1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzZWxlY3Rpb25BcnJheS5sZW5ndGggPT0gMCkge1xuICAgICAgICBhbGVydChcIlBsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIHBhdGhcIik7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhbGVydChcIlBsZWFzZSBzZWxlY3QgYSBzaW5nbGUgcGF0aCBvbmx5XCIpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UocGF0aCwgbWVzc2FnZSkge1xuICAgIGxldCB3b3JrUGF0aCA9IHBhdGg7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0NMT1NFJykge1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgIH1cbiAgICBpZiAoKG1lc3NhZ2UudHlwZSA9PT0gJ1JFUExBQ0UnKSkge1xuICAgICAgICB3b3JrUGF0aCA9IGZpZ21hLmdldE5vZGVCeUlkKG1lc3NhZ2Uud29ya1BhdGguaWQpO1xuICAgICAgICB3b3JrUGF0aC5uYW1lID0gJ3dvcmtQYXRoJztcbiAgICAgICAgcmVwbGFjZVBhdGgocGF0aCwgd29ya1BhdGgsIG1lc3NhZ2UuYml0bWFwRGF0YSwgbWVzc2FnZS5yb3VuZFBvc2l0aW9uKTtcbiAgICAgICAgd29ya1BhdGgucmVtb3ZlKCk7XG4gICAgICAgIC8vZmlnbWEuY2xvc2VQbHVnaW4oKVxuICAgIH1cbiAgICBpZiAobWVzc2FnZS50eXBlID09PSAnUkFTVEVSSVpFJykge1xuICAgICAgICBsZXQgZmxhdHRlbmVkUGF0aCA9IHdvcmtQYXRoLmNsb25lKCk7XG4gICAgICAgIGZsYXR0ZW5lZFBhdGggPSBmaWdtYS5mbGF0dGVuKFtmbGF0dGVuZWRQYXRoXSk7XG4gICAgICAgIHdvcmtQYXRoID0gZmxhdHRlbmVkUGF0aDtcbiAgICAgICAgaWYgKG1lc3NhZ2Uucm91bmRTaXplID09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicm91bmQgc2l6ZXNcIik7XG4gICAgICAgICAgICBwYXRoLnJlc2l6ZShNYXRoLnJvdW5kKHBhdGgud2lkdGgpLCBNYXRoLnJvdW5kKHBhdGguaGVpZ2h0KSk7XG4gICAgICAgICAgICB3b3JrUGF0aC5yZXNpemUoTWF0aC5yb3VuZCh3b3JrUGF0aC53aWR0aCksIE1hdGgucm91bmQod29ya1BhdGguaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2Uucm91bmRQb3NpdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJvdW5kIHBvc2l0aW9uc1wiKTtcbiAgICAgICAgICAgIHBhdGgueCA9IE1hdGgucm91bmQocGF0aC54KTtcbiAgICAgICAgICAgIHBhdGgueSA9IE1hdGgucm91bmQocGF0aC55KTtcbiAgICAgICAgfVxuICAgICAgICB3b3JrUGF0aC5yZXNpemUoTWF0aC5yb3VuZCh3b3JrUGF0aC53aWR0aCksIE1hdGgucm91bmQod29ya1BhdGguaGVpZ2h0KSk7XG4gICAgICAgIHdvcmtQYXRoLnggPSBNYXRoLnJvdW5kKHdvcmtQYXRoLngpO1xuICAgICAgICB3b3JrUGF0aC55ID0gTWF0aC5yb3VuZCh3b3JrUGF0aC55KTtcbiAgICAgICAgbGV0IHZlY3RvclBhdGhzID0ge307XG4gICAgICAgIHdvcmtQYXRoLnZlY3RvclBhdGhzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB2ZWN0b3JQYXRoc1tpbmRleF0gPSBpdGVtO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2cod29ya1BhdGguc3Ryb2tlQ2FwKTtcbiAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICB3b3JrUGF0aDogd29ya1BhdGgsXG4gICAgICAgICAgICBoZWlnaHQ6ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDAgJiYgd29ya1BhdGguc3Ryb2tlQWxpZ24gPT0gJ0NFTlRFUicpID8gd29ya1BhdGguaGVpZ2h0ICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGguaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDAgJiYgd29ya1BhdGguc3Ryb2tlQWxpZ24gPT0gJ0NFTlRFUicpID8gd29ya1BhdGgud2lkdGggKyB3b3JrUGF0aC5zdHJva2VXZWlnaHQgOiB3b3JrUGF0aC53aWR0aCxcbiAgICAgICAgICAgIHg6IChtZXNzYWdlLnJvdW5kUG9zaXRpb24gPT0gdHJ1ZSkgPyBNYXRoLnJvdW5kKHdvcmtQYXRoLngpIDogd29ya1BhdGgueCxcbiAgICAgICAgICAgIHk6IChtZXNzYWdlLnJvdW5kUG9zaXRpb24gPT0gdHJ1ZSkgPyBNYXRoLnJvdW5kKHdvcmtQYXRoLnkpIDogd29ya1BhdGgueSxcbiAgICAgICAgICAgIHN0cm9rZVdlaWdodDogd29ya1BhdGguc3Ryb2tlV2VpZ2h0LFxuICAgICAgICAgICAgc3Ryb2tlQWxpZ246ICh0eXBlb2YgcGF0aC5jb3JuZXJSYWRpdXMgPT0gJ3VuZGVmaW5lZCcpID8gJ0NFTlRFUicgOiB3b3JrUGF0aC5zdHJva2VBbGlnbixcbiAgICAgICAgICAgIHN0cm9rZUNhcDogd29ya1BhdGguc3Ryb2tlQ2FwLFxuICAgICAgICAgICAgc3Ryb2tlczogd29ya1BhdGguc3Ryb2tlcyxcbiAgICAgICAgICAgIHZlY3RvclBhdGhzOiB2ZWN0b3JQYXRocyxcbiAgICAgICAgICAgIGZpbGw6IHdvcmtQYXRoLmZpbGxzXG4gICAgICAgIH07XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKGRhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlcGxhY2VQYXRoKG9yaWdpbmFsUGF0aCwgd29ya1BhdGgsIGJpdG1hcERhdGEsIHJvdW5kUG9zaXRpb24pIHtcbiAgICBsZXQgYml0bWFwQXJyYXkgPSBVaW50OEFycmF5LmZyb20oT2JqZWN0LnZhbHVlcyhiaXRtYXBEYXRhKSk7XG4gICAgbGV0IGZpZ21hSW1hZ2UgPSBmaWdtYS5jcmVhdGVJbWFnZShiaXRtYXBBcnJheSk7XG4gICAgbGV0IGltYWdlSGFzaCA9IGZpZ21hSW1hZ2UuaGFzaDtcbiAgICBsZXQgbmV3UGFpbnQgPSB7XG4gICAgICAgIGJsZW5kTW9kZTogJ05PUk1BTCcsXG4gICAgICAgIGZpbHRlcnM6IHtcbiAgICAgICAgICAgIGV4cG9zdXJlOiAwLFxuICAgICAgICAgICAgY29udHJhc3Q6IDAsXG4gICAgICAgICAgICBzYXR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAsXG4gICAgICAgICAgICB0aW50OiAwXG4gICAgICAgIH0sXG4gICAgICAgIGltYWdlSGFzaDogaW1hZ2VIYXNoLFxuICAgICAgICBpbWFnZVRyYW5zZm9ybTogW1sxLCAwLCAwXSwgWzAsIDEsIDBdXSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgc2NhbGVNb2RlOiAnQ1JPUCcsXG4gICAgICAgIHNjYWxpbmdGYWN0b3I6IDEsXG4gICAgICAgIHR5cGU6ICdJTUFHRScsXG4gICAgICAgIHZpc2libGU6IHRydWVcbiAgICB9O1xuICAgIGxldCByZWN0ID0gZmlnbWEuY3JlYXRlUmVjdGFuZ2xlKCk7XG4gICAgbGV0IGdyb3VwID0gZmlnbWEuZ3JvdXAoW29yaWdpbmFsUGF0aCwgcmVjdF0sIG9yaWdpbmFsUGF0aC5wYXJlbnQpO1xuICAgIGdyb3VwLm5hbWUgPSBvcmlnaW5hbFBhdGgubmFtZTtcbiAgICBpZiAocm91bmRQb3NpdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIG9yaWdpbmFsUGF0aC54ID0gTWF0aC5yb3VuZChvcmlnaW5hbFBhdGgueCk7XG4gICAgICAgIG9yaWdpbmFsUGF0aC55ID0gTWF0aC5yb3VuZChvcmlnaW5hbFBhdGgueSk7XG4gICAgfVxuICAgIHJlY3QueCA9ICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDAgJiYgd29ya1BhdGguc3Ryb2tlQWxpZ24gPT0gJ0NFTlRFUicpID8gKHdvcmtQYXRoLnggLSB3b3JrUGF0aC5zdHJva2VXZWlnaHQgLyAyKSA6IHdvcmtQYXRoLng7XG4gICAgcmVjdC55ID0gKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCAmJiB3b3JrUGF0aC5zdHJva2VBbGlnbiA9PSAnQ0VOVEVSJykgPyB3b3JrUGF0aC55IC0gd29ya1BhdGguc3Ryb2tlV2VpZ2h0IC8gMiA6IHdvcmtQYXRoLnk7XG4gICAgcmVjdC5uYW1lID0gJ0JpdG1hcCc7XG4gICAgcmVjdC5maWxscyA9IHdvcmtQYXRoLmZpbGxzO1xuICAgIG9yaWdpbmFsUGF0aC5uYW1lID0gJ1ZlY3Rvcic7XG4gICAgb3JpZ2luYWxQYXRoLmxvY2tlZCA9IHRydWU7XG4gICAgb3JpZ2luYWxQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICByZWN0LnJlc2l6ZSgod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwICYmIHdvcmtQYXRoLnN0cm9rZUFsaWduID09ICdDRU5URVInKSA/IHdvcmtQYXRoLndpZHRoICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGgud2lkdGgsICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDAgJiYgd29ya1BhdGguc3Ryb2tlQWxpZ24gPT0gJ0NFTlRFUicpID8gd29ya1BhdGguaGVpZ2h0ICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGguaGVpZ2h0KTtcbiAgICAvL2dyb3VwLnggPSBvcmlnaW5hbFBhdGgueFxuICAgIC8vZ3JvdXAueSA9IG9yaWdpbmFsUGF0aC55XG4gICAgY29uc3QgZmlsbHMgPSBjbG9uZSh3b3JrUGF0aC5maWxscyk7XG4gICAgZmlsbHNbMF0gPSBuZXdQYWludDtcbiAgICByZWN0LmZpbGxzID0gZmlsbHM7XG59XG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlID09PSAnbnVtYmVyJyB8fFxuICAgICAgICB0eXBlID09PSAnc3RyaW5nJyB8fCB0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsLm1hcCh4ID0+IGNsb25lKHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodmFsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWwpIHtcbiAgICAgICAgICAgICAgICBvW2tleV0gPSBjbG9uZSh2YWxba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyAndW5rbm93bic7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9