// Developed by Charles Powell, Copyright 2020
// https://github.com/cbpowell


// Configuration
// Allowable range options:
// HOUR, DAY, WEEK, MONTH, YEAR
let range
if (args.widgetParameter) {
  // Do not edit this line
  range = String(args.widgetParameter).trim()
} else {
  // If you wish to hardcode the range, change this value
  range = "HOUR"
}
const darkMode = true


// Debugging Options
const debug = false
const loginDebug = false || debug
const graphicsDebug = false || debug
if (loginDebug) { logWarning("Login Debugging ON") }
if (graphicsDebug) { logWarning("Graphics Debugging ON") }

// Colors
let senseOrange
let fillColor
let bgGradient
let YtickLineColor
let labelTextColor
let headerLabelColor

if (darkMode) {
  senseOrange = new Color("F8461C")
  fillColor = new Color("A8482F", 0.6)
  // Background gradient
  bgGradient = new LinearGradient()
  bgGradient.locations = [0, 0.8]
  bgGradient.colors = [
    new Color("202020"),
    new Color("353535")
  ]
  YtickLineColor = new Color("635353", 0.3)
  labelTextColor = new Color("FFFFFF", 0.5)
  headerLabelColor = Color.white()
} else {
  // Light Mode
  senseOrange = new Color("F8461C")
  fillColor = new Color("FB8C82", 0.6)
  // Background gradient
  bgGradient = new LinearGradient()
  bgGradient.locations = [0, 0.8]
  bgGradient.colors = [
    new Color("FFFFFF"),
    new Color("FFFFFF")
  ]
  YtickLineColor = new Color("635353", 0.2)
  labelTextColor = new Color("635353", 0.5)
  headerLabelColor = new Color("101010", 1.0)
}

// Left "inset" to move left edge of plot outside of widget window
const leftInset = 10 // unit of points

// Use only % of provided canvas height for plotting
let maxCtxHeight = 1.0
let minCtxHeight = 0.0

// Other
const authKey = "SenseAuth"
const baseurl = "https://api.sense.com/apiservice/api/v1"
const validRanges = ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']
const timeIntervals = {
    SECOND: 'SECOND',
    MINUTE: 'MINUTE',
    HOUR: 'HOUR',
    DAY: 'DAY'
}
let scriptURL = "scriptable:///open/" + encodeURI(Script.name())

// Line plot class
class LineChart {
  // Adapted LineChart by https://kevinkub.de/
  // From https://gist.github.com/kevinkub/b74f9c16f050576ae760a7730c19b8e2 on 2020-11-14

  constructor(width, height, values, ymin = NaN, ymax = NaN, xInset = 0.0) {
    this.ctx = new DrawContext()
    this.ctx.size = new Size(width, height)
    this.values = values
    this.ymin = ymin
    this.ymax = ymax
    this.xInset = xInset
  }
  
  _calculatePath() {
    let maxValue
    if(isNaN(this.ymax)) {
      maxValue = Math.max(...this.values)
    } else {
      maxValue = this.ymax
    }
    let minValue
    if(isNaN(this.ymax)) {
      minValue = Math.min(...this.values)
    } else {
      minValue = this.ymin
    }
    let difference = maxValue - minValue
    let count = this.values.length
    let step = (this.ctx.size.width - this.xInset) / (count - 1)
    let points = this.values.map((current, index, all) => {
        let x = step*index
        let y = this.ctx.size.height * (1 - minCtxHeight) - (current - minValue) / difference * this.ctx.size.height * maxCtxHeight
        return new Point(x, y)
    })
    return this._getSmoothPath(points)
  }
      
