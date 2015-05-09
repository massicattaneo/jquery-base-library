/// <reference path="base2.js" />
/// <reference path="jQuery-min-1.10.2.js" />
/// <reference path="core.js" />

var shape = base2.Base.extend({
    constructor: function (options) {
        this.options = $.extend({}, this.options, options);
        this.el = $("<div/>");
        this.el.addClass("shape");        
        var _self = this;
        $(document).ready(function () { $("body").append(_self.el); });

    },
    // jQuery general object
    el: $(),
    type: "shape",
    options: {
        center: [0, 0, 0],
        position: [0, 0, 0]
    },
    redraw: function (css) {
        var _self = this;
        setTimeout(function () {
            _self.el.css(css);
        }, 24);
    }
});



/* *****************************************************************************************************************/
/*								    CIRCLE																		   */
/* *****************************************************************************************************************/
var circle = shape.extend({
    constructor: function (options) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                radius: 44
            }
        );
        this.base(options);
        this.el.addClass("circle");
        this.create();
    },

    create: function () {
        this.el.css({ "border-radius": this.options.radius + "px", "width": this.options.radius * 2 + "px", "height": this.options.radius * 2 + "px", "background-color": "red" });
    },

    redraw: function () {        
        this.base({ "border-radius": this.options.radius + "px", "width": this.options.radius * 2 + "px", "height": this.options.radius * 2 + "px", "background-color": "red" });
    },

    setRadius: function (radius) {
        this.el.css("transition-duration", "6.5s");
        this.options.radius = radius;
        this.redraw();
    }
});