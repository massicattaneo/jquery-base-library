/// <reference path="../base2.js" />
/// <reference path="../jquery-1.10.2.js" />
/// <reference path="../core.js" />

/* GAME LOTTERY CLASSES JAVASCRIPT */

/* the object to contains a number extraction: 
 		- from-to are the bound of the extraction settable for each number
 		- value is the number stored
 		- group is a string containing the a group with wich the number is linked to. For exmple if you give a same group to to number they
 				can be validated to don't be the same number 
		- extract fill the number with a random number between the from-to interval 
		- toString add a 0 before 1 digit numbers 
		- setValue set the value of the number and throw exception if it's not numeric, outofbound or duplicate (confronting it with an array "not" of eNumbers) */
var eNumber = logger.extend({
    constructor: function (from, to,/* validation group */ group,/* autoextract number (pass an array containing the non extractable numbers) */auto) {
        if (from > to) { var t = from; from = to; to = t; } /* invert numbers if they are not in the correct order */
        this.group = group || "";
        this.from = from;
        this.to = to;
        if (typeof auto != "undefined") { this.extract(auto); }
    },
    from: null, to: null, value: null, group: "",
    clear: function () { this.value = null; },
    /* fill an array with the values of an array of eNumbers */
    _eNumToArr: function (arr) {
        var temp = [];
        for (y = 0; y < arr.length; y++) {
            if (arr[y] instanceof eNumber && this.group == arr[y].group) { temp[y] = arr[y].value; }
        }
        if (temp.length == 0) temp[0] = null;
        return temp;
    },
    /* extract a number */
    extract: function (/* array of non extractable numbers */ not) {
        not = not || [];
        var temp = this._eNumToArr(not);
        var extractionWidth = this.to - this.from + 1;
        /*extract a number until it's not in the array list*/
        do {
            this.value = Math.floor((Math.random() * extractionWidth)) + this.from;
        } while (!((temp.indexOf(this.value)) == -1));
    },
    /* return a string with one 0 to the left */
    toString: function (/* boolean */ addZero) {
        addZero = (typeof addZero != "undefined") ? addZero : true;        
        if (this.value < 10 && addZero == true) return "0" + this.value;
        return this.value.toString();
    },
    setValue: function (val, not, group) {
    	if (isNaN(val)) throw "nonnumeric";    	
    	val=parseInt(val,10);
    	if (isNaN(val)) throw "nonnumeric";    	
        for (i = 0; i < not.length; i++) {
            if (this.from > val || this.to < val) throw "outofbound";
            if (not[i].group == group) {
                if (not[i].value == val) throw "duplicate";
            }
        }
        this.value = val;
        return true;
    }
});

