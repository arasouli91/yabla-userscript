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