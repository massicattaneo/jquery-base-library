/* ****************************************************************************************************************
/*	Reference:																						   
 * 
 * about this file: 
 * 1) include this file after the "base2.js" && "jQuery" library
 * 2) include this file before the "jquery.base.forms-min.js" library 
 * 3) have some sections:
 * 		a. Prototypes
 * 		b. global variables (browser, core)
 * 		c. jquery extensions
 * 		d. base2 extensions (Pgraphics, Paudio, Pcanvas)
/* *****************************************************************************************************************/


/* **************************************************************************************************************** * 
 * a. PROTOTYPES SECTION 
 * ****************************************************************************************************************/

/* requestAnimationFrame: used for crossbrowsing animation in CANVAS.
 * returns a window.requestAnimationFrame based on the browser used. When the object is not supported returns a function that simulate the
 * functionality with setTimeout that is not so pretty to see but it works 
 *  */
window.requestNextAnimationFrame =
	(function () {
		var originalWebkitMethod,
		wrapper = undefined,
		callback = undefined,
		geckoVersion = 0,
		userAgent = navigator.userAgent,
		index = 0,
		self = this;
		// Workaround for Chrome 10 bug where Chrome
		// does not pass the time to the animation function
	if (window.webkitRequestAnimationFrame) {
		// Define the wrapper
		wrapper = function (time) {
			if (time === undefined) time = +new Date();
			self.callback(time);
		};
		// Make the switch
		originalWebkitMethod = window.webkitRequestAnimationFrame;
		window.webkitRequestAnimationFrame =
		function (callback, element) {
		self.callback = callback;
		// Browser calls wrapper; wrapper calls callback
		originalWebkitMethod(wrapper, element);
		}
	}
	// Workaround for Gecko 2.0, which has a bug in
	// mozRequestAnimationFrame() that restricts animations
	// to 30-40 fps.
	if (window.mozRequestAnimationFrame) {
		// Check the Gecko version. Gecko is used by browsers
		// other than Firefox. Gecko 2.0 corresponds to
		// Firefox 4.0.
		index = userAgent.indexOf('rv:');
		if (userAgent.indexOf('Gecko') != -1) {
			geckoVersion = userAgent.substr(index + 3, 3);
			if (geckoVersion === '2.0') {
				// Forces the return statement to fall through
				// to the setTimeout() function.
				window.mozRequestAnimationFrame = undefined;
			}
		}
	}
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (callback, element) {
		var start,
		finish;
		window.setTimeout( function () {
		start = +new Date();
		callback(start);
		finish = +new Date();
		self.timeout = 1000 / 60 - (finish - start);
		}, self.timeout);
	};
})();

/* indexOf: returns the position of an object (obj) in an array starting from 0 or start */
if (!Array.prototype.indexOf)
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    };

/* toFixed: returns a Number with float "precision"  */
if (!Number.prototype.toFixed)
    Number.prototype.toFixed = function (precision) {
        var power = Math.pow(10, precision || 0);
        return String(Math.round(this * power) / power);
    };

/* toCurrency: returns a String representing a currency number with 2 float seprated by '.' if 'dots' is true and with the currency 'symbol' */
Number.prototype.toCurrency = function (/*currency symbol*/symbol, /* boolean: use dots */dots) {
    symbol = symbol || "";
    dots = dots || false;
    var T, S = new String(Math.round(this * 100));
    while (S.length < 3) { S = '0' + S; }
    if (dots === false) {
        return symbol + S.substr(0, T = (S.length - 2)) + '.' + S.substr(T, 2);
    } else {
        var int = S.substr(0, T = (S.length - 2)).toString();
        for (i = int.length; i > 0; i--) {
            if (i % 3 == 0) {
                int = (int.substr(0, int.length - i)) + ',' + int.substr(int.length - i, int.length);
            }
        }
        return symbol + int + '.' + S.substr(T, 2);
    }
};

/* replaceAt: return a string and replace a char/string at a defined position (index) */
String.prototype.replaceAt = function (/*position, 1 based*/index, /* char/string */char) {
    var len = (char.length == 0) ? 1 : char.length;
    return this.substr(0, index - 1) + char + this.substr(index + len);
};

/* insertAt: return a string and add a char/string at a defined position (index) */
String.prototype.insertAt = function (/*position, 1 based*/index, /* char/string */char) {
    return this.substr(0, index) + char + this.substr(index);
};

/* removeAt: return a string and remove a char at a defined position (index) */
String.prototype.removeAt = function (/*position*/index) {
    return this.substr(0, index) + this.substr(index+1);
};