/* base class for gaming lotteries */
var Game = logger.extend({
    domain: "",
    mobile: false,
    openPopUpBeforeSubmit: false,
    urlPopUpBeforeSubmit: "/app/overlay/subscriptionPlayLottoBefSubmit.html",
    errorMessageCallBack: null,
    submitCallBack: null,
    constructor: function (settings) {
    	 if (settings) {
             if (settings.logActive) this.logActive = settings.logActive;
             if (settings.domain) this.domain = settings.domain;
             if (settings.mobile) this.mobile = settings.mobile;
             if (settings.openPopUpBeforeSubmit) this.openPopUpBeforeSubmit = settings.openPopUpBeforeSubmit;
             if (settings.urlPopUpBeforeSubmit) this.urlPopUpBeforeSubmit = settings.urlPopUpBeforeSubmit;
             if (settings.errorMessageCallBack) this.errorMessageCallBack = settings.errorMessageCallBack;
             if (settings.submitCallBack) this.submitCallBack = settings.submitCallBack;
             this.settings.onUpdate = (settings.onUpdate) ? settings.onUpdate : function() {};
         }
    	var _self = this;
        $(document).ready(function() {
        	$("#playNow").click(function (e) {
            	e.preventDefault();             	
                if (_self.validate()) _self.submit();
            });
        });
    },
    name: "", displayAmount: 0, appAmount: 0, cost: 1,
    /* calculate the global amount */
    calculate: function () { this.update(); },
    /* display the total on the page */
    update: function () {
        if (this.displayAmount < 0) { this.displayAmount = 0; this.appAmount = 0; }

        $("#totalAmount").html(this.displayAmount.toCurrency("&pound;"));
        //different font-size based on 3 or 4 number digit of totamount - max
        $("#totalAmount").css("font-size", (this.displayAmount < 1000) ? "41px" : "35px");
        //campo nascosto
        $('#amount').val(this.displayAmount);
        $('#ticketAmount').val(this.appAmount);
        this.settings.onUpdate.call(this);
        //if (typeof originalCostDiscountProduct != "undefined") $('#discountedAmount').val(originalCostDiscountProduct);

    },
    /* button submit */
    _popUpSubscriptionBindEvents: function() {
    	var _self=this;
    	$("#selectSubscriptionButton").click(function() {
			_self.selectSubscription();
			setTimeout(function() {_self._submit();},100);
		});
		$("#deselectSubscriptionButton").click(function() {
			_self._submit();
		});
    },
    submit: function () {    	
    	if (this.openPopUpBeforeSubmit && !$("#jackpotHunter").prop("checked")) {
    		var _self=this;
    		var overlayBef = new COverlay({overlayUrl: this.urlPopUpBeforeSubmit, 
    		    execute: function () {_self._popUpSubscriptionBindEvents();}
    		});
    		if (this.mobile) IOverlay.open(overlayBef, "slideDown", true);
    		else IOverlay.open(overlayBef);
    	} else {
			this._submit();
    	}
    },
    _submit: function() {
    	if (this.submitCallBack != null && typeof this.submitCallBack == "function")
    		this.submitCallBack();
    	else
    		document["germanLottoPlayslipForm"].submit();
    },
    /* display a modal overlay box with an info */
    displayError: function (/* the message of the box */message) {        
        this.openModalError(message);
    },
    openModalError: function (text) {
		if (this.mobile) {
			setErrorMessage(text);
		} else {
			if (typeof overlayGenericErrorUrl != "undefined") {
				var overlayErr = new COverlay({
					overlayUrl: overlayGenericErrorUrl,
					overlayMessage: text,
					overlayCssClass: "standardErrMsg"
				});				
				IOverlay.open(overlayErr);
			}
			else if (typeof this.errorMessageCallBack != null)
				this.errorMessageCallBack(text);
			else
				alert(text);
		}
    }
});

/* extend gaming class adding weeks & days support for extraction */
var Extraction = Game.extend({
    _daysID: "#dayOfWeek", _weeksID: "#numberOfWeeksLotto",
    days: 2,
    weeks: 0,
	settings: {weeksErrorMsg: ""},
    constructor: function (settings) {    		
    	if (settings) {
    		if (settings.weeksErrorMsg) this.settings.weeksErrorMsg = settings.weeksErrorMsg;    		    		
    	}    	
    	this.base(settings);    
        var _self = this;
        $(document).ready(function () {            
        	_self.updateDays();
            _self.updateWeeks();
            _self.updateDaysOfWeekDD();
            $(_self._daysID).change(function () { _self.updateDays.apply(_self); _self.updateDaysOfWeekDD.apply(_self) });
            $(_self._weeksID).change(function () { _self.updateWeeks.apply(_self) });
        });
    },
    updateDays: function () {
        if ($(this._daysID).val() == "144") {
            this.days = 2;
        } else { this.days = 1; }
    },
    updateWeeks: function () {
        if ($(this._weeksID).val() == "") {
            this.weeks = 0;
        } else {
            this.weeks = parseInt($(this._weeksID).val());
        }
        if (!this.weeks == 0) {
			$("#subscriptionNoteWeeks").html("in " + this.weeks + " " + ((this.weeks==1)? "week" : "weeks"));
		} else {
			$("#subscriptionNoteWeeks").html("");
		}
    },
    validate: function () {
        if ($(this._weeksID).val() == "") {
            this.displayError(this.settings.weeksErrorMsg);
            //$(this._weeksID).focus();
            return false;
        }
        return true;
    },
    updateDaysOfWeekDD: function () {
    	var newSelector = ".numberOfWeeksLottoClass";
    	if ($(this._daysID).val() == "144") {
            $(newSelector + " option[value='1']").text('1 week (2 draws)');
            $(newSelector + " option[value='4']").text('4 weeks (8 draws)');
            $(newSelector + " option[value='13']").text('13 weeks (26 draws)');
            $(newSelector + " option[value='26']").text('26 weeks (52 draws)');
            $(newSelector + " option[value='52']").text('52 weeks (104 draws)');
        } else {
            $(newSelector + " option[value='1']").text('1 week (1 draw)');
            $(newSelector + " option[value='4']").text('4 weeks (4 draws)');
            $(newSelector + " option[value='13']").text('13 weeks (13 draws)');
            $(newSelector + " option[value='26']").text('26 weeks (26 draws)');
            $(newSelector + " option[value='52']").text('52 weeks (52 draws)');
        }
        
        //update new dropdown redesigned
        if (typeof ddNumOfWeek != "undefined"){ddNumOfWeek.update();}
    },
    calculate: function () {this.base();}
});

