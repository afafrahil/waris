/**
 *	Islamic Inheritance Calculator, IRTH
 *	Terms: License type: Creative Commons CC-BY-NC-ND. May NOT be sold, but may be freely distributed, as long as the code is unchanged and this header is included and kept unchanged.
 *	@author	IslamicSoftware.org
 *	@version 2.0
 *	@since	October, 2020
 */

//Load rational.js before this file

/**
 * 	Constant rational fractions
 *	@see	Rational
 */
whole = new Rational(1,1);
none = new Rational(0,1);
twothirds = new Rational(2,3);
half = new Rational(1,2);
third = new Rational(1,3);
quarter = new Rational(1,4);
sixth = new Rational(1,6);
eighth = new Rational(1,8);

var debugText = "";
var theLanguage = "";

/**
 *	@return	a negative rational unit used to indicate a share to be determined by agnation
 */
function toshare() {			//defining it as a constant didn't work!
	return new Rational(-1,1);
}

/**
 *	Constant indeces of heir categories
 */
bequest = 0;
son = 1;		daughter = 2;	father = 3;		mother = 4;
husband = 5;	wife = 6;		brother = 7;	sister = 8;		
siblingM = 9;	gson = 10;		gdaughter = 11;	gfather = 12;
gmotherF = 13;	uncle = 14;		uncleF = 15;	brotherF = 16;
sisterF = 17;	relativeM = 18;	nephew = 19;	nephewF = 20;
gmotherM = 21;	cousin = 22;	cousinF = 23;	servant = 24;
treasury= 25;
numcats = 26;

/**
 *	Heir categories of named heirs
 *	Include husband but not father since he also is an agnate 
 */
namedHeirs = [daughter,gdaughter,father,mother,gmotherF,gmotherM,sister,sisterF,siblingM,husband,wife];
//Father's share is the sum of his named share and his agnate share

/**
 *	Heir categories of agnate heirs 
 */
agnateHeirs = [son,gson,father,gfather,brother,brotherF,relativeM,nephew,nephewF,uncle,uncleF,cousin,cousinF,servant];
//relativeM is not an actual agnate. We put them here because they may inherit the remainder
//Father's share is the sum of his named share and his gnate share

/**
 *	Tiers of heirs, as defined by the Jaafari juristic school
 */
tiersJ = [
	[son,daughter,father,mother,gson,gdaughter],
	[brother,sister,gfather,gmotherF,gmotherM,brotherF,sisterF,siblingM,nephew,nephewF],
	[uncle,uncleF,relativeM,cousin,cousinF],
	[servant]
];
//In Jaafari school, spouses always inherit but they don't deprive anyone

/**
 *	Logs a debugging text to the console
 *	@param	msg: debugging string to log
 */
function debug(msg) {
	console.log("[debug] " + msg + "\n");
}

/**
 *	Appends a string of detail to the global variable debugText
 *	@param	msg: detail string to log
 *	@see	#debugText
 */
function detail(msg) {
	debugText += msg + "<br" + "/>";
	console.log(msg + "\n");
}

/**
 *	User preference whether to allow reversion
 */
var allowRudd = true;
/**
 *	User preference whether to allow reversion to spouses
 */
var allowRuddToSpouses = false;
/**
 *	User preference whether to allow redivision
 */
var allowAwl = true;

/**
 *	User preference for a jusristic school of thought (Mazhab)
 */
Hanafi = 1;	Maliki = 2;	Shafii = 3;	Hanbali = 4;
Egypt = 5;
Zahiri = 6;
Jaafari = 7;	Ibadhi = 8;	Zaidi = 9;
numschools = 9;
var school = Hanafi;
schoolNames = [displays["_none_"], displays["_Hanafi_"], displays["_Maliki_"], displays["_Shafii_"], displays["_Hanbali_"], displays["_Egypt_"], displays["_Zahiri_"], displays["_Jaafari_"], displays["_Ibadhi_"], displays["_Zaidi_"]];

var nheirs = [];
var shares = [];	//IE doesn't understand new Array(numcats)
var firstHeir = 0;	var lastHeir = 0;
var fasab = false;	//Flag if there's female agnates with other females
var bequestShare = none;
var remain = whole;	var sum = none;

/**
 *	Initializes global variables
 */
function initialize() {
	nheirs = [];
	shares = [];
	for (var i=0; i<numcats; i++) {
		nheirs.push(0*1);
		shares.push(none);
	}
	fasab = false;
	remain = whole;	sum = none;
	bequestShare = none;
	firstHeir = 0;	lastHeir = 0;
}

/**
 *	Asserts whether a condition is true. Alerts if it's not
 *	@param	condition: boolean
 *	@param	errmsg: error message string
 *	@return	value of condition param above 
 */
function assertTrue(condition, errmsg) {
	if (condition==false) {
		alert(displays["_BUG_"] + ":\n" + errmsg + "\n" + displays["_reportit_"]);
		debug("[ERROR] " + errmsg + ":\n" + stringifyCase());
	}
	return condition;
}

baseKeysSingular = ['Bequest','Son','Daughter','Father','Mother','Husband','Wife','Brother','Sister','Siblingm','Grandson','Granddaughter','Grandfather','Grandmotherf','Uncle','Unclef','Brotherf','Sisterf','Relativem','Nephew','Nephewf','Grandmotherm','Cousin','Cousinf','Servant'];
baseKeysPlural = ['Bequest','Sons','Daughters','Father','Mother','Husband','Wife','Brothers','Sisters','Siblingsm','Grandson','Granddaughter','Grandfather','Grandmotherf','Uncles','Unclesf','Brothersf','Sistersf','Relativesm','Nephews','Nephewsf','Grandmotherm','Cousins','Cousinsf','Servants'];
//Dual adds a '2' after the plural

/**
 *	@return boolean. True if a male descendant survived
 */
function isMaleDesc() {
	return (nheirs[son]>0) || (nheirs[gson]>0);
}

/**
 *	@return boolean. True if a female descendant survived
 */
function isFemaleDesc() {
	return (nheirs[daughter]>0) || (nheirs[gdaughter]>0);
}

/**
 *	Whether an heir is the spouse of the decedent
 *	@param	h: int, index of the heir
 *	@return	boolean
 */
function isSpouse(h) {
	return (h==husband) || (h==wife);
}

/**
 *	Whether an element is in a given array
 *	@param	a: the array
 *	@param	e: the element
 *	@param	boolean
 */
function inArray(a, e) {
	var ret = false;
	if (typeof Array.indexOf == 'undefined') {
		for (var i=0; i<a.length; i++) {
			if (a[i] == e) {
				ret = true;
				break;
			}
		}
	}
	else ret = a.indexOf(e) != -1;
	return ret;
}

/**
 *	Jaafari tier of an heir
 *	@param	h: index of the heir
 *	@return	int, index in #tiersJ array of the tier that has heir h, or -1 if not found (e.g., spouses)
 */
function tierJof(h) {
	var t = -1;
	for (var n=0; n<4; n++)
		if (inArray(tiersJ[n], h)) {
			t = n;
			break;
		}
	return t;
}

/**
 *	Are there surviving heirs in a given tier?
 *	@param	n: int, tier number, 0-3
 *	@return	boolean: true if there are or if a spouse survived
 */
function isTierJ(n) {
	if (n<0 || n>3) return false;
	var ret = false;
	for (var h=0; h<tiersJ[n].length; h++) {
		if (nheirs[h]>0) {
			ret = true;
			break;
		}
	}
	return ret || (nheirs[husband]>0) || (nheirs[wife]>0);
}

/**
 *	Are there survivors in a highter tier?
 *	@param	h: int, index of the given heir
 *	@return	boolean.
 */
function isHigherTierJ(h) {
	var t = tierJof(h);
	if (t==0) return false;
	else if (t<0) return true;	//Spouses
	else if (isTierJ(t-1) || isTierJ(t-2) || isTierJ(t-3)) return true;
	else return false;
}

/**
 *	Get the gender of an heir
 *	@param	h: int, index of the heir in the heirs categories array
 *	@return	"F" for female, or "" otherwise
 */
function getHeirGender(h) {
	if (h==daughter || h==gdaughter || h==mother || h==wife || h==gmotherF || h==gmotherM || h==sister || h==sisterF) return "F";
	else return "";
}

/**
 *	Conjugate a non-noun word for the number and the gender of its related subject/object
 *	@param	word: string, the word to conjugate, e.g., "get", or "each"
 *	@param	count: int, the number of the word's related subject or object, e.g., 1, 2, 3...
 *	@param	gender: string, either "F" or ""
 *	@return	string: key for conjugated word, e.g., "get2F", "eachF", ...
 *					if key is not found in resource bundle, use the word param as is
 */
function conjugateWord(word, count, gender) {
	var suffix = "";
	var c = (null != count)? count : 1;
	var g = (null != gender)? gender : "";
	if (2==c) suffix += "2";
	//else word is either singular or plural, e.g. "gets", "get"
	if ("F"==g) suffix += "F";
	console.log("conjugateWord(" + word + "," + c + "," + g + ") = " + word+suffix + "\n");
	var ret = word + suffix;
	if (typeof displays["_"+ret+"_"] == "undefined") ret = word;
	return ret;
}

/**
 *	Lookup in resource bundle for a key generated by formatting a non-noun word in the local language
 *	@param	word: string, the word to conjugate, e.g., "gets", or "each"
 *	@param	count: int, the number of the word's related subject or object, e.g., 1, 2, 3...
 *	@param	gender: string, either "F" or ""
 *	@return	string: vaue associated with conjugated word key, e.g., value of "get2F", or "eachF", ...
 *					if key is not found in resource bundle, use the word param as is
 */
function formatWord(word, count, gender) {
	var conj = conjugateWord(word, count, gender);
	var ret = displays["_"+conj+"_"];
	if (typeof ret == "undefined") ret = word;
	return ret;
}

/**
 *	Conjugate a noun, e.g., "Brother"
 *	@param	noun: string, the noun to conjugate
 *	@param	definitive: boolean, true for definite, or false for indefinite
 *	@param	count: int, number of the noun, e.g., 1,2,3...
 *	@param	declination: string, "O" for objective, "G" for genitive, or "" for subjective
 *	@return	string: the key of the conjugated noun, e.g., "Brothers2DO" for two brothers as definite objects
 *					if the key is not found in resource bundle, return the noun param
 */
