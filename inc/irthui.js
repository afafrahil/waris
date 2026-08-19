//Original GUI. Load irth.js before it
var debugText = "";
var testCase = -1;
var resultsWindow;

/**
 *	Places a value in a GUI element
 *	@param	elem: a GUI element
 *	@param	val: value to place in elem
 */
function put(elem, val)
{
	//console.log("put(" + elem + "," + val + ")\n");
	if (isModern)
	{
		document.getElementById(elem).innerHTML = val;
	}
	else if (isIE)
	{
		document.all[elem].innerText = val;
	}
}

/**
 *	Populates the UI with values passed on the query string
 *	Format of the query string: 
 *		?hc=<comma separated counts of heirs>&sc=<0..9>&rv=<0|1|2>&aw=<0|1>&bq=<rational fraction>
 *		e.g., ?hc=0,2,3,1,1,1&sc=3&rv=2&aw=1&bq=1/3
 *		Note that it isn't necessary to enter subsequent heirs whose count is zero
 */
function populateFromQueryString() {
	var args = getArgs();
	if (!args) return;
	var hc = args["hc"];
	if (!hc) return;
	var harray = [0];	//handle bequest later
	var hca = hc.split(',');
	for (var i=1; i<hca.length; i++)
		harray.push(hca[i]*1);	//concat
	var len = harray.length;
	for (var i=len; i<=servant; i++)
		harray.push(0);		//fill the rest

	var allowr = true, allowrs = false;
	if (args["rv"]) {
		allowrs = ((args["rv"]-0)==2);
		allowr = ((args["rv"]-0)==1) || ((args["rv"]-0)==2)
	}
	harray.push(allowr);
	
	var sc = Hanafi;
	if (args["sc"] && (args["sc"]-0)>=0 && (args["sc"]-0)<=numschools) sc = args["sc"]-0;
	harray.push(sc);

	var allowaw = true;
	if (args["aw"]) {
		allowaw = ((args["aw"]-0)!=0);
	}
	harray.push(allowaw);
	
	//Now handle bequest
	var bq = none, bqstr = "";
	if (args["bq"]) {
		bqstr = args["bq"];
		bq = toRational(bqstr);
		if (isGt(bq, third)) bq = third;
	}
	if (isGt(bq, none)) 
		harray[0] = toString(bq);
	else harray[0] = 0;

	populateForm(harray);
}

/**
 *	Pops an information window
 *	@param	url: URL to load in the window. May be a blank
 *	@param	width: Width, in pixels, of the window
 *	@param	height: Height, in pixels, of the window
 *	@param	left: Left position, in pixels, of the window
 *	@param	up: Top position, in pixels, of the window
 *	@param	name: string, optional. A name to give the window (callers may also use it for document title)
 *	@return	window, a reference to the information window
 */
function infoWindow(url, width, height, left, up, name) {
	var w = window.open(url, (name? name : ""),  
"titlebar=0,directories=0,status=0,toolbar=0,location=0,resizable=0,width=" + width + ",height=" + height + ",left=" + left + ",screenX=" + left + ",top=" + up + ",screenY=" + up);
	if (!w.opener) w.opener = self;
	return w;
}

/**
 *	@return	string: DOCTYPE HTML
 */
function getDocumentTypeHeader() {
	return "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"" + ">";
}

/**
 *	@return	string: saved from HTML
 */
function getSavedFromHeader(source) {
	var prefix1 = "<!-- saved from url=";
	var prefix2 = "http://www.islamicsoftware.org/is/irth/v2/";
	var postfix = source? source : "";
	var count = (prefix2 + postfix).length;
	return prefix1 + (count>99? "(0" : "(00") + count + ")" + prefix2 + postfix + " --" + ">";
}

/**
 *	@return	string: META and LINK HTML tags
 */
function getMetaTags() {
	var mt = "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"/>";
	mt += "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>";
	mt += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>";
	mt += "<link rel=\"shortcut icon\" href=\"../res/favicon.ico\" type=\"image/x-icon\"/>";
	mt += "<link rel=\"stylesheet\" href=\"../res/irth.css\"/>";
	return mt;
}

/**
 *	@param	title:	string, HTML document title
 *	@return	string: TITLE HTML tag
 */
function getDocumentTitle(title) {
	return "<title" + ">" + (title? title : "") + "</title" + ">";
}

/**
 *	@param	title: string, HTML document title
 *	@return	string: HTML HEAD tag, including TITLE
 *	@see	#getDocumentTitle(string)
 */
function getDocumentHeader(title) {
	return "<html" + "><head" + ">" + getDocumentTitle(title) + getMetaTags() + "</head" + ">";
}

/**
 *	@return	string: BODY tag with lang, dir and class attributes
 */
function getDocumentBodyTag() {
	var lang = getPageLanguage();
	var dir = isPageLanguageDirectionRTL()? "rtl" : "ltr";
	if (lang) 
		return "<body lang=" + lang + " dir=" + dir + " " + displays["_bodyclass_"] + ">";
	else return "<body " + displays["_attrlang_"] + " " + displays["_attrdir_"] + " " + displays["_bodyclass_"] + ">";
}

/**
 *	@return	string: BODY and HTML end tags
 */
function getDocumentFooter() {
	return "</body" + "></html" + ">";
}

/**
 *	Corrects the float according to writing direction
 *	@param	rtl: string, "rtl" for right-to-left, or "ltr" for left-to-right (default)
 */