/* extend extraction and add support for discounting products */
var Discount = Extraction.extend({
    minDiscountLines: 0, minDiscountDraws: 0, costDiscountProduct: 0, numLines: 0, emptyLines: 0, discountOnProduct: 0, discountProductTypeName: "the discounted product",
    maxAnimations:1, countAnimations:0, urlDiscountedCampaignInfo: "/app/overlay/discountedCampaignInfo.html",
    constructor: function (settings) {
    	if (settings) {
            if (settings.minDiscountLines) this.minDiscountLines = settings.minDiscountLines;
            if (settings.minDiscountDraws) this.minDiscountDraws = settings.minDiscountDraws;
            if (settings.costDiscountProduct) this.costDiscountProduct = settings.costDiscountProduct; 
	        if (settings.discountOnProduct) this.discountOnProduct = settings.discountOnProduct;
	        if (settings.discountProductTypeName) this.discountProductTypeName = settings.discountProductTypeName;
	        if (settings.maxAnimations) this.maxAnimations = settings.maxAnimations;
	        if (settings.urlDiscountedCampaignInfo) this.urlDiscountedCampaignInfo = settings.urlDiscountedCampaignInfo;
	    }
    	this.base(settings);
        var _self = this;
        $(document).ready(function () {
            $("#discountProductCheck").change(function () {_self.calculate.apply(_self);});
            if ($("#openDiscountSyndicate").length>0)
            	$("#openDiscountSyndicate").click(function() {_self.openDiscountedCampaignInfo.apply(_self)});
        });
    },    
    discountedProductAnimation: function() {
    	if (this.countAnimations < this.maxAnimations) {
    		if (this.mobile==true) 
    			$("#addRemove-wrapper").scrollToMe(200);
    		
	    	$("#discountProduct").effect("shake",{distance:6});
	    	$("#discountProductAnimation").show();
	    	this.countAnimations++;
    	}
    },
    dsInt: 0,
    canGetDiscountedProduct : function () {
    	return (this.numLines >= this.minDiscountLines && ((this.days * this.weeks) >= this.minDiscountDraws || this.minDiscountDraws==1 ))
    },
    addDiscountProduct: function () {    	
 
		if ($("#discountProductCheck").length > 0) { 
			$("#discountProductCheck").checkBoxRidesigner().data().cr.clearAnimate();
            
			if (this.canGetDiscountedProduct()) {
                $("#discountProductCheck").checkBoxRidesigner().data().cr.disable(false);                
                $("#discountProduct .subscription span").removeClass("opacity");                            
                if (document.getElementById("discountProductCheck").checked === true) {
                	$("#subscriptionDiscountProduct").html("and " + this.discountProductTypeName + " bet");
                } else {
                	$("#subscriptionDiscountProduct").html("");
                }
                if (document.getElementById("discountProductCheck").checked === true && this.displayAmount > 0) {                	
                	return this.costDiscountProduct * this.days * this.weeks;
                } else {                	
                	if (document.getElementById("discountProductCheck").checked === false) 
                		this.discountedProductAnimation();
                		$("#discountProductCheck").checkBoxRidesigner().data().cr.animate();
            	}
            } else {
            	this.countAnimations=0;
            	$("#discountProductAnimation").hide();
                $("#discountProductCheck").checkBoxRidesigner().data().cr.disable(true);
                $("#discountProduct .subscription span").addClass("opacity");
                $('#discountProductCheck').attr('checked', false);
                $("#discountProductCheck").checkBoxRidesigner().data().cr.uncheck();                
                $("#subscriptionDiscountProduct").html("");
            }
        }
        return 0;
    },
    calculate: function () {    	
    	this.displayAmount = this.displayAmount + this.discountOnProduct; 
    	this.displayAmount = this.displayAmount + this.addDiscountProduct();
        this.base();
    },
    openDiscountedCampaignInfo: function () {
    	var _self=this;
    	var overlayDiscount = new COverlay({
    		overlayUrl: this.urlDiscountedCampaignInfo, 
    		execute: function() {
    			if (_self.canGetDiscountedProduct()) {
					$("#buttonAddDiscount").show(); //Show Buttons on modal div 
	            } else {
	                $("#buttonAddDiscount").hide(); //Hide Buttons on modal div
	            }
				$(".add","#buttonAddDiscount").click(function() {
					if ($("#discountProductCheck").attr("disabled")!="disabled") {
				    	$('#discountProductCheck').attr('checked', true);
				    	$('#discountProductCheck').val(true);
			    		$("#discountProductCheck").checkBoxRidesigner().data().cr.check();
			    		_self.calculate();
			    	}
				});
				$(".remove","#buttonAddDiscount").click(function() {
					if ($("#discountProductCheck").attr("disabled")!="disabled") {
				    	$('#discountProductCheck').attr('checked', false);
				    	$('#discountProductCheck').val(false);
			    		$("#discountProductCheck").checkBoxRidesigner().data().cr.uncheck();
			    		_self.calculate();
			    	}
				});
    		}
    	});
    	IOverlay.open(overlayDiscount);
	}
});

