/**	Rational number arithmetic
 *	@author	IslamicSoftware.org
 */
/**
 *	Constructor
 *	@param	i: int, numerator
 *	@param	j: int, denominator
 */
function Rational(i, j) {
	this.num = i*1;
	this.denom = j*1;
}

/**
 *	Zero as a rational fraction
 *	@return	Rational(0,1)
 */
function zero() {
	return new Rational(0,1);
}

/**
 *	One, as a rational fraction
 *	@return	Rational(1,1)
 */
function one() {
	return new Rational(1,1);
}

/**
 *	Does the numerator of a rational fraction divide its denominator?
 *	@param	i: int, numerator
 *	@param	j: int, denominator
 *	@return	whether i divides j
 */
function divides(i, j) {
	return ((i % j) == 0);
}

/**
 *	Greatest common denominator of two rational fractions x,y
 *	@param	x: Rational
 *	@param	y: Rational
 *	@return	int: GCD of x and y
 */
function gcd(x, y) {
	var i = x.denom;
	var j = y.denom;
	if (divides(i,j)) return i;
	else if (divides(j,i)) return j;
	else return i*j;
}

/**
 *	Whether a rational number is negative
 *	@param	x: Rational
 *	@return	true or false
 */
function isNegative(x) {
	return (x.num < 0);
}

/**
 *	Negate a rational number
 *	@param	x: Rational
 *	@return	x negated
 */
function negate(x) {
	x.num = -(x.num);
	return x;
}

/**
 *	Whether a rational number is zero
 *	@param	x: Rational
 *	@return	true or false
 */
function isZero(x) {
	return (x.num == 0);
}

/**
 *	Whether a value is a proper rational fraction
 *	@return	true if x is a rational fraction with valid numerator and denominator, false otherwise
 */
function isRational(x) {
	return (x instanceof Rational) && (x.num!=NaN) && (x.denom!=NaN) && (x.denom>0);
}

/**
 *	Simplifies a fraction by reducing its numerator and denominator
 *	to their simplest
 *	@param	x: Rational
 *	@return	x simplified
 */
function simplify(x) {
	var isNeg = isNegative(x);
	var t = (isNeg? -(x.num) : x.num);
	var b = x.denom;
	var smaller = Math.min(t, b);
	if (divides(t,b)) {
		t /= b;
		b = 1;
	}
	else if (divides(b,t)) {
		b /= t;
		t = 1;
	}
	else {
		for (var i = 2; i <= smaller; i++) {
			while (divides(t,i) && divides(b,i)) {
				t /= i;
				b /= i;
			}
			smaller = Math.min(t,b);
		}
	}
	var z = new Rational(1,1);
	z.num = (isNeg? -t : t);
	z.denom = b;
	return z;
}

/**
 *	Multiply two rational numbers
 *	@param	x,y: two Rational numbers
 *	@return	product of the two numbers
 */
function multiply(x, y) {
	var r = new Rational(1,1);
	r.num = x.num * y.num;
	r.denom = x.denom * y.denom;
	return simplify(r);
}

/**
 *	Divide a rational number by another
 *	@param	x,y: Rational
 *	@return	x divided by y
 */
function divide(x, y) {
	var r = new Rational(1,1);
	r.num = x.num * y.denom;
	r.denom = x.denom * y.num;
	return simplify(r);
}

/**
 *	Add two rational numbers
 *	@param	x,y: Rational
 *	@return	sum of the two numbers
 */
function add(x, y) {
	var i = gcd(x, y);
	var r = new Rational(1,1);
	r.num = x.num * i / x.denom + y.num * i / y.denom;
	r.denom = i;
	return simplify(r);
}

/**
 *	Subtract one rational number from another
 *	@param	x,y: Rational
 *	@return	y subtracted from x
 */
function subtract(x, y) {
	var i = gcd(x, y);
	var r = new Rational(1,1);
	r.num = x.num * i / x.denom - y.num * i / y.denom;
	r.denom = i;
	return simplify(r);
}

/**
 *	Get the greater of two rational fractions
 *	@param	x,y: the two rational fractions
 *	@return	Rational, the greater of the two fractions
 */
function max(x, y) {
	var z = subtract(x,y);
	if (isNegative(z)) return y;
	else return x;
}

/**
 *	Get the lesser of two rational fractions
 *	@param	x,y: the two rational fractions
 *	@return	Rational, the lesser of the two fractions
 */
function min(x, y) {
	var z = subtract(y,x);
	if (isNegative(z)) return y;
	else return x;
}

