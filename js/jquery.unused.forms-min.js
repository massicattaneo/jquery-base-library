/* *****************************************************************************************************************/
/*								MASKEDINPUT																		   */
/* *****************************************************************************************************************/
var CMask = base2.Base.extend({
    values: [],
    fixed: false,           //determines wheter the char is a fixed char or fillable by the user
    fixedValue: "",         //set the fixed value char
    single: true,           //determines whether is a single char or multiple
    onEmpty: "_",           //char to fill when is empty
    lack: 0,                //the gap created by fixed values inside the pattern
    pattern: "",            //pattern to follow when is a multiple chars
    patternFromLeft: false, //fills pattern from left/right
    ignorePatternChars: [], //ignore some chars in the pattern
    ignoredChars: 0,        //number of ignore pattern chars

    constructor: function (fixed, fixedValue, values, single, pattern, onEmpty, patternFromLeft, ignorePatternChars) {
        if (typeof fixed != "undefined") this.fixed = fixed;
        if (typeof fixedValue != "undefined") this.fixedValue = fixedValue;
        this.values = (typeof values != "undefined") ? values.split('') : new Array();
        if (typeof pattern != "undefined") this.pattern = pattern;
        if (typeof single != "undefined") this.single = single;
        if (typeof onEmpty != "undefined") this.onEmpty = onEmpty;
        if (typeof patternFromLeft != "undefined") this.patternFromLeft = patternFromLeft;
        if (typeof ignorePatternChars != "undefined") this.ignorePatternChars = ignorePatternChars;
    },

    setValue: function (value, pos) {
        pos = (this.single) ? 0 : pos;
        if (!this.fixed) {
            if (this.single)
                this.values = this.values.join('').replaceAt(pos, value).split('');
            else if (value == "") {
                this.values = this.values.join('').removeAt(pos - 1).split('');
            }
            else if (!this.single)
                if (this.pattern != "" && this.pattern.match(/[|]/g) != null && this.pattern.match(/[|]/g).length <= this.values.length)
                { } else
                    this.values = this.values.join('').insertAt(pos, value).split('');
        }
    },

    getMultiPos: function (pos) {
        var ret = 0;
        var arr = this.pattern.split('');
        for (i = arr.length; i >= arr.length - pos; i--) {
            if (arr[i] == "|" || this.pattern == "")
                ret++;
        }
        if (this.pattern == "") ret--;
        ret += this.ignoredChars;
        return ret;
    },

    _replacePattern: function () {
        var ret = [], lack = 0, pos = 0;
        var arr = this.pattern.split('');
        var back = false;
        this.ignoredChars = 0;
        if (this.patternFromLeft)
            for (i = 0; i < this.values.length; i++) {
                pos = i;
                if (arr[pos + lack] != "|") {
                    back = false;
                    if (this.ignorePatternChars.indexOf(this.values[i]) == -1)
                        ret.push(arr[pos + lack]);
                    else
                        back = true;
                    lack++;
                }
                if (arr[pos + lack] == "|")
                    ret.push(this.values[i]);
                if (back) {
                    lack--;
                    this.ignoredChars++;
                }
            }
        else
            for (i = this.values.length; i > 0; i--) {
                pos = arr.length - (this.values.length - i) - 1;
                if (arr[pos - lack] != "|") {
                    back = false;
                    if (this.ignorePatternChars.indexOf(this.values[i - 1]) == -1)
                        ret.push(arr[pos - lack]);
                    else
                        back = true;
                    lack++;
                }
                if (arr[pos - lack] == "|")
                    ret.push(this.values[i - 1]);
                if (back) {
                    lack--;
                    this.ignoredChars++;
                }
            }
        this.lack = lack;
        if (!(this.patternFromLeft)) ret.reverse();
        return ret.join('');
    },

    getValue: function () {
        if (this.fixed)
            return this.values.join('');
        else if (this.values.length == 0 || this.values.join('') == "")
            return this.onEmpty;
        if (this.pattern == "")
            return this.values.join('');
        else {
            return this._replacePattern();
        }
    },

    getOriginalValue: function () {
        if (this.fixed)
            return this.fixedValue;
        else if (this.values.length == 0 || this.values.join('') == "")
            if (this.onEmpty != "") { return this.onEmpty } else { return ""; }
        return this.values.join('');

    },

    getLength: function () {
        if (this.single && !this.fixed) {
            return 1;
        } else {
            return (this.values.length + this.lack);
        }
    },

    isEmpty: function () {
        if (this.fixed)
            return true;
        else if (this.values.length == 0 || this.values.join('') == "")
            return true;
        else
            return false;
    }

});