function correctFloat(rtl) {
	//Correct _floatfix_
	document.body.dir = (rtl? 'rtl' : 'ltr');
	var floatfix = document.getElementsByClassName('floatfix');
	var alignfix = document.getElementsByClassName('alignfix');
	var copyrightlogofix = document.getElementById('CopyrightLogo');
	if (floatfix && floatfix.length>0) 
		for (var i=0; i<floatfix.length; i++)
			floatfix[i].style['float'] = (rtl? 'right' : 'left');
	if (alignfix && alignfix.length>0) 
		for (var i=0; i<alignfix.length; i++)
			alignfix[i].style['text-align'] = (rtl? 'right' : 'left');
	if (copyrightlogofix) copyrightlogofix.style['float'] = (rtl? 'left' : 'right');
}

/**
 *	Switch to a supported language
 *	@param	languageCode: string, target language code, e.g., "fa" for Farsi
 */
function switchLanguage(languageCode) {
	setTranslationCookie("");
	if ("en"==languageCode || "ar"==languageCode || "id"==languageCode) {
		location.href = "../" + languageCode;
	}
	else {
		setTranslationCookie(languageCode);
		var dir = ("fa"==languageCode || "ur"==languageCode || "di"==languageCode || "ug"==languageCode || "ps"==languageCode || "rh"==languageCode || "he"==languageCode);
		location.href = "../ot/irth.html?lang=" + languageCode + (dir? "&dir=rtl" : "");
	}
}

/**
 *	Sets the selected language in language drop-down menu
 *	@param	languageCode: string, language code, e.g., "es"
 */
function setSelectedLanguage(languageCode) {
	var sel = getElement("TranslateSelector");
	for (var i=0; i<sel.options.length; i++) {
		if (sel.options[i].value == languageCode) {
			sel.options[i].selected = true;
			break;
		}
	}
}

/**
 *	Sets direction of text writing and element positioning to "rtl" if so passed in the query string
 */
function setPageDirection() {
	var lang = getPageLanguage();
	if ("en"==lang || "ar"==lang || "id"==lang) return;		//already taken care of
	else correctFloat(isPageLanguageDirectionRTL());
}

/**
 *	Initialize the UI. Populate from the query string if enetered
 */
function initPage() {
	clearForm();
	clearPreferences();
	clearBequest();
	window.status = displays["_thanks_"];
	getElement("HelpSelector").options.selectedIndex = 0;
	var lang = getPageLanguage();
	if (!lang || ""==lang || "en"==lang || "ar"==lang || "id"==lang) 
		setTranslationCookie("");
	else {
		setPageLanguage();
		setPageDirection();
		setTranslationCookie(lang);
		getElement("HelpSelector").options[3].disabled = true;	//Downlaod
	}
	setSelectedLanguage(lang? lang : "en");
	var classic = getElement("VersionsSelector").options[0];
	var wizard = getElement("VersionsSelector").options[1];
	classic.value += lang? "?lang="+lang : "";
	wizard.value += lang? "?lang="+lang : "";
	if (isPageLanguageDirectionRTL()) {
		classic.value += "&dir=rtl";
		wizard.value += "&dir=rtl";
	}
	if (_JavascriptVersion < 1.1) {
		var w = infoWindow("", 480, 400, 160, 150, "BadJavaScript");
		w.document.open();
		var s = getDocumentTypeHeader();
		s += getSavedFromHeader();
		s += getDocumentHeader(displays["_IRTH2_"]);
		s += getDocumentBodyTag();
		w.document.write(s);
		w.document.write(displays["_mustJS_"]);
		w.document.write(getDocumentFooter());
		w.document.close();
		w.focus();
	}
	//Equate heights - Didn't work :-(
	var c1 = getElement("Heirs1");
	var c2 = getElement("Heirs2");
	var c3 = getElement("Heirs3");
	var ch = Math.max(Math.max(c1.offsetHeight, c2.offsetHeight), c3.offsetHeight);
	c1.style.height = ch; c2.style.height = ch; c3.style.height = ch;
	var c4 = getElement("Prefs1");
	var c5 = getElement("Prefs2");
	var c6 = getElement("Prefs3");
	var cp = Math.max(Math.max(c4.offsetHeight, c5.offsetHeight), c6.offsetHeight);
	c4.style.height = cp; c5.style.height = cp; c6.style.height = cp;
	
	populateFromQueryString();	//does nothing if query string is null or incorrectly formatted
	//console.log(reorderCasesHeirs());
}

/**
 *	@return	the current leading identifier of the window status message
 */
function getStatusPrefix() {
	var s = "";
	if (school!=0) s += "[" + schoolNames[school] + "]";
	if (allowRuddToSpouses==true) s += "[" + displays["_fullrev_"] + "]";
	else if (allowRudd==true) s += "[" + displays["_rev_"] + "]";
	else s += "[" + displays["_norev_"] + "]";
	if (allowAwl==true) s+= "[" + displays["_rediv_"] + "]";
	else s+= "[" + displays["_norediv_"] + "]";
	if (isBequest()) s += "[" + displays["_bequest_"] + "]";
	return s; 
}

/**
 *	Sets the window status message
 *	@param	s: string. The window status message to display
 */
function setStatus(s) {
	window.status = getStatusPrefix() + " " + s;
}

/**
 *	Sets variables from input values
 *	@see	#nheirs
 *	@see	#bequestShare
 */
