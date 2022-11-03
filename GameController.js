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
            $('.spell_question'),
            { lang_id: this.opts.lang_id }
        );
        this.spell_question.bind("response", function (e, a) { me.afterAnswer(a); });
        this.spell_question.bind("showCorrectComplete", $.proxy(this.afterShowCorrect, this));

        this.image_question = new ImageQuestion(
            $('.image_question'),
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
    afterAnswer: function (a) {

        var qi = this.queue[this.queue_index];

        if (a.correct) {
            qi.known_count++;
            this.response_counts.known_count++;
            qi.progress++;
            this.trigger("queueChange", this.queueState());
            if (qi.progress >= this.games.length) {
                this.saveCardComplete(qi);
                this.queue[this.queue_index] = null;
            }

        } else if (a.timeout) {
            qi.timeout_count++;
            this.response_counts.timeout_count++;
        } else {
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
            function (data) {
                // don't really need to do anything
            });
    },
    afterShowCorrect: function () {
        this.showNextQuestion();
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
    showNextQuestion: function () {
        this.fillQueue();
        this.getNextQueueIndex();
        this.trigger("queueChange", this.queueState());

        if (this.queue_index > -1)
            this.showQuestion(this.queue_index);
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
    showQuestion: function () {
        var queue_item = this.queue[this.queue_index];
        /////////RIGHTNOW: WHAT TO DO ABOUT GAME TYPE?
        //// WHAT IS A QUEUE ITEM? HOW WILL WE HAVE OUR QUESTION TYPES ASSOCIATED WITH QUEUE ITEMS?
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