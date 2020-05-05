init(figma.currentPage.selection)

async function init(selectionArray) {

  if (selectionArray.length == 1) {

    let selection = selectionArray[0],
        fills = selection.fills,
        strokes = selection.strokes,
        upperFill = fills[fills.length - 1],
        upperStroke = strokes[strokes.length - 1],
        hasVisibleFill = false,
        hasVisibleCenteredStroke = false

    if(selection.type == 'RECTANGLE' || selection.type == 'ELLIPSE' || selection.type == 'VECTOR' || selection.type == 'BOOLEAN_OPERATION'  || selection.type == 'POLYGON' || selection.type == 'STAR' || selection.type == 'LINE' || selection.type == 'TEXT') {

      if (fills.length > 0) {
        hasVisibleFill = (upperFill.type === 'SOLID' && upperFill.opacity == 1 && upperFill.visible == true) ? true : false
      }

      if (strokes.length > 0) {
        hasVisibleCenteredStroke = (selectionArray[0].strokeAlign !== 'OUTSIDE' && upperStroke.type === 'SOLID' && upperStroke.opacity == 1 && upperStroke.visible == true) ? true : false
      }

      if (hasVisibleFill == true || hasVisibleCenteredStroke == true) {
        figma.showUI(__html__, { visible: true })
        figma.ui.postMessage({ type: 'INIT' })

        let currentPath = selection

        await new Promise(
          function(resolve, reject) {
            figma.ui.onmessage = function(value) {
              resolve(handleMessage(currentPath, value))
            }
          }
        )

      } else {
        alert("Path's last stroke or fill must solid and visible")
        figma.closePlugin()
      }

    } else {
      alert("Selection must be a simple path")
      figma.closePlugin()
    }

  } else if (selectionArray.length == 0) {
    alert("Please select at least one path")
    figma.closePlugin()
  } else {
    alert("Please select a single path only")
    figma.closePlugin()
  }
}

async function handleMessage( path, message ) {

  let workPath = path

  if (message.type === 'CLOSE') {
    figma.closePlugin()
  }

  if ((message.type === 'REPLACE')) {
    workPath = figma.getNodeById(message.workPath.id)
    workPath.name = 'workPath'
    replacePath(path, workPath, message.bitmapData, message.roundPosition)
    workPath.remove()
    //figma.closePlugin()
  }

  if (message.type === 'RASTERIZE') {

    let flattenedPath = workPath.clone()
    flattenedPath = figma.flatten([flattenedPath])

    workPath = flattenedPath

    if( message.roundSize == true ) {
      console.log("round sizes")
      path.resize(Math.round(path.width), Math.round(path.height))
      workPath.resize(Math.round(workPath.width), Math.round(workPath.height))
    }

    if( message.roundPosition == true ) {
      console.log("round positions")
      path.x = Math.round(path.x)
      path.y = Math.round(path.y)
    }
    workPath.resize(Math.round(workPath.width), Math.round(workPath.height))
    workPath.x = Math.round(workPath.x)
    workPath.y = Math.round(workPath.y)

    let vectorPaths = {}
    workPath.vectorPaths.forEach(function(item: Object, index: number) {
      vectorPaths[index] = item
    })

    console.log(workPath.strokeCap)

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
    }

    figma.ui.postMessage(data)

  }

}

function replacePath(originalPath, workPath, bitmapData, roundPosition) {

  let bitmapArray = Uint8Array.from(Object.values(bitmapData))
  let figmaImage = figma.createImage(bitmapArray)
  let imageHash = figmaImage.hash

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
    imageTransform: [[1, 0, 0],[0, 1, 0]],
    opacity: 1,
    scaleMode: 'CROP',
    scalingFactor: 1,
    type: 'IMAGE',
    visible: true
  }

  let rect = figma.createRectangle()

  let group = figma.group([originalPath, rect], originalPath.parent)
  group.name = originalPath.name

  if (roundPosition == true) {
    originalPath.x = Math.round(originalPath.x)
    originalPath.y = Math.round(originalPath.y)
  }

  rect.x = (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? (workPath.x - workPath.strokeWeight / 2) : workPath.x
  rect.y = (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.y - workPath.strokeWeight / 2 : workPath.y
  rect.name = 'Bitmap'
  rect.fills = workPath.fills

  originalPath.name = 'Vector'
  originalPath.locked = true
  originalPath.visible = false

  rect.resize(
    (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.width + workPath.strokeWeight : workPath.width,
    (workPath.strokes.length > 0 && workPath.strokeAlign == 'CENTER') ? workPath.height + workPath.strokeWeight : workPath.height
  )

  //group.x = originalPath.x
  //group.y = originalPath.y

  const fills = clone(workPath.fills)
  fills[0] = newPaint
  rect.fills = fills
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