function collectInput() {
	for (var i=son; i<treasury; i++) {
		if (i==father || i==mother || i==husband || i==wife || i==gfather || i==gmotherF || i==gmotherM) {
			if (document.forms['IrthForm'].elements['num' + i].checked==true) nheirs[i] = 1;
			else nheirs[i] = 0;
		}
		else nheirs[i] = document.forms['IrthForm'].elements['num' + i].value *1;
	}
	bequestShare = toRational(document.forms['IrthForm'].elements['bequestField'].value);
	if (isGt(bequestShare, none)) {
		nheirs[bequest] = 0*1;
	}
	else {
		nheirs[bequest] = 0*1;
	}
	nheirs[treasury] = 0*1;
	debug("===>collectInput: " + getHeirList());
	getHeirRange();
	var schoolSelector = document.forms["PreferencesForm"].elements["SchoolSelector"];
	school = schoolSelector.options[schoolSelector.selectedIndex].value;
	allowRuddToSpouses = document.forms["PreferencesForm"].elements["Undersub"][1].checked==true;
	allowRudd = document.forms["PreferencesForm"].elements["Undersub"][0].checked==true || document.forms["PreferencesForm"].elements["Undersub"][1].checked==true;
	allowAwl = document.forms["PreferencesForm"].elements["Oversub"][0].checked==true;
}

/**
 *	Corrects user's input values, e.g., non-numeric number of heirs
 */
function correctInput() {	//returns boolean
	for (var i=son; i<treasury; i++) {
		if (!nheirs[i]) nheirs[i] = 0;
		if (isNaN(nheirs[i])) {
			console.error("Non-numeric input next to " + formatHeir(i) + " corrected to 0\n");
			detail("<b" + ">Correction:</b" + ">Non-numeric number of " + formatHeir(i) + " corrected to 0");
			nheirs[i] = 0;
			document.forms['IrthForm'].elements["num" + i].value = 0;
			//Fault tolerance. Don't return false
		}
		else if ( (nheirs[i]>1) && ((i==husband) || (i==father) || (i==mother) || (i==gfather) ||
			(i==gmotherF) || (i==gmotherM) ) ) 
		{
			nheirs[i] = 1;
			detail(formatHeir(i) + ": " + displays["_correct1_"]);
			document.forms['IrthForm'].elements["num" + i].value = 1;
		}//Redundant now that these input fields are checkboxes
	}
	if ((nheirs[husband]>0) && (nheirs[wife]>0)) {
		nheirs[wife] = 0;
		detail(formatHeir(i) + ": " + displays["_correct0_"]);
		document.forms['IrthForm'].elements['num5'].value = 0;
	}//Redundant now that the two fields are checkboxes that act like radio buttons
	if (nheirs[wife]>4) {
		nheirs[wife] = 4;
		detail(formatHeir(i) + ": " + displays["_correct4_"]);
		document.forms['IrthForm'].elements['num6'].value = 4;
	}//Only happens with programmatic entry, e.g., test cases

	if (isNegative(bequestShare)) bequestShare = none;
	if (isGt(bequestShare, third)) {
		bequestShare = third;
		detail(formatHeir(i) + ": " + displays["_correct1-3_"]);
	}
	return true;
}

/**
 *	Event handler for selecting a reversion rule
 *	based on the selection of a juristic school
 */
function setRudd() {
	if (document.forms['PreferencesForm'].elements['schoolSelector'].value==Maliki || document.forms['PreferencesForm'].elements['schoolSelector'].value==Zahiri)
		document.forms['PreferencesForm'].elements['Undersub'][2].checked = true;
	else document.forms['PreferencesForm'].elements['Undersub'][0].checked = true;
}

/**
 *	Event handler for selecting an oversubscription rule
 *	based of the selection of a juristic school
 */
function setAwl() {
	if (document.forms['PreferencesForm'].elements['schoolSelector'].value==Zahiri || document.forms['PreferencesForm'].elements['schoolSelector'].value==Jaafari)
		document.forms['PreferencesForm'].elements['Oversub'][1].checked = true;
	else document.forms['PreferencesForm'].elements['Oversub'][0].checked = true;
}

/**
 *	@return	a query string representation of the case at hand. Useful for reloading after screen size change
 */
function caseToQueryString() {
	collectInput();
	var hc = "hc=0";	//First element is bequest and always 0
	var sc = school;
	var rv = (allowRuddToSpouses? 2: (allowRudd? 1: 0));
	var aw = (allowAwl? 1 : 0);
	var bq = !isZero(bequestShare)? toString(bequestShare) : "0";
	for (var h=son; h<treasury; h++)
		hc += "," + nheirs[h];
	hc += "&sc=" + sc;
	hc += "&rv=" + rv;
	hc += "&aw=" + aw;
	hc += "&bq=" + bq;
	return hc;
}

/**
 *	Show a help dialog that explains what "junior" means in the context of grandmothers
 */
function showGmGen() {
	var w = infoWindow("gmgen.html", "GmGenWindow", 480, 400, 160, 150);
	if (typeof window.focus != "undefined") w.focus();
}

/**
 *	Gets which grandmother is junior to the other, if they're not of the same generation
 *	@return	1, if the mother of father (or higher) is junior to the mother of mother,
 *			2, if it's the other way around, or
 *			0, if both are of the same generation (the default)
 */
function getGmGen() {
	var g = 0;
	if (document.forms['IrthForm'].elements['gmfy'].checked) g = 1;
	if (document.forms['IrthForm'].elements['gmmy'].checked) g = 2;
	debug("GM level = " + g);
	return g;
}

/**
 *	@return	string: html code for the ruler line used as a table output header for displayed test cases
 */
