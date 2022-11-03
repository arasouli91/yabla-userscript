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