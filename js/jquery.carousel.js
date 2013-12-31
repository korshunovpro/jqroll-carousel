/**
 * jQuery.carousel
 *
 * @author sergey@korshunov.pro
 *
 *
 * @todo: генерация служебных оберток и стрелок
 * @todo: названия классов и id вынести в настройки
 * @todo: доделать для ограниченной прокрутки, с проверкой наличие элементов
 *
 */
(function ($) {

    'use strict';

    /**
     * Default settings
     * @type {{maxRoll: number, midPoint: number, itemWidth: boolean, navRoll: number, defSpeed: number, playSpeed: number, autoPlay: boolean, easing: string}}
     */
    var defaults = {
            maxRoll:    2,
            midPoint:   1,
            itemWidth:  false,
            navRoll:    1,
            defSpeed:   500,
            playSpeed:  4000,
            autoPlay:   true,
            rewind: true
    }, main, opt, elemCount, elemCount2, leftIndent, rollSpeed = false, rollCount = 1, clickOff = true, carousel;


    /**
     * Main
     * @type {carousel}
     */
    carousel = $.fn.carousel = function (settings) {
        main = this;
        opt = $.extend({}, defaults, settings);

        // defaults opts check
        rollSpeed = rollSpeed || opt.defSpeed;
        opt.itemWidth = opt.itemWidth || $('#jqRollInner>li:first', main).outerWidth();

        if (opt.easing !== 'swing' && (opt.easing in jQuery.easing) === false ) {
            opt.easing = 'swing';
        }

        /**
         * @todo: возможно элементами сделать любых прямых детей
         * кол-во элементов
         */
        elemCount = $('#jqRollInner>li', main).size();


        return this.each(function () {

            if(opt.rewind === true) {
                carousel.rewind();
            }

            carousel.addItem();

            $('#jqRollInner', main).on("click", 'li', function () {

                if (clickOff === false || $(this).hasClass('select')) {
                    return false;
                }

                var pos = $(this).index() - opt.maxRoll;
                rollCount = pos - opt.midPoint + 1;
                rollSpeed = opt.defSpeed;
                if (rollCount > 0) {
                    carousel.Roll('next');
                }
                if (rollCount < 0) {
                    rollCount = Math.abs(rollCount);
                    carousel.Roll('prev');
                }
            });

            $(main).on('click', '#jqRollNext', function () {
                if (clickOff === false) {
                    return false;
                }
                carousel.Roll('next');
            });

            $(main).on('click', '#jqRollPrev', function () {
                if (clickOff === false) {
                    return false;
                }
                carousel.Roll('prev');
            });

            if (opt.autoPlay === true) {
                carousel.autoPlay();
            }

        });
    };

    /**
     * Start autoplay
     */
    carousel.autoPlay = function () {
        var run = setInterval(fwd, opt.playSpeed);

        function fwd() {
            $('#jqRollNext', main).click();
        }

        main.hover(function () {
            clearInterval(run);
        }, function () {
            run = setInterval(fwd, opt.playSpeed);
        });
        return;
    };

    /**
     * First element to mid position
     */
    carousel.rewind = function () {
        var selectIndex = $('#jqRollInner .select', main).index() + 1;
        var rewind = false;

        if (opt.midPoint !== false) {
            var shift = opt.midPoint - selectIndex;

            rewind = ( shift < 0 );

            shift = Math.abs(shift);
            for (var i = 1; i <= shift; i++) {
                if (rewind === true) {
                    $('#jqRollInner li:last', main).after($('#jqRollInner li:first', main));
                } else {
                    $('#jqRollInner li:first', main).before($('#jqRollInner li:last', main));
                }
            }
        } else {
            opt.midPoint = 0;
        }
    };

    /**
     * Add invisible items to before and after
     */
    carousel.addItem = function () {

        for (var i = 0; i < opt.maxRoll; i++) {
            $('#jqRollInner li:first', main)
                .before($('#jqRollInner li', main).eq(elemCount - 1)
                    .clone()
                    .removeClass('select'));
        }

        elemCount2 = elemCount + opt.maxRoll;
        for (var j = 0; j < opt.maxRoll; j++) {
            $('#jqRollInner li:last', main)
                .after($('#jqRollInner li', main).eq(elemCount2 - elemCount)
                    .clone()
                    .removeClass('select'));
           elemCount2++;
        }

        leftIndent = -1 * ( opt.maxRoll * opt.itemWidth );
        $('#jqRollInner', main).css({'left': leftIndent + 'px'});
    };

    /**
     * Roll action
     *
     * @param stream
     * @constructor
     */
    carousel.Roll = function (stream) {
        clickOff = false;

        var k = 1;
        if (stream === 'prev') {
            k = -1;
        }

        var prevItem = $('#jqRollInner .select', main).removeClass('select');
        var selectIndex = prevItem.index();
        var nextItem = $('#jqRollInner li', main).eq(selectIndex + k * rollCount).addClass('select');

        var offset = leftIndent - k * ( rollCount * opt.itemWidth );
        $('#jqRollInner', main).animate({'left': offset}, {
            duration: rollSpeed,
            easing: opt.easing,
            complete: function () {
                if (stream === 'prev') {
                    for (var i = 0; i < rollCount; i++) {
                        $('#jqRollInner li:first', main)
                            .before($('#jqRollInner li', main).eq(elemCount - 1)
                                .clone());

                        $('#jqRollInner li:last', main).remove();
                    }
                } else {
                    for (var j = 0; j < rollCount; j++) {
                        $('#jqRollInner li:last', main)
                            .after($('#jqRollInner li', main).eq(elemCount2 - elemCount)
                                .clone());

                        $('#jqRollInner li:first', main).remove();
                    }
                }
                $('#jqRollInner', main).css({'left': leftIndent + 'px'});
                rollCount = opt.navRoll;
                clickOff = true;
                rollSpeed = opt.defSpeed;
            }
        });
        return;
    };

})(jQuery);