function getTableHeader() {
	return "<tr style='font: bold'" + "><td" + ">&nbsp;</td" + "><td" + ">" + displays["_tabCase_"] + "</td" + "><td" + ">" + displays["_tabSn_"] + "</td><td" + ">" + displays["_tabDr_"] + "</td><td" + ">" + displays["_tabFr_"] + "</td><td" + ">" + displays["_tabMr_"] + "</td><td" + ">" + displays["_tabHb_"] + "</td><td" + ">" + displays["_tabWf_"] + "</td><td" + ">" + displays["_tabBr_"] + "</td><td" + ">" + displays["_tabSr_"] + "</td><td" + ">" + displays["_tabSm_"] + "</td><td" + ">" + displays["_tabSs_"] + "</td><td" + ">" + displays["_tabDs_"] + "</td><td" +  ">" + displays["_tabGF_"] + "</td><td" + ">" + displays["_tabGf_"] + "</td><td" + ">" + displays["_tabUn_"] + "</td><td" + ">" + displays["_tabUf_"] + "</td><td" + ">" + displays["_tabBf_"] + "</td><td" + ">" + displays["_tabSf_"] + "</td><td" + ">" + displays["_tabOr_"] + "</td><td" + ">" + displays["_tabNu_"] + "</td><td" + ">" + displays["_tabNf_"] + "</td><td" + ">" + displays["_tabGm_"] + "</td><td" + ">" + displays["_tabCz_"] + "</td><td" + ">" + displays["_tabCf_"] + "</td><td" + ">" + displays["_tabSv_"] + "</td><td" + ">" + displays["_tabTr_"] + "</td><td" + ">" + displays["_tabSc_"] + "</td><td" + ">" + displays["_tabRv_"] + "</td><td" + ">" + displays["_tabAw_"] + "</td><td" + ">" + displays["_tabBq_"] + "</td></tr" + ">";
}

/**
 *	HTML header of tabulated results document
 *	@return	string: html code
 *	@see	#getTableHeader()
 */
function getTabulatedPageHeader() {
	var s =
		getDocumentTypeHeader() + 
		getSavedFromHeader() + 
		getDocumentHeader(displays["_Results_"]) + 
		getDocumentBodyTag() + 
		displays['_improvetranslation_'] +
		displays['_autotranslatedetails_'] +
		displays['_RTLarrows_'] +
		"<table border='1' style='overflow-x:auto;'" + 
		">" + 
		getTableHeader();
	return s;
}

/**
 *	Get html code for a row in a tabulated results document
 *	@param	c: int, case number
 *	@return	string: html code	
 */
function getTabulatedRow(c) {
	var multiplier;
	//First row: Heirs and preferences
	var results = "<tr style='background: #fffacd'" + "><td" + ">" + displays["_tabHeirs_"] + "</td" + ">";
	results += "<td align='right'" + ">" + (c || c>=0? (c+1) : "&nbsp;") + "</td" + ">";
	for (var i=son; i<treasury; i++) {
		if (nheirs[i]>0) results += "<td align='right'" + ">" + nheirs[i] + "</td" + ">";
		else results += "<td align='right'" + ">&nbsp;</td" + ">";
	}
	//Treasury
	results += "<td" + ">&nbsp;</td" + ">";
	//School, Rv, Aw, Bq
	results += "<td" + ">" + schoolNames[school] + "</td" + ">";
	var rev;
	if (allowRuddToSpouses==true) rev = displays["_tabFull_"];
	else if (allowRudd==true) rev = displays["_tabYes_"];
	else rev = displays["_tabNo_"];
	results += "<td" + ">" + rev + "</td" + ">";
	var awl;
	if (allowAwl==true) awl = displays["_tabYes_"];
	else awl = displays["_tabNo_"];
	results += "<td" + ">" + awl + "</td" + ">";
	if (isZero(bequestShare)) results += "<td" + ">0</td" + ">";
	else if (isOne(bequestShare)) results += "<td" + ">" + displays["_tabALL_"] + "</td" + ">";
	else results += "<td" + ">" + toString(bequestShare) + "</td" + ">";
	results += "</tr" + ">";
	//Second row: Shares
	results += "<tr" + "><td" + ">" + displays["_tabShares_"] + "</td" + ">";
	results += "<td" + ">&nbsp;</td" + ">";
	for (var i=son; i<treasury; i++) {
		if (!isValidRational(has(i))) console.warn(c + ":" + has(i));
		if (nheirs[i]>0) multiplier = new Rational(1, nheirs[i]);
		else multiplier = whole;
		if (isZero(has(i))) {
			if (nheirs[i]>0) results += "<td align='right'" + ">0</td" + ">";
			else results += "<td align='right'" + ">&nbsp;</td" + ">";
		}
		else if (isOne(has(i))) results += "<td" + ">" + displays["_tabALL_"] + "</td" + ">";
		else results += "<td align='right'" + ">" + toString(multiply(has(i), multiplier)) + "</td" + ">";
	}	
	if (isZero(has(treasury))) results += "<td" + ">0</td" + ">";
	else if (isOne(has(treasury))) results += "<td" + ">" + displays["_tabALL_"] + "</td" + ">";
	else results += "<td" + ">" + toString(has(treasury)) + "</td" + ">";
	results += "<td colspan='4'" + ">&nbsp;</td" + "></tr" + ">"; 
	return results;
}

/**
 *	Get the html code for the footer of a tabulated results document
 *	@return	string: html code
 */
function getTabulatedPageFooter() {
	return "</table" + "><br/" + "></body" + "></html" + ">";
}

/**
 *	Whether resultsWindow exists, is open and its document is ready for writing
 *	@return	boolean, true if all conditions are true
 **/
function isResultsWindowOpen() {
	return (resultsWindow != null && resultsWindow.closed==false && resultsWindow.document);
}

/**
 *	Whether resultsWindow does not exist, is closed or its document is not available for writing
 *	@return	boolean, true if any of the conditions is true
 **/
function isResultsWindowClosed() {
	return (resultsWindow==null || resultsWindow.closed==true || !resultsWindow.document)
}

/**
 *	Ensure resultsWindow exists, is open and its document is ready to be written
 **/
function openResultsWindow(title) {
	if (isResultsWindowClosed())
		resultsWindow = window.open("", title);
	if (resultsWindow.document) resultsWindow.document.open();
}

