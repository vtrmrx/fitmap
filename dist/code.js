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

//Promise.all(figma.currentPage.selection.map(selected => rasterizeSelection(selected))).then(() => maybeClose())
init(figma.currentPage.selection, 0);
async function init(selectionArray, index) {
    let selection = filterSelection(selectionArray);
    console.log(selection.length);
    if (selection.length > 0) {
        figma.showUI(__html__, { visible: true });
        figma.ui.postMessage('initialize');
        const response = await new Promise(function (resolve, reject) {
            figma.ui.onmessage = function (value) {
                resolve(handleMessage(selection, value));
            };
        });
    }
    else {
        alert('Please select at least one path');
        figma.closePlugin();
    }
}
function filterSelection(selection) {
    let selectionObject = {};
    let selectionIndex = 0;
    selection.forEach(function (item, index) {
        let t = item.type;
        if (t == 'BOOLEAN_OPERATION' || t == 'VECTOR' || t == 'STAR' || t == 'LINE' || t == 'ELLIPSE' || t == 'POLYGON' || t == 'RECTANGLE' || t == 'TEXT') {
            selectionObject[selectionIndex] = item;
            selectionIndex++;
            console.log("it's a lovely figure: " + t);
        }
        else if (t == 'FRAME' || t == 'GROUP' || t == 'INSTANCE') {
            if (item.children.length > 0) {
                let weirdStuff = false;
                for (let i = 0; i < item.children.length; i++) {
                    let ct = item.children[i].type;
                    if (ct != 'BOOLEAN_OPERATION' &&
                        ct != 'VECTOR' &&
                        ct != 'STAR' &&
                        ct != 'LINE' &&
                        ct != 'ELLIPSE' &&
                        ct != 'POLYGON' &&
                        ct != 'RECTANGLE' &&
                        ct != 'TEXT') {
                        weirdStuff = true;
                        console.log("contains weird stuff");
                        break;
                    }
                }
                if (weirdStuff == false) {
                    selectionObject[selectionIndex] = item;
                    selectionIndex++;
                    console.log("contains only clean stuff");
                }
            }
        }
        else if (t == 'COMPONENT') {
            console.log("it's a component. Leave it alone.");
        }
        else if (t == 'DOCUMENT' || t == 'PAGE' || t == 'SLICE') {
            console.log("it's some ugly thing: " + t);
        }
    });
    let filteredArray = Object.values(selectionObject);
    return filteredArray;
}
async function handleMessage(originalPath, message) {
    let workPath = originalPath;
    if (message == 'close') {
        figma.closePlugin();
    }
    else if (message == 'rasterize') {
        workPath = figma.flatten(workPath);
        workPath.resize(Math.round(workPath.width), Math.round(workPath.height));
        //considering compound paths, create array with all paths
        let vectorPaths = {};
        workPath.vectorPaths.forEach(function (item, index) {
            vectorPaths[index] = item;
        });
        console.log(workPath);
        //prepare selection data as message
        let data = {
            height: (workPath.strokes.length > 0) ? workPath.height + workPath.strokeWeight : workPath.height,
            width: (workPath.strokes.length > 0) ? workPath.width + workPath.strokeWeight : workPath.width,
            x: Math.round(workPath.x),
            y: Math.round(workPath.y),
            strokeWeight: workPath.strokeWeight,
            strokes: workPath.strokes,
            paths: vectorPaths,
            fill: workPath.fills
        };
        console.log(data);
        figma.ui.postMessage(data);
        const pathBitmap = await new Promise(function (resolve, reject) {
            figma.ui.onmessage = function (value) {
                resolve(replacePath(workPath, value));
            };
        });
        figma.closePlugin();
    }
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
    console.log(workPath);
    let parent = workPath.parent;
    let rect = figma.createRectangle();
    let group = figma.group([workPath, rect], parent);
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
function roundPaths(selection) {
    //first, flatten selection(array of objects) to single path object
    //let flatSelection = figma.flatten(Object.values(selection))
    //get all flat selection vector paths structure
    //let vectorPaths = flatSelection.vectorPaths
    let vectorPaths = selection.vectorPaths;
    //clone vector paths structure
    let vectorPathsClone = clone(vectorPaths);
    vectorPaths.forEach(function (item, index) {
        let roundRate = 0;
        let floorRate = 0;
        let ceilRate = 0;
        function roundNumber(match, offset, string) {
            let roundedMatch = Math.round(parseFloat(match));
            let singleAdjust = Math.abs(roundedMatch - parseFloat(match));
            roundRate += singleAdjust;
            return roundedMatch;
        }
        function floorNumber(match, offset, string) {
            let flooredMatch = Math.floor(parseFloat(match));
            let singleAdjust = Math.abs(flooredMatch + parseFloat(match));
            floorRate += singleAdjust;
            return flooredMatch;
        }
        function ceilNumber(match, offset, string) {
            let ceiledMatch = Math.ceil(parseFloat(match));
            let singleAdjust = Math.abs(ceiledMatch + parseFloat(match));
            ceilRate += singleAdjust;
            return ceiledMatch;
        }
        let roundedData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, roundNumber);
        let flooredData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, floorNumber);
        let ceiledData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, ceilNumber);
        // console.log('rounding x flooring x ceiling:')
        // console.log(roundRate)
        // console.log(floorRate)
        // console.log(ceilRate)
        vectorPathsClone[index].data = roundedData;
        // if (floorRate < ceilRate) {
        //   vectorPathsClone[index].data = flooredData
        // } else {
        //   vectorPathsClone[index].data = ceiledData
        // }
        // update flat selection vector paths to the rounded ones
        selection.vectorPaths = vectorPathsClone;
    });
    console.log(selection.vectorPaths);
    return selection;
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxnQkFBZ0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQiwwQkFBMEI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCIvL1Byb21pc2UuYWxsKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5tYXAoc2VsZWN0ZWQgPT4gcmFzdGVyaXplU2VsZWN0aW9uKHNlbGVjdGVkKSkpLnRoZW4oKCkgPT4gbWF5YmVDbG9zZSgpKVxuaW5pdChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24sIDApO1xuYXN5bmMgZnVuY3Rpb24gaW5pdChzZWxlY3Rpb25BcnJheSwgaW5kZXgpIHtcbiAgICBsZXQgc2VsZWN0aW9uID0gZmlsdGVyU2VsZWN0aW9uKHNlbGVjdGlvbkFycmF5KTtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3Rpb24ubGVuZ3RoKTtcbiAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IHRydWUgfSk7XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKCdpbml0aWFsaXplJyk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZmlnbWEudWkub25tZXNzYWdlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShoYW5kbGVNZXNzYWdlKHNlbGVjdGlvbiwgdmFsdWUpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ1BsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIHBhdGgnKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG59XG5mdW5jdGlvbiBmaWx0ZXJTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgbGV0IHNlbGVjdGlvbk9iamVjdCA9IHt9O1xuICAgIGxldCBzZWxlY3Rpb25JbmRleCA9IDA7XG4gICAgc2VsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIGxldCB0ID0gaXRlbS50eXBlO1xuICAgICAgICBpZiAodCA9PSAnQk9PTEVBTl9PUEVSQVRJT04nIHx8IHQgPT0gJ1ZFQ1RPUicgfHwgdCA9PSAnU1RBUicgfHwgdCA9PSAnTElORScgfHwgdCA9PSAnRUxMSVBTRScgfHwgdCA9PSAnUE9MWUdPTicgfHwgdCA9PSAnUkVDVEFOR0xFJyB8fCB0ID09ICdURVhUJykge1xuICAgICAgICAgICAgc2VsZWN0aW9uT2JqZWN0W3NlbGVjdGlvbkluZGV4XSA9IGl0ZW07XG4gICAgICAgICAgICBzZWxlY3Rpb25JbmRleCsrO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGEgbG92ZWx5IGZpZ3VyZTogXCIgKyB0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0ID09ICdGUkFNRScgfHwgdCA9PSAnR1JPVVAnIHx8IHQgPT0gJ0lOU1RBTkNFJykge1xuICAgICAgICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCB3ZWlyZFN0dWZmID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdCA9IGl0ZW0uY2hpbGRyZW5baV0udHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0ICE9ICdCT09MRUFOX09QRVJBVElPTicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0ICE9ICdWRUNUT1InICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjdCAhPSAnU1RBUicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0ICE9ICdMSU5FJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY3QgIT0gJ0VMTElQU0UnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjdCAhPSAnUE9MWUdPTicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0ICE9ICdSRUNUQU5HTEUnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjdCAhPSAnVEVYVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlaXJkU3R1ZmYgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb250YWlucyB3ZWlyZCBzdHVmZlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh3ZWlyZFN0dWZmID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbk9iamVjdFtzZWxlY3Rpb25JbmRleF0gPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbnRhaW5zIG9ubHkgY2xlYW4gc3R1ZmZcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHQgPT0gJ0NPTVBPTkVOVCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQncyBhIGNvbXBvbmVudC4gTGVhdmUgaXQgYWxvbmUuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHQgPT0gJ0RPQ1VNRU5UJyB8fCB0ID09ICdQQUdFJyB8fCB0ID09ICdTTElDRScpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQncyBzb21lIHVnbHkgdGhpbmc6IFwiICsgdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgZmlsdGVyZWRBcnJheSA9IE9iamVjdC52YWx1ZXMoc2VsZWN0aW9uT2JqZWN0KTtcbiAgICByZXR1cm4gZmlsdGVyZWRBcnJheTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2Uob3JpZ2luYWxQYXRoLCBtZXNzYWdlKSB7XG4gICAgbGV0IHdvcmtQYXRoID0gb3JpZ2luYWxQYXRoO1xuICAgIGlmIChtZXNzYWdlID09ICdjbG9zZScpIHtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZSA9PSAncmFzdGVyaXplJykge1xuICAgICAgICB3b3JrUGF0aCA9IGZpZ21hLmZsYXR0ZW4od29ya1BhdGgpO1xuICAgICAgICB3b3JrUGF0aC5yZXNpemUoTWF0aC5yb3VuZCh3b3JrUGF0aC53aWR0aCksIE1hdGgucm91bmQod29ya1BhdGguaGVpZ2h0KSk7XG4gICAgICAgIC8vY29uc2lkZXJpbmcgY29tcG91bmQgcGF0aHMsIGNyZWF0ZSBhcnJheSB3aXRoIGFsbCBwYXRoc1xuICAgICAgICBsZXQgdmVjdG9yUGF0aHMgPSB7fTtcbiAgICAgICAgd29ya1BhdGgudmVjdG9yUGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZlY3RvclBhdGhzW2luZGV4XSA9IGl0ZW07XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyh3b3JrUGF0aCk7XG4gICAgICAgIC8vcHJlcGFyZSBzZWxlY3Rpb24gZGF0YSBhcyBtZXNzYWdlXG4gICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgaGVpZ2h0OiAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLmhlaWdodCArIHdvcmtQYXRoLnN0cm9rZVdlaWdodCA6IHdvcmtQYXRoLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiAod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLndpZHRoICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGgud2lkdGgsXG4gICAgICAgICAgICB4OiBNYXRoLnJvdW5kKHdvcmtQYXRoLngpLFxuICAgICAgICAgICAgeTogTWF0aC5yb3VuZCh3b3JrUGF0aC55KSxcbiAgICAgICAgICAgIHN0cm9rZVdlaWdodDogd29ya1BhdGguc3Ryb2tlV2VpZ2h0LFxuICAgICAgICAgICAgc3Ryb2tlczogd29ya1BhdGguc3Ryb2tlcyxcbiAgICAgICAgICAgIHBhdGhzOiB2ZWN0b3JQYXRocyxcbiAgICAgICAgICAgIGZpbGw6IHdvcmtQYXRoLmZpbGxzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZShkYXRhKTtcbiAgICAgICAgY29uc3QgcGF0aEJpdG1hcCA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVwbGFjZVBhdGgod29ya1BhdGgsIHZhbHVlKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlID09PSAnbnVtYmVyJyB8fFxuICAgICAgICB0eXBlID09PSAnc3RyaW5nJyB8fCB0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsLm1hcCh4ID0+IGNsb25lKHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodmFsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWwpIHtcbiAgICAgICAgICAgICAgICBvW2tleV0gPSBjbG9uZSh2YWxba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyAndW5rbm93bic7XG59XG5mdW5jdGlvbiByZXBsYWNlUGF0aCh3b3JrUGF0aCwgYml0bWFwRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdyZXBsYWNlIHBhdGghJyk7XG4gICAgbGV0IGJpdG1hcEFycmF5ID0gVWludDhBcnJheS5mcm9tKE9iamVjdC52YWx1ZXMoYml0bWFwRGF0YSkpO1xuICAgIGxldCBmaWdtYUltYWdlID0gZmlnbWEuY3JlYXRlSW1hZ2UoYml0bWFwQXJyYXkpO1xuICAgIGxldCBpbWFnZUhhc2ggPSBmaWdtYUltYWdlLmhhc2g7XG4gICAgbGV0IG5ld1BhaW50ID0ge1xuICAgICAgICBibGVuZE1vZGU6IFwiTk9STUFMXCIsXG4gICAgICAgIGZpbHRlcnM6IHtcbiAgICAgICAgICAgIGV4cG9zdXJlOiAwLFxuICAgICAgICAgICAgY29udHJhc3Q6IDAsXG4gICAgICAgICAgICBzYXR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAsXG4gICAgICAgICAgICB0aW50OiAwXG4gICAgICAgIH0sXG4gICAgICAgIGltYWdlSGFzaDogaW1hZ2VIYXNoLFxuICAgICAgICBpbWFnZVRyYW5zZm9ybTogW1sxLCAwLCAwXSwgWzAsIDEsIDBdXSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgc2NhbGVNb2RlOiBcIkNST1BcIixcbiAgICAgICAgc2NhbGluZ0ZhY3RvcjogMSxcbiAgICAgICAgdHlwZTogXCJJTUFHRVwiLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgfTtcbiAgICBjb25zb2xlLmxvZyh3b3JrUGF0aCk7XG4gICAgbGV0IHBhcmVudCA9IHdvcmtQYXRoLnBhcmVudDtcbiAgICBsZXQgcmVjdCA9IGZpZ21hLmNyZWF0ZVJlY3RhbmdsZSgpO1xuICAgIGxldCBncm91cCA9IGZpZ21hLmdyb3VwKFt3b3JrUGF0aCwgcmVjdF0sIHBhcmVudCk7XG4gICAgZ3JvdXAubmFtZSA9IHdvcmtQYXRoLm5hbWU7XG4gICAgd29ya1BhdGgueCA9IE1hdGgucm91bmQod29ya1BhdGgueCk7XG4gICAgd29ya1BhdGgueSA9IE1hdGgucm91bmQod29ya1BhdGgueSk7XG4gICAgcmVjdC54ID0gKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC54IC0gd29ya1BhdGguc3Ryb2tlV2VpZ2h0IC8gMiA6IHdvcmtQYXRoLng7XG4gICAgcmVjdC55ID0gKHdvcmtQYXRoLnN0cm9rZXMubGVuZ3RoID4gMCkgPyB3b3JrUGF0aC55IC0gd29ya1BhdGguc3Ryb2tlV2VpZ2h0IC8gMiA6IHdvcmtQYXRoLnk7XG4gICAgcmVjdC5uYW1lID0gJ0JpdG1hcCc7XG4gICAgcmVjdC5maWxscyA9IHdvcmtQYXRoLmZpbGxzO1xuICAgIHdvcmtQYXRoLm5hbWUgPSAnVmVjdG9yJztcbiAgICB3b3JrUGF0aC5sb2NrZWQgPSB0cnVlO1xuICAgIHdvcmtQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICByZWN0LnJlc2l6ZSgod29ya1BhdGguc3Ryb2tlcy5sZW5ndGggPiAwKSA/IHdvcmtQYXRoLndpZHRoICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGgud2lkdGgsICh3b3JrUGF0aC5zdHJva2VzLmxlbmd0aCA+IDApID8gd29ya1BhdGguaGVpZ2h0ICsgd29ya1BhdGguc3Ryb2tlV2VpZ2h0IDogd29ya1BhdGguaGVpZ2h0KTtcbiAgICBncm91cC54ID0gd29ya1BhdGgueDtcbiAgICBncm91cC55ID0gd29ya1BhdGgueTtcbiAgICBjb25zdCBmaWxscyA9IGNsb25lKHdvcmtQYXRoLmZpbGxzKTtcbiAgICBmaWxsc1swXSA9IG5ld1BhaW50O1xuICAgIHJlY3QuZmlsbHMgPSBmaWxscztcbn1cbmZ1bmN0aW9uIHJvdW5kUGF0aHMoc2VsZWN0aW9uKSB7XG4gICAgLy9maXJzdCwgZmxhdHRlbiBzZWxlY3Rpb24oYXJyYXkgb2Ygb2JqZWN0cykgdG8gc2luZ2xlIHBhdGggb2JqZWN0XG4gICAgLy9sZXQgZmxhdFNlbGVjdGlvbiA9IGZpZ21hLmZsYXR0ZW4oT2JqZWN0LnZhbHVlcyhzZWxlY3Rpb24pKVxuICAgIC8vZ2V0IGFsbCBmbGF0IHNlbGVjdGlvbiB2ZWN0b3IgcGF0aHMgc3RydWN0dXJlXG4gICAgLy9sZXQgdmVjdG9yUGF0aHMgPSBmbGF0U2VsZWN0aW9uLnZlY3RvclBhdGhzXG4gICAgbGV0IHZlY3RvclBhdGhzID0gc2VsZWN0aW9uLnZlY3RvclBhdGhzO1xuICAgIC8vY2xvbmUgdmVjdG9yIHBhdGhzIHN0cnVjdHVyZVxuICAgIGxldCB2ZWN0b3JQYXRoc0Nsb25lID0gY2xvbmUodmVjdG9yUGF0aHMpO1xuICAgIHZlY3RvclBhdGhzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIGxldCByb3VuZFJhdGUgPSAwO1xuICAgICAgICBsZXQgZmxvb3JSYXRlID0gMDtcbiAgICAgICAgbGV0IGNlaWxSYXRlID0gMDtcbiAgICAgICAgZnVuY3Rpb24gcm91bmROdW1iZXIobWF0Y2gsIG9mZnNldCwgc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgcm91bmRlZE1hdGNoID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KG1hdGNoKSk7XG4gICAgICAgICAgICBsZXQgc2luZ2xlQWRqdXN0ID0gTWF0aC5hYnMocm91bmRlZE1hdGNoIC0gcGFyc2VGbG9hdChtYXRjaCkpO1xuICAgICAgICAgICAgcm91bmRSYXRlICs9IHNpbmdsZUFkanVzdDtcbiAgICAgICAgICAgIHJldHVybiByb3VuZGVkTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZmxvb3JOdW1iZXIobWF0Y2gsIG9mZnNldCwgc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgZmxvb3JlZE1hdGNoID0gTWF0aC5mbG9vcihwYXJzZUZsb2F0KG1hdGNoKSk7XG4gICAgICAgICAgICBsZXQgc2luZ2xlQWRqdXN0ID0gTWF0aC5hYnMoZmxvb3JlZE1hdGNoICsgcGFyc2VGbG9hdChtYXRjaCkpO1xuICAgICAgICAgICAgZmxvb3JSYXRlICs9IHNpbmdsZUFkanVzdDtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcmVkTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY2VpbE51bWJlcihtYXRjaCwgb2Zmc2V0LCBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBjZWlsZWRNYXRjaCA9IE1hdGguY2VpbChwYXJzZUZsb2F0KG1hdGNoKSk7XG4gICAgICAgICAgICBsZXQgc2luZ2xlQWRqdXN0ID0gTWF0aC5hYnMoY2VpbGVkTWF0Y2ggKyBwYXJzZUZsb2F0KG1hdGNoKSk7XG4gICAgICAgICAgICBjZWlsUmF0ZSArPSBzaW5nbGVBZGp1c3Q7XG4gICAgICAgICAgICByZXR1cm4gY2VpbGVkTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvdW5kZWREYXRhID0gdmVjdG9yUGF0aHNDbG9uZVtpbmRleF0uZGF0YS5yZXBsYWNlKC9cXGQrXFwuXFxkKy9nLCByb3VuZE51bWJlcik7XG4gICAgICAgIGxldCBmbG9vcmVkRGF0YSA9IHZlY3RvclBhdGhzQ2xvbmVbaW5kZXhdLmRhdGEucmVwbGFjZSgvXFxkK1xcLlxcZCsvZywgZmxvb3JOdW1iZXIpO1xuICAgICAgICBsZXQgY2VpbGVkRGF0YSA9IHZlY3RvclBhdGhzQ2xvbmVbaW5kZXhdLmRhdGEucmVwbGFjZSgvXFxkK1xcLlxcZCsvZywgY2VpbE51bWJlcik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdyb3VuZGluZyB4IGZsb29yaW5nIHggY2VpbGluZzonKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyb3VuZFJhdGUpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGZsb29yUmF0ZSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coY2VpbFJhdGUpXG4gICAgICAgIHZlY3RvclBhdGhzQ2xvbmVbaW5kZXhdLmRhdGEgPSByb3VuZGVkRGF0YTtcbiAgICAgICAgLy8gaWYgKGZsb29yUmF0ZSA8IGNlaWxSYXRlKSB7XG4gICAgICAgIC8vICAgdmVjdG9yUGF0aHNDbG9uZVtpbmRleF0uZGF0YSA9IGZsb29yZWREYXRhXG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgdmVjdG9yUGF0aHNDbG9uZVtpbmRleF0uZGF0YSA9IGNlaWxlZERhdGFcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB1cGRhdGUgZmxhdCBzZWxlY3Rpb24gdmVjdG9yIHBhdGhzIHRvIHRoZSByb3VuZGVkIG9uZXNcbiAgICAgICAgc2VsZWN0aW9uLnZlY3RvclBhdGhzID0gdmVjdG9yUGF0aHNDbG9uZTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3Rpb24udmVjdG9yUGF0aHMpO1xuICAgIHJldHVybiBzZWxlY3Rpb247XG59XG4iXSwic291cmNlUm9vdCI6IiJ9