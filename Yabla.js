
/*shouldn't need to rewrite this, but may want to modify some of this audio stuff*/
$(function ()
{
    $.ajax({
        url: '/js/soundmanager2/soundmanager2-jsmin.js',
        dataType: 'script',
        success: function ()
        {
            window.soundManager = new SoundManager(); // Flash expects window.soundManager.

            soundManager.debugMode = false;
            soundManager.defaultOptions.volume = 50
            soundManager.debugFlash = false;
            soundManager.url = '/js/soundmanager2/';
            soundManager.debugMode = false;
            soundManager.flashVersion = 8;
            soundManager.beginDelayedInit();
            soundManager.onready(function ()
            {
                AudioPlayer = {
                    correct: soundManager.createSound({
                        id: 'correct1',
                        url: '//yabla.vo.llnwd.net/media.yabla.com/images/vocab/correct1.mp3',
                        volume: 30
                    }),
                    incorrect: soundManager.createSound({
                        id: 'error1',
                        url: '//yabla.vo.llnwd.net/media.yabla.com/images/vocab/error1.mp3',
                        volume: 30
                    }),
                    win: soundManager.createSound({
                        id: 'win3',
                        url: '//yabla.vo.llnwd.net/media.yabla.com/images/vocab/win3.mp3',
                        volume: 50
                    })
                };
                AudioPlayer.correct.load();
                AudioPlayer.incorrect.load();
                AudioPlayer.win.load();

                initAudio();
                if (IS_IPAD)
                    $(function ()
                    {
                        $('body').bind('touchend', preloadAudio);
                    });

                // fix missing audio by replacing the audio file from Forvo
                CARDS.map(function (card, i)
                {
                    var a = new Audio(card.front_audio_file);
                    a.onerror = function ()
                    {
                        // for words like 'el cáscara', forvo doesn't return a result
                        // so remove the first word lik 'el' and 'la'
                        var word = card.front;
                        var word_split = card.front.split(' ');
                        if (word_split.length == 2 && (word_split[0] == 'el' || word_split[0] == 'la'))
                        {
                            word = word_split[1];
                        }

                        $.get('free-dictionary.php', {
                            "word": word,
                            "action": "get_audio_data",
                            "player_lang_id": OPTS.lang_id
                        }, function (data)
                        {

                            // no result as empty array string
                            if (data == '[]')
                            {
                                // show some error msg?
                            } else
                            {
                                CARDS[i].front_audio_file = JSON.parse(data)[0].pathmp3;
                                initAudio();
                            }
                        })
                    }
                    a.load();
                })

            });
        }

    });
});

