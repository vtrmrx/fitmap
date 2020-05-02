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

    if(selection.type == 'RECTANGLE' || selection.type == 'ELLIPSE' || selection.type == 'VECTOR' || selection.type == 'BOOLEAN_OPERATION' ) {

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
      alert("Selection must be a path")
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
    replacePath(path, message.bitmapData)
    if (path != workPath) {
      console.log('remove duplicate:')
      console.log(workPath)
      workPath.remove()
    }
    figma.closePlugin()
  }

  if (message.type === 'RASTERIZE') {

    let flattenedPath = workPath.clone()
    flattenedPath = figma.flatten([flattenedPath])

    workPath = flattenedPath

    if( message.roundSize == true ) {
      path.resize(Math.round(workPath.width), Math.round(workPath.height))
      workPath.resize(Math.round(workPath.width), Math.round(workPath.height))
    }

    let vectorPaths = {}
    workPath.vectorPaths.forEach(function(item: Object, index: number) {
      vectorPaths[index] = item
    })

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
    }

    figma.ui.postMessage(data)

  }

}

function replacePath(workPath, bitmapData) {

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

  let group = figma.group([workPath, rect], workPath.parent)
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