/* padLeft: add the character (char or 0 default) n times to the LEFT, till the length of the string reaches "len" - returns a String */
String.prototype.padLeft = function(size, char) {	
	char = char || "0";
	return (Array(size).join(char) + this).slice(-size);
};
/* removeHTMLTags: returns a parsed string with no HTML tags */
String.prototype.removeHTMLTags = function () {
    return this.replace(/<\/?[^>]+(>|$)/g, "");
}
/* removeHTMLTags: returns a parsed string with "word" highlighted by a tag (<strong> is default)  */
String.prototype.highlightWord = function (word, tag) {
    tag = (tag) ? tag : "strong";
    var regex = new RegExp('(' + word + ')', 'gi');
    return this.replace(regex, "<" + tag + ">$1</" + tag + ">");
}
/* isTime: check if is a string has time format
 * regEx: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
 *  */
String.prototype.isTime = function () {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(this);
}
/* isDate: check if a string has date format */
String.prototype.isDate = function () {
    var d = this.split('-');
    if (d.join("-").length < 10) return false;

    var date = new Date(d.join("-"));
    // check if date if date is incomplete
    if (/Invalid|NaN/.test(date)) return false;

    // check if the date exist (30/02/2012 no exist!!!)
    if (date.getDate() !== parseInt(d[2])) return false;

    return true;
}


/* parser:
 * from a string returns a typed object depending on the String content returned
 * types: Number, Date, String
 */
String.prototype.parser = function () {
    if (!isNaN(this)) {
        var num = 0;
        if (this.indexOf(".") == -1)
            num = parseInt(this);
        else
            num = parseFloat(this);
        return num;
    } else if (this.indexOf(core.language.currency) != -1 && !isNaN(this.replace(core.language.currency, ""))) {
    	var num = this.replace(core.language.currency, "");
    	if (this.indexOf(".") == -1)
            num = parseInt(this);
        else
            num = parseFloat(this);
        return num;
    } else {
        var d = this.split('/').reverse();
        var date = new Date(d.join("-"));
        // check if date is incomplete
        if (! (/Invalid|NaN/.test(date)))
            return date;
        else {
            return this.toString();
        }
    }
}
/* getMonthName: return the Month name - uses the core.language names */
Date.prototype.getMonthName = function () {return core.language.MonthNames[this.getMonth()];}
/* getShortMonthName: return the Short Month (3 chars) name - uses the core.language names */
Date.prototype.getShortMonthName = function () { return core.language.MonthNames[this.getMonth()].substr(0,3); }
/* getDayName: return the Day name - uses the core.language names */
Date.prototype.getDayName = function () { return core.language.DayNames[this.getDay()]; }
/* getShortDayName: return the Short Day (3 chars) name - uses the core.language names */
Date.prototype.getShortDayName = function () { return core.language.DayNames[this.getDay()].substr(0,3); }

/* normalize: normalize a date to a last/first milliseconds of day
 * set the hours,minutes,seconds and milliseconds to 
 * 	a. FALSE||NULL: 00:00:00:0000
 * 	b. TRUE: 23:59:59:999
 */
Date.prototype.normalize = function (/*
										 * (boolean) true for last milliseconds -
										 * false or null for first
										 */ end) {
    end = (typeof end != "undefined") ? end : false;
    if (!end) {
        this.setHours(1);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
    } else {
        this.setHours(23);
        this.setMinutes(59);
        this.setSeconds(59);
        this.setMilliseconds(999);
    }
}

/* toFormatString: 
 * return a String formatted date. Use: 
 * d -> 1 number day 
 * dd -> 2 number day 
 * ddd -> 3 char day name 
 * dddd -> complete day name 
 * mm -> 2 number month 
 * mmm -> 3 char month name 
 * mmmm -> complete month name 
 * yy -> 2 digit year
 * yyyy - > 4 digit year
 */
Date.prototype.toFormatString = function (pattern) {    
	pattern = pattern.replace("ddddd", this.getDayName());
    pattern = pattern.replace("dddd", this.getShortDayName());
    pattern = pattern.replace("dd", this.getDate().toString().padLeft(2));
    pattern = pattern.replace("d", this.getDate().toString());
    pattern = pattern.replace("mmmm", this.getMonthName());
    pattern = pattern.replace("mmm", this.getShortMonthName());
    pattern = pattern.replace("mm", (this.getMonth() + 1).toString().padLeft(2));
    pattern = pattern.replace("yyyy", this.getFullYear().toString());
    pattern = pattern.replace("yy", this.getFullYear().toString().substr(2, 2));    
    return pattern;
}

/* DiffToDate:
 * return an object with the difference in days,hours,minutes,seconds between
 * the prototype date and the passed one
 */