/* play lotto class (extends discounts) */
var Lotto = Discount.extend({
    /* constants */
    _from: 1, _to: 49, _fromS: 0, _toS: 9, _maxLines: 10, _showedLines: 4, _ID: "#grid",
    legendsImages: ["picker-legends-0.png", "picker-legends-1.png", "picker-legends-2.png", "picker-legends-3.png", "picker-legends-4.png", "picker-legends-5.png",
    "picker-legends-6.png", "picker-legends-7.png", "picker-legends-8.png", "picker-legends-9.png", "../but-pick-legend.png"],
    urlSubscriptionPlayLotto : "/app/overlay/subscriptionPlayLotto.html", urlPitchLegend : "/app/overlay/pitchLegend.html",
    lines: [],
    storeNumbers: false,
	settings: {	    
	    numbersOnlyMsg: "",
	    invalidNumberMsg: "",
	    andMsg: "",
	    duplicatedNumberMsg: "",
	    tooFewNumbersMsg: "",
	    commissionArray: [26,27,30,31,50]
	},
	totalCommission: 0,
	totalCommissionPerc: 0,
	legendImagesBase : "",
	constructor: function (settings) {
        var _self = this;        
        if (settings) {            
            if (settings.cost) this.cost = settings.cost;
            if (settings.maxLines) this._maxLines = settings.maxLines; 
            if (settings.initialLines) this._showedLines = settings.initialLines;
            if (settings.setLegend) this.setLegend = settings.setLegend; 
            if (settings.unsetLegend) this.unsetLegend = settings.unsetLegend; 
            if (settings.numbersOnlyMsg) this.settings.numbersOnlyMsg = settings.numbersOnlyMsg;
            if (settings.invalidNumberMsg) this.settings.invalidNumberMsg = settings.invalidNumberMsg;
            if (settings.duplicatedNumberMsg) this.settings.duplicatedNumberMsg = settings.duplicatedNumberMsg;
            if (settings.tooFewNumbersMsg) this.settings.tooFewNumbersMsg = settings.tooFewNumbersMsg;
            if (settings.andMsg) this.settings.andMsg = settings.andMsg;
            if (settings.lineStructure) this.settings.lineStructure = settings.lineStructure;
            if (settings.pickLegend) this.settings.pickLegend = settings.pickLegend;
            if (settings.urlSubscriptionPlayLotto) this.urlSubscriptionPlayLotto = settings.urlSubscriptionPlayLotto;
            if (settings.urlPitchLegend) this.urlPitchLegend = settings.urlPitchLegend;
            if (settings.storeNumbers) this.storeNumbers = settings.storeNumbers;
        }
        this.base(settings);
        _self.legendImagesBase = "/img/lntk/" + _self.domain + "/picklegend/";
        /********* initialize form game *********/
        var numbers = [];
        for (i = 0; i < _self._maxLines; i++) {
            numbers = new Array();
            for (j = 0; j < 6; j++) {
                numbers[j] = new eNumber(_self._from, _self._to, "numbers");
            }
            numbers[6] = new eNumber(_self._fromS, _self._toS, "legend");
            _self.lines[i] = numbers;
        }

        /*************************************************************************************/
        $(document).ready(function () {
            /********* take values from form *********/
            var val = 0;
            for (i = 0; i < _self._maxLines; i++) {
                for (j = 0; j < 7; j++) {
                    val = $(".num" + j, "#line" + i).val();                    
                    if (val != "" && typeof val != "undefined") 
                		_self.lines[i][j].value = parseInt(val);                   		
                }
                _self._setLegend(i);
            }
            if (_self.storeNumbers === true) {
                var length = 0;
                for (ty = 0; ty < _self._maxLines; ty++)
                    if (core.getStorage("lottoLine_" + ty) != null) {                        
                        length++;
                        var line = core.getStorage("lottoLine_" + ty);
                        
                        numbers = new Array();
                        for (j = 0; j < 6; j++) {
                            numbers[j] = new eNumber(_self._from, _self._to, "numbers");
                            numbers[j].value = line[j].value;
                        }
                        numbers[6] = new eNumber(_self._fromS, _self._toS, "legend");
                        numbers[6].value = line[j].value;                        
                        _self.lines[ty] = numbers;                        
                    }
                if (_self._showedLines < length)
                    _self.showLines(length - _self._showedLines)
                
                for (ty = 0; ty < length ; ty++)
                    _self.fillLine(ty);
            }

            var numLines = _self.lastLine();
            _self._showedLines = (numLines <_self._showedLines) ? _self._showedLines : numLines;
            _self.calculate.apply(_self);
            $(".lucky", _self._ID).find("div").click(function (e) {
            	e.preventDefault();
                var line = parseInt(this.id.replace("sel_ld_",""));
                _self.extractLine(line);
                _self.calculate.apply(_self);
            });
            
            $("#quickLuckyDip-wrapper .buttonLucky").click(function (e) {
            	e.preventDefault();
    			_self.extractLines(parseInt($(this).attr("data-num")));
            });
            
            $(".btnClear", _self._ID).find("div").click(function (e) {
            	e.preventDefault();
                var line = parseInt(this.id.replace("sel_clear_",""));
                _self.clearLine(line);
                _self.calculate.apply(_self);
            });
            $(".nums", _self._ID).change(function (e) {
            	e.preventDefault();
            	_self.validateNum(this);
            	_self.calculate.apply(_self);
            });
            $(".legend", _self._ID).focusin(function(e) {
            	e.preventDefault();
            	_self.openModalLegends(parseInt($("span",this).attr("id").replace("sel_legend_","")));
            });
            $(".legend", _self._ID).focusout(function(e) {
        		_self.closeModalLegends();
            });
            $(".legend", _self._ID).click(function(e) {
            	e.preventDefault();
            	_self.openModalLegends(parseInt($("span",this).attr("id").replace("sel_legend_","")));
            });
            $("#addRemove-wrapper .addLine").click(function (e) {
            	e.preventDefault();
                _self.showLine();
            });             
            $("#addRemove-wrapper .removeLine").click(function (e) {
            	e.preventDefault();
                _self.hideLine();
                _self.calculate.apply(_self);
            });            
            $(_self._daysID).change(function () { _self.calculate.apply(_self) });
            $(_self._weeksID).change(function () { _self.calculate.apply(_self) });
                       
            $("#jackpotHunter").click(function() {
            	if( $('#jackpotHunter').attr('checked') != 'checked'){
		    		_self.openSubscription();
		    	}
            });
            if (_self.storeNumbers === true) {

                //store numbers click
                $(".storeNumbers .save").click(function () {
                    for (i = 0; i < _self._maxLines; i++) localStorage.removeItem("lottoLine_" + i)
                    for (i = 0; i < _self._showedLines; i++) {
                        core.setStorage("lottoLine_" + i, _self.lines[i]);
                    }
                });

                //clear numbers click
                $(".storeNumbers .clear").click(function () {
                    for (i = 0; i < _self._maxLines; i++) localStorage.removeItem("lottoLine_" + i);
                    location.href = location.href;
                });
            }

            
        });
    },
    
    extractLines: function(num) {
    	var i=0, j=0 ,arrLinesToAdd = [], lineToShow =0;
        while (j<num) {
        	if (this.validateLine(i).empty) 
    		{
    			j++; 
    			arrLinesToAdd[arrLinesToAdd.length]=i;            			
    			if (i>=this._showedLines) lineToShow++;
			}                		
        	i++;
        }
      	this.showLines(lineToShow);        
        for (a in arrLinesToAdd) 
        	this.extractLine(arrLinesToAdd[a]);        
        this.calculate();
    },
    
    openSubscription: function() {
    	if (!this.openPopUpBeforeSubmit) {
		    var _self=this;
		    var overlaySub = new COverlay({
		    	overlayUrl: this.urlSubscriptionPlayLotto, 
		    	execute: function() {$("#selectSubscriptionButton").click(_self.selectSubscription);}
		    });
	    	if (this.mobile) IOverlay.open(overlaySub, "slideDown", true);
	    	else IOverlay.open(overlaySub);
    	}
    },
    selectSubscription: function () {
    	$('#jackpotHunter').attr('checked', true);			    	
    	if ($("#jackpotHunter").next().hasClass("checkRidesigned")) $("#jackpotHunter").checkBoxRidesigner().data().cr.check();
    },
    pickLegendEvent: function (obj) {    	
		this.closeModalLegends($(obj).find("span").attr("id").charAt(2));                
		var temp= null;
		for (t = 0; t < this._maxLines; t++) {			
			temp=$("#line" + t, this._ID).find(".num6").val();
			temp= (temp=="") ? null : temp;			
			this.lines[t][6].value = temp;
		}
		this.calculate.apply(this);
	},
    extractLine: function (line) {
        //exctract the line
    	for (o = 0; o < 7; o++) this.lines[line][o].extract(this.lines[line]);

        //Need this to order only the numbers (legend mustn't change position on the array )
        var arrayToOrder = [];
        for (i = 0; i < 6; i++) arrayToOrder[i] = this.lines[line][i];

		//order the temp array
        arrayToOrder.sort();
        for (i = 0; i < 6; i++) this.lines[line][i] = arrayToOrder[i];

        this.fillLine(line);
    },
    fillLine: function (line) {
        var t = "";
        for (i = 0; i < 7; i++) {        	
            t = (this.lines[line][i].value != null) ? this.lines[line][i].toString(!(this.lines[line][i].group == "legend")) : "";            
            $(this._ID).find("#line" + line).find(".num" + i).val(t);
        }
        this._setLegend(line);
    },
    clearLine: function (line) {
        if (typeof this.lines[line] != "undefined") {
            for (i = 0; i < 7; i++) { this.lines[line][i].clear(); }
            this.fillLine(line);
        }
    },
    setLegend: null,
    unsetLegend: null,
    _setLegend: function (line) {    	
    	if (this.lines[line][6].value != null) {	    	
	    	if (this.setLegend != null) {
	    		this.setLegend.apply(window, [line, this.lines[line][6].value])
	    	} else {
	    		var elem = "\'combinations" + line + ".numbers" + 6 + "\'";
				$('input[id=' + elem + ']').val(this.lines[line][6].value);
				$('input[id=' + elem + ']').prev().css('background', 'url("' + this.legendImagesBase + this.legendsImages[this.lines[line][6].value] + '") no-repeat scroll 0 0 transparent'); 
	    	}
        } else {
        	if (this.unsetLegend != null) {
        		this.unsetLegend.apply(window, [line])
        	} else {  
        		$(this._ID).find("#line" + line).find(".num6").prev().removeAttr('style');
        	}
        }
    },    
	openedLegend: -1,
	openModalLegends: function (rowNum) {	
		this.openedLegend = rowNum;
		var _self=this;
		//if (this.mobile) {openModalLegends} else {
			var Overlegends = new COverlay({
				overlayUrl: _self.urlPitchLegend, 
				execute: function() {
					$("#legends",".pickLegend").find("a").click(function (e) {
		            	e.preventDefault();		            	
		            	_self.pickLegendEvent.apply(_self,[this]);
		            	IOverlay.interfaceClose();
		            });
				}
			});
			if (this.mobile)
			    IOverlay.open(Overlegends, "slideDown", true);
			else
			    IOverlay.open(Overlegends);
		//}
	},
	closeModalLegends: function (legendNumber) {
		if (typeof legendNumber!="undefined") {
			this.lines[this.openedLegend][6].value = legendNumber;
			this._setLegend(this.openedLegend);
		}
		else {
			jQuery('#overlay-backgroundOpacity , #pitchLegends').fadeOut();
		}		
	},
	showLines: function (num) {
		for (i=1; i<=num; i++) {
			this.showLine();
		}		
	},
    showLine: function () {
    	if (this._showedLines < this._maxLines) {
	    	var line = $(this.settings.lineStructure.replace(/varIndex/g,this._showedLines++));
	    	var _self=this;
	    	line.find(".lucky", _self._ID).find("div").click(function (e) {
            	e.preventDefault();
                var line = parseInt(this.id.replace("sel_ld_",""));                
                _self.extractLine(line);
                _self.calculate.apply(_self);
            });
	    	line.find(".btnClear", _self._ID).find("div").click(function (e) {
            	e.preventDefault();
                var line = parseInt(this.id.replace("sel_clear_",""));
                _self.clearLine(line);
                _self.calculate.apply(_self);
            });
	    	line.find(".nums", _self._ID).change(function (e) {
            	e.preventDefault();
            	_self.validateNum(this);
            	_self.calculate.apply(_self);
            });
	    	line.find(".legend", _self._ID).focusin(function(e) {
            	e.preventDefault();
            	_self.openModalLegends(parseInt($("span",this).attr("id").replace("sel_legend_","")));
            });
	    	line.find(".legend", _self._ID).focusout(function(e) {
        		_self.closeModalLegends();
            });
	    	line.find(".legend", _self._ID).click(function(e) {
            	e.preventDefault();            	
            	_self.openModalLegends(parseInt($("span",this).attr("id").replace("sel_legend_","")));
            });	    	
	    	line.hide();
	    	
	    	if (this.settings.pickLegend) {
	    		line.find(".noPickLegend").remove();
	    	} else {
	    		line.find(".legend").remove();
	    	}

	    	if (!this.mobile) {
	    		$("#grid").append(line);
	    		line.slideDown();
	    	}
	    	else {
	    		$("#grid > ul").append(line);
	    		line.show(200);
	    	}
	    	this.disableButtons();
    	}
    },
    
    disableButtons: function() {
    	var _self=this;
    	
		if (this._showedLines == 1) $('#addRemove-wrapper .removeLine').addClass("disabled");
    	else $('#addRemove-wrapper .removeLine').removeClass("disabled");
    		
    	if (this._showedLines >= this._maxLines) $('#addRemove-wrapper .addLine').addClass("disabled");
    	else $('#addRemove-wrapper .addLine').removeClass("disabled");
    	
    	$("#quickLuckyDip-wrapper .buttonLucky").each(function() {    		
    		if (parseInt($(this).attr("data-num")) > _self.emptyLines )
    			$(this).addClass("disabled");
    		else
    			$(this).removeClass("disabled");
    	});
    },
    
    hideLine: function () {
        if (this._showedLines > 1) {
            this._showedLines--;
            this.clearLine(this._showedLines);
            
            if (!this.mobile)
            	$("#line" + this._showedLines).slideUp();
            else
            	$("#line" + this._showedLines).hide();
            
            var _self=this;
            setTimeout(function() {
            	$("#line" + _self._showedLines).remove();
            },500);
            this.disableButtons();
        }
    },
    validateLine: function (line) {
        var empty = 0;
        var ret = { empty: false, valid: false };
        for (i = 0; i < 7; i++) {
        	if (this.lines[line][i].value == null || isNaN(this.lines[line][i].value))
                empty++;
        }
        ret.empty = (empty == 7) ? true : false;
        ret.valid = (empty == 0 || empty == 7) ? true : false;    
        return ret;
    },
    validate: function () {
        if (this.base()) {            
        	var notEmpty = 0;
            var temp = {};
            var valid = null;
            for (n = 0; n < this._maxLines; n++) {
                temp = this.validateLine(n);
                if (temp.empty === false && temp.valid === true) {                	
                    notEmpty++;
                    if (valid!==false) valid = true;
                }
                if (temp.empty === false && temp.valid===false) {
            	   valid=false;            	   
                }
            }
            if (notEmpty == 0 || valid == false) {
            	this.displayError(this.settings.tooFewNumbersMsg);
                return false;
            }            
            return true;
        }        
        return false;
    },    
    validateNum: function (obj) {
    	var array = obj.id.replace("combinations","").replace("numbers","").split(".");
        var line = array[0];
        var num = array[1];
        var val = obj.value;
        this.lines[line][num].value = null;
        try {
        	if (val!="")  this.lines[line][num].setValue(val, this.lines[line], this.lines[line][num].group);
        }
        catch (err) {
            switch (err) {
                case "nonnumeric":
                    this.displayError(this.settings.numbersOnlyMsg);
                    break;
                case "outofbound":
                    var errorMessage = this.settings.invalidNumberMsg + " " + this.lines[line][num].from + " " + this.settings.andMsg + " " + this.lines[line][num].to;
                    this.displayError(errorMessage);
                    break;
                case "duplicate":
                    /* show error duplicate number*/
                    this.displayError(this.settings.duplicatedNumberMsg);
                    break;
            }
        }
        finally {
            this.fillLine(line);
        }
    },
    nOfLines: function () {
        var tot = 0;
        var empty = 0;
        var temp = {};
        for (k = 0; k < this._maxLines; k++) {
            temp = this.validateLine(k);
            if (temp.empty === false && temp.valid === true) tot++;
            if (temp.empty === true) empty++;
        } 
        this.emptyLines = empty;
        this.numLines = tot;
    },
    lastLine: function () {
        var last = 0;
        var temp = {};
        for (k = 0; k < this._maxLines; k++) {
            temp = this.validateLine(k);
            if (temp.empty === false && temp.valid === true) last=k+1;
        }
        return last;
    },
    calculate: function () {
        this.nOfLines();  
        this.disableButtons();
        this.displayAmount = this.cost * this.days * this.weeks * this.numLines;
        this.appAmount = this.displayAmount;        
        $('#gridLines').val(this._showedLines);        
        var lastPerc=0;
        this.totalCommission=0;
        this.totalCommissionPerc=0;
        for (i=0; i<this.numLines; i++) {
        	lastPerc=(this.settings.commissionArray[i]) ? this.settings.commissionArray[i] : lastPerc;
        	this.totalCommission+=(this.cost * this.days * this.weeks)/100*lastPerc;
        	this.totalCommissionPerc+=(this.cost)/100*lastPerc;
        }
        this.totalCommission = parseFloat(this.totalCommission).toFixed(2);
        this.totalCommissionPerc=Math.ceil(this.totalCommissionPerc / (this.cost* this.numLines)*100);
        this.totalCommissionPerc=(isNaN(this.totalCommissionPerc)) ? 0 : this.totalCommissionPerc;
        this.base();
    }
});

