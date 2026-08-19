//include before irth.js

/**
 *	Patterns of special cases as an array of JSON objects. Each object is structured as follows:
 *	{"id":id, "hl":hl, "hc":hc, "sc":sc, "sh":sh, "ex":ex}, where
 *	id: an identifier
 *	hl: heir list, using constants, ordered by the heirs indeces, e.g., "gafther,brother"
 *	hc: count of heirs listed in hl in the same order, e.g., "1,2". 
 *		Count may begin with the greater-than sign, e.g., ">2" or ">=0"
 *	sc: index of juristic school, e.g. 3 for Shafii
 *		Index may be specified as a regular expression, e.g., "[2-4]" for Maliki, Shafii or Hanbali
 *	sh: Shares of heirs, expressed as textual rational fractions and 
 *		listed in hl in the same order, e.g., "1/3,2/3"
 *		Any given share could be specified as a formula by starting it with an equals sign
 *		followed by Javascript code that can be evaluated at run time with the #eval(string) function.
 *		Commas in the code must be enterd as semicolons	to distinguish them from commas that separate the shares, 
 *		e.g., "=new Rational(1;12)" yields the Rational object 1/12
 *	ex:	Id string of entry key into the global explanations associative array. May be blank
 *		If Id starts with capital letter Z, it refers to of the grandfather-siblings case using Zaid's rulings,
 *		and if it starts with capital letter A, it refers to one of the grandfather-siblings using Ali's rulings
 *	@see	#explanations
 *	@author	IslamicSoftware.org
 *	@version	2.0
 *	@since	September 2020 
 */
var lookupPatterns = [];