/***************************************************************** Enumerable: mask types **************************************************************/
var EMasks = {};
var maskTypes = {

    empty: function () {
        return new Array(new CMask(false, "", "", false, "", ""), new CMask(true, ""));
    },

    date: function (divider) {
        divider = (divider) ? divider : "/";
        var arr = new Array(
            new CMask(),
            new CMask(),
            new CMask(),
            new CMask(),
            new CMask(true, "-", divider),
            new CMask(),
            new CMask(),
            new CMask(true, "-", divider),
            new CMask(),
            new CMask(),
            new CMask(true, "", "")
        );
        return arr;
    },

    time: function (divider) {
        divider = (divider) ? divider : ":";

        var arr = new Array(
            new CMask(false, "", "", true, "", "0"),
            new CMask(false, "", "", true, "", "0"),
            new CMask(true, ":", divider),
            new CMask(false, "", "", true, "", "0"),
            new CMask(false, "", "", true, "", "0"),
            new CMask(true, "", "")
        );
        return arr;
    },

    currency: function (currencySymbol, useDot) {
        currencySymbol = (currencySymbol) ? " " + currencySymbol : " " + core.language.currency;
        useDot = (typeof useDot != "undefined") ? useDot : core.language.useDotDecimalSeparator;
        var pattern = "|||" + ((!useDot) ? "." : ","); for (i = 0; i < 15; i++) pattern += pattern; pattern += "|||";

        var arr = new Array(
            new CMask(false, "", "", false, pattern, "0", false, ["-"]),
            new CMask(true, ".", (useDot) ? "." : ","),
            new CMask(false, "", "", true, "", "0"),
            new CMask(false, "", "", true, "", "0"),
            new CMask(true, "", currencySymbol)
        );
        return arr;
    },

    cellular: function (internationalPrefix) {
        internationalPrefix = (internationalPrefix) ? internationalPrefix : core.language.internationalPhonePrefix;
        var arr = new Array(
            new CMask(true, "", "(" + internationalPrefix + ") "), new CMask(false, "", "", false, "|||-|| || |||", " ", true)
        );
        return arr;
    },

    phone: function (internationalPrefix) {
        internationalPrefix = (internationalPrefix) ? internationalPrefix : core.language.internationalPhonePrefix;
        var arr = new Array(
            new CMask(true, "", "(" + internationalPrefix + ") "), new CMask(false, "", "", false, "||||-|| || ||", " ", true)
        );
        return arr;
    },

    suffix: function (suffix) {
        var arr = new Array(
            new CMask(false, "", "", false), new CMask(true, "", suffix)
        );
        return arr;
    },

    prefix: function (prefix) {
        var arr = new Array(
            new CMask(true, "", prefix), new CMask(false, "", "", false), new CMask(true, "")
        );
        return arr;
    }

};
(function setEMasks() {
    for (name in maskTypes) {
        if (typeof maskTypes[name] == "function")
            EMasks[name] = maskTypes[name];
    }
})();

/************************************************************************* masked redesigner ******************************************/

