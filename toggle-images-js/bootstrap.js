
const {classes: Cc, interfaces: Ci, utils: Cu}=Components

Cu.import("resource://gre/modules/Services.jsm")
Cu.import("resource:///modules/CustomizableUI.jsm");

/* ******************************************* vars *********************************************** */

const prefsPrefix="extensions.toggle_images_js_qwe."
const chromeRoot="toggle-images-js"
const addonBase="chrome://"+chromeRoot
const imagesPath=addonBase+"/skin/images/"

const imagesStatePref = "permissions.default.image"
const jsStatePref = "javascript.enabled"

const imagesButtonProps={
  id:"toggle-images-button",
  label:"Toggle Images",
  tooltip:"Toggle Images"
}

const jsButtonProps={
  id:"toggle-js-button",
  label:"Toggle JS",
  tooltip:"Toggle JS"
}

var self=this,prefs={}
const prefNames=["firstRun","addBranch","installReason","uninstallReason","startupReason","shutdownReason",
                 "buttonPos","currentSet","currentSetAfter","savedCurrentSet",
                 "imagesButtonState", "jsButtonState"]
for(var p of prefNames) prefs[p]=prefsPrefix+p

const reasons=["","APP_STARTUP","APP_SHUTDOWN","ADDON_ENABLE","ADDON_DISABLE","ADDON_INSTALL","ADDON_UNINSTALL","ADDON_UPGRADE","ADDON_DOWNGRADE"]
const styleSheets=[addonBase+"/skin/style.css"]

const imagesIcons=[
  imagesPath+"images16-disabled.png",
  imagesPath+"images16-enabled.png",
]
const jsIcons=[
  imagesPath+"js16-disabled.png",
  imagesPath+"js16-enabled.png",
]
const imagesIcon32=imagesPath+"images32.png"
const jsIcon32=imagesPath+"js32.png"

var imagesWidget, jsWidget
var imgId=imagesButtonProps.id, jsId=jsButtonProps.id


/* ***************************************** main functions ************************************************* */

function install(data,reason){
}
 
function startup(data,reason){
  include(data, "content/main.js")
  
  addWidgetListener()
  addImagesButton()
  addJSButton()
  
  // Services.ww.registerNotification(windowWatcher)
  
  Services.prefs.addObserver(imagesStatePref, imagesPrefObserver, false)
  Services.prefs.addObserver(jsStatePref, jsPrefObserver, false)
}

function shutdown(data,reason){
  CustomizableUI.destroyWidget(imagesButtonProps.id);
  CustomizableUI.destroyWidget(jsButtonProps.id);
  
  // if(reason==ADDON_DISABLE){
  //   Services.ww.unregisterNotification(windowWatcher)
  // }
}


/* ****************************************** add functions ************************************************ */

function include(data, path){                          //load scripts
  Services.scriptloader.loadSubScript(data.resourceURI.spec + path, self)
}

function pref(name,value){                            //get/set prefs
  if(value===undefined){
    switch(Services.prefs.getPrefType(name)){
      case 0:return null
      case 32:return Services.prefs.getCharPref(name)
      case 64:return Services.prefs.getIntPref(name)
      case 128:return Services.prefs.getBoolPref(name)
    }
  }
  if(value==="") Services.prefs.clearUserPref(name)
  else{
    switch(typeof value){
      case "boolean":Services.prefs.setBoolPref(name,value);return
      case "number":Services.prefs.setIntPref(name,value);return
      default:Services.prefs.setCharPref(name,value)
    }
  }
}

var imagesPrefObserver={
  observe: function(aSubject, aTopic, aData){
    eachWindow(updateImagesIconFromPref)
  }
}

var jsPrefObserver={
  observe: function(aSubject, aTopic, aData){
    eachWindow(updateJSIconFromPref)
  }
}