/**
 *	Whether a rational fraction is >1
 *	@param	x: the rational fraction
 *	@return	true or false
 */
function isLtOne(x) {
	var z = simplify(x);
	return ((z.num - z.denom) < 0);
}

/**
 *	Whether a rational fraction is >1
 *	@param	x: the rational fraction
 *	@return	true or false
 */
function isGtOne(x) {
	var z = simplify(x);
	return ((z.num - z.denom) > 0);
}

/**
 *	Whether a rational fraction is 1
 *	@param	x: the rational fraction
 *	@return	true or false
 */
function isOne(x) {
	var z = simplify(x);
	return ((z.num - z.denom) == 0);
}

/**
 *	Whether a rational fraction is less than another
 *	@param	x,y: the two rational fractions
 *	@return	true or false
 */
function isLt(x, y) {
	var z = subtract(x,y);
	if (isNegative(z)) return true;
	else return false;
}

/**
 *	Whether a rational fraction is greater than another
 *	@param	x,y: the two rational fractions
 *	@return	true or false
 */
function isGt(x, y) {
	var z = subtract(y,x);
	if (isNegative(z)) return true;
	else return false;
}

/**
 *	Whether two rational fractions are equal
 *	@param	x,y: the two rational fractions
 *	@return	true or false
 */
function equals(x, y) {
	var z = subtract(x,y);
	if (isZero(z)) return true;
	else return false;
}

/**
 *	Covert a string to Rational
 *	@param	s: string to convert
 *	@return	Rational
 */
function toRational(s) {
	if (!s) return zero();
	if ("" == s) return zero();
	if ("NONE" == s.toUpperCase()) return zero();
	if ("0" == s) return zero();
	if ("1" == s) return one();
	var i = s.indexOf("/");
	if (i < 0) {
		alert("Cannot convert " + s + " to a rational fraction");
		return null;
	}
	var z = one();
	z.num = s.substring(0,i);
	z.denom = s.substring(i+1);
	if (z.denom < 0) {
		z.num = -(z.num);
		z.denom = -(z.denom);
	}
	return z;
}

/**
 *	Convert a Rational fraction to a string
 *	@param	x: Rational
 *	@return	string representation of the rational fraction
 */
function toString(x) {
	if ((x.num == -1) && (x.denom == 1)) return "TOSHARE";
	//else if ((x.num <0) && (x.denom >0)) return -(x.num) + "/" + x.denom + " TOSHARE";
	else if (isZero(x)) return "NONE";
	else if (isOne(x)) return "WHOLE";
	else return x.num + "/" + x.denom;
}
/*
function toRational(s) {
	console.log("Converting " + s + " to Rational...\n");
	if (!s) return zero();
	if ("" == s) return zero();
	if ("0" == s) return zero();
	if ("1" == s) return one();
	if (s.toUpperCase().indexOf("NONE")>=0) return zero();
	if (s.toUpperCase().indexOf("WHOLE")>=0) return one();
	if (s.toUpperCase().indexOf("TOSHARE")>=0) return new Rational(-1,1);
	if (/^-?\d*\d\/\d+$/.test(s) == false) {
		console.warn("Cannot convert " + s + " to a rational number");
		return null;
	}
	var z = zero();
	var i = s.indexOf("/");
	if (i >= 0) {
		z.num = s.substring(0,i);
		z.denom = s.substring(i+1);
		if (z.denom < 0) {
			z.num = -(z.num);
			z.denom = -(z.denom);
		}
	}
	return z;
}
*/
/**
 *	Whether a value is a valid rational fraction
 *	@param	x: a value to be validated as a correct rational fraction
 *	@return	true if x is a valid rational fraction, false otherwise
 */
function isValidRational(x) {
	if ((x instanceof Rational) && (x.num==NaN || x.denom==NaN)) {
		console.warn("Rational::isValid(" + x.num + "/" + x.denom + "}\n");
		return false;
	}
	else if ((x instanceof Rational) && (x.denom==0)) {
		console.warn("Rational::toString(" + x.num + "/" + x.denom + "}\n");
		return false;
	}
	else if (!(x instanceof Rational)) {
		console.warn("Non-Rational number passed to Rational::isValid(), " + x + "\n");
		return false;
	}	
	else return true;
}
/*
function toString(x) {
	if (!isValidRational(x)) return "NONE";
	else if (isZero(x)) return "NONE";
	else if (isOne(x)) return "WHOLE";
	else if ((x.num == -1) && (x.denom == 1)) return "TOSHARE";
	else return x.num + "/" + x.denom;
}
*/