function conjugateNoun(noun, definitive, count, declination) {
	var suffix = "";
	var df = (null != definitive) && definitive;
	var c = (null != count)? count : 1;
	var dc = (null != declination)? declination : "";
	console.log("Conjugating noun: " + noun + "(" + (df?'D':'')+c+(dc?declination:'') + ")...");
	if (2==c) suffix += "2";	//noun is either singular or plural
	if (df) suffix += "D";
	//Declination: 'O' object, 'G' genitive, '' subject
	if (dc) suffix += dc;
	var ret = noun + suffix;
	console.log("conjugateNoun(" + noun + "," + df + "," + c + "," + dc + ") = " + noun+suffix + "\n");
	if (typeof displays["_"+ret+"_"] == "undefined") ret = noun;
	return ret;
}

/**
 *	Conjugate an heir category, e.g., brother
 *	@param	heir: int, the index of the heir in the heirs categories array
 *	@param	definitive: boolean
 *	@param	declination: string, "O" for objective, "G" for genitive, or "" for subjective
 *	@return	string: key for conjugated heir category, e.g., "Brother2DG"
 *	@see	#conjugateNoun(string, boolean, int, string)
 */
function conjugateHeir(heir, definitive, declination) {
	var df = (null != definitive) && definitive;
	var dc = (null != declination)? declination : "";
	console.log("Conjugating heir " + heir + "("+df+dc+")...");
	if (nheirs[heir]==1) ret = conjugateNoun(baseKeysSingular[heir], df, 1, dc);
	else ret = conjugateNoun(baseKeysPlural[heir], df, nheirs[heir], dc);
	return ret;
}

/**
 *	Format an heir category in the local language
 *	@param	h: int, index of the heir in the heirs categories array
 *	@param	definitive: boolean, whether to add the definitive article
 *	@param	declination: string, "O" for objective, "G" for genitive or "" fr subjective
 *	@return	string: value associated with the formatted heir category key
 */
function formatHeir(h, definitive, declination) {
	if (h==0) return displays["_Bequest" + definitive? "D" : "" + "_"];
	else if (h==treasury) return displays["_Treasury_"];
	else return displays["_" + conjugateHeir(h, definitive, declination) + "_"];
}

/**
 *	Localize display of a rational fraction
 *	@param	rational_fraction: Rational, e.g. third or whole
 *	@return	string: printed local value of rational_fraction, e.g. "1/3" or "ALL"
 */
 function toLangFraction(rational_fraction) {
	var frac = displays["_frac" + toString(rational_fraction) + "_"];
	if (typeof frac == "undefined")
		return toString(rational_fraction);
	else return frac;
}

/**
 *	@return	string: value of the translation cookie, e.g., "/en/de", or "" if reset
 */
function getTranslationCookie() {
	getCookieValue("googtrans");
}

/**
 *	@return	string: Language code of the target value specified in the translation cookie, or "" if reset
 */
function getTranslationCookieTargetLanguage() {
	var tc = getTranslationCookie();
	if (tc) return tc.substr(4);
	else return "";
}

/**
 *	@return	string: language code for the page language, passed in the query string
 */
function getPageLanguage() {
	var args = getArgs();
	if (args && args["lang"]) return args["lang"];
	var langcode = getTranslationCookieTargetLanguage();
	if (langcode) return langcode;
	else return document.body.lang;
}

/**
 *	Sets the lang attribute for the page, passed in the query string or specified in resource bundle
 */
function setPageLanguage() {
	if (!document.body.lang)
		document.body.lang = getPageLanguage();
}

/**
 *	@return	boolean: if page language direction is RTL, passed in the query string
 */
function isPageLanguageDirectionRTL() {
	var ret = false;
	var args = getArgs();
	if (args) {
		var dir = args["dir"];
		if (dir) ret = (dir=="rtl");
	}
	return ret;
}

/**
 *	Expires the translation cookie
 */
function expireTranslationCookie() {
	JSONcookie.del("googtrans");
}

/**
 *	Sets the translation cookie value
 *	@param	targetLanguageCode: string, e.g., "fr" for French, or "" to expire the cookie
 */
function setTranslationCookie(targetLanguageCode) {
	if ("en"==targetLanguageCode) return;
	else if (""==targetLanguageCode) expireTranslationCookie();
	else setCookie("googtrans", "/en/"+targetLanguageCode);
}

/**
 *	Assigns a share to an heir
 *	@param	h: int, heir index
 *	@param	sh: Rational. The share
 *	@param	msg: string. Info text related to the share assignment (optional)
 *	@see	Rational
 */
function gets(h, sh, msg) {
	if (nheirs[h]==1 || h==treasury || h==bequest) {
		//Never use gets(bequest). Use bequestShare instead
		if (!isZero(sh)) detail(
			formatHeir(h, true, '') + 
			" " + 
			formatWord("gets", 1, getHeirGender(h)) + 
			" " + 
			toLangFraction(sh) + 
			(msg? msg : "")
		);
		else detail(
			formatHeir(h, true, '') + 
			" " + 
			formatWord("gets0", 1, getHeirGender(h)) + 
			" " + 
			(msg? msg : "")
		);
		shares[h] = sh;
	}
	else if (nheirs[h]>1) {
		if (!isZero(sh)) detail(
			formatHeir(h, true, '') + 
			" " + 
			formatWord("get", nheirs[h], getHeirGender(h)) + 
			" " + 
			toLangFraction(sh) + 
			" " +
			(msg? msg : "")
		);
		else detail(
			formatHeir(h, true, '') + 
			" " + 
			formatWord("get0", nheirs[h], getHeirGender(h)) + 
			" " + 
			(msg? msg : "")
		);
		shares[h] = sh;
	}
	else {
		shares[h] = none;
	}
	debug("Giving " + h + " (" + nheirs[h] + ") " + toString(sh));
}

/**
 *	Returns an heir's share
 *	@param	h: int, heir index
 *	@return	Rational. The heir's share
 *	@see	Rational
 */
function has(h) {
	if (h==bequest) {
		//Never use has(bequest). Use bequestShare instead
		debug(formatHeir(h, false, '') + " " + displays["_has_"] + " " + toString(bequestShare));
		return bequestShare;
	}
	else if (h==treasury) {
		debug(formatHeir(h, false, '') + " " + formatWord("has", 1, '') + " " + toString(shares[treasury]));
		return shares[treasury];
	}
	else if (nheirs[h]==1) {
		debug(formatHeir(h, false, '') + " " + formatWord("has", 1, '') + " " + toString(shares[h]));
		return shares[h];
	}
	else if (nheirs[h]>1) {
		debug(formatHeir(h, false, '') + " " + formatWord("have", nheirs[h], getHeirGender(h)) + " " + toLangFraction(shares[h]));
		return shares[h];
	}
	else return none;
}

/**
 *	Asserts invariants, such as sons always inherit, etc.
 */
function sanityCheck() {
	var sane = true;
	if (nheirs[son]>0) sane = sane && ensure(!isZero(has(son)), displays["_sonsfail_"]);
	if (nheirs[daughter]>0) sane = sane && ensure(!isZero(has(daughter)), displays["_daughtersfail_"]);
	if (nheirs[mother]>0) sane = sane && ensure(!isZero(has(mother)), displays["_motherfail_"]);
	if (nheirs[father]>0) sane = sane && ensure(!isZero(has(father)), displays["_fatherfail_"]);
	if (nheirs[husband]>0) sane = sane && ensure(!isZero(has(husband)), displays["_husbandfail_"]);
	if (nheirs[wife]>0) sane = sane && ensure(!isZero(has(wife)), displays["_wifefail_"]);
	return sane;
}

/**
 *	Whether an heir is set to share by agnation
 *	@param	h: heir index, int
 *	@return	true if the heir is set to share by agnation, false otherwise
 */
function isToShare(h) {
	if (nheirs[h] > 0) {
		var sh = has(h);
		var b = (sh.num < 0) && (sh.denom >= 1);
		if (nheirs[h] == 1) debug(formatHeir(h, true, '') + (b? " is set to share" : " is not set to share"));
		else debug(formatHeir(h, true, '') + (b? " are set to share" : " are not set to share"));
		return b;
	}
	else return false;
}

/**
 *	Whether an heir survived and has no share
 *	@param	h: int, heir index
 *	@return	boolean
 */
function isVoid(h) {
	return (nheirs[h]==0 || isZero(has(h)));
}

/**
 *	Deprives an heir of a share
 *	@param	h: int, heir index
 *	@param	reason: string, the reason for the depriving
 */
function deprive(h, reason) {
	if (nheirs[h] == 0) return;
	if (nheirs[h] == 1) 
		detail(formatHeir(h, true, '') + " " + displays["_deprived_"] + " " + (reason? reason : ""));
	else detail(formatHeir(h, true, '') + " " + displays["_depriveds_"] + " " + (reason? reason : ""));
	gets(h, none);
}

/**
 *	Deprives a range of heirs of a share
 *	@param	h1, h2: int, fisrt and last indexes of heirs
 *	@param	reason: string, the reason for the depriving
 */
function depriveRange(h1, h2, reason) {
	if (reason) 
		for (var i=h1; i<=h2; i++)
			deprive(i, reason);
	else for (var i=h1; i<=h2; i++)
		deprive(i);
}

/**
 *	Deprives all heirs in lower tiers in Jaafari juristic school
 */
function depriveJ() {
	for (var i=brother; i<=servant; i++)		//Tiers 1-3
		if (isHigherTierJ(i)) deprive(i, " (" + displays["_Jaafari_"] + ")");
}

/**
 *	Whether the case is a "kalala" situation, i.e., no male descendants nor male ascendants
 *	The Jaafari school does not count grandfathers in the kalala determination
 *	@return	boolean
 */
function isKalala() {
	var ret = nheirs[son] + nheirs[father] + nheirs[gson];
	if (school != Jaafari) ret += nheirs[gfather];
	if (ret==0 && school==Jaafari) detail(displays["_kalalaJgfOK_"]);
	else if (ret==0) detail(displays["_iskalala_"]);
	return (ret==0);
}

/**
 *	@return	Whether the jusristic school is Maliki, Shafii or Hanbali
 */
function isMSB() {
	return (school==Maliki) || (school==Shafii) || (school==Hanbali);
}

/**
 *	@return	Whether the case is of a grandfather and siblings
 */
function isGFB() {
	var numbro = nheirs[brother]-0 + nheirs[brotherF]-0;
	debug("isGFB: numbro = " + numbro);
	return (nheirs[gfather]>0) && (numbro>0);
}

/**
 *	@return	Whether the case is of a grandfather and sisters
 */
function isGFS() {
	var numbro = nheirs[brother]-0 + nheirs[brotherF]-0;
	var numsis = nheirs[sister]-0 + nheirs[sisterF]-0;
	debug("isGFS: numbro = " + numbro + ", numsis = " + numsis);
	return (nheirs[gfather]>0) && (numbro==0) && (numsis>0);
}

