
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
