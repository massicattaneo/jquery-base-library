/// <reference path="base2.js" />
/// <reference path="jQuery-min-1.10.2.js" />
/// <reference path="core.js" />

/*
Created by Max
Thanks to Jquery 1.10.2 & base2.js
*/

/********************************************************************************** Logger *********************************************************************************/
var logger = base2.Base.extend({
    //Instantiate
    constructor: function () { },

    //boolean: debug mode active
    debug: false,

    //select on which browser use the logger
    _logUse: function () {
        //return (typeof console.log != "undefined");
        return navigator.userAgent.match(/Chrome/i) == "Chrome";
    },

    // log messages if debug is true - log txtmessages or all the properties of a passed object
    log: function (logMsg) {
        var self = this;
        if (self._logUse() === true && self.debug === true) {
        	core.log(self._stdMessage + logMsg + " " + new Date().getMilliseconds() + " - OBJECT: " + this.el.prop("tagName") + ((typeof this.el.prop("id") != "undefined") ? "#" + this.el.prop("id") : ""));
        }
    },
    // standard message printed before the log message
    _stdMessage: "LOGGER - "
});


/********************************************************************************** Standard object *********************************************************************************/
var jQueryBase = logger.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options, options);
        this.debug = this.options.debug;
        this.base();
        this.el = (typeof elem != "undefined") ? $(elem) : $("<div/>");     // jQuery element
        this.oEl = elem;                                                    // original HTML element
    },

    // jQuery general object
    el: $(),

    oEl: null,

    keyCodes: {
        PAGE_DOWN: 34, PAGE_UP:33, DOWN_ARROW: 40, UP_ARROW: 38, LEFT_ARROW: 37, RIGHT_ARROW: 39, ENTER: 13, TAB: 9, SHIFT: 16, 
        BACK_SPACE: 8, CANC: 46, FUNCTION_KEYS: [40, 38, 37, 39, 13, 9, 16, 8], ALPHABETS_START : 47,
        NUMBER_KEYS: [48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105]},

    // jQuery default settings
    options: {
        debug: core.isTest
    },
    
    type: "jQueryBase"
    
});

/********************************************************************************** remove class "active" on document click *********************************************************************************/
$(document).ready(function () { $(document).on("click", function (e) { $(".element-wrapper.active, .group-wrapper.active").removeClass("active"); }); });

/************************************ wrapper generic container for redesign HTML elements - container will be a div with cssClass: element-wrapper *******************************/
var wrapper = jQueryBase.extend({
    
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                idPrefix: "wrap-",							/* prefix to add for naming the wrapper id: will be "prefix + IDelement" */
                noActive: false, 							/* if True the object will not take the .active class  */
                mainCss: "",								/* class to add the the wrapper */
                extraEventListner: new base2.Collection() 	/* collection of actions to bind (Jquery) - key: "action", value: function() {} */                
            }
        );
        this.base(options, elem);
        this._createWrapper();
        var _self = this;
        this.el.bind("refreshHandler", function () { _self.log("inside bind refresh"); _self.refresh(); }); 
        /* bind extra Event Listener */
        this.options.extraEventListner.forEach(function (func, key) {
            _self.el.on(key, function (e) { func.call(_self, e) });
        });
    },

    // jQuery container for the wrapper
    wrapper: $(),
    wrapperUpdate: $(),

    // create the wrapper
    _createWrapper: function () {
        this.el.wrap('<div class="element-wrapper" />');
        this.wrapper = this.el.parent();
        this.wrapper.addClass(this.options.mainCss);

        /* create property id for wrapper */
        if (typeof this.el.attr("id") != "undefined") {
            this.id = this.options.idPrefix + this.el.attr("id");
            this.wrapper.attr("id", this.id);
        }

        /* container for the wrapper updating - display a refreshing moving icon */
        this.wrapperUpdate = $('<div class="updatingIcon"><div>&#xF021;</div></div>');
        this.el.before(this.wrapperUpdate);

    },

    startUpdating: function () { 
    	this.wrapperUpdate.css("line-height", this.wrapper.height() + "px"); 
    	this.wrapper.addClass("updating"); 
	},
    stopUpdating: function () { this.wrapper.removeClass("updating"); },
    actionUpdate: function (time) {this.startUpdating(); var _self=this; setTimeout(function() {_self.stopUpdating();}, time);},
    id: "",

    /* available on all extension - refresh the graphics element */
    refresh: function () {
        var _self = this;
        this.log("refreshing wrapper");
        this.el.unbind();
        this.el.bind("refreshHandler", function () { _self.refresh(); });
        /* bind extra Event Listener */        
        this.options.extraEventListner.forEach(function (func, key) {            
            _self.el.on(key, function (e) { func.call(_self, e) });
        });        
        this.wrapper.unbind();
    },

    /* available on all extension - return users explanation of the use of the component */
    helpHtml: "",
    help: function () { return this.helpHtml; }

});

/************************************************************************* generic icon for the wrapper element ******************************************/
var icon = wrapper.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                iconEnabled: false,		//turn to true to create the icon
                iconType: "text"		//type of the icon (see the forms.css to view/add the types) - you can also add it through the data-icon attribute
            }
        );
        this.base(options, elem);

        var _self = this;

        if (this.options.iconEnabled || typeof this.el.attr("data-icon-type") != "undefined") {
            this._createIcon();
            if (this.el.attr("disabled") == "disabled")
                this._bindIconEvents();
        }
    },

    // jQuery container for the icon
    icon: $(),

    _createIcon: function () {
        if (this.el.attr("data-icon-type"))
            this.options.iconType = this.el.attr("data-icon-type");

        this.icon = $('<div class="icon"><div class="info"></div></div>');
        this.icon.addClass(this.options.iconType);

        if (this.wrapper.outerHeight() <= 29) {
            this.icon.width(this.wrapper.outerHeight());
            this.icon.css("line-height", this.wrapper.outerHeight() + "px");
            this.icon.css("font-size", this.wrapper.outerHeight() * 0.7 + "px");
        } else {
            this.icon.width(27); this.icon.height(27); this.icon.css("line-height", "27px"); this.icon.css("border-radius", "0px 0px 0px 11px");
            this.icon.css("font-size", "100%");
        }

        this.wrapper.append(this.icon);
    },

    _bindIconEvents: function () {
        var _self = this;

        this.icon.click(function () {
            _self.log("click on icon");
            _self.el.focus();
        })
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing icon");
        this.icon.unbind();
        if (this.el.attr("disabled") == "disabled")
            this._bindIconEvents();
    }

});

/************************************************************************* placeholder implementation - add a label inside the element-wrapper ******************************************/
var placeholder = icon.extend({

    constructor: function (options, elem) {

        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                //text of te placeholder
                placeholderText: ""  //text to add - you can also add it through the data-placeholder attribute
            }
        );
        this.base(options, elem);
        if ((typeof this.el.attr("data-placeholder") != "undefined" || this.options.placeholderText != "")) {
            this.options.placeholderText = this.el.attr("data-placeholder");
            this._createPlaceholder();
            this._setUpPlaceholder();
        }
    },

    // jQuery container for the placeholder
    placeholder: $(),

    //create the placeholder label
    _createPlaceholder: function () {
        this.placeholder = $('<div class="placeholder"/>');
        this.placeholder.css("top", this.el.css("padding-top"));
        this.placeholder.text(this.options.placeholderText);
        this.el.before(this.placeholder);
    },

    // bind the events for the placeholder
    _bindPlaceholderEvents: function () {
        var _self = this;
        this.placeholder.on('selectstart', false);
        this.placeholder.click(function (e) {
            _self.log("click on placeholder");
            e.preventDefault();
            _self.el.focus();
        });

        this.el.bind("keydown", function () { _self.placeholder.hide(); });

        this.el.bind("focus blur keyup change OriginalChange", function () {
            _self.log("item change on placeholder");
            _self._displayinputBox();
        });

    },

    _displayinputBox: function () {
        if (this.el.val() == "") {
            this.placeholder.show();
        } else {
            this.placeholder.hide();
        }
    },

    _setUpPlaceholder: function () {
        if (this.el.attr("disabled") != "disabled") {
            this._bindPlaceholderEvents();
            this._displayinputBox();
        } else {
            this.placeholder.hide();
        }
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing placeholder");
        this.placeholder.unbind();
        this._setUpPlaceholder();
    }

});
/************************************************************************* generic group for group more HTML elements into one container ******************************************/
var IGroup = base2.Module.extend({
    groupItems: {},

    addGroupItem: function (implementer) {
        if (implementer.options.groupName != "") {
            if (typeof this.groupItems[implementer.options.groupName] == "undefined")
                this.groupItems[implementer.options.groupName] = [];
            this.groupItems[implementer.options.groupName].push(implementer);
            implementer.groupCount = this.groupItems[implementer.options.groupName].length - 1;
        }
    },
    groupItemsCount: function (implementer) { return this.groupItems[implementer.options.groupName].length },
    getGroupItems: function () { return this.groupItems }

});

var group = placeholder.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                groupName: "",			// The name of the group
                activeOnHover: 0,		// add the active class when the mouse is over after a period (milliseconds)
                activeOnOut: 0,			// remove the active class when mouse is out after a period (milliseconds)
                autofillRefresher: 0 	// if 0 disabled else the milliseconds timeout refreshing period
            }
        );
        this.base(options, elem);
        this._createGroup();
        this._setUpGroup();
        this.addGroupItem();
    },

    // jQuery container for the group
    group: $(),
    groupCount: -1,

    // create the group
    _createGroup: function () {
        // wrap the element wrapper in a group wrapper
        var gr = this.el.attr("data-group");
        if (typeof gr != "undefined") {
            this.options.groupName = gr;
            /* if group exist don't create it and only add the element to it */
            if ($(".group-wrapper." + gr).length == 0) {
                this.wrapper.wrap('<div class="group-wrapper ' + gr + '" />');
                this.group = this.wrapper.parent();
            }
                /* else create the group and add the element */
            else {
                $(".group-wrapper." + gr).append(this.wrapper);
                this.group = $(".group-wrapper." + gr);
                this.group.addClass(this.options.mainCss);
            }
        }
    },

    // bind events
    _bindGroupEvents: function () {
        var _self = this;

        //set the active        
        if (this.options.activeOnHover != 0) {
            //on hover
            this.wrapper.mouseenter(function () { _self.hoverTimeout = setTimeout(function () { $(".active").removeClass("active"); _self.el.addClass("active"); }, _self.options.activeOnHover); });
            this.wrapper.mouseleave(function () { 
            	clearTimeout(_self.hoverTimeout); 
            	if (_self.options.activeOnOut != 0) {
            		_self.hoverTimeout = setTimeout(function () {$(".active").removeClass("active");}, _self.options.activeOnOut);            		
            	}
            });
        }
        this.wrapper.mouseenter(function () { _self.el.addClass("hover"); });
        this.wrapper.mouseleave(function () { _self.el.removeClass("hover"); });


        // on click
        if (this.options.groupName != "")
            this.group.click(function (e) {
                _self.log("click on group");
                e.stopPropagation();
            });
        this.wrapper.click(function (e) {
            _self.log("click on wrapper inside group");
            $(".active").removeClass("active");
            if (_self.options.noActive === false)
                _self.el.addClass("active");
            e.stopPropagation();
        });

        this.el.focus(function (e) {
            $(".active").removeClass("active");            
            if (_self.options.noActive === false)
                _self.el.addClass("active");
        });

        //addClass
        this.el.bind("addClass", function (e, args) {
            //_self.log("event addClass");
            if (_self.options.noActive === false) {
                if (args != "hide") {
                	_self.wrapper.addClass(args);
                	if (_self.options.groupName != "")
                		_self.group.addClass(args);
                }
            }
        });

        //removeClass
        this.el.bind("removeClass", function (e, args) {
            //_self.log("event removeClass");
            _self.wrapper.removeClass(args);
            if (_self.options.groupName != "")
                _self.group.removeClass(args);
        });

        /* refreshing timer for select and textbox */
        if (_self.options.autofillRefresher !== 0 && (this.el.prop("tagName") == "SELECT" || this.el.attr("type") == "password" || this.el.attr("type") == "text" || this.el.prop("tagName") == "TEXTAREA")) {
            setInterval(function () {
                var val = _self.el.getElementVal();

                // set data cache on element to input value if not yet set
                if (_self.el.data('change_listener') == undefined) {
                    _self.el.data('change_listener', val);
                    return;
                }
                // return if the value matches the cache
                if (_self.el.data('change_listener') == val) {
                    return;
                }
                // ignore if element is in focus (since change event will fire on blur)
                if (_self.el.hasClass("active")) {
                    return;
                }
                // if we make it here, manually fire the change event and set the new value
                _self.el.trigger('keyup').trigger('change');
                _self.el.data('change_listener', val);

            }, _self.options.autofillRefresher);
        }

    },

    _setUpGroup: function () {
        /* element disabled */
        if (this.el.attr("disabled") == "disabled") {
            this.el.addClass("disabled");
        } else {
            this._bindGroupEvents();
        }
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing group");
        this.group.unbind();
        this._setUpGroup();
    }

});
group.implement(IGroup);

/*********************************************************************** generic linker - used for link  *****************************************
actions depending on external or the same (use "this") element value
*/
var linker = group.extend({

    constructor: function (options, elem) {
        this.options = $.extend({},
            /* private default object settings */
            {
                linkElems: null,
                linkComparerValues: [true], 		//an array of Values or RegExs of function (this is the element itself)
                linkActionsToBind: "change",	
                linkCompareOnCreate: true,			//compare on page loaded
                onLinkMatch: function () { },		//what to do when returns true
                onLinkDontMatch: function () { }	//what to do when returns false
            },
            this.options
        );
        this.base(options, elem);
        this._setUpLinker();
    },

    linkElems: $(),

    _linkMatch: function () {
        var ret = false;
        var _self = this;
        if (typeof this.options.linkComparerValues == "function") {
            ret = _self.options.linkComparerValues.call(_self);
        } else {
            for (e in this.options.linkComparerValues) {
                this.linkElems.each(function () {
                    if (_self.options.linkComparerValues[e] instanceof RegExp) {
                        if ($(this).getElementVal().toString().search(_self.options.linkComparerValues[e])) {
                            ret = true;
                        }
                    } else {
                        if ($(this).getElementVal() == _self.options.linkComparerValues[e]) {
                            ret = true;
                        }
                    }
                });
            }
        }
        if (this.options.linkComparerValues.length == 0 && typeof this.options.linkComparerValues != "function") ret = true;
        return ret;
    },
    
    linkItemFiredAction: $(),
    
    _linkChange: function (itemCaller) {
    	this.linkItemFiredAction = $(itemCaller); 
        if (this._linkMatch()) {        	
        	if (this.options.linkElems != "this") 
            	if (!this.wrapper.parents(".element-wrapper").hasClass("disabled") || this.wrapper.parents(".element-wrapper")== "undefined") {
            		this.wrapper.find("input,select,textarea,button").prop("disabled", false).removeClass("disabled");
            		this.wrapper.removeClass("disabled");
            	}
            try { this.options.onLinkMatch.call(this); } catch (e) { this.log(e); }
        } else {
            if (this.options.linkElems != "this") 
            	if (!this.wrapper.parents(".element-wrapper").hasClass("disabled")) {
            		this.wrapper.find("input,select,textarea,button").prop("disabled", true).addClass("disabled").removeClass("validationError");
            		this.wrapper.addClass("disabled");
            	}
            try { this.options.onLinkDontMatch.call(this);} catch (e) { this.log(e); }
        }
        if (this.options.linkElems != "this") this.el.triggerHandler("refreshHandler");
    },

    _setUpLinker: function () {
        if (this.options.linkElems != null) {
            this.linkElems = (this.options.linkElems == "this") ? this.el : $(this.options.linkElems);
             
            var _self = this;            
            if (_self.options.linkCompareOnCreate) {
                setTimeout(function() {_self._linkChange(document);}, 100);
                _self.options.linkCompareOnCreate = false;
            }

            _self.linkElems.bind(_self.options.linkActionsToBind, function (e) {                
            	_self._linkChange(this);
            });
        }
    },

    /* refresh the graphics element */
    refresh: function () {    	
        this.base();
    }

});

/* *****************************************************************************************************************/
/*								CONTEXT MENU
 * 
 *  Html structure:
 *  
	<ul id="menu">
	    <li>ITEM 1</li>
	    <li>
	        ITEM 2
	        <ul>
	            <li>SUB-ITEM1</li>
	            <li>SUB-ITEM1</li>
	        </ul>
	    </li>
	    <li>ITEM 3</li>
	    <li class="noHover"><hr/></li>
	    <li>
	        ITEM 4
	        <ul>
	            <li>SUB-ITEM1</li>
	            <li>SUB-ITEM1</li>
	        </ul>
	    </li>           
	</ul>
 * 																	   */
/* *****************************************************************************************************************/

var menu = linker.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                menuAction: "contextmenu",	//contextMenu for right click - otherwise other actions
                menuLink: ["body"] 			//Jquery search values - window, #div, .class, body
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "menu");
        this._createmenu();
        this._setUpmenu();

    },

    _createmenu: function () {
        var _self = this;

    },

    _setUpmenu: function () {
        this.el.find("ul").css("left", this.wrapper.width() - 2);
        this.el.find("li ul").parent().addClass("submenu");
        this._bindEventsmenu();
    },

    _bindEventsmenu: function () {
        var _self = this;
        for (i = 0; i < this.options.menuLink.length; i++) {
            $(this.options.menuLink[i]).on(this.options.menuAction, function (e) {
                e.preventDefault();
                _self.wrapper.css("left", e.clientX);
                _self.wrapper.css("top", e.clientY);
                _self.el.addClass("active");
            });
            if (this.options.activeOnHover != 0) {
                //on hover
            	$(this.options.menuLink[i]).mouseenter(function () { _self.hoverTimeout = setTimeout(function () { $(".active").removeClass("active"); _self.el.addClass("active"); }, _self.options.activeOnHover); });
            	$(this.options.menuLink[i]).mouseleave(function () { clearTimeout(_self.hoverTimeout) });
            }        };        
        this.el.find("li.submenu").mouseover(function () { $(this).find("ul").addClass("show"); });
        this.el.find("li.submenu").mouseout(function () { $(this).find("ul").removeClass("show"); });

    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing menu");
        this._setUpmenu();
    }
});

$(function () {
    $.fn.menu = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new menu(options, this);
                $.data(this, 'menu', myObj);
            });
        }
    };
});


/* *****************************************************************************************************************/
/*								TICKER																		   */
/* *****************************************************************************************************************/

