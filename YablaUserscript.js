// ==UserScript==
// @name         Yabla++
// @namespace    Yabla
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://chinese.yabla.com/vocabulary-flashcard-review.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yabla.com
// @grant        none
// @run-at document-end
// ==/UserScript==

const html = `<div id="main" class="">
    <div class="mobile_top">
        <div class="actions">
            <table>
                <tbody>
                    <td class="settings show_settings"><i class="fa fa-gear"></i></td>
                    <td class="mid">
                        <div class="center_info">
                            <div class="row">
                                <div class="progress_label">Progress</div>
                                <div class="word_complete_label">X of Y words learned</div>
                            </div>
                            <div class="overall_progress">
                                <div class="bar"></div>
                            </div>
                        </div>
                    </td>
                    <td class="exit_btn"><i class="fa fa-close"></i></td>
                </tbody>
            </table>
        </div>
        <div class="progress timer">
            <div class="bar"></div>
        </div>
    </div>
    <div id="main_exit" class="exit_btn">
        <i class="fa fa-close"></i>
        <span>Exit</span>
    </div>
    <div id="left_col">
        <div id="controls">
            <a href="#" class="show_settings btn yabla-blue">
                <i class="fa fa-gear"></i> Settings </a>
        </div>
        <div id="progress">
            <h3>Overall Progress</h3>
            <div id="progress_container">
            </div>
        </div>
        <div id="timer">
            <h3>Time Remaining</h3>
            <div>
                <div class="timer timer_26_275">
                    <div class="fill_seg red"></div>
                    <div class="fill_seg red"></div>
                    <div class="fill_seg yellow"></div>
                    <div class="fill_seg yellow"></div>
                    <div class="fill_seg yellow"></div>
                    <div class="fill_seg yellow"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                    <div class="fill_seg"></div>
                </div>
                <i class="fa fa-close timer_remove"></i>
            </div>
            <div class="pause_cont">
                <a href="#" class="pause btn yabla-blue">
                    <i class="fa fa-pause"></i> Pause </a>
            </div>
        </div>
        <div id="queue_state">
            <h3>Vocabulary Queue</h3>
            <div id="queue_container">
            </div>
        </div>
    </div>
    <div id="right_col">
        <div id="spell_question" class="spell_question" style="display:none">
            <h2>Word will be placed here</h2>
            <div class="correction">
                <span class="label">the correct answer is</span> <span class="correct">ZZZZ</span>
                <i class="fa fa-volume-up"></i>
            </div>
            <div class="response_section">
                <div id="ipad_tones">
                    <button class="tone1">ˉ</button> <button class="tone2">ˊ</button> <button class="tone3">ˇ</button>
                    <button class="tone4">ˋ</button> <button class="tone5">&nbsp;</button>
                </div>
                <div>
                    <input type="text" class="response" lang="zh_CN" autocapitalize="off" autocorrect="off"
                        autocomplete="randomworksbetter" spellcheck="false" />
                </div>
                <div class="bottom_spell_row">
                    <div class="minikeyboard_container"> </div>
                    <div class="dont_know">I don't Know</div>
                </div>
                <div class="continue_row">
                    <button class="spell_continue btn yabla-blue">Continue</button>
                </div>
            </div>
        </div>
        <div id="image_question" class="spell_question" style="display:none">
            <h2>Word will be placed here</h2>
            <div class="correction">
                <span class="label">the correct answer is</span> <span class="correct">ZZZZ</span>
                <i class="fa fa-volume-up"></i>
            </div>
            <div class="response_section">
                <div id="ipad_tones">
                    <!--This might be problematic having dupe id here and dupe buttons?-->
                    <button class="tone1">ˉ</button> <button class="tone2">ˊ</button> <button class="tone3">ˇ</button>
                    <button class="tone4">ˋ</button> <button class="tone5">&nbsp;</button>
                </div>
                <div>
                    <input type="text" class="response" lang="zh_CN" autocapitalize="off" autocorrect="off"
                        autocomplete="randomworksbetter" spellcheck="false" />
                </div>
                <div class="bottom_spell_row">
                    <div class="minikeyboard_container"> </div>
                    <div class="dont_know">I don't Know</div>
                </div>
                <div class="image_row">

                </div>
                <div class="continue_row">
                    <button class="spell_continue btn yabla-blue">Continue</button>
                </div>
            </div>
        </div>
        <div class="choice_question">
            <h2>
                <span class="choice_text"></span>
            </h2>
            <div class="response_group clearfix">
                <ul>
                </ul>
            </div>
        </div>

        <div class="speech_question">
            <h2>
                <span class="speech_prompt">Say this word</span>
                <i class="fa fa-volume-up"></i>
            </h2>
            <div class="speech_meaning">Word Means This</div>
            <div class="speech_response">
                <div class="rec rec_alt_1">blah</div>
                <div class="rec rec_alt_2">bleg</div>
                <div class="rec rec_alt_3">blue</div>
                <div class="rec_result correct">blank</div>
            </div>
            <div class="speech_buttons">
                <button class="btn yabla-blue continue">Continue</button>
                <button class="btn skip">Skip</button>
            </div>
            <div class="speech_controls">
                <div class="start_microphone">
                    <i class="fa fa-microphone"></i>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="overlay_mask"> </div>
<div id="pause_overlay" class="overlay">
    Paused</div>
<div id="settings_overlay" class="overlay">
    <h2>Settings</h2>
    <div class="setting_row">
        <span class="setting_name">Term Queue Size</span>
        <select name="queue_size">
            <option value="3">3 (shabi)</option>
            <option value="10">10</option>
            <option value="50">50 (bucuo)</option>
            <option value="100">100 (niubi)</option>
            <option value="500">500 (wocao)</option>
            <option value="666">666 (liuliuliu)</option>
        </select> words
    </div>
    <div class="setting_row">
        <span class="setting_name">Typing Tones</span>
        <label>
            <input type="radio" name="ignore_accents" id="ignore_accents1" value="1">
            Ignore tones
        </label>
        <label>
            <input type="radio" name="ignore_accents" id="ignore_accents0" value="">
            Require correct tones
        </label>
    </div>
    <div class="setting_row">
        <span class="setting_name">Timer</span>
        <label>
            <input type="radio" name="show_timer" id="show_timer1" value="1"> Show Timer </label>
        <label>
            <input type="radio" name="show_timer" id="show_timer0" value=""> Disable Timer </label>
    </div>
    <div class="setting_row">
        <span class="setting_name">Sound Effects</span>
        <label>
            <input type="radio" name="play_sfx" id="play_sfx1" value="1"> On </label>
        <label>
            <input type="radio" name="play_sfx" id="play_sfx0" value=""> Off </label>
    </div>
    <div class="setting_row set_char_type">
        <span class="setting_name">Simplified vs Traditional</span>
        <label>
            <input type="radio" name="show_traditional" id="show_traditional0" value="" />
            Show only Simplified </label>
        <label>
            <input type="radio" name="show_traditional" id="show_traditional1" value="1">
            Show Simplified and Traditional </label>
    </div>
    <div class="setting_row">
        <a href="#" class="btn fill green save">Save</a> <a href="#" class="cancel">Cancel</a>
    </div>

</div>
<div id="win_overlay" class="overlay">
    <h1>Congratulations!</h1>
    <h2>You have reviewed the vocabulary</h2>

    <a href="vocabulary.php">Return to Word List</a>
</div>
<div id="preview_overlay" class="overlay">
    <h1>Vocabulary Review</h1>

    <p>In this exercise you will review the following words:</p>
    <ul class="terms">
    </ul>
    <a href="#" class="start_game">Start Review</a>
    <div id="type_selector_placeholder"></div>
</div>`;
(function () {

styles = `.image_row {
    display: flex;
}`;
var styleSheet = document.createElement('style')
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

///// methods at beginning, probably don't need to touch much
//#region begin
'use strict';
document.querySelector("body").innerHTML = html;

function hideDropdowns() {
    $('.dropdown').hide();
    edMenuDismiss(true);
}
$('header .user').on('click touchend', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $user_dd = $('header .user-dropdown');
    if ($user_dd.is(':visible')) {
        $(window).off('.user-dd');
        $user_dd.hide();
        return;
    }
    hideDropdowns();
    $user_dd.show();
    $(window).on('click.user-dd touchend.user-dd', function (e) {
        console.log("window click ");
        console.log(e);
        if ($(e.target).closest('.dropdown').length) {
            console.log("event contains target");
            return;
        }
        $user_dd.hide();
        $(window).off('.user-dd');
    });
});
$('header .select-lang').on('click touchend', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $lang_dd = $('header .lang-dropdown');
    if ($lang_dd.is(':visible')) {
        $(window).off('.lang-dd');
        $lang_dd.hide();
        return;
    }
    hideDropdowns();
    $lang_dd.show();
    $(window).on('click.lang-dd touchend.lang-dd', function (e) {
        if ($(e.target).closest('.dropdown').length) return;
        $lang_dd.hide();
        $(window).off('.lang-dd touchend.lang-dd');
    });
});
$('header .translate-link').on('click touchend', function (e) {
    e.stopPropagation();
    var $translate_dd = $('header .translate-dropdown');
    if ($translate_dd.is(':visible')) {
        $(window).off('.lang-dd');
        $translate_dd.hide();
        return;
    }
    hideDropdowns();
    $translate_dd.show();
    $(window).on('click.trans-dd touchend.trans-dd', function (e) {
        if ($(e.target).closest('.dropdown').length) return;
        $translate_dd.hide();
        $(window).off('.trans-dd');
    });
});
$('header .mobile_slide').on('touchend click', function (e) {
    e.stopPropagation();
});
$('header .mobile_slide .close_link').on('touchend click', function () {
    $('header .mobile_slide').removeClass('active');
    $('body').off('.burger');
});
$('header #site-hamburger').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('header .mobile_slide').addClass('active');
    $('body').on('touchend.burger click.burger', function (e) {
        if ($(e.target).closest('.mobile_slide').length) {
            return;
        } else {
            $('header .mobile_slide').removeClass('active');
            $('body').off('.burger');
        }
    });
});
$('.ed_menu_btn').on('click touchend', function (e) {
    e.stopPropagation();
    e.preventDefault();

    if ($(this).hasClass('showing')) {
        edMenuDismiss();
    } else {
        hideDropdowns();
        edMenuShow();
        $('body').on('click.ed_cancel touchend.ed_cancel', function (e) {
            if ($(e.target).closest('#modal_master').length) {
                return;
            }

            edMenuDismiss();
            $(this).off('.ed_cancel');
        });
    }
})