  _getSmoothPath(points) {
    let path = new Path()
    let openPath = new Path()
    path.move(new Point(0, this.ctx.size.height))
    openPath.move(new Point(0, this.ctx.size.height))
    path.addLine(points[0])
    openPath.addLine(points[0])
    for(let i = 0; i < points.length-1; i++) {
      let xAvg = (points[i].x + points[i+1].x) / 2
      let yAvg = (points[i].y + points[i+1].y) / 2
      let avg = new Point(xAvg, yAvg)
      let cp1 = new Point((xAvg + points[i].x) / 2, points[i].y)
      let next = new Point(points[i+1].x, points[i+1].y)
      let cp2 = new Point((xAvg + points[i+1].x) / 2, points[i+1].y)
      path.addQuadCurve(avg, cp1)
      openPath.addQuadCurve(avg, cp1)
      path.addQuadCurve(next, cp2)
      openPath.addQuadCurve(next, cp2)
    }
    path.addLine(new Point(this.ctx.size.width - this.xInset, this.ctx.size.height))
    // Do not add 0 value point on openPath for Sense plot, or close openPath (obviously)
    path.closeSubpath()
    return [path, openPath]
  }
  
  configure(fn) {
    let paths = this._calculatePath()
    if(fn) {
      fn(this.ctx, paths[0], paths[1])
    } else {
      this.ctx.addPath(paths[0])
      this.ctx.fillPath(paths[0])
    }
    return this.ctx
  }
}

// Create widget content
let widget
let auth
try {
  // Authenticate if required
  auth = await retrieveAuth()
  // Plot if auth was successful
  try {
    // Retrieve and plot data
    let plotData = await retrieveData(auth, range)
    // Create plot widget
    widget = await createWidget(plotData)
  } catch(err) {
    // Caught error during plot, show error widget
    widget = await createErrorWidget("No plot data retrieved. Recommend running from app, some debugging may be required.\n\nError: " + err.message, scriptURL)
  }
} catch(err) {
  widget = await createErrorWidget("Unable to authenticate with Sense: " + err.message, scriptURL)
}

// Present widget
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium()
}
Script.complete()

async function createErrorWidget(errorMessage, errorURL) {
  let widget = new ListWidget()
  widget.url = errorURL
  let header = widget.addText("Error!")
  widget.addSpacer(20)
  let message = widget.addText(errorMessage || "None")
  
  // Styling
  widget.backgroundColor = Color.black()
  header.textColor = Color.red()
  header.font = Font.heavySystemFont(20)
  message.textColor = Color.white()
  message.font = Font.mediumSystemFont(12)
  
  return widget
}

