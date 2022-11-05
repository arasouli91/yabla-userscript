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