Date.prototype.DiffToDate = function (date) {
    var o = {days: 0,hours: 0,minutes: 0,seconds: 0};
    var difference = (date - this);

    o.days = parseInt(difference / 86400000);
    difference -= (o.days * 86400000);
    o.hours = parseInt(difference / 3600000);
    difference -= (o.hours * 3600000);
    o.minutes = parseInt(difference / 60000);
    difference -= (o.minutes * 60000);
    o.seconds = parseInt(difference / 1000);

    if (o.days <= 0 && o.hours <= 0 && o.minutes <= 0 && o.seconds <= 0) {
        o.days = "00";o.hours = "00";o.minutes = "00";o.seconds = "00";
    } else {
        o.days = o.days < 10 ? '0' + o.days : o.days;
        o.hours = o.hours < 10 ? '0' + o.hours : o.hours;
        o.minutes = o.minutes < 10 ? '0' + o.minutes : o.minutes;
        o.seconds = o.seconds < 10 ? '0' + o.seconds : o.seconds;
    }
    return o;
};


/* **************************************************************************************************************** * 
 * b. GLOBAL VARIABLES SECTION 
 * ****************************************************************************************************************/


/* browser:
 * get info about the browser used */
var browser = {    
	useTransitions: function() {
        var style = document.documentElement.style;
        if (
            style.webkitTransition !== undefined ||
            style.MozTransition !== undefined ||
            style.OTransition !== undefined ||
            style.MsTransition !== undefined ||
            style.transition !== undefined
        ) {
            return true;
        }
    return false;
    },
    useCanvas: function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    },
    useInputDate: function () {
        var input = document.createElement('input');
        input.setAttribute('type', 'date');
        var notADateValue = 'not-a-date';
        input.setAttribute('value', notADateValue);
        return !(input.value === notADateValue);
    },
    useInputTime: function () {
        var input = document.createElement('input');
        input.setAttribute('type', 'time');
        var notADateValue = 'not-a-time';
        input.setAttribute('value', notADateValue);
        return !(input.value === notADateValue);
    },
    isMobile: function() {    	
    	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

/* core: 
 * Some core functionalities and global variables about:
 * language
 * test (boolean value to check if we are in offline mode) && log: function to write to console * 
 * cookies
 * openPopUp
 * touch event unification
 * storage
 * screenMargin - set the margins of the body if for example there are some fixed elements on top, bottom, left, right (used for example to position the balloon/tooltip)
 * preventUnloadMsg && unloadMessage: store if is wanted to prevent the exit browser alert message
 * keyPressed: store is a key is pressed
 * */ 
var core = {
    language: {
        code: "ENG",
        currency: "�",
        internationalPhonePrefix: "+44",
        useDotDecimalSeparator: true,
        shortDateFormat: "dd/mm/yyyy",
        DayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],        
        MonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        connectionError: "A connection error occured. Please try again later."
    },
    setLanguage: function (options) {
        core.language = $.extend({}, core.language, options);
    },    
    setLanguageByCode: function(code) {
        switch (code) {
            case "ITA":
                core.setLanguage({
                    code: "ITA",
                    currency: "�",
                    internationalPhonePrefix: "+39",
                    useDotDecimalSeparator: false,
                    shortDateFormat: "dd/mm/yyyy",
                    DayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
                    MonthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                    connectionError: "Abbiamo riscontrato un problema di connessione. Ci scusiamo per il disagio."
                });
                break;
            default:
                // no operations leave ENG
                break;
        }
    },
    /* core.isTest: boolean value */
    isTest: false,    
    /* core.log: lof function based on core.isTest value */
    log: function(logMsg) {
    	if (this.isTest === true && typeof window.console != "undefined" )
    		console.log(logMsg);
    },    
    /* cookie section */
    setCookie: function (name, value, exdays, path) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        value = encodeURI(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString()) + "; path=" + path;
        document.cookie = name + "=" + value;
    },

    getCookie: function (name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + name + "=");

        if (c_start == -1)
            c_start = c_value.indexOf(name + "=");

        if (c_start == -1) {
            c_value = null;
        }
        else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1)
                c_end = c_value.length;
            c_value = decodeURI(c_value.substring(c_start, c_end));
        }

        return c_value;
    },

    deleteCookie: function (name, path) {
	    core.setCookie (name,"",-1, path);
	},

    isCookieEnabled: function (path) {
		path = (path) ? path : "";
		core.setCookie("ckTst_01_02_03", "test", 1, path);
		var isCookie =  core.getCookie("ckTst_01_02_03") != null;
		core.deleteCookie ("ckTst_01_02_03", path);
		return isCookie;
	},
	
	/* open a standard browser Popup */
    openPopUp: function (url, title, /* width */ w, /* height */h) {
		var left = (screen.width/2)-(w/2);
		var top = (screen.height/2)-(h/2);
		return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    },

    /* touch event unification */
    getEventCoordX : function (event) {
        if (event.type.toString().match(/mouse/))
            return event.pageX;
        else if (event.type.toString().match(/touch/))
            return event.touches[0].pageX;
        else if (event.type.toString().match(/pointer/))
            return event.originalEvent.pageX;
        else if (event.type.toString().match(/MSPointer/))
            return event.originalEvent.pageX;
    },
    getEventCoordY: function (event) {
        if (event.type.toString().match(/mouse/))
            return event.pageY;
        else if (event.type.toString().match(/touch/))
            return event.touches[0].pageY;
        else if (event.type.toString().match(/pointer/))
            return event.originalEvent.pageY;
        else if (event.type.toString().match(/MSPointer/))
            return event.originalEvent.pageY;
    },
    setStorage : function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getStorage : function (key) {
        return JSON.parse(localStorage.getItem(key));
    },
    screenMargin: [0,0,0,0],
    
    preventUnloadMsg : false,
    
    unloadMessage: "",

    keyPressed: null
}

