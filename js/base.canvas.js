/// <reference path="base2.js" />
/// <reference path="jQuery-min-1.10.2.js" />
/// <reference path="core.js" />

/* *****************************************************************************************************************/
/*  								CANVAS																		   */
/* *****************************************************************************************************************/

var canvas = jQueryBase.extend({

    ctx: {}, cw: 0, ch: 0,
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                
            }, options
        );        
        this.base(this.options, elem);
    },
    setupCanvas: function () {
        this.ctx = this.el.get(0).getContext('2d');
        this.cw = this.el.get(0).width;
        this.ch = this.el.get(0).height;
    },

    clearCanvas: function () {
        // Store the current transformation matrix
        this.ctx.save();

        // Use the identity matrix while clearing the canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.cw, this.ch);

        // Restore the transform
        this.ctx.restore();
    },
});

/* *****************************************************************************************************************/
/*  								CANVAS WAVES																   */
/* *****************************************************************************************************************/

var canvasWaves = canvas.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {   
                pointsY: [50],
                rangeX: 50,
                duration: {
                    min: 420,
                    max: 450
                },
                thickness: 1,
                strokeColor: '#fff',
                level: .5,
                curved: true,
                fillColor: '#0000ff',
                trasparency: 0.5,
                topAlign: true
            }, options
        );
        this.base(this.options, elem);
        this.points = new Array();
        this.setupCanvas();
        this.initWaves();
        this.startWaves();
    },
    points : [],    
    setupCanvas: function () {
        this.base();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.options.thickness;
        this.ctx.strokeStyle = this.options.strokeColor;
    },

    updatePoints : function () {
        var i = this.points.length;
        while (i--) {
            this.points[i].update();
        }
    },

    renderPoints : function () {
        var i = this.points.length;
        while (i--) {
            this.points[i].render();
        }
    },

    renderShape : function () {
        this.ctx.beginPath();
        var pointCount = this.points.length;
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        var i;
        for (i = 0; i < pointCount - 1; i++) {
            var c = (this.points[i].x + this.points[i + 1].x) / 2;
            var d = (this.points[i].y + this.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
        }
        if (this.options.topAlign) {
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(this.cw, 0);
        } else {
            this.ctx.lineTo(-this.options.rangeX - this.options.thickness, this.ch + this.options.thickness);
            this.ctx.lineTo(this.cw + this.options.rangeX + this.options.thickness, this.ch + this.options.thickness);
        }
        this.ctx.closePath();
        this.ctx.globalAlpha = this.options.trasparency;
        this.ctx.fillStyle = this.options.fillColor;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    },
    initWaves: function () {        
        var i = this.options.pointsY.length+2;
        var arr = [];
        arr.push(0); arr = arr.concat(this.options.pointsY); arr.push(50);
        var spacing = (this.cw + (this.options.rangeX * 2)) / (this.options.pointsY.length - 1);
        while (i--) {
            //console.log(i, arr[i]);
            var l = (typeof this.options.levels != "undefined") ? this.options.levels[i] : this.options.level;
            this.points.push(new base2.Pcanvas.Point({
                x: (spacing * (i - 1)) - this.options.rangeX,
                y: this.ch - (this.ch * l),
                rangeX: this.options.rangeX,
                rangeY: arr[i],
                durationMin: this.options.duration.min,
                durationMax: this.options.duration.max,
            }));
        }
    },
    startWaves: function () {
        var _self = this;        
        window.requestNextAnimationFrame(function () { _self.startWaves(); });
        this.clearCanvas();
        this.updatePoints();
        this.renderShape();
        //this.renderPoints();
    }
});

/* 
JQUERY OBJECT: canvas
Properties: 
*/

$(function () {
    $.fn.canvasWaves = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new canvasWaves(options, this);
                $.data(this, 'canvasWaves', myObj);
            });
        }
    };
});