/* play syndicate class (extends discounts) */
var Syndicate = Discount.extend({   
    constructor: function (settings) {
        var _self = this;
        
        if (settings) {if (settings.cost) this.cost = settings.cost;}
        
        this.base(settings);
        $(document).ready(function () {
        	_self.calculate.apply(_self);            
            //add click events on buttons in discounted message box if there's a discount active
        	if (_self.discountOnProduct!=0) {
        		$("#dayOfWeek").attr("disabled","disabled");
				$("#numberOfWeeksLotto").attr("disabled","disabled");
	        	$("#discountSubmit").click(function() {_self.submit();});
	        }
            
        	$(_self._daysID).change(function () { _self.calculate.apply(_self) });
            $(_self._weeksID).change(function () { _self.calculate.apply(_self) });
        });
    },        
    calculate: function () {    	
    	this.displayAmount = this.cost * this.days * this.weeks;
    	this.appAmount = this.displayAmount;
        this.base();
    }
});

var promoSyndicate = Discount.extend({   
    constructor: function (settings) {    	
        var _self = this;        
        if (settings) {if (settings.cost) this.cost = settings.cost;}        
        this.base(settings);
        $(document).ready(function () {
        	_self.calculate.apply(_self); 
        });
    },        
    calculate: function () {    	
    	this.displayAmount = this.cost;
    	this.appAmount = this.displayAmount;
        this.base();
    }
});