var ticker = group.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                tickerDirection: "horizontal",		//Direction
                tickerDimension: 150,				//The width/height of the ticker
                tickerVel: 60,						//The velocity of the ticker scolling
                tickerRepeatElems: 2				//The minimum of elements otherwise they will be repeated till this number 
            }
        );
        this.base(options, elem);
        this._ver = (this.options.tickerDirection == "vertical") ? true : false;
        this.wrapper.addClass(this.options.idPrefix + "ticker");
        this._createTicker();
        if (this.tickerElems.length > 0)
            this._startMove();
    },
    tickerElems: $(),
    tickerInterval: null,
    tickerPos: 0,
    _ver: false,

    /* return the dimension to modify based on the variable inverse */
    _dim: function (inverse) {
        inverse = (typeof inverse == "undefined") ? false : true;
        if (((this._ver) ^ inverse) == 1)
            return "height";
        return "width";
    },

    //create the ticker
    _createTicker: function () {
        var _self=this;
    	this.tickerElems = this.el.find("li");
        if (this.tickerElems.length == 1)
            this.el.append("<li>" + this.tickerElems.first().html() + "</li>");
        this.tickerElems = this.el.find("li");
        if (this.tickerElems.length == 2)
            this.el.append("<li>" + this.tickerElems.first().html() + "</li>" + "<li>" + this.tickerElems.last().html() + "</li>");
        this.tickerElems = this.el.find("li");
        
        for (i=0; i<this.options.tickerRepeatElems; i++) {
        	this.tickerElems.each(function(index) {
        		_self.el.append("<li>" + $(this).html() + "</li>");
        	});
        	this.tickerElems = this.el.find("li");        	
        }
        
        this.wrapper.dimension(this._dim(true), this.tickerElems.outerDimension(this._dim(true)));
        this.wrapper.dimension(this._dim(), this.options.tickerDimension);
        this.el.dimension(this._dim(), this.tickerElems.outerDimension(this._dim()) * this.tickerElems.length);
        var _self = this;

        this.el.hover(function () {
            clearInterval(_self.tickerInterval);
        }, function () {
            _self._startMove();
        });

    },

    _startMove: function () {
        var _self = this, pos = 0;
        this.tickerInterval = setInterval(function () {
            pos = (!_self._ver) ? -parseInt(_self.el.css("left").replace("px", "")) : -parseInt(_self.el.css("top").replace("px", ""));
            if (pos >= _self.tickerElems.first().outerDimension(_self._dim())) {
                _self.tickerPos = 0;
                _self.el.append(_self.tickerElems.first());
                _self.tickerElems = _self.el.find("li");
            } else {
                _self.tickerPos -= 1;
            }
            if (!_self._ver)
                _self.el.css("left", _self.tickerPos + "px");
            else
                _self.el.css("top", _self.tickerPos + "px");
        }, _self.options.tickerVel);
    }

});

$(function () {
    $.fn.ticker = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new ticker(options, this);
                $.data(this, 'ticker', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								SCROLLER																		   */
/* *****************************************************************************************************************/

var scroller = group.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                scrollDirection: "vertical",	//Direction
                scrollStart: 0,					//The starting position when it is created
                scrollRange: 150,				//The width/height of the scroll window
                scrollbarRange: 6,				//The width/height of the scrollbar
                scrollMouseStep: 30,			//The amount to scroll when it is used the mouse wheel
                scrollByElement:				//A Object containing info about scrolling throught identical items 
                	{ 	
                		tag: "li",				//The html tag name 
                		showedNum: 1, 			//Number of items to show
                		scrollNum: 1, 			//number of items to scroll throught the mousewheel
                		active: false 			//if active throught items
            		}
            }
        );
        this.base(options, elem);
        this._ver = (this.options.scrollDirection == "vertical") ? true : false;
        if (this.options.scrollByElement.active)
            this._elemDim = this.el.find(this.options.scrollByElement.tag).outerDimension(this._dim(), true);
        if (this.options.scrollByElement.active)
            this.options.scrollMouseStep = this._elemDim * this.options.scrollByElement.scrollNum;
        this._createScroller();
        this._bindScrollerEvents();
    },

    //Jquery objects
    scrollerContainer: $(),
    scrollbar: $(),    
    scroller: $(),
    arrows: $(),
    
    isScrollerActive: true,

    /* return the dimension to modify based on the variable inverse */
    _dim: function (inverse) {
        inverse = (typeof inverse == "undefined") ? false : true;
        if (((this._ver) ^ inverse) == 1)
            return "height";
        return "width";
    },

    /* boolean vertical mode is true */
    _ver: true,

    _elemDim: 0,

    //create the scroller
    _createScroller: function () {
        this.el.css("position", "absolute");
        this.wrapper.addClass("scroller-wrapper");
        
        this.scrollerContainer = $('<div class="scrollerContainer"/>');
        this.wrapper.append(this.scrollerContainer);        
        this.scrollerContainer.append(this.el);
        
        //scrollbar with scroller
        this.scrollbar = $('<div class="scrollbar"></div>');
        this.scroller = $('<div>');
        this.scroller.dimension(this._dim(true), this.options.scrollbarRange - 2);

        this.scrollbar.append(this.scroller);
        this.wrapper.append(this.scrollbar);
        this.refreshScroller();
        this.scrollTo(this.options.scrollStart, 0, true);
        
        this.arrows = $('<div class="arrows"></div>');
        this.arrows.append('<div class="backward disabled"/>');
        this.arrows.append('<div class="forward"/>');
        this.wrapper.append(this.arrows);
    },

    //private position of the scroll movement
    _position: 0,
    _startMove: 0,
    _startMoveVer: 0,
    _startMoveMouse: 0,
    _startMovePointer: 0,

    _outOfElemPosition: function () {
        var _self = this;
        var rest = (Math.abs(_self._position % _self._elemDim) > (_self._elemDim / 2));
        _self._position = (parseInt(_self._position / _self._elemDim) + ((rest) ? -1 : 0)) * (_self._elemDim);
    },

    //bind the private events
    _bindScrollerEvents: function () {
        var _self = this;
        
        _self.scrollerContainer.bind('mousewheel DOMMouseScroll', function (e) {
            var o = 0;
            if (e.originalEvent.wheelDelta)
                o = e.originalEvent.wheelDelta;
            else
                o = -e.originalEvent.detail;

            _self._position += (o >= 0) ? _self.options.scrollMouseStep : -_self.options.scrollMouseStep;
            e.preventDefault();
            _self._animate();
        });

        _self.scroller.bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        _self.scrollbar.bind('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        _self.scrollbar.bind("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var move = (_self.options.scrollByElement.active) ? _self._elemDim : _self.scrollerContainer.outerDimension(_self._dim(), true);
            var direction = (_self._ver) ? ((_self.scroller.offset().top > e.pageY) ? 1 : -1) : ((_self.scroller.offset().left > e.pageX) ? 1 : -1);
            _self._position += move * direction;
            _self._animate();
        });

        _self.scroller.bind('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _self._startMoveMouse = (_self._ver) ? e.pageY : e.pageX;
            $("body").bind('mousemove', function (ev) { _self._mouseScrollerMove(_self, ev); });
        });
        
        _self.scroller.bind('touchstart', function (e) {
            e = window.event;
            e.preventDefault();
            e.stopPropagation();
            _self._usingTouch = true;
            _self._startMove = (_self._ver) ? e.touches[0].pageY : e.touches[0].pageX;
            _self._touchObj = { startPos: _self._startMove, endPos: _self._startMove, startTime: new Date(), endTime: new Date() };
            $("body").bind('touchmove', function () { _self._touchScrollerMove(_self, event); });
        });
        
        /* IE10 touch events */
        _self.scroller.bind("pointerdown", function (e) {
            //e = window.event;
        	e.preventDefault();
            e.stopPropagation();
            _self._usingTouch = true;            
            _self._startMovePointer = (_self._ver) ? e.originalEvent.pageY : e.originalEvent.pageX;
            _self._touchObj = { startPos: _self._startMovePointer, endPos: _self._startMovePointer, startTime: new Date(), endTime: new Date() };
            $("body").bind('pointermove', function (e) { _self._pointerScrollerMove(_self, e); });
        });

        $("body").bind('mouseup', function (e) {
            if (_self.options.scrollByElement.active) {
                _self._outOfElemPosition();
                _self.el.addClass("animate"); _self.scroller.addClass("animate");
                _self._animate();
                setTimeout(function () { _self.el.removeClass("animate"); _self.scroller.removeClass("animate"); }, 500);
            }
            $("body").unbind('mousemove');
        });

        /* IE10 touch events */
        _self.el.bind("MSPointerDown pointerdown", function (e) {        	
        	//e = window.event;
            //e.preventDefault();        	
            //e.stopPropagation();
            _self._usingTouch = true;            
            _self._startMove = (_self._ver) ? e.originalEvent.pageY : e.originalEvent.pageX;            
            _self._startMoveVer = (_self._ver) ? e.originalEvent.pageX : e.originalEvent.pageY;            
            _self._touchObj = { startPos: _self._startMove, endPos: _self._startMove, startTime: new Date(), endTime: new Date() };
            $("body").bind('MSPointerMove ponitermove', function (e) { _self._pointerMove(_self, e); });            
        });

        _self.el.bind('touchstart', function (e) {
            e = window.event;
            //e.preventDefault();
            //e.stopPropagation();
            _self._usingTouch = true;
            _self._startMove = (_self._ver) ? e.touches[0].pageY : e.touches[0].pageX;
            _self._startMoveVer = (_self._ver) ? e.touches[0].pageX : e.touches[0].pageY;
            _self._touchObj = { startPos: _self._startMove, endPos: _self._startMove, startTime: new Date(), endTime: new Date() };
            $("body").bind('touchmove', function () { _self._touchMove(_self, event); });            
        });
        
        _self.arrows.find("div").bind('click', function () {
        	 _self._position += ($(this).hasClass("backward")) ? _self.options.scrollMouseStep : -_self.options.scrollMouseStep;            
             _self._animate();
        });
        
        
        $("body").bind('touchend MSPointerUp pointerup', function (e) {
            if (_self._usingTouch) {
                $("body").unbind('touchmove mousemove MSPointerMove pointermove');
                _self._usingTouch = false;

                _self._touchObj.endPos = _self._startMove;
                _self._touchObj.endTime = new Date();

                var direction = (_self._touchObj.endPos - _self._touchObj.startPos) > 0 ? 1 : -1;
                var vel = Math.abs(_self._touchObj.endPos - _self._touchObj.startPos) / Math.abs(_self._touchObj.endTime - _self._touchObj.startTime)

                if (Math.abs(_self._touchObj.endPos - _self._touchObj.startPos) > 11 && vel > 0.33)
                    _self._position = _self._position + 51 * direction * vel * 5.1;

                if (_self.options.scrollByElement.active) {
                    _self._outOfElemPosition();
                }

                _self.el.addClass("animate"); _self.scroller.addClass("animate");
                _self._animate();
                setTimeout(function () { _self.el.removeClass("animate"); _self.scroller.removeClass("animate"); }, 500);
            }
        });

    },

    _mouseScrollerMove: function (_self, e) {
        e.preventDefault();
        e.stopPropagation();        
        var move = (_self._ver) ? e.pageY : e.pageX;
        _self._position += (_self._startMoveMouse - move) * (_self.el.dimension(_self._dim()) / _self.scrollerContainer.dimension(_self._dim()));
        _self._startMoveMouse = move;
        _self._animate();
    },

    _touchScrollerMove: function (_self, e) {
        e.preventDefault();
        e.stopPropagation();
        var move = (_self._ver) ? e.touches[0].pageY : e.touches[0].pageX;
        _self._position += (_self._startMove - move) * (_self.el.dimension(_self._dim()) / _self.scrollerContainer.dimension(_self._dim()));
        _self._startMove = move;
        _self._animate();
    },

    _pointerScrollerMove: function (_self, e) {
        e.preventDefault();
        e.stopPropagation();
        var offSet = (_self._ver) ? e.originalEvent.pageY : e.originalEvent.pageX;
        _self._position -= (_self._startMovePointer - offSet);
        _self._startMovePointer = offSet;
        _self._animate();
    },

    _usingTouch: false,

    _touchObj: {},

    _touchMove: function (_self, e) {
    	var offSet = (_self._ver) ? e.touches[0].pageY : e.touches[0].pageX;
    	var offSetVer = (_self._ver) ? e.touches[0].pageX : e.touches[0].pageY;    	
        if (Math.abs(offSet - _self._startMove) > Math.abs(offSetVer - _self._startMoveVer)) {
        	e.preventDefault();
        	e.stopPropagation();
        	_self._position -= (_self._startMove - offSet);
        	_self._startMove = offSet;
        	_self._startMoveVer = offSetVer;
        	_self._animate();
        }        
    	_self._startMoveVer = offSetVer;
    },

    _pointerMove: function (_self, e) {        
        var offSet = (_self._ver) ? e.originalEvent.pageY : e.originalEvent.pageX;
        var offSetVer = (_self._ver) ? e.originalEvent.pageX : e.originalEvent.pageY;        
        if (Math.abs(offSet - _self._startMove) > Math.abs(offSetVer - _self._startMoveVer)) {
        	e.preventDefault();
        	e.stopPropagation();        
        	_self._position -= (_self._startMove - offSet);
        	_self._startMove = offSet;
        	_self._startMoveVer = offSetVer;
        	_self._animate();
        }
        _self._startMoveVer = offSetVer;
    },

    _animate: function () {        
        this.scrollTo(this._position, 0, this.options.scrollByElement.active);
    },

    scrollToPerc: function (perc) {
        this._position = - perc * (this.el.outerDimension(this._dim(), true) - this.scrollerContainer.outerDimension(this._dim())) / 100;
        this.scrollTo(this._position);
    },

    scrollToElem: function (index, animate) {      
        this._position = -index * this.options.scrollMouseStep;
        this.scrollTo(this._position,0,animate);
    },

    scrollTo: function (pos, offSet, animate) {
        if (this.isScrollerActive) {
            var outOfBound;
            var maxPosition = this.scrollerContainer.outerDimension(this._dim(), true) - this.el.outerDimension(this._dim(), true);

            animate = (typeof animate == "undefined") ? false : animate;
            pos = (offSet) ? (pos + offSet) : pos;

            if (!this._usingTouch) {
                pos = (pos >= 0) ? 0 : pos;
                pos = (pos <= maxPosition) ? maxPosition : pos;
            }

            outOfBound = pos;
            outOfBound = (pos >= 33) ? (Math.log(pos + 1) * 9) : outOfBound;
            outOfBound = (pos <= maxPosition - 33) ? maxPosition - Math.log(-pos + 1 + maxPosition) * 9 : outOfBound;
            outOfBound = Math.ceil(outOfBound);

            var cssRule = (this._ver) ? "top" : "left";
            var _self = this;
            if (animate) {
                this.el.moveAnimate(cssRule, outOfBound);
                if (browser.useTransitions()) {
                    this.scroller.addClass("animate"); setTimeout(function () { _self.scroller.removeClass("animate"); }, 500);
                }

            } else {
                $(this.el).css(cssRule, outOfBound + "px");
            }

            var temp = -(this.scrollerContainer.outerDimension(this._dim(), true) * outOfBound / this.el.outerDimension(this._dim(), true));
            this.scroller.css(cssRule, temp + "px");

            this._position = pos;

            var perc = -this._position / (this.el.outerDimension(this._dim(), true) - this.scrollerContainer.outerDimension(this._dim())) * 100;
            var index = Math.ceil(-this._position / this.options.scrollMouseStep);
            this.el.triggerHandler("scrollChange", [perc, index]);
            this.arrows.find("div").removeClass("disabled");
            if (perc>=100) this.arrows.find(".forward").addClass("disabled");
            if (perc<=0) this.arrows.find(".backward").addClass("disabled");
        }
    },

    refreshScroller: function () {
    	if (this.options.scrollByElement.active)
            this._elemDim = this.el.find(this.options.scrollByElement.tag).outerDimension(this._dim(), true);
    	var myDim = (!this.options.scrollByElement.active) ? this.options.scrollRange : this._elemDim * this.options.scrollByElement.showedNum;
        this.isScrollerActive = (myDim < this.el.outerDimension(this._dim(), true)) ? true : false;       
        if (this.isScrollerActive === true) {
            this.scrollerContainer.dimension(this._dim(), myDim);
            this.el.css("position", "absolute");
        }
        else
            this.el.css("position", "relative");
        var temp = (!this.scrollerContainer.parent().hasClass("container")) ? this.el.outerDimension(this._dim(true), true) : "100%";        
        this.scrollerContainer.dimension(this._dim(true), temp);
        this.scrollbar.addClass(this.options.scrollDirection);
        var border = this.scrollbar.css("border-width").replace("px", "") * 2;
        this.scrollbar
            .dimension(this._dim(true), this.options.scrollbarRange)
            .dimension(this._dim(), myDim - border - 2);
        temp = myDim * myDim / (this.el.outerDimension(this._dim())) - (border * 2) - 4;
        temp = (temp < 11) ? 11 : temp;
        this.scroller.dimension(this._dim(), temp);
        
        if (this.options.scrollByElement.active)
            this.options.scrollMouseStep = this._elemDim * this.options.scrollByElement.scrollNum;
        
    }
});

$(function () {
    $.fn.scroller = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new scroller(options, this);
                $.data(this, 'scroller', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								SLIDER
 * 
 * HTML Structure:
 
 <ul id="slider">
    <li data-title="Slide 1">SLIDE 1</li>
    <li>SLIDE 2</li>
    <li data-title="Slide 3">SLIDE 3</li>
</ul>
 
 * 
 */																		   
/* *****************************************************************************************************************/

var slider = group.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                sliderDirection: "horizontal",	//Direction
                sliderInterval: 0				//Interval
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "slider " + this.options.sliderDirection);
        this._createSlider();        
        this._bindSliderEvents();
        //if (browser.useTransitions()) { this.el.addClass("animate"); this._moveToSlide(0); }
    },

    //Jquery & base objects:
    sliderButtons: $(),     sliderNext: $(),     sliderPrev: $(),     sliderActive: 0, sliderElems: $(), sliderScroller: {},

    //create the slider
    _createSlider: function () {
        var _self = this;
        this.sliderElems = this.el.find("li");
        this.el.width(this.sliderElems.width() * this.sliderElems.size());

        //slider with scroller
        this.sliderScroller = new scroller({
            scrollDirection: this.options.sliderDirection,
            scrollByElement: { tag: "li", showedNum: 1, scrollNum: 1, active: true }
        }, this.el);
        this.sliderScroller.scrollbar.detach();

        //Navigation
        this.sliderPrev = $('<div class="prev" />');
        this.sliderPrev.click(function () {
            _self.sliderActive = (--_self.sliderActive < 0) ? _self.sliderElems.length - 1 : _self.sliderActive;
            _self._moveToSlide(_self.sliderActive);
        });
        this.sliderNext = $('<div class="next" />');
        this.sliderNext.click(function () {
            _self.sliderActive = (++_self.sliderActive >= _self.sliderElems.length) ? 0 : _self.sliderActive;
            _self._moveToSlide(_self.sliderActive);
        });
        //Buttons
        this.sliderButtons = $('<div class="buttons-wrapper"/>');

        this.sliderElems.each(function (i, value) {
            var button = $("<div/>");
            if ($(this).attr("data-title") != "")
                button.attr("title", $(this).attr("data-title"))
            button.attr("data-enum", i);
            button.click(function () { _self._moveToSlide(i); });
            _self.sliderButtons.append(button);
            $(this).attr("data-enum", i);
        });
        this.wrapper.append(this.sliderPrev);
        this.wrapper.append(this.sliderNext);
        this.wrapper.append(this.sliderButtons);
        this.sliderButtons.find("div[data-enum='0']").addClass("selected");
                
    },

    _moveToSlide: function (i) {        
        this.sliderScroller.scrollToElem(i, true);
        this.sliderActive = i;
    },

    //bind the private events
    _bindSliderEvents: function () {
        var _self = this;

        var interval = function () {
            _self.sliderActive = (++_self.sliderActive >= _self.sliderElems.length) ? 0 : _self.sliderActive;
            _self._moveToSlide(_self.sliderActive);
        }

        if (this.options.sliderInterval != 0) {
            this.sliderInterval = setInterval(interval, this.options.sliderInterval);

            this.wrapper.hover(
                function () { clearInterval(_self.sliderInterval); },
                function () { _self.sliderInterval = setInterval(interval, _self.options.sliderInterval); }
            );
        }

        this.el.on("scrollChange", function (event, percentual,index) {
            _self.sliderButtons.find("div").removeClass("selected");
            _self.sliderButtons.find("div[data-enum='" + index + "']").addClass("selected");
        });

    }

});

$(function () {
    $.fn.slider = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new slider(options, this);
                $.data(this, 'slider', myObj);
            });
        }
    };
});