async function createWidget(plotData) {
  let appIcon = await loadAppIcon()
  let title = "Sense Usage, Past " + capitalizeFirstLetter(range)
  let widget = new ListWidget()
  
  // Background
  if(graphicsDebug) {
    widget.backgroundColor = Color.blue()
  } else {
    widget.backgroundGradient = bgGradient
  }
  
  // Set padding to shift out of widget window
  // Unfortunately a negative trailing padding doesn't (currently?) also extend beyond right edge too, so no way to draw all the way to right edge
  widget.setPadding(10, -leftInset, 0, 0)
  
  // Show app icon and title
  let titleStack = widget.addStack()
  titleStack.addSpacer(leftInset + 4)
  let appIconElement = titleStack.addImage(appIcon)
  appIconElement.imageSize = new Size(12, 12)
  appIconElement.cornerRadius = 4
  titleStack.addSpacer(4)
  let titleElement = titleStack.addText(title)
  titleElement.textColor = headerLabelColor
  titleElement.textOpacity = 0.7
  titleElement.font = Font.mediumSystemFont(10)
  widget.addSpacer(10)
  
  // Show plot
  let usage = plotData.usage
  
  // Horizontal stack for axis labels and plot
  let plotHstack = widget.addStack()

  let labelFont = Font.mediumSystemFont(16)
  
  // Plot settings
  let minValue = 0.0
  let maxValue = Math.ceil(Math.max(...usage)/100)*100
  let xInset = 25
  let drawingScale = 2 // for development device, the screen scale is 3x, but using that here resulted in unexpected positioning. YMMV.
  
  let chart = new LineChart(620 + leftInset, 240, plotData.usage, minValue, maxValue, xInset).configure((ctx, path, openPath) => {
    // Setup
    ctx.respectScreenScale = true
    ctx.opaque = false
    
    // Add grey horizontal Y axis markers
    let midLine = new Path()
    let midPoint = new Point(0.0, ctx.size.height * ((maxCtxHeight - minCtxHeight)/2 + minCtxHeight))
    midLine.move(midPoint)
    midLine.addLine(new Point(ctx.size.width, midPoint.y))
    let maxLine = new Path()
    let maxPoint = new Point(0, ctx.size.height * (1.0 - maxCtxHeight))
    maxLine.move(maxPoint)
    maxLine.addLine(new Point(ctx.size.width, maxPoint.y))
    ctx.setStrokeColor(YtickLineColor)
    ctx.addPath(midLine)
    ctx.strokePath()
    ctx.addPath(maxLine)
    ctx.strokePath()
    
    // Add main data
    ctx.setStrokeColor(new Color(senseOrange.hex, 0.1))
    ctx.strokePath()
    ctx.setFillColor(fillColor)
    ctx.setStrokeColor(senseOrange)
    ctx.setLineWidth(2)
    ctx.addPath(path)
    ctx.fillPath(path)
    ctx.addPath(openPath)
    ctx.strokePath()
    ctx.setFont(labelFont)
    ctx.setTextColor(labelTextColor)
    
    // Add Y label
    let labelMaxPoint = new Point((leftInset + 4) * drawingScale, 3)
    ctx.drawText(maxValue.toString() + "w", labelMaxPoint)
    // Add orange vertical ticker
    let vertTicker = new Path()
    vertTicker.move(new Point(ctx.size.width - xInset, ctx.size.height))
    vertTicker.addLine(new Point(ctx.size.width - xInset, 0))
    ctx.addPath(vertTicker)
    ctx.setStrokeColor(new Color(senseOrange.hex, 0.1))
    ctx.strokePath()
    
    if(graphicsDebug) {
      // Debug overlay
      let boundingRect = new Rect(0, 0, ctx.size.width, ctx.size.height)
      let boundingPath = new Path()
      boundingPath.addRect(boundingRect)
      ctx.setStrokeColor(Color.red())
      ctx.addPath(boundingPath)
      ctx.strokePath()
    }
  }).getImage()
  
  plotHstack.setPadding(0, 0, 0, 0)
  let image = plotHstack.addImage(chart)
 

  /*
  Not currently used, widget link to Sense provided via widget instead.
  
  
  // UI presented in Siri and Shortcuts is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8)
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward")
    let footerStack = widget.addStack()
    let linkStack = footerStack.addStack()
    linkStack.setPadding(0, 10, 0, 10)
    linkStack.centerAlignContent()
    linkStack.url = "sense://"
    let linkElement = linkStack.addText("Open Sense")
    linkElement.font = Font.mediumSystemFont(10)
    linkElement.textColor = senseOrange
    linkStack.addSpacer(3)
    let linkSymbolElement = linkStack.addImage(linkSymbol.image)
    linkSymbolElement.imageSize = new Size(11, 11)
    linkSymbolElement.tintColor = senseOrange
  }
  */
  
  return widget
}

async function retrieveAuth() {
  // Clear Keychain data if login info has been previously provided in older script versions
  if (Keychain.contains("SenseAuthUser")) {
    Keychain.remove("SenseAuthUser")
  }
  if (Keychain.contains("SenseAuthPass")) {
    Keychain.remove("SenseAuthPass")
  }
  
  // Try to grab a previously-stored authorization
  let authData
  if (!Keychain.contains(authKey) || loginDebug) {
    // Need to log used in and grab auth token
    if (!config.runsInApp) {
      // Need to be in app to present popup,
      // return null and error
      throw new Error("Login required, run script from app")
    }
    
    // Present login prompt
    let loginAlert = new Alert()
    loginAlert.title = "Sense Login"
    loginAlert.message = "Please log in with your Sense credentials to connect to the Sense API.\n\nYour email and password will not be saved by this script!"
    loginAlert.addTextField("Email")
    loginAlert.addSecureTextField("Password")
    loginAlert.addCancelAction("Cancel")
    loginAlert.addAction("Submit")
    let loginResponse = await loginAlert.presentAlert()
    if (loginResponse == -1) {
      // User cancelled login
      throw new Error("User cancelled login")
    }
    let userEmail = loginAlert.textFieldValue(0)
    let userPassword = loginAlert.textFieldValue(1)
    
    // Login and generate auth data
    let loginReq = new Request(baseurl + "/authenticate")
    loginReq.method = "POST"
    loginReq.headers = {"Content-Type": "application/x-www-form-urlencoded"}
    loginReq.body = "email=" + encodeURI(userEmail) + "&password=" + encodeURI(userPassword)
    authData = await loginReq.loadJSON()
	if (authData.status == "error") {
      // Login error!
      logError("Login error: " + authData.error_reason)
      let errorAlert = new Alert()
      errorAlert.title = "Sense Login Error"
      errorAlert.message = "Authentication with Sense API failed. \n\n API pError: " + authData.error_reason
      await errorAlert.presentAlert()
      
      return null
    } else {
      log("Login success, storing auth data")
      Keychain.set(authKey, JSON.stringify(authData))
    }
  } else {
    // get from Keychain
    let authString = Keychain.get(authKey)
    authData = JSON.parse(authString)
  }
  
  // Get auth userID and token
  let authUserID = authData.user_id
  let authToken = authData.access_token
  let monitorID = authData.monitors[0].id
  
  let authDict = {
    "userID": authUserID,
    "token": authToken,
    "monitorID": monitorID
  }
  
  return authDict
}