/* **************************************************************************************************************** */
/* c. JQUERY EXTENSIONS
/* **************************************************************************************************************** */

jQuery.fn.extend({
    /* animate scroll to the element */
	scrollToMe: function (vel, offSet) {        
    	vel = vel || 400;
        offSet = offSet || 0;
        var x = $(this).offset().top;
        $('html,body').animate({ scrollTop: x + offSet}, vel);
        return this;
    },
    /* returns if an element is visible on the screen inside margin
     * will be possible to use the core.screenMargin??
     *  */
    visible: function (margin) {
        if (this.length < 1)
            return;    	
        margin = (typeof margin != "undefined") ? margin : [0,0,0,0] // top,
																		// right,
																		// bottom,
																		// left
																		// (like
																		// css
																		// margins)    	
        var $t        = this.length > 1 ? this.eq(0) : this,
        	$w = $(window);
        viewTop         = $w.scrollTop(),
        viewBottom      = viewTop + $w.height(),           
        compareTop      = $t.offset().top,
        compareBottom   = $t.offset().top + $t.height();
        return ((compareBottom + margin [2] <= viewBottom) && (compareTop - margin [0] >= viewTop));

    },
    /* center and element on the screen */
    centerOnScreen: function () {
        this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
        return this;
    },
    /*jquery log function - probably not used (is an old one)*/
    log : function (msg) {
        if (navigator.userAgent.match(/Chrome/i) == "Chrome")
            console.log("LOGGER: " + msg, "|| <" + $(this).prop("tagName") + " id='" + $(this).attr("id") + "' />");
        return this;
    },
    /* returns a value from a whatever HTML input (text/radio/checkbox), select, textarea */
    getElementVal: function () {            	
        var ret = "";
        if (this.length == 1) {
            switch (this.prop("tagName")) {
                case "INPUT":
                    if (this.attr("type") == "checkbox" || this.attr("type") == "radio") {
                        ret = this.prop("checked");
                    } else {
                        ret = this.val().toString();
                    }
                    break;
                case "SELECT":
                    ret = this.val();
                    break;
                case "TEXTAREA":
                    ret = this.val().toString().trim();
                    break;
                default:                    
                    break;
            }
        } else if (this.length > 1) {
            if (this.attr("type") == "checkbox" || this.attr("type") == "radio") {
                return this.filter(':checked').val();
            }
        } 
        return (typeof ret != undefined) ? ret : "";
    },
    /* return or set the dimension (dim) based on the type (height/width)*/
    dimension: function (type,dim) {
        if (typeof dim != "undefined") {
            if (type == "width") {
                this.width(dim);
                return this;
            } else if (type == "height") {
                this.height(dim);
                return this;
            }
        } else {
            if (type == "width") {
                return this.width();
            } else if (type == "height") {
                return this.height();
            }
        }
    },
    /* return the inner dimension based on the type (height/width)*/
    innerDimension: function (type) {
        if (type == "width") {
            return this.innerWidth();
        } else if (type == "height") {
            return this.innerHeight();
        }
    },
    /* return the outer dimension based on the type (height/width) - bool paramenter is the jquery one*/
    outerDimension: function (type,bool) {
        if (typeof bool != "undefined") {
            if (type == "width") {
                return this.outerWidth(bool);
            } else if (type == "height") {
                return this.outerHeight(bool);
            }
        } else {
            if (type == "width") {
                return this.outerWidth();
            } else if (type == "height") {
                return this.outerHeight();
            }
        }
    },
    /* return the position of the cursor in an input field */ 
    caretPos: function (pos) {
        var o = this.get(0);
        if (typeof pos == "undefined") {
            var iCaretPos = 0;
            // IE Support
            if (document.selection) {
                // Set focus on the element
                o.focus();
                // To get cursor position, get empty selection range
                var oSel = document.selection.createRange();
                // Move selection start to 0 position
                oSel.moveStart('character', -o.value.length);
                // The caret position is selection length
                iCaretPos = oSel.text.length;
            }
            else {
                iCaretPos = o.selectionStart;
            }
            // Return results
            return (iCaretPos);
        } else {
            o.selectionStart = pos;
            o.selectionEnd = pos;
            return this;
        }

    },
    /* select all the text in an input field */
    selectAll: function () {
        var o = this.get(0);
        // IE Support
        if (document.selection) {
            // Set focus on the element
            o.focus();
            // To get cursor position, get empty selection range
            var oSel = document.selection.createRange();
            // Move selection start to 0 position
            oSel.moveStart('character', -o.value.length);
            // The caret position is selection length
            iCaretPos = oSel.text.length;
        }
        else {
            o.selectionStart = 0;
            o.selectionEnd = o.value.length;
        }
        return this;
    },
    /* animate an html object with css transitions if supported or fallback to jquery animate function */
    moveAnimate: function (direction, position) {
        if (browser.useTransitions()) {
            $(this).addClass("animate"); $(this).css(direction, position);
            var _this = this; setTimeout(function () { $(_this).removeClass("animate"); }, 500);
        }
        else {
            var obj = {}; obj[direction] = position; $(this).animate(obj, 500);
        }
        return this;
    }
});