/* *****************************************************************************************************************/
/*								OVERLAY																			   */
/* *****************************************************************************************************************/
var COverlay = logger.extend({
	//Instantiate
    constructor: function (options) {
    	this.options = $.extend(this.options, options);
    },
    options: { overlayUrl: "", overlayMessage: "", execute: null, overlayCssClass: "", loadMethod: null, beforeClose: null }
});
var IOverlay = base2.Module.extend({
    fader: null,
    cont: null,
    loader: null,

    _setUpIoverlay: function () {
        if (this.fader == null) {
        	/* add HTML */
            this.fader = $('<div id="overlay-backgroundOpacity"></div>');
            this.cont = $('<div id="overlay-container"><div class="xbutton closeOverlay"></div></div>');
            this.loader = $('<div id="overlay-loader"><div class="loaderGif"></div></div>');
            $("body").append(this.fader);
            $("body").append(this.cont);
            $("body").append(this.loader);
        }
    },

    _fadeInOpacity: function (vel) {
        this.fader.css({ 'filter': 'alpha(opacity=70)' }).fadeIn(vel);
    },

    _overlayAnimate: function (vel, implementer) {    	
        var _self = this;
        switch (this.overlayAnimation) {
            case "fadeIn":
                this.cont.fadeIn(vel);                
                break;
            case "slideDown":
                _self.cont.slideDown(vel);
                break;
        }
        this.fader.bind("click", function (e) { e.preventDefault(); e.stopPropagation(); _self.close(e, 200, implementer) });
        this.cont.find(".closeOverlay").bind("click", function (e) { e.preventDefault(); e.stopPropagation(); _self.close(e, 200, implementer) });

        
    },
    
    _centerInWindow: function ($div, loader) {
        loader = (typeof loader != "undefined") ? loader : false;
        var height = $div.outerHeight();
        var width = $div.outerWidth();
        var winHeight = $(window).height();
        var winWidth = $(window).width();
        var top = winHeight > height ? (-height / 2) : (-winHeight / 2);
        var left = winWidth > width ? (-width / 2) : (-winWidth / 2);
        top = (this.overlayFullHeight && !loader) ? -winHeight / 2 : top;
        top += $(window).scrollTop();
        var cssHeight = (this.overlayFullHeight && !loader) ? window.innerHeight + "px" : "auto";
        $div.css({
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'margin-top': top + 'px',
            'margin-left': left + 'px',
            'height': cssHeight
        });
    },
    
    interfaceClose: function(vel) {
    	vel = vel || 200;
    	if (this.cont != null) {    	    
    	    switch (this.overlayAnimation) {
    	        case "fadeIn":
    	            this.cont.hide(0);
    	            break;
    	        case "slideDown":
    	            this.cont.slideUp(vel);
    	            break;
    	    }    	    
    		this.fader.fadeOut(vel);
    		this.cont.find(".closeOverlay").unbind("click");        
    		this.fader.unbind("click");    		
    	}
    },
    
    close: function (e, vel, implementer) {
        var _self = this;
        vel = (vel) ? vel : 0;
        e.preventDefault();
        if (typeof implementer.options.beforeClose == "function")
            implementer.options.beforeClose();        
        this.interfaceClose(vel);
        setTimeout(function () {
            _self.cont.removeClass(implementer.options.overlayCssClass);
            if (implementer.options.loadMethod != "inPage")
            { _self.cont.empty(); _self.cont.append('<div class="xbutton closeOverlay"></div>'); }
            else
            { $(implementer.options.url).append(_self.cont.contents()); }
        }, vel);
        $("body").removeClass("overlayOpened");
    },

    overlayAnimation: "fadeIn", overlayFullHeight: false,

    open: function (implementer, animation, fullHeight) {
        var _self = this;
        
        this._setUpIoverlay();
        $("body").addClass("overlayOpened");
        this.overlayAnimation = (animation) ? animation : "fadeIn";
        this.overlayFullHeight = (fullHeight) ? fullHeight : false;
        
        if (implementer.options.overlayUrl.indexOf("#") == 0){
            _self.cont.addClass(implementer.options.overlayCssClass);
            _self.cont.append($(implementer.options.overlayUrl).contents());	            
            _self._centerInWindow(_self.cont);
            _self._fadeInOpacity(500);
            _self._overlayAnimate(500, implementer);
            if (typeof implementer.options.execute == "function") implementer.options.execute();
        } else if (implementer.options.overlayUrl.indexOf("<") == 0) {
        	_self.cont.addClass(implementer.options.overlayCssClass);
        	_self.cont.empty();
        	_self.cont.append('<div class="xbutton closeOverlay"></div>');
        	_self.cont.append($(implementer.options.overlayUrl));	            
            _self._centerInWindow(_self.cont);
            _self._fadeInOpacity(500);
            _self._overlayAnimate(500, implementer);
            if (typeof implementer.options.execute == "function") implementer.options.execute();
        } else {               	
            $.ajax({
                url: implementer.options.overlayUrl,
                beforeSend: function () {
                    _self._centerInWindow(_self.loader, true);
                    _self.loader.show();
                    if (!_self.overlayFullHeight) _self._fadeInOpacity(500);
                }
            }).done(function (data) {
                loaded = data;
                _self.cont.addClass(implementer.options.overlayCssClass);
                _self.cont.empty();
                _self.cont.append('<div class="xbutton closeOverlay"></div>');
                _self.cont.append(data);                    
                /* set (if exist) the standard message */
                if (implementer.options.overlayMessage != "")
                    $(".overlayMessage").html(implementer.options.overlayMessage);
                _self._centerInWindow(_self.cont);
                _self.loader.hide();
                _self._overlayAnimate(500, implementer);
                if (typeof implementer.options.execute == "function") implementer.options.execute();
            }).fail(function (jqXHR, textStatus) {
            	_self.cont.empty();
                _self.cont.append('<div class="xbutton closeOverlay"></div>');
                _self.cont.append(core.language.connectionError);
                _self._centerInWindow(_self.cont);
                _self.loader.hide();
                _self._overlayAnimate(500, implementer);
            });           
        }
    }

});

var overlay = linker.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                overlayUrl: "",			//The url to Load with Ajax
                overlayMessage: "",		//The message to put in the loaded html inside the element with class: "overlayMessage"
                overlayCssClass: ""		//The css class to add to the container for restyling the popup
            }
        );
        this.base(options, elem);
        this._setUpOverlay();
    },
    _setUpOverlay: function () {
    	var _self = this;
        if (this.options.overlayUrl != "") {
        	var oldMatch = (typeof this.options.onLinkMatch == "function") ? this.options.onLinkMatch : function() {};
            this.options.onLinkMatch = function () { oldMatch.call(_self); IOverlay.open(_self); };
            IOverlay._setUpIoverlay();
        }
        
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this._setUpOverlay();
    }
});
overlay.implement(IOverlay);

/* *****************************************************************************************************************/
/*								BALLOON																		   	   
 * 
 * This is a classical Tooltip
/* *****************************************************************************************************************/

/********************************************************************************** Balloon container *********************************************************************************/
var balloon = overlay.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                balloonPosition: "none",				//Position: bottom, top, left, right - changes automatically if the position is outside the body margins
                balloonFooter: "HTML STATIC FOOTER",	//The html content of the footer
                balloonDistance: 6,						//The left/right distance from the element
                balloonTopGap: 6,						//The top/bottom distance from the element
                balloonItemClass: "container",			//The css class of the container
                balloonItem: null,						//The item to put in the container
                balloonErrorClass: "error",				//The css class for the error message container
                balloonTitleClass: "title",				//The css class for the title message container
                balloonDescriptionClass: "description", //The css class for the description message container
                balloonTitle: null,						//The html content of the title
                balloonDescription: null                //The html content of the description
            }
        );
        this.base(options, elem);

        if (this.options.balloonPosition != "none") {
            this._createBalloon();
            this._createContent();
            this._setUpBalloon();
            this._bindBalloonEvents();
        }
    },

    // jQuery container for the balloon
    balloon: $(),

    // jQuery container for the balloon arrow
    balloonArrow: $(),

    // jQuery container for the ballon arrow overlay
    balloonArrowOverlay: $(),

    // jQuery container for the ballon Content
    balloonContent: $(),
    // jQuery container for the ballon Header
    balloonHeader: $(),
    // jQuery container for the ballon Footer
    balloonFooter: $(),
    // jQuery container for the ballon Title
    balloonTitle: $(),
    // jQuery container for the ballon Js Error
    balloonError: $(),
    // jQuery container for the ballon Description
    balloonDescription: $(),
    // jQuery container for the ballon Extended Item
    balloonItem: $(),

    // create the balloon
    _createBalloon: function () {
        this.balloon = $('<div class="balloon-wrapper" />');
        this.balloon.addClass(this.options.balloonPosition);
        this.balloonArrow = $('<div class="balloon-arrow" />');
        this.balloonArrowOverlay = $('<div class="balloon-arrow-overlay" />');
        //this.balloonArrowOverlay.css({ "left": -this.options.balloonDistance, "border-width": "" + this.options.balloonDistance + "px" });
        this.balloonArrow.append(this.balloonArrowOverlay);
        this.balloon.append(this.balloonArrow);

        // add to wrappper or group (only one times)
        var cont = (this.options.groupName == "") ? this.wrapper : this.group;
        cont.append(this.balloon);
    },

    // create the balloon content
    _createContent: function () {
        this.balloonContent = $('<div class="balloon-content" />');
        this.balloonHeader = $('<div class="header" />');
        this.balloonFooter = $('<div class="footer" />');

        this.balloonTitle = $('<div class="' + this.options.balloonTitleClass + '" />');
        var forAttr = $("*[for='" + this.el.attr("id") + "']");
        this.balloonTitle.html((this.options.balloonTitle) ? this.options.balloonTitle : ((forAttr.length > 0) ? forAttr.html() : ""));

        this.balloonDescription = $('<div class="' + this.options.balloonDescriptionClass + '" />');
        this.balloonDescription.html((this.options.balloonDescription) ? this.options.balloonDescription : "");

        this.balloonError = $('<div class="' + this.options.balloonErrorClass + '" />');
        this.balloonItem = $('<div class="' + this.options.balloonItemClass + '" />');
        this.balloonItem.html((this.options.balloonItem) ? this.options.balloonItem : "");

        this.balloonHeader.append(this.balloonTitle);
        this.balloonHeader.append(this.balloonError);
        this.balloonHeader.append(this.balloonDescription);
        this.balloonHeader.append(this.balloonItem);

        this.balloonContent.append(this.balloonHeader);
        this.balloonContent.append(this.balloonFooter);
        this.balloon.append(this.balloonContent);
    },

    // put the content in balloon
    _putFooter: function () {
        this.balloonFooter.html(this.options.balloonFooter);
    },

    // position the balloon
    _positionBalloon: function () {
        
    	var container = (this.options.groupName == "") ? this.wrapper : this.group;
        var offsetX = (this.options.groupName == "") ? 0 : this.group.offset().left - this.wrapper.offset().left;
        var offsetY = (this.options.groupName == "") ? this.wrapper.offset().top : this.group.offset().top;
        var balloonHeight = this.balloon.outerHeight();
        var fromTop = offsetY - $(window).scrollTop();
        var fromLeft = offsetX;
        var tempWidth = (this.options.groupName == "") ? this.wrapper.outerWidth() : this.group.outerWidth() ;
        var screenHeight = $(window).height();
        offsetY = ((screenHeight - core.screenMargin[2] - fromTop) < balloonHeight) ? -balloonHeight + (screenHeight - fromTop-44) : 0;        
        var switcher = this.options.balloonPosition;        
        fromLeft += this.wrapper.offset().left;       
        
        if ((fromLeft + tempWidth + this.balloon.outerWidth()) > $(window).width() && (switcher == "right"))
            switcher = "bottom";        
        
        if ((fromLeft) > $(window).width() && (switcher == "left"))
            switcher = "bottom";        

        if (offsetY < 0 && (fromTop + 20) > balloonHeight && switcher == "bottom")
            switcher = "top";        
        
        if (balloonHeight > fromTop && switcher == "top")
            switcher = "bottom";
        
        this.balloon.removeClass("bottom");
        this.balloon.removeClass("top");
        this.balloon.removeClass("left");
        this.balloon.removeClass("right");
        this.balloon.addClass(switcher);
        
        this.balloon.removeAttr('style');
        switch (switcher) {
            case "bottom":
            	var left=-1;            	
            	if (((fromLeft + tempWidth + this.balloon.outerWidth()) > $(window).width()) && (fromLeft + this.balloon.outerWidth() > $(window).width()) )
            		left=- this.balloon.outerWidth()+50;
            	
                this.balloon.css({ left: left, top: "" + (container.height() + this.options.balloonDistance + 1) + "px" });
                left= -left + 10 - offsetX;
                this.balloonArrow
                    .css({ top: -this.options.balloonDistance, left: left, bottom: "auto" }).css("border-width", this.options.balloonDistance + "px")
                if ((this.options.groupName != ""))
                    this.balloon.css("min-width", this.group.width());
                break;
            case "top":                
            	var left=-1;
            	if (((fromLeft + tempWidth + this.balloon.outerWidth()) > $(window).width()) && (fromLeft + this.balloon.outerWidth() > $(window).width()) )
            		left=- this.balloon.outerWidth()+50;
            	
            	this.balloon.css({ left: left, top: "" + (-this.balloon.outerHeight() - this.options.balloonDistance) + "px" });
            	left= -left + 10 - offsetX;
                this.balloonArrow.css({ bottom: -this.options.balloonDistance, left: left, top: "auto" }).css("border-width", this.options.balloonDistance + "px");
                if ((this.options.groupName != ""))
                    this.balloon.css("min-width", this.group.width());
                break;
            case "right":
                this.balloon.css({ left: (container.width() + this.options.balloonDistance) + "px", top: "" + (offsetY - 10) + "px" });
                this.balloonArrow.css({ top: "" + (-offsetY + this.options.balloonTopGap) + "px", left: -this.options.balloonDistance + "px" }).css("border-width", this.options.balloonDistance + "px");               
                break;
            case "left":
                this.balloon.css({ left: (-this.balloon.outerWidth() - this.options.balloonDistance) + "px", top: "" + (offsetY - 10) + "px" });
                this.balloonArrow.css({ top: "" + (-offsetY + this.options.balloonTopGap) + "px", right: -this.options.balloonDistance + "px" }).css("border-width", this.options.balloonDistance + "px");
                break;
        }
    },

    /*********************** PUBLIC FUNCTIONS ****************************/
    // put the content in balloon
    setballoonContent: function () {
        this.balloonFooter = this.options.balloonFooter;
        this._putFooter();
    },

    // focus on the element and show the balloon
    showBalloon: function () {
        this.el.focus();
        this.wrapper.click();
    },

    _setUpBalloon: function () {
        this._putFooter();

        //* position the ballon after 
        var _self = this;
        setTimeout(function () { _self._positionBalloon() }, 200);
        
    },

    _bindBalloonEvents: function () {
        var _self = this;
        this.el.bind("addClass", function (e, args) {
            if (args == "active" || args == "activeHover") {
                setTimeout(function () { _self._positionBalloon() }, 10);
            }
        });        
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing balloon");
        this._setUpBalloon();
        this._bindBalloonEvents();
    }

});

$(function () {
    $.fn.balloon = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new balloon(options, this);
                $.data(this, 'balloon', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								PROGRESSBAR																		   */
/* *****************************************************************************************************************/

var progressBar = wrapper.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                progressWidth: "100%",		//The percentage of the progress bar
                progressScale: [0,100],		//The scale of the progress bar - can be different from 0-100
                progressAnimate: false		//If must animate when changing the value
            }
        );
        this.base(options, elem);
        this.el.addClass("progressBar");
        this.wrapper.addClass(this.options.idPrefix + "progressBar");
        this.el.append("<div />");
        if (this.options.progressAnimate) this.el.find("div").addClass("animate");
        this.el.find("div").append("<span/>")
        this.el.width(this.options.progressWidth);
    },

    setPercent: function (value, decimals) {        
    	decimals = (typeof decimals == "undefined") ? 2 : decimals;
        var gap = this.options.progressScale[1] - this.options.progressScale[0], calcValue = value / gap * 100;        
        this.el.find("div").width(calcValue + "%");        
        this.el.find("div span").html("&nbsp;" +  parseFloat(value).toFixed(decimals) + " %&nbsp;");
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.el.width(this.options.progressWidth);
    }

});

$(function () {
    $.fn.progressBar = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new progressBar(options, this);
                $.data(this, 'progressBar', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								VALIDATION																		   */
/* *****************************************************************************************************************/

/* generic Class for validation error passtrought */
var Cvalid = logger.extend({
    constructor: function () {
        this.valid = true,
        this.errorMessage = ""
    },
    valid: true,
    errorMessage: ""
});

/*
    MODULE: Validator
    el:         jQuery object of the initial HTML object
    getValue:   retrieve the value
*/
var Ivalidator = base2.Module.extend(
    {
        forms: [],        
        
        formBinding: null,
        
        list: new base2.Collection(),

        firstServerValidation: function (implementer) {
            var oValid = this.validate(implementer, "onlyServer");
            if (oValid.valid == false && this.firstValidationDone == false) {
                this.firstValidationDone = true;
                setTimeout(function () { implementer.el.triggerHandler("validationFocus", [oValid]); }, 500);
            }
        },

        validate: function (implementer, options) {
            var ret = new Cvalid();
            if ((!validationRules.disabled || options == "onlyServer") && implementer.el.attr("disabled") != "disabled") {
                implementer.validationRules.forEach(function (params, rule) {                	
                    if (rule == "server") {
                        if (implementer.el._startValue == implementer.el.getElementVal() && params.message != "") {
                            ret.valid = false;
                            implementer.balloonError.html(params.message);
                            ret.errorMessage = params.message;
                        }
                    }
                    else if (options != "onlyServer" && !validationRules[rule].test.call(implementer, params)) {
                        if (ret.valid)
                            if (params && typeof params.message != "undefined") {
                                ret.errorMessage = validationRules.parseParam(params.message, params);
                                implementer.balloonError.html(ret.errorMessage);
                            } else {
                                ret.errorMessage = validationRules.parseParam(validationRules[rule].message, params);
                                implementer.balloonError.html(ret.errorMessage);
                            }
                        ret.valid = false;
                    }
                });
                setTimeout(function() {implementer._positionBalloon();},50);
            }

            if (options != "onlyServer")
                implementer.el.removeClass("validationStart");

            if (ret.valid)
                implementer.el.removeClass("validationError");
            else
                implementer.el.addClass("validationError");

            return ret;
        },

        soundAlert: false,

        firstValidationDone: false,

        bindValidation: function (implementer) {
            var _self = this;
            var form = $();
            var tempForm = null;
            var len = _self.forms.length;
            for (i=0; i<len;i++) {            	
        		if (_self.forms[i].get(0)===implementer.el.closest("form").get(0))
        			_self.forms[i] = implementer.el.closest("form");
        		else
        			tempForm = _self.forms[_self.forms.length] = implementer.el.closest("form");
            }
            
            
            if (tempForm === null){
            	form = implementer.el.closest("form");
            	_self.forms[0] = form;
        	}
            else {
            	form = tempForm;            	            	
            }
            
            implementer.el._startValue = implementer.el.getElementVal();
            implementer.validationTrigger();
            
            implementer.el.addClass("validationStart");

            /* validate event */
            implementer.el.on("validate", function (e, args) { 
            	_self.validate(implementer);            	
            	if (implementer.validationRules.indexOf("requiredLinked")!=-1 && implementer.el.val() =="") {            		
            		if (typeof args == "undefined" || args != "stopLink")
            			$("#" + implementer.validationRules.item("requiredLinked").id).triggerHandler("validate", "stopLink");             		
            	}
            });

            _self.list.add(_self.list.size(), implementer);            
            
            
            form.unbind("submit");
            
            form.submit(function (e) {
                var first = true;
                var oValid = {};
                var _form = this;
                var onSubmit = [];
                _self.list.forEach(function (impl, key) {
                    if ($.contains(_form, impl.el.get(0))) {
                    	oValid = _self.validate(impl);
	                    if (first && typeof impl.el.context != "undefined" && !oValid.valid) {
	                        impl.el.triggerHandler("validationFocus", [oValid]);
	                        $("body").triggerHandler("formError", [oValid, impl]);
	                        first = false;
	                    }
                    	if (impl.options.onFormSubmit != null) {
                    		onSubmit[onSubmit.length] = impl;
                    	}
                    }
                });
                
                if (form.find(".validationError").length == 0) {
                	for (i=0; i< onSubmit.length; i++) {
                		onSubmit[i].options.onFormSubmit.call(onSubmit[i], e);
                	}
                    return true;
                }
                e.preventDefault();

                if (_self.soundAlert) {
                    new base2.Paudio.Note("G7").play();
                }

                return false;
            });

            _self.firstServerValidation(implementer);

        }

    }
);

/* class that implements requested features from the Ivalidator module */
var validator = balloon.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                validationRules: new base2.Collection(),	//A collection of validationRules to apply to the component
        		onFormSubmit: null							//Action to do when the form is submitted
            }
        );
        this.base(options, elem);
        this.validationElemToFocus = this.el;
        this._setUpValidator();

    },

    validationRules: new base2.Collection(),
    stopValidate: false,
    
    /****************** implementation for validation (can be rewrited) ********************/
    validationTrigger: function () { },
    getValue: function () { return this.el.getElementVal(); },
    validationElemToFocus: $(),
    /****************** end implementation for validation ********************/

    _setUpValidator: function () {
        this.validationRules = this.options.validationRules;
        this.bindValidation();

        var _self = this;

        this.el.on("validationFocus", function (event, validation) {            
        	validation = (validation) ? validation : new Cvalid();
            if (_self.el.visible(core.screenMargin)==false)
            	_self.el.scrollToMe(222, - 33 - core.screenMargin[0]);
            
            /* close the overlay */
            if (_self.validationElemToFocus.closest("#overlay-container").length == 0) IOverlay.interfaceClose();
            
            core.preventUnloadMsg = false;
            setTimeout(function() {_self.validationElemToFocus.trigger("focus");},200);            
            /* this params object can be used to for raising a single error alert */
            /* EXAMPLE: */
            //if(!validation.valid) alert(validation.errorMessage);
        });
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing validator");
        this._setUpValidator();
    }

});


