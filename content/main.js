
/* ****************************************** work functions ************************************************ */

function toggleImages(){
  var value=2
  if(!isImagesEnabled())
    value=1
  Services.prefs.setIntPref(imagesStatePref, value);
}

function toggleJS(){
  var value=false
  if(!isJSEnabled())
    value=true
  Services.prefs.setBoolPref(jsStatePref, value);
}


/* ****************************************** ui-build functions ************************************************ */

function addWidgetListener(){
  var myWidgetListener = {
    onWidgetAdded: function(aWidgetId, aArea, aPosition) {
      if(aWidgetId != imgId && aWidgetId != jsId)
        return
      if(aArea != CustomizableUI.AREA_NAVBAR)
        return
    
      var widgetInstances = CustomizableUI.getWidget(aWidgetId).instances;
      if(widgetInstances[0]){
        var node=widgetInstances[0].node
      }
      else{
        return
      }
      
      if(aWidgetId==imgId)
        updateImagesIcon(node)
      else if(aWidgetId==jsId)
        updateJSIcon(node)
    },
    
    onWidgetBeforeDOMChange: function(aNode, aNextNode, aContainer, aWasRemoval){
      if(aNode.id != imgId && aNode.id != jsId)
        return
      if(!aWasRemoval)
        return
      
      var icon32, label
      
      if(aNode.id == imgId){
        icon32=imagesIcon32
        label=imagesButtonProps.label
      }
      else if(aNode.id == jsId){
        icon32=jsIcon32
        label=jsButtonProps.label
      }
      
      aNode.setAttribute('image', icon32)
      
      aNode.setAttribute('label', label)
      aNode.setAttribute('tooltiptext', label)
    },
    
    onWidgetDestroyed: function(aWidgetId) {
      if(aWidgetId != imgId && aWidgetId != jsId)
        return
      CustomizableUI.removeListener(myWidgetListener);
    }
  }
  CustomizableUI.addListener(myWidgetListener);
}

function addImagesButton(){
  imagesWidget=CustomizableUI.createWidget({
    id: imgId,
    defaultArea: CustomizableUI.AREA_NAVBAR,
    label: imagesButtonProps.label,
    tooltiptext: imagesButtonProps.tooltip,
    
    onCommand: function(aEvent) {
      // var aWindow = aEvent.target.ownerDocument.defaultView;
      toggleImages()
    },
    
    onCreated: function(aNode){
      updateImagesIcon(aNode)
    }
  });
}

function addJSButton(){
  jsWidget=CustomizableUI.createWidget({
    id: jsId,
    defaultArea: CustomizableUI.AREA_NAVBAR,
    label: jsButtonProps.label,
    tooltiptext: jsButtonProps.tooltip,
    
    onCommand: function(aEvent) {
      toggleJS()
    },
    
    onCreated: function(aNode){
      updateJSIcon(aNode)
    } 
  });
}

/* ****************************************** help functions ************************************************ */

function updateImagesIcon(node){
  if(!isImagesEnabled())
    state=0
  else
    state=1
  node.setAttribute('image', imagesIcons[state])
  
  var label=imagesButtonProps.label+" ["+state+"]"
  node.setAttribute('label', label)
  node.setAttribute('tooltiptext', label)
}

function updateJSIcon(node){
  if(!isJSEnabled())
    state=0
  else
    state=1
  node.setAttribute('image', jsIcons[state])
  
  var label=jsButtonProps.label+" ["+state+"]"
  node.setAttribute('label', label)
  node.setAttribute('tooltiptext', label)
}

function isImagesEnabled(){
  var curVal=Services.prefs.getIntPref(imagesStatePref);
  
  if(curVal==2)
    return false
  return true
}

function isJSEnabled(){
  var curVal=Services.prefs.getBoolPref(jsStatePref);
  return curVal
}


function updateImagesIconFromPref(window){
  if (!window) return
  var imagesButton = window.document.getElementById(imagesButtonProps.id)
  updateImagesIcon(imagesButton)
}

function updateJSIconFromPref(window){
  if (!window) return
  var jsButton = window.document.getElementById(jsButtonProps.id)
  updateJSIcon(jsButton)
}


/* ***************************************** load functions ******************************************** */

function eachWindow(callback){
  let enumerator=Services.wm.getEnumerator("navigator:browser")
  while (enumerator.hasMoreElements()){
    let win=enumerator.getNext()
    if (win.document.readyState==="complete") callback(win)
    else runOnLoad(win, callback)
  }
}

function runOnLoad (window, callback){
  window.addEventListener("load", function(){
    window.removeEventListener("load", arguments.callee, false)
    callback(window)
  }, false)
}


function loadIntoWindow(window){
  if (!window) return
  
  try{
    addWidgetListener()
    addImagesButton()
    addJSButton()
  }
  catch(e){}
}

function windowWatcher (subject, topic){
  if (topic==="domwindowopened"){
    Services.ww.unregisterNotification(windowWatcher)
    runOnLoad(subject, loadIntoWindow)
  }
}