/*
 * CUSTOMIZED JQUERY EVENTS
 * trigger an addClass, removeClass events when the function is called
 */
(function ($) {
    classFuncs = { add: $.fn.addClass, remove: $.fn.removeClass }
    // Add Class
    $.fn.addClass = function () {
        classFuncs.add.apply(this, arguments);
        $(this).trigger('addClass', arguments);
        return $(this);
    }
    // Remove Class
    $.fn.removeClass = function () {
        classFuncs.remove.apply(this, arguments);
        $(this).trigger('removeClass', arguments);
        return $(this);
    }    
})(jQuery);

/* **************************************************************************************************************** */
/* d. BASE EXTENSIONS
 * Packages are closures and they export only some publics methods
 * 2 packages:  
 * 		1) Graphics package: base2.Pgraphics - exports: "color, HexToRgb, RgbToHex, RgbToHsl, HslToRgb, RgbToHsv, HsvToRgb"
 * 		2) Audio package: base2.Paudio - exports: "Sound,Note"
 * 		3) Camvas package: base2.Pcanvas - exports: "Point, setPointOptions"
 */
/* **************************************************************************************************************** */

// PACKAGE GRAPHICS
new function (_) { // create the closure
 // create the package object
 var Pgraphics = new base2.Package(this, {
     name: "Pgraphics",
     version: "1.0",
     imports: "",
     exports: "color,HexToRgb,RgbToHex,RgbToHsl,HslToRgb,RgbToHsv,HsvToRgb"
 });

 // evaluate the imported namespace
 eval(this.imports);

 var color = base2.Base.extend({
     _value: [],
     constructor: function (/*
							 * accepted format Hex(#f0f0f0), ColorName(aqua),
							 * RGB(255,255,255)
							 */color) {
         this.setValue(color);
     },
     setValue: function (/*
							 * accepted format Hex(#f0f0f0), ColorName(aqua),
							 * RGB(255,255,255)
							 */color) {         
         if (/^#[a-fA-F0-9]{6}$/.test(color)) {
             this._value = HexToRgb(color);
         }
         else if (/^[a-z]+$/.test(color)) {
             this._value = HexToRgb(colornames[color]);
         }
         else if (/\d+,\d+,\d+/.test(color)) {
             this._value = color.split(",");
         }
     },
     setFromHSV: function (h, s, v) {
         this._value = HsvToRgb(h, s, v);
     },
     /* return format: string #ff1122 */
     getHex: function () {
         return RgbToHex(this._value.join(","));
     },
     /* return format: array */
     getRGB: function () {
         return this._value;
     },
     /* return format: array */
     getHSV: function () {
         return RgbToHsv(this._value[0], this._value[1], this._value[2]);
     },
     /* return format: array */
     getHSL: function () {
         return RgbToHsl(this._value[0], this._value[1], this._value[2]);
     },
     changeLum: function (lum) {         
         var c = this.getHSL();
         var ret = HslToRgb(c[0], c[1], lum);
         this.setValue(""+parseInt(ret[0])+","+ parseInt(ret[1])+","+ parseInt(ret[2]));         
     }
 });
 
 /* return format: array */
 var HexToRgb = function (/* HEX color - format:#1233456 */hex) {
     hex = (hex) ? '0x' + hex.toString().substring(1) : "";
     hex = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
     return hex;
 };
 /* return format: string #ff1122 */
 var RgbToHex = function (/* RGB color - format:255,255,255 */rgb) {
     var tem, i = 0, rgb = rgb ? rgb.toString().toLowerCase() : '';
     rgb = rgb.match(/\d+(\.\d+)?%?/g) || [];
     if (rgb.length < 3) return '';
     rgb = rgb.slice(0, 3);
     while (i < 3) {
         tem = rgb[i];
         if (tem.indexOf('%') != -1) {
             tem = Math.round(parseFloat(tem) * 2.55);
         }
         else tem = parseInt(tem);
         if (tem < 0 || tem > 255) rgb.length = 0;
         else rgb[i++] = tem.toString(16).padLeft(2);
     }
     if (rgb.length == 3) return '#' + rgb.join('').toLowerCase();
     return '';
 };
 /* return format: array */
 var RgbToHsl= function (r, g, b) {
     r /= 255, g /= 255, b /= 255;
     var max = Math.max(r, g, b), min = Math.min(r, g, b);
     var h, s, l = (max + min) / 2;
     if (max == min) {
         h = s = 0; // achromatic
     } else {
         var d = max - min;
         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
         switch (max) {
             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
             case g: h = (b - r) / d + 2; break;
             case b: h = (r - g) / d + 4; break;
         }
         h /= 6;
     }
     return [h, s, l];
 };
 /* return format: array */
 var HslToRgb = function (h, s, l) {
     var r, g, b;
     if (s == 0) {
         r = g = b = l; // achromatic
     } else {
         function hue2rgb(p, q, t) {
             if (t < 0) t += 1;
             if (t > 1) t -= 1;
             if (t < 1 / 6) return p + (q - p) * 6 * t;
             if (t < 1 / 2) return q;
             if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
             return p;
         }
         var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
         var p = 2 * l - q;
         r = hue2rgb(p, q, h + 1 / 3);
         g = hue2rgb(p, q, h);
         b = hue2rgb(p, q, h - 1 / 3);
     }
     return [r * 255, g * 255, b * 255];
 };
 /* return format: array */
 var RgbToHsv = function (r, g, b) {
     r = r / 255, g = g / 255, b = b / 255;
     var max = Math.max(r, g, b), min = Math.min(r, g, b);
     var h, s, v = max;
     var d = max - min;
     s = max == 0 ? 0 : d / max;
     if (max == min) {
         h = 0; // achromatic
     } else {
         switch (max) {
             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
             case g: h = (b - r) / d + 2; break;
             case b: h = (r - g) / d + 4; break;
         }
         h /= 6;
     }
     return [h, s, v];
 };
 /* return format: array */
 var HsvToRgb = function (h, s, v) {
     var r, g, b;
     var i = Math.floor(h * 6);
     var f = h * 6 - i;
     var p = v * (1 - s);
     var q = v * (1 - f * s);
     var t = v * (1 - (1 - f) * s);
     switch (i % 6) {
         case 0: r = v, g = t, b = p; break;
         case 1: r = q, g = v, b = p; break;
         case 2: r = p, g = v, b = t; break;
         case 3: r = p, g = q, b = v; break;
         case 4: r = t, g = p, b = v; break;
         case 5: r = v, g = p, b = q; break;
     }
     return [Math.round(r * 255), Math.round(g * 255),Math.round(b * 255)];
 }
 var colornames = {
         aqua: '#00ffff', black: '#000000', blue: '#0000ff', fuchsia: '#ff00ff',
         gray: '#808080', green: '#008000', lime: '#00ff00', maroon: '#800000',
         navy: '#000080', olive: '#808000', purple: '#800080', red: '#ff0000',
         silver: '#c0c0c0', teal: '#008080', white: '#ffffff', yellow: '#ffff00'
 }

 // evaluate the exported namespace (this initialises the Package)
 eval(this.exports);
};