/* A minimal set of validation rules that can be extended */
var validationRules = {

    /* for disabling all validation rules but server validation works */
    disabled: false,

    parseValue: function (value) {
        if (value instanceof Date)
            value = value.toFormatString(core.language.shortDateFormat);
        return value;
    },

    parseParam: function (message, params) {
        var temp = "";
        var array = message.match(/{[^}]+}/g);
        if (array != null) {
            for (e in array) {
                temp = array[e].toString().replace("{", "").replace("}", "");
                if (typeof params[temp] != "undefined")
                    message = message.replace("{" + temp + "}", validationRules.parseValue(params[temp]));
            }
        }
        return message;
    },
    server: {
        test: function () { return false },
        message: ""
    },
    required: {
        name: "required",
        test: function () {
            if (this.getValue() == "")
                return false;
            return true;
        },
        message: "This field is required."
    },
    properNames: {
        test: function () {
            return this.getValue() == "" || /^[a-zA-Z'\s-]*$/i.test(this.getValue());
        },
        message: "This field is not valid."
    },
    regEx: {
        test: function (params) {
            return this.getValue() == "" || params.regEx.test(this.getValue());
        },
        message: "This field is not valid."
    },
    regExNot: {
        test: function (params) {
            return this.getValue() == "" || !params.regEx.test(this.getValue());
        },
        message: "This field is not valid."
    },
    lowercase: {
        test: function () {
            return this.getValue() == "" || !/[A-Z]/.test(this.getValue());
        },
        message: "Uppercase chars are not allowed."
    },
    strictEmail: {
        test: function () {
            return this.getValue() == "" || /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9_%-][a-zA-Z0-9._%-]+\.[a-zA-Z]{2,4})+$/.test(this.getValue());
        },
        message: "Please enter a valid email address."
    },
    address: {
        test: function () {
            return this.getValue() == "" || /^[a-zA-Z0-9.\-,'\s]*$/i.test(this.getValue());
        },
        message: "This is not a valid address."
    },
    lettersAndNumbers: {
        test: function () {
            return this.getValue() == "" || /^[a-zA-Z0-9,'\s]+$/i.test(this.getValue());
        },
        message: "This field must contain letters and number only."
    },
    website: {
        test: function () {
            return this.getValue() == "" || ((/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(this.getValue()) && (!this.getValue().match(/\s/))));
        },
        message: ""
    },
    checked: {
        test: function () {
            if (this.getValue())
                return true;
            return false;
        },
        message: "Please check this option."
    },
    color: {
        test: function (params) {
            var ret = true;
            switch (params.type) {
                case "hex":
                    ret = this.getValue() == "" || /^#([A-Fa-f0-9]{6})$/.test(this.getValue());
                    break;
            }
            return ret;
        },
        message: "Please enter a valid color."
    },
    minLength: {
        test: function (params) {
            return this.getValue() == "" || this.getValue().length >= params.min;
        },
        message: "Please enter at least {min} characters."
    },
    maxLength: {
        test: function (params) {
            return this.getValue() == "" || this.getValue().length <= params.max;
        },
        message: "Please enter no more than {max} characters."
    },
    rangeLength: {
        test: function (params) {
            return this.getValue() == "" || (this.getValue().length >= params.min && this.getValue().length <= params.max);
        },
        message: "Please enter at least {min} and no more than {max} characters."
    },
    min: {
        test: function (params) {
            return this.getValue() >= params.min;
        },
        message: "Please enter a number higher than {min}."
    },
    max: {
        test: function (params) {
            return this.getValue() <= params.max;
        },
        message: "Please enter a number lower than {max}."
    },
    range: {
        test: function (params) {
            return (this.getValue() >= params.min && this.getValue() <= params.max);
        },
        message: "Please enter a number higher than {min} and lower than {max}."
    },
    date: {
        test: function () {
            return this.getValue() == ""
				|| this.getValue().isDate();          
        },
        message: "Please enter a valid date."
    },
    dateRange: {
        test: function (params) {
            var d = this.getValue().split('-');
            var date = new Date(d.join("-"));
            return (date.getTime() >= params.min.setHours(0,0,0,0) && date.getTime() <= params.max.setHours(0,0,0,0));
        },
        message: "Please enter a date between {min} and {max}."
    },
    dateMax: {
        test: function (params) {
            var d = this.getValue().split('-');
            var date = new Date(d.join("-"));
            return date.getTime() <= params.max.setHours(23,59,59,0);
        },
        message: "Please enter a date lower or equal to {max}."
    },
    number: {
        test: function () {
            return !isNaN(this.getValue());
        },
        message: "Please enter a valid number."
    },
	time : {
		test : function() {
			return this.getValue() == ""
				|| this.getValue().toString().isTime();
		},
		message : 'Please enter a valid 24h time.'
	}
}

var ERules = {};

(function setErules() {
    for (name in validationRules) {
        if (typeof validationRules[name] == "object")
            ERules[name] = name;
    }
})();

/* *****************************************************************************************************************/
/*								SLIDE INPUT																		   */
/* *****************************************************************************************************************/

var slideInput = validator.extend({

    constructor: function (options,elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                slideInputDirection: "horizontal",		//Direction
                slideInputStep: 100,					//the scrolled width/height when the mouse wheel is used
                slideInputToFixed: 0,					//The Floating numbers of the returned number
                slideInputRange: [1,100],				//The range
                slideInputChange: function() {}			//The callback function on change value
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "slideInput");
        this._createSlideInput();
        if (this.el.val() != "") {
            var _self = this;
            var scroll = -(_self._slideInputScroller.el.width());
            _self._slideInputScroller.scrollToPerc(this.el.val());
            setTimeout(function () { _self.el.triggerHandler("changeValue"); }, 5);
        }
                
    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("changeValue", function (e) {
            _self.el.trigger("validate");
        });
    },
    
    _slideInput: $(),
    _slideInputScroller: $(),
    _slideInputProgress: $(),

    //create the scroller
    _createSlideInput: function () {

        this._slideInputProgress = new progressBar();
        this.wrapper.append(this._slideInputProgress.wrapper);

        this._slideInput = $('<div class="inputSlide">&nbsp;</div>');
        this._slideInput.height(8);
        var width = this.wrapper.width() * 26; //26px scroller width
        this._slideInput.width(width);
        this._slideInputScroller = new scroller({
            scrollMouseStep: this.options.slideInputStep,
            scrollbarRange: 15,
            scrollDirection: this.options.slideInputDirection,
            scrollRange: this.wrapper.width()
        }, this._slideInput);
        
        this.wrapper.append(this._slideInputScroller.wrapper);

        var _self = this;

        this._slideInput.on("scrollChange", function (event, percentual) {
            percentual = parseFloat(percentual).toFixed(_self.options.slideInputToFixed);
            percentual = (percentual < _self.options.slideInputRange[0]) ? _self.options.slideInputRange[0] : (percentual > _self.options.slideInputRange[1]) ? _self.options.slideInputRange[1] : percentual;
            _self._slideInputProgress.setPercent(percentual, 0);
            _self.el.val(parseInt(percentual, 10));
            _self.el.trigger("changeValue");
        });
        
        this.el.keydown(function (e) {
            switch (e.keyCode) {
                case _self.keyCodes.DOWN_ARROW:
                case _self.keyCodes.LEFT_ARROW:
                    e.preventDefault();
                    this.value = parseFloat(parseFloat(this.value).toFixed(_self.options.slideInputToFixed)) - 1;
                    break;
                case _self.keyCodes.UP_ARROW:
                case _self.keyCodes.RIGHT_ARROW:
                    e.preventDefault();                    
                    this.value = parseFloat(parseFloat(this.value).toFixed(_self.options.slideInputToFixed)) +1;
                    break;
            }
            this.value = (this.value < _self.options.slideInputRange[0]) ? _self.options.slideInputRange[0] : (this.value > _self.options.slideInputRange[1]) ? _self.options.slideInputRange[1] : this.value;
            _self._slideInputScroller.scrollToPerc(this.value);
            _self.el.trigger("changeValue");
        });

        this.el.bind("changeValue", function (e) {            
            _self.options.slideInputChange.call(_self);
        });

        this._setUpslideInput();
        this.el.addClass("hide");
    },
    /****************** end implementation for validation ********************/

    _setUpslideInput: function () {
        this._slideInput.detach();
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing slideInput");
        this._setUpslideInput();
    }
});
slideInput.implement(Ivalidator);

$(function () {
    $.fn.slideInput = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new slideInput(options, this);
                $.data(this, 'slideInput', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								DATE    																		   */
/* *****************************************************************************************************************/
var date = validator.extend({

    /* mask properties and jquery objects */
    calendar: $(),
    calendarDate: new Date(),
    calendarSelectDate: new Date(),
    calendarPrev: $(),
    calendarNext: $(),
    calendarMonth: $(),
    calendarYear: $(),
    calendarTable: $(),
    calendarDateDivider: "-",
    /* initialize the component */
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                dateRange: [new Date(), new Date(new Date().getTime() + 900 * 86400000)],	//The range of the dates that can be selected
                dateToday: new Date(),														//Today
                dateFormat: "dmy", //order date,month,year									//the order of the Date/Month/Year inputs
                dateDivider: "/"															//The char divider  
            }
        );

        this.base(options, elem);
        this.type = "date";
        this.wrapper.addClass(this.options.idPrefix + "date");
        this.dateArray = new Array();

        if (!browser.useInputDate()) {
            /* normalize dateRange */
            this.options.dateRange[0].normalize();
            this.options.dateRange[1].normalize(true);

            this.calendarDate = this.options.dateToday;
            this.calendarDate.normalize();
            this.calendarSelectDate.setTime(this.calendarDate.getTime());

            this._createDateContainer();
            this._createCalendar();

            this._setUpCalendar();
            if (this.el.val() != "")
                this._changeCalValue();
        } else {
            if (this.options.balloonPosition == "bottom") this.options.balloonPosition = "top";
        }

    },

    
    dateYear: $(), dateMonth: $(), dateDay: $(), dateArray: [],
    _createDateContainer: function () {

        this.el.addClass("hide");
        
        this.dateDay = $('<input type="text" maxlength="2" size="2" class="day" placeholder="dd" />');
        this.dateMonth = $('<input type="text" maxlength="2" size="2"  class="month" placeholder="mm"/>');
        this.dateYear = $('<input type="text" maxlength="4" size="4"  class="year" placeholder="yyyy"/>');

        for (i = 0; i < 3; i++) {
            if (this.options.dateFormat[i] == 'd') { this.wrapper.append(this.dateDay); this.dateDay.attr("data-index",i); this.dateArray[this.dateArray.length] = this.dateDay }
            if (this.options.dateFormat[i] == 'm') { this.wrapper.append(this.dateMonth); this.dateMonth.attr("data-index", i); this.dateArray[this.dateArray.length] = this.dateMonth }
            if (this.options.dateFormat[i] == 'y') { this.wrapper.append(this.dateYear); this.dateYear.attr("data-index", i); this.dateArray[this.dateArray.length] = this.dateYear }
            if (i != 2) this.wrapper.append(this.options.dateDivider);
        }
        this.wrapper.append(this.icon);
    },

    _setUpCalendar: function () {

        this.calendarMonth.unbind();
        this.calendarYear.unbind();
        this.calendarPrev.unbind();
        this.calendarNext.unbind();
        this._bindCalendarEvents();
    },

    _createCalendar: function () {

        this.calendar = $('<div class="calendar-wrapper" />');
        this.calendarPrev = $('<div class="prev" />');
        this.calendarNext = $('<div class="next" />');
        this.calendarMonth = $('<select class="month" tabindex="999" />');
        this.calendarYear = $('<select class="year" tabindex="999" />');
        this.calendarTable = $('<div class="table" />');
        this.calendar.append(this.calendarPrev);

        this._fillMonthSelect();
        this.calendar.append(this.calendarMonth);
                
        for (i = this.options.dateRange[0].getFullYear() ; i <= this.options.dateRange[1].getFullYear() ; i++)
            this.calendarYear.append('<option value="' + i + '">' + i + '</option>');
        this.calendarYear.width(70);

        this.calendar.append(this.calendarYear);
        this.calendar.append(this.calendarNext);

        this._fillCalendarTable();
        this.calendar.append(this.calendarTable);

        this.balloonItem.append(this.calendar);
    },

    _fillMonthSelect: function () {
        /* Months */
        this.calendarMonth.empty();
        var year = this.calendarSelectDate.getFullYear();
        var create = true;
        for (i = 0; i < 12; i++) {
            if (this.calendarSelectDate.getFullYear() == this.options.dateRange[0].getFullYear())
                if (i < this.options.dateRange[0].getMonth())
                    create = false;
            if (this.calendarSelectDate.getFullYear() == this.options.dateRange[1].getFullYear())
                if (i > this.options.dateRange[1].getMonth())
                    create = false;
            if (create)
                this.calendarMonth.append('<option value="' + i + '">' + core.language.MonthNames[i] + '</option>');
            create = true;
        }
    },

    _fillCalendarTable: function () {
        this.calendarTable.empty();
        var startDay = 1;
        var date = this.calendarSelectDate;
        var firstDayOfMonth = new Date(date);
        firstDayOfMonth.setDate(1);

        /* Header */
        for (i = 0 + startDay; i < (7 + startDay) ; i++)
            this.calendarTable.append('<div class="element header">' + core.language.DayNames[i % 7].substr(0, 3) + '</div>');

        /* previous Month Days */
        var prevMonth = (firstDayOfMonth.getDay() - startDay);
        prevMonth = (prevMonth < 0) ? prevMonth + 7 : prevMonth;
        prevMonth += 7;
        var temp = new Date(firstDayOfMonth);
        for (i = prevMonth ; i > 0; i--) {
            temp.setTime(firstDayOfMonth.getTime() - i * 86400000);
            var dayObj = $('<div class="element day disabled" data-value="' + temp.getTime() + '">' + temp.getDate() + '</div>');
            this._addCalendarItemEvents(dayObj, temp);
            this.calendarTable.append(dayObj);
        }

        /* Month Days */
        var thisMonth = date.getMonth();
        i = 0;
        temp.setTime(firstDayOfMonth.getTime() + i * 86400000);
        /* today */
        var today = this.options.dateToday; today.normalize();

        while (temp.getMonth() == thisMonth) {
            var dayObj = $('<div class="element day" data-value="' + temp.getTime() + '">' + temp.getDate() + '</div>');
            if (temp.getTime() == today.getTime()) dayObj.addClass("today");
            this._addCalendarItemEvents(dayObj, temp);
            this.calendarTable.append(dayObj);
            i++;
            temp.setTime(firstDayOfMonth.getTime() + i * 86400000);
        };

        /* next Month Days */
        var firstDayOfNextMonth = new Date(date); firstDayOfNextMonth.setDate(1); firstDayOfNextMonth.setMonth(date.getMonth() + 1);
        var nextMonth = 7 - (firstDayOfNextMonth.getDay() - startDay);
        nextMonth = (nextMonth < 0) ? nextMonth + 7 : nextMonth;
        nextMonth += 7;
        var temp = new Date(firstDayOfNextMonth);
        for (i = 0 ; i < nextMonth; i++) {
            temp.setTime(firstDayOfNextMonth.getTime() + i * 86400000);
            var dayObj = $('<div class="element day disabled" data-value="' + temp.getTime() + '">' + temp.getDate() + '</div>');
            this._addCalendarItemEvents(dayObj, temp);
            this.calendarTable.append(dayObj);
        }

        this._highlightSelectedCalendar();
        this._positionBalloon();
    },

    _addCalendarItemEvents: function (dayObj, temp) {
        var _self = this;
        if (temp.getTime() >= this.options.dateRange[0].getTime() && temp.getTime() <= this.options.dateRange[1].getTime()) {
            dayObj.click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                _self._setCalendarValue(parseInt($(this).attr("data-value")));
                _self.el.focus();
                setTimeout(function () {
                    _self.el.removeClass("active");
                    _self.el.triggerHandler("validate")
                    if (_self.options.groupName != "" &&
                        _self.getGroupItems()[_self.options.groupName].length == 2 &&
                        _self.groupCount == 0) {
                        try {
                            _self.getGroupItems()[_self.options.groupName][1].dateArray[0].focus();
                        } catch (e) {}
                    }
                }, 20);
            });

            dayObj.mouseenter(function () {
                _self.calendarTable.find(".element.itemHover").removeClass("itemHover");
                $(this).addClass("itemHover");
                var time = parseInt($(this).attr("data-value"));
                _self._refreshGroupPeriod(time);
            });
        } else {
            dayObj.addClass("removed");
        }

    },

    _refreshGroupPeriod: function (endDate) {
        var _self = this;
        _self.calendarTable.find(".element.period").removeClass("period");
        if (_self.options.groupName != "" &&
            _self.getGroupItems()[_self.options.groupName].length == 2 &&
            _self.groupCount == 1)
            _self.calendarTable.find(".element").each(function (index, value) {
                var t = new Date(parseInt($(this).attr("data-value"))).setHours(11);
                if (t >= _self.getGroupItems()[_self.options.groupName][0].calendarDate.getTime() &&
                    t <= endDate)
                    $(this).addClass("period");
            });
    },

    _changeCalValue: function () {
        var d = this.getValue().split('-');
        d = new Date(d.join(this.calendarDateDivider));
        if (d.getTime() >= this.options.dateRange[0].getTime() &&
            d.getTime() <= this.options.dateRange[1].getTime()) {
            this.calendarDate = d;
            this.calendarSelectDate.setTime(this.calendarDate.getTime());
            this.dateDay.val(this.calendarDate.toFormatString("dd"));
            this.dateMonth.val(this.calendarDate.toFormatString("mm"));
            this.dateYear.val(this.calendarDate.toFormatString("yyyy"));
            //this.el.triggerHandler("change");
        }
        if (this.options.groupName != "")
            if (this.getGroupItems()[this.options.groupName].length == 2)
                if (this.getGroupItems()[this.options.groupName][0].type == "calendar" && this.getGroupItems()[this.options.groupName][1].type == "calendar")
                    if (this.groupCount == 0) {
                        this.getGroupItems()[this.options.groupName][1].options.dateRange[0] = new Date(this.calendarDate.getTime());
                        this.getGroupItems()[this.options.groupName][1].refresh();
                        if (this.getGroupItems()[this.options.groupName][1].calendarDate.getTime() < this.calendarDate.getTime())
                            this.getGroupItems()[this.options.groupName][1].calendarDate.setTime(this.calendarDate.getTime());
                    }
    },

    _setCalendarValue: function (time) {
        
        this.calendarDate.setTime(time);
        this.el.val(new Date(time).toFormatString("yyyy" + this.calendarDateDivider + "mm" + this.calendarDateDivider + "dd"));
        this._changeCalValue();

    },

    _bindCalendarEvents: function () {
        var _self = this;

        this.el.bind("change", function () {            
            _self._changeCalValue();
            //_self.calendarSelectDate.setTime(_self.calendarDate.getTime());
            //_self._fillMonthSelect();
            //_self.calendarMonth.val(_self.calendarDate.getMonth());
            //_self.calendarYear.val(_self.calendarDate.getFullYear());
            _self._fillCalendarTable();            
        });

        this.calendarTable.mouseleave(function () {
            _self._highlightSelectedCalendar();
        });

        this.dateDay
            .add(this.dateMonth)
            .add(this.dateYear)
        .focus(function () {
            _self.calendarMonth.val(_self.calendarDate.getMonth());
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self.calendarSelectDate.setTime(_self.calendarDate.getTime());
            _self._fillCalendarTable();
        });        

        this.dateDay
            .add(this.dateMonth)
            .add(this.dateYear)
        .keyup(function (e) {            
            if (_self.keyCodes.NUMBER_KEYS.indexOf(e.keyCode) != -1) {
                var date = new Date(_self.dateYear.val(), _self.dateMonth.val()-1, _self.dateDay.val());            
                if (date.toString() != "Invalid Date" && _self.dateDay.val().length == 2 && _self.dateMonth.val().length == 2 && _self.dateYear.val().length == 4) {
                    _self._setCalendarValue(date.getTime());
                    _self.el.triggerHandler("change");
                }
                var num = $(this).attr("data-index"); num++;
                if (num < 3 && $(this).val().length == 2) _self.dateArray[num].focus();
            } else if (e.keyCode == _self.keyCodes.BACK_SPACE) {                
                if ($(this).val() == "") {
                    var num = $(this).attr("data-index"); num--;
                    if (num > -1) _self.dateArray[num].focus();
                }
            }

            var strDate = "" + _self.dateYear.val() + "-" + _self.dateMonth.val() + "-" + _self.dateDay.val();            
            if (!strDate.isDate()) _self.oEl.value = "";

            _self.calendarSelectDate.setTime(_self.calendarDate.getTime());
            _self._fillMonthSelect();
            _self.calendarMonth.val(_self.calendarDate.getMonth());
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self._fillCalendarTable();
        });

        this.dateDay
            .add(this.dateMonth)
        .blur(function () {
            var val = $(this).val().toString();
            if (val!="") $(this).val(val.padLeft(2, "0"));
        });

        this.dateDay.keydown(function (e) {
            switch (e.keyCode) {
                case _self.keyCodes.DOWN_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(_self.calendarDate.getTime() - 86400000);
                    break;
                case _self.keyCodes.UP_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(_self.calendarDate.getTime() + 86400000);
                    break;
            }
        });

        this.dateMonth.keydown(function (e) {
            switch (e.keyCode) {
                case _self.keyCodes.DOWN_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(new Date(new Date(_self.calendarDate).setMonth(_self.calendarDate.getMonth() - 1)).getTime());
                    break;
                case _self.keyCodes.UP_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(new Date(new Date(_self.calendarDate).setMonth(_self.calendarDate.getMonth() + 1)).getTime());
                    break;
            }
        });

        this.dateYear.keydown(function (e) {
            switch (e.keyCode) {
                case _self.keyCodes.DOWN_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(new Date(new Date(_self.calendarDate).setFullYear(_self.calendarDate.getFullYear() - 1)).getTime());
                    break;
                case _self.keyCodes.UP_ARROW:
                    e.preventDefault();
                    _self._setCalendarValue(new Date(new Date(_self.calendarDate).setFullYear(_self.calendarDate.getFullYear() + 1)).getTime());
                    break;
            }

            _self.calendarSelectDate.setTime(_self.calendarDate.getTime());
            _self.calendarMonth.val(_self.calendarDate.getMonth());
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self._fillCalendarTable();
        });

        this.calendarMonth.change(function () {
            _self.calendarSelectDate.setMonth(_self.calendarMonth.val());
            _self._fillCalendarTable();
        });

        this.calendarYear.change(function () {
            _self.calendarSelectDate.setFullYear(_self.calendarYear.val());
            _self._fillMonthSelect();
            _self.calendarSelectDate.setMonth(_self.calendarMonth.val());
            _self._fillCalendarTable();
        });

        this.calendarPrev.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            var test = new Date(_self.calendarSelectDate.getTime());
            test.setDate(1); test.setTime(test.getTime() - 86400000);
            if (test.getTime() > _self.options.dateRange[0].getTime()) {
                _self.calendarSelectDate.setDate(1);
                _self.calendarSelectDate.setMonth(_self.calendarSelectDate.getMonth() - 1);
                _self.calendarYear.val(_self.calendarSelectDate.getFullYear());
                _self._fillMonthSelect();
                _self.calendarMonth.val(_self.calendarSelectDate.getMonth());
                _self._fillCalendarTable();
            }
        });

        this.calendarNext.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            var test = new Date(_self.calendarSelectDate.getTime());
            test.setDate(1); test.setMonth(test.getMonth() + 1);
            if (test.getTime() < _self.options.dateRange[1].getTime()) {
                _self.calendarSelectDate.setDate(1);
                _self.calendarSelectDate.setMonth(_self.calendarSelectDate.getMonth() + 1);
                _self.calendarYear.val(_self.calendarSelectDate.getFullYear());
                _self._fillMonthSelect();
                _self.calendarMonth.val(_self.calendarSelectDate.getMonth());
                _self._fillCalendarTable();
            }
        });

    },

    _highlightSelectedCalendar: function () {
        this.calendarTable.find("div.itemHover").removeClass("itemHover");
        this.calendarTable.find("div[data-value='" + this.calendarSelectDate.getTime() + "']").addClass("itemHover");
        this._refreshGroupPeriod(this.calendarSelectDate.getTime());
    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        /* validate on Original change */
        this.el.bind("change", function (e) {
            if (e.keyCode != _self.keyCodes.TAB)
                _self.el.trigger("validate");
        });
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing calendar");
        this._setUpCalendar();
    }

});
date.implement(Ivalidator);