/**
 *	Ensure resultsWindow and its document are closed and the window is annulled
 **/
function closeResultsWindow() {
	if (isResultsWindowOpen()) {
		if (resultsWindow.document) resultsWindow.document.close();
		resultsWindow.close();
		resultsWindow = null;
	}
}

/**
 *	@param	textToLog: string, HTML text to log
 *	@return	string: an empty string. This is so that textToLog can be reset for the caller
 */
function logPeriodically(textToLog) {
	if (isResultsWindowClosed()) {
		openResultsWindow(displays["_Results_"]);
		resultsWindow.document.write(getTabulatedPageHeader());
	}
	resultsWindow.document.write((textToLog? textToLog : ""));
	return "";	//Usage: results = logPeriodically(results);
}

/**
 *	Run a range of test cases
 *	@param	c1: int, beginning case number
 *	@param	c2: int, ending case number
 *	@param	verbose: boolean. True if details are included. Default: false
 */
function runTests(c1, c2, verbose) { 
	if (isResultsWindowClosed()) {
		openResultsWindow(displays["_Results_"]);
		resultsWindow.document.write(getTabulatedPageHeader());
	}
	var results = logPeriodically();	//opens resultsWindow if closed or null and resets results
	var ci = 0;
	for (var c=c1; c<=c2; c++) {
		detail("<br" + "/><b" +  ">" + displays["_testcase_"] + c + "</b" + ">");
		initialize();
		var carray = getTestCase(c);
debug(carray);
		//Array of 25 to 28 elements starting with element 0 for bequest
		//Element 25 is not for treasury because it's always 0, rather it's for Rv (default 1)
		//Element 26 is for Sc (default 1) and element 27 is Aw (default 1)
		for (var i=son; i<treasury; i++) {	//1..24
			nheirs[i] = carray[i]-0;
		}
		nheirs[bequest] = 0;
		nheirs[treasury] = 0;	deprive(treasury);
		debug("nheirs = " + nheirs.join());
		if (carray.length > (servant+3)) {
			//This element(27) is reserved for aw
			if (carray[(servant+3)]!=0) allowAwl = true;
			else allowAwl = false;
		}
		else {
			allowAwl = true;
		}
		if (carray.length > (servant+2)) school = carray[servant+2]-0;
			//This element (26) is reserved for Sc
		else school = Hanafi;
		if (carray.length > (servant+1)) {
			//This element (25) is reserved for Rv (since treasury is always 0)
			if (carray[(servant+1)]>1) allowRuddToSpouses = true;
			else allowRuddToSpouses = false;
			if (carray[(servant+1)]>0) allowRudd = true;
			else allowRudd = false;
		}
		else {
			allowRuddToSpouses = false;
			allowRudd = true;
		}
		if (carray[0] != 0) {
			bequestShare = toRational(carray[0]);
		}
		else {
			bequestShare = none;
		}

		detail(displays["_Heirs_"] + ": " + getHeirList());
		detail(displays["_School_"] + ": " + schoolNames[school]);
		detail(displays["_Reversion_"] + ": " + (allowRudd==true? displays["_allowed_"] : displays["_notallowed_"]));
		detail(displays["_Reversion-s_"] + ": " + (allowRuddToSpouses==true? displays["_allowed_"] : displays["_notallowed_"]));
		detail(displays["_Redivision_"] + ": " + (allowAwl==true? displays["_allowed_"] : displays["_notallowed_"]));
		detail(displays["_Bequest_"] + ": " + toString(bequestShare));
		
		if (calculateShares()) {
			//sum = whole, so make sure any -ve share marks left are voided
			for (var i=son; i<=treasury; i++) {
				if (nheirs[i] > 0 && isNegative(has(i))) gets(i, none);
			}
		}

		results += getTabulatedRow(c);
		if (++ci%10==0) results += getTableHeader();
		results = logPeriodically(results);		//Empties results after logging
		debug("Processed test case #" + c);
	}
	results += "<tr" + "><td colspan='31'" + ">" + displays["_tabLegend_"] + "</td" + "></tr" + ">";
	results += "</table" + ">";
	if (verbose) results += debugText;
	results += getDocumentFooter();
	results = logPeriodically(results);

	if (resultsWindow.document) resultsWindow.document.close();
	if (typeof resultsWindow.focus != "undefined") resultsWindow.focus();
	document.forms['IrthForm'].elements['DetailsButton'].disabled=false;
}

/**
 *	Run all the test cases in terse mode
 *	@see	#runTests(int,int,boolean)
 */
function runAllTests() {
	runTests(0, lastCase(), false);
}

/**
 *	Display share distribution in the detailed results window in tabular form
 */
function displaySharesTabulated() {
	if (isResultsWindowClosed()) {
		openResultsWindow(displays["_Results_"]);
	}
	else if (resultsWindow.document) resultsWindow.document.open();
	var results = getTabulatedPageHeader() +
		getTabulatedRow() +
		getTabulatedPageFooter();
	
	resultsWindow.document.write(results);
	resultsWindow.document.close();
	document.forms['IrthForm'].elements['DetailsButton'].disabled=false;
}

function getResultsDocumentHeader() {
	return getDocumentTypeHeader() + 
		getSavedFromHeader() + 
		getDocumentHeader(displays["_Results_"]) +
		getDocumentBodyTag();
}

/**
 *	Display share distribution in a detail document on another window
 */