// PACKAGE AUDIO
new function (_) { // create the closure
 // create the package object
 var Paudio = new base2.Package(this, {
     name: "Paudio",
     version: "1.0",
     imports: "",
     exports: "Sound,Note"
 });

 // evaluate the imported namespace
 eval(this.imports);

 var Sound = base2.Base.extend({
     constructor: function (config) {
         this.config = $.extend(this.config, config);
     },
     config: {
         channels: 1,
         sampleRate: 11025, // Hz
         bitDepth: 16, // bits/sample
         seconds: 0.8,
         volume: 15000,// 32767
     },        
     getDataURI: function () {            
         return toDataURI(this.config);
     },
     play: function (evt) {
         var sound = new Audio(this.getDataURI());
         sound.pause();
         try {
             sound.currentTime = 0.001; // HACK - was for mobile safari, but
										// sort of doesn't matter...
         } catch (x) { }
         sound.play();
     }
 });

 var Note = Sound.extend({
     constructor: function (/* Example C4(440Hz),C#4,Bb4 */ note, /*
																	 * the
																	 * length of
																	 * the note
																	 */length, /*
																										 * the
																										 * quantity
																										 * of 1
																										 * length
																										 * in 1
																										 * minute
																										 */ timeVelocity) {
         this.note = textNoteTuNum(note) || textNoteTuNum("C4");
         this.config.freq = noteToFreq(this.note);
         this.length = length || 1;
         this.timeVelocity = timeVelocity || 30;
     },
     note: 0, // MIDDLE C
     length: 1, // 4/4
     timeVelocity: 30 // 120 quarter per minute
 });


 function toDataURI(cfg) {

     cfg = $.extend({
         channels: 1,
         sampleRate: 11025, // Hz
         bitDepth: 16, // bits/sample
         seconds: .5,
         volume: 10000,// 32767,
         freq: 440
     }, cfg);

     //
     // Format Sub-Chunk
     //

     var fmtChunk = [
         'fmt ', // sub-chunk identifier
         asBytes(16, 4), // chunk-length
         asBytes(1, 2), // audio format (1 is linear quantization)
         asBytes(cfg.channels, 2),
         asBytes(cfg.sampleRate, 4),
         asBytes(cfg.sampleRate * cfg.channels * cfg.bitDepth / 8, 4), // byte
																		// rate
         asBytes(cfg.channels * cfg.bitDepth / 8, 2),
         asBytes(cfg.bitDepth, 2)
     ].join('');

     //
     // Data Sub-Chunk
     //

     var sampleData = DataGenerator(
         cfg.styleFn || DataGenerator.style.wave,
         cfg.volumeFn || DataGenerator.volume.linearFade,
         cfg);
     var samples = sampleData.length;

     var dataChunk = [
         'data', // sub-chunk identifier
         asBytes(samples * cfg.channels * cfg.bitDepth / 8, 4), // chunk length
         sampleData.join('')
     ].join('');

     //
     // Header + Sub-Chunks
     //

     var data = [
         'RIFF',
         asBytes(4 + (8 + fmtChunk.length) + (8 + dataChunk.length), 4),
         'WAVE',
         fmtChunk,
         dataChunk
     ].join('');

     if (canBlob) {
         // so chrome was blowing up, because it just blows up sometimes
         // if you make dataURIs that are too large, but it lets you make
         // really large blobs...
         var view = new Uint8Array(data.length);
         for (var i = 0; i < view.length; i++) {
             view[i] = data.charCodeAt(i);
         }
         var blob = new Blob([view], { type: 'audio/wav' });
         return window.webkitURL.createObjectURL(blob);

     } else {
         return 'data:audio/wav;base64,' + btoa(data);
     }
 }

 function asBytes(value, bytes) {
     // Convert value into little endian hex bytes
     // value - the number as a decimal integer (representing bytes)
     // bytes - the number of bytes that this value takes up in a string

     // Example:
     // asBytes(2835, 4)
     // > '\x13\x0b\x00\x00'
     var result = [];
     for (; bytes > 0; bytes--) {
         result.push(String.fromCharCode(value & 255));
         value >>= 8;
     }
     return result.join('');
 }

 function attack(i) {
     return i < 200 ? (i / 200) : 0.6;
 }

 function noteToFreq(stepsFromMiddleC) {
     return 440 * Math.pow(2, (stepsFromMiddleC + 3) / 12);
 }
 
 function textNoteTuNum(textNote) {
     var transform = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
     var pos = 0;
     var num = parseInt(transform[textNote.charAt(pos++)], 10);
     if (isNaN(textNote.charAt(pos))) 
         num += (textNote.charAt(pos++) == "#") ? 1 : -1;
     num += (parseInt(textNote.charAt(pos)) - 4) * 12;
     return num;
 }
 
 var DataGenerator = $.extend(
     function (styleFn, volumeFn, cfg) {
         cfg = $.extend({
             freq: 440,
             volume: 32767,
             sampleRate: 11025, // Hz
             seconds: .5,
             channels: 1
         }, cfg);

         var data = [];
         var maxI = cfg.sampleRate * cfg.seconds;
         for (var i = 0; i < maxI; i++) {
             for (var j = 0; j < cfg.channels; j++) {
                 data.push(
                     asBytes(
                         volumeFn(
                             styleFn(cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI),
                             cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI
                         ) * attack(i), 2
                     )
                 );
             }
         }
         return data;
     }, {
         style: {
             wave: function (freq, volume, i, sampleRate, seconds) {
                 // wave
                 // i = 0 -> 0
                 // i = (sampleRate/freq)/4 -> 1
                 // i = (sampleRate/freq)/2 -> 0
                 // i = (sampleRate/freq)*3/4 -> -1
                 // i = (sampleRate/freq) -> 0
                 return Math.sin((2 * Math.PI) * (i / sampleRate) * freq);
             },
             squareWave: function (freq, volume, i, sampleRate, seconds, maxI) {
                 // square
                 // i = 0 -> 1
                 // i = (sampleRate/freq)/4 -> 1
                 // i = (sampleRate/freq)/2 -> -1
                 // i = (sampleRate/freq)*3/4 -> -1
                 // i = (sampleRate/freq) -> 1
                 var coef = sampleRate / freq;
                 return (i % coef) / coef < .5 ? 1 : -1;
             },
             triangleWave: function (freq, volume, i, sampleRate, seconds, maxI) {
                 return Math.asin(Math.sin((2 * Math.PI) * (i / sampleRate) * freq));
             },
             sawtoothWave: function (freq, volume, i, sampleRate, seconds, maxI) {
                 // sawtooth
                 // i = 0 -> -1
                 // i = (sampleRate/freq)/4 -> -.5
                 // i = (sampleRate/freq)/2 -> 0
                 // i = (sampleRate/freq)*3/4 -> .5
                 // i = (sampleRate/freq) - delta -> 1
                 var coef = sampleRate / freq;
                 return -1 + 2 * ((i % coef) / coef);
             }
         },
         volume: {
             flat: function (data, freq, volume) {
                 return volume * data;
             },
             linearFade: function (data, freq, volume, i, sampleRate, seconds, maxI) {
                 return volume * ((maxI - i) / maxI) * data;
             },
             quadraticFade: function (data, freq, volume, i, sampleRate, seconds, maxI) {
                 // y = -a(x - m)(x + m); and given point (m, 0)
                 // y = -(1/m^2)*x^2 + 1;
                 return volume * ((-1 / Math.pow(maxI, 2)) * Math.pow(i, 2) + 1) * data;
             }
         }
     });

 function canBlob() {
     var canBlob = false;
     if (window.webkitURL && window.Blob) {
         try {
             new Blob();
             canBlob = true;
         } catch (e) { }
     }
     return canBlob;
 }
 

 // evaluate the exported namespace (this initialises the Package)
 eval(this.exports);
};

