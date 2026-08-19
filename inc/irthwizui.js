RELATION = ["bequest","son","daughter","father","mother","husband","wife","brother","sister","sibling","grandson","granddaughter","grandfather","grandmother","uncle","uncle","half-brother","half-sister","relative","newphew","nephew","grandmother","cousin","cousin","servant","Islamic treasury"];
RELATIONS = ["bequests","sons","daughters","father","mother","husband","wives","brothers","sisters","siblings","grandsons","granddaughters","grandfather","grandmother","uncles","uncles","half-brothers","half-sisters","relatives","newphews","nephews","grandmother","cousins","cousins","servants","IslamicTreasury"];

/**
 *	Initialize the HeirsInfo array. 
 *	Element 0 is for bequest, element 25 is for treasury
 *	Both are treated differently from heirs, so their count is always 0
 */
function initializeHeirsInfo() {
	var hi = [];
	var he = {"relation":RELATIONS[0], "count":0};
	hi.push(he);
	for (var i=son; i<treasury; i++) {
		he = {"relation":RELATIONS[i], "count":0};
		hi.push(he);
	}
	he = {"relation":RELATIONS[treasury], "count":0};
	hi.push(he);
	return hi;
}

initializeHeirsInfo();

/**
 *	Write out a debugging statement
 *	This overrides the one in irth.js in order to write debugging statements to the console only
 *	@param	msg: string, the statement
 */
function debug(msg) {
	console.log("[debug] " + msg + "\n");
}

/**
 *	Write out a detail statement
 *	This overrides the one in irth.js in order to write detail statements to the console only
 *	@param	msg: string, the statement
 */
function detail(msg) {
	debugText += msg + "<br" + "/>";
	console.log(msg + "\n");
}

initialize();

resultsWindow = null;

elements = {"rl":getElement("Relation"),
			"hl":getElement("hl"),
			"sc":getElement("sc"),
			"rv":getElement("rv"),
			"aw":getElement("aw"),
			"bq":getElement("bq"),
			"ed":getElement("ed"),
			"hc":getElement("hc"),
			"hn":getElement("hn"),
			"add":getElement("add"),
			"remove":getElement("remove"),
			"go":getElement("go"),
			"dt":getElement("dt"),
			"reset":getElement("reset")
};

/**
 **	Pop a help window
 **	@param	doc: string. URL of the help document
**/
function showHelp(doc, width, height)
{
	var win = window.open(
		doc, 
		"HelpWindow", 
"directories=0,status=0,toolbar=0,location=0,resizable=0,width="+width+",height="+height+",left=60,screenX=60,top=50,screenY=50"
	);
	if (!win.opener) win.opener = self;
	//win.document.close();
	win.focus();
}

/**
 *	Get the HeirsInfo field value
 *	@return	array of heirs info objects, each has the properties "relation", "names" and "share"
 */
function getHeirsInfo() {
	var histr = elements["hn"].innerText;
	var hi = histr? JSON.parse(histr) : initializeHeirsInfo();
	//console.log("hn=" + JSON.stringify(hi) + "\n");
	return hi;
}

/**
 *	Determine whether updating the HeirsInfo array when a name is added by addHeir() is valid
 *	@param	index: index into HeirsInfo array
 *	@return	false if index is out of the range 0..25, or heir count already set to its max.
 */
function isUpdateHeirsInfo(index) {
	var hi = getHeirsInfo();
	var countMax = {"husband":1,"wives":4,"father":1,"mother":1,"grandfather":1,"grandmother":1};
	//console.log("Max counts:\n" + JSON.stringify(countMax) + "\n");
	console.log(hi[index].relation + " count = " + hi[index].count + "\n");
	console.log(hi[index].relation + " max count = " + countMax[hi[index].relation] + "\n");
	if (index<0 || index >= hi.length) {
		console.warn(index + " is outside the HeirsInfo array bounds. Add ignored.\n");
		return false;
	}
	else if (hi[index].count >= countMax[hi[index].relation]) {
		console.warn(hi[index].relation + " count is at max. Add ignored.\n");
		return false;
	}
	else if (index==wife && hi[husband].count>0) {
		console.warn("Husband been set. Cannot also add wife. Add ignored.\n");
		return false;
	}
	else if (index==husband && hi[wife].count>0) {
		console.warn("Wife been set. Cannot also add husband. Add ignored.\n");
		return false;
	}
	else return true;
}

/**
 *	Set the HeirsInfo field value
 *	@param	hi, array of heirs info objects, each has the properties "relation", "names" and "share"
 *			Default is current value of the HeirsInfo array, stringified
 */
function setHeirsInfo(hi) {
	if (hi) elements["hn"].innerText = JSON.stringify(hi);
	else elements["hn"].innerText = JSON.stringify(getHeirsInfo());
	console.log("HeirsInfoField now: " + elements["hn"].innerText + "\n");
}