$(function () {
    $.fn.date = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new date(options, this);
                $.data(this, 'date', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								TIME    																		   */
/* *****************************************************************************************************************/
var time = validator.extend({

    /* mask properties and jquery objects */
    timeDivider: ":",
    timeValue: "",

    /* initialize the component */
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                
            }
        );
        this.base(options, elem);
        this.type = "date";
        this.wrapper.addClass(this.options.idPrefix + "time");

        if (!browser.useInputTime()) {            
            this._createTimeContainer();
            this._setUpTime();
            if (this.el.val() != "")
                this._changeTimeValue();
        }
    },

    dateHour: $(), dateMinute: $(),

    _createTimeContainer: function () {
        this.el.addClass("hide");
        this.dateHour = $('<input type="text" maxlength="2" size="2" class="hour" placeholder="hh" />');
        this.dateMinute = $('<input type="text" maxlength="2" size="2"  class="minutes" placeholder="mm"/>');
        this.wrapper.append(this.dateHour);
        this.wrapper.append(this.timeDivider);
        this.wrapper.append(this.dateMinute);
        this.wrapper.append(this.icon);
    },

    _setUpTime: function () {
        this._bindTimeEvents();
    },

    _changeTimeValue: function () {
        var time = this.getValue().split(":");
        this.timeValue = this.getValue();
        this.dateHour.val(time[0]);
        this.dateMinute.val(time[1]);       
    },

    _setTimeValue: function (time) {        
        this.timeValue=time;
        this.el.val(time);
        this._changeTimeValue();
    },

    _bindTimeEvents: function () {
        var _self = this;

        this.el.bind("change", function () {
            _self._changeTimeValue();            
        });
        
        this.dateHour
            .add(this.dateMinute)
        .keyup(function (e) {
            if (_self.keyCodes.NUMBER_KEYS.indexOf(e.keyCode) != -1) {                
                if (_self.dateHour.val().length == 2 && _self.dateMinute.val().length == 2) {
                    _self._setTimeValue(_self.dateHour.val() + ":" + _self.dateMinute.val());
                    _self.el.triggerHandler("change");
                }               
                if ($(this).hasClass("hour") && $(this).val().length == 2) _self.dateMinute.focus().selectAll();
            } else if (e.keyCode == _self.keyCodes.BACK_SPACE) {                
                if ($(this).hasClass("minutes") && $(this).val() == "") _self.dateHour.focus();
            }
            if (!(_self.dateHour.val() + ":" + _self.dateMinute.val()).isTime()) _self.oEl.value = "";
        });

        this.dateHour
            .add(this.dateMinute)
        .blur(function () {
            var val = $(this).val().toString();
            if (val != "") $(this).val(val.padLeft(2, "0"));
            if (_self.dateHour.val().length == 2 && _self.dateMinute.val().length == 2)
                _self._setTimeValue(_self.dateHour.val() + ":" + _self.dateMinute.val());
        });

    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        /* validate on Original change */
        this.el.bind("change", function (e) {
            if (e.keyCode != _self.keyCodes.TAB)
                _self.el.trigger("validate");
        });
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing calendar");
        this._setUpTime();
    }

});
time.implement(Ivalidator);

$(function () {
    $.fn.time = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new time(options, this);
                $.data(this, 'time', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								TEXTBOX 																		   */
/* *****************************************************************************************************************/
var textbox = validator.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                textboxCharCounter: false	//if true activate a char counter label (class="counter")
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "textbox");
        if (this.options.textboxCharCounter) {
        	this._textboxCharCounter = $('<div class="counter">0</div>');
        	this.wrapper.append(this._textboxCharCounter);
        }
        this._setUptextbox();

    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;        
        this.el.bind("keyup", function (e) {        	
            if (e.keyCode != _self.keyCodes.TAB && !_self.stopValidate)
                _self.el.trigger("validate");
            else
            	setTimeout(function() {_self.stopValidate = false;},500);
        });
    },
    /****************** end implementation for validation ********************/

    _textboxCharCounter: $(),

    _setUptextbox: function () {
        if (this.options.textboxCharCounter) {
            var _self = this;            
            this._textboxCharCounter.html(_self.el.val().toString().length);
            this.el.keyup(function () {
                _self._textboxCharCounter.html(_self.el.val().toString().length);
            });
        }
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing textbox");
        this._setUptextbox();
    }
});
textbox.implement(Ivalidator);

$(function () {
    $.fn.textbox = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new textbox(options, this);
                $.data(this, 'textbox', myObj);
            });
        }
    };
});
/* *****************************************************************************************************************/
/*								CHECKBOX																		   */
/* *****************************************************************************************************************/
var checkbox = validator.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                checkboxType: 'checkbox'	//checkbox - radio                	
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "checkbox");
        this._createCheckbox();

        this._setUpCheckBox();

    },

    _setCheckBoxIcons: function () {
        if (this.options.checkboxType == "checkbox") {
            this.checkbox.addClass("stdCheck");
        } else {
            this.checkbox.addClass("stdRadio");
        }
    },

    _createCheckbox: function () {
        this.el.addClass("hide");
        this.checkbox = $('<div class="checkbox-wrapper"/>');
        this.checked = $('<div />');
        this.checkbox.append(this.checked);
        this._setCheckBoxIcons();

        if (typeof this.el.attr("data-label") != "undefined")
            this.checkboxLabel = $('<span>' + this.el.attr("data-label") + "</span>");

        this.checkbox.append(this.checkboxLabel);
        this.el.after(this.checkbox);

    },

    _bindCheckboxEvents: function () {
        var _self = this;

        this.checkbox.mouseover(function () { _self.el.trigger("mouseover") });
        this.checkbox.mouseout(function () { _self.el.trigger("mouseout") });
        if (typeof this.el.attr("data-label") != "undefined") {
            this.checkboxLabel.mouseover(function () { _self.el.trigger("mouseover") });
            this.checkboxLabel.mouseout(function () { _self.el.trigger("mouseout") });
        }

        _self.checkbox.click(function () {
            _self.el.click();
            _self._setCheckBoxStatus();
        });

        _self.el.change(function () {
            _self._setCheckBoxStatus();
        });

        _self.el.focus(function () {
            _self.wrapper.addClass("active");
        });

        _self.el.blur(function () {
            _self.wrapper.removeClass("active");
        });
        
        // prevent check inside labels on a:links click
        if (typeof _self.checkboxLabel != "undefined") 
        	_self.checkboxLabel.find("a").click(function(e) {e.stopPropagation();});
    },

    _setCheckBoxStatus: function (reset, value) {
        reset = (typeof reset != "undefined") ? reset : true;
        if (reset && this.options.checkboxType == "radio") {
            $(".element-wrapper", this.group).removeClass("checked");
        }
        value = (value) ? value : ((this.el.prop("checked")) ? true : false);
        if (value) { this.wrapper.addClass("checked"); } else { this.wrapper.removeClass("checked"); }
    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("change", function (e) {
            _self.el.trigger("validate");
        });
    },
    /****************** end implementation for validation ********************/
    _setUpCheckBox: function () {
        //set the status of the element
        this._setCheckBoxStatus(false);
        if (this.el.attr("disabled") != "disabled")
            this._bindCheckboxEvents();

        ////add the class for opacity on disabled
        if (this.el.attr("disabled") == "disabled")
            this.wrapper.addClass("disabled");
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.checkbox.unbind();
        this.checkboxLabel.unbind();
        this._setUpCheckBox();
    }

});
checkbox.implement(Ivalidator);

$(function () {
    $.fn.checkbox = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new checkbox(options, this);
                $.data(this, 'checkbox', myObj);
            });
        }
    };
});
/* *****************************************************************************************************************/
/*								DROPDOWN																		   */
/* *****************************************************************************************************************/

/************************************************************************* select redesigner ******************************************/

var select = validator.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {

            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "select");
        this._setUpselect();

    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("change", function (e) {
            _self.el.trigger("validate");
        });
    },
    /****************** end implementation for validation ********************/

    _setUpselect: function () {
    	var _self=this;
        //this.wrapper.height(this.wrapper.height() - 2);
        this.icon.height(this.icon.height() - 2);
        this.options.balloonPosition = "right";
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing select");
        this._setUpselect();
    }
});
select.implement(Ivalidator);

$(function () {
    $.fn.select = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new select(options, this);
                $.data(this, 'select', myObj);
            });
        }
    };
});

/************************************************************************* dropdown redesigner ******************************************/