var masked = validator.extend({

    /* mask properties and jquery objects */
    mask: [],
    maskInput: $(),
    maskCaretPos: 0,
    maskArrPos: 0,
    maskMultiPos: 0,

    /* initialize the component */
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                mask: []
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "textbox");
        this._createMask();
        this.validationElemToFocus = this.maskInput;
        this.mask = this.options.mask;

        this._setUpmasked();

        if (this.el.val() != "")
            this.el.triggerHandler("change");
    },

    /* Create the jquery inputMask object and hide the original */
    _createMask: function () {
        this.maskInput = $('<input type="text" value="" />');
        this.maskInput.attr("tabindex", this.el.attr("tabindex"));
        this.maskInput.width(this.el.width());
        this.el.after(this.maskInput);
        this.el.addClass("hide");
        this.el.attr("tabindex", "999999");
        this.el.attr("autocomplete", "off");
    },

    /* Used to setup the component also during refreshing */
    _setUpmasked: function () {
        this.maskInput.unbind();
        if (this.el.attr("disabled") != "disabled")
            this._bindMaskEvents();
    },

    /* get the masked value */
    getMaskValue: function () {
        var ret = "";
        var empty = true;
        for (he = 0; he < this.mask.length; he++) { ret += this.mask[he].getValue(); if (!this.mask[he].isEmpty()) empty = false; }
        if (empty) ret = "";
        return ret;
    },

    /* get the value of the orignal element */
    getOriginalValue: function () {
        var ret = "";
        var empty = true;
        for (i in this.mask) { ret += this.mask[i].getOriginalValue(); if (!this.mask[i].isEmpty()) empty = false; }
        if (empty) ret = "";
        return ret;
    },

    /* advance/reduce the caret position on key press 
    direction: TRUE for forward, FALSE for backward
    */
    _maskMove: function (direction) {
        if (direction === true) {
            if (this.mask[this.maskArrPos].fixed == true)
                this.maskCaretPos += this.mask[this.maskArrPos].getLength();
            else
                this.maskCaretPos++;
            if (this.mask[this.maskArrPos].single && this.mask[this.maskArrPos + 1])
                if (this.mask[this.maskArrPos + 1].fixed)
                    this.maskCaretPos += this.mask[this.maskArrPos + 1].getLength();
        } else {
            this.maskCaretPos--;
            if (this.mask[this.maskArrPos - 1] && this.mask[this.maskArrPos].single)
                if (this.mask[this.maskArrPos - 1].fixed)
                    this.maskCaretPos -= this.mask[this.maskArrPos - 1].getLength();
        }
        this.maskArrPos = (this.maskArrPos < 0) ? 0 : (this.maskArrPos > this.mask.length) ? this.mask.length - 1 : this.maskArrPos;
        this.maskMultiPos = (this.maskMultiPos < 0) ? 0 : this.maskMultiPos;
    },

    /* Event raised when on key press or mouse click: 
    find:
    1. the position in the mask array (maskArrPos)
    2. the position inside that value if the value is multi character (maskMultiPos)*/
    _maskFindPosition: function () {
        this.maskCaretPos = this.maskInput.caretPos();

        var pos = 0, i = 0;
        while (pos < this.maskCaretPos) {
            pos += this.mask[i].getLength();
            i++;
        }

        if (i != this.mask.length)
            if (this.mask[i - 1])
                if (this.mask[i - 1].fixed)
                    if (this.mask[i - 1].getLength() > 1)
                        i--;

        if (this.mask[i - 1])
            if (!this.mask[i - 1].single) {
                i--;
                pos -= this.mask[i].getLength();
            }


        this.maskArrPos = i;
        if (this.mask[i])
            this.maskMultiPos = this.mask[i].getMultiPos(this.maskCaretPos - pos);
        else
            this.maskMultiPos = 0;

        //this.log("AFTER: caretPos: " + this.maskCaretPos + " arrPos: " + this.maskArrPos + " multiPos: " + this.maskMultiPos + " pos: " + pos);
        //this.maskArrPos = (this.maskArrPos < 0) ? 0 : (this.maskArrPos > this.mask.length-1) ? this.mask.length - 1 : this.maskArrPos;
        this._maskSetOriginalValue();
    },

    /* set the original value and raise the "OriginalChange" event */
    _maskSetOriginalValue: function () {
        var prev = this.el.val(), actual = this.getOriginalValue();
        this.el.val(actual);
        if (prev != actual) {
            var c = this.maskCaretPos;
            this.el.triggerHandler("OriginalChange");
            var self = this;
            this.maskCaretPos = c;
            this.maskInput.caretPos(c);
        }
    },

    /* Bind the Events for the component */
    _bindMaskEvents: function () {
        var _self = this;

        /* on focus raise the ORIGINAL element focus */
        this.maskInput.focus(function () { _self.el.triggerHandler("focus"); setTimeout(function () { _self._maskFindPosition(); }, 100) });

        /* keyup or change in the ORIGINAL element */
        this.el.bind("keyup change", function () {

            var values = $(this).val().split('');
            var arrPos = 0, setValue = true;
            if (_self.mask[arrPos]) {
                for (i in _self.mask)
                    if (!_self.mask[i].fixed) _self.mask[i].values = [];

                for (i in values) {
                    setValue = values[i] != _self.mask[arrPos].fixedValue;

                    while (_self.mask[arrPos].fixed)
                        arrPos++;

                    if (_self.mask[arrPos + 1])
                        if (values[i] == _self.mask[arrPos + 1].fixedValue) {
                            setValue = false;
                            arrPos++;
                        }
                    if (setValue)
                        _self.mask[arrPos].setValue(values[i], i);

                    if (_self.mask[arrPos + 1] && setValue && _self.mask[arrPos].single)
                        arrPos++;
                }


                _self.maskInput.val(_self.getMaskValue());
            }

        });

        /* keydown on the MASKED element */
        this.maskInput.keydown(function (e) {

            _self.maskCaretPos = _self.maskInput.caretPos();

            switch (e.keyCode) {
                case _self.keyCodes.CANC:
                    e.preventDefault();
                    var bef = _self.mask[_self.maskArrPos].lack;
                    if (_self.mask[_self.maskArrPos].single)
                        _self.mask[_self.maskArrPos].setValue("", _self.maskMultiPos);
                    else
                        _self.mask[_self.maskArrPos].setValue("", _self.maskMultiPos + 1);

                    _self.maskInput.val(_self.getMaskValue());
                    if (bef != _self.mask[_self.maskArrPos].lack)
                        _self.maskCaretPos--;
                    _self.maskInput.caretPos(_self.maskCaretPos);
                    break;
                case _self.keyCodes.BACK_SPACE:
                    e.preventDefault();
                    _self.getMaskValue();
                    _self.maskArrPos = (_self.maskArrPos < 1) ? 1 : _self.maskArrPos;

                    if (_self.maskArrPos > _self.mask.length - 1)
                        if (_self.mask[_self.maskArrPos - 1].fixed)
                            _self.maskCaretPos = _self.maskInput.val().length + 1 - _self.mask[--_self.maskArrPos].getLength();

                    if (_self.mask[_self.maskArrPos])
                        if (_self.mask[_self.maskArrPos].single) _self.maskArrPos--;

                    var bef = _self.mask[_self.maskArrPos].lack;
                    if (_self.mask[_self.maskArrPos])
                        _self.mask[_self.maskArrPos].setValue("", _self.maskMultiPos);

                    _self.maskInput.val(_self.getMaskValue());
                    if (bef != _self.mask[_self.maskArrPos].lack)
                        _self.maskCaretPos--;

                    _self._maskMove(false);
                    _self.maskInput.caretPos(_self.maskCaretPos);
                    break;
                default:
                    break;
            }
            _self._maskFindPosition();
        });

        /* keypress on the MASKED element */
        this.maskInput.keypress(function (e) {

            if (_self.keyCodes.FUNCTION_KEYS.indexOf(e.keyCode) == -1) {
                e.preventDefault();

                if (_self.mask[_self.maskArrPos]) {

                    var fixed = (_self.mask[_self.maskArrPos + 1]) ? _self.mask[_self.maskArrPos + 1].fixed : false;
                    if (!(fixed && _self.mask[_self.maskArrPos + 1].getValue() == String.fromCharCode(e.which))) {
                        if (_self.mask[_self.maskArrPos].fixed)
                            _self.maskCaretPos += _self.mask[_self.maskArrPos++].getLength();

                        _self.getMaskValue();

                        var bef = 0;
                        if (typeof _self.mask[_self.maskArrPos] != "undefined") {
                            bef = _self.mask[_self.maskArrPos].lack;
                            _self.mask[_self.maskArrPos].setValue(String.fromCharCode(e.which), _self.maskMultiPos);
                            _self.maskInput.val(_self.getMaskValue());
                            if (bef != _self.mask[_self.maskArrPos].lack)
                                _self.maskCaretPos++;
                            _self._maskMove(true);
                        }


                    } else {
                        _self.maskCaretPos++;
                    }
                    _self.maskInput.caretPos(_self.maskCaretPos);
                }
                _self._maskFindPosition();
            }
        });

        /* replace the placeholder click event and bind it to the MASKED element */
        this.placeholder.unbind("click");
        this.placeholder.click(function (e) {
            //_self.log("click on placeholder");
            e.preventDefault();
            _self.maskInput.focus();
        });

    },

    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        /* validate on Original change */
        this.el.bind("OriginalChange", function (e) {
            if (e.keyCode != _self.keyCodes.TAB)
                _self.el.trigger("validate");
        });
    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing masked");
        this._setUpmasked();
    }

});