// PACKAGE CANVAS
new function (_) { // create the closure
    // create the package object
    var Pcanvas = new base2.Package(this, {
        name: "Pcanvas",
        version: "1.0",
        imports: "",
        exports: "Point"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var rand = function (min, max) {
        return Math.floor((Math.random() * (max - min + 1)) + min);
    };
    var ease = function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }

    
    var Point = function (config) {
        this.anchorX = config.x;
        this.anchorY = config.y;
        this.x = config.x;
        this.y = config.y;
        this.config = {};
        this.config.rangeX = config.rangeX;
        this.config.rangeY = config.rangeY;
        this.config.durationMin = config.durationMin;
        this.config.durationMax = config.durationMax;
        this.setTarget(config);
    };

    Point.prototype.setTarget = function () {
        this.initialX = this.x;
        this.initialY = this.y;
        this.targetX = this.anchorX + rand(0, this.config.rangeX * 2) - this.config.rangeX;
        this.targetY = this.anchorY + rand(0, this.config.rangeY * 2) - this.config.rangeY;
        this.tick = 0;
        this.duration = rand(this.config.durationMin, this.config.durationMax);
    }

    Point.prototype.update = function () {
        var dx = this.targetX - this.x;
        var dy = this.targetY - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dist) <= 0) {
            this.setTarget();
        } else {
            var t = this.tick;
            var b = this.initialY;
            var c = this.targetY - this.initialY;
            var d = this.duration;
            this.y = ease(t, b, c, d);

            b = this.initialX;
            c = this.targetX - this.initialX;
            d = this.duration;
            this.x = ease(t, b, c, d);

            this.tick++;
        }
    };

    Point.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = '#000';
        ctx.fill();
    };

    // evaluate the exported namespace (this initialises the Package)
    eval(this.exports);
};