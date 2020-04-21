//Promise.all(figma.currentPage.selection.map(selected => rasterizeSelection(selected))).then(() => maybeClose())

init(figma.currentPage.selection, 0)

async function init(selectionArray, index) {

  let selection = filterSelection(selectionArray)

  console.log(selection.length)

  if (selection.length > 0) {

    figma.showUI(__html__, { visible: true })
    figma.ui.postMessage('initialize')

    const response = await new Promise(
      function(resolve, reject) {
        figma.ui.onmessage = function(value) {
          resolve(handleMessage(selection, value))
        }
      }
    )

  } else {
    alert('Please select at least one path')
    figma.closePlugin()
  }
}

function filterSelection(selection) {
  let selectionObject = {}
  let selectionIndex = 0
  selection.forEach(function(item, index) {
    let t = item.type
    if (t == 'BOOLEAN_OPERATION' || t == 'VECTOR' || t == 'STAR' || t == 'LINE' || t == 'ELLIPSE' || t == 'POLYGON' || t == 'RECTANGLE' || t == 'TEXT' ) {
      selectionObject[selectionIndex] = item
      selectionIndex++
      console.log("it's a lovely figure: " + t)
    } else if (t == 'FRAME' || t == 'GROUP' || t == 'INSTANCE') {
      if (item.children.length > 0) {
        let weirdStuff = false
        for (let i = 0; i < item.children.length; i++) {
          let ct = item.children[i].type
          if (
            ct != 'BOOLEAN_OPERATION' &&
            ct != 'VECTOR' &&
            ct != 'STAR' &&
            ct != 'LINE' &&
            ct != 'ELLIPSE' &&
            ct != 'POLYGON' &&
            ct != 'RECTANGLE' &&
            ct != 'TEXT'
          ) {
            weirdStuff = true
            console.log("contains weird stuff")
            break
          }
        }
        if(weirdStuff == false) {
          selectionObject[selectionIndex] = item
          selectionIndex++
          console.log("contains only clean stuff")
        }
      }
    } else if (t == 'COMPONENT') {
      console.log("it's a component. Leave it alone.")
    } else if (t == 'DOCUMENT' || t == 'PAGE' || t == 'SLICE') {
      console.log("it's some ugly thing: " + t)
    }
  });
  let filteredArray = Object.values(selectionObject)
  return filteredArray
}

async function handleMessage(originalPath, message) {

  let workPath = originalPath;

  if (message == 'close') {

    figma.closePlugin()

  } else if (message == 'rasterize') {

    workPath = figma.flatten(workPath)
    workPath.resize(Math.round(workPath.width), Math.round(workPath.height))
    //considering compound paths, create array with all paths
    let vectorPaths = {}
    workPath.vectorPaths.forEach(function(item, index) {
      vectorPaths[index] = item
    });

    console.log(workPath)

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
    }

    console.log(data)

    figma.ui.postMessage(data)

    const pathBitmap = await new Promise(
      function(resolve, reject) {
        figma.ui.onmessage = function(value) {
          resolve(replacePath(workPath, value))
        }
      }
    )

    figma.closePlugin()

  }

}

function clone(val) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}

function replacePath(workPath, bitmapData) {

  console.log('replace path!')

  let bitmapArray = Uint8Array.from(Object.values(bitmapData));
  let figmaImage = figma.createImage(bitmapArray)
  let imageHash = figmaImage.hash
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
    imageTransform: [[1, 0, 0],[0, 1, 0]],
    opacity: 1,
    scaleMode: "CROP",
    scalingFactor: 1,
    type: "IMAGE",
    visible: true
  }

  console.log(workPath)

  let parent = workPath.parent
  let rect = figma.createRectangle()

  let group = figma.group([workPath, rect], parent)
  group.name = workPath.name

  workPath.x = Math.round(workPath.x)
  workPath.y = Math.round(workPath.y)

  rect.x = (workPath.strokes.length > 0) ? workPath.x - workPath.strokeWeight / 2 : workPath.x
  rect.y = (workPath.strokes.length > 0) ? workPath.y - workPath.strokeWeight / 2 : workPath.y
  rect.name = 'Bitmap'
  rect.fills = workPath.fills

  workPath.name = 'Vector'
  workPath.locked = true
  workPath.visible = false

  rect.resize(
    (workPath.strokes.length > 0) ? workPath.width + workPath.strokeWeight : workPath.width,
    (workPath.strokes.length > 0) ? workPath.height + workPath.strokeWeight : workPath.height
  )

  group.x = workPath.x
  group.y = workPath.y

  const fills = clone(workPath.fills)
  fills[0] = newPaint
  rect.fills = fills
}

function roundPaths(selection) {

  //first, flatten selection(array of objects) to single path object
  //let flatSelection = figma.flatten(Object.values(selection))

  //get all flat selection vector paths structure
  //let vectorPaths = flatSelection.vectorPaths

  let vectorPaths = selection.vectorPaths

  //clone vector paths structure
  let vectorPathsClone = clone(vectorPaths)

  vectorPaths.forEach(function(item, index) {
    let roundRate = 0
    let floorRate = 0
    let ceilRate = 0

    function roundNumber(match, offset, string) {
      let roundedMatch = Math.round(parseFloat(match))
      let singleAdjust = Math.abs(roundedMatch - parseFloat(match))
      roundRate += singleAdjust
      return roundedMatch
    }

    function floorNumber(match, offset, string) {
      let flooredMatch = Math.floor(parseFloat(match))
      let singleAdjust = Math.abs(flooredMatch + parseFloat(match))
      floorRate += singleAdjust
      return flooredMatch
    }

    function ceilNumber(match, offset, string) {
      let ceiledMatch = Math.ceil(parseFloat(match))
      let singleAdjust = Math.abs(ceiledMatch + parseFloat(match))
      ceilRate += singleAdjust
      return ceiledMatch
    }

    let roundedData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, roundNumber)
    let flooredData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, floorNumber)
    let ceiledData = vectorPathsClone[index].data.replace(/\d+\.\d+/g, ceilNumber)

    // console.log('rounding x flooring x ceiling:')
    // console.log(roundRate)
    // console.log(floorRate)
    // console.log(ceilRate)

    vectorPathsClone[index].data = roundedData

    // if (floorRate < ceilRate) {
    //   vectorPathsClone[index].data = flooredData
    // } else {
    //   vectorPathsClone[index].data = ceiledData
    // }

    // update flat selection vector paths to the rounded ones
    selection.vectorPaths = vectorPathsClone

  })
  console.log(selection.vectorPaths)
  return selection
}