/**
 *	Update the HeirsInfo array when a name is added by addHeir()
 *	@param	index: index into HeirsInfo array. Ignored if it's out of the range 0..25
 */
function updateHeirsInfo(index, remove) {
	var hi = getHeirsInfo();
	if (isUpdateHeirsInfo(index)) {
		if (remove && hi[index].count>=1) 
			hi[index].count -= 1;
		else hi[index].count += 1;
		if (hi[index].count==1)
			hi[index].relation = RELATION[index];
		else hi[index].relation = RELATIONS[index];
	}
	setHeirsInfo(hi);
}

/**
 *	List the heirs
 *	@return	heir list by relation and count
 */
function listHeirs() {
	var hi = getHeirsInfo();
	var str = "[";
	for (var i=son; i<treasury; i++) {	//loop over relations
		var count = hi[i].count;
		if (count == 0) continue;
		if (i==gmotherF) {
			var gm = hi[gmotherF].count + hi[gmotherM].count;
			str += (gm>1? gm + " " : "") + hi[i].relation + (gm>1? "s" : "");
		}
		else if (count==1 && 
			(i==husband || i==wife || i==father || i==mother || i==gfather || i==gmotherF)) {
			str += hi[i].relation + "; ";
			continue;
		}
		else if (i==nephew) str += (hi[nephew].count + hi[nephewF].count) + " " + hi[i].relation;
		else if (i==uncle) str += (hi[uncle].count + hi[uncleF].count) + " " + hi[i].relation;
		else if (i==cousin) str += (hi[cousin].count + hi[cousinF].count) + " " + hi[i].relation;
		else if (i==gmotherM || i==nephewF || i==uncleF || i==cousinF) continue;
		else str += hi[i].count + " " + hi[i].relation;
		str += "; ";
	}
	return str.replace(/;\s$/, '') + ']';
 }

/**
 *	Generate an heirs count array
 *	@return	a comma-separated string of integers
 */
function getHeirsCount() {
	var hc = [];
	var hi = getHeirsInfo();
	hc.push(0);		//Bequest and treasury counts are always 0
	for (var i=son; i<treasury; i++) {
		hc.push(hi[i].count);
	}
	hc.push(0);	//Bequest and treasury counts are always 0
	var hcstr = hc.toString();
	return hcstr;
}

/**
 *	Get the HeirsCount field value
 *	@return	string content of the field, 26 comma-sparated integers representing 
 *			heir count in each category
 */
function getHeirsCountField() {
	return elements["hc"].value;
}

/**
 *	Set the HeirsCount field value
 *	@param	hc, string of 26 comma-sparated integers representing heir count in each category
 *			Default is computed from current value of HeirsInfo array
 */
function setHeirsCountField(hc) {
	if (hc) elements["hc"].value = hc;
	else elements["hc"].value = getHeirsCount();
}

/**
 *	Get the bequest input
 *	@return	string, expressed as a rational fraction
 */
function getBequest() {
	return elements["bq"].value;
}

/**
 *	Gather the input of heirs and set nheirs[]
 *	Overrides the one in irthui.js because this is a different GUI
 */
function collectInput() {
	var hc = getHeirsCount();
	nheirs = hc.split(',');
	nheirs[bequest] = 0 * 1;
	nheirs[treasury] = 0 * 1;
	if (getBequest()) bequestShare = toRational(getBequest());
	else bequestShare = none;
	existsBequest = !isZero(bequestShare);
	debug("===>collectInput: " + getHeirList());
	getHeirRange();
}

/**
 *	Correct the input of heirs. Redundant because isUpdateHeirsInfo() did that already.
 *	Overrides the one in irthui.js because this is a different GUI
 *	@return	boolean, whether an error in input was detected
 */
function correctInput() {	//returns boolean
	for (var i=son; i<treasury; i++) {
		if (!nheirs[i]) nheirs[i] = 0;
		if ( (nheirs[i]>1) && ((i==husband) || (i==father) || (i==mother) || (i==gfather) ||
			(i==gmotherF) || (i==gmotherM) ) ) 
		{
			detail("<b" + ">" + formatHeir(i) + ":</b" + ">" + displays["_corrected1_"]);
			nheirs[i] = 1;
		}
	}
	if ((nheirs[husband]>0) && (nheirs[wife]>0)) {
		alert(displays["_spouse2_"] + "\n" + displays["_startover_"]);
		return false;
	}
	if (nheirs[wife]>4) {
		detail("<b" + ">" + formatHeir(wife) + ":</b" + ">" + displays["_corrected4_"]);
		nheirs[wife] = 4;
	}
	if (isGt(bequestShare, third)) bequestShare = third;
	return true;
}

