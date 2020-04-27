init(figma.currentPage.selection)

async function init(selectionArray) {

  if (selectionArray.length == 1) {

    let selectionType = selectionArray[0].type

    //if(selectionType == 'RECTANGLE' || selectionType == 'LINE' || selectionType == 'ELLIPSE' || selectionType == 'POLYGON' || selectionType == 'STAR' || selectionType == 'VECTOR' || selectionType == 'TEXT' || selectionType == 'BOOLEAN_OPERATION' ) {}

    if( selectionType == 'VECTOR' ) {

      let fills = selectionArray[0].fills
      let strokes = selectionArray[0].strokes
      let upperFill = fills[fills.length - 1]
      let upperStroke = strokes[strokes.length - 1]
      let hasVisibleFill: boolean
      let hasVisibleCenteredStroke: boolean

      if (fills.length > 0) {
        hasVisibleFill = (upperFill.type === 'SOLID' && upperFill.opacity == 1 && upperFill.visible == true) ? true : false
      } else {
        hasVisibleFill = false
      }

      if (strokes.length > 0) {
        hasVisibleCenteredStroke = (selectionArray[0].strokeAlign !== 'OUTSIDE' && upperStroke.type === 'SOLID' && upperStroke.opacity == 1 && upperStroke.visible == true) ? true : false
      } else {
        hasVisibleCenteredStroke = false
      }

      if (hasVisibleFill == true|| hasVisibleCenteredStroke == true) {
        figma.showUI(__html__, { visible: true })
        figma.ui.postMessage('initialize')

        await new Promise(
          function(resolve, reject) {
            figma.ui.onmessage = function(value) {
              resolve(handleMessage(selectionArray, value)),
              reject(console.log("Failed to rasterize selection"))
            }
          }
        )

      } else {
        alert("Path's last stroke or fill must solid and visible")
        figma.closePlugin()
      }

    } else {
      alert('Selection must be a path')
      figma.closePlugin()
    }

  } else if (selectionArray.length == 0) {
    alert('Please select at least one path')
    figma.closePlugin()
  } else {
    alert('Please select a single path only')
    figma.closePlugin()
  }
}

async function handleMessage(originalPath, message) {

  let workPath = originalPath;

  if (message.type === 'CLOSE') {

    figma.closePlugin()

  } else if (message.type === 'RASTERIZE') {

    if( message.flatten == true ) {
      workPath = figma.flatten(workPath)
    } else {
      workPath = workPath[0]
    }

    if( message.roundSize == true ) {
      workPath.resize(Math.round(workPath.width), Math.round(workPath.height))
    }

    let vectorPaths = {}
    workPath.vectorPaths.forEach(function(item: Object, index: number) {
      vectorPaths[index] = item
    })

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
    }

    figma.ui.postMessage(data)

  } else if ((message.type === 'REPLACE')) {

    console.log(message)

    replacePath(workPath[0], message.bitmapData)

    figma.closePlugin()

  }

}

function replacePath(workPath, bitmapData) {

  console.log('replace path!')

  let bitmapArray = Uint8Array.from(Object.values(bitmapData))
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