masked.implement(Ivalidator);

/* 
JQUERY OBJECT: masked
Properties:
*/

$(function () {
    $.fn.masked = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new masked(options, this);
                $.data(this, 'masked', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*								CALENDAR																		   */
/* *****************************************************************************************************************/
var calendar = masked.extend({

    /* mask properties and jquery objects */
    calendar: $(),
    calendarDate: new Date(),
    calendarSelectDate: new Date(),
    calendarPrev: $(),
    calendarNext: $(),
    calendarMonth: $(),
    calendarYear: $(),
    calendarTable: $(),
    calendarDateDivider: "",
    /* initialize the component */
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                calendarRange: [new Date(), new Date(new Date().getTime() + 200 * 86400000)],
                calendarToday: new Date()
            }
        );

        this.base(options, elem);
        this.type = "calendar";

        /* normalize calendarRange */
        this.options.calendarRange[0].normalize();
        this.options.calendarRange[1].normalize(true);

        /* setUp the mask type for the calendar: date */
        this.mask = EMasks.date("/");
        this.calendarDateDivider = this.mask[4].fixedValue;

        this.calendarDate = this.options.calendarToday;
        this.calendarDate.normalize();
        this.calendarSelectDate.setTime(this.calendarDate.getTime());

        this._createCalendar();

        this._setUpCalendar();
        if (this.el.val() != "")
            this._changeCalValue();

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

        /* Years */
        for (i = this.options.calendarRange[0].getFullYear() ; i <= this.options.calendarRange[1].getFullYear() ; i++)
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
            if (this.calendarSelectDate.getFullYear() == this.options.calendarRange[0].getFullYear())
                if (i < this.options.calendarRange[0].getMonth())
                    create = false;
            if (this.calendarSelectDate.getFullYear() == this.options.calendarRange[1].getFullYear())
                if (i > this.options.calendarRange[1].getMonth())
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
        var today = this.options.calendarToday; today.normalize();

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
        if (temp.getTime() >= this.options.calendarRange[0].getTime() && temp.getTime() <= this.options.calendarRange[1].getTime()) {
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
                        _self.groupCount == 0)
                        _self.getGroupItems()[_self.options.groupName][1].maskInput.focus();
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
        if (d.getTime() >= this.options.calendarRange[0].getTime() &&
            d.getTime() <= this.options.calendarRange[1].getTime()) {
            this.calendarDate = d;
            this.calendarSelectDate.setTime(this.calendarDate.getTime());
            this.el.triggerHandler("change");
        }
        if (this.options.groupName != "")
            if (this.getGroupItems()[this.options.groupName].length == 2)
                if (this.getGroupItems()[this.options.groupName][0].type == "calendar" && this.getGroupItems()[this.options.groupName][1].type == "calendar")
                    if (this.groupCount == 0) {
                        this.getGroupItems()[this.options.groupName][1].options.calendarRange[0] = new Date(this.calendarDate.getTime());
                        this.getGroupItems()[this.options.groupName][1].refresh();
                        if (this.getGroupItems()[this.options.groupName][1].calendarDate.getTime() < this.calendarDate.getTime())
                            this.getGroupItems()[this.options.groupName][1].calendarDate.setTime(this.calendarDate.getTime());
                    }
    },

    _setCalendarValue: function (time) {
        if (new Date(time).getTime() >= this.options.calendarRange[0].getTime() &&
            new Date(time).getTime() <= this.options.calendarRange[1].getTime()) {
            this.calendarDate.setTime(time);
            this.el.val(new Date(time).toFormatString("yyyy" + this.calendarDateDivider + "mm" + this.calendarDateDivider + "dd"))
            this._changeCalValue();
        }
    },

    _bindCalendarEvents: function () {
        var _self = this;

        this.el.bind("OriginalChange", function () {
            _self._changeCalValue();
            _self._fillCalendarTable();
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self._fillMonthSelect();
            _self.calendarMonth.val(_self.calendarDate.getMonth());
        });

        this.calendarTable.mouseleave(function () {
            _self._highlightSelectedCalendar();
        });

        this.maskInput.focus(function () {
            _self.calendarMonth.val(_self.calendarDate.getMonth());
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self.calendarSelectDate.setTime(_self.calendarDate.getTime());
            _self._fillCalendarTable();
        });

        this.maskInput.keydown(function (e) {
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

            _self.calendarMonth.val(_self.calendarDate.getMonth());
            _self.calendarYear.val(_self.calendarDate.getFullYear());
            _self.calendarSelectDate.setTime(_self.calendarDate.getTime());
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
            if (test.getTime() > _self.options.calendarRange[0].getTime()) {
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
            if (test.getTime() < _self.options.calendarRange[1].getTime()) {
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

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.log("refreshing calendar");
        this._setUpCalendar();
    }

});

/* 
JQUERY OBJECT: Calendar
Properties:
*/

$(function () {
    $.fn.calendar = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new calendar(options, this);
                $.data(this, 'calendar', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*  								TABLE EXTENDED																	   */
/* *****************************************************************************************************************/
var tableExtended = wrapper.extend({
    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {
                tableCellHeight: "19px", // "auto" or fixed height
                tablePagination: 6, //0 doesn't paginate - a number that will be the number of visible lines
                tableCheckboxes: false,
                tableLineMenus: false,
                tableHeadOrder: false,
                tableLabels: ["PREV", "#NUM OF #TOT", "NEXT"]
            }
        );
        this.base(options, elem);
        this.wrapper.addClass(this.options.idPrefix + "tableExtended");

        try {
            this.startUpdating();
        } catch (e) {
            // TODO: handle exception
        } finally {
            var _self = this;
            setTimeout(function () {
                _self._createtable();
                _self._setUptable();
                _self.stopUpdating();
            }, 550);
        }

    },

    _tableCols: 0,
    _tableLinesCheck: [],
    _talbeColsWidth: [],

    _createtable: function () {
        var _self = this;

        /* set the number of columns */
        this._tableCols = this.el.find(".line").first().find(".cell").length;

        /* Add alternate class */
        this.el.find(".line").each(function (index) {
            if (index & 1) $(this).addClass("alternate");
            $(this).find(".cell").each(function (col) { $(this).addClass("col" + col); });
        });

        for (col = 0; col < this._tableCols; col++)
            this._talbeColsWidth[col] = 100 / this._tableCols;

        this.el.find(".line.head .cell").each(function (col) {
            if (typeof $(this).attr("data-width") != "undefined")
                _self._talbeColsWidth[col] = $(this).attr("data-width").replace("%", "");
        });

        this._tableSetColWidth();

        /* Set the height auto or fixed */
        var height = 0;
        this.el.find(".line .cell").each(function () {
            if (height < $(this).height()) {
                if (height != 0 && _self.options.tableCellHeight != "auto")
                    $(this).addClass("overflow");
                height = $(this).height();
            }
        });
        this.el.find(".line .cell").height(height);

        this.el.find(".line").not(".head").each(function (index) {
            //To removed when I will apply the filter
            $(this).addClass("filtered");

            if (_self.options.tableCheckboxes) {
                /* add the checkbox */
                _self.wrapper.css("padding-left", "24px");
                var input = $("<input type='checkbox' value='" + index + "' data-group='line" + index + "' />")
                $(this).append(input);
                var check = new checkbox({}, input);
                check.group.removeClass("hide");
                check.wrapper.removeClass("hide");
                _self._tableLinesCheck[index] = check;
            }
            if (_self.options.tableLineMenus) {
                /* add the line menus */
                _self.wrapper.css("padding-right", "24px");
                var menuLabel = $('<div id="menuButton_' + index + '" class="lineMenu"></div>');
                var menuStripe = $('<div style="height:19px; width: 300px;" >MENU</div>');
                $(this).append(menuLabel);
                $(this).after(menuStripe);
                var s = new slideOpen({ slideOpenButton: "#menuButton_" + index, slideOpenDirection: "right" }, menuStripe);
            }

            /* wrap the cell in a numbered line */
            var line = $('<div class="line' + index + '" />');
            $(this).find(" .cell").each(function () {
                line.append(this);
            });
            line.appendTo(this);
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

        this._tableSetColWidth();
    },

    _tableOrderByAttr: function (col) {

        var reverse = (this.el.find(".line.head .col" + col).hasClass("asc")) ? true : false;
        var cssClass = (reverse) ? "desc" : "asc";
        this.el.find(".line.head .cell").removeClass("asc desc");
        this.el.find(".line.head .col" + col).addClass(cssClass);

        var _self = this;
        var a = new base2.Collection();
        a = this._tableArrOrderData[col];
        a.sort(function (item1, item2, key1, key2) {
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
            $(this).append(_self.el.find(".line" + order[row]));
        });

    },

    _tableSetColWidth: function () {
        /* set the width of each column */
        var elemDif = this.el.find(".line .cell").outerWidth(true) - this.el.find(".line .cell").width();
        for (col = 0; col < this._tableCols; col++) {
            $(".cell.col" + col).width(this._talbeColsWidth[col] * (this.wrapper.width() - elemDif * this._tableCols - 1) / 100 + "px");
        }

    },

    _tableArrOrderData: [],
    _createTableOrderData: function () {
        var _self = this;
        for (i = 0; i < this._tableCols; i++) {
            this._tableArrOrderData[i] = new base2.Collection();
            this.el.find(".line").not(".head").find(".col" + i).each(function (row) {
                var value = this.innerHTML.toString().parser();
                if (typeof a == "string");
                value = value.toString().toLowerCase();
                _self._tableArrOrderData[i].add(row, value);
            });
        }
    },

    /* table Pagination */
    tablePaginationElems: 0, tablePaginationPage: $(), tablePaginationActualPage: 0, tablePaginationLines: [], tablePaginationMaxPages: 0,

    _refreshTablePagination: function () {
        var _self = this;
        this.tablePaginationElems = this.el.find(".line.filtered").not(".head").length;

        this.tablePaginationActualPage = (this.tablePaginationActualPage < 0) ? 0 : this.tablePaginationActualPage;
        this.tablePaginationActualPage = ((this.tablePaginationActualPage + 1) > Math.ceil(this.tablePaginationElems / this.options.tablePagination)) ? Math.ceil(this.tablePaginationElems / this.options.tablePagination) - 1 : this.tablePaginationActualPage;

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

        this.tablePaginationPage.html(this.options.tableLabels[1].toString().replace("#NUM", this.tablePaginationActualPage + 1).replace("#TOT", Math.ceil(this.tablePaginationElems / this.options.tablePagination)));

    },

    _setUptable: function () {
        this._bindEventstable();
    },

    _bindEventstable: function () {
        var _self = this;

        $(window).resize(function () { _self.el.triggerHandler("resizeTable") });
        this.el.on("resizeTable", function () { _self.actionUpdate(500); setTimeout(function () { _self._tableSetColWidth(); }, 501); });

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

/* 
JQUERY OBJECT: tableExtended
Properties:
*/

$(function () {
    $.fn.tableExtended = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new tableExtended(options, this);
                $.data(this, 'tableExtended', myObj);
            });
        }
    };
});

/* *****************************************************************************************************************/
/*  								DROPDOWN INSIDE BALLOON														   */
/* *****************************************************************************************************************/
var dropdownBalloon = validator.extend({

    constructor: function (options, elem) {
        this.options = $.extend({}, this.options,
            /* private default object settings */
            {

            }
        );
        this.base(options, elem);
        this.dropdownOnChange = this.el.attr("onchange");
        this.el.attr("onchange", "");
        this.wrapper.addClass(this.options.idPrefix + "dropdownBalloon");
        this.list = new base2.Collection();
        this._getVaulesFromEl();
        this._createListWrapper();
        this._createTitle();
        this._createList();
        this.dropDownScroller = new scroller({ scrollRange: 119, scrollbarRange: 8 }, this.dropdown);

        this._setUpDropDown();

    },

    dropdownOnChange: "",

    list: new base2.Collection(),

    _itemHeight: 0,

    _getVaulesFromEl: function () {
        var _self = this;
        this.el.find('option').each(function () {
            if (typeof _self.list.get($(this).val()) == "undefined") {
                _self.list.add($(this).val(), $(this).html());
            } else {
                _self.log("duplicate key on select: " + $(this).val() + " " + $(this).html())
            }
        });
    },

    _createTitle: function () {
        this.dropdownTitle = $('<div class="dropdown-title">&nbsp;</div>');
        this.dropdownTitle.width(this.el.width());
        this.el.addClass("hide");
        this.el.after(this.dropdownTitle);
    },

    _createListWrapper: function () {
        this.dropdown = $('<ul class="dropdown-wrapper" />');
        this.dropdown.width("96%");
    },

    _createList: function () {
        var _self = this;

        this.list.forEach(function (value, key, obj) {
            var li = $('<li data-key="' + key + '">' + value + '</li>');
            li.click(function (e) {
                _self.log("click on item");
                e.stopPropagation();
                e.preventDefault();
                _self.el.val($(this).attr("data-key"));
                _self.dropdownTitle.html(_self.list.get($(this).attr("data-key")));
                _self.el.triggerHandler("change");
                _self.el.focus();
                setTimeout(function () { _self.el.removeClass("active"); eval(_self.dropdownOnChange); }, 20);
            });
            li.mouseenter(function () {
                _self.log("mouseenter on item " + key);
                _self.dropDownScroller.wrapper.find("li.itemHover").removeClass("itemHover");
                $(this).addClass("itemHover");
            });
            _self.dropdown.append(li);
        });
    },

    _highlightSelectedItem: function () {
        this.dropDownScroller.wrapper.find("li.itemHover").removeClass("itemHover");
        this.dropDownScroller.wrapper.find("li[data-key='" + this.el.val() + "']").addClass("itemHover");
    },

    _scrollToSelected: function () {
        this._itemHeight = this.dropdown.find("li").first().outerHeight();
        this.dropDownScroller.scrollTo(-this.list.indexOf(this.el.val()) * this._itemHeight, (this.dropDownScroller.options.scrollerRange - this._itemHeight) / 2);
    },

    _keyPressDropDown: function (e) {
        if (e.keyCode == this.keyCodes.ENTER) {
            this.el.removeClass("active");
        }
    },

    _bindDropdownEvents: function () {
        var _self = this;
        //this.dropdownTitle.mouseover(function () { _self.el.trigger("mouseover") });
        //this.dropdownTitle.mouseleave(function () { _self.el.trigger("mouseleave") });

        _self.wrapper.click(function () {
            _self.log("click on dropdown");
            _self.el.focus();
        });

        _self.el.focus(function () {
            $(document).keydown(function (e) { _self._keyPressDropDown(e) });
        });

        _self.el.blur(function () { $(document).unbind("keydown"); });

        _self.el.on("change keyup", function (e) {
            if (e.keyCode == _self.keyCodes.ENTER)
                eval(_self.dropdownOnChange);
            _self.log("change on dropdown");
            _self._highlightSelectedItem();
            _self._scrollToSelected();
            _self.dropdownTitle.html(_self.list.get(_self.el.val()));
        });

        _self.el.bind("addClass", function () {
            _self.log("refresh dropdown scroller");
            _self._highlightSelectedItem();
            _self.dropDownScroller.refreshScroller();
            _self._scrollToSelected();
        });

        _self.dropDownScroller.wrapper.mouseleave(function () {
            _self.log("mouseleave from dropdown list");
            _self._highlightSelectedItem();
        });

    },
    /****************** implementation for validation ********************/
    validationTrigger: function () {
        var _self = this;
        this.el.bind("change", function (e) {
            _self.el.trigger("validate");
        });
    },
    /****************** end implementation for validation ********************/

    _setUpDropDown: function () {
        this.dropdownTitle.html(this.list.get(this.el.val()));
        this.balloonItem.html(this.dropDownScroller.wrapper);

        //set the status of the element
        if (this.el.attr("disabled") != "disabled")
            this._bindDropdownEvents();

        ////add the class for opacity on disabled
        if (this.el.attr("disabled") == "disabled")
            this.wrapper.addClass("disabled");

    },

    /* refresh the graphics element */
    refresh: function () {
        this.base();
        this.list.clear();

        this._getVaulesFromEl();
        this.dropdown.empty();
        this.el.removeClass("hide");
        this._createListWrapper();
        this.el.addClass("hide");
        this._createList();
        this.dropDownScroller = new scroller({ scrollerRange: 119 }, this.dropdown);
        this._setUpDropDown();


    }

});
dropdownBalloon.implement(Ivalidator);
/* 
JQUERY OBJECT: dropdown
Scroller (vertical/horizontal) 
Properties:
*/

$(function () {
    $.fn.dropdownBalloon = function (/* (object) properties will be merge into jQuery component settings */ options) {
        if (this.length) {
            return this.each(function () {
                var myObj = new dropdownBalloon(options, this);
                $.data(this, 'dropdownBalloon', myObj);
            });
        }
    };
});