async function retrieveData(auth, range) {
  // Check scale
  if (!validRanges.includes(range)) {
    throw new Error("Invalid scale used: " + range)
  }
  var timeAgoMs = 0
  var frames = 0
  var granularity = ""
  var granularityDesc = ""
  switch(range) {
    case "HOUR":
      // One hour ago, seconds scale
      // However, request prior 75 minutes to account for "unpopulated" data
      timeAgoMs = 60*75*1000
      frames = 60*75
      granularity = timeIntervals.SECOND
      break
    case "DAY":
      // One day ago, minutes scale
      timeAgoMs = 60*60*24*1000
      frames = 60*24
      granularity = timeIntervals.MINUTE
      break
    case "WEEK":
      // One week ago, minutes scale
      timeAgoMs = 60*60*24*7*1000
      frames = 60*24*7
      granularity = timeIntervals.MINUTE
      break
    case "MONTH":
      // One month ago, hours scale
      timeAgoMs = 60*60*24*31*1000
      frames = 24*31
      granularity = timeIntervals.HOUR
      break
    case "YEAR":
      // One year ago, days scale
      timeAgoMs = 60*60*24*365*1000
      frames = 365
      granularity = timeIntervals.DAY
      break
  }
  
  // Get time for request
  let startDate = new Date(Date.now() - timeAgoMs)
  time = startDate.toISOString()
  
  // Request data
  let endpointURL = baseurl + "/app/history/usage?monitor_id=" + auth.monitorID + "&granularity=" + granularity + "&start=" + time + "&frames=" + frames
  // Build and send request
  let dataReq = new Request(endpointURL)
  let bearer =  "bearer " + auth.token
  dataReq.headers = {"Authorization": bearer}
  let dataRes = await dataReq.loadJSON()
  if (dataReq.response.statusCode == 401) {
    if (Keychain.contains(authKey)) {
      Keychain.remove(authKey)
    }
    throw new Error("Token rejected, clearing stored value")
  }
  
  
  // Reduce data
  let totals = dataRes.totals
  log("Retrieved " + totals.length + " data points")
  let usage = totals.map((val, ind) => {
    // Remove datapoints that are 1 or -1
    let lpt = val[0]
    let hpt = val[1]
    if (lpt > 1.0) {
      let pt = hpt //(lpt + hpt)/2
      return pt
    }
  }).filter((val) => { return val != null })
  log("Using " + usage.length + " data points")
  let plotData = {
    "startTime": dataRes.start,
    "endTime": dataRes.endOfData,
    "usage": usage
  }
  // Set Shortcut output to the cleaned up plot data
  Script.setShortcutOutput(plotData)
  return plotData
}

// Support
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

async function loadAppIcon() {
  let url = "https://is2-ssl.mzstatic.com/image/thumb/Purple114/v4/05/91/27/0591277b-b3c2-1d7c-bb64-597ecfdc3eb0/SenseIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/246x0w.png"
  let req = new Request(url)
  return req.loadImage()
}