/**
 *	Get the selected juristic school
 *	@return	int, selected juristic school
 */
function getSchool() {
	return elements["sc"].value;
}

/**
 *	Set the selected juristic school
 *	@param	school: int, selected juristic school
 */
function setSchool(school) {
	elements["sc"].value = school;
}

/**
 *	Get the selected reversion rule
 *	@return	int, selected reversion rule
 */
function getReversionRule() {
	return elements["rv"].value;
}

/**
 *	Set the selected reversion rule
 *	@param	rule: int, selected reversion rule
 */
function setReversionRule(rule) {
	elements["rv"].value = rule;
}

/**
 *	Get the selected oversubscription rule
 *	@return	int, selected oversubscription rule
 */
function getAwlRule() {
	return elements["aw"].value;
}

/**
 *	Set the selected oversubscription rule
 *	@param	rule: int, selected oversubscription rule
 */
function setAwlRule(rule) {
	elements["aw"].value = rule;
}

/**
 *	Default rv to no reversion if sc is Maliki/Zahiri
 */
function setRudd() {
	if (getSchool()==Maliki || getSchool==Zahiri)
		setReversionRule(0);
}

/**
 *	Default aw to no redivision if sc is Zahiri/Jaafari
 */
function setAwl() {
	if (getSchool()==Zahiri || getSchool==Jaafari)		//Zahiri or Jaafari
		setAwlRule(0);
}
/**
 *	Ensure that hidden field hc is populated
 */
function beforeCalculate() {
	setHeirsCountField();
}

/**
 *	Get a list of the heirs
 *	@return	string of heir categories and their names
 */
 function getHeirsList() {
	return elements["hl"].innerText;
}

/**
 *	Set the HeirsList field value
 *	@param	hl: value to which to set the field
 */
 function setHeirsList(hl) {
	if (hl) elements["hl"].innerText = hl;
	else elements["hl"].innerText = listHeirs();
}

/**
 *	Add an heir, one at a time. Called by the onclick() action of the Add button
 */
function addHeir() {
	var index = elements["rl"].value;	//Relations starts with 1, index starts with 0
	updateHeirsInfo(index);
	setHeirsCountField();
	setHeirsList();
}

/**
 *	Remove an heir, one at a time. Called by the onclick() action of the Remove button
 */
function removeHeir() {
	var index = elements["rl"].value;	//Relations starts with 1, index starts with 0
	updateHeirsInfo(index, -1);
	setHeirsCountField();
	setHeirsList();
}

/**
 *	Redo the heir entry, to correct a mistake or to enter another case.
 */
function redoHeirs() {
	elements["rl"].selectedIndex = 0;
	setHeirsInfo(initializeHeirsInfo());
	setHeirsCountField();
	setHeirsList(" ");
	setDistribution(" ");
	if (resultsWindow) {
		resultsWindow.close();
		resultsWindow = null;
	}
}

/**
 *	Get the content of the distribution field
 *	@return	string, content of the distribution field
 */
function getDistribution() {
	return elements["ed"].innerText;
}
	
/**
 *	Set the content of the distribution field
 *	@param	ed: string, content to set
 */
function setDistribution(ed) {
	elements["ed"].innerText = ed;
}

/**
 *	Display a report of estate distribution in a separate window
 *	Overrides the one in irthui.js because this interface doesn't consider bequests
 */