/**
 *	@return	boolean: Whether the case matches the "Mushtarika" case
 */
function isMushtarika() {
	return !isMaleDesc() && !isFemaleDesc() && (nheirs[siblingM]>0) &&
		(school==Maliki || school==Shafii || school==Zaidi) &&
		(nheirs[husband]>0) && (nheirs[mother]>0) &&
		isVoid(gfather) &&
		!isVoid(brother) && isVoid(sister);
}

/**
 *	@return	boolean: Whether the case has "female agnation", i.e., 
 *			a daughter, daughters of sons and sisters (full or from father)
 */
function isFemaleAgnation() {
	var fa = (nheirs[daughter]==1) && (nheirs[gdaughter]>0) && (nheirs[sister]>0);
	var faF = (nheirs[daughter]==1) && (nheirs[gdaughter]>0) && (nheirs[sisterF]>0);
	return fa || faF;
}

/**
 *	@return	Whether a bequest has been specified
 */
function isBequest() {
	return isGt(bequestShare, none);
}

/**
 * 	Sums up all given shares (not including amount to be shared)
 * 	and sets the global variables sum and remain.
 * 	Notice that calculation is done on estate, which is one less any bequest.
 * 	@see	#sum
 * 	@see	#remain
 */
function sumUp() {
	var summ = none;
	for (var i=firstHeir; i<=lastHeir; i++) {
		if ((nheirs[i]>0) && !isToShare(i)) 		//add only unmarked shares
			summ = add(summ, has(i));
	}
	summ = add(summ, shares[treasury]);
	sum = summ;
	remain = subtract(whole,sum);
}

/**
 *	Log the current sum of shares and the remainder on the details document
 *	@param	stage: string, optional. Stage so far of the calculation
 */
function logSumAndRemain(stage) {
	detail((stage? "["+stage+"]" : "") + displays["_sumnow_"] + ": " + toLangFraction(sum) + displays["_comma_"] + " " + displays["_remainnow_"] + ": " + toLangFraction(remain));
}

/**
 *	Whether the sum of shares adds up to the entrire estate
 *	@return	boolean: true if the sum of share distributions equals the entire estate
 *	@see	#sumUp()
 */
function addsUp() {
	sumUp();
	return isZero(remain);
}

/**
 *	Calculate what remains of the estate not yet distributed
 *	@return	Rational, the remainder
 *	@see	#sumUp()
 */
function calculateRemainder() {
	detail(displays["_calcremain_"]);
	sumUp();
	return remain;
}

/**
 *	Whether the share distribution exceeds the estate
 *	@return	boolean: true if the share distribution exceeds the estate
 *	@see	#sumUp()
 */
function isOversubscribed() {
	sumUp();
	return isGt(sum, whole);
}

/**
 *	Whether the share distribution is less than the entire estate
 *	@return	true if the share distribution is less than the entire estate
 *	@see	#sumUp()
 */
function isUndersubscribed() {
	sumUp();
	return isLt(sum, whole);
}

/**
 *	Whether an heir is eligible for reversion (Rudd)
 *	@param	h: int, heir index
 *	@return	boolean, true if h is eligible for reversion and reversion is allowed
 */
function isRevertTo(h) {
	if (allowRudd==false) {
		return false;
	}
	var b = (h==daughter) || (h==gdaughter) || (h==mother) || (h==gmotherF) || (h==gmotherM) || 
		(h==sister) || (h==sisterF) || (h==siblingM);
	if (allowRuddToSpouses==true) {
		detail(displays["_rev2_"]);
		b = b || (h==husband) || (h==wife);
	}
	if (!isVoid(h) && (nheirs[h]==1)) 
		detail(
			formatHeir(h, true, '') + 
			" " + 
			(b? formatWord("doesrudd", 1, getHeirGender(h)) : formatWord("doesnotrudd", 1, getHeirGender(h)))
		);
	else if (!isVoid(h) && (nheirs[h]>1))
		detail(
			formatHeir(h, true, '') + 
			" " + 
			(b? formatWord("dorudd", nheirs[h], getHeirGender(h)) : formatWord("donotrudd", nheirs[h], getHeirGender(h)))
		);
	return b;
} 

/**
 *	Get a list of heir categories entered by the user
 *	@return	an array of int indexes of heirs entered by the use
 */
function getHeirList() {
	var heirList = "";
	for (var j=son; j<treasury; j++) {
		if (nheirs[j]>0) {
			if (nheirs[j]<=2) heirList += formatHeir(j, false, '') + displays["_semicolon_"] + " ";
			else heirList += nheirs[j] + " " + formatHeir(j, false, '') + displays["_semicolon_"] + " ";
		}
	}
	debug("===>getHeirList: " + heirList);
	if (heirList.length<2) return displays["_Noheirs_"];
	else return heirList.slice(0,-2);
}

/**
 *	Determine the first and last heirs entered by the user. Set the global
 *	variables firstHeir and lastHeir accordingly
 */
function getHeirRange() {
	firstHeir = 0;
	for (var i=son; i<treasury; i++) {
		if (nheirs[i]>0) {
			firstHeir = i;
			break;
		}
	}
	lastHeir = 0;
	for (var j=son; j<treasury; j++) {
		if (nheirs[j]>0) {
			lastHeir = j;
		}
	}
	if ((firstHeir>0) && (lastHeir<treasury))
		debug("First heir is " + formatHeir(firstHeir) + " and last heir is " + formatHeir(lastHeir));
}

/**
 *	Cite a rule in the details window
 *	@param	ruleKey: string, the key to the rule stated in the resource bundle
 */
function citeRule(ruleKey) {
	detail(rules[ruleKey]);
}

/**
 *	Add a specific explanation to the details window
 *	@param	explanationKey: string, the key to the explanation in the resource bundle
 */
function explain(explanationKey) {
	detail(explanations[explanationKey]);
}

/**
 *	Inheritance rules for the named heirs
 *	@param	h: int, index of heir for whom to calculate inheritance
 *			Calculations are stored in a global array of Rationals
 *	@see	#shares[]
 *	@version 2.0
 *	@since	September 2020
 */