$('.ed_menu').find('a').on('click touchend', function (e) {
    e.stopPropagation();
}).end()

var ed_interval;
var history_pushes = 0;
function edMenuShow() {
    if (history_pushes == 0) {
        window.history.pushState({ action: 'ed_menu_show' }, 'Educators Menu');
        history_pushes++;
        $(window).on('popstate.ed_pop', function (e) {
            history_pushes--;
            edMenuDismiss();
        });
    }

    clearTimeout(ed_interval);
    $('.ed_menu').show().stop().removeClass('hiding');
    $('.ed_menu_btn').addClass('showing');
    // refresh if expired...
    $.get('ed_menu_check.php',
        { last_changed_at: $('.ed_menu').data('last_changed_at') },
        function (data) {
            if (data.html) {
                // a bit ugly, but prevents flickering
                $('.ed_menu .ed_menu_inner').replaceWith($(data.html).find('.ed_menu_inner'));
            }

        });
}
function edMenuDismiss(fast) {
    //
    if (history_pushes == 1) {
        window.history.back();
        return;
    }
    $('.ed_menu').addClass('hiding');
    ed_interval = setTimeout(function () {
        $('.ed_menu').hide();
    }, fast ? 0 : 400)

    $('.ed_menu_btn').removeClass('showing');
    $(window).off('.ed_pop');

}
$('.ed_menu .invite').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $dialog = $('.ed_code_signup')
        .addClass('hide_teacher_text hide_student_text')
        .removeClass('hide_' + $(this).data('user_type') + '_text');

    $dialog.find('[name=code_url]').val($(this).data('url'));
    $dialog.find('.text_code').text($(this).data('code'));
    Modal_Master.show($('.ed_code_signup'));
    $dialog.find('[name=code_url]').focus();
})

// exit button
$('.exit_btn').on('click', function () {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.replace("./videos.php");

    }
});

if (IS_TOUCH_DEVICE) {
    $('body').addClass('is_touch_device');
}
$('.video_link, td.play_btn').on('click', function (e) {
    e.preventDefault();
    window.location.replace($(this).attr('href'));
});

var Mask = {}
$.extend(Mask, event_mixin);
$.extend(Mask, {
    init: function () {
        this.$e = $('#overlay_mask');
        this.initialized = true;
        var self = this;
        // debounced resize

        ////////////////////////////////// MAYBE NEED TO CLEAR ORIGINAL HANDLERS ON WINDOW
        var t;
        $(window).resize(function () {
            clearTimeout(t);
            t = setTimeout(function () {
                self.resize();
            }, 100);
        });
    },
    show: function () {
        if (!this.initialized)
            this.init();
        this.resize().$e.show();
        return this;
    },
    resize: function () {
        var vis = this.$e.is(':visible');
        this.$e.hide();
        this.$e.css(
            {
                width: Math.max($('body').outerWidth(), $(document).width()),
                height: Math.max($(document).height(), $(window).height())
            }
        );
        this.$e[vis ? "show" : "hide"]();
        return this;
    },
    hide: function () {
        this.$e.hide();

        return this;
    }
});