var dropdown = validator.extend({

    dropDown: $(),
    dropDownTitle: $(),
    dropDownArrow: $(),
    dropDownInput: $(),
    dropDownOptionList: $(),

    dropdownValues: [],
    dropdownLabels: [],
    dropdownImages: [],

    dropdownSelectedIndex: 0,
    isDropdownFiltering: false,

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                dropdownRows: 5, 					//number of visibleRows
                dropdownFirstOptionAsTitle: false 	//If true the first options will be visible as title of the dropDown when nothing is selected, or during the selection 
            }
        );
	        this.base(options, elem);
	        this.wrapper.addClass(this.options.idPrefix + "dropDown");
	    var _self=this;
        if (browser.isMobile()) {
        	this.el.change(function() {_self.el.triggerHandler("changeConfirm");});	        
        } else {
        	this.dropDown = $('<div class="dropDownRidesigned" />');
	        this.dropDown.width(this.el.width());
	        this.wrapper.append(this.dropDown);
	
	        this._createDropDown();
	                
	        if (this.el.attr("disabled") != "disabled") {
	            this._triggerOriginalEvents();
	            this._setUpdropdown();
	        } else {
	            this.dropDown.addClass("disabled");
	        }
        }
    },
    
    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("change", function (e) {
            _self.el.trigger("validate");
        });
    },
    /****************** end implementation for validation ********************/

    _createDropDown: function () {
        var _self = this;
        //get and fill the array for the dropdown values
        this.getOriginalOptionValues();

        //Create the title
        this.dropDownTitle = $('<div class="dropDownTitle" />');
        this.dropDown.append(this.dropDownTitle);
        this._setDropDownTitle();

        //Create the arrow
        this.dropDownArrow = $('<div class="dropDownArrow"/>');
        this.dropDownArrow.width(this.dropDownTitle.outerHeight());
        this.dropDownArrow.css("line-height", this.dropDownTitle.outerHeight() + "px");
        this.dropDownArrow.css("font-size", "110%");        
        this.dropDown.append(this.dropDownArrow);

        this._createDropDownOptionList();
       
        //Create the input text
        this.dropDownInput = $('<div class="dropdownInputWrapper" />');
        this.dropDownInput.width(this.dropDown.width() - this.dropDownArrow.width() - 20);
        this.dropDownInput.append('<input id="dropdownInput" name="dropdownInput" class="dropdownInput" type="text" />');
        this.dropDown.append(this.dropDownInput);

        this.el.addClass("hide");
    },

    _setUpdropdown: function () {
        this.icon.height(this.icon.height() - 2);
        this.dropDown.unbind();
        this.dropDownTitle.unbind();
        this.dropDownArrow.unbind();
        this.dropDownInput.unbind();
        this._bindDropDownEvents();
        if (this.options.balloonPosition=="bottom") this.options.balloonPosition = "top";
    },

    _setDropDownTitle : function (firstOption) {
        if (firstOption) {
            this.dropDownTitle.text(this.dropdownLabels[0]);
        } else {
            var img = "";
            if (typeof this.dropdownImages[this.dropdownSelectedIndex] != "undefined")
                img = "<img src='" + this.dropdownImages[this.dropdownSelectedIndex] + "' />";
            this.dropDownTitle.html('<div class="imageWrapper">' + img + '</div>' + this.dropdownLabels[this.dropdownSelectedIndex]);
        }
    },
        
    _createDropDownOptionList : function () {
        var temp, img, _self=this;
        this.dropDownOptionList = $('<ul class="dropDownList" />');
        this.dropDownOptionList.width(this.el.width());
        this.dropDownTitle.after(this.dropDownOptionList);
        this.el.find("option").each(function (i) {
            temp = _self.dropdownLabels[i];
            img = "";
            if (i == 0 && _self.options.dropdownFirstOptionAsTitle)
                temp = "...";
            /* new code images here */
            if (typeof _self.dropdownImages[i] != "undefined")
                img = '<div class="imageWrapper"><img src="' + _self.dropdownImages[i] + '" />' + '</div>';
            _self.dropDownOptionList.append("<li class='itemDropDown'>" + img + temp + "</li>");
        });        
        this.dropDown.find("li", ".dropDownList").each(function (index) {
            $(this).click(function () { _self.itemSelectByValue(_self.dropdownValues[index]); _self.el.triggerHandler("changeConfirm"); });
        });

        var height = "15px";
        if (typeof this.dropDown.find("li", ".dropDownList").css("font-size") != "undefined")
            height = this.dropDown.find("li", ".dropDownList").outerHeight();
        height *= this.options.dropdownRows;
        if (height < (this.dropDownOptionList.height())) {
            this.dropDownOptionList.height(height);
        }
       
    },

    _triggerOriginalEvents: function () {
        var _self = this;
        this.el.change(function (e,arg) {                
            if (typeof arg == "undefined") {
                _self.itemSelectByValue(_self.el.val());
            }            	
        });
    },

    getSelectedIndex : function (val) {
        var ret = 0;
        this.el.find("option").each(function (index) {
            if (val == this.value) {
                ret= index;
            }
        });
        return ret;
    },    
        
    _bindDropDownEvents: function () {        

        var isSelectedHidden = false, _self = this;

        this.dropDownTitle.click(function (e) { _self.el.trigger("focus"); });
        this.dropDownArrow.click(function (e) { _self.el.trigger("focus"); });

        this.dropDownInput.find("input").keyup(function (e) {
            var text = "", search = "";
            _self.dropDownOptionList.find("li").each(function () {
                text = $(this).text().toLowerCase();
                search = _self.dropDownInput.find("input").val().toLowerCase();
                if (text.indexOf(search) == -1) {
                    $(this).addClass("hidden");
                } else {
                    $(this).removeClass("hidden");
                }
                if ($(this).index() == _self.dropdownSelectedIndex && $(this).hasClass("hidden"))
                    isSelectedHidden = true;
            });
            if (isSelectedHidden) {
                _self.dropDownOptionList.find("li").each(function () {
                    if (!$(this).hasClass("hidden")) {
                        _self.dropdownSelectedIndex = $(this).index();
                        return false;
                    }
                });
                _self.setSelectedItem();
            }
            isSelectedHidden = false;
            
        });
        
        this.el.focus(function (e, arg) {
            _self.showDropDownList();
            _self.el.unbind("keydown", _self._dropDownKeyDown);
            _self.el.bind("keydown", { context: _self }, _self._dropDownKeyDown);
            _self.dropDownOptionList.mousemove(function () {
                _self.dropDownOptionList.find("li.hover").removeClass("hover");
            });
        });

        this.el.blur(function (e) {
            _self.log("blur dropDown");
            _self._setDropDownTitle();
            _self.el.unbind("keydown", _self._dropDownKeyDown);
        });

        _self.dropDownOptionList.mouseout(function () {
            $(_self.dropDownOptionList.find("li").get(_self.dropdownSelectedIndex)).addClass("hover");
        });
    },
    
    _dropDownKeyDown: function (e) {
        var _self = e.data.context;

        switch (e.keyCode) {
            case _self.keyCodes.DOWN_ARROW:
                e.preventDefault();
                _self._moveDropDownListTo(1);
                _self.setSelectedItem();
                break;
            case _self.keyCodes.PAGE_DOWN:
                e.preventDefault();
                _self._moveDropDownListTo(_self.options.dropdownRows);
                _self.setSelectedItem();
                break;
            case _self.keyCodes.UP_ARROW:
                e.preventDefault();
                _self._moveDropDownListTo(-1);
                _self.setSelectedItem();
                break;
            case _self.keyCodes.PAGE_UP:
                e.preventDefault();
                _self._moveDropDownListTo(-_self.options.dropdownRows);
                _self.setSelectedItem();
                break;
            case _self.keyCodes.ENTER:
                _self._hideFilterBox();
                _self.hideDropDownList();
                _self._setDropDownTitle();
                _self.el.triggerHandler("changeConfirm");
                break;
            default:
                if (e.keyCode >= _self.keyCodes.ALPHABETS_START) {
                    _self.dropDownInput.show();                      
                    _self.isDropdownFiltering = true;
                    _self.dropDownInput.find("input").bind("blur", { context: _self }, _self._blurInputBox);
                    _self.dropDownInput.find("input").focus();
                    _self.dropDownInput.find("input").unbind("keydown", _self._dropDownKeyDown);
                    _self.dropDownInput.find("input").bind("keydown", { context: _self }, _self._dropDownKeyDown);
                };
                break;
        }
        _self.el.trigger("change", ["triggered"]);

    },

    _moveDropDownListTo: function (num) {
        var forward = (num >= 0);
        num = Math.abs(num);
        for (i = 0; i < num; i++) {
            if (this.dropdownSelectedIndex < this.dropDownOptionList.find("li").length && this.dropdownSelectedIndex >= 0) {
                var temp, idx = false;
                do {
                    temp = (forward) ? $(this.dropDownOptionList.find("li").get(this.dropdownSelectedIndex)).next() : $(this.dropDownOptionList.find("li").get(this.dropdownSelectedIndex)).prev();
                    this.dropdownSelectedIndex = (temp.index() != -1) ? temp.index() : this.dropdownSelectedIndex;
                    if (!temp.hasClass("hidden")) idx = true;
                } while (idx == false)
            }
        }
    },

    _blurInputBox: function (event) {
        _self.dropDownInput.find("input").unbind("keydown", _self._dropDownKeyDown);
        var _self = event.data.context;
        _self._hideFilterBox();
        _self.hideDropDownList();
        _self._setDropDownTitle();
        _self.el.focus();           
    },
        
    _hideFilterBox : function () {
        this.dropDownInput.find("input").unbind("blur", this._blurInputBox);
        this.dropDownInput.hide();
        this.dropDownInput.find("input").val("");
        this.dropDownOptionList.find("li").each(function () {
            $(this).removeClass("hidden");
        });
        this.isDropdownFiltering = false;
    },

    setSelectedItem : function () {
        this.dropDownOptionList.find("li").each(function() {
            $(this).removeClass("hover");
        });
        $(this.dropDownOptionList.find("li").get(this.dropdownSelectedIndex)).addClass("hover");            
        //            setTimeout(function () { el.val(this.dropdownValues[this.dropdownSelectedIndex]) }, 50);
        this.el.val(this.dropdownValues[this.dropdownSelectedIndex]);
        this._setDropDownTitle(this.options.dropdownFirstOptionAsTitle);
        this.scrollToSelectedItem();
    },

    scrollToSelectedItem : function () {            
        var opt = $(this.dropDownOptionList.find("li").get(this.dropdownSelectedIndex));
        if (opt.position().top >= this.dropDownOptionList.height() | opt.position().top < -4) {
            var top = opt.position().top + this.dropDownOptionList.scrollTop() - (this.dropDownOptionList.height() / 2);
            this.dropDownOptionList.animate({ scrollTop: top }, 200);
        }
    },

    getOriginalOptionValues : function() {
        var _self = this;

        _self.dropdownValues = [];
        _self.dropdownLabels = [];
        _self.dropdownImages = [];

        this.el.find("option").each(function (index) {
            _self.dropdownValues[index] = $(this).val();
            _self.dropdownLabels[index] = $(this).text();
            _self.dropdownImages[index] = $(this).attr("data-image");

            if ($(this).attr("selected") != null)
                _self.dropdownSelectedIndex = index;
        });
    },

    /** PUBLIC FUNCTIONS */
    showDropDownList : function () {            
        //check if show on top or on bottom
        var pos = this.dropDownTitle.innerHeight() + this.dropDown.offset().top - $(window).scrollTop();
        if (((pos + this.dropDownOptionList.height()) > $(window).height())) {
            pos = this.dropDownOptionList.height();
            pos = -pos;
            this.dropDownOptionList.css("bottom", "" + this.dropDown.height() + "px");            
        } else {
            pos = this.dropDownTitle.innerHeight();
            this.dropDownOptionList.css("top", "" + pos + "px");            
        }            
        this.setSelectedItem();
    },
    hideDropDownList : function () {        	
        var _self = this;      
        this.el.triggerHandler("blur");
        this.el.trigger("change", ["triggered"]);
        setTimeout(function () { _self.el.removeClass("active"); eval(_self.dropdownOnChange); }, 20);
    },
    itemSelectByValue : function (value) {            
        this.dropdownSelectedIndex = this.getSelectedIndex(value);        
        this.el.val(value);
        this._setDropDownTitle();
        this.hideDropDownList();
        this._hideFilterBox();
    },
    itemSelectByIndex : function (index) {
        this.dropdownSelectedIndex = index;
        //            setTimeout(function () { el.val(this.dropdownValues[index]) }, 50);
        this.el.val(this.dropdownValues[index]);
        this._setDropDownTitle();
        this.hideDropDownList();
    },       

    updateDropDown: function () {
        this.getOriginalOptionValues();
        this._setDropDownTitle();
        this.dropDownOptionList.remove();
        this._createDropDownOptionList();
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing dropdown");
        this.updateDropDown();
        this._setUpdropdown();
    }

});
dropdown.implement(Ivalidator);

$(function () {
    $.fn.dropdown = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new dropdown(options, this);
                $.data(this, 'dropdown', myObj);
            });
        }
    };
});

/************************************************************************* autocomplete ******************************************/
var autocomplete = group.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                searchData: ["auto", "autofit", "autocomplete", "best auto complete"], 	//The array with the values to search in
                searchMinDigits: 3,														//The minimum char to start the autocomplete
                searchTitle: ""															//The title to display in the autocomplete window
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "autocomplete");
        this._createAutocomplete();
        this._setUpAutocomplete();
    },

    searchList: $(),
    searchResults: $(),
    searchSelected: -1,
    searchResultsNum: 0,
    
    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("keypress", function (e) {           
        });
    },
    /****************** end implementation for validation ********************/

    _createAutocomplete: function () {
        this.searchList = $('<div class="autocomplete-list animate" />');
        this.searchList.append('<div class="title">' + this.options.searchTitle + '</div>');
        this.searchResults = $('<div class="results" />');
        this.wrapper.append(this.searchList);
        this.searchList.append(this.searchResults);
    },

    _setUpAutocomplete: function () {
        this._bindAutocompleteEvents();
    },

    _bindAutocompleteEvents: function () {
        var _self = this;
        this.el.keydown(function (e) {
            if (core.keyPressed == _self.keyCodes.ENTER)
                _self.el.removeClass("listClose");

            switch (e.keyCode) {
                case _self.keyCodes.DOWN_ARROW:
                    e.preventDefault();
                    _self.searchSelected++;
                    _self.searchSelected = (_self.searchSelected > _self.searchResultsNum-1) ? 0 : _self.searchSelected;
                    _self.wrapper.find(".results .itemHover").removeClass("itemHover");
                    $(_self.wrapper.find(".results div").get(_self.searchSelected)).addClass("itemHover");
                    break;
                case _self.keyCodes.UP_ARROW:
                    e.preventDefault();
                    _self.searchSelected--;
                    _self.searchSelected = (_self.searchSelected < 0) ? _self.searchResultsNum-1 : _self.searchSelected;
                    _self.wrapper.find(".results .itemHover").removeClass("itemHover");
                    $(_self.wrapper.find(".results div").get(_self.searchSelected)).addClass("itemHover");
                    break;
                case _self.keyCodes.ENTER:
                    if (_self.searchSelected != -1) {
                        e.preventDefault();
                        _self.el.val(_self.wrapper.find(".results div").get(_self.searchSelected).innerHTML.removeHTMLTags());
                        _self.searchSelected = -1;
                        _self.el.addClass("listClose");
                        core.keyPressed = _self.keyCodes.ENTER;
                    }
                    break;
            }            
        });

        this.el.bind("keyup focus", function (e) {            
            if (!(e.keyCode == _self.keyCodes.DOWN_ARROW || e.keyCode == _self.keyCodes.UP_ARROW)) {
                _self.searchResults.empty();
                _self.searchSelected = -1;
                var searchValue = this.value;
                var listIndex = -1;
                if (searchValue.length >= _self.options.searchMinDigits) {
                    var arrResults = [];
                    _self.options.searchData.forEach(function (value, index, array) {
                        if (value.toLowerCase().indexOf(searchValue.toLowerCase()) != -1) {
                            listIndex++;
                            var div = $("<div data-index='" + listIndex + "'>" + value.highlightWord(searchValue) + "</div>");
                            div.mouseover(function (e) {
                                _self.wrapper.find(".results .itemHover").removeClass("itemHover");
                                _self.searchSelected = parseInt(div.attr("data-index"),10);
                                $(this).addClass("itemHover");
                            });
                            div.click(function (e) {
                                _self.el.val(value);                                
                                _self.el.focus();
                                _self.el.addClass("listClose");
                            });
                            _self.searchResults.append(div);
                        }
                    });
                    if (core.keyPressed != _self.keyCodes.ENTER || listIndex == 1)
                        _self.el.removeClass("listClose");

                    _self.searchResultsNum = listIndex + 1;
                }
            }
        });
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing Autocomplete");
        this._setUpAutocomplete();
    }
});
autocomplete.implement(Ivalidator);

$(function () {
    $.fn.autocomplete = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new autocomplete(options, this);
                $.data(this, 'autocomplete', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								COLORPICKER																		   */
/* *****************************************************************************************************************/

var colorPicker = validator.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {

            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "textbox");
        this.el.attr("autocomplete", "off");
        this._createColorPicker();
        this.balloonItem.html(this.colorPicker);
        this._setUpColorPicker();

    },

    _createColorPicker: function () {
        //this.el.addClass("hide");        
        this.colorPickerColor = $('<div class="colorPicker-color"/>');
        this.el.after(this.colorPickerColor);

        this.colorPicker = $('<div class="colorPicker-wrapper"/>');

        this.colorPickerGrid = $('<div class="grid"/>');
        this.colorPickerGridPicker = $('<div class="picker"><div></div></div>');
        this.colorPickerGrid.append(this.colorPickerGridPicker);

        this.colorPickerSlider = $('<div class="slider"/>');
        this.colorPickerSliderPicker = $('<div class="picker"/>');
        this.colorPickerSlider.append(this.colorPickerSliderPicker);

        this.colorPicker.append(this.colorPickerGrid);
        this.colorPicker.append(this.colorPickerSlider);

    },

    _gridX: 150,

    _gridY: 0,

    _setGridPickerPosition: function (e) {
        this._gridX = e.pageX - this.colorPickerGrid.offset().left;
        this._gridY = e.pageY - this.colorPickerGrid.offset().top;
        this._gridX = (this._gridX >= 150) ? 150 : ((this._gridX < 0) ? 0 : this._gridX);
        this._gridY = (this._gridY >= 150) ? 150 : ((this._gridY < 0) ? 0 : this._gridY);

        this._setColor();
    },

    _sliderY: 100,

    _color: new base2.Pgraphics.color(),

    _setColor: function () {
        this._color.setFromHSV(1 - this._sliderY / 150, this._gridX / 150, 1 - this._gridY / 150);
        this._formatDisplay();
        this.el.trigger("colorchange");
    },

    _setPositions: function () {
        this._sliderY = (1 - this._color.getHSV()[0]) * 150;
        this._gridX = (this._color.getHSV()[1]) * 150;
        this._gridY = (1 - this._color.getHSV()[2]) * 150;
        this._formatDisplay();        
    },

    _formatDisplay: function () {
        var c = base2.Pgraphics.HsvToRgb(this._color.getHSV()[0], 1, 1);
        this.colorPickerGrid.css({ "background-color": "rgb(" + c.join(",") + ")" });
        this.colorPickerGridPicker
            .css({ left: this._gridX + "px" })
            .css({ top: this._gridY + "px" });
        this.colorPickerColor.css({ "background-color": "rgb(" + this._color.getRGB().join(",") + ")" });
        this.colorPickerSliderPicker
            .css({ top: this._sliderY + "px" });
        this.el.val(this._color.getHex());        
    },

    _setSliderPickerPosition: function (e) {
        this._sliderY = e.pageY - this.colorPickerSlider.offset().top;
        this._sliderY = (this._sliderY >= 150) ? 149 : ((this._sliderY < 0) ? 0 : this._sliderY);
        this._setColor();
    },

    _bindColorPickerEvents: function () {
        var _self = this;

        //this.colorPickerColor.mouseover(function () { _self.el.trigger("mouseover") });
        //this.colorPickerColor.mouseleave(function () { _self.el.trigger("mouseleave") });

        /* GRID EVENTS */
        _self.colorPickerGrid.bind("mousedown", function (e) {
            e.preventDefault();
            _self.colorPickerGrid.bind("mousemove", function (e) {
                _self._setGridPickerPosition(e);
            });
            _self.colorPickerGrid.bind("mouseup", function (e) {
                _self._setGridPickerPosition(e);
                _self.colorPickerGrid.unbind("mousemove mouseup");
            });
        });
        _self.colorPickerGrid.bind("mouseleave", function (e) {
            _self.colorPickerGrid.unbind("mousemove mouseup");
        });

        /* SLIDE EVENTS */
        _self.colorPickerSlider.bind("mousedown", function (e) {
            e.preventDefault();
            _self.colorPickerSlider.bind("mousemove", function (e) {
                _self._setSliderPickerPosition(e);
            });
            _self.colorPickerSlider.bind("mouseup", function (e) {
                _self._setSliderPickerPosition(e);
                _self.colorPickerSlider.unbind("mousemove mouseup");
            });
        });
        _self.colorPickerSlider.bind("mouseleave", function (e) {
            _self.colorPickerSlider.unbind("mousemove mouseup");
        });

        _self.el.keyup(function (e) {
            if (e.keyCode != _self.keyCodes.LEFT_ARROW &&
                e.keyCode != _self.keyCodes.RIGHT_ARROW &&
                e.keyCode != _self.keyCodes.TAB &&
                e.keyCode != _self.keyCodes.SHIFT &&
                _self.el.val().length == 7) {
                _self._color.setValue(_self.el.val());
                _self._setPositions();
            }
        });

    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("keyup colorchange", function () {
            setTimeout(function () { _self.el.trigger("validate"); }, 100);
        });
    },
    /****************** end implementation for validation ********************/

    _setUpColorPicker: function () {
        this._bindColorPickerEvents();
        if (this.el.val() != "") {
            this._color = new base2.Pgraphics.color(this.el.val());
            this._setPositions();
        }
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.colorPickerGrid.unbind();
        this.colorPickerSlider.unbind();
        this._setUpColorPicker();
    }
});
colorPicker.implement(Ivalidator);

