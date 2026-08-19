/**
 *	Parse the URL query string
 *	@return	a key-value object corresponding to key=value query string syntax
 */
function getArgs() {
	var args = {};
	var queryString = location.search? location.search.substr(1) : null;
	if (queryString) {
		var pieces = queryString.split("&");
		for (var i=0; i<pieces.length; i++) {
			var pos = pieces[i].indexOf('=');
			var arg, value;
			if (pos<0) {
				arg = i + "";
				value = pieces[i];
			}
			else {
				arg = pieces[i].substr(0,pos);
				value = pieces[i].substr(pos+1);
			}
			if (!typeof(Error))	//Javascript version earlier than 1.5
				args[arg] = unescape(value);
			else args[arg] = decodeURIComponent(value);
		}
	}
	return args;
}

/**
 *	Get a document element
 *	@return	element, or null if not found
 */
function getElement(eid) {
	if (document.getElementById) return document.getElementById(eid);
	else if (document.all) return document.all(eid);
	else return null;
}

/**
 *	Get a document element from window.opener
 *	@return	element, or null if not found
 */
function getElementFromParent(eid) {
	if ((window.opener==null)) return null;
	if (!eid) return null;
	var el = null;
	if (document.getElementById) el = window.opener.document.getElementById(eid);
	else if (document.all) el = window.opener.document.all(eid);
	else el = null;
	return el;
}

/**
 *	Output a nice representation of an object
 *	@param	obj: the Object
 *	@param	newline: either "<br/>" (default) or "\n"
 *	@return	string representation in a nice format
 */
function prettyObject(obj, newline) {
	var str = "";
	for (var k in obj)
		str += k + ": " + obj[k] + newline? newline : "<br/>";
	return str;
}

/**
 *	Whether a variable is an array
 *	@return	true or false
 */
function isArray(x) {
  return (x instanceof Array) || (x.constructor.toString().indexOf("Array") > -1);
}

/**
 *	Asserts a condition
 *	@param	test: a condition to be asserted
 *	@param	verbal: a string describing the condition to be asserted
 *	@return	null if test is asserted, or a string telling of its failure if it failed
 */
function notasserted(test, verbal) {
	if (false==test) {
		return verbal;
	}
	else return null;
}

/**
 *	Asserts a condition
 *	@param	condition: boolean, the assertion
 *	@param	msg: string, an assertion failure message
 *	@return	boolean, the assertion value
 */
function ensure(condition, msg) {
	if (notasserted(condition, msg)) {
		console.error(msg);
	}
	return condition;
}

/**
 *	Map of Indian numerals to their Arabic counterparts
 */
var indianToArabicNumerals = {"٠":0,"١":1,"٢":2,"٣":3,"٤":4,"٥":5,"٦":6,"٧":7,"٨":8,"٩":9};
var indianNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

/**
 *	Whether a character is an Indian numeral
 *	@param	indianNumeral: char or int
 *	@return boolean: true if input is an Indian numeral, false otherwise
 */
function isIndianNumeral(indianNumeral) {
	return /٠|١|٢|٣|٤|٥|٦|٧|٨|٩/.test(indianNumeral)==true;
}

/**
 *	Convert an Indian numeral to an Arabic numeral
 *	@return	int: the Arabic numeral, or null if it input is not an Indian numeral
 */
function arabicNumeral(indianNumeral) {
	if (isIndianNumeral(indianNumeral)) 
		return indianToArabicNumerals[indianNumeral];
	else return null;
}

/**
 *	Whether a string is an Indian number
 *	@param	indianNumber: string containing only Indian numerals
 *	@return boolean: true if input is an Indian number, false otherwise
 */
function isIndianNumber(indianNumber) {
	return /٠|١|٢|٣|٤|٥|٦|٧|٨|٩/g.test(indianNumber)==true;
}

/**
 *	Convert a string of Indian numbers to an integer, expressed normally as a sequence of Arabic numerals
 *	The string must contain only Indian numerals, no minuses, no thousands separator, etc.
 *	Non-numeric characters in the input string will be skipped
 *	@return	int: The Arabic number
 */
function arabicNumber(indianNumber) {
	if (isIndianNumber(indianNumber)) {
		var ret = "";
		for (var i=0; i<indianNumber.length; i++)
			ret += arabicNumeral(indianNumber[i]);
		return ret-0;
	}
	else return 0;
}

//Cookies:
/** Original JavaScript code by Chirp Internet: www.chirp.com.au
 *	Please acknowledge use of this code by including this header.
 *	@param	name: string, the cookie name
 *	@return	cookie value or null if it's not found
 *	@author	Chirp Internet: www.chirp.com.au
 */
function auGetCookie(name) {
	var re = new RegExp(name + "=([^;]+)");
	var value = re.exec(document.cookie);
	return (value != null) ? decodeURI(value[1]) : null;
}
//End code courtesy of Chirp Internet

/**
 *	Get the value of a cookie
 *	@param	name: the cookie name
 *	@return	cookie value, or blank if not found
 */
function getCookieValue(name) {
	var nameEq = name + "=";
	var cookie;
	if (!typeof(Error))	//Javascript version earlier than 1.5
		cookie = unescape(document.cookie);
	else cookie = decodeURIComponent(document.cookie);
	var pieces = cookie.split(';');
	for (var i=0; i<pieces.length; i++) {
		var piece = pieces[i];
		while (piece.charAt(0) == ' ')
			piece = piece.substr(1);	//left trim
		if (piece.indexOf(nameEq) == 0)
			return piece.substr(nameEq.length, piece.length);
	}
	return "";
}

/**
 *	Whether a cookie is set
 *	@param	name: the cookie name
 *	@return	true or false
 */
function isCookieSet(name) {
	var val = getCookieValue(name);
	return (val!="");
}