function displaySharesNS() {		//older, non-IE browsers
	if (!resultsWindow) resultsWindow = open("blank-IGNORE.html","IrthResults");
	var results = 
		"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"" + 
		"><!-- saved from url=(0060)http://www.islamicsoftware.org/irth/v2/inc/blank-IGNORE.html--" +
		"><html" + "><head" + "><title" + ">Irth Results</title" + 
		"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"" + 
		"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/" + 
		"></head" + "><body lang=\"_attrlang_\" dir=\"_attrdir_\" _bodyclass_" + 
		"><b" + ">***** START *****</b" + "><br" + "/>";
	results += "<h2" + ">" + displays["_THEHEIRS_"] + "<" + "/h2>";
	results += getHeirList() + "<br" + "/>";
	
	results += "<h3" + ">" + displays["_Preferences_"] + "<" + "/h3>";
	results += displays["_wizSchool_"] + ": " + schoolNames[school] + "<br" + "/>";
	results += displays["_Reversion_"] + " " + displays["_is_"] + " " + (allowRudd==true? displays["_allowed_"] : displays["_notallowed_"]) + "<br" + "/>";
	results += displays["_Reversion-s_"] + " " + displays["_is_"] + " " + (allowRuddToSpouses==true? displays["_allowed_"] : displays["_notallowed_"]) + "<br" + "/>";
	results += displays["_Redivision_"] + " " + displays["_is_"] + " " + (allowAwl==true? displays["_allowed_"] : displays["_notallowed_"]) + "<br" + "/>";

	results += "<h2" + ">" + displays["_DISTRIBUTION_"] + "<" + "/h2>";
	results += displays["_asfollows_"] + displays["_comma_"] + "<br" + "/>";
	var multiplier;
	var num = 0;
	for (var i=son; i<treasury; i++) {
		num = nheirs[i]-0;
		if (num > 1) {
			multiplier = new Rational(1, nheirs[i]);
			results += "<b" + ">" + formatHeir(i, true) + "</b" + "> " + 
				formatWord("get", num, getHeirGender(i)) + " <b" + ">" + 
				toString(multiply(has(i), multiplier)) + "</b" + "> " + 
				formatWord("each", num, getHeirGender(i)) + "<br" + ">";
		}
		else if (num > 0)
			results += "<b" + ">" + formatHeir(i, true) + "</b" + "> " + 
				formatWord("gets", 1, getHeirGender(i)) + " <b" + ">" + 
				toString(has(i)) + "</b" + "><br" + ">";
	}
	if (!isZero(has(treasury)))
		results += "<b" + ">" + formatHeir(treasury) + "</b" + "> " + displays["_gets_"] + " <b" + ">" + toString(has(treasury)) + "</b" + "><br" + ">";

	if (debugText) results += "<h2" + ">" + displays["_Details_"] + "<" + "/h2>" + debugText;
	results += "<b" + ">" + displays["_END_"] + "</b" + "><br" + "><br" + "></body" + "></html" + ">";

	resultsWindow.document.open();
	resultsWindow.document.write(results);
	resultsWindow.document.close();
	if (typeof resultsWindow.focus != "undefined") resultsWindow.focus();
}

/**
 *	Display a brief share distribution
 *	Overrides the one in irthui.js because this interface doesn't consider bequests
 */
function displayShares() {		//In-line
	var results = displays["_asfollows_"] + displays["_comma_"] + "\n";
	var multiplier;
	var num = 0;
	for (var i=son; i<treasury; i++) {
		num = nheirs[i]-0;
		if (num > 1) {
			multiplier = new Rational(1, nheirs[i]);
			results += formatHeir(i, true) + " " + 
				formatWord("get", num, getHeirGender(i)) + " " + 
				toString(multiply(has(i), multiplier)) + " " + 
				formatWord("each", num, getHeirGender(i)) + ". ";
		}
		else if (num > 0)
			results += formatHeir(i, true) + " " + 
				formatWord("gets", 1, getHeirGender(i)) + " " + 
				toString(has(i)) + ". ";
	}
	if (!isZero(has(treasury)))
		results += formatHeir(treasury) + " " + 
			displays["_gets_"] + " " +
			toString(has(treasury)) + ". ";
	setDistribution(results);
}

/**
 *	Calculate the shares then display a report of estate distribution
 */
function calculate(output) {
	beforeCalculate();
	debugText = "";
	detail("<b" + ">" + displays["_Initializing_"] + "</b" + ">");
	initialize();
	detail("<b" + ">" + displays["_Collecting_"] + "</b" + ">");
	collectInput();		//populates nheirs[] from heir counts string

	//Override values computed in irth.js, because a different GUI is used here
	//bequestShare = none;	//This CGI applies to the remainder of the estate after bequests/debts/expenses
	//existsBequest = false;
	school = getSchool();
	console.log("School: " + school + "\n");
	allowRudd = (getReversionRule()>0);
	console.log("Allow Rudd: " + allowRudd + "\n");
	allowRuddToSpouses = (getReversionRule()==2);
	console.log("Allow Rudd to spouses: " + allowRuddToSpouses + "\n");
	allowAwl = (getAwlRule()>0);
	//End override

	if (correctInput()) {
		detail("<b" + ">" + displays["_Calculating_"] + "</b" + ">");
		if (assertTrue(calculateShares(), displays["_calcerror_"]))
		{
			console.info("Calculation done");
		}
		else {
			console.error("Calculation incomplete");
		}
		detail("<b" + ">" + displays["_Displaying_"] + "</b" + ">");
		displayShares();
		if (output) displaySharesNS();
	}
	else
		console.warn("Error occured during input validation. Please correct and re-try.");
}

/**
	Reset all the fields on the page
 */
function clearFields() {
	elements["rl"].selectedIndex = 0;
	elements["sc"].selectedIndex = 0;
	elements["rv"].value = 1;
	elements["aw"].value = 1;
	elements["bq"].value = "";
	redoHeirs();
	elements["ed"].innerHTML = "&nbsp;";
	if (resultsWindow) {
		resultsWindow.close();
		resultsWindow = null;
	}
	elements["dt"].enabled = false;
	//console.clear();
}