$(function () {
    $.fn.colorPicker = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new colorPicker(options, this);
                $.data(this, 'colorPicker', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								FILE UPLOAD																		   */
/* *****************************************************************************************************************/

/************************************************************************* fileUpload redesigner ******************************************/

var fileUpload = validator.extend({

    shouldUseFrame: false,

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                uploadUrl: "",							//The url to upload to
                onUploadDone: 							//The callback function when the upload is done
	            	function (imgUrl) {
	                    this.imgUrl = imgUrl;
	                }
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "fileUpload");

        var feature = {};
        feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
        feature.formdata = window.FormData !== undefined;

        this.shouldUseFrame = !(feature.fileapi && feature.formdata);

        this._createImageContainer();
        this._setUpfileUpload();
    },

    imageContainer: $(),
    progressBar: {},

    _createImageContainer: function () {
        this.imageContainer = $('<div class="fileUpload-image"/>');

        if (!this.shouldUseFrame) { this.el.addClass("hide"); }

        this.progressBar = new progressBar();
        this.imageContainer.append('<img src="" alt="" /> ');
        this.imageContainer.append(this.progressBar.wrapper);
    },

    _bindUploadEvents: function () {
        var _self = this;
        this.placeholder.click(function () { _self.el.trigger("click"); });
        this.el.on("change", function () { _self._fileUpload() });
    },

    _fileUpload: function () {
        /* Feature detection */
        
        if (this.shouldUseFrame) {
            //Use Iframe for sumbitting file async
            this.log("start iFrame Uploading");
            this.fileUploadIframe();
        } else {
            //Use jqXHR for sumbitting file async
            this.log("start XHR Uploading");
            this.fileUploadXhr();
        }
    },

    // Handling file uploads with Iframe (for IE9 and lower)
    fileUploadIframe: function () {
        var _self = this;

        // Create the form...
        var form = $('<form></form>');
        form.attr("target", "upload_iframe");
        form.attr("action", this.options.uploadUrl);
        form.attr("method", "post");
        form.attr("enctype", "multipart/form-data");
        form.attr("encoding", "multipart/form-data");
        //this.el.wrap(form);

        // Create the iframe...
        var iframe = $("<iframe></iframe>");
        iframe.attr("id", "upload_iframe");
        iframe.attr("name", "upload_iframe");
        iframe.attr("width", "0");
        iframe.attr("height", "0");
        iframe.attr("border", "0");
        iframe.attr("style", "width: 0; height: 0; border: none;");

        form.appendTo($("body"));
        var tempInput = $('<input type="file" />');
        this.el.before(tempInput);
        this.el.appendTo(form).hide();

        // Add to document...
        $("body").append(iframe);
        window.frames['upload_iframe'].name = "upload_iframe";

        iframeId = document.getElementById("upload_iframe");

        // Add event...
        var eventHandler = function () {
            iframe.off("load", eventHandler)

            // Message from server...
            if (iframeId.contentDocument) {
                content = iframeId.contentDocument.body.innerHTML;
            } else if (iframeId.contentWindow) {
                content = iframeId.contentWindow.document.body.innerHTML;
            } else if (iframeId.document) {
                content = iframeId.document.body.innerHTML;
            }
            content=eval('(' + content + ')');
            _self.options.onUploadDone.call(_self, content);
            _self.log(_self.imgUrl);
            _self.imageContainer.find("img").prop("src", _self.imgUrl);
            _self.imageContainer.removeClass("loading");

            // Del the iframe...
            tempInput.before(_self.el.show());
            tempInput.remove();
            form.remove();

            var percentVal = '100';
            _self.progressBar.setPercent(percentVal);
            _self._positionBalloon();
            //setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
        }

        iframe.on("load", eventHandler);


        // Submit the form...
        _self.imageContainer.addClass("loading");
        form.submit();
    },

    // XMLHttpRequest Level 2 file uploads (big hat tip to francois2metz)
    fileUploadXhr: function () {
        var _self = this, a = [], formdata = new FormData();
        var el = this.oEl; this.log(el.files[0]);

        a.push({ name: el.name, value: el.files[0], type: el.type });
        formdata.append(a[0].name, a[0].value);

        var s = $.extend(true, {}, $.ajaxSettings, {
            url: _self.options.uploadUrl,
            uploadProgress: function (event, position, total, percentComplete) {
                var percentVal = percentComplete;
                _self.progressBar.setPercent(percentVal);
            },
            success: function () {
                var percentVal = '100';
                _self.progressBar.setPercent(percentVal);
            }
        }, {
            contentType: false,
            processData: false,
            cache: false,
            type: 'POST'
        });

        // workaround because jqXHR does not expose upload property
        s.xhr = function () {
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position; /*event.position is deprecated*/
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    s.uploadProgress(event, position, total, percent);
                }, false);
            }
            return xhr;
        };


        s.data = null;
        var beforeSend = s.beforeSend;
        s.beforeSend = function (xhr, o) {
            o.data = formdata;
            _self.imageContainer.addClass("loading");
            if (beforeSend)
                beforeSend.call(this, xhr, o);
        };

        $.ajax(s).done(function (imgUrl) {
            _self.options.onUploadDone.call(_self, imgUrl);
            _self.imageContainer.find("img").prop("src", _self.imgUrl);
            _self.imageContainer.removeClass("loading");
            _self._positionBalloon();
        }).fail(function () {
            _self.imageContainer.removeClass("loading");
        });


    },

    imgUrl: "",

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.on("change", function (e) {
            _self.el.trigger("validate");
        });
    },
    /****************** end implementation for validation ********************/

    _setUpfileUpload: function () {
        this.balloonItem.html(this.imageContainer);
        this._bindUploadEvents();
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this._setUpfileUpload();
    }
});
fileUpload.implement(Ivalidator);

$(function () {
    $.fn.fileUpload = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new fileUpload(options, this);
                $.data(this, 'fileUpload', myObj);
            });
        }
    };
});

var IflipBox = base2.Module.extend({

    /* create the structure for every single box */
    _createFlipBoxStructure: function (implementer, obj) {
        implementer[obj] = $('<ul class="' + obj + '"/>');
        implementer[obj].append('<span class="wings left"></span><span class="wings right"></span>');
        implementer[obj].append('<li class="flip-clock-inactive"><div><span class="up"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">00</span></span><span class="down"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">00</span></span></div></li>');
        implementer[obj].append('<li class="flip-clock-before"><div><span class="up"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">00</span></span><span class="down"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">00</span></span></div></li>');
        implementer[obj].append('<li class="flip-clock-active"><div><span class="up"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">01</span></span><span class="down"><span class="wings left"></span><span class="wings right"></span><span class="shadow"></span><span class="inn">01</span></span></div></li>');
        implementer.el.append(implementer[obj]);
    },
    
    /* animate the obj passed with adding and removing classes */
    _advanceFlipBox: function (implementer, obj, animate) {
        if (animate) {
            obj = (obj) ? obj : $();
            obj.find(".flip-clock-inactive").removeClass("flip-clock-inactive").addClass("flip-clock-changing");
            obj.find(".flip-clock-before").removeClass("flip-clock-before").addClass("flip-clock-inactive");
            obj.find(".flip-clock-active").removeClass("flip-clock-active").addClass("flip-clock-before");
            obj.find(".flip-clock-changing").removeClass("flip-clock-changing").addClass("flip-clock-active");
        }
    },

    _setFlipBoxValue: function (implementer, obj, before, after) {
        implementer[obj].find(".flip-clock-before .inn").html(before);
        implementer[obj].find(".flip-clock-active .inn").html(after);
    }
    
});

/* *****************************************************************************************************************/
/*  								countDown																		   */
/* *****************************************************************************************************************/

var countDown = group.extend({

    _countDownArrCorr : {Y:"years", M: "months", D: "days", h: "hours", m: "minutes", s: "seconds" },

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                countDownAnimate: false,				// If true aniamte the flipboxes
                countDownStartDate: new Date(),			// The start date
                countDownEndDate: new Date(),			// The and date
                countDownFormat: "Dhms" 				// Which flipboxes to display: Y(years) M(months) D(days) H(hours) m(minutes) s(seconds)		
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "countDown");
        this._setUpcountDown();
    },

    _setUpcountDown: function () {

        this.activeDate = (this.options.countDownStartDate) ? this.options.countDownStartDate : new Date();
        this.beforeDate = this.activeDate;
        this.serverGapTime = Math.round((new Date().getTime() - this.activeDate)); 
        this.activeDate = new Date(new Date().getTime() - this.serverGapTime);
        this._createcountDown();
        this.beforeDate = this.options.countDownEndDate;
        this._setDates();
        this.beforeDate = this.activeDate;

        this._bindcountDownEvents();
    },

    _bindcountDownEvents: function () {
        var _self = this;
        var items = this.options.countDownFormat.split("")      
    	for (item3=0; item3< items.length; item3++) {
            var obj = _self._countDownArrCorr[_self.options.countDownFormat[item3]];
            _self[obj].addClass("play");
        }
        
        setInterval(function () {
            _self.beforeDate = _self.activeDate;
            _self.activeDate = new Date(new Date().getTime() - _self.serverGapTime);
            setTimeout(function () { _self._setDates() }, 200);

            if (_self.beforeDate.getMinutes() != _self.activeDate.getMinutes())
                _self._advanceFlipBox(_self.minutes, _self.options.countDownAnimate);
            if (_self.beforeDate.getHours() != _self.activeDate.getHours())
                _self._advanceFlipBox(_self.hours, _self.options.countDownAnimate);
            if (_self.beforeDate.getDay() != _self.activeDate.getDay())
                _self._advanceFlipBox(_self.days, _self.options.countDownAnimate);
            if (_self.beforeDate.getSeconds() != _self.activeDate.getSeconds())
                _self._advanceFlipBox(_self.seconds, _self.options.countDownAnimate);
        }, 1000);
    },
    
    /* set the correct values for the inner HTML */
    _setDates: function () {
    	var items = this.options.countDownFormat.split("");        
    	for (item2=0; item2< items.length; item2++) {
            var obj = this._countDownArrCorr[this.options.countDownFormat[item2]];            
            //alert(this.beforeDate.DiffToDate(this.options.countDownEndDate));
            this._setFlipBoxValue(obj, this.beforeDate.DiffToDate(this.options.countDownEndDate)[obj], this.activeDate.DiffToDate(this.options.countDownEndDate)[obj]);
        }
    },
    
    /* create the HTML countDown objects */
    _createcountDown: function () {
    	var items = this.options.countDownFormat.split("");        
    	for (item1=0; item1< items.length; item1++) {
            var obj = this._countDownArrCorr[this.options.countDownFormat[item1]];            
            this._createFlipBoxStructure(obj);            
        }
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this._setUpcountDown();
    }

});
countDown.implement(IflipBox);

