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
            { type: "image", label: "Type Answer: Pīnyīn", preselected: true },
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
