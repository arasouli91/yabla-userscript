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