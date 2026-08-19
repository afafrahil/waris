//Global variables that define the user's browser environment

var _UserAgent = navigator.userAgent.toLowerCase();
var _BrowserVersion = parseInt(navigator.appVersion);
var isNetscape = navigator.appName.indexOf("Netscape") != -1;
var isOpera = _UserAgent.indexOf("opera") != -1;
var isIE = (navigator.appName.indexOf("Microsoft")) != -1 && (isOpera==false);
var isChrome = _UserAgent.indexOf("chrome") != -1;
var isEdge = isChrome && navigator.appName.indexOf("edg") != -1;
var isModern = document.getElementById? true : false;
var isWindows = _UserAgent.indexOf("win") != -1;
var isMacOS = _UserAgent.indexOf("mac") != -1;
var isUnix = _UserAgent.indexOf("X11") != -1;
var isMobile = _UserAgent.toUpperCase().indexOf("MOBILE") != -1;
var isAndroid = _UserAgent.indexOf("android") != -1;
var isLocal = (location.protocol==="file:")? true : false;
var _JavascriptVersion = 1.0;
if (typeof Array != "undefined") _JavascriptVersion = 1.1;
if (typeof RegExp != "undefined") _JavascriptVersion = 1.2;
if (typeof Infinity != "undefined") _JavascriptVersion = 1.3;
if (typeof Error != "undefined") _JavascriptVersion = 1.5;

function getBrowserInfo()
{
	return "Browser: " + (isModern? "Modern Browser" : (isIE? "Internet Explorer" : "Other than Internet Explorer")) +
		" Version " + _BrowserVersion;
}

function getOSInfo()
{
	return "Operating system: " + (isMacOS? "MacOS" : (isUnix? "Unix" : "Windows"));
}

function getJavascriptVersionInfo()
{
	return "JavaScript version: " + _JavascriptVersion;
}
