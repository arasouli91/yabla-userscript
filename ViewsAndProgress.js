
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