function displaySharesNS() {		//Details window. Also, older, non-IE browsers
	if (isResultsWindowClosed()) {
		openResultsWindow(displays["_Results_"]);
		//resultsWindow.document.open();	//already done by openResultsWindow()
	}
	else {
		resultsWindow.document.open();	//clears any content
	}
	var results = getResultsDocumentHeader();
	results += displays['_autotranslatedetails_'];
	results += displays['_improvetranslation_'];
	results += displays['_RTLarrows_'];
console.log(results);
	results += "<b" + ">" + displays["_START_"] + "</b" + "><br" + "/>";
	results += "<" + "h2>" + displays["_THEHEIRS_"] + "</h2" + ">";
	results += getHeirList() + "<br" + "/>";

	results += "<h2" + ">" + displays["_Preferences_"] + "<" + "/h2>";
	results += displays["_School_"] + ": " + schoolNames[school] + "<br" + "/>";
	results += displays["_Reversion_"] + ": " + (allowRudd==true? displays["_allowed_"] : displays["_notallowed_"]) + "<br" + "/>";
	results += displays["_Reversion-s_"] + ": " + (allowRuddToSpouses==true? displays["_allowed_"] : displays["_notallowed_"]) + "<br" + "/>";
	results += displays["_Redivision_"] + ": " + (allowAwl==true? displays["_allowed_"]: displays["_notallowed_"]) + "<br" + "/>";
	results += displays["_Bequest_"] + ": " + toLangFraction(bequestShare) + "<br" + "/>";

	results += "<h2" + ">" + displays["_DISTRIBUTION_"] + "</h2" + ">";
	results += displays["_asfollows_"] + displays["_comma_"] + "<br" + "/>";
	var multiplier = whole;
	var num = 0;
	for (var i=son; i<treasury; i++) {
		num = nheirs[i]-0;
		if (num > 1) {
			if (num == 2) {
				if (isZero(has(i))) {
					results += "<b" + ">" + 
						formatHeir(i, true) + 
						"</b" + "> " + 
						formatWord("get0", 2, getHeirGender(i)) + 
						"<br" + "/>";
				}
				else {
					results += "<b" + "/>" + 
						formatHeir(i, true, '') + 
						"</b" + "> " + 
						formatWord("get", 2, getHeirGender(i)) + 
						" <b" + ">" + 
						toLangFraction(multiply(has(i), half)) + 
						"</b" + "> " + 
						formatWord("each", 2, getHeirGender(i)) + 
						"<br" + "/>";
				}
			}
			else {
				if (isZero(has(i))) {
					results += "<b" + ">" + 
						formatHeir(i, true, '') + 
						"</b" + "> " + 
						formatWord("get0", num, getHeirGender(i)) + 
						"<br" + "/>";
				}
				else {
					multiplier = new Rational(1, num);
					results += "<b" + ">" + (num-0) + " " + 
						formatHeir(i, false, '') + 
						"</b" + "> " + 
						formatWord("get", num, getHeirGender(i)) + 
						" <b" + ">" + 
						toLangFraction(multiply(has(i), multiplier)) + 
						"</b" + "> " + 
						formatWord("each", num, getHeirGender(i)) + 
						"<br" + "/>";
				}
			}
		}
		else if (num == 1)
			if (isZero(has(i))) {
				results += "<b" + ">" + 
					formatHeir(i, true, '') + 
					"</b" + "> " + 
					formatWord("gets0", 1, getHeirGender(i)) + 
					"<br" + "/>";
			}
			else {
				results += "<b" + ">" + 
					formatHeir(i, true, '') + 
					"</b" + "> " + 
					formatWord("gets", 1, getHeirGender(i)) + 
					" <b" + ">" + 
					toLangFraction(has(i)) + 
					"</b" + "><br" + "/>";
			}
	}
	if (!isZero(has(treasury))) {
		results += "<b" + ">" + 
			displays["_Treasury_"] + 
			"</b" + "> " + 
			displays["_gets_"] + 
			" <b" + ">" +
			toLangFraction(has(treasury)) + 
			"</b" + "><br" + "/>";
	}
	if (!isZero(bequestShare)) {
		results += "<b" + ">" + 
		displays["_Bequest_"] + 
		":</b" + "> " + 
		" <b" + ">" + 
		toLangFraction(bequestShare) + 
		"</b" + "><br" + "/>";
	}

	results += debugText;
	results += "<b" + ">" + displays["_END_"] + "</b" + "><br" + "/><br" + "/>";

	//resultsWindow.document.open();
	resultsWindow.document.write(results);
	resultsWindow.document.write("</body" + "></html" + ">");
	resultsWindow.document.close();
	if (typeof resultsWindow.focus != "undefined") resultsWindow.focus();
}

/**
 *	Display share distribution on the main window
 */
function displayShares() {
	clearShares();
	displaySharesNS();
	document.forms['IrthForm'].elements['DetailsButton'].disabled=false;
	if (isModern || isIE) {
		var multiplier = whole;
		for (var i=son; i<treasury; i++) {
			if ((nheirs[i]-0) > 1) {
				multiplier = new Rational(1, nheirs[i]);
				if (i==wife) put('get'+i, toLangFraction(has(i)));
				else if (isZero(has(i))) 
					put('get'+i, formatWord("noshare", nheirs[i], getHeirGender(i))); 
				else 
					put('get'+i, toLangFraction(multiply(has(i), multiplier)) + " " + 
						formatWord("each", nheirs[i], getHeirGender(i)));
			}
			else if (nheirs[i]==1) 
				if (isZero(has(i))) 
					put('get'+i, formatWord("noshare", 1, getHeirGender(i))); 
				else put('get'+i, toLangFraction(has(i)));
			else put('get'+i, "");
		}
		if (!isZero(bequestShare))
			document.forms['IrthForm'].elements['bequestField'].value = toString(bequestShare);
		if (!isZero(has(treasury)))
			put('get'+treasury, toLangFraction(has(treasury)));
	}
	window.focus();
}