/**
 *	Set a cookie
 *	@param	name: the cookie name
 *	@param	value: string, value of the cookie
 *	@param	seconds: expiration date in seconds from now. Optional. Default: session.
 */
function setCookie(name, value, seconds) {
	if (seconds) {
		var d = new Date();
		d.setTime(d.getTime() + (seconds*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}
	else document.cookie = name + "=" + value + ";" + ";path=/";
}

//Using JSON
/**
 *	A JSON object for cookie functios
 *	Functions: set(name, value, milliseconds), get(name), del(name) and not(name)
 */
JSONcookie = {
    set: function (name, value, milli) {
        if (milli) {
            var date = new Date();
            date.setTime(date.getTime() + milli);
            var expires = "; expires=" + date.toGMTString();
        }
        else
            var expires = "";
        document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
    },
    get : function(name) {
        var nameEQ = name + "=",
            ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);	//trim left
            if (c.indexOf(nameEQ) == 0) 
				return JSON.parse(c.substring(nameEQ.length,c.length));
        }
        return null;
    },
	del : function(name) {
		var date = new Date();
		date.setTime(date.getTime() - 5000*60);		//5 minutes ago
		var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + expires + "; path=/";
	},
	not : function(name) {
		return document.cookie.indexOf(name+"=")<0;
	}
};

//Courtesy of Rubens 滝口 Ribeiro
/**
 *	Versao JavaScript da funcao var_dump do PHP
 *	@param mixed ... Qualquer valor
 *	@return string Informacoes do valor
 *	@author	Rubens 滝口 Ribeiro
 */
function var_dump(/* ... */) {
    /**
     * Recursao do metodo var_dump
     * @param midex item Qualquer valor
     * @param int nivel Nivel de indentacao
     * @return string Informacoes do valor
     */
    this.var_dump_rec = function(item, nivel) {
        if (var_dump.max_iteracoes > 0 && var_dump.max_iteracoes < nivel) {
            return this.indentar(nivel) + "*MAX_ITERACOES(" + var_dump.max_iteracoes+ ")*\n";
        }
        if (item === null) {
            return this.indentar(nivel) + "NULL\n";
        } else if (item === undefined) {
            return this.indentar(nivel) + "undefined\n";
        }

        var str = '';
        var tipo = typeof(item);
        switch (tipo) {
        case 'object':
            var classe = this.get_classe(item);
            switch (classe) {
            case 'Array':
                str += this.indentar(nivel) + "Array(" + item.length + ") {\n";
                for (var i in item) {
                    str += this.indentar(nivel + 1) + "[" + i + "] =>\n";
                    str += this.var_dump_rec(item[i], nivel + 1);
                }
                str += this.indentar(nivel) + "}\n";
                break;

            case 'Number':
            case 'Boolean':
                str += this.indentar(nivel) + classe + "(" + item.toString() + ")\n";
                break;

            case 'String':
                str += this.indentar(nivel) + classe + "(" + item.toString().length + ") \"" + item.toString() + "\"\n";
                break;
            
            default:
                str += this.indentar(nivel) + "object(" + classe + ") {\n";
                var exibiu = false;
                for (var i in item) {
                    exibiu = true;
                    str += this.indentar(nivel + 1) + "[" + i + "] =>\n";
                    try {
                        str += this.var_dump_rec(item[i], nivel + 1);
                    } catch (e) {
                        str += this.indentar(nivel + 1) + "(Erro: " + e.message + ")\n";
                    }
                }
                if (!exibiu) {
                    str += this.indentar(nivel + 1) + "JSON(" + JSON.stringify(item) + ")\n";
                }
                str += this.indentar(nivel) + "}\n";
                break;
            }
            break;
        case 'number':
            str += this.indentar(nivel) + "number(" + item.toString() + ")\n";
            break;
        case 'string':
            str += this.indentar(nivel) + "string(" + item.length + ") \"" + item + "\"\n";
            break;
        case 'boolean':
            str += this.indentar(nivel) + "boolean(" + (item ? "true" : "false") + ")\n";
            break;
        case 'function':
            str += this.indentar(nivel) + "function {\n";
            str += this.indentar(nivel + 1) + "[code] =>\n";
            str += this.var_dump_rec(item.toString(), nivel + 1);
            str += this.indentar(nivel + 1) + "[prototype] =>\n";
            str += this.indentar(nivel + 1) + "object(prototype) {\n";
            for (var i in item.prototype) {
                str += this.indentar(nivel + 2) + "[" + i + "] =>\n";
                str += this.var_dump_rec(item.prototype[i], nivel + 2);
            }
            str += this.indentar(nivel + 1) + "}\n";

            str += this.indentar(nivel) + "}\n";
            break;
        default:
            str += this.indentar(nivel) + tipo + "(" + item + ")\n";
            break;
        }
        return str;
    };

    /**
     * Devolve o nome da classe de um objeto
     * @param Object obj Objeto a ser verificado
     * @return string Nome da classe
     */
    this.get_classe = function(obj) {
        if (obj.constructor) {
            return obj.constructor.toString().replace(/^.*function\s+([^\s]*|[^\(]*)\([^\x00]+$/, "$1");
        }
        return "Object";
    };

    /**
     * Retorna espacos para indentacao
     * @param int nivel Nivel de indentacao
     * @return string Espacos de indentacao
     */
    this.indentar = function(nivel) {
        var str = '';
        while (nivel > 0) {
            str += '  ';
            nivel--;
        }
        return str;
    };

    var str = "";
    var argv = var_dump.arguments;
    var argc = argv.length;
    for (var i = 0; i < argc; i++) {
        str += this.var_dump_rec(argv[i], 0);
    }
    return str;
}
var_dump.prototype.max_iteracoes = 0;