var Timer = $.extend({}, event_mixin);
$.extend(Timer, {
    init: function ($elem, $mobile_elem) {
        this.opts = {
            poll_resolution: 200,
            view_segments: 16
        };
        this.timed_out_ = false;
        this.last_time_ = (new Date()).getTime();

        this.$e = $elem;
        this.$mobile_elem = $mobile_elem;

        var me = this;
        this.$e.find('.timer_remove').on('click', function () {
            settingsManager.set('show_timer', 0);
            me.disable();
        });
        this.$e.find('.pause').bind(CLICK, function (e) {
            e.preventDefault();
            me.pauseClick();
        });
        setInterval(function () {
            me.poll_();
        }, this.opts.poll_resolution);
        return this;
    },
    pause: function () {
        if (!this.paused && !this.disabled) {
            this.paused = true;
            this.trigger('pause');
        }
        return this;
    },
    resume: function () {
        if (this.paused && !this.disabled) {
            this.paused = false;
            this.trigger('resume');
        }
        return this;
    },
    pauseClick: function () {
        Mask.show();

        this.pause();
        $('#pause_overlay').show().positionAbsolute(.5, .33);
        $('#pause_overlay, #overlay_mask').bind(CLICK, $.proxy(this.pauseOver, this));

    },
    pauseOver: function () {
        Mask.hide();
        $('#pause_overlay').hide();
        $('#pause_overlay, #overlay_mask').unbind(CLICK);
        this.resume();
    },
    disable: function () {
        if (!this.disabled) {
            this.disabled = true;
            this.hide_();
        }
        return this;
    },
    enable: function () {
        if (this.disabled) {
            this.disabled = false;
            this.show_();
            this.reset_();
            this.resume();
        }
        return this;
    },
    start: function (duration) {
        this.timer_length_ = duration;
        this.reset_();
        this.resume();
        return this;
    },
    hide_: function () {
        this.$e.hide();
        this.$mobile_elem.hide();
    },
    show_: function () {
        this.$e.show();
        this.$mobile_elem.show();
    },
    reset_: function () {
        this.remaining_ = this.timer_length_;
        this.last_time_ = (new Date()).getTime();
        this.timed_out_ = false;
        this.render_();
        return this;
    },
    poll_: function () {

        var elapsed = (new Date()).getTime() - this.last_time_;
        this.last_time_ = (new Date()).getTime();

        if (this.disabled || this.paused) {
            return;
        }

        if (!this.paused) {
            this.remaining_ -= elapsed;
        }

        this.remaining_ = Math.max(this.remaining_, 0);
        this.render_();

        if (this.remaining_ == 0 && !this.timed_out_ && !this.disabled) {
            this.timed_out_ = true;
            this.trigger('timeout');
        }

    },
    render_: function () {
        var p = this.remaining_ / this.timer_length_;
        p = $.clamp(p, 0, 1);
        if (this.opts.view_segments)
            var num_segs = Math.round(p * this.opts.view_segments);
        this.$e.find('.fill_seg').hide().slice(0, num_segs).show();
        $('.mobile_top .timer .bar')
            .css({ width: ((p * 100) + '%') })
            .css('background-color', this.colorForRemaining_(p));
    },
    colorForRemaining_: function (p) {
        if (p < 2.0 / 16) {
            return '#a00';
        }
        if (p < 6.0 / 16) {
            return '#F2CC4E';
        }
        return '#0a0';
    }
});
//#endregion begin
//#region ChoiceQuestion
function ChoiceQuestion($elem, opts) {
    opts = $.extend(
        {
            wait_after_correct: 1000,
            wait_after_incorrect: 4000,
            other_choice: false,
            dont_know_choice: true
        }, opts || {})
    this.init($elem, opts);
}
$.extend(ChoiceQuestion.prototype, event_mixin, display_mixin);
$.extend(ChoiceQuestion.prototype, {
    init: function ($elem, opts) {
        this.$e = $elem;
        this.opts = opts;
        this.state = 'INIT';
        this.initKeypressHandler();
        Timer.bind('timeout', this.onTimeOut.bind(this));

    },
    initKeypressHandler: function () {
        var me = this;
        //////////////////////////////////////////////////////// WE MAY NEED TO UNBIND THIS FIRST
        $(document).on('keypress.choice_question', function (e) {
            if (me.state !== 'PENDING_ANSWER') return;
            if (e.which >= 49 && e.which <= 54) {
                var li_index = e.which - 49;
                var $li = me.$e.find('li').eq(li_index);
                $li.trigger('click');
            }
        })
    },
    setChoices: function (word, choices, correct, audio) {

        this.$e.find('h2')
            .find('.choice_text')
            .html(word)
            .append('<i class="fa fa-volume-up"></i>')
            .end()
            .off('click')
            .addClass(audio ? 'has_audio' : 'no_audio')
            .bind('click', function (e) {
                e.preventDefault();
                audio && audio.play();
            });

        var self = this;
        var $c, h = 1;
        var $ul = this.$e.find('ul').empty();
        for (var i in choices) {
            $c = $('<li />')
                .html('<div>' + choices[i] + '</div>')
                .data('is_correct', (choices[i] == correct))
                .appendTo($ul)
        }

        if (this.opts.other_choice) {
            var li = $ul.find('li:last');
            li.data('hidden_correct', li.text())
                .text('Not Listed')
                .appendTo($ul)
        }

        if (this.opts.dont_know_choice) {
            $('<li />')
                .text('I Don\'t Know')
                .addClass('dont_know')
                .appendTo($ul)

        }
        $ul.find('li').on('click', this.handleClick.bind(this))
        $(document).on('keypress.choice')

        this.state = 'PENDING_ANSWER';
        Timer.start(12000);

        audio && audio.play();
        return this;
    },
    show: function () {
        this.$e.show();
        this.$e.find('ul li').each(function () {
            var $li = $(this);
            var $div = $li.find('div');
            var h = 1;
            while ($li.height() < $div.outerHeight() && h > .6) {
                h = h * .9;
                $div.css('font-size', h * 100 + '%');
            }
        });
        return this;
    },
    handleClick: function (e) {

        e.preventDefault();
        var $elem = $(e.target).closest('li');
        if (this.state != 'PENDING_ANSWER')
            return;
        Timer && Timer.pause();
        var $correct_elem = this.getAndHightlightCorrectElement();

        var r;
        // three cases correct, incorrect, don't know
        if ($elem.data('is_correct')) {

            r = { correct: true, dont_know: false };
            settingsManager.get('play_sfx') && AudioPlayer.correct.play();
        } else if ($elem.hasClass('dont_know')) {
            r = { correct: false, dont_know: true };
        } else {
            $elem.addClass('incorrect')
            r = { correct: false, dont_know: false };
            settingsManager.get('play_sfx') && AudioPlayer.incorrect.play();
        }
        this.state = 'SHOWING_CORRECT';
        this.trigger('response', r)
        var extend_ms = $correct_elem.data('hidden_correct') ? 1000 : 0; // if it is other / not listed, let's show the correct answer for a bit longer.
        this.flashShowCorrect((r.correct ? 1000 : 2000) + extend_ms);
    },
    flashShowCorrect: function (msec) {
        var me = this;
        setTimeout(function () {
            me.trigger("showCorrectComplete")
        },
            msec
        );
    },
    getAndHightlightCorrectElement: function () {
        var r;
        this.$e
            .find('li')
            .each(function () {
                if ($(this).data('is_correct')) {
                    r = $(this).addClass('correct');
                    if ($(this).data('hidden_correct'))
                        $(this).text($(this).data('hidden_correct'));
                }

            });
        return r;
    },
    onTimeOut: function () {
        if (this.state != 'PENDING_ANSWER')
            return;

        this.state = 'SHOWING_CORRECT';
        this.trigger('response', { timeout: true });
        var $ce = this.getAndHightlightCorrectElement();
        this.flashShowCorrect(2000);
    }
});
//#endregion ChoiceQuestion
//#region SpellQuestion
function SpellQuestion($elem, opts) {
    opts = $.extend(
        {
            timer: null,
            wait_after_correct: 850,
            wait_after_incorrect: 3000,
            lang_id: '',
            case_sensitive: false,
            ignore_accents: true,
            ignore_regexp: /[\.\s\-;:]/g

        }, opts || {})
    this.init($elem, opts);
}
$.extend(SpellQuestion.prototype, {
    init: function ($elem, opts) {
        this.opts = opts;
        this.$e = $elem;
        this.$input = this.$e.find('.response');
        var me = this;

        Timer.bind('timeout', $.proxy(this.onTimeOut, this));

        this.$e.find('.dont_know').bind(CLICK, $.proxy(this.onDontKnow, this));

        // mobile logic
        if (this.opts.lang_id) {
            this.mk = new MiniKeyboard(
                this.$e.find('.response'),
                $('.minikeyboard_container'),
                this.opts.lang_id);
        }
        if (this.opts.lang_id == 'zh_CN' && IS_TOUCH_DEVICE) {
            this.tk = new iPadToneKeys(this.$input, this.$e.find('#ipad_tones'));
        } else {
            this.$e.find('#ipad_tones').remove();
        }

        this.$input.bind("input", function (e) {
            me.onChange();
        }).on("keypress", function (e) {
            if (e.keyCode == 13) {
                me.onEnter();
            }
        });

        this.$e.find('.spell_continue').on(CLICK, function () {
            me.triggerComplete();
        });

    },
    setValues: function (question, answer, audio, placeholder) {
        this.answer = answer;
        this.audio = audio;
        this.$e.find('h2').text(question);
        this.$input.val('').removeClass('correct incorrect').focus();
        if (IS_TOUCH_DEVICE) {
            $(window).scrollTop($('.mobile_top .actions').outerHeight());
        }
        this.state = 'PENDING_ANSWER';
        this.$input.attr('placeholder', placeholder || '');
        Timer.start(33000);
        this.$e.find('.correction').css({ visibility: 'hidden' });

        this.$e.find('.continue_row').hide();
        this.$e.find('.bottom_spell_row').show();

        return this;
    },

    onEnter: function () {

        if (this.state != 'PENDING_ANSWER')
            return;

        Timer && Timer.pause();

        var r;
        var self = this;

        if (this.compare(this.$input.val(), this.answer)) {
            settingsManager.get('play_sfx') && AudioPlayer.correct.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 500);
            this.flashGoodJob(3500);
            r = { correct: true };
        } else {
            settingsManager.get('play_sfx') && AudioPlayer.incorrect.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 300);
            this.flashShowCorrect(5000);
            r = { correct: false };
        }
        this.trigger('response', r);

        // this must come at the end, because it triggers a change event.
        if ('ontouchstart' in window || !Timer.disabled) {
            this.$input.blur();  // hide the ipad keyboard
        }


    },
    onChange: function () {
        // cleanup funky quotes
        var val = this.$input.val();
        var val_clean = $.replaceFunkyQuotes(val);
        if (val != val_clean) {
            this.$input.val(val_clean);
            return this.onChange();
        }


        if (this.compare(this.$input.val(), this.answer)) {
            this.onEnter();  // press the enter key for them.
        }
    },
    onTimeOut: function () {
        if (this.state != 'PENDING_ANSWER')
            return;

        this.flashShowCorrect(3000);
        this.trigger('response', { timeout: true })
    },
    onDontKnow: function () {
        Timer && Timer.pause();

        this.trigger('response', { dont_know: true });
        this.flashShowCorrect(3500);
    },
    flashShowCorrect: function (msec) {
        var me = this;
        this.state = 'SHOWING_CORRECT';
        this.$input.addClass('incorrect');
        this.$e.find('.correction .correct')
            .text(this.answer)
            .parent().css({ visibility: 'visible' })
            .addClass(me.audio ? 'has_audio' : 'no_audio')
            .off('click')
            .on('click', function (e) {
                e.preventDefault();
                me.audio && me.audio.play();
            });
        var me = this;
        if (Timer.disabled) {
            this.$e.find('.continue_row').show()
                .find('.spell_continue').trigger('focus');

            this.$e.find('.bottom_spell_row').hide();
        } else {
            setTimeout(function () {
                me.triggerComplete()
            },
                msec
            );
        }

    },
    flashGoodJob: function (msec) {
        this.state = 'SHOWING_CORRECT';
        this.$input.val(this.answer);
        this.$input.addClass('correct');
        var me = this;
        setTimeout(function () {
            me.triggerComplete()
        },
            msec
        );
    },
    triggerComplete: function () {
        if (this.state !== 'DONE') {
            this.state = 'DONE';
            this.trigger("showCorrectComplete");
        }
    },
    _accentRegexps: [
        [/[àâäåãáāǎ]/g, 'a'],
        [/[æ]/g, 'ae'],
        [/[ç]/g, 'c'],
        [/[éèēěêë]/g, 'e'],
        [/[ïîìíīǐ]/g, 'i'],
        [/[ñ]/g, 'n'],
        [/[öôóòōǒõ]/g, 'o'],
        [/[œ]/g, 'oe'],
        [/[ùûüúūúǔ]/g, 'u'],
        [/[ǖǘǚǜü]/g, 'ü']
    ],
    removeAccents: function (s) {
        for (var i in this._accentRegexps) {
            s = s.replace(this._accentRegexps[i][0], this._accentRegexps[i][1]);
        }
        return s;
    },
    removeOuterPunction: function (s) {
        s = s.replace(/^[\.\?¿¡'"]+/, '');
        s = s.replace(/[\.\?¿¡'"]+$/, '');
        return s;
    },
    compare: function (a, b) {
        a = this.removeOuterPunction(a.toLowerCase());
        b = this.removeOuterPunction(b.toLowerCase());
        if (this.opts.ignore_regexp) {
            a = a.replace(this.opts.ignore_regexp, '');
            b = b.replace(this.opts.ignore_regexp, '');
        }
        if (this.opts.ignore_accents) {
            a = this.removeAccents(a);
            b = this.removeAccents(b);
        }
        return a == b;
    }
});
$.extend(SpellQuestion.prototype, event_mixin, display_mixin);
//#endregion SpellQuestion
//#region ImageQuestion
function ImageQuestion($elem, opts) {
    opts = $.extend(
        {
            timer: null,
            wait_after_correct: 1000,
            wait_after_incorrect: 4000,
            lang_id: '',
            case_sensitive: false,
            ignore_accents: true,
            ignore_regexp: /[\.\s\-;:]/g

        }, opts || {})
    this.init($elem, opts);
}
///// How to refactor to use SpellQuestion functionality? Can we still use extend?
/// init: SpellQuestion.prototype.init ?... there wouldn't be an issue with closures right? this?
$.extend(ImageQuestion.prototype, {
    init: function ($elem, opts) {
        console.log("image question init")/////////////
        this.opts = opts;
        this.$e = $elem;
        this.$input = this.$e.find('.response');
        var me = this;

        Timer.bind('timeout', $.proxy(this.onTimeOut, this));

        this.$e.find('.dont_know').bind(CLICK, $.proxy(this.onDontKnow, this));

        if (this.opts.lang_id) {
            this.mk = new MiniKeyboard(
                this.$input,
                $('.minikeyboard_container'),
                this.opts.lang_id);
        }
        if (this.opts.lang_id == 'zh_CN' && IS_TOUCH_DEVICE) {
            this.tk = new iPadToneKeys(this.$input, this.$e.find('#ipad_tones'));
        } else {
            this.$e.find('#ipad_tones').remove();
        }

        this.$input.bind("input", function (e) {
            me.onChange();
        }).on("keypress", function (e) {
            if (e.keyCode == 13) {
                me.onEnter();
            }
        });

        this.$e.find('.spell_continue').on(CLICK, function () {
            me.triggerComplete();
        });

    },
    setValues: function (question, answer, audio, images) {
        this.answer = answer;
        this.audio = audio;
        this.$e.find('h2').text(question);
        this.$input.val('').removeClass('correct incorrect').focus();
        if (IS_TOUCH_DEVICE) {
            $(window).scrollTop($('.mobile_top .actions').outerHeight());
        }
        this.state = 'PENDING_ANSWER';
        this.$input.attr('placeholder', '');
        Timer.start(33000);
        this.$e.find('.correction').css({ visibility: 'hidden' });

        this.$e.find('.continue_row').hide();
        this.$e.find('.bottom_spell_row').show();

        this.$e.find(".image_row").show();
        let row = document.querySelector(".image_row");
        row.innerHTML = "";
        for (var i = 0; i < images.length; ++i) {
            let img = document.createElement("img");
            img.src = images[i].src;
            img.width = images[i].w;
            img.height = images[i].h;
            row.appendChild(img);
        }

        return this;
    },

    onEnter: function () {
        if (this.state != 'PENDING_ANSWER')
            return;

        Timer && Timer.pause();

        var r;
        var self = this;

        if (this.compare(this.$input.val(), this.answer)) {
            settingsManager.get('play_sfx') && AudioPlayer.correct.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 500);
            this.flashGoodJob(3500);
            r = { correct: true };
        } else {
            settingsManager.get('play_sfx') && AudioPlayer.incorrect.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 300);
            this.flashShowCorrect(5000);
            r = { correct: false };
        }
        this.trigger('response', r);

        // this must come at the end, because it triggers a change event.
        if ('ontouchstart' in window || !Timer.disabled) {
            this.$input.blur();  // hide the ipad keyboard
        }
    },
    onChange: function () {
        // cleanup funky quotes
        var val = this.$input.val();
        var val_clean = $.replaceFunkyQuotes(val);
        if (val != val_clean) {
            this.$input.val(val_clean);
            return this.onChange();
        }

        if (this.compare(this.$input.val(), this.answer)) {
            this.onEnter();  // press the enter key for them.
        }
    },
    onTimeOut: function () {
        if (this.state != 'PENDING_ANSWER')
            return;

        this.flashShowCorrect(3000);
        this.trigger('response', { timeout: true })
    },
    onDontKnow: function () {
        Timer && Timer.pause();

        this.trigger('response', { dont_know: true });
        this.flashShowCorrect(3500);
    },
    //#region OtherStuff

    // Answer was correct
    flashShowCorrect: function (msec) {
        var me = this;
        this.state = 'SHOWING_CORRECT';
        this.$input.addClass('incorrect');
        this.$e.find('.correction .correct')
            .text(this.answer)
            .parent().css({ visibility: 'visible' })
            .addClass(me.audio ? 'has_audio' : 'no_audio')
            .off('click')
            .on('click', function (e) {
                e.preventDefault();
                me.audio && me.audio.play();
            });
        var me = this;
        if (Timer.disabled) {
            this.$e.find('.continue_row').show()
                .find('.spell_continue').trigger('focus');

            this.$e.find('.bottom_spell_row').hide();
            this.$e.find(".image_row").hide();
        } else {
            setTimeout(function () {
                me.triggerComplete()
            },
                msec
            );
        }

    },
    flashGoodJob: function (msec) {
        this.state = 'SHOWING_CORRECT';
        this.$input.val(this.answer);
        this.$input.addClass('correct');
        var me = this;
        setTimeout(function () {
            me.triggerComplete()
        },
            msec
        );
    },
    triggerComplete: function () {
        if (this.state !== 'DONE') {
            this.state = 'DONE';
            this.trigger("showCorrectComplete");
        }
    },
    _accentRegexps: [
        [/[àâäåãáāǎ]/g, 'a'],
        [/[æ]/g, 'ae'],
        [/[ç]/g, 'c'],
        [/[éèēěêë]/g, 'e'],
        [/[ïîìíīǐ]/g, 'i'],
        [/[ñ]/g, 'n'],
        [/[öôóòōǒõ]/g, 'o'],
        [/[œ]/g, 'oe'],
        [/[ùûüúūúǔ]/g, 'u'],
        [/[ǖǘǚǜü]/g, 'ü']
    ],
    removeAccents: function (s) {
        for (var i in this._accentRegexps) {
            s = s.replace(this._accentRegexps[i][0], this._accentRegexps[i][1]);
        }
        return s;
    },
    removeOuterPunction: function (s) {
        s = s.replace(/^[\.\?¿¡'"]+/, '');
        s = s.replace(/[\.\?¿¡'"]+$/, '');
        return s;
    },
    compare: function (a, b) {
        a = this.removeOuterPunction(a.toLowerCase());
        b = this.removeOuterPunction(b.toLowerCase());
        if (this.opts.ignore_regexp) {
            a = a.replace(this.opts.ignore_regexp, '');
            b = b.replace(this.opts.ignore_regexp, '');
        }
        if (this.opts.ignore_accents) {
            a = this.removeAccents(a);
            b = this.removeAccents(b);
        }
        return a == b;
    }
    //#endregion OtherStuff
});
$.extend(ImageQuestion.prototype, event_mixin, display_mixin);
//#endregion ImageQuestion
//#region SpeechQuestion
function PromptForSpeech($elem) {
    this.init($elem);
}
$.extend(PromptForSpeech.prototype, event_mixin, display_mixin, {
    init: function ($elem) {
        this.$e = $elem;
        var $cancel_btn = $elem.find('.cancel');
        var $try_btn = $elem.find('.try_it');
        var me = this;

        $try_btn.on('click', function (e) {
            e.preventDefault();
            me.trigger("showCorrectComplete");
            me.trigger("want");
        });
        $cancel_btn.on('click', function (e) {
            e.preventDefault();
            me.trigger("showCorrectComplete");
            me.trigger("cancel");
        });
    }
});
function SpeechQuestion($elem) {
    this.init($elem);
}
$.extend(SpeechQuestion.prototype, event_mixin, display_mixin, {
    init: function ($elem) {
        this.$e = $elem;
        var me = this;
        this.$e.find('.speech_prompt').on('click', function (e) {
            e.preventDefault();
            me.audio && me.audio.play();
        });

        this.$e.find('.start_microphone').on('click', function (e) {
            e.preventDefault();
            if (!$(this).find('i').hasClass('started')) {
                me.recognition.start();
            } else {
                me.recognition.stop();
            }

        });

        this.$e.find('.btn.continue').on('click', function (e) {
            e.preventDefault();
            me.recognition.stop();
            me.trigger("response", { correct: true });
            me.trigger("showCorrectComplete");
        });

        this.$e.find('.btn.skip').on('click', function (e) {
            e.preventDefault();
            me.recognition.stop();
            me.trigger("response", { correct: true });
            me.trigger("showCorrectComplete");
        });
    },
    setValues: function (front, back, audio, lang_id, pinyin, hanzi) {
        this.front = front;
        this.audio = audio;
        this.lang_id = lang_id;
        this.pinyin = pinyin;
        this.hanzi = hanzi;

        this.$e.find('.speech_prompt').html(front);
        this.$e.find('.speech_meaning').html(back);
        this.$e.find('.speech_response .rec').text('');
        this.$e.find('.speech_response .rec_result').text('');
        this.$e.find('.btn.continue').hide();
        this.$e.find('.btn.skip').show();

        this.audio && this.audio.play();

        if (!this.recognition) {
            if (lang_id.substr(0, 2) == 'zh') {
                this.initRecognitionChinese();
            } else {
                this.initRecognition();
            }

        }

    },
    initRecognitionChinese: function () {
        this.recognition = new window.SpeechRecognition();
        var recognition = this.recognition;
        var me = this;

        recognition.lang = 'zh';
        recognition.interimResults = true;
        recognition.maxAlternatives = 4;
        recognition.onend = function () {
            $('.start_microphone').removeClass('started');
            // this happens when they don't speak enough words to
            // trigger default processing, but google stops the mic
            if (me.unprocessed_results) {
                me.translateResultsToPinyinAndRender(me.unprocessed_results);
            }
        }
        recognition.onstart = function () {
            me.clearRecognitionResponse();
            me._result_locked = false;
            $('.start_microphone').addClass('started');
        }
        recognition.onresult = function (event) {
            var results = []; // up to 4
            for (var i = 0; i < event.results[0].length; i++) {
                results.push(event.results[0][i].transcript);
            }
            // remove non-chinese, and empty
            results = results.map(function (t) { return t.replace(/[a-zA-Z]/g, '') });
            results = results.filter(function (t) { return t });
            if (!results.length) return;  // all english... does this make sense
            me.unprocessed_results = results;

            var first_len = results[0].length;
            if (first_len >= me.hanzi.length) {
                recognition.stop();
                me.translateResultsToPinyinAndRender(results);
                me.unprocessed_results = null;
            }
        };
    },
    translateResultsToPinyinAndRender: function (results) {
        var me = this;
        if (this._result_locked) return;
        $.get('?action=to_pinyin&lang_id=' + this.lang_id +
            '&words=' + results.join('||'),
            function (data) {
                me.renderChineseResults(data.results);
            }
        );

    },
    renderChineseResults: function (results) {

        var norm = function (p) { return p.toLowerCase().replace(/\s/g, ''); }
        var make_$res = function (result) {
            return $('<span>').append(
                $('<span class="hanzi">').text(result.hanzi)
                    .addClass(me.hanzi == result.hanzi ? 'correct' : 'no_match')
            ).append(
                $('<span>').text(result.pinyin)
            );
        }
        var $main_result = this.$e.find('.rec_result');
        var me = this;

        // check fully correct
        $main_result.removeClass('correct incorrect partial').empty();
        if (norm(results[0].pinyin) == norm(this.pinyin)) {
            $main_result
                .addClass('correct')
                .append(make_$res(results[0]))
            this.showContinueButton();
            this.recognition.stop();
            this._result_locked = true;
            this.playResultAudioIfOkay('correct');
            return;
        }

        var alternative_match = false;
        for (var i = 0; i < results.length; i++) {
            var res = results[i];
            if (norm(results[i].pinyin) == norm(this.pinyin)) {
                $main_result.addClass('partial')
                    .append(make_$res(res))
                alternative_match = true;
                this.showContinueButton();
                this.recognition.stop();
                this._result_locked = true;
                this.playResultAudioIfOkay('partial');
                break;
            }
        }

        if (!alternative_match) {
            $main_result
                .addClass('incorrect')
                .append(make_$res(results[0]))

            this.playResultAudioIfOkay('incorrect');
            return;
        }

    },
    showContinueButton: function () {
        this.$e.find('.btn.continue').show();
        this.$e.find('.btn.skip').hide();
    },
    playResultAudioIfOkay: function (status) {
        if (!this._result_locked) return;

        if (!settingsManager.get('play_sfx')) {
            return;
        }
        if (status == 'correct') {
            AudioPlayer.correct.play()
        } else if (status == 'partial') {
            AudioPlayer.correct.play()
        } else if (status == 'incorrect') {
            AudioPlayer.incorrect.play()
        }
    },
    clearRecognitionResponse: function () {
        this.$e.find('.rec, .rec_result').empty();
    },
});
//#endregion SpeechQuestion
//#region GameController
function GameController($elem, opts) {
    this.init($elem, opts);
}
$.extend(GameController.prototype, {
    init: function ($elem, opts) {
        this.$e = $elem;
        this.opts = opts;
        this.card_index = 0;
        this.question_count = 0;
        this.queue_index = -1;
        this.cards = [];
        this.queue = [];
        this.response_counts = { "known_count": 0, "unknown_count": 0, "timeout_count": 0 };
        var me = this;

        // pause timer when in background
        $(window).on('blur', function () {
            Timer.pause();
        }).on('focus', function () {
            Timer.resume();
        });

        this.spell_question = new SpellQuestion(
            $('#spell_question'),
            { lang_id: this.opts.lang_id }
        );
        this.spell_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.spell_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.image_question = new ImageQuestion(
            $('#image_question'),
            { lang_id: this.opts.lang_id }
        );
        this.image_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.image_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.choice_question = new ChoiceQuestion($('.choice_question'));
        this.choice_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.choice_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.prompt_for_speech = new PromptForSpeech($('.prompt_for_speech'));
        this.prompt_for_speech.bind("response", function (e, a) { me.afterAnswer(a); });
        this.prompt_for_speech.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.speech_question = new SpeechQuestion($('.speech_question'));
        this.speech_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.speech_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.setOpts(this.opts);
    },
    setCards: function (cards) {
        this.cards = cards;
    },
    setGames: function (games) {
        var old_games = this.games ? this.games.slice() : null;
        this.games = games;

        if (old_games) {
            console.log("need to diff", old_games, games);
        }

        // todo, cleanup progress
    },
    setOpts: function (opts) {
        for (var i in opts) {
            if (i == 'queue_size') {
                if (this.opts.queue_size > opts[i]) {
                    var qs = 0;
                    for (var j = 0; j < this.queue.length; j++) if (this.queue[j]) qs++;
                    this.card_index = Math.max(0, this.card_index - qs + opts[i]);
                }
                this.opts.queue_size = opts[i]
            } else if (i == 'ignore_accents') {
                this.spell_question.opts.ignore_accents = !!opts[i];
                this.image_question.opts.ignore_accents = !!opts[i];
            } else if (i == 'show_timer') {
                Timer[opts[i] ? "enable" : "disable"]();
            } else if (i == 'show_traditional') {
                $('body')[opts[i] ? "addClass" : "removeClass"]('show_traditional');
            } else if (i == 'play_sfx') {
                this.play_sfx = opts[i];
            }
        }
    },
    afterAnswer: function (response) {

        var qi = this.queue[this.queue_index];

        if (response.correct) {
            qi.known_count++;
            this.response_counts.known_count++;
            qi.progress++;
            this.trigger("queueChange", this.queueState());
            if (qi.progress >= this.games.length) {
                this.saveCardComplete(qi);
                this.queue[this.queue_index] = null;
            }

        } else if (response.timeout) {
            qi.timeout_count++;
            this.response_counts.timeout_count++;
        } else { // don't know
            qi.unknown_count++;
            this.response_counts.unknown_count++;

            qi.progress = Math.max(qi.progress - 1, 0);
        }

        this.trigger("queueChange", this.queueState());

    },
    saveCardComplete: function (queue_item) {

        var match = window.location.href.match(/media_id=(\d+)/);
        var media_id = match ? match[1] : '';
        queue_item && $.post('?action=save_completed_card&media_id=' + media_id
            + '&card_id=' + queue_item.card.card_id,
            {
                known_count: queue_item.known_count,
                unknown_count: queue_item.unknown_count,
                timeout_count: queue_item.timeout_count
            },
            () => { });
    },
    ///////// do we really even need to make async go all the way up? as long as it is at one level, there is an await and execution has to stay there
    afterShowCorrect: async function () {
        await this.showNextQuestion();
    },
    start: function () {
        this.showNextQuestion()
    },
    onWin: function () {
        AudioPlayer.win.play();
        $('#win_overlay').show().positionAbsolute(.5, .3);
        Mask.show();
        this.saveCompletion();
    },
    saveCompletion: function () {
        var match = window.location.href.match(/media_id=(\d+)/);
        var media_id = match ? match[1] : 0;
        $.post('vocabulary-flashcard-review.php?action=save_completion',
            {
                media_id: media_id,
                known_count: this.response_counts.known_count,
                unknown_count: this.response_counts.unknown_count,
                num_words: this.cards.length
            }, function (data) {
                // do nothing?
            }
        );
    },
    showNextQuestion: async function () {
        this.fillQueue();
        this.getNextQueueIndex();
        this.trigger("queueChange", this.queueState());

        if (this.queue_index > -1)
            await this.showQuestion(this.queue_index);
        else
            this.onWin();
    },
    queueState: function () {
        var inprocess = 0;
        var partial = 0.0;
        var num_games = this.games.length;
        for (var i in this.queue) {
            if (this.queue[i]) { // can be null
                inprocess++;
                partial += (0.0 + this.queue[i].progress) / num_games;
            }
        }
        var completed_words = this.card_index - inprocess;
        var completed_partial = completed_words + partial; // will be 0.666 if 3 games, and 2 correct responses

        return {
            queue: this.queue,
            queue_index: this.queue_index,
            num_games: num_games,
            num_cards: this.cards.length,
            card_index: this.card_index,
            completed_words: completed_words,
            completed_partial: completed_partial,
            completed_pct: completed_partial / this.cards.length
        }
    },
    fillQueue: function () {
        var qs = this.opts.queue_size;
        if (this.queue.length != qs) {
            this.queue = this.queue.slice(0, qs);
            while (this.queue.length < qs)
                this.queue.push(null);
        }
        for (var i = 0; i < qs; i++) {
            if (!this.queue[i] && this.card_index < this.cards.length)
                this.queue[i] = {
                    card: this.cards[this.card_index++],
                    progress: 0,
                    question_count: -1,
                    ask_count: 0,
                    known_count: 0,
                    unknown_count: 0,
                    timeout_count: 0
                };
        }
    },
    getNextQueueIndex: function () {
        // pick the last asked card.
        var index = -1;
        var min = 1000000;
        for (var i = 0, l = this.queue.length; i < l; i++) {
            if (this.queue[i] && this.queue[i].question_count < min) {
                index = i;
                min = this.queue[i].question_count;
            }
        }
        if (index > -1) {
            var e = this.queue[index];
            e.question_count = ++this.question_count;
            e.ask_count++;
            this.queue_index = index;
        } else {
            this.queue_index = -1;
        }

    },
    // The card in the queue_item is populated from the received cards json
    showQuestion: async function () {
        var queue_item = this.queue[this.queue_index];
        var game_type = this.games[queue_item.progress];
        this.choice_question.hide();
        this.spell_question.hide();
        this.image_question.hide();
        this.prompt_for_speech.hide();
        this.speech_question.hide();
        if (game_type == "front_back") {
            this.choice_question.show().setChoices(
                queue_item.card.front,
                this.getChoices(5, 'back'),
                queue_item.card.back,
                queue_item.card.front_audio
            ).show();
        } else if (game_type == "back_front") {
            this.choice_question.show().setChoices(
                queue_item.card.back,
                this.getChoices(5, 'front'),
                queue_item.card.front
            ).show();
        } else if (game_type == "back_hanzi") {
            this.choice_question.show().setChoices(
                queue_item.card.back,
                this.getChoices(5, 'hanzi'),
                queue_item.card.hanzi
            ).show();
        } else if (game_type == "hanzi_back") {
            this.choice_question.show().setChoices(
                queue_item.card.hanzi,
                this.getChoices(5, 'back'),
                queue_item.card.back
            ).show();
        } else if (game_type == "pinyin_hanzi") {
            this.choice_question.show().setChoices(
                queue_item.card.hanzi,
                this.getChoices(5, 'pinyin'),
                queue_item.card.pinyin
            ).show();
        } else if (game_type == "spell") {
            this.spell_question.show().setValues(
                queue_item.card.back,
                queue_item.card.spell || queue_item.card.front,
                queue_item.card.front_audio
            );
        } else if (game_type == "image") {
            this.image_question.show().setValues(
                queue_item.card.back,
                queue_item.card.spell || queue_item.card.front,
                queue_item.card.front_audio,
                ///// We need an image, we can map hanzi words to image names, that is card.word, but it is unicode char
                ////////do we really want to await here??...yes that way we don't waste the requests
                await ImageHandler.GetImages(queue_item.card.hanzi)
            );
        } else if (game_type == "spell_hanzi") {
            this.spell_question.show().setValues(
                queue_item.card.back,
                queue_item.card.hanzi,
                queue_item.card.front_audio,
                "type 汉字"
            );
        } else if (game_type == "prompt_for_speech") {
            var game_index = this.games.indexOf('prompt_for_speech');
            var me = this;

            this.prompt_for_speech.show()
                .bind("cancel", function () {
                    me.games.splice(game_index, 1);
                    me.queue[me.queue_index].progress--;
                    me.showNextQuestion();
                })
                .bind("want", function () {
                    me.games.splice(game_index, 1, "speech");
                    me.queue[me.queue_index].progress--;
                    me.showNextQuestion();
                });

        } else if (game_type == "speech") {
            this.speech_question.show().setValues(
                queue_item.card.front,
                queue_item.card.back,
                queue_item.card.front_audio,
                this.opts.lang_id,
                queue_item.card.pinyin,
                queue_item.card.hanzi
            );
        } else {
            throw "Unknown Game Type: " + game_type + " " + this.queue[this.queue_index].progress;
        }


    },
    getChoices: function (num_choices, field) {
        var choices = [];
        var fb = field;
        var choice = this.queue[this.queue_index].card[fb];
        choices.push(choice);
        var cards = this.cards.slice();
        while (choices.length < num_choices) {
            if (cards.length == 0) {  // fewer cards than choices (uncommon)
                choices.push('');
                continue;
            }
            var random_card = cards.splice(Math.floor(Math.random() * (cards.length)), 1)[0];
            if (random_card[fb] != choices[0])
                choices.push(random_card[fb]);
        }
        $.shuffle(choices)
        return choices;

    }

});
$.extend(GameController.prototype, event_mixin);
//#endregion GameController

//#region Views and Progress
function ProgressView(GC, $container) {

    this.init(GC, $container);

}
$.extend(ProgressView.prototype, {
    init: function (GC, $container) {
        $container.empty();
        this.$e = $container.empty();

        var me = this;
        GC.bind("queueChange", function (e, d) {

            me.progressChangeHandler(d.completed_pct);
        });
        $container.append('<span id="progress_text"><span class="competed_word_count"></span> / <span class="total_word_count"></span></span>');
        this.pb = (new ProgressBar(25, 'green')).setProgress(0);
        this.pb.$e.appendTo($container);

    },
    progressChangeHandler: function (pct) {
        this.pb.$e.data('controller').setProgress(pct + .01);
    }
});
function MobileProgressView(GC, $container) {

    this.init(GC, $container);

}
$.extend(MobileProgressView.prototype, {
    init: function (GC, $container) {
        this.$progress_bar = $container.find('.overall_progress .bar').css('width', '.01%');

        this.$progress_text = $container.find('.word_complete_label');
        this.progress_text_template = this.$progress_text.text();
        this.setProgressText(0, GC.cards.length);

        var me = this;
        GC.bind("queueChange", function (e, d) {
            me.setProgressText(d.completed_words, d.num_cards);
            me.progressChangeHandler(d.completed_pct);
        });

    },
    setProgressText: function (learned, total) {
        var text = this.progress_text_template.replace('X', learned).replace('Y', total);
        this.$progress_text.text(text);
    },
    progressChangeHandler: function (pct) {
        this.$progress_bar.css('width', pct * 100 + '%');
    }
});

function QueueView(GC, $container) {

    this.init(GC, $container);

}
$.extend(QueueView.prototype, {
    init: function (GC, $container) {

        this.$e = $container.empty();
        this.$ul = $('<ul>').appendTo(this.$e);
        this.$chevron = $('<div class="chevron">&raquo;</div>').css({ position: 'absolute' }).appendTo(this.$e);

        GC.bind("queueChange", $.proxy(this.queueChangeHandler, this));

    },
    queueChangeHandler: function (e, d) {
        var queue = d.queue;
        var index = d.queue_index;
        var num_games = d.num_games;
        var $li = this.$e.find('li');

        // check the length
        if ($li.length > queue.length)
            $li.slice(queue.length - $li.length).remove();
        while ($li.length < queue.length) {
            (new ProgressBar(20, 'blue'))
                .setProgress(0)
                .$e.appendTo('<li>')
                .parent()
                .appendTo(this.$ul);
            $li = this.$e.find('li');
        }

        // set all the progress bars
        for (var i = 0, l = queue.length; i < l; i++) {
            var pb = $li.eq(i).find('div.progress').data('controller');
            if (queue[i]) {
                if (queue[i].progress == num_games) {
                    this.renderCompleteAnimation(pb);
                } else {
                    pb.setProgress(queue[i].progress / num_games)
                        .$e.css('visibility', 'visible').animate({ opacity: 1 }, 2400);
                }
            } else {
                pb.$e.css('visibility', 'hidden');
            }
        }
        // position the chevron to index
        if (index !== undefined && $li.length) {
            var o = $li.eq(index).position();
            this.$chevron.css({ top: o.top - 2, left: o.settings - 3 }).show();
        } else {
            this.$chevron.hide();
        }

    },
    renderCompleteAnimation: function (pb) {
        if (this.$e.is(':hidden')) return;

        var o = pb.$e.position();
        var $offset_parent = pb.$e.offsetParent();
        var $clone = pb.$e.clone(true)
            .wrap('<div/>').parent()
            .css({ position: 'absolute' })
            .appendTo($offset_parent)
            .css(o)
            .find('.fill')
            .animate({ width: '100%' }, function () {
                $(this)
                    .removeClass('green blue orange')
                    .addClass('green');
                $clone
                    .delay(800)
                    .animate({ top: o.top + 20 }, "fast")
                    .animate({ left: -220, opacity: 0 }, "slow", function () {
                        $(this).remove();
                    });
            })
            .end()


        pb.setProgress(0).$e.css({ visibility: 'hidden', opacity: 0 });
    }

});

function ProgressBar(size, color) {
    color = color || "blue";
    this.init(size, color);
}
$.extend(ProgressBar.prototype, {
    init: function (size, color) {
        this.$e = $('<div class="progress"><div class="fill"></div></div>');
        if (size == 20)
            this.$e.addClass('progress_20_145');
        else if (size == 25)
            this.$e.addClass('progress_25_220');
        this.$e.find('.fill').addClass(color);
        var me = this;
        this.$e.data('controller', this);
        this.setProgress(0.0, false);
    },
    setProgress: function (val, animate, duration) {
        val = $.clamp(val, 0, 1);
        var css = { 'width': val * 100 + '%' };
        animate === false ?
            this.$e.find('.fill').css(css) :
            this.$e.find('.fill').animate(css, { duration: duration || "slow", queue: true })
        return this;
    },
    setColor: function (color) {
        this.$e.find('fill').removeClass('blue green orange').addClass(color);
        return this;
    }
});
$.extend(ProgressBar.prototype, display_mixin);

function iPadToneKeys(target, $container) {
    this.init(target, $container)
}
$.extend(iPadToneKeys.prototype, {
    init: function (target, $container) {
        $container.find('button').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('pressed');
            var $t = $(target);
            var tone = parseInt(this.className.replace(/\D+/g, ''));
            $t.val($.format_pinyin($t.val(), tone));
            $t.focus();
            $t.trigger('input');
        }).on("touchstart", function () {
            $(this).addClass('pressed');
        }).on("touchcancel", function () {
            $(this).removeClass('pressed');
            $t.focus();
        });

    }
});
function MiniKeyboard(target, $container, lang_id) {
    this.init(target, $container, lang_id);
}
$.extend(MiniKeyboard.prototype, {
    langs: {
        es: ['á', 'é', 'í', 'ñ', 'ó', 'ú', 'ü', '¿', '¡'],
        fr: ['à', 'ä', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'œ', 'ö', 'ô', 'ù', 'û', 'ü'],
        de: ['ä', 'Ä', 'é', 'ö', 'Ö', 'ü', 'Ü', 'ß'],
        it: ['à', 'è', 'é', 'ì', 'ò', 'ù']
    },
    init: function (t, $container, lang_id) {
        this.$target = $(t);
        if (lang_id.substr(0, 2) == 'zh') {
            this.$target.enable_pinyin_input();
            return;
        }
        this.$e = $('<div class="minikeyboard clearfix" />').appendTo($container);
        if (this.langs[lang_id])
            this.render(lang_id);
        var me = this;
        this.$e.find('a').bind(CLICK, function (e) {
            e.preventDefault();
            me.$target.focus();
            insertAtCaret(me.$target[0], $(this).text());
            me.$target.trigger('input');
        });
    },
    render: function (lang_id) {
        var me = this;
        $.each(this.langs[lang_id], function (k, v) {
            $('<a href="#" class="button"></a>').text(v).appendTo(me.$e);
        });
    }
});
//#endregion Views and Progress


//#region SettingsManager
function SettingsManager($elem) {
    this.init($elem)
}
$.extend(SettingsManager.prototype, event_mixin);
$.extend(SettingsManager.prototype, {
    defaults: {
        queue_size: 5,
        ignore_accents: false,
        show_timer: true,
        show_traditional: false,
        play_sfx: true
    },
    init: function ($elem) {
        // if demo, make it easy
        if (window.location.href.match(/set_id/g)) {
            this.defaults.queue_size = 3;

        }
        this.$e = $elem;
        this.bindEvents();
        if (IS_ASSIGNED) {
            this.useAssignmentMode();
        }


    },
    bindEvents: function () {
        var me = this;
        $('.show_settings').bind(CLICK, function (e) {
            e.preventDefault();
            me.show();
        });
        this.$e.find('.save').bind(CLICK, function (e) {
            e.preventDefault();
            me.save();
        });
        this.$e.find('.cancel').bind(CLICK, function (e) {
            e.preventDefault();
            me.hide()
        });

    },
    useAssignmentMode: function () {
        var obj = this.get();
        obj.queue_size = 5;
        obj.ignore_accents = false;
        this.setValues(obj);
        $('[name=queue_size], [name=ignore_accents]').prop('disabled', true);
    },
    save: function () {
        var s = this.readForm();
        this.setValues(s);
        this.hide();
    },
    setValues: function (obj) {
        window.localStorage.setItem('vocabSettings', JSON.stringify(obj));
        this.trigger('change');
    },
    set: function (key, value) {
        var opts = this.get();
        opts[key] = value;
        this.setValues(opts);
    },
    get: function (key) {
        var defaults = this.defaults;

        var storage_settings;
        var json_text;

        // use session storage
        try {
            json_text = window.localStorage.getItem('vocabSettings');
            storage_settings = $.parseJSON(json_text || '{}');
        } catch (e) {
            storage_settings = {};
        }
        // maintain cookie method (delete this July 2019)
        if (!json_text) {
            try {
                json_text = this.readCookie('vocabSettings');
                storage_settings = $.parseJSON(json_text || '{}');
            } catch (e) {
                storage_settings = {};
            }
        }
        var res = $.extend({}, defaults, storage_settings);
        if (key) {
            return res[key];
        }
        return res;

    },
    setForm: function (settings) {
        this.$e.find('select[name=queue_size]').val(settings.queue_size);
        settings.ignore_accents ?
            this.$e.find('#ignore_accents1').prop('checked', true) :
            this.$e.find('#ignore_accents0').prop('checked', true);
        settings.show_timer ?
            this.$e.find('#show_timer1').prop('checked', true) :
            this.$e.find('#show_timer0').prop('checked', true);
        settings.show_traditional ?
            this.$e.find('#show_traditional1').prop('checked', true) :
            this.$e.find('#show_traditional0').prop('checked', true);
        settings.play_sfx ?
            this.$e.find('#play_sfx1').prop('checked', true) :
            this.$e.find('#play_sfx0').prop('checked', true);

    },
    readForm: function () {
        var val = {
            queue_size: parseInt(this.$e.find('[name=queue_size]').val()),
            ignore_accents: !!this.$e.find('input[name=ignore_accents]:checked').val(),
            show_timer: !!this.$e.find('input[name=show_timer]:checked').val(),
            play_sfx: !!this.$e.find('input[name=play_sfx]:checked').val(),
            show_traditional: !!this.$e.find('input[name=show_traditional]:checked').val(),
        }
        var r = {};
        $.extend(r, this.defaults, val);
        return r;
    },
    show: function () {
        Timer.pause();
        this.setForm(this.get());
        Mask.show();
        Mask.$e.bind(CLICK, $.proxy(this.hide, this));
        var me = this;
        $(document).bind('keyup', function (e) {
            if (e.keyCode == 27)
                me.hide();
        });
        this.$e.show().positionAbsolute(.5, .33);

    },
    hide: function (e) {

        Timer.resume();
        this.$e.hide();
        $(document).unbind('keyup');
        $(document).unbind('resize');
        Mask.$e.unbind(CLICK);
        Mask.hide();
    },
    createCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

});
//#endregion SettingsManager

//#region GameTypeController
var GameTypeController = {
    type_options: {
        zh_CN: [
            { type: "front_back", label: "Multiple Choice: Pīnyīn & 汉字 » English", preselected: true },
            { type: "back_front", label: "Multiple Choice: English » Pīnyīn , 汉字", preselected: true },
            { type: "back_hanzi", label: "Multiple Choice: English » 汉字", preselected: false },
            { type: "hanzi_back", label: "Multiple Choice: 汉字 » English", preselected: false },
            { type: "pinyin_hanzi", label: "Multiple Choice: 汉字 » Pīnyīn", preselected: false },
            { type: "speech", label: "Speaking Practice (microphone required)", preselected: true, requires_speech: true },
            { type: "spell", label: "Type Answer: Pīnyīn", preselected: true },
            { type: "spell_hanzi", label: "Type Answer: 汉字", preselected: false },
            { type: "image", label: "View Image, Type Answer: Pīnyīn", preselected: true },
        ],
        std_lang: [
            {
                type: "front_back",
                label: "Multiple Choice: Chinese » English",
                preselected: true
            },
            {
                type: "back_front",
                label: "Multiple Choice: English » Chinese",
                preselected: true
            },
            {
                type: "spell",
                label: "Type Answer: Chinese",
                preselected: true
            },
        ]
    },
    default_games: ["front_back", "back_front", "spell"],  // used for assignments
    selected_games: [],
    init: function (lang_id, gc) {
        var me = this;
        this.gc = gc;
        this.lang_id = lang_id;

        if (IS_ASSIGNED) {
            this.selected_games = this.default_games;
            // hacky:
            setTimeout(function () { $('.game_type_toggle').hide() }, 0)
        } else {
            var game_opts = this.type_options[lang_id] || this.type_options.std_lang;

            this.selected_games = [];
            $.each(game_opts, function (k, v) {
                if (v.requires_speech && !SpeechRecognitionSupported) return;

                if (v.preselected) {
                    me.selected_games.push(v.type);
                }
            });
            // test code
            // $('body').text(''); throw "start here ";
            // me.selected_games = ['speech'];
        }
        this.setGames();
        this.$e = this.getDOM();
    },
    parseSelection: function (el) {
        var res = [];
        var $s = $(el).find('.selected');
        if ($s.length) {
            $s.each(function (k, e) {
                var game_type = $(e).data('type_key');
                res.push(game_type);
            });
        } else {
            res = this.default_games;
        }
        this.selected_games = res;
        this.setGames();
    },
    setGames: function () {
        this.gc.setGames(this.selected_games);
    },
    getDOM: function () {
        var me = this;
        var choices = this.type_options[this.lang_id] || this.type_options['std_lang'];
        if (!choices)
            return null;
        var $h = $('<div />').addClass('game_type_selector');
        $('<div />').text('Choose Question Types')
            .addClass('game_type_toggle')
            .on('click', function () {
                $(this).closest('.game_type_selector').find('ul').toggle();
            }).appendTo($h);
        var $ul = $('<ul />');
        $.each(choices, function (k, v) {
            if (v.requires_speech && !SpeechRecognitionSupported) return;

            $('<li>').text(v.label).data('type_key', v.type).addClass(v.preselected ? 'selected' : '').appendTo($ul)
                .on('click', function () {
                    var num_selected = $ul.find('li.selected').length;
                    if (num_selected > 1) {
                        $(this).toggleClass('selected');
                    } else {
                        $(this).removeClass('selected').addClass('selected');
                    }
                    me.parseSelection($ul);
                });
        });
        $ul.appendTo($h).hide();

        return $h;
    }

}
//#endregion GameTypeController


//#region ListPreview
var ListPreview = {
    init: function (cards, onclose) {
        this.callback = onclose;
        this.$e = $('#preview_overlay');
        var $l = this.$e.find('ul.terms');
        var me = this;
        this.$e.find('a.start_game').bind('click', function (e) {
            e.preventDefault();
            me.hide();
        });
        $('#overlay_mask').on('click.LP', function () {
            me.$e.find('a.start_game').click();
            $('#overlay_mask').off('click.LP');
        });
        for (var i in cards) {

            var $li = $('<li />')
                .data('definition', cards[i].back)
                .append(
                    $('<span />').addClass('term')
                        .html('<span style="padding-right:5px;font-size:110%;"><i class="far fa-play-circle"></i></span>')
                        .append(cards[i].front.replace('<br>', ' '))
                        .data('card', cards[i])
                        .on('click', function () {
                            $(this).data('card').front_audio.play()
                        })  // note some Chinese cards have minor html
                )
            if (!IS_ASSIGNED) {
                $li
                    .append($('<span />').text(' :: '))
                    .append(
                        $('<span />').addClass('definition').text(cards[i].back)
                    )
            }
            $li.appendTo($l);
        }
        if (IS_ASSIGNED) {
            // let them see the correct response on hover
            var $tt = $('<div/>').addClass('assign tt').appendTo('body')
            $l.find('li').hover(
                function () {
                    $(this).css('cursor', 'pointer');
                    var o = $(this).offset();
                    $tt.text($(this).data('definition'));
                    $tt.show();
                    $tt.css({
                        top: o.top - 8,
                        left: o.left + $(this).find('span').width() + 15,
                        'pointer-events': 'none'
                    });
                },
                function () {
                    $tt.hide();
                }
            );
            // disable text selection
            this.$e.on('selectstart', false);
        }
    },
    show: function () {
        Mask.show();
        this.$e.show().positionAbsolute(.5, .33);
        if (this.$e.outerHeight() > $(window).height()) {
            var $ul = this.$e.find('ul');
            $ul.height($ul.height() + $(window).height() - this.$e.outerHeight());
        }

    },
    hide: function () {
        Mask.hide();
        this.$e.hide();
        this.callback();
    }
}
//#endregion ListPreview

class ImageHandler {
    // turn this into a loop over all our api_keys
    static async GetImages(hanzi) {

        return [
            {
                "w": 400,
                "h": 265,
                "src": "https://m.18zhongyao.com/uploads/allimg/200517/1-20051H22910M8.jpg"
            },
            {
                "w": 500,
                "h": 333,
                "src": "https://img03.sogoucdn.com/v2/thumb/retype_exclude_gif/ext/auto/crop/xy/ai/w/500/h/333?appid=200698&url=https://pic.baike.soso.com/ugc/baikepic2/0/20160801093508-1687346331.jpg/0"
            },
            {
                "w": 1009,
                "h": 671,
                "src": "https://pic.baike.soso.com/ugc/baikepic2/0/20170729200910-867812304.jpg/1284"
            },
            {
                "w": 980,
                "h": 514,
                "src": "https://app.ninchanese.com/image/word/traditional/246835/%E8%8A%B8%E8%8B%94%E5%AD%90.jpg"
            },
            {
                "w": 1008,
                "h": 665,
                "src": "https://www.18zhongyao.com/uploads/allimg/200517/1-20051H22929C6.jpg"
            }
        ];

        let query = `https://expressjs-prisma-production-140f.up.railway.app/img/${encodeURIComponent(hanzi)}`;
        let res = await (await fetch(query)).json();//, { method: "GET", mode: "no-cors" })
        let ret = []
        let len = 5;
        // get top 5 results
        for (var i = 0; i < len; ++i) {
            if (res.images_results[i].original.endsWith(".svg")
                || res.images_results[i].original.includes("ninchanese")) {
                ++len; continue; // skip svg, skip results that give away answer
            }
            let sum = res.images_results[i].original_height + res.images_results[i].original_width;
            let percent = 1;
            if (sum > 700)
                percent = 1 - 0.0001 * sum - .4; // e.g. 1000*0.0001=.9 => reduce by 10%..not enough let's continue to decrease by 40%
            let w = Math.floor(res.images_results[i].original_width * percent);
            let h = Math.floor(res.images_results[i].original_height * percent);
            ret.push({ w: w, h: h, src: res.images_results[i].original })
        }
        return ret;
    }

}

/*
let's add up the dimensions
then depending on the sum, we resize by some percent

900 = 1000 *.9  

how can we calculate the percentage that we want to reduce by
wait, doesn't a constant factor dependent on sum size do exactly what we want?
0.0001*sum

  "images_results": [
    {
      "position": 1,
      "thumbnail": "https://serpapi.com/searches/6364287d0f9866fb26417703/images/b025f12b85cec32a3756c1ae65bfa65fdc6b3d9e7f59773decab08663ca77b68.png",
      "source": "en.wikipedia.org",
      "title": "History of Apple Inc. - Wikipedia",
      "link": "https://en.wikipedia.org/wiki/History_of_Apple_Inc.",
      "original": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      "original_width": 814,
      "original_height": 1000,
      "is_product": false
    },


*/
var gc, settingsManager;
$(function () {
    $.shuffle(CARDS)

    Timer.init($('#timer'), $('.mobile_top .progress.timer')).pause();

    settingsManager = new SettingsManager($('#settings_overlay'));

    gc = new GameController(
        $('#main'),
        $.extend(settingsManager.get(), OPTS)
    );
    gc.setCards(CARDS);

    settingsManager.bind('change', function () {
        gc.setOpts(settingsManager.get());
    });

    var qv = new QueueView(gc, $('#queue_container'));
    var pc = new ProgressView(gc, $('#progress_container'));
    var mpv = new MobileProgressView(gc, $('.mobile_top'));

    var cards_copy = CARDS.slice();
    $.shuffle(cards_copy);
    ListPreview.init(cards_copy, function () {
        gc.start();
    });
    ListPreview.show();

    GameTypeController.init(OPTS.lang_id, gc);
    ListPreview.$e.find('#type_selector_placeholder').append(GameTypeController.$e);

    // this is a hack
    if (OPTS.lang_id.substr(0, 2) != 'zh') {
        $('.set_char_type').hide();
    }
});
})();