/**
 *	Event handler for the Calculate button
 */
function calculate() {
	debugText = "";
	detail("<h2" + ">" + displays["_Details_"] + "<" + "/h2>");
	detail("<b" + ">" + displays["_Initializing_"] + "</b" + ">");
	initialize();
	detail("<b" + ">" + displays["_Collecting_"] + "</b" + ">");
	collectInput();		//populates nheirs[] from num input array
	if (correctInput()) {
		detail("<b" + ">" + displays["_Calculating_"] + "</b" + ">");
		if (assertTrue(calculateShares(), displays["_calcerror_"]))
		{
			setStatus(displays["_calcok_"]);
		}
		else {
			setStatus(displays["_calcnotok_"]);
		}
		detail("<b" + ">" + displays["_Displaying_"] + "</b" + ">");
		displayShares();
	}
	else
		alert(displays["_inputinvalid_"]);
}

/**
 *	Erase input in the heir category columns
 */
function clearHeirs() {
	debug("===>clearHeirs()");
	for (var j=son; j<treasury; j++) {
		if (j==father || j==mother || j==husband || j==wife || j==gfather || j==gmotherF || j==gmotherM)
			document.forms['IrthForm'].elements['num'+j].checked = false;
		else document.forms['IrthForm'].elements['num'+j].value = "";
	}
	document.forms['IrthForm'].elements['gmfy'].checked = false;
	document.forms['IrthForm'].elements['gmmy'].checked = false;
}

/**
 *	Erase input in the bequest fraction cell
 */
function clearBequest() {
	document.forms['IrthForm'].elements['bequestField'].value = "";
}

/**
 *	Erase displayed output in the main window of share distribution
 */
function clearShares() {
	if (isModern || isIE) {
		for (var i=son; i<=treasury; i++) {
			put('get'+i, "");
		}
		clearBequest();
		debug("Shares cleared");
	}
}

/**
 *	Reset the preference of juristic school, and oversubscription and under-subscription rules
 */
function clearPreferences() {
	document.forms['PreferencesForm'].elements['SchoolSelector'][0].checked = true;
	document.forms['PreferencesForm'].elements['Undersub'][0].checked = true;
	document.forms['PreferencesForm'].elements['Oversub'][0].checked = true;
	debug("Preferences reset");
}

/**
 *	Erase all inputs on the main form
 */
function clearForm() {
	clearHeirs();
	clearShares();
	document.forms['IrthForm'].elements['TestCaseSelector'].selectedIndex=0;
	if (isModern || isIE) put('caseNum', "");
	else document.forms['IrthForm'].elements['caseNum'].value="";
	document.forms['IrthForm'].elements['DetailsButton'].disabled=true;
	clearPreferences();
	closeResultsWindow();
	//location.search = "";		//causes constant reloading!
	debug("Form cleared");
	//console.clear();
}

/**
 *	Populate the forms from an array
 *	@param	hc: array of string. Length of array is 25 to 28
 *			Element 0: bequest, e.g. 3/4 or 0
 *			Elements 1..24: number of heirs in each heir category in the order displayed on main window
 *			Element 25: reversion rule, 1 (named heirs except spouse), 2 (all named heirs) or 0 (none)
 *			Element 26: juristic school, 0..8 (none,Hanafi,Maliki,Shafii,Hanbali,Egypt,Zahiri,Jaafari,Ibadhi)
 *			Element 27: oversubscription rule, 0 or 1 (consensus or Zahiri/Jaafari)
 */
function populateForm(hc) { 
	var harray = hc;
	for (var h=1; h<hc.length; h++) {
		if (isNaN(hc[h])) harray[h] = 0;
		else if (hc[h]<0) harray[h] = 0;
		else harray[h] = hc[h];
	}
	harray[0] = hc[0];	//It can be a string representing a rational fraction
	for (var i=son; i<=servant && i<harray.length; i++) 
		if (i==father || i==mother || i==husband || i==wife || i==gfather || i==gmotherF || i==gmotherM)
			document.forms['IrthForm'].elements['num'+i].checked = ((harray[i]-0)>0);
		else if ((harray[i]-0)>0)
			document.forms['IrthForm'].elements['num'+i].value = harray[i];
		else document.forms['IrthForm'].elements['num'+i].value = "";
	if (harray[0] != 0) 
		document.forms['IrthForm'].elements['bequestField'].value = harray[0];
	else document.forms['IrthForm'].elements['bequestField'].value = "";
	if (harray.length>(servant+3)) {	//27=Aw
		if (harray[servant+3]==0) //No Awl
			document.forms['PreferencesForm'].elements['Oversub'][1].checked = true;
		else document.forms['PreferencesForm'].elements['Oversub'][0].checked = true;
	}
	else if (harray.length>(servant+2)) {	//26=Sc
		if ((harray[servant+2]>=0 && harray[servant+2])<=numschools)
			document.forms['PreferencesForm'].elements['SchoolSelector'].value = harray[servant+2];
		else document.forms['PreferencesForm'].elements['SchoolSelector'].value = Hanafi;
	}
	else if (harray.length>(servant+1)) {	//25=Rv
		if (harray[servant+1]==2)	//Spouse too
			document.forms['PreferencesForm'].elements['Undersub'][1].checked = true;
		else if (harray[servant+1]==0)	//No rudd
			document.forms['PreferencesForm'].elements['Undersub'][2].checked = true;
		else document.forms['PreferencesForm'].elements['Undersub'][0].checked = true;
	}
	debug("Form populated from array"); 
}

/**
 *	Update the enablement of the forward and backward test buttons
 */