function calcNamedShare(h) {
	ensure(h>0 && h<=treasury, h + displays["_invalidheir_"]);
	var n = nheirs[h];
	if (n==0) {
		shares[h] = none;
		return;
	}
	if (n <= 2) 
		detail("<br/" + ">" + displays["_calcnamed1_"] + " " + formatHeir(h, true, 'G'));
	else 
		detail("<br/" + ">" + displays["_calcnamed1_"] + " " + formatHeir(h, true, 'G') + " (" + n + ")");
	var sh = none;
	switch(h) {
	case daughter:
		citeRule("_Daughter_");
		if (nheirs[son]>0) {
			detail(displays["_daughters12_"]);
			sh = multiply(toshare(), half);
			gets(son,toshare());
		}
		else if (school==0 && nheirs[gson]>0) {
			detail(displays["_gsons1_"]);
			detail(displays["_gsons21d_"]);
			sh = multiply(toshare(), half);
			gets(gson,toshare());
		}
		else {
			detail(displays["_daughters_"]);
			if (n==1) sh = half;
			else sh = twothirds;
		}
		ensure(sh && !isZero(sh), displays["_xdaughters_"]);
		break;
	case gdaughter:
		citeRule("_Granddaughter_");
		if (nheirs[daughter]>0 && school==Jaafari) {
			sh = none;
			detail(displays["_nochptJ_"]);
		}
		else if (nheirs[son]>0 && nheirs[gson]==0) {
			sh = none;
			detail(displays["_gdaughters0_"])
		}
		else if ((nheirs[daughter]>1) && (nheirs[gson]==0)) {
			sh = none;
			detail(displays["_gdaughters0a_"]);
		}
		//else if (nheirs[gson]>0 && nheirs[daughter]==0) {
		else if (nheirs[gson]>0 && nheirs[daughter]<2 && nheirs[son]==0) {
			detail(displays["_gdaughters1d_"]);
			detail(displays["_gdaughters12gs_"]);
			sh = multiply(toshare(), half);
			gets(gson,toshare());
		}
		else if (nheirs[daughter]==1 && !isMaleDesc()) {
			fasab = true;
			detail(displays["_fasaba_"]);
			sh = sixth;	
		}
		else if (nheirs[daughter]>1 && !isMaleDesc()) {
			detail(displays["_nofasaba_"]);
			sh = none;
		}
		else if (!isMaleDesc()) {
			detail(displays["_gdaughters_"]);
			if (n==1) sh = half;
			else sh = twothirds;
		}
		else {
			detail(displays["_gdaughters0b_"])
			sh = none;
		}
		break;
	case father:
		citeRule("_Father_");
		//He can have a named share and/or an agnate share
		//Descendants
		if (isMaleDesc()) {	
			detail(displays["_father6_"]);
			sh = sixth;
		}
		else if (isFemaleDesc()) {
			detail(displays["_father6a_"]);
			sh = sixth;	//May add an agnate share later
		}
		else sh = toshare();
		break;
	case mother:
		citeRule("_Mother_");
		deprive(gmotherF, displays["_mrdeprives_"]);
		deprive(gmotherM, displays["_mrdeprives_"]);
		var numsib = nheirs[brother]*1 + nheirs[sister]*1 + nheirs[siblingM]*1 + nheirs[brotherF]*1 + nheirs[sisterF]*1;
		detail(displays["_numsib_"] + " = " + numsib);
		if (isMaleDesc()||isFemaleDesc()) {	//Descendants
			detail(displays["_mother6_"]);
			sh = sixth;
		}
		else if ((numsib-0)>1) {	//No descendants but siblings
			if (school==Zahiri && (numsib-0)<3) {
				sh = third;
				detail(displays["_mother3Z_"]);
			}
			else {
				sh = sixth;
				detail(displays["_mother3C_"]);
			}
			if (school==0) {
				if ((numsib-0)==1) {	//Whoever it is gets the reduced sixth
					detail(displays["_sibling6_"]);
					if (nheirs[brother]==1) gets(brother,sixth);
					else if (nheirs[brotherF]==1) gets(brotherF,sixth);
					else if (nheirs[sister]==1) gets(sister,sixth);
					else if (nheirs[sisterF]==1) gets(sisterF,sixth);
					else if (nheirs[siblingM]==1) gets(siblingM,sixth);
				}
				else {	//They share in the reduced sixth
					detail(displays["_siblings3_"]);
					if (nheirs[brother]>0) 
						gets(brother, multiply(sixth, new Rational(nheirs[brother], numsib)));
					if (nheirs[brotherF]>0) 
						gets(brotherF, multiply(sixth, new Rational(nheirs[brotherF], numsib)));
					if (nheirs[sister]>0) 
						gets(sister, multiply(sixth, new Rational(nheirs[sister], numsib)));
					if (nheirs[sisterF]>0) 
						gets(sisterF, multiply(sixth, new Rational(nheirs[sisterF], numsib)));
					if (nheirs[siblingM]>0) 
						gets(siblingM, multiply(sixth, new Rational(nheirs[siblingM], numsib)));
				}
				detail(displays["_siblings6_"]);
			}
		}
		else if (nheirs[father]>0) {	//No siblings
			if (school==Zahiri) {
				sh = third;
				detail(displays["_mother3z_"]);
			}
			//Al-Gharraia, or the Two Omarias
			else if (nheirs[husband]>0) {
				gets(husband, half);
				detail(displays["_husband2_"]);
			}
			else if (nheirs[wife]>0) {
				gets(wife, quarter);
				detail(displays["_wife4_"]);
			}
			sh = multiply(remain, third);
			detail(displays["_mother3c_"]);
		}
		else {
			sh = third;
			detail(displays["_mother3_"]);
		}
		ensure(sh && !isZero(sh), displays["_xmother_"]);
		break;
	case gmotherF:
		citeRule("_Grandmother_");
		if (nheirs[mother]>0) {
			sh = none;
			detail(displays["_gmother0_"]);
		}
		else if (school == Jaafari) {
			sh = sixth;
			detail(displays["_gmotherJ_"]);
		}
		else if (nheirs[gmotherM]>0) {
			var g = getGmGen();
			if (2==g && nheirs[mother]==0 && school!=0) {
				sh = none;
				detail(displays["_gmotherF0My_"]);
			}
			else if (1==g && school!=0) {
				sh = sixth;
				detail(displays["_gmotherF6y_"]);
			}
			else {
				sh = new Rational(1,12);
				detail(displays["_gmother6_"]);
			}
		}
		else if (school==Zahiri) {
			//Gets what the mother gets: 1/3 or 1/6.
			if ((numsib-0)>2) sh = sixth;
			else sh = third;
			detail(displays["_gmother36Z_"]);
		}
		else {
			sh = sixth;
			detail(displays["_gmotherF6M0_"]);
		}
		break;
	case gmotherM:
		citeRule("_Grandmother_");
		if (nheirs[mother]>0) {
			sh = none;
			detail(displays["_gmother0_"]);
		}
		else if (school == Jaafari) {
			sh = sixth;
			detail(displays["_gmotherJ_"]);
		}
		else if (nheirs[gmotherF]>0) {
			g = getGmGen();
			if (1==g && (school==Hanafi || school==Hanbali)) {
				sh = none;
				detail(displays["_gmotherM0Fy_"]);
			}
			else if (2==g) {
				sh = sixth;
				detail(displays["_gmotherM6y_"]);
			}
			else {
				sh = new Rational(1,12);
				detail(displays["_gmother6_"]);
			}
		}
		else {
			sh = sixth;
			detail(displays["_gmotherM6F0_"]);
		}
		break;
	case husband:
		citeRule("_Husband_");
		if (isMaleDesc()||isFemaleDesc()) {
			sh = quarter;
			detail(displays["_husband4_"]);
		}
		else {
			sh = half;	
			detail(displays["_husband2_"]);
		}
		ensure(sh && !isZero(sh), displays["_xhusband_"]);
		break;
	case wife:
		citeRule("_Wife_");
		if (isMaleDesc()||isFemaleDesc()) {
			sh = eighth;
			detail(displays["_wife8_"]);
		}
		else {
			sh = quarter;
			detail(displays["_wife4_"]);
		}
		ensure(sh && !isZero(sh), displays["_xwife_"]);
		break;
	case sister:
		citeRule("_FullSister_");
		if (nheirs[father]>0) {
			sh = none;
			detail(displays["_sisters0_"]);
		}
		else if (school == Jaafari && isHigherTierJ(sister)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (nheirs[gfather]>0 && (school==Hanafi || school==Zahiri || school==Ibadhi)) {
			sh = none;
			detail(displays["_sisters0HZI_"]);
		}
		else if (isGFS() && (school==Egypt || isMSB())) {
			sh = multiply(toshare(), half);	//agnates in Zaid's and Ali's opinions
			detail(displays["_sistersMSB_"]);
		}
		else if (school==0 && isKalala() && !isFemaleDesc() && (nheirs[husband]+nheirs[wife])>0) {	//4:12
			detail(displays["_kalala1_"]);
			citeRule("_Kalala_");
			var numsis = n-0 + nheirs[sisterF];
			var numbro = nheirs[brother]-0 + nheirs[brotherF]-0;
			var numsib = numbro-0 + numsis-0 + nheirs[siblingM]-0;
			if (n==1 && numsib==1) sh = sixth;	//One sister and no other siblings
			else {	//Sisters and a number of other siblings
				var multis = new Rational(n, numsib);
				sh = multiply(multis, third);
				var multib = new Rational(nheirs[brother], numsib);	//equal ratio to sister
				gets(brother, multiply(multib, third));
				var multibf = new Rational(nheirs[brotherF], numsib);	//equal ratio to sister
				gets(brotherF, multiply(multibf, third));
				var multism = new Rational(nheirs[siblingM], numsib);	//equal ratio to sister
				gets(brother, multiply(multism, third));
			}
		}
		else if (nheirs[brother]>0) {
			sh = multiply(toshare(), half);
			gets(brother, toshare());
			detail(displays["_sisters12_"]);
		}
		else if (isFemaleDesc()) {
			sh = toshare();
			fasab = true;
			detail(displays["_fasabasis_"]);
		}
		else if (n==1) {
			sh = half;
			detail(displays["_sisters2_"]);
		}
		else {
		 	sh = twothirds;
			detail(displays["_sisters23_"]);
		}
		break;
	case sisterF:
		citeRule("_HalfSister_");
		if (nheirs[father]>0) {
			sh = none;
			detail(displays["_sistersF0_"]);
		}
		else if (school == Jaafari && isHigherTierJ(sisterF)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (nheirs[gfather]>0 && (school==Hanafi || school==Zahiri || school==Ibadhi)) {
			sh = none;
			detail(displays["_sistersFHZI_"]);
		}
		else if (school==0 && isKalala() && !isFemaleDesc() && (nheirs[husband]+nheirs[wife])>0) {
			detail(displays["_kalala1_"]);
			citeRule("_Kalala_");
			var numsib = nheirs[brother]+nheirs[sister]+nheirs[brotherF]+n+nheirs[siblingM];
			if (n==1 && numsib==1) sh = sixth;	//One sister from father and no other siblings
			//Handled at sister above
			else sh = has(sisterF);
		}
		else if (isMaleDesc() || nheirs[brother]>0) {
			sh = none;
			detail(displays["_sistersF0m_"]);
		}
		else if (fasab) {
			sh = none;
			detail(displays["_fasabasisF_"]);
		}
		else if ((nheirs[brotherF]==0) && (nheirs[sister]>1) && !isFemaleDesc()) {
			sh = none;
			detail(displays["_sistersF0nofasaba1_"]);
		}
		else if ((nheirs[sister]==1) && isFemaleDesc()) {
			sh = none;
			detail(displays["_sistersF0nofasaba2_"]);
		}
		//Counting her in agnation with gfather in Zaid's doctrine comes later
		if (isGFS() && (school==Egypt && isMSB())) {
			sh = multiply(toshare(),half);	//agnates in Zaid's and Ali's opinions
			detail(displays["_sistersFMSB_"]);
		}
		else if (nheirs[brotherF]>0) {
			sh = multiply(toshare(), half);
			gets(brotherF, toshare());
			detail(displays["_sistersF12_"]);
		}
		else if (isFemaleDesc() && nheirs[sister]==1) {
			sh = sixth;
			detail(displays["_sistersFfasaba_"]);
		}
		else if (isFemaleDesc()) {
			sh = toshare();
			fasab = true;
			detail(displays["_sistersFshare_"]);
		}
		else if (n==1) {
			sh = half;
			detail(displays["_sistersF2_"]);
		}
		else {
			sh = twothirds;
			detail(displays["_sistersF23_"]);
		}
		break;
	case siblingM:
		citeRule("_SiblingM_");
		debug(nheirs[brother]==0? "No full brothers" : nheirs[brother]+" full brother(s)");
		if (school == Jaafari && isHigherTierJ(siblingM)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (nheirs[gfather]>0 && (isMSB())) {
			sh = none;
			detail(displays["_siblingsM0MSB1_"]);
		}
		else if ((nheirs[daughter]>0 || nheirs[gdaughter]>0) && (school==Hanafi || isMSB())) {
			sh = none;
			detail(displays["_siblingsM0MSB2_"]);
		}
		else if (school==0 && isKalala() && !isFemaleDesc() && (nheirs[husband]+nheirs[wife])>0) {
			detail(displays["_kalala1_"]);
			citeRule("_Kalala_");
			var numsib = nheirs[brother]+nheirs[sister]+nheirs[brotherF]+nheirs[sisterF]+n;
			if (n==1 && numsib==1) sh = sixth;	//One sibling from mother and no other siblings
			//Handled at sister above
			else sh = has(siblingM);
		}
		else if (n==1) {
			sh = sixth;
			detail(displays["_siblingM6_"]);
		}
		else if (isMushtarika()) {
			sh = toshare();
			detail(displays["_mushtarika_"]);
		}
		else {
			sh = third;
			detail(displays["_siblingsM3_"]);
		}
		break;
	default:
		debug("calcNamedShare() called with an unnamed heir, " + formatHeir(h));
		sh = none;
	}
	gets(h, sh);
	detail(displays["_fincalcnamed1_"] + " " + formatHeir(h, true, 'G') );
	detail(displays["_sumsofar_"]);
	sumUp();
	logSumAndRemain("ns"+h);
}

/**
 *	Inheritance rules for the agnate heirs
 *	@param	h: index of heir for whom to calculate inheritance, int
 *			Calculations are stored in a global array of Rationals
 *	@see	#shares[]
 *	@version 2.0
 *	@since	September 2020
 */
function calcAgnateShare(h) {
	ensure(h>0 && h<=treasury, h + displays["_invalidheir_"]);
	var n = nheirs[h];
	if (n==0) {
		shares[h] = none;
		return;
	}
	if (n<=2) detail("<br/" + ">" + displays["_calcagnate1_"] + " " + formatHeir(h, true, 'G'));
	else detail("<br/" + ">" + displays["_calcagnate1_"] + " " + formatHeir(h, true, 'G') + " (" + n + ")");
	var sh = none;
	switch(h) {
	case son:
		citeRule("_Son_");
		sh = toshare();
		detail(displays["_sons_"]);
		depriveRange(brother, treasury, displays["_sondeprives_"]);
		deprive(gdaughter, displays["_sondeprives_"]);
		ensure(sh && !isZero(sh), displays["_xsons_"]);
		break;
	case gson:
		citeRule("_Grandson_");
		depriveRange(sister, siblingM, displays["_gsondeprives_"]);
		if (nheirs[son]>0) {
			sh = none;
			detail(displays["_gsons0_"]);
		}
		else sh = toshare();
		detail(displays["_gsons_"]);
		break;
	case father:
		citeRule("_Father_");
		depriveRange(brother, sisterF, displays["_fatherdeprives_"]);
		if (school != 0) 
			deprive(gmotherF, displays["_frdeprivesgmf_"]);
		if (isMaleDesc()) {
			sh = sixth;
			detail(displays["_father6_"]);
		}
		else if (isFemaleDesc()) {
			sh = sixth;
			detail(displays["_father6a_"]);		
		}
		else if (((nheirs[husband]*1+nheirs[wife]*1)>0) && nheirs[mother]>0) {
			//Al-Gharraia, or the Two Omarias
			//Do nothing. It was taken care of at mother above
			sh = has(father);
		}
		else {
			sh = toshare();
			detail(displays["_father_"]);
		}
		ensure(sh && !isZero(sh), displays["_xfather_"]);
		break;
	case gfather:
		citeRule("_Grandfather_");
		if (school==Hanafi) {
			depriveRange(brother, sister, displays["_gfdeprives_"]);
			depriveRange(brotherF, sisterF, displays["_gfdeprives_"]);
		}
		/*else if (school != 0)
			deprive(sisterF, displays["_gfdeprives_"]);*/
		if (nheirs[father]>0) {
			sh = none;
			detail(displays["_gfather0_"]);
		}
		else if (school == Jaafari && isHigherTierJ(gfather)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (isMaleDesc()) {
			sh = sixth;
			detail(displays["_gfather6_"]);
		}
		else if (isFemaleDesc()) {
			sh = sixth;
			detail(displays["_gfather6a_"]);
		}
		else if (isGFS()) {
		    if ((nheirs[mother]*1+nheirs[gmotherF]*1+nheirs[gmotherM]*1)>0 && (nheirs[husband]*1+nheirs[wife]*1)>0) {
				sh = sixth;
				detail(displays["_akdaria_"]);
			//To be followed, for the later schools, by redivision then agnation
			}
			else if (school == Jaafari && isHigherTierJ(gfather)) {
				sh = none;
				detail(displays["_higherTierJ_"]);
			}
			//That test is only repeated for good programming discipline :-)
		    else if (school != Jaafari) {
		        sh = toshare(); 
			    detail(displays["_gfather_"]);
		    }    
			else sh = sixth;
		}
		else if (school != Jaafari) {
			sh = toshare();
			detail(displays["_gfather_"]);
		}
		else sh = sixth;	//Default, e.g., Jaafari
		break;
	case brother:
		citeRule("_FullBrother_");
		if (isMaleDesc() || nheirs[father]>0) {
			sh = none;
			detail(displays["_brothers0_"]);
		} 
		else if ((school==Hanafi || school==Zahiri) && nheirs[gfather]>0) {
			sh = none;
			detail(displays["_brothers0HZ_"]);
		}
		else if (school == Jaafari && isHigherTierJ(brother)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (school==0 && isKalala() && !isFemaleDesc() && (nheirs[husband]+nheirs[wife])>0) {
			//Verse 4:12
			detail(displays["_kalala1_"]);
			citeRule("_Kalala_");
			if (n+nheirs[sister]+nheirs[brotherF]+nheirs[sisterF]+nheirs[siblingM]==1)
				sh = sixth;
			//else handled at sister above
			else sh = has(brother);
		}
		else {
			sh = toshare();
			detail(displays["_brothers_"]);
		}
		break;
	case brotherF:
		citeRule("_HalfBrother_");
		if (isMaleDesc() || nheirs[father]>0) {
			sh = none;
			detail(displays["_brothersF0_"]);
		}
		else if (school == Jaafari && isHigherTierJ(gfather)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (school==0 && isKalala() && !isFemaleDesc() && (nheirs[husband]+nheirs[wife])>0) {
			//Verse 4:12
			detail(displays["_kalala1_"]);
			citeRule("_Kalala_");
			var numsib = nheirs[brother]+n+nheirs[sister]+n+heirs[sisterF]+nheirs[siblingM];
			if (n+nheirs[brother]+n+nheirs[sister]+n+heirs[sisterF]+nheirs[siblingM]==1)
				sh = sixth;	//One brother from father and no other siblings
			//else handled at sisterF above
			else sh = has(brotherF);
		}
		else if (nheirs[sister]>0 && fasab) {
			sh = none;
			detail(displays["_brothersF0a_"]);
		}
		else sh = toshare();
		detail(displays["_brothersF_"]);
		break;
	default:	//e.g., uncle, etc.
		debug("calcAgnateShare() called with " + formatHeir(h, false, 'G'));
		if (h == relativeM) {
			citeRule("_relativeM_");
			if (school==Maliki || school==Shafii || school==Zahiri) {
				sh = none;
				detail(displays["_relativesM0MSZ_"]);
			}
		}
		citeRule("_Agnates_");
		if (school == Jaafari && isHigherTierJ(h)) {
			sh = none;
			detail(displays["_higherTierJ_"]);
		}
		else if (school!=0 && fasab && (nheirs[sister]>0 || nheirs[sisterF]>0)) {
			sh = none;
			detail(formatHeir(h, true, '') + " " + displays["_agnates0a_"]);
		}
		else sh = toshare();	//Asaba
		for (var i=h-1; i>=son; i--) {		//Closer Asaba?
			if (isMaleAgnate(i) && nheirs[i]>0) {
				sh = none;
				detail(formatHeir(i, true, '') + " " + displays["_agnates0_"]);
				break;
			}
		}
	}
	gets(h, sh);
	detail(displays["_fincalcagnate1_"] + " " + formatHeir(h, true, 'G') );
	detail(displays["_sumsofar_"]);
	sumUp();
	logSumAndRemain("as"+h);
}

/**
 *	"Awl" (oversubscription), when sum of shares > 1
 */
function redivide() {
	if (!ensure(isOversubscribed(), displays["_wrongrediv_"] + " " + toLangFraction(sum))) return;
	if (allowAwl==false) {
		detail(displays["_noawl_"]);
		var excess = subtract(sum, whole);
		detail(displays["_excess_"] + " " + toString(excess));
		if (!isLt(has(sisterF), excess)) {	//can she have less than the excess?
			gets(sisterF, subtract(has(sisterF), excess));
			detail(displays["_sistersF-ZJ_"]);
		}
		else if (!isLt(has(sister), excess)) {
			gets(sister, subtract(has(sister), excess));
			detail(displays["_sisters-ZJ_"]);
		}
		else if (!isLt(has(gdaughter), excess)) {
			gets(gdaughter, subtract(has(gdaughter), excess));
			detail(displays["_gdaughters-ZJ_"]);
		}
		else {
			gets(daughter, subtract(has(daughter), excess));
			detail(displays["_daughters-ZJ_"]);
		}
	}
	else {
		detail(displays["_rediv_"]);
		if (isNegative(has(father))) {
			gets(father, third, displays["_father3awl_"]);
			detail(displays["_fathersum_"]);
			sumUp();
		} //Can that happen?
		if (isNegative(has(gfather))) {
			if (school==Egypt) {
				gets(gfather, sixth, displays["_gfather6awl_"]);
			}
			else {
				gets(gfather, third, displays["_gfather3awl_"]);
			}
			detail(displays["_gfathersum_"]);
			sumUp();
		}
		//The above can happen, e.g., husband, mother, gfather, 2 sisters
		for (var i=firstHeir; i<=lastHeir; i++) {
			if ((!isVoid(i)) && isGt(has(i),none)) {
				gets(i, divide(has(i), sum));
			}
		}
	}
	if (!ensure(addsUp())) detail(displays["_redivfail_"]);
	else detail(displays["_redivok_"]);
	logSumAndRemain("rediv");
}

/**
 *	Agnation
 **/
/**
 *	Whether an heir is a male agnate
 *	@param	h: int, index of the heir
 *	@return	boolean, true if h is a male agnate, false otherwise
 */
function isMaleAgnate(h) {
	return (h==son) || (h==gson) || (h==father) || (h==gfather) || (h==brother) || (h==brotherF) ||
		(h==nephew) || (h==nephewF) || (h==uncle) || (h==uncleF) || (h==cousin) || (h==cousinF);
}

/**
 *	Whether an heir is a female agnate
 *	@param	h: int, index of the heir
 *	@return	boolean, true if h is a female agnate, false otherwise
 */
function isFemaleAgnate(h) {
	return (h==daughter) || (h==gdaughter) || (h==sister) || (h==sisterF);
}

/**
 *	Whether the heir list supports female agnation
 *	@return	boolean: true if the heir list has a female agnation combination, false otherwise
 */
function existsFemaleAgnates() {
	return (
		(nheirs[daughter]>0 && ((!isVoid(sister)) || (!isVoid(sisterF))) ) ||
		(nheirs[gdaughter]>0 && ((!isVoid(sister)) || (!isVoid(sisterF))) )
	);
}

/**
 *	Whether an heir is eligible for agnation
 *	@param	h: int, index of the heir
 *	@return	boolean: true if h is eligible for agnation, false otherwise
 */
function agnates(h) {
	var b = (nheirs[h]>0) && (isMaleAgnate(h) || isFemaleAgnate(h));
	return (b && !isVoid(h) && isNegative(has(h)));
}

/**
 *	Get the weight in agnation of an heir
 *	@param	h: int, index of the heir
 *	@return	int: multiplier of the agnation ratio of h, e.g., 2 if their ratio is 2:1
 */
function getAgnateWeight(h) {
	if (isToShare(h))
		return (isMaleAgnate(h)? 2 : (isFemaleAgnate(h)? 1 : 0))*1;
	else return 0;
}

/**
 *	Sums up the agnation weights of all agnation-eligible heirs
 *	This is not the sum of agnation shares themselves, only the relative weights
 *	The sum of the agnation shares themselves is the remainder
 *	@return	int: the sum of agnation weights
 *	@see	#getAgnateWeight(int)
 */
function sumUpAgnateWeights() {
	var sumweight = 0*1;
	for (var i=0; i<nheirs.length; i++) {
		if (isToShare(i)) {
			sumweight += nheirs[i] * getAgnateWeight(i);
		}
	}
	detail(displays["_sumagn_"] + " " + sumweight);
	return sumweight;
}

/**
 *	Gets the agnation share portion of an agnate, not the share itself
 *	To calculate the share itself, multiply this by the remainder
 *	@param	h: int, index of the agnate heir, e.g., brother
 *	@return	Rational: agnation share portion for h, e.g., 2/5
 */
function getAgnatePortion(h) {
	var sumweight = sumUpAgnateWeights();
	return new Rational(nheirs[h]*getAgnateWeight(h), sumweight);
}

/**
 *	Whether any heir is set to share by agnation
 *	@return	boolean
 */
function isAgnation() {
	var ret = false;
	for (var i=son; i<treasury; i++)	//Any agnates?
		ret = agnates(i) || ret;
	return ret;
}

/**
 *	Calculate agnation share of a fractional amount for one agnate heir with another,
 *	e.g., agnateWith(sixth,brother,sister) yields 2/3*1/6=2/18=1/9
 *	Likewise agnateWith(sixth,sister,brother) yields 1/3*1/6=1/18
 *	@param	amount: Rational, fraction being agnated, e.g., sixth
 *	@param	h1: int, index of heir category for whom to calcaulate agnation share, e.g., brother
 *	@param	h2: int, index of the other heir category with whom h1 agnate, e.g., sister
 *	@return	Rational: agnation portion of amount for h1
 *	@see	#getAgnateWeight(int)
 */
function agnateWith(amount, h1, h2) {
	return multiply(new Rational(nheirs[h1]*getAgnateWeight(h1),(nheirs[h2]*getAgnateWeight(h2)+nheirs[h1]*getAgnateWeight(h1))), amount);
}

/**
 *	Handles agnation in the grandfather-siblings cases
 *	Calculates agnation share of a fractional amount for an agnate heir,
 *	e.g., agnateGFSibs(third, brother) figures out agnation share for full brothers in a third
 *	between him, the grandfather and the other siblings
 *	@param	amount: Rational, fraction being agnated, e.g., third
 *	@param	h: int, index of heir category for whom to calcaulate agnation share, e.g., brother
 *	@param	countGF: boolean, whether to include the grandfather in the count.
 *			Set it to false if the share of the grandfather was previously set
 *	@return	Rational: agnation share of amount for h
 */
function agnateGFSibs(amount, h, countGF) {
	if (isToShare(h)) {
		var denom = isToShare(brother)? nheirs[brother]*getAgnateWeight(brother) : 0;
		denom += isToShare(brotherF)? nheirs[brotherF]*getAgnateWeight(brotherF) : 0;
		denom += isToShare(sister)? nheirs[sister]*getAgnateWeight(sister) : 0;
		denom += isToShare(sisterF)? nheirs[sisterF]*getAgnateWeight(sisterF) : 0;
		if (countGF==true && isToShare(gfather)) 
			denom += nheirs[gfather]*getAgnateWeight(gfather);
		debug("agnateGFSibs: Denominator = " + denom);
		if (denom>1) {
			var ret = multiply(new Rational(nheirs[h]*getAgnateWeight(h), denom), amount);
			debug("agnateGFSibs('" + toString(amount) + "'," + h + "," + countGF + ")=" + toString(ret));
			return ret;
		}
		else return amount;	//precaution against an improper call
	}
	else return has(h);
}

/**
 *	Process agnation of grandfather-and-siblings cases according to the rulings attributed to Zaid (RA)
 *	and followed by the Maliki, Shafii and Hanbali juristic schools
 */
function processGFSibsZ() {
	//Maliki, Shafii and Hanbali juristic schools follow rulings attributed to Zaid (RA)
	//These schools count siblings from father in the agnation count but
	//give their shares to the full siblings
	explain("_GFSibsZ_");
	sumUp();	//Just in case we didn't before getting here
	logSumAndRemain("gfsibsz");
	var agnateShareGF = agnateGFSibs(remain, gfather, true);
	var thirdRemain = multiply(remain, third);
	debug("gfather agnation share: " + toString(agnateShareGF) + ", 1/3rd remain: " + toString(thirdRemain));

	if (isGFB()) {
		//Handle the grandfather-and-siblings cases by
		//giving gfather the better of 1/3 of remainder, agnate share or 1/6 of estate
		//Favoring full brothers by giving them the shares of half-brothers
		//Attributed to Zaid (RA)
		gets(gfather, max(max(agnateShareGF, thirdRemain), sixth));
		detail(displays["_gfather3ag6Z_"]);
		//Share of gfather may have exceeded agnateShare, so recalculate remain
		detail(displays["_sumaggfather_"]);
		sumUp();
		logSumAndRemain("gfbz");
		
		var agnateShareBR = agnateGFSibs(remain, brother, false);
		var agnateShareBF = agnateGFSibs(remain, brotherF, false);
		var agnateShareSR = agnateGFSibs(remain, sister, false);
		var agnateShareSF = agnateGFSibs(remain, sisterF, false);
		
		if (nheirs[brother]>0) {
			gets(brother, add(add(agnateShareBR, agnateShareBF), agnateShareSF));
			gets(brotherF, none);
			gets(sister, agnateShareSR);
			gets(sisterF, none);
		}
		else if (nheirs[brotherF]>0) {	//No full brothers
			if (nheirs[sister]>0) {
				if (nheirs[sister]>1) {
					if (isLt(remain, twothirds)) {
						gets(brotherF, agnateShareBF);
						detail(displays["_brothersF23agZ_"]);
						gets(sister, add(agnateShareSR, agnateShareSF));
						gets(sisterF, none);
						detail(displays["_sistersagZ_"]);
					}
					else {	//two thirds are available
						gets(sister, twothirds);
						gets(brotherF, remain);
						//Should always be zero since gfather took a third
						gets(sisterF, none);
						detail(displays["_sisters23agZ_"]);
					}
				}
				else {	//one full sister
					if (isLt(remain, half)) {
						gets(sister, add(agnateShareSR, agnateShareSF));
						gets(brotherF, agnateShareBF);
						gets(sisterF, none);
						detail(displays["_sistersagZ_"]);
					}
					else {	//half is available
						gets(sister, half);
						gets(brotherF, remain);
						gets(sisterF, none);
						detail(displays["_sisters23agZ_"]);
					}								
				}
			}
			else {	//No full siblings
				gets(brotherF, remain);
				gets(sisterF, none);
				detail(displays["_brothersFZ_"]);
			}
		}
		//else do nothing because it will be taken care of under isGFS() next
	}
	else if (isGFS()) {		//Handled differently by guaraneeting a minimum of a third to the grandfather
		//Handle the grandfather-and-sisters case by
		//giving gfather the better of 1/3 of remainder or agnate share
		//The Maliki, Shafii and Hanbali juritic schools follow the rulings attributed to Zaid (RA)
		//These schools count half-sisters from father in the agnation count but
		//give their shares to the full sisters
		gets(gfather, max(agnateShareGF, thirdRemain));
		detail(displays["_gfather3Z_"]);
		//Share of gfather may have exceeded agnateShare, so recalculate remain
		detail(displays["_sumaggfather_"]);
		sumUp();
		logSumAndRemain("gfsz");
		
		var agnateShareSR = agnateGFSibs(remain, sister, false);
		var agnateShareSF = agnateGFSibs(remain, sisterF, false);
		
		if (nheirs[sister]*1>1) 
			gets(sister, min(twothirds, agnateShareSR));
		else if (nheirs[sister]==1) 
			gets(sister, min(half, agnateShareSR));
		detail(displays["_sisters23ag2Z_"]);
		gets(sisterF, remain);
	}
	sumUp();
	logSumAndRemain("gfsibszc");
}

/**
 *	Process agnation of grandfather-and-siblings cases according to the rulings attributed to Ali (RA)
 *	and followed by the Hanafi, Zahiri and Shii juristic schools as well as the Egyptian law
 */
function processGFSibs() {
	//Handle the grandfather-and-siblings cases by
	//giving gfather the better of 1/3 of remainder, agnate share or 1/6 of estate
	explain("_GFSibs_");
	sumUp();	//Just in case we didn't before getting here
	var agnateShareGF = agnateGFSibs(remain, gfather, true);
	var thirdRemain = multiply(remain, third);
	debug("gfather agnation share: " + toString(agnateShareGF) + ", 1/3rd remain: " + toString(thirdRemain));

	if (isGFB()) {
		//**Check that 1/6 is not a required min in Egyptian law**
		if (school==Egypt) {
			gets(gfather, max(max(agnateShareGF,thirdRemain),sixth));
			detail(displays["_gfatheragA_"]);
			//Share of gfather may have exceeded agnateShare, so recalculate remain
			detail(displays["_sumaggfather_"]);
			sumUp();
			logSumAndRemain("gfb");
			
			var agnateShareBR = agnateGFSibs(remain, brother, false);
			var agnateShareBF = agnateGFSibs(remain, brotherF, false);
			var agnateShareSR = agnateGFSibs(remain, sister, false);
			var agnateShareSF = agnateGFSibs(remain, sisterF, false);
			gets(brother, agnateShareBR, displays["_regagshare_"]);
			gets(brotherF, agnateShareBF, displays["_regagshare_"]);
			gets(sister, agnateShareSR, displays["_regagshare_"]);
			gets(sisterF, agnateShareSF, displays["_regagshare_"]);
		}
		else {	//Hanafi, Zahiri, Ibadhi
			detail(displays["_gfatheragSibH_"]);
			gets(gfather,remain);
			gets(brother, none);
			gets(brotherF, none);
			gets(sister, none);
			gets(sisterF, none);
		}
	}
	else if (isGFS()) {
		//Handle the grandfather-and-sisters case by
		//giving gfather the better of 1/3 of remainder or agnate share
		detail(displays["_gfatheragAsis_"]);
		if (school==Egypt) {
			gets(gfather, max(agnateShareGF,thirdRemain));
			//Share of gfather may have exceeded agnateShare, so recalculate remain
			detail(displays["_sumaggfather_"]);
			sumUp();
			var agnateShareSR = agnateGFSibs(remain, sister, false);
			var agnateShareSF = agnateGFSibs(remain, sisterF, false);
			gets(sister, agnateShareSR, displays["_regagshare_"]);
			gets(sisterF, agnateShareSF, displays["_regagshare_"]);
		}
		else {	//Hanafi, Zahiri, Ibadhi
			detail(displays["_gfatheragSibH_"]);
			gets(gfather,remain);
			gets(sister, none);
			gets(sisterF, none);
		}
	}
}

/**
 *	Agnation calculations
 *	@author	IslamicSoftware.org
 *	@version	2.0
 *	@since	September 2020 
 */
function agnate() {
	//We don't get here unless sum is less than 1
	if (!isAgnation()) {
		debug("agnate(): No agnates. Returning");
		return true;
	}
	//Divide remainder among agnates by their ratios
	//All of them are marked by -ve shares by now
	detail(displays["_applyag_"]);
	//var rsum = none;	//no longer used
	//var j;
	var special = (nheirs[father] != 0) && (!isMaleDesc()) && (!isFemaleDesc());
	if (special) {
		gets(father, toshare());		//his named share will be added later
		detail(displays["_fatherag_"]);
	}
	var specialg = (!isVoid(gfather)) && (!isMaleDesc()) && (!isFemaleDesc());
	if (specialg) {
		gets(gfather, toshare());		//his named share will be added later
		detail(displays["_gfatherag_"]);
	}
	//Sum up again, father's or gfather's share may have changed
	if (nheirs[father]>0 || nheirs[gfather]>0)
		detail(displays["_sumfathers_"]);
	sumUp();
	debug("Commencing agnation...");
	
	var gfSibsProcessed = false;
	for (var i=firstHeir; i<=lastHeir; i++) {
		if (!isNegative(has(i) || isDeprived(i))) continue;
		if (!gfSibsProcessed && (isGFB()||isGFS()) && isMSB()) {	//Zaid (RA)
			//Handle the grandfather-and-siblings cases by
			//giving gfather the better of 1/3 of remainder, agnate share or 1/6 of estate
			//Siblings agnate in the remainder after gfather as follows,
			//Full brothers also get the share of half brothers who are deprived
			//Full sisters also get the share of half sisters who are deprived
			//Attributed to Zaid (RA)
			debug("Processing GFSibsZ (Zaid)");
			processGFSibsZ();
			gfSibsProcessed = true;
		}
		else if (!gfSibsProcessed && (isGFB()||isGFS()) && school==Egypt) {	//Ali (RA)
			//Handle the grandfather-and-siblings cases by
			//giving gfather the better of 1/3 of remainder, agnate share or 1/6 of estate
			//Siblings get agnate share of the remainder after gfather
			debug("Processing GFSibs (Ali)");
			processGFSibs();
			gfSibsProcessed = true;
		}
		else {	//includes Jaafari because toshare() mark not placed for Asaba
			//toshare() mark still on, therefore not yet given a share, so calculate it now
			var agnateShare = multiply(getAgnatePortion(i), remain);
			if (nheirs[i]*1==1) 
				detail(formatHeir(i, true, '') + ": " + displays["_agnateshare_"] + " = " + toLangFraction(agnateShare));
			else detail(formatHeir(i, false, '') + ": " + displays["_agnateshare_"] + " = " + toLangFraction(agnateShare));
			if (isMushtarika()) {
				//Handle the Mushtarika case
				gets(i, agnateShare, displays["_regagshare_"]);		//i's share in agnation
				//That's all we need. Everything else appears to have been taken care of already
				//at end of each loop, sum up to recalculate the remainder
			}
			else {
				gets(i, agnateShare, displays["_regagshare_"]);	//i's share in agnation (Ali's/Egyptian law)
				//at end of each loop, sum up to recalculate the remainder
			}
			detail(displays["_sumcalcag1_"] + " " + formatHeir(i, true, 'G') );
			sumUp();	//updates remain
			logSumAndRemain("ag");
		}
	}
	if (special || specialg) {
		detail(displays["_sumcalcfathers_"]);
		if (!addsUp()) {
			if (special==true) {
				var v = add(has(father), sixth);	//his named share added
				gets(father, min(v, remain));	
			}
			else if (specialg==true && !isGFB()) {
				var vg = add(has(gfather), sixth);	//his named share added
				gets(gfather, min(vg, remain));
			}
			detail(displays["_agplusnamed_"]);
		}
		else detail(displays["_addsupfathers_"]);
	}

	detail(displays["_sumfatherfdec_"]);
	if (!addsUp()) {		//e.g., case of father with fdec
		logSumAndRemain("fdec");
		detail(displays["_notaddupag_"] + " (" + getHeirList() + ")");

		for (var k=firstHeir; k<=lastHeir; k++) {
			if ( isMaleAgnate(k) && !isVoid(k) ) {
				gets(k, add(remain, has(k)));
				//he also gets the rest
				if (nheirs[k] == 1) detail(formatHeir(k, true, '') + " " + displays["_getsrem_"]);
				else detail(formatHeir(k, true, '') + " " + displays["_getrem_"]);
				break;
			}
		}
	}
	else detail(displays["_nofatherfdec_"]);

	for (var h=firstHeir; h<=lastHeir; h++) {
		if ((nheirs[h]>0) && isNegative(has(h))) {
			gets(h, none, displays["_lastdeprive_"]);	
			//if he didn't get it by now, he doesn't. e.g., brotherF or sisterF
		}
	}

	//By now sum is either 1 or less. If <1, maybe female Asaba applies
	detail(displays["_sumfasaba_"]);
	sumUp();
	if (isUndersubscribed()) {
		//See if there is female agnation
		var halfremain = multiply(remain, half);
		if (!existsFemaleAgnates()) {
			detail(displays["_nofasaba_"]);
		}
		else if ((nheirs[daughter]>0) && (!isVoid(sister))) {
			gets(daughter, halfremain);
			gets(sister, halfremain);
		}
		else if ((nheirs[daughter]>0) && (!isVoid(sisterF))) {
			gets(daughter, halfremain);
			gets(sisterF, halfremain);
		}
		else if ((!isVoid(gdaughter)) && (!isVoid(sister))) {
			gets(gdaughter, halfremain);
			gets(sister, halfremain);
		}
		else if ((!isVoid(gdaughter)) && (!isVoid(sisterF))) {
			gets(gdaughter, halfremain);
			gets(sisterF, halfremain);
		}
	}
	else detail(displays["_notundersub_"]);
	sumUp();
	logSumAndRemain("agc");
	detail(displays["_finagn_"]);
	return true;	//Agnation complete
}

//lookup.js is loaded before this
/**
 *	Looks for a case whose pattern matches the entered one and if found, returns its representing JSON object 
 *	@return	JSON object representing the matching case, in the format:
 *			{"id":id, "hl":hl, "hc":hc, "sc":sc, "rv":rv, "aw":aw, "sh":sh, "ex":ex}
 *			If object doesn't have them, rv defaults to "1", sc defaults to "1", aw defaults to "1"
 *			If case is not found in the lookup list (lookup.js), null is returned
 *	@see	#LookupPatterns
 *	@since	August 2020 
 *	@author	IslamicSoftware.org
 */
function getMatchingCase() {
	//Save unnecessary lookup
	//if (nheirs[gfather]==0) return null;
	//if ((nheirs[gfather]>0) && !isMSB()) return null;
	var spec = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	for (var i=0; i<spec.length; i++)
		spec[i] = nheirs[i];
	debug("Looking up among special case patterns for the case of '" + spec);
	//console.log("Patterns" + JSON.stringify(lookupPatterns) + "\n");
	//lookupPatterns is an array of pattern objects defined in lookup.js and loaded before this file
	for (var i=0; i<lookupPatterns.length; i++) {
		var entry = lookupPatterns[i];
		debug("Comparing with pattern " + entry.id + ": " + JSON.stringify(entry));
		//var sc = /[2-4]/;	//We already excluded the others
		var sc = /[0-9]/;
		if (entry.sc) sc = new RegExp(entry.sc);
		var matchschool = sc.test(school.toString());
		if (!matchschool) {
			debug("Schools don't match: " + sc.toString() + " vs " + school);
			debug("sc:" + sc + ".test(" + school.toString() + "):" + matchschool);
			continue;
		}
		var rv = (allowRuddToSpouses? "2" : (allowRudd? "1" : "0"));
		//console.log(entry);
		if (entry.rv) {
			if (!entry.rv.equals(rv)) {
				console.log("Reversion rules don't match: " + entry.rv.toString() + " vs " + rv);
				continue;
			}
		}
		var aw = (allowAwl? "1" : "0");
		if (entry.aw) {
			if (!entry.aw.equals(aw)) {
				debug("Redivision rules don't match: " + entry.aw.toString() + " vs " + aw);
				continue;
			}
		}
		var hn = (entry.hl).split(",");	//hn is an array of constant names of heir indeces
		var hl = [];
		for (var j=0; j<hn.length; j++)
			hl.push(eval(hn[j]));
		//hl is an array of int heir indeces
		if (!inArray(hl, firstHeir)) {
			debug("No match. First heir, " + firstHeir + ", is not in heir list: " + hl.toString());
			continue;
		}
		var hc = (entry.hc).split(",");		//hc is an array of int: special case heir counts
		//console.log("hc array: " + hc + "\n");
		var kace = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		//Replace non-zeroes in kace
		//console.log(hl.length + "\n");
		for (var j=0; j<hl.length; j++) {
			var val = hl[j]-0;
			//heir index at element j of hl, e.g., hn[0]=gfather -> hl[0]=val=12
			debug("hl["+j+"]=" + val);
			kace[val] = hc[j];	//e.g., kace[12]=1
		}
		//Match kace with spec
		var matchheirs = true;
		for (var k=0; k<kace.length; k++) {
			debug(k + " kace: " + kace[k] + " spec: " + spec[k]);
			if ((""+kace[k]).startsWith(">")) {		//works likewise with >=
				var b = eval(spec[k] + "*1" + kace[k] + "*1");	//e.g., eval(2*1>1*1)
				debug(k + (!b? ": no " : " ") + "match");				
				if (!b) matchheirs = false;
			}
			else if (kace[k] != spec[k]) {
				debug(k + ": no match");
				matchheirs = false;
			}
			else console.log(k + ": match\n");
		}
		if (matchheirs && matchschool) {
			debug("Pattern matching case found. Id: " + entry.id);
			sc = null;
			return entry;
		}
	}
	return null;
}

/**
 *	Process a special case directly
 *	@param	caseToProcess: a JSON object representing the special case, structured as follows,
 *			{"id":id, "hl":hl, "hc":hc, "sh":sh, "sc":sc, "rv":rv, "ex":ex}, where
 *			id: string, a unique identifcation,
 *			hl: string, comma-separated list of heir categories, e.g., "gfather,brother",
 *			hc: string, comma-separated list of heir counts in each category of hl in order, e.g., "1,2",
 *			sc: string of an int, juristic school. Can be a RegEx, e.g., "[2-4]". Default: "0"
 *			rv: string of an int, reversion level, 
 *				"2": allowRuddToSpouses, "1": allowRudd (default), "0": don't allow
 *			sh: string, comma-separated list of shares of said heirs in order, as rational fractions, e.g.,
 *				"1/3,2/3",
 *			ex: string, an explanation.
 *	@return	boolean: true if case to process was successfully processed, false otherwise
 *	@author	IslamicSoftware.org
 *	@since	August 2020 
 */
function processSpecialCase(caseToProcess) {
	console.log("Processing special case " + JSON.stringify(caseToProcess) + "...\n");
	var hl = caseToProcess.hl;
	var hc = caseToProcess.hc;
	var shrstr = caseToProcess.sh;
	var ex = caseToProcess.ex;
	var id = caseToProcess.id;
	if (id && id.indexOf('Z')==0) explain("_ZGfSibs_");
	var nh = hc.split(",");		//Array of int heir counts
	var hn = hl.split(",");		//Array of string constants of heir indeces
	console.log("Matched shares string: " + shrstr + "\n");
	if (shrstr && shrstr.length >0) {
		var shrs = shrstr.split(',');
		for (var i=0; i<shrs.length; i++) {
			var val = none;
			debug("shrs[" + i + "] = " + shrs[i]);
			//See if it's already a rational fraction
			if (shrs[i].indexOf('=') != 0) val = toRational(shrs[i]);
			else {
				debug("val[" + i + "] is a formula");
				debug("nh[" + i + "] = " + eval(nh[i]*1));
				var formula = shrs[i].substring(1).replace(/;/g, ",");
				debug("Formula = " + formula + "\n");
				val = eval(formula);
				debug("Formula evaluated to " + toString(val));
			}
			debug("val[" + i + "] = " + toString(val));

			gets(eval(hn[i]), val);
			detail("(" + displays["_specialcase_"] + id + ")");
			debug(formatHeir(eval(hn[i])) + " getting " + toString(val));
		}
		explain(ex);
		return true;
	}
	else return false;
}

/**
 *	Adjust all computed shares, by way of redivison, if a bequest has been specified
 */
function adjustIfBequest() {
	if (isGt(bequestShare, none)) {
		var multiplier = subtract(whole, bequestShare);
		for (var h=son; h<=treasury; h++) {
			if (!isZero(has(h))) {
				//Bug fix: isVoid() checks nheirs which doesn't apply to treasury
				debug("Reducing share of " + h + " from " + toString(has(h)) + " because of bequest");
				gets(h, multiply(has(h), multiplier));
				detail(formatHeir(h, true, '') + ": " + displays["_reducedbq_"]);
			}
		}
		gets(bequest, bequestShare);	//redundant
	}
}

/**
 *	@return	a JSON object string representation of the case at hand
 */
function stringifyCase() {
	var hl = [];
	var hc = [];
	var chers = [];
	var sc = school;
	var rv = (allowRuddToSpouses? 2: (allowRudd? 1: 0));
	var aw = (allowAwl? 1 : 0);
	for (var h=son; h<treasury; h++) {
		if (nheirs[h]>0) {
			hl.push(h);
			hc.push(nheirs[h]);
			chers.push(toString(has(h)));
		}
	}
	return '{"id":"Present", "hl":"' + hl.join(",") + '", "hc":"' + hc.join(",") + '", "sh":"' + chers.join(",") + '", sc="' + sc + '", "rv":"' + rv + '", "aw":' + aw + '", "ex":""}';
}

/**
 *	@return	a JSON object representation of the case at hand
 */
function jsonizeCase() {
	return JSON.parse(stringifyCase());
}

/**
 *	@return	a testcase-like array representation of the case at hand
 */
function enumerateCase() {
	var hc = [];
	var sc = school;
	var rv = (allowRuddToSpouses? 2: (allowRudd? 1: 0));
	var aw = (allowAwl? 1 : 0);
	var bq = !isZero(bequestShare)? toString(bequestShare) : 0;
	hc.push(bq? ("'" + bq + "'") : 0);
	for (var h=son; h<treasury; h++)
		hc.push(nheirs[h]);
	hc.push(rv);
	hc.push(sc);
	hc.push(aw);
	return hc;
}

/**
 *	Main share calculation logic
 *	@return	true if share calculation was successful, false otherwise
 *			If false, an assertion message is output explaining the cause of failure
 *	@author	IslamicSoftware.org
 *	@version	2.0
 *	@since	August 2020 
 */
function calculateShares() {
	var rsum = none;
	var r1 = none;
	var r2 = none;
	var j = none;

	for (var i=0; i<=treasury; i++) shares[i] = none;

	getHeirRange();			//sets firstHeir and lastHeir
	if (!assertTrue((firstHeir>=0) && (lastHeir<treasury), displays["_rangefail_"])) return false;

	//Jaafari tiers. Deprive all heirs in tiers lower than the highest tier where anyone survived
	if (school==Jaafari) depriveJ();
	
	//No heirs
	if (lastHeir == 0) {
		for (var i=son; i<treasury; i++) shares[i]=none;
		if (!isZero(bequestShare)) detail(displays["_bequest1_"]);
		gets(treasury, subtract(whole,bequestShare));
		detail(displays["_treasury1_"]);	
		return true;
	}
	//Sole heir
	else if (lastHeir == firstHeir) {
		for (var i=son; i<=treasury; i++) shares[i]=none;
		if (isSpouse(lastHeir)){
			if (allowRuddToSpouses==true) {
				gets(lastHeir, subtract(whole,bequestShare));
			}
			else if (lastHeir == husband) {
				gets(husband, multiply(half, subtract(whole,bequestShare)));
				gets(treasury, multiply(half, subtract(whole,bequestShare)));
			}
			else if (lastHeir == wife) {
				gets(wife, multiply(quarter, subtract(whole,bequestShare)));
				gets(treasury, multiply(new Rational(3,4), subtract(whole,bequestShare)));
			}
		}
		else if (allowRudd==false && inArray(namedHeirs, lastHeir)) {
			calcNamedShare(lastHeir);	//1/6, 1/3, 1/2 or 2/3
			var rbq = subtract(whole,bequestShare);
			gets(lastHeir, multiply(has(lastHeir), rbq));
			gets(treasury, subtract(whole, has(lastHeir)));
			detail(displays["_treasury3_"]);
		}
		else {	//Rudd is allowed, or Asaba
			gets(lastHeir, subtract(whole,bequestShare));
		}
		if (!isZero(bequestShare)) detail(displays["_bequest1_"]);
		return true;
	}
	//More than one heir
	else {
		//First, look for a matching special case
		var machingCase = getMatchingCase();
		//var machingCase = null;
		if (machingCase!=null) {
			return ensure(processSpecialCase(machingCase)==true, displays["_specialfailed_"]);
		}
		//If not found, calculate
		else {
			debug("Case is not in special cases");
			detail("<br" + ">" + displays["_calcnamed_"]);
			for (var i=0; i<namedHeirs.length; i++) calcNamedShare(namedHeirs[i]);
			detail("<br" + "/>" + displays["_fincalcnamed_"]);
			for (var j=0; j<agnateHeirs.length; j++) calcAgnateShare(agnateHeirs[j]);
			detail("<br" + "/>" + displays["_fincalcagnate_"]);
			if (!sanityCheck()) return false;

			detail("<br" + "/>" + displays["_sumoverunder_"]);
			//Awl (oversubscription)
			if (isOversubscribed()) {
				logSumAndRemain("aw");
				detail(displays["_isoversub_"]);
				redivide();
				//Sanity check:
				detail(displays["_addsup_"]);
				if (!assertTrue(addsUp(), displays["_redivfail_"])) return false;
				else detail(displays["_redivok_"]);
			}
			//Agnation or undersubscription
			else if (isUndersubscribed()) {
				if (!agnate()) return false;
				//sum of shares must be <=1 by now
				if (isUndersubscribed()) {
					//No agnates; divide remainder between named heirs, "Rudd" (reversion)
					logSumAndRemain("rv");
					if (school == Maliki || school==Zahiri) {
						if (allowRudd == false)
							detail(displays["_noruddMZ_"]);
						else
							detail(displays["_userrudd_"]);
					}
					else if (allowRudd == false) 
						detail(displays["_usernorudd_"]);
					if (allowRuddToSpouses == true) 
						detail(displays["_userrudd2_"]);
					else detail(displays["_rudd2C_"]);
					if (allowRudd == true || allowRuddToSpouses == true) {
						detail(displays["_noagrudd_"]);
						rsum = none;
						for (var k=firstHeir; k<=lastHeir; k++) {
							if ((nheirs[k]>0) && isRevertTo(k)) 
								rsum = add(rsum, has(k));
						}
						debug("calcualteShares: Sum of parts is: " + toString(rsum));
						for (var h=firstHeir; h<=lastHeir; h++) {
							if ((nheirs[h]>0) && isRevertTo(h)) {
								j = has(h);
								r1 = divide(j, rsum);
								r2 = multiply(r1, remain);	//additional share
								if (nheirs[h]==1) 
									detail(formatHeir(h, true, '') + ": " + displays["_ruddextra_"] + displays["_comma_"] + " " + toString(r2));
								else detail(formatHeir(h, true, '') + ": " + displays["_ruddextra_"] + displays["_comma_"] + " " + toString(r2));
								gets(h, add(j, r2));
							}
						}
					}
					else {
						gets(treasury, calculateRemainder());
						detail(displays["_norudd_"]);
					}
					ensure(addsUp(), displays["_notfullrudd_"]);
				}
				//ensure(addsUp(), displays["_notfullagrudd_"]);	//any left TOSHARE will be voided later
			}
			if (!sanityCheck()) return false;
			else debug("Done with calculation");
		}
		if (!sanityCheck()) return false;
		else debug("Finished with calculations");
	}

	//sum = whole, so make sure any -ve share marks left are voided
	for (var i=firstHeir; i<=lastHeir; i++) {
		if ((nheirs[i]-0)>0 && isNegative(has(i))) {
			debug(formatHeir(i, true, '') + " is still set to share after applying all the rules. Setting their share to none");
			gets(i, none);
			detail(displays["_finaldeprive_"]);
		}
	}
	if (!sanityCheck()) return false;

	detail(displays["_finalsum_"]);
	if (addsUp()) {
		detail(displays["_doesaddup_"]);
	}
	else {
		detail(displays["_treasury4_"]);
		gets(treasury, calculateRemainder());
		detail(displays["_sumtreasury_"]);
		sumUp();
		logSumAndRemain("sum");
	}

	//Final sanity checks
	if (!assertTrue(isOne(sum), displays["_sumfail_"] + ": " + toString(sum) + "\n" + enumerateCase())) {
		return false;
	}

	adjustIfBequest();		//Includes the treasury
	
	if (!sanityCheck()) return false;

	detail(displays["_theEnd_"]);
	return true;
}