function ChoiceQuestion($elem, opts)
{
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
    init: function ($elem, opts)
    {
        this.$e = $elem;
        this.opts = opts;
        this.state = 'INIT';
        this.initKeypressHandler();
        Timer.bind('timeout', this.onTimeOut.bind(this));

    },
    initKeypressHandler: function ()
    {
        var me = this;
        $(document).on('keypress.choice_question', function (e)
        {
            if (me.state !== 'PENDING_ANSWER') return;
            if (e.which >= 49 && e.which <= 54)
            {
                var li_index = e.which - 49;
                var $li = me.$e.find('li').eq(li_index);
                $li.trigger('click');
            }
        })
    },
    setChoices: function (word, choices, correct, audio)
    {

        this.$e.find('h2')
            .find('.choice_text')
            .html(word)
            .append('<i class="fa fa-volume-up"></i>')
            .end()
            .off('click')
            .addClass(audio ? 'has_audio' : 'no_audio')
            .bind('click', function (e)
            {
                e.preventDefault();
                audio && audio.play();
            });

        var self = this;
        var $c, h = 1;
        var $ul = this.$e.find('ul').empty();
        for (var i in choices)
        {
            $c = $('<li />')
                .html('<div>' + choices[i] + '</div>')
                .data('is_correct', (choices[i] == correct))
                .appendTo($ul)
        }

        if (this.opts.other_choice)
        {
            var li = $ul.find('li:last');
            li.data('hidden_correct', li.text())
                .text('Not Listed')
                .appendTo($ul)
        }

        if (this.opts.dont_know_choice)
        {
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
    show: function ()
    {
        this.$e.show();
        this.$e.find('ul li').each(function ()
        {
            var $li = $(this);
            var $div = $li.find('div');
            var h = 1;
            while ($li.height() < $div.outerHeight() && h > .6)
            {
                h = h * .9;
                $div.css('font-size', h * 100 + '%');
            }
        });
        return this;
    },
    handleClick: function (e)
    {

        e.preventDefault();
        var $elem = $(e.target).closest('li');
        if (this.state != 'PENDING_ANSWER')
            return;
        Timer && Timer.pause();
        var $correct_elem = this.getAndHightlightCorrectElement();

        var r;
        // three cases correct, incorrect, don't know
        if ($elem.data('is_correct'))
        {

            r = { correct: true, dont_know: false };
            settingsManager.get('play_sfx') && AudioPlayer.correct.play();
        } else if ($elem.hasClass('dont_know'))
        {
            r = { correct: false, dont_know: true };
        } else
        {
            $elem.addClass('incorrect')
            r = { correct: false, dont_know: false };
            settingsManager.get('play_sfx') && AudioPlayer.incorrect.play();
        }
        this.state = 'SHOWING_CORRECT';
        this.trigger('response', r)
        var extend_ms = $correct_elem.data('hidden_correct') ? 1000 : 0; // if it is other / not listed, let's show the correct answer for a bit longer.
        this.flashShowCorrect((r.correct ? 1000 : 2000) + extend_ms);
    },
    flashShowCorrect: function (msec)
    {
        var me = this;
        setTimeout(function ()
        {
            me.trigger("showCorrectComplete")
        },
            msec
        );
    },
    getAndHightlightCorrectElement: function ()
    {
        var r;
        this.$e
            .find('li')
            .each(function ()
            {
                if ($(this).data('is_correct'))
                {
                    r = $(this).addClass('correct');
                    if ($(this).data('hidden_correct'))
                        $(this).text($(this).data('hidden_correct'));
                }

            });
        return r;
    },
    onTimeOut: function ()
    {
        if (this.state != 'PENDING_ANSWER')
            return;

        this.state = 'SHOWING_CORRECT';
        this.trigger('response', { timeout: true });
        var $ce = this.getAndHightlightCorrectElement();
        this.flashShowCorrect(2000);
    }
});

/*
How to rewrite spell question?
Can we just do it in OOP style?
Could we just use jquery to rewrite methods we want?
*/
function SpellQuestion($elem, opts)
{
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
$.extend(SpellQuestion.prototype, {
    init: function ($elem, opts)
    {
        this.opts = opts;
        this.$e = $elem;
        this.$input = this.$e.find('.response');
        var me = this;

        Timer.bind('timeout', $.proxy(this.onTimeOut, this));

        this.$e.find('.dont_know').bind(CLICK, $.proxy(this.onDontKnow, this));

        if (this.opts.lang_id)
            this.mk = new MiniKeyboard(
                this.$e.find('.response'),
                $('.minikeyboard_container'),
                this.opts.lang_id);

        if (this.opts.lang_id == 'zh_CN' && IS_TOUCH_DEVICE)
        {
            this.tk = new iPadToneKeys(this.$input, this.$e.find('#ipad_tones'));
        } else
        {
            this.$e.find('#ipad_tones').remove();
        }

        this.$input.bind("input", function (e)
        {
            me.onChange();
        }).on("keypress", function (e)
        {
            if (e.keyCode == 13)
            {
                me.onEnter();
            }
        });

        this.$e.find('.spell_continue').on(CLICK, function ()
        {
            me.triggerComplete();
        });

    },
    setValues: function (question, answer, audio, placeholder)
    {
        this.answer = answer;
        this.audio = audio;
        this.$e.find('h2').text(question);
        this.$input.val('').removeClass('correct incorrect').focus();
        if (IS_TOUCH_DEVICE)
        {
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

    /*
    May need to modify onEnter so that it could be more keyboard accessible for speech rec exercise
    And, when we introduce other exercises 
    */
    onEnter: function ()
    {

        if (this.state != 'PENDING_ANSWER')
            return;

        Timer && Timer.pause();

        var r;
        var self = this;

        if (this.compare(this.$input.val(), this.answer))
        {
            settingsManager.get('play_sfx') && AudioPlayer.correct.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 500);
            this.flashGoodJob(3500);
            r = { correct: true };
        } else
        {
            settingsManager.get('play_sfx') && AudioPlayer.incorrect.play();
            this.audio && setTimeout(function () { self.audio.play(); }, 300);
            this.flashShowCorrect(5000);
            r = { correct: false };
        }
        this.trigger('response', r);

        // this must come at the end, because it triggers a change event.
        if ('ontouchstart' in window || !Timer.disabled)
        {
            this.$input.blur();  // hide the ipad keyboard
        }


    },
    onChange: function ()
    {
        // cleanup funky quotes
        var val = this.$input.val();
        var val_clean = $.replaceFunkyQuotes(val);
        if (val != val_clean)
        {
            this.$input.val(val_clean);
            return this.onChange();
        }


        if (this.compare(this.$input.val(), this.answer))
        {
            this.onEnter();  // press the enter key for them.
        }
    },
    onTimeOut: function ()
    {
        if (this.state != 'PENDING_ANSWER')
            return;

        this.flashShowCorrect(3000);
        this.trigger('response', { timeout: true })
    },
    onDontKnow: function ()
    {
        Timer && Timer.pause();

        this.trigger('response', { dont_know: true });
        this.flashShowCorrect(3500);
    },
    flashShowCorrect: function (msec)
    {
        var me = this;
        this.state = 'SHOWING_CORRECT';
        this.$input.addClass('incorrect');
        this.$e.find('.correction .correct')
            .text(this.answer)
            .parent().css({ visibility: 'visible' })
            .addClass(me.audio ? 'has_audio' : 'no_audio')
            .off('click')
            .on('click', function (e)
            {
                e.preventDefault();
                me.audio && me.audio.play();
            });
        var me = this;
        if (Timer.disabled)
        {
            this.$e.find('.continue_row').show()
                .find('.spell_continue').trigger('focus');

            this.$e.find('.bottom_spell_row').hide();
        } else
        {
            setTimeout(function ()
            {
                me.triggerComplete()
            },
                msec
            );
        }

    },
    flashGoodJob: function (msec)
    {
        this.state = 'SHOWING_CORRECT';
        this.$input.val(this.answer);
        this.$input.addClass('correct');
        var me = this;
        setTimeout(function ()
        {
            me.triggerComplete()
        },
            msec
        );
    },
    triggerComplete: function ()
    {
        if (this.state !== 'DONE')
        {
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
    removeAccents: function (s)
    {
        for (var i in this._accentRegexps)
        {
            s = s.replace(this._accentRegexps[i][0], this._accentRegexps[i][1]);
        }
        return s;
    },
    removeOuterPunction: function (s)
    {
        s = s.replace(/^[\.\?¿¡'"]+/, '');
        s = s.replace(/[\.\?¿¡'"]+$/, '');
        return s;
    },
    compare: function (a, b)
    {
        a = this.removeOuterPunction(a.toLowerCase());
        b = this.removeOuterPunction(b.toLowerCase());
        if (this.opts.ignore_regexp)
        {
            a = a.replace(this.opts.ignore_regexp, '');
            b = b.replace(this.opts.ignore_regexp, '');
        }
        if (this.opts.ignore_accents)
        {
            a = this.removeAccents(a);
            b = this.removeAccents(b);
        }
        return a == b;
    }
});
$.extend(SpellQuestion.prototype, event_mixin, display_mixin);

function PromptForSpeech($elem)
{
    this.init($elem);
}
$.extend(PromptForSpeech.prototype, event_mixin, display_mixin, {
    init: function ($elem)
    {
        this.$e = $elem;
        var $cancel_btn = $elem.find('.cancel');
        var $try_btn = $elem.find('.try_it');
        var me = this;

        $try_btn.on('click', function (e)
        {
            e.preventDefault();
            me.trigger("showCorrectComplete");
            me.trigger("want");
        });
        $cancel_btn.on('click', function (e)
        {
            e.preventDefault();
            me.trigger("showCorrectComplete");
            me.trigger("cancel");
        });
    }
});
function SpeechQuestion($elem)
{
    this.init($elem);
}
$.extend(SpeechQuestion.prototype, event_mixin, display_mixin, {
    init: function ($elem)
    {
        this.$e = $elem;
        var me = this;
        this.$e.find('.speech_prompt').on('click', function (e)
        {
            e.preventDefault();
            me.audio && me.audio.play();
        });

        this.$e.find('.start_microphone').on('click', function (e)
        {
            e.preventDefault();
            if (!$(this).find('i').hasClass('started'))
            {
                me.recognition.start();
            } else
            {
                me.recognition.stop();
            }

        });

        this.$e.find('.btn.continue').on('click', function (e)
        {
            e.preventDefault();
            me.recognition.stop();
            me.trigger("response", { correct: true });
            me.trigger("showCorrectComplete");
        });

        this.$e.find('.btn.skip').on('click', function (e)
        {
            e.preventDefault();
            me.recognition.stop();
            me.trigger("response", { correct: true });
            me.trigger("showCorrectComplete");
        });
    },
    setValues: function (front, back, audio, lang_id, pinyin, hanzi)
    {
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

        if (!this.recognition)
        {
            if (lang_id.substr(0, 2) == 'zh')
            {
                this.initRecognitionChinese();
            } else
            {
                this.initRecognition();
            }

        }

    },
    initRecognitionChinese: function ()
    {
        this.recognition = new window.SpeechRecognition();
        var recognition = this.recognition;
        var me = this;

        recognition.lang = 'zh';
        recognition.interimResults = true;
        recognition.maxAlternatives = 4;
        recognition.onend = function ()
        {
            $('.start_microphone').removeClass('started');
            // this happens when they don't speak enough words to
            // trigger default processing, but google stops the mic
            if (me.unprocessed_results)
            {
                me.translateResultsToPinyinAndRender(me.unprocessed_results);
            }
        }
        recognition.onstart = function ()
        {
            me.clearRecognitionResponse();
            me._result_locked = false;
            $('.start_microphone').addClass('started');
        }
        recognition.onresult = function (event)
        {
            var results = []; // up to 4
            for (var i = 0; i < event.results[0].length; i++)
            {
                results.push(event.results[0][i].transcript);
            }
            // remove non-chinese, and empty
            results = results.map(function (t) { return t.replace(/[a-zA-Z]/g, '') });
            results = results.filter(function (t) { return t });
            if (!results.length) return;  // all english... does this make sense
            me.unprocessed_results = results;

            var first_len = results[0].length;
            if (first_len >= me.hanzi.length)
            {
                recognition.stop();
                me.translateResultsToPinyinAndRender(results);
                me.unprocessed_results = null;
            }
        };
    },
    translateResultsToPinyinAndRender: function (results)
    {
        var me = this;
        if (this._result_locked) return;
        $.get('?action=to_pinyin&lang_id=' + this.lang_id +
            '&words=' + results.join('||'),
            function (data)
            {
                me.renderChineseResults(data.results);
            }
        );

    },
    renderChineseResults: function (results)
    {

        var norm = function (p) { return p.toLowerCase().replace(/\s/g, ''); }
        var make_$res = function (result)
        {
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
        if (norm(results[0].pinyin) == norm(this.pinyin))
        {
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
        for (var i = 0; i < results.length; i++)
        {
            var res = results[i];
            if (norm(results[i].pinyin) == norm(this.pinyin))
            {
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

        if (!alternative_match)
        {
            $main_result
                .addClass('incorrect')
                .append(make_$res(results[0]))

            this.playResultAudioIfOkay('incorrect');
            return;
        }

    },
    showContinueButton: function ()
    {
        this.$e.find('.btn.continue').show();
        this.$e.find('.btn.skip').hide();
    },
    playResultAudioIfOkay: function (status)
    {
        if (!this._result_locked) return;

        if (!settingsManager.get('play_sfx'))
        {
            return;
        }
        if (status == 'correct')
        {
            AudioPlayer.correct.play()
        } else if (status == 'partial')
        {
            AudioPlayer.correct.play()
        } else if (status == 'incorrect')
        {
            AudioPlayer.incorrect.play()
        }
    },
    clearRecognitionResponse: function ()
    {
        this.$e.find('.rec, .rec_result').empty();
    },



});


/*
GameController will create objects for all the questions types
We will need to implement a new question type for images and create it here
*/
function GameController($elem, opts)
{
    this.init($elem, opts);
}
$.extend(GameController.prototype, {
    init: function ($elem, opts)
    {
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
        $(window).on('blur', function ()
        {
            Timer.pause();
        }).on('focus', function ()
        {
            Timer.resume();
        });

        if (this.opts.lang_id.substr(0, 2) != 'zh')
        {
            $('.spell_tip').hide()
        }

        this.spell_question = new SpellQuestion(
            $('.spell_question'),
            { lang_id: this.opts.lang_id }
        );
        this.spell_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.spell_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

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
    setCards: function (cards)
    {
        this.cards = cards;
    },
    setGames: function (games)
    {
        var old_games = this.games ? this.games.slice() : null;
        this.games = games;

        if (old_games)
        {
            console.log("need to diff", old_games, games);
        }

        // todo, cleanup progress
    },
    setOpts: function (opts)
    {
        for (var i in opts)
        {
            if (i == 'queue_size')
            {
                if (this.opts.queue_size > opts[i])
                {
                    var qs = 0;
                    for (var j = 0; j < this.queue.length; j++) if (this.queue[j]) qs++;
                    this.card_index = Math.max(0, this.card_index - qs + opts[i]);
                }
                this.opts.queue_size = opts[i]
            } else if (i == 'ignore_accents')
            {
                this.spell_question.opts.ignore_accents = !!opts[i];
            } else if (i == 'show_timer')
            {
                Timer[opts[i] ? "enable" : "disable"]();
            } else if (i == 'show_traditional')
            {
                $('body')[opts[i] ? "addClass" : "removeClass"]('show_traditional');
            } else if (i == 'play_sfx')
            {
                this.play_sfx = opts[i];
            }
        }
    },
    afterAnswer: function (a)
    {

        var qi = this.queue[this.queue_index];

        if (a.correct)
        {
            qi.known_count++;
            this.response_counts.known_count++;
            qi.progress++;
            this.trigger("queueChange", this.queueState());
            if (qi.progress >= this.games.length)
            {
                this.saveCardComplete(qi);
                this.queue[this.queue_index] = null;
            }

        } else if (a.timeout)
        {
            qi.timeout_count++;
            this.response_counts.timeout_count++;
        } else
        {
            qi.unknown_count++;
            this.response_counts.unknown_count++;

            qi.progress = Math.max(qi.progress - 1, 0);
        }

        this.trigger("queueChange", this.queueState());

    },
    saveCardComplete: function (queue_item)
    {

        var match = window.location.href.match(/media_id=(\d+)/);
        var media_id = match ? match[1] : '';
        queue_item && $.post('?action=save_completed_card&media_id=' + media_id
            + '&card_id=' + queue_item.card.card_id,
            {
                known_count: queue_item.known_count,
                unknown_count: queue_item.unknown_count,
                timeout_count: queue_item.timeout_count
            },
            function (data)
            {
                // don't really need to do anything
            });
    },
    afterShowCorrect: function ()
    {
        this.showNextQuestion();
    },
    start: function ()
    {
        this.showNextQuestion()
    },
    onWin: function ()
    {
        AudioPlayer.win.play();
        $('#win_overlay').show().positionAbsolute(.5, .3);
        Mask.show();
        this.saveCompletion();
    },
    saveCompletion: function ()
    {
        var match = window.location.href.match(/media_id=(\d+)/);
        var media_id = match ? match[1] : 0;
        $.post('vocabulary-flashcard-review.php?action=save_completion',
            {
                media_id: media_id,
                known_count: this.response_counts.known_count,
                unknown_count: this.response_counts.unknown_count,
                num_words: this.cards.length
            }, function (data)
        {
            // do nothing?
        }
        );
    },
    showNextQuestion: function ()
    {
        this.fillQueue();
        this.getNextQueueIndex();
        this.trigger("queueChange", this.queueState());

        if (this.queue_index > -1)
            this.showQuestion(this.queue_index);
        else
            this.onWin();
    },
    queueState: function ()
    {
        var inprocess = 0;
        var partial = 0.0;
        var num_games = this.games.length;
        for (var i in this.queue)
        {
            if (this.queue[i])
            { // can be null
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
    fillQueue: function ()
    {
        var qs = this.opts.queue_size;
        if (this.queue.length != qs)
        {
            this.queue = this.queue.slice(0, qs);
            while (this.queue.length < qs)
                this.queue.push(null);
        }
        for (var i = 0; i < qs; i++)
        {
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
    getNextQueueIndex: function ()
    {
        // pick the last asked card.
        var index = -1;
        var min = 1000000;
        for (var i = 0, l = this.queue.length; i < l; i++)
        {
            if (this.queue[i] && this.queue[i].question_count < min)
            {
                index = i;
                min = this.queue[i].question_count;
            }
        }
        if (index > -1)
        {
            var e = this.queue[index];
            e.question_count = ++this.question_count;
            e.ask_count++;
            this.queue_index = index;
        } else
        {
            this.queue_index = -1;
        }

    },
    showQuestion: function ()
    {
        var queue_item = this.queue[this.queue_index];

        var game_type = this.games[queue_item.progress];
        this.choice_question.hide();
        this.spell_question.hide();
        this.prompt_for_speech.hide();
        this.speech_question.hide();
        if (game_type == "front_back")
        {
            this.choice_question.show().setChoices(
                queue_item.card.front,
                this.getChoices(5, 'back'),
                queue_item.card.back,
                queue_item.card.front_audio
            ).show();
        } else if (game_type == "back_front")
        {
            this.choice_question.show().setChoices(
                queue_item.card.back,
                this.getChoices(5, 'front'),
                queue_item.card.front
            ).show();
        } else if (game_type == "back_hanzi")
        {
            this.choice_question.show().setChoices(
                queue_item.card.back,
                this.getChoices(5, 'hanzi'),
                queue_item.card.hanzi
            ).show();
        } else if (game_type == "hanzi_back")
        {
            this.choice_question.show().setChoices(
                queue_item.card.hanzi,
                this.getChoices(5, 'back'),
                queue_item.card.back
            ).show();
        } else if (game_type == "pinyin_hanzi")
        {
            this.choice_question.show().setChoices(
                queue_item.card.hanzi,
                this.getChoices(5, 'pinyin'),
                queue_item.card.pinyin
            ).show();
        } else if (game_type == "spell")
        {
            this.spell_question.show().setValues(
                queue_item.card.back,
                queue_item.card.spell || queue_item.card.front,
                queue_item.card.front_audio
            );
        } else if (game_type == "spell_hanzi")
        {
            this.spell_question.show().setValues(
                queue_item.card.back,
                queue_item.card.hanzi,
                queue_item.card.front_audio,
                "type 汉字"
            );
        } else if (game_type == "prompt_for_speech")
        {
            var game_index = this.games.indexOf('prompt_for_speech');
            var me = this;

            this.prompt_for_speech.show()
                .bind("cancel", function ()
                {
                    me.games.splice(game_index, 1);
                    me.queue[me.queue_index].progress--;
                    me.showNextQuestion();
                })
                .bind("want", function ()
                {
                    me.games.splice(game_index, 1, "speech");
                    me.queue[me.queue_index].progress--;
                    me.showNextQuestion();
                });

        } else if (game_type == "speech")
        {
            this.speech_question.show().setValues(
                queue_item.card.front,
                queue_item.card.back,
                queue_item.card.front_audio,
                this.opts.lang_id,
                queue_item.card.pinyin,
                queue_item.card.hanzi
            );
        } else
        {
            throw "Unknown Game Type: " + game_type + " " + this.queue[this.queue_index].progress;
        }


    },
    getChoices: function (num_choices, field)
    {
        var choices = [];
        var fb = field;
        var choice = this.queue[this.queue_index].card[fb];
        choices.push(choice);
        var cards = this.cards.slice();
        while (choices.length < num_choices)
        {
            if (cards.length == 0)
            {  // fewer cards than choices (uncommon)
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


/*
We deleted: 
ProgressView
QueueView
ProgressBar
...mobile related stuff
*/

/// We will probably need to change something here to allow for infinite queue size
function SettingsManager($elem)
{
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
    init: function ($elem)
    {
        this.$e = $elem;
        this.bindEvents();
        if (IS_ASSIGNED)
        {
            this.useAssignmentMode();
        }
    },
    bindEvents: function ()
    {
        var me = this;
        $('.show_settings').bind(CLICK, function (e)
        {
            e.preventDefault();
            me.show();
        });
        this.$e.find('.save').bind(CLICK, function (e)
        {
            e.preventDefault();
            me.save();
        });
        this.$e.find('.cancel').bind(CLICK, function (e)
        {
            e.preventDefault();
            me.hide()
        });

    },
    useAssignmentMode: function ()
    {
        var obj = this.get();
        obj.queue_size = 5;
        obj.ignore_accents = false;
        this.setValues(obj);
        $('[name=queue_size], [name=ignore_accents]').prop('disabled', true);
    },
    save: function ()
    {
        var s = this.readForm();
        this.setValues(s);
        this.hide();
    },
    setValues: function (obj)
    {
        window.localStorage.setItem('vocabSettings', JSON.stringify(obj));
        this.trigger('change');
    },
    set: function (key, value)
    {
        var opts = this.get();
        opts[key] = value;
        this.setValues(opts);
    },
    get: function (key)
    {
        var defaults = this.defaults;

        var storage_settings;
        var json_text;

        // use session storage
        try
        {
            json_text = window.localStorage.getItem('vocabSettings');
            storage_settings = $.parseJSON(json_text || '{}');
        } catch (e)
        {
            storage_settings = {};
        }
        // maintain cookie method (delete this July 2019)
        if (!json_text)
        {
            try
            {
                json_text = this.readCookie('vocabSettings');
                storage_settings = $.parseJSON(json_text || '{}');
            } catch (e)
            {
                storage_settings = {};
            }
        }
        var res = $.extend({}, defaults, storage_settings);
        if (key)
        {
            return res[key];
        }
        return res;

    },
    setForm: function (settings)
    {
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
    readForm: function ()
    {
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
    show: function ()
    {
        Timer.pause();
        this.setForm(this.get());
        Mask.show();
        Mask.$e.bind(CLICK, $.proxy(this.hide, this));
        var me = this;
        $(document).bind('keyup', function (e)
        {
            if (e.keyCode == 27)
                me.hide();
        });
        this.$e.show().positionAbsolute(.5, .33);

    },
    hide: function (e)
    {

        Timer.resume();
        this.$e.hide();
        $(document).unbind('keyup');
        $(document).unbind('resize');
        Mask.$e.unbind(CLICK);
        Mask.hide();
    },
    createCookie: function (name, value, days)
    {
        if (days)
        {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function (name)
    {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++)
        {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

});
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
            { type: "spell_hanzi", label: "Type Answer: 汉字", preselected: false }
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
    init: function (lang_id, gc)
    {
        var me = this;
        this.gc = gc;
        this.lang_id = lang_id;

        if (IS_ASSIGNED)
        {
            this.selected_games = this.default_games;
            // hacky:
            setTimeout(function () { $('.game_type_toggle').hide() }, 0)
        } else
        {
            var game_opts = this.type_options[lang_id] || this.type_options.std_lang;

            this.selected_games = [];
            $.each(game_opts, function (k, v)
            {
                if (v.requires_speech && !SpeechRecognitionSupported) return;

                if (v.preselected)
                {
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
    parseSelection: function (el)
    {
        var res = [];
        var $s = $(el).find('.selected');
        if ($s.length)
        {
            $s.each(function (k, e)
            {
                var game_type = $(e).data('type_key');
                res.push(game_type);
            });
        } else
        {
            res = this.default_games;
        }
        this.selected_games = res;
        this.setGames();
    },
    setGames: function ()
    {

        this.gc.setGames(this.selected_games);

    },
    getDOM: function ()
    {
        var me = this;
        var choices = this.type_options[this.lang_id] || this.type_options['std_lang'];
        if (!choices)
            return null;
        var $h = $('<div />').addClass('game_type_selector');
        $('<div />').text('Choose Question Types')
            .addClass('game_type_toggle')
            .on('click', function ()
            {
                $(this).closest('.game_type_selector').find('ul').toggle();
            }).appendTo($h);
        var $ul = $('<ul />');
        $.each(choices, function (k, v)
        {
            if (v.requires_speech && !SpeechRecognitionSupported) return;

            $('<li>').text(v.label).data('type_key', v.type).addClass(v.preselected ? 'selected' : '').appendTo($ul)
                .on('click', function ()
                {
                    var num_selected = $ul.find('li.selected').length;
                    if (num_selected > 1)
                    {
                        $(this).toggleClass('selected');
                    } else
                    {
                        $(this).removeClass('selected').addClass('selected');
                    }
                    me.parseSelection($ul);
                });
        });
        $ul.appendTo($h).hide();

        return $h;
    }

}

/// Do we need this? Where do we select options for gamemodes?....looks like it is done above
// lets look at where the below html is generated
var ListPreview = {
    init: function (cards, onclose)
    {
        this.callback = onclose;
        this.$e = $('#preview_overlay');
        var $l = this.$e.find('ul.terms');
        var me = this;
        this.$e.find('a.start_game').bind('click', function (e)
        {
            e.preventDefault();
            me.hide();
        });
        $('#overlay_mask').on('click.LP', function ()
        {
            me.$e.find('a.start_game').click();
            $('#overlay_mask').off('click.LP');
        });
        for (var i in cards)
        {

            var $li = $('<li />')
                .data('definition', cards[i].back)
                .append(
                    $('<span />').addClass('term')
                        .html('<span style="padding-right:5px;font-size:110%;"><i class="far fa-play-circle"></i></span>')
                        .append(cards[i].front.replace('<br>', ' '))
                        .data('card', cards[i])
                        .on('click', function ()
                        {
                            $(this).data('card').front_audio.play()
                        })  // note some Chinese cards have minor html
                )
            if (!IS_ASSIGNED)
            {
                $li
                    .append($('<span />').text(' :: '))
                    .append(
                        $('<span />').addClass('definition').text(cards[i].back)
                    )
            }
            $li.appendTo($l);
        }
        if (IS_ASSIGNED)
        {
            // let them see the correct response on hover
            var $tt = $('<div/>').addClass('assign tt').appendTo('body')
            $l.find('li').hover(
                function ()
                {
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
                function ()
                {
                    $tt.hide();
                }
            );
            // disable text selection
            this.$e.on('selectstart', false);
        }
    },
    show: function ()
    {
        Mask.show();
        this.$e.show().positionAbsolute(.5, .33);
        if (this.$e.outerHeight() > $(window).height())
        {
            var $ul = this.$e.find('ul');
            $ul.height($ul.height() + $(window).height() - this.$e.outerHeight());
        }

    },
    hide: function ()
    {
        Mask.hide();
        this.$e.hide();
        this.callback();
    }
}

var CARDS = [{ "front": "\u5766\u627f<br>t\u01cen ch\u00e9ng", "front_no_html": "\u5766\u627f   t\u01cen ch\u00e9ng", "back": "to confess, to admit", "spell": "t\u01cen ch\u00e9ng", "pinyin": "t\u01cen ch\u00e9ng", "hanzi": "\u5766\u627f", "hanzi_trad": "\u5766\u627f", "word": "\u5766\u627f", "card_id": "90576", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/349221.mp3" }, { "front": "\u9752\u83dc<br>q\u012bngc\u00e0i", "front_no_html": "\u9752\u83dc   q\u012bngc\u00e0i", "back": "green vegetables, Chinese cabbage", "spell": "q\u012bngc\u00e0i", "pinyin": "q\u012bngc\u00e0i", "hanzi": "\u9752\u83dc", "hanzi_trad": "\u9752\u83dc", "word": "\u9752\u83dc", "card_id": "2650", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/46134.mp3" }, { "front": "\u8fb9\u754c <span class=\"trad_memo\">\u908a\u754c<\/span> <br>bi\u0101nji\u00e8", "front_no_html": "\u8fb9\u754c   bi\u0101nji\u00e8", "back": "boundary, border", "spell": "bi\u0101nji\u00e8", "pinyin": "bi\u0101nji\u00e8", "hanzi": "\u8fb9\u754c", "hanzi_trad": "\u908a\u754c", "word": "\u8fb9\u754c", "card_id": "18925", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/237794.mp3" }, { "front": "\u964d\u843d<br>ji\u00e0nglu\u00f2", "front_no_html": "\u964d\u843d   ji\u00e0nglu\u00f2", "back": "to descend, to land", "spell": "ji\u00e0nglu\u00f2", "pinyin": "ji\u00e0nglu\u00f2", "hanzi": "\u964d\u843d", "hanzi_trad": "\u964d\u843d", "word": "\u964d\u843d", "card_id": "9981", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/100021.mp3" }, { "front": "\u4ee4\u4eba\u5403\u60ca <span class=\"trad_memo\">\u4ee4\u4eba\u5403\u9a5a<\/span> <br>l\u00ecng r\u00e9n ch\u012b j\u012bng", "front_no_html": "\u4ee4\u4eba\u5403\u60ca   l\u00ecng r\u00e9n ch\u012b j\u012bng", "back": "to shock, to amaze", "spell": "l\u00ecng r\u00e9n ch\u012b j\u012bng", "pinyin": "l\u00ecng r\u00e9n ch\u012b j\u012bng", "hanzi": "\u4ee4\u4eba\u5403\u60ca", "hanzi_trad": "\u4ee4\u4eba\u5403\u9a5a", "word": "\u4ee4\u4eba\u5403\u60ca", "card_id": "91373", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/374138.mp3" }, { "front": "\u501f\u9152\u6d88\u6101<br>ji\u00e8 ji\u01d4 xi\u0101o ch\u00f3u", "front_no_html": "\u501f\u9152\u6d88\u6101   ji\u00e8 ji\u01d4 xi\u0101o ch\u00f3u", "back": "Take to drinking to forget one's sorrows", "spell": "ji\u00e8 ji\u01d4 xi\u0101o ch\u00f3u", "pinyin": "ji\u00e8 ji\u01d4 xi\u0101o ch\u00f3u", "hanzi": "\u501f\u9152\u6d88\u6101", "hanzi_trad": "\u501f\u9152\u6d88\u6101", "word": "\u501f\u9152\u6d88\u6101", "card_id": "88406", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/647477.mp3" }, { "front": "\u767b\u8bb0 <span class=\"trad_memo\">\u767b\u8a18<\/span> <br>d\u0113ngj\u00ec", "front_no_html": "\u767b\u8bb0   d\u0113ngj\u00ec", "back": "to register (one's name)", "spell": "d\u0113ngj\u00ec", "pinyin": "d\u0113ngj\u00ec", "hanzi": "\u767b\u8bb0", "hanzi_trad": "\u767b\u8a18", "word": "\u767b\u8bb0", "card_id": "11270", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/112939.mp3" }, { "front": "\u7231\u5c14\u5170 <span class=\"trad_memo\">\u611b\u723e\u862d<\/span> <br>\u00c0i \u011br l\u00e1n", "front_no_html": "\u7231\u5c14\u5170   \u00c0i \u011br l\u00e1n", "back": "Ireland", "spell": "\u00c0i \u011br l\u00e1n", "pinyin": "\u00c0i \u011br l\u00e1n", "hanzi": "\u7231\u5c14\u5170", "hanzi_trad": "\u611b\u723e\u862d", "word": "\u7231\u5c14\u5170", "card_id": "84872", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/361548.mp3" }, { "front": "\u817c\u8146 <span class=\"trad_memo\">\u9766\u8146<\/span> <br>mi\u01centi\u01cen", "front_no_html": "\u817c\u8146   mi\u01centi\u01cen", "back": "shy, bashful", "spell": "mi\u01centi\u01cen", "pinyin": "mi\u01centi\u01cen", "hanzi": "\u817c\u8146", "hanzi_trad": "\u9766\u8146", "word": "\u817c\u8146", "card_id": "3660", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/45710.mp3" }, { "front": "\u7b80\u4ecb <span class=\"trad_memo\">\u7c21\u4ecb<\/span> <br>ji\u01cenji\u00e8", "front_no_html": "\u7b80\u4ecb   ji\u01cenji\u00e8", "back": "summary, brief introduction", "spell": "ji\u01cenji\u00e8", "pinyin": "ji\u01cenji\u00e8", "hanzi": "\u7b80\u4ecb", "hanzi_trad": "\u7c21\u4ecb", "word": "\u7b80\u4ecb", "card_id": "16250", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/190764.mp3" }, { "front": "\u8eb2\u5f00 <span class=\"trad_memo\">\u8eb2\u958b<\/span> <br>du\u01d2k\u0101i", "front_no_html": "\u8eb2\u5f00   du\u01d2k\u0101i", "back": "to stay out of (hot water, trouble, awkward situation etc)", "spell": "du\u01d2k\u0101i", "pinyin": "du\u01d2k\u0101i", "hanzi": "\u8eb2\u5f00", "hanzi_trad": "\u8eb2\u958b", "word": "\u8eb2\u5f00", "card_id": "13462", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/127894.mp3" }, { "front": "\u5f53\u4e2d <span class=\"trad_memo\">\u7576\u4e2d<\/span> <br>d\u0101ngzh\u014dng", "front_no_html": "\u5f53\u4e2d   d\u0101ngzh\u014dng", "back": "among, in the middle", "spell": "d\u0101ngzh\u014dng", "pinyin": "d\u0101ngzh\u014dng", "hanzi": "\u5f53\u4e2d", "hanzi_trad": "\u7576\u4e2d", "word": "\u5f53\u4e2d", "card_id": "2265", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/46298.mp3" }, { "front": "\u9886\u57df <span class=\"trad_memo\">\u9818\u57df<\/span> <br>l\u01d0ngy\u00f9", "front_no_html": "\u9886\u57df   l\u01d0ngy\u00f9", "back": "domain, sphere, field", "spell": "l\u01d0ngy\u00f9", "pinyin": "l\u01d0ngy\u00f9", "hanzi": "\u9886\u57df", "hanzi_trad": "\u9818\u57df", "word": "\u9886\u57df", "card_id": "9434", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/98531.mp3" }, { "front": "\u4e71\u52a8 <span class=\"trad_memo\">\u4e82\u52d5<\/span> <br>lu\u00e0nd\u00f2ng", "front_no_html": "\u4e71\u52a8   lu\u00e0nd\u00f2ng", "back": "to fiddle with, to tamper with", "spell": "lu\u00e0nd\u00f2ng", "pinyin": "lu\u00e0nd\u00f2ng", "hanzi": "\u4e71\u52a8", "hanzi_trad": "\u4e82\u52d5", "word": "\u4e71\u52a8", "card_id": "538", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/42424.mp3" }, { "front": "\u7ea4\u7ef4 <span class=\"trad_memo\">\u7e96\u7dad<\/span> <br>xi\u0101nw\u00e9i", "front_no_html": "\u7ea4\u7ef4   xi\u0101nw\u00e9i", "back": "fiber, CL:\u7a2e|\u79cd[zh\u01d2ng]", "spell": "xi\u0101nw\u00e9i", "pinyin": "xi\u0101nw\u00e9i", "hanzi": "\u7ea4\u7ef4", "hanzi_trad": "\u7e96\u7dad", "word": "\u7ea4\u7ef4", "card_id": "7084", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/64532.mp3" }, { "front": "\u53e3\u7f69<br>k\u01d2uzh\u00e0o", "front_no_html": "\u53e3\u7f69   k\u01d2uzh\u00e0o", "back": "mask (surgical etc)", "spell": "k\u01d2uzh\u00e0o", "pinyin": "k\u01d2uzh\u00e0o", "hanzi": "\u53e3\u7f69", "hanzi_trad": "\u53e3\u7f69", "word": "\u53e3\u7f69", "card_id": "15437", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/153365.mp3" }, { "front": "\u79bb\u804c <span class=\"trad_memo\">\u96e2\u8077<\/span> <br>l\u00edzh\u00ed", "front_no_html": "\u79bb\u804c   l\u00edzh\u00ed", "back": "to retire, to leave office", "spell": "l\u00edzh\u00ed", "pinyin": "l\u00edzh\u00ed", "hanzi": "\u79bb\u804c", "hanzi_trad": "\u96e2\u8077", "word": "\u79bb\u804c", "card_id": "12303", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/117379.mp3" }, { "front": "\u4f18\u52bf <span class=\"trad_memo\">\u512a\u52e2<\/span> <br>y\u014dush\u00ec", "front_no_html": "\u4f18\u52bf   y\u014dush\u00ec", "back": "superiority, dominance", "spell": "y\u014dush\u00ec", "pinyin": "y\u014dush\u00ec", "hanzi": "\u4f18\u52bf", "hanzi_trad": "\u512a\u52e2", "word": "\u4f18\u52bf", "card_id": "3099", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/42572.mp3" }, { "front": "\u8282\u4fed <span class=\"trad_memo\">\u7bc0\u5109<\/span> <br>ji\u00e9ji\u01cen", "front_no_html": "\u8282\u4fed   ji\u00e9ji\u01cen", "back": "frugal, economical", "spell": "ji\u00e9ji\u01cen", "pinyin": "ji\u00e9ji\u01cen", "hanzi": "\u8282\u4fed", "hanzi_trad": "\u7bc0\u5109", "word": "\u8282\u4fed", "card_id": "17894", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/229515.mp3" }, { "front": "\u8dbe\u7532<br>zh\u01d0 ji\u01ce", "front_no_html": "\u8dbe\u7532   zh\u01d0 ji\u01ce", "back": "toenail", "spell": "zh\u01d0 ji\u01ce", "pinyin": "zh\u01d0 ji\u01ce", "hanzi": "\u8dbe\u7532", "hanzi_trad": "\u8dbe\u7532", "word": "\u8dbe\u7532", "card_id": "85305", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/399077.mp3" }, { "front": "\u9ad8\u7b49<br>g\u0101od\u011bng", "front_no_html": "\u9ad8\u7b49   g\u0101od\u011bng", "back": "higher, high level, advanced", "spell": "g\u0101od\u011bng", "pinyin": "g\u0101od\u011bng", "hanzi": "\u9ad8\u7b49", "hanzi_trad": "\u9ad8\u7b49", "word": "\u9ad8\u7b49", "card_id": "23020", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/259270.mp3" }, { "front": "\u4f20\u795e <span class=\"trad_memo\">\u50b3\u795e<\/span> <br>chu\u00e1n sh\u00e9n", "front_no_html": "\u4f20\u795e   chu\u00e1n sh\u00e9n", "back": "vivid, lifelike", "spell": "chu\u00e1n sh\u00e9n", "pinyin": "chu\u00e1n sh\u00e9n", "hanzi": "\u4f20\u795e", "hanzi_trad": "\u50b3\u795e", "word": "\u4f20\u795e", "card_id": "90577", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/240926.mp3" }, { "front": "\u8ff7\u7cca<br>m\u00ed hu", "front_no_html": "\u8ff7\u7cca   m\u00ed hu", "back": "muddle-headed, dazed", "spell": "m\u00ed hu", "pinyin": "m\u00ed hu", "hanzi": "\u8ff7\u7cca", "hanzi_trad": "\u8ff7\u7cca", "word": "\u8ff7\u7cca", "card_id": "84995", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/242666.mp3" }, { "front": "\u597d\u81ea\u4e3a\u4e4b <span class=\"trad_memo\">\u597d\u81ea\u70ba\u4e4b<\/span> <br>h\u01ceoz\u00ecw\u00e9izh\u012b", "front_no_html": "\u597d\u81ea\u4e3a\u4e4b   h\u01ceoz\u00ecw\u00e9izh\u012b", "back": "to do one's best, to shape up", "spell": "h\u01ceoz\u00ecw\u00e9izh\u012b", "pinyin": "h\u01ceoz\u00ecw\u00e9izh\u012b", "hanzi": "\u597d\u81ea\u4e3a\u4e4b", "hanzi_trad": "\u597d\u81ea\u70ba\u4e4b", "word": "\u597d\u81ea\u4e3a\u4e4b", "card_id": "8847", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/97053.mp3" }, { "front": "\u6301\u4e45<br>ch\u00edji\u01d4", "front_no_html": "\u6301\u4e45   ch\u00edji\u01d4", "back": "lasting, enduring, persistent", "spell": "ch\u00edji\u01d4", "pinyin": "ch\u00edji\u01d4", "hanzi": "\u6301\u4e45", "hanzi_trad": "\u6301\u4e45", "word": "\u6301\u4e45", "card_id": "3333", "front_audio_file": "\/\/yabla.vo.llnwd.net\/media.yabla.com\/audio\/46061.mp3" }];
var OPTS = { lang_id: 'zh_CN' };

var gc, settingsManager;
// WE NEED TO MOVE SOME OF THIS INTO USER SCRIPT SO THAT WE CAN REINIT WITH OUR NEW DEFINITIONS
$(function ()
{
    $.shuffle(CARDS)

    Timer.init($('#timer'), $('.mobile_top .progress.timer')).pause();

    settingsManager = new SettingsManager($('#settings_overlay'));

    gc = new GameController(
        $('#main'),
        $.extend(settingsManager.get(), OPTS)
    );
    gc.setCards(CARDS);

    settingsManager.bind('change', function ()
    {
        gc.setOpts(settingsManager.get());
    });

    var qv = new QueueView(gc, $('#queue_container'));
    var pc = new ProgressView(gc, $('#progress_container'));
    var mpv = new MobileProgressView(gc, $('.mobile_top'));

    var cards_copy = CARDS.slice();
    $.shuffle(cards_copy);
    ListPreview.init(cards_copy, function ()
    {
        gc.start();
    });
    ListPreview.show();

    GameTypeController.init(OPTS.lang_id, gc);
    ListPreview.$e.find('#type_selector_placeholder').append(GameTypeController.$e);

    // this is a hack
    if (OPTS.lang_id.substr(0, 2) != 'zh')
    {
        $('.set_char_type').hide();
    }

});



(function ()
{
    'use strict';
    console.log(CARDS);


    const opt1 = document.createElement('option');
    const opt2 = document.createElement('option');
    const opt3 = document.createElement('option');
    opt1.innerHTML = `50 (bucuo)`;
    opt2.innerHTML = `100 (niubi)`;
    opt3.innerHTML = `500 (wocao)`;
    opt1.value = "50";
    opt2.value = "100";
    opt3.value = "500";

    let optSelect = document.querySelector(".setting_row select");
    optSelect.appendChild(opt1);
    optSelect.appendChild(opt2);
    optSelect.appendChild(opt3);

})();


</head >
    <body class="page chinese_custom">
        <div id="main" class="">
            <div class="mobile_top">
                <div class="actions">
                    <table><tbody>
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
                    </tbody></table>
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
                        <i class="fa fa-gear"></i> Settings			</a>
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
                            <i class="fa fa-pause"></i> Pause				</a>
                    </div>

                </div>

                <div id="queue_state">
                    <h3>Vocabulary Queue</h3>
                    <div id="queue_container">

                    </div>
                </div>


            </div>

            <div id="right_col">
                <div class="spell_question" style="display:none">
                    <h2>Foo Bar</h2>
                    <div class="correction">
                        <span class="label">the correct answer is</span> <span class="correct">ZZZZ</span>
                        <i class="fa fa-volume-up"></i>
                    </div>
                    <div class="response_section">
                        <div id="ipad_tones">
                            <button class="tone1">ˉ</button> <button class="tone2">ˊ</button> <button class="tone3">ˇ</button> <button class="tone4">ˋ</button> <button class="tone5">&nbsp;</button>
                        </div>
                        <div>
                            <input type="text" class="response" lang="zh_CN"
                                autocapitalize="off" autocorrect="off" autocomplete="randomworksbetter" spellcheck="false" />
                        </div>
                        <div class="bottom_spell_row">
                            <div class="minikeyboard_container"> </div>
                            <div class="spell_tip">
                                <div class="pinyin">Type the answer in pinyin.  Use <tt>1</tt>, <tt>2</tt>, <tt>3</tt>, <tt>4</tt>, <tt>5</tt> to type the tone. Type <tt>v</tt> for <tt>ü</tt>. (example: lánsè = <tt>lan2se4</tt>)
                                </div>
                            </div>
                            <div class="dont_know">I don't Know</div>
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
                <select name="queue_size" >
                    <option value="3">3 (Easiest)</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="50">50 (bucuo)</option>
                    <option value="100">100 (niubi)</option>
                    <option value="500">500 (wocao)</option>
                </select> words	</div>
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
                    <input type="radio" name="show_timer" id="show_timer1" value="1"> Show Timer		</label>
                <label>
                    <input type="radio" name="show_timer" id="show_timer0" value=""> Disable Timer		</label>
            </div>
            <div class="setting_row">
                <span class="setting_name">Sound Effects</span>
                <label>
                    <input type="radio" name="play_sfx" id="play_sfx1" value="1"> On		</label>
                <label>
                    <input type="radio" name="play_sfx" id="play_sfx0" value=""> Off		</label>
            </div>
            <div class="setting_row set_char_type">
                <span class="setting_name">Simplified vs Traditional</span>
                <label>
                    <input type="radio" name="show_traditional" id="show_traditional0" value="" />
                    Show only Simplified		</label>
                <label>
                    <input type="radio" name="show_traditional" id="show_traditional1" value="1">
                        Show Simplified and Traditional		</label>
            </div>
            <div class="setting_row">
                <a href="#" class="btn fill green save">Save</a> <a href="#" class="cancel">Cancel</a>
            </div>

        </div>
        <div id="win_overlay" class="overlay">
            <h1>Congratulations! 牛逼！</h1>
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
        </div>