$(function () {
    $.fn.countDown = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new countDown(options, this);
                $.data(this, 'countDown', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*  								GRAPHS																		   */
/* *****************************************************************************************************************/

var graphs = overlay.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                graphsType: "area", 	// Type can be: area, lines, points, bars, pie
                graphsLabels: 			// The X axis Array: ["label","color", X Axis values ...]
                	["Mesi", "#000000", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto" , "Settembre"],
                graphsSeries:			// An Array containing other arrays of series: ["label","color", Y axis values ...]
                	[["Vendite","#6EB114",101,33,47,11,87,67,99,34,56]],
                graphZoom: true 		// If true on click open a Popop displaying a full screen graph
            }, options
        );
        this.base(this.options, elem);
        if ($("#grahpsPopUp").length==0) 
        	$("body").append('<div id="grahpsPopUp"></div>');
        
        this.wrapper.addClass(this.options.idPrefix + "graphs");
        if ((this.options.graphsType == "bars" || this.options.graphsType == "pie") && this.options.graphZoom) 
        	this.options.graphsLabels[this.options.graphsLabels.length] = "";
        this._setUpgraphs();
    },

    _graphsCanvas: $(), canvas: null, graphLegend: $(), graphOverLabel: $(),

    _bindgraphsEvents: function () {
        var _self = this;
        setTimeout(function() {
        	_self._graphsCanvas.attr("width",_self.wrapper.width());
        	_self._drawGraphs();
        }, 100);
        $(window).resize(function() {
        	_self.el.trigger("resizeGraph");
        });
        this.el.on("resizeGraph", function() {
            _self.actionUpdate(500);
            setTimeout(function () {
        	    _self._graphsCanvas.attr("width", _self.wrapper.width());
        	    _self._drawGraphs();
        	}, 501);
        });
        this.el.bind("click", function() { 
        	if (_self.options.graphZoom ){
	        	$("#grahpsPopUp").append("<div/>");
	        	var o = new graphs({
	        							graphsType:_self.options.graphsType,
	        							graphsLabels:_self.options.graphsLabels,
	        							graphsSeries:_self.options.graphsSeries,
	        							graphZoom: false
	    							},$("#grahpsPopUp div"));    
	        	o.wrapper.width($(window).width()-100);
	        	o._graphsCanvas.attr("height",440);
	        	o._drawGraphs();
	        	var o = new COverlay({overlayUrl: "#grahpsPopUp"});
	        	IOverlay._setUpIoverlay();
	        	IOverlay.open(o);
        	}
        });
        this._graphsCanvas.mousemove(function (e) {
            var x = parseInt((e.clientX - _self._graphsCanvas.offset().left - _self._graphMargin + (_self._graphXFactor/2)) / _self._graphXFactor);
            _self.graphOverLabel.html(_self.options.graphsSeries[0][x+2]);
            _self.graphOverLabel.css("left", _self._graphMargin + x * _self._graphXFactor + 4);
            _self.graphOverLabel.css("top", _self._graphGetY(_self.options.graphsSeries[0][x + 2])-20);

            if ((x>=0 && x<_self.options.graphsSeries[0].length-2) && _self.options.graphsType != "pie")
            	_self.graphOverLabel.show();
            else
            	_self.graphOverLabel.hide();
            
        });        
        this._graphsCanvas.mouseleave(function () { if (_self.options.graphsType != "pie") _self.graphOverLabel.hide(); });
    },

    _setUpgraphs: function () {
        
        if (browser.useCanvas()) {
        	if (this._graphsCanvas.length == 0) {
	            this._graphsCanvas = $('<canvas width="' + this.wrapper.width() + '" height="' + this.wrapper.height() + '"></canvas>');
	            if (this.options.graphZoom)
	            	this._graphsCanvas.attr("title","click to enlarge");
	            this.el.append(this._graphsCanvas);
	            this.canvas = this._graphsCanvas.get(0).getContext("2d");
	            this.graphLegend = $('<div class="legend"/>');
	            for (i = 0; i < this.options.graphsSeries.length; i++) {
	                this.graphLegend.append('<div><span style="background-color:' + this.options.graphsSeries[i][1] + ';">&nbsp;</span>' + this.options.graphsSeries[i][0] + '</div>')
	            }
	            this.wrapper.append(this.graphLegend);
	            this.graphOverLabel = $('<div class="overLabel" />');
	            this.wrapper.append(this.graphOverLabel);
        	}
        	this._bindgraphsEvents();
        } else {
            this.wrapper.html("Use an updated version of the browser to see this content.");
        }
    },

    _graphsHasNegative: false,
    
    _graphSetVariables: function () {
        this._graphMargin = 22;

        this._graphXFactor = (this._graphsCanvas.width() - this._graphMargin * 2) / (this.options.graphsLabels.length - 3);

        var maxValArr = [], minValArr = [];
        for (i = 0; i < this.options.graphsSeries.length; i++) {
            var arr = this.options.graphsSeries[i].slice(2);
            maxValArr[i] = Math.max.apply(Math, arr);
            minValArr[i] = Math.min.apply(Math, arr);
        }
        this._graphMaxVal = Math.max.apply(null, maxValArr);
        this._graphMinVal = Math.min.apply(null, minValArr);
        this._graphsHasNegative = (this._graphMinVal < 0);        
        this._graphMaxVal += (this._graphMaxVal - this._graphMinVal) / 15;
        //this._graphMinVal -= (this._graphMaxVal - this._graphMinVal) / 15;

        this._graphYFactor = (this._graphsCanvas.height() - this._graphMargin - 11 * 2) / (this._graphMaxVal - this._graphMinVal);
    },
    
    _drawGraphs: function () {    	
        this._graphSetVariables();        
        this._clearCanvas();
        switch (this.options.graphsType) {
            case "lines":
            	var _self=this;
                this._scaleFactor=0;
                window.requestNextAnimationFrame(function() {_self._animateLines()});
                break;
            case "area":
            	var _self=this;
                this._scaleFactor=0;
                window.requestNextAnimationFrame(function() {_self._animateArea()});                
                break;
            case "points":
            	var _self=this;
                this._scaleFactor=0;
                window.requestNextAnimationFrame(function() {_self._animatePoints()});
                break;
            case "bars":            	
                var _self=this;
                this._scaleFactor=0;
                window.requestNextAnimationFrame(function() {_self._animateBars()});                
                break;
            case "pie":
            	if (this.options.graphsLabels.length >4)
            		this._drawGraphsGrid(true,false, "15px");
                this._drawGraphsPie();
                break;
        }
    },
    
    
    _animateBars: function() {
    	var _self=this;
    	_self._clearCanvas();
    	_self._drawGraphsGrid();
    	_self._drawGraphsBars();
    	if (_self._scaleFactor <= 1) {
    		window.requestNextAnimationFrame(function() {_self._animateBars()});
    		_self._scaleFactor+=0.05;    		
    		
    	}
    },
    
    _animateLines: function() {
    	var _self=this;
    	_self._clearCanvas();
    	_self._drawGraphsGrid();
    	_self._drawGraphsLines();
    	if (_self._scaleFactor <= 1) {
    		window.requestNextAnimationFrame(function() {_self._animateLines()});
    		_self._scaleFactor+=0.05;
    	}
    },
    
    _animatePoints: function() {
    	var _self=this;
    	_self._clearCanvas();
    	this._drawGraphsGrid();
        this._drawGraphsPoints();
    	if (_self._scaleFactor <= 1) {
    		window.requestNextAnimationFrame(function() {_self._animatePoints()});
    		_self._scaleFactor+=0.05;
    	}
    },
    
    _animateArea: function() {
    	var _self=this;
    	_self._clearCanvas();
    	_self._drawGraphsArea();
    	_self._drawGraphsGrid();
    	_self._drawGraphsLines();
    	if (_self._scaleFactor <= 1) {
    		window.requestNextAnimationFrame(function() {_self._animateArea()});
    		_self._scaleFactor+=0.05;
    	}
    },
    
    _animatePie: function() {
    	var _self=this;
    	_self._clearCanvas();
    	_self._drawGraphsArea();
    	_self._drawGraphsGrid();
    	_self._drawGraphsLines();
    	if (_self._scaleFactor <= 1) {
    		window.requestNextAnimationFrame(function() {_self._animateArea()});
    		_self._scaleFactor+=0.05;    		
    	}
    },
    
    _graphMargin:0, _graphMinVal: 0, _graphMaxVal: 0, _graphXFactor: 0, _graphYFactor :0,
    _graphGetY: function (or) {
        return this._graphsCanvas.height() - (this._graphMargin + (or * this._scaleFactor * this._graphYFactor - this._graphMinVal * this._graphYFactor));
    },
    _graphRevertY: function (pixel) {
    	var y = (this._graphsCanvas.height() - pixel - this._graphMargin + (this._graphMinVal * this._graphYFactor)) / this._graphYFactor;
        if (!this._graphsHasNegative) {
            return (y < 0) ? 0 : y;
        } else
            return y;
    },
    
    _drawGraphsGrid: function (drawX, drawY, fontSize) {
         drawX = (typeof drawX == "undefined") ? true : drawX;
         drawY = (typeof drawY == "undefined") ? true : drawY;
         fontSize = (typeof fontSize == "undefined") ? "9px" : fontSize;
    	 var _self = this
         var ctx = this.canvas;
         if (drawX) {
             /* vertical grid */
             for (j = 0; j < this.options.graphsLabels.slice(2).length; j++) {
                 var x = this._graphMargin + j * this._graphXFactor;
                 ctx.beginPath();
                 ctx.moveTo(x, this._graphMargin);
                 ctx.lineTo(x, this._graphsCanvas.height() - this._graphMargin);
                 ctx.lineWidth = 1;
                 ctx.strokeStyle = (this.options.graphsLabels[j+2] == "") ? "#cccccc" : "#aaaaaa";
                 ctx.stroke();
                 ctx.closePath();
                 ctx.fillStyle = this.options.graphsLabels[1];
                 ctx.font = "bold " + fontSize + " Arial";
                 ctx.fillText(this.options.graphsLabels[j + 2], x, this._graphsCanvas.height() - 4);
             }
         }
         if (drawY) {
             /* horizontal grid */
             var y = this._graphMargin;
             var label = 0;
             while (y <= this._graphsCanvas.height()) {
                 ctx.beginPath();
                 ctx.moveTo(this._graphMargin, y);
                 ctx.lineTo(this._graphsCanvas.width() - this._graphMargin, y);
                 ctx.lineWidth = 1;
                 ctx.strokeStyle = "#cccccc";
                 ctx.stroke();
                 ctx.closePath();
                 ctx.fillStyle = this.options.graphsLabels[1];
                 ctx.font = "bold " + fontSize + " Arial";
                 label = parseInt(this._graphRevertY(y));
                 label = (isNaN(label)) ? "" : label;
                 ctx.fillText(label, 0, y);
                 y += 40;
             }
         }
    	 
    },
    
    _drawGraphsArea: function () {        
        var _self = this
        var ctx = this.canvas;        
        for (i = 0; i < this.options.graphsSeries.length; i++) {
            var arr = this.options.graphsSeries[i].slice(2);            
            ctx.beginPath();            
            var color = new base2.Pgraphics.color(this.options.graphsSeries[i].slice(1, 2)[0].toString());           
            color.changeLum(0.85);                         
            ctx.strokeStyle =  color.getHex();
            ctx.fillStyle =  color.getHex();
            for (j = 0; j <= arr.length; j++) {
                var x = this._graphMargin + j * this._graphXFactor;
                var y = this._graphGetY(arr[j]);
                if (j == 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
                
                ctx.lineWidth = 2;                
                ctx.stroke();

                //To draw a point
                //ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            }
            ctx.lineTo(this._graphsCanvas.width()-this._graphMargin, this._graphsCanvas.height()-this._graphMargin+2);
            ctx.lineTo(this._graphMargin, this._graphsCanvas.height()-this._graphMargin+2);
            ctx.closePath();
            ctx.stroke();            
            ctx.fill();
        }
    },
    
    _drawGraphsLines: function () {        
        var _self = this
        var ctx = this.canvas;        
        for (i = 0; i < this.options.graphsSeries.length; i++) {
            var arr = this.options.graphsSeries[i].slice(2);            
            ctx.beginPath();
            for (j = 0; j <= arr.length; j++) {
                var x = this._graphMargin + j * this._graphXFactor;
                var y = this._graphGetY(arr[j]);
                if (j == 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
                
                ctx.lineWidth = 1;
                ctx.strokeStyle =  this.options.graphsSeries[i].slice(1, 2)[0];
                ctx.stroke();

                //To draw a point
                //ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            }
        }


    },
    
    _drawGraphsPoints: function () {
        var _self = this
        var ctx = this.canvas;
        for (i = 0; i < this.options.graphsSeries.length; i++) {
            var arr = this.options.graphsSeries[i].slice(2);
            
            for (j = 0; j <= arr.length; j++) {
                var x = this._graphMargin + j * this._graphXFactor;
                var y = this._graphGetY(arr[j]);
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
                ctx.lineWidth = 4;
                ctx.strokeStyle = this.options.graphsSeries[i].slice(1, 2)[0];
                ctx.stroke();
                ctx.closePath();
            }
        }


    },
    
    _scaleFactor: 1,
    _drawGraphsBars: function () {
        var _self = this;
        var barLinewidth = 2;
        var barsMargin = this._graphXFactor / 6;
        var barsWidth = (this._graphXFactor - barsMargin * 2 - barLinewidth * 2 * (this.options.graphsSeries.length-1)) / this.options.graphsSeries.length;
        var ctx = this.canvas;
        for (i = 0; i < this.options.graphsSeries.length; i++) {
            var arr = this.options.graphsSeries[i].slice(2);
            
            for (j = 0; j <= arr.length-1; j++) {
                var x = this._graphMargin + j * this._graphXFactor;
                x = (barsMargin + x + barsWidth * i);
                x = x + barLinewidth * 2 * i;
                var y = this._graphGetY(arr[j]);
                ctx.beginPath();
                ctx.moveTo(x, this._graphsCanvas.height() - this._graphMargin);
                ctx.lineTo(x, y);
                ctx.lineTo(x + barsWidth, y);
                ctx.lineTo(x + barsWidth, this._graphsCanvas.height() - this._graphMargin);
                ctx.lineTo(x, this._graphsCanvas.height() - this._graphMargin);

                ctx.lineWidth = barLinewidth;
                ctx.strokeStyle = this.options.graphsSeries[i].slice(1, 2)[0];
                ctx.stroke();

                var color = new base2.Pgraphics.color(this.options.graphsSeries[i].slice(1, 2)[0]);
                var grd = ctx.createLinearGradient(x, 0, x + barsWidth, 0);
                var fullColor = color.getHex();
                color.changeLum(0.75);
                var lightColor = color.getHex();
                
                grd.addColorStop(0, lightColor);
                grd.addColorStop(0.5, fullColor);
                grd.addColorStop(1, lightColor);

                ctx.fillStyle = grd;
                ctx.fill();

                ctx.closePath();
                //To draw a point
                //ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            }
        }


    },

    _drawGraphsPie: function () {
        var ctx = this.canvas;        
        var margin = 11;
        var width = this._graphXFactor;
        width = (width > (this._graphsCanvas.height() - this._graphMargin * 2)) ? (this._graphsCanvas.height() - this._graphMargin * 2) : width;
        width = (width - margin * 2) / 2;
        var x = this._graphMargin + width + margin;
        x = ((this._graphXFactor) / 2 > x) ? (this._graphXFactor) / 2 : x;
        var y = this._graphMargin + width + margin;
        y = ((this._graphsCanvas.height() - this._graphMargin * 2)/2 >y) ? (this._graphsCanvas.height() - this._graphMargin * 2)/2 : y;
        
        var totals = [];
        for (i = 0; i < this.options.graphsLabels.slice(2).length - 1; i++) {
            totals[i] = 0;
            for (j = 0; j < this.options.graphsSeries.length; j++) {
                totals[i] += this.options.graphsSeries[j][i + 2];
            }
        }
        
        var texts = [];
        
        for (i = 0; i < this.options.graphsLabels.slice(2).length-1; i++) {
            var previous = -0.5;
            var x1,y1;    
            var textsJ = [];
            for (j = 0; j < this.options.graphsSeries.length; j++) {
                ctx.beginPath();
                var perc = (this.options.graphsSeries[j][i + 2] *2 / totals[i]);                
                ctx.moveTo(x + i * this._graphXFactor, y);
                ctx.arc(x + i * this._graphXFactor, y, width, previous * Math.PI, (previous + perc) * Math.PI, false);
                ctx.moveTo(x + i * this._graphXFactor, y);
                previous = (previous + perc);
                var color = new base2.Pgraphics.color(this.options.graphsSeries[j].slice(1, 2)[0]);
                ctx.fillStyle = color.getHex();
                ctx.fill();
                ctx.closePath();
                
                var tmp = (-previous* Math.PI + (perc/2*Math.PI));
                this.log(tmp + " " + perc);
                x1 = x + i * this._graphXFactor; x1 += Math.cos(tmp)*width *0.8 - width/6;
                y1 = y; y1 -= Math.sin(tmp)*width *0.8;                
                
                var color = new base2.Pgraphics.color(this.options.graphsSeries[j].slice(1, 2)[0].toString());           
                if (color.getHSL()[2]<0.6)                	
                	color.changeLum(0.85);
                else
                	color.changeLum(0.15);
                
                textsJ[j] = [color, parseFloat(perc*50).toFixed(2), x1, y1];
            }
            texts[i]=textsJ;
        }
        
        for (i = 0; i < this.options.graphsLabels.slice(2).length-1; i++) {
        	var textsJ = texts[i];
        	for (j = 0; j < this.options.graphsSeries.length; j++) {
		        if (textsJ[j][1] != "0.00") {
		        	ctx.fillStyle = "#000000";
		        	ctx.font = "bold 14px Arial";
		        	ctx.fillText(textsJ[j][1] +"%",textsJ[j][2],textsJ[j][3]);  		        	
		        }
	        }
        }
    },

    _clearCanvas: function () {
        // Store the current transformation matrix
        this.canvas.save();

        // Use the identity matrix while clearing the canvas
        this.canvas.setTransform(1, 0, 0, 1, 0, 0);
        this.canvas.clearRect(0, 0, this._graphsCanvas.get(0).width, this._graphsCanvas.get(0).height);

        // Restore the transform
        this.canvas.restore();
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this._setUpgraphs();
    }
});

$(function () {
    $.fn.graphs = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new graphs(options, this);
                $.data(this, 'graphs', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*  								SLIDE OPEN																	   */
/* *****************************************************************************************************************/
var slideOpen = wrapper.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                slideOpenButton: "#", 			//Jquery selector for the button that opens on click and slide
                slideCloseButton: null, 		//Jquery selector - if null it will be the same as the open button
                slideOpenDirection: "left", 	//Direction: left, right, top bottom
                slideContentDiv: "#content", 	//Jquery container for the hidden Panel
                onSlideOpen: function () { },	//Calback on Open
                onSlideClose: function () { }	//Callback on Close
            }
        );
        this.base(options, elem);
        this._ver = (this.options.slideOpenDirection == "left" || this.options.slideOpenDirection == "right") ? false : true;
        if (this.options.slideCloseButton == null) this.options.slideCloseButton = this.options.slideOpenButton
        this.wrapper.addClass(this.options.idPrefix + "slideOpen");
        this._createslideOpen();
        this._setUpslideOpen();

    },

    _position: 0, _startFirstTimeMove: new Date(), _startFirstMove: 0, _startMove: 0, _slideOpened: false, onElement: null,

    /* return the dimension to modify based on the variable inverse */
    _dim: function (inverse) {
        inverse = (typeof inverse == "undefined") ? false : true;
        if (((this._ver) ^ inverse) == 1)
            return "height";
        return "width";
    },
    _ver: false,

    _createslideOpen: function () {
        var _self = this;
        $(this.options.slideOpenButton + "," + this.options.slideCloseButton).addClass("wrap-slideOpenButton " + this.options.slideOpenDirection);
        $(this.options.slideContentDiv).css(this.options.slideOpenDirection, 0);
    },

    _setUpslideOpen: function () {
        this._bindEventsslideOpen();
    },

    _bindEventsslideOpen: function () {
        var _self = this;
                
        $(this.options.slideOpenButton).bind('touchstart pointerdown', function (e) {
            _self.options.onSlideOpen.call(_self);
            e = window.event;
            e.preventDefault();
            e.stopPropagation();            
            _self.onElement = e.target;
            _self._startMove = (_self._ver) ? core.getEventCoordY(e) : core.getEventCoordX(e);
            _self._startFirstTimeMove = new Date();
            _self._startFirstMove = _self._startMove;

            $(document).bind('touchmove pointermove', function (event) {
                event = window.event;                
                _self._slideMenuButtonMove(_self, event, core.getEventCoordX(event), core.getEventCoordY(event));
            });
        });

        $(this.options.slideOpenButton).click(function(e) {
            _self.options.onSlideOpen.call(_self);
            e.stopPropagation();
            _self._slideMenuMoveEnd();
            _self._slideOpened = !_self._slideOpened;
        });

        $(document).bind('touchend pointerup', function (event) {
            event = window.event;
            $(document).unbind('touchmove pointermove');
            
            if ((new Date().getTime() - _self._startFirstTimeMove.getTime()) > 300) {

                if (event.target.isSameNode(_self.onElement) || event.target.isSameNode($(_self.options.slideOpenButton).get(0))) {

                    if (Math.abs(_self._startMove - _self._startFirstMove) >= _self.wrapper.outerDimension(_self._dim(), true) / 2)
                        if (_self._startMove - _self._startFirstMove < 0)
                            _self._slideOpened = true;
                        else
                            _self._slideOpened = false;
                    else
                        if (_self._startMove - _self._startFirstMove > 0)
                            _self._slideOpened = true;
                        else
                            _self._slideOpened = false;

                    _self._slideMenuMoveEnd();
                    _self._slideOpened = !_self._slideOpened;

                }
            } else {
                _self._slideMenuMoveEnd();
                _self._slideOpened = !_self._slideOpened;
            }
        });

        $(this.options.slideContentDiv).bind("click touchstart", function () {            
            if (_self._slideOpened) {
                _self._slideMenuMoveEnd();
                _self._slideOpened = !_self._slideOpened;
            }
        });

    },

    _slideMenuMoveEnd: function () {
        var _self = this;
        if (!this._slideOpened) {
            $(this.options.slideOpenButton + "," + this.options.slideCloseButton).addClass("opened").removeClass("closed");
            $(this.options.slideContentDiv).moveAnimate(this.options.slideOpenDirection, this.wrapper.outerDimension(this._dim(), true));
            this._position = -this.wrapper.outerDimension(this._dim(), true);
            $(this.options.slideOpenButton).closest(".element-wrapper").css("overflow", "hidden");
            
        } else {
            $(this.options.slideOpenButton + "," + this.options.slideCloseButton).addClass("closed").removeClass("opened");
            $(this.options.slideContentDiv).moveAnimate(this.options.slideOpenDirection, 0);
            this._position = 0;
            setTimeout(function () {
                $(_self.options.slideOpenButton).closest(".element-wrapper").css("overflow", "visible");
            }, 500);
        }
        if (_self._slideOpened)            
            this.options.onSlideClose.call(this);
    },

    _slideMenuButtonMove: function (_self, e, x,y) {
        _self.onElement = e.toElement;
        e.preventDefault();
        var move = (_self._ver) ? y : x; 
        _self._position += (_self._startMove - move) * (_self.el.dimension(_self._dim()) / _self.wrapper.dimension(_self._dim()));
        _self._position = (_self._position > 0) ? 0 : _self._position;
        _self._position = (_self._position < -_self.wrapper.outerDimension(_self._dim(), true)) ? -_self.wrapper.outerDimension(_self._dim(), true) : _self._position;
        _self._startMove = move;
        /* animate */
        $(this.options.slideContentDiv).css(_self.options.slideOpenDirection, -_self._position);        

    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing slideOpen");
        this._setUpslideOpen();
    }

});

$(function () {
    $.fn.slideOpen = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new slideOpen(options, this);
                $.data(this, 'slideOpen', myObj);
            });
        }
    };
});


/* *****************************************************************************************************************/
/*  								TABLE																		   */
/* *****************************************************************************************************************/
var table = wrapper.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {                
                tablePagination: 6, 							//0 doesn't paginate - a number that will be the number of visible lines per page                
                tableHeadOrder: false,							//if true display the 
                tableLabels: ["PREV","#NUM OF #TOT", "NEXT"]	//Label of the table pagination elements
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "table");        
        
    	try {
    		this.startUpdating(); 
    	}catch (e) {
			// TODO: handle exception
		}finally {
			var _self=this;
			setTimeout(function() {				
				_self._createtable();
				_self._setUptable();	
				_self.stopUpdating();
				_self.el.removeClass("originalTable");
			},550);
		}        

    },

    _tableCols:0,
    _tableLinesCheck: [],    

    _createtable: function () {
        var _self = this;

        /* set the number of columns */
        this._tableCols = this.el.find(".line").first().find(".cell").length;

        /* Add alternate class */
        this.el.find(".line").each(function (index) {
            if (index & 1) $(this).addClass("alternate");
            $(this).find(".cell").each(function (col) {$(this).addClass("col"+col);});
        });

        this.el.find(".line").not(".head").each(function (index) {
            //To removed when I will apply the filter
            $(this).addClass("filtered");
            $(this).addClass("line" + index);
            
        });
        
        /* create an array for the order */
        this._createTableOrderData();

        /* Add Order button */
        this.el.find(".head .cell").each(function (index) {
            if (_self.options.tableHeadOrder) {
                var Jq = $('<ins class="order"></ins>');
                Jq.click(function () {
                    /* sort here */
                    _self._tableOrderByAttr(index);
                });

                $(this).prepend(Jq);
            }
        });

        _self.el.find(".line").not(".head").each(function (row) {
            _self._tableTempArr[_self._tableTempArr.length] = $(this).html();
        });

        /* add the pagination elements */
        var prev = $('<div class="prevPage">' + this.options.tableLabels[0] + '</div>');
        this.tablePaginationPage = $('<div class="actualPage"></div>');
        var next = $('<div class="nextPage">' + this.options.tableLabels[2] + '</div>');
        var cont = $('<div class="pageWrapper" />');

        var _self = this;
        prev.click(function (e) { e.preventDefault(); _self.tablePaginationActualPage--; _self._refreshTablePagination(); });
        next.click(function (e) { e.preventDefault(); _self.tablePaginationActualPage++; _self._refreshTablePagination(); });
        
        cont.append(prev).append(this.tablePaginationPage).append(next);
        this.wrapper.append(cont);

        /* refresh the table */
        this._refreshTablePagination();

    },

    _tableTempArr : [],

    _tableOrderByAttr: function (col) {    	
    	
    	var reverse = (this.el.find(".line.head .col"+col).hasClass("asc")) ? true : false;
        var cssClass = (reverse) ? "desc" : "asc";
        this.el.find(".line.head .cell").removeClass("asc desc");
        this.el.find(".line.head .col" + col).addClass(cssClass);

        var _self = this;
        var a = new base2.Collection();
        a = this._tableArrOrderData[col];        
        a.sort(function (item1,item2,key1,key2) {
        	var value1 = item1.toString().parser();
        	var value2 = item2.toString().parser();
        	if (value1 == value2)
                return 0;
            if (value1 > value2)
                return 1;
            if (value1 < value2)
                return -1; 
        });  
        if (reverse) a.reverse();
        var order = [];
        a.forEach(function (item, key) {        	
            order[order.length] = key;
        });

        _self.el.find(".line").not(".head").each(function (row) {
            $(this).empty();
            $(this).html(_self._tableTempArr[order[row]]);
        });

        
    },

    _tableArrOrderData: [],
    _createTableOrderData: function () {
        var _self = this;
        for (i = 0; i < this._tableCols; i++) {
            this._tableArrOrderData[i] = new base2.Collection();
            this.el.find(".line").not(".head").find(".col" + i).each(function (row) {  
            	var value = this.innerHTML.toString().parser();            	
            	if (typeof a == "string");
            		value=value.toString().toLowerCase();
                _self._tableArrOrderData[i].add(row, value);
            });
        }
    },

    /* table Pagination */
    tablePaginationElems: 0, tablePaginationPage:$(), tablePaginationActualPage : 0, tablePaginationLines : [], tablePaginationMaxPages: 0,

    _refreshTablePagination: function () {
        var _self = this;
        this.tablePaginationElems = this.el.find(".line.filtered").not(".head").length;

        this.tablePaginationActualPage = (this.tablePaginationActualPage < 0) ? 0 : this.tablePaginationActualPage;
        this.tablePaginationActualPage = ((this.tablePaginationActualPage+1) > Math.ceil(this.tablePaginationElems / this.options.tablePagination)) ? Math.ceil(this.tablePaginationElems / this.options.tablePagination)-1 : this.tablePaginationActualPage;

        if (this.options.tablePagination > 0 && this.tablePaginationElems > this.options.tablePagination)
            this.el.find(".line.filtered").not(".head").each(function (i) {
                if (i >= _self.tablePaginationActualPage * _self.options.tablePagination && i < (_self.tablePaginationActualPage + 1) * _self.options.tablePagination) {
                    // visible elements
                    $(this).removeClass("hidden");
                } else {
                    //hidden elements
                    $(this).addClass("hidden");
                }
            });
        else
            this.wrapper.find(".pageWrapper").hide();

        this.tablePaginationPage.html(this.options.tableLabels[1].toString().replace("#NUM",this.tablePaginationActualPage + 1).replace("#TOT",Math.ceil(this.tablePaginationElems / this.options.tablePagination)));

    },

    _setUptable: function () {        
        this._bindEventstable();
    },

    _bindEventstable: function () {
        var _self = this;        
        $(window).resize(function () { _self.el.triggerHandler("resizeTable") });        

    },

    /* refresh the graphics element */
    refresh: function () {
        this.startUpdating();
        this.base();
        this.log("refreshing table");
        this._setUptable();
        this.stopUpdating();        
    }
});

$(function () {
    $.fn.table = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new table(options, this);
                $.data(this, 'table', myObj);
            });
        }
    };
});