function updateTestButtons() {
	if (testCase<=0)
		document.forms['IrthForm'].elements['PreviousTestButton'].disabled=true;
	else if (testCase>=lastCase())
		document.forms['IrthForm'].elements['NextTestButton'].disabled=true;
	else {
		document.forms['IrthForm'].elements['PreviousTestButton'].disabled=false;
		document.forms['IrthForm'].elements['NextTestButton'].disabled=false;
	}
	if (isModern || isIE) {
		if (testCase>=0 && testCase<=lastCase()) 
			put('caseNum', displays["_Case_"] + " " + (testCase-0+1) + " " + displays["_of_"] + " " + (lastCase()-0+1)); 
		else put('caseNum', ""); 
	}
	else {
		if (testCase>=0 && testCase<=lastCase()) 
			document.forms['IrthForm'].elements['caseNum'].value = displays["_Case_"] + " " + (testCase-0+1) + displays["_of_"] + " " + (lastCase()-0+1); 
		else document.forms['IrthForm'].elements['caseNum'].value = ""; 	
	}
}

/**
 *	Populate the forms from a test case string
 *	@param	caseNumber: int, the test case number
 */
function populateFromCase(caseNumber) { 
	var harray = getTestCase(caseNumber);
	populateForm(harray);
	debug("Form populated from case #" + caseNumber + ":" + getHeirList()); 
	updateTestButtons(); 
}

/**
 *	Create an array of randomly generated numbers of heirs in each category
 */
function generateRandomHeirs() { 
	var harray = new Array(servant+4);	//24:servant, 25:rv replacing treasury, 26:sc, 27:aw.
	harray[0] = 0; //Unnecessary for a random heirs test to specify a bequest 
	for (var i=son; i<=servant; i++) { 
		if (i==father || i==husband || i==mother || i==gfather || i==gmotherF || i==gmotherM) 
			harray[i] = Math.round(Math.random()); //0-1 
		else if (i==wife) 
			harray[i] = Math.floor(Math.random() * 5); //0-4
		else harray[i] = Math.floor(Math.random() * 8); //0-7 
	} 
	if ((harray[husband]>0) && (harray[wife]>0)) { 
		if (harray[wife]>harray[husband]) harray[husband] = 0; 
		else harray[wife] = 0; 
	} 
	harray[servant+1] = Math.floor(Math.random() * 3); //rv(25)=0-2; 
	harray[servant+2] = Math.floor(Math.random() * 10); //sc(26)=0-9; 
	harray[servant+3] = Math.round(Math.random()); //aw(27)=0-1; 
	return harray; 
}

/**
 *	Populate the main form with randomly generated numbers of heirs in each category
 *	@see	#generateRandomHeirs()
 */
function populateRandomly() { 
	var harray = generateRandomHeirs(); 
	populateForm(harray); 
}

/**
 *	Populate the forms from a test case string then calculate the shares and display the,
 *	@param	caseNumber: int, the test case number
 *	@see	#populateFromCase(int)
 *	@see	#calculate()
 */
function calculateTestCase(caseNumber) { 
	debug("===>calculateTestCase(" + caseNumber + ")"); 
	clearForm(); 
	initialize(); 
	populateFromCase(caseNumber); 
	calculate();
	testCase = caseNumber;
	updateTestButtons(); 
}

/**
 *	Calculate the previous case to the one just calculated
 *	@see	#calculateTestCase(int)
 */
function previousTest() { 
	if (testCase>0) calculateTestCase(testCase-1); 
}

/**
 *	Calculate the next case to the one just calculated
 *	@see	#calculateTestCase(int)
 */
function nextTest() { 
	if (testCase<lastCase()) calculateTestCase(testCase-0+1); 
}

/**
 *	Load a randomly selected test case and run it
 *	@see	#populateRandomly()
 */
function randomTest() { 
	clearForm(); 
	initialize(); 
	populateRandomly(); 
	debug("===>Random test: " + getHeirList());
	calculate();
}

/**
 *	Load a selected test case suite and run it
 *	@param	tc: int, the test case to load
 *	@see	#runTests(int,int,boolean)
 *	@see	#calculateTestCase(int)
 */
function showTestCase(tc)
{
	debug("Test case #" + tc);
	if (tc==-2) runTests(0,2);					//Abu-Bakr
	else if (tc==-3) runTests(3,4);				//Omaria
	else if (tc==-4) calculateTestCase(5);		//Minbaria
	else if (tc==-5) calculateTestCase(6);		//Shuraih
	else if (tc==-6) calculateTestCase(7);		//Shafii
	else if (tc==-7) calculateTestCase(8);		//Kharqaa
	else if (tc==-8) runTests(9,11);			//Malikia
	else if (tc==-9) calculateTestCase(12);		//Pseudo-Malikia
	else if (tc==-10) runTests(13,20);			//Akdaria
	else if (tc==-11) calculateTestCase(21);	//Mushtarika
	else if (tc==-30) runTests(22,47);			//Sons and daughters
	else if (tc==-31) runTests(48,95);			//Daughters and no sons
	else if (tc==-32) runTests(96,108);			//Daughters and siblings
	else if (tc==-33) runTests(109,150);		//Parents
	else if (tc==-35) runTests(151,160);		//Spouses
	else if (tc==-34) runTests(161,180);		//Grandfather and siblings
	else if (tc==-101) runTests(182,186);		//Sole heir
	else if (tc==-100) runTests(187,188)		//No heirs
	else if (tc==-98) {
		calculateTestCase(getRandomTestCase());
	}
	else if (tc==-99) {
		randomTest();
	}
	else if (tc==-1000) {
		runAllTests();
	}
	else if (tc>=0 && (tc-0)<=lastCase()) {
		calculateTestCase(tc);
	}
	setStatus(displays["_testok_"]);
}

