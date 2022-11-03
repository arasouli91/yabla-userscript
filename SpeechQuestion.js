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