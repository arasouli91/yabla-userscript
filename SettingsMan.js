
//#region SettingsManager
function SettingsManager($elem) {
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
    init: function ($elem) {
        // if demo, make it easy
        if (window.location.href.match(/set_id/g)) {
            this.defaults.queue_size = 3;

        }
        this.$e = $elem;
        this.bindEvents();
        if (IS_ASSIGNED) {
            this.useAssignmentMode();
        }


    },
    bindEvents: function () {
        var me = this;
        $('.show_settings').bind(CLICK, function (e) {
            e.preventDefault();
            me.show();
        });
        this.$e.find('.save').bind(CLICK, function (e) {
            e.preventDefault();
            me.save();
        });
        this.$e.find('.cancel').bind(CLICK, function (e) {
            e.preventDefault();
            me.hide()
        });

    },
    useAssignmentMode: function () {
        var obj = this.get();
        obj.queue_size = 5;
        obj.ignore_accents = false;
        this.setValues(obj);
        $('[name=queue_size], [name=ignore_accents]').prop('disabled', true);
    },
    save: function () {
        var s = this.readForm();
        this.setValues(s);
        this.hide();
    },
    setValues: function (obj) {
        window.localStorage.setItem('vocabSettings', JSON.stringify(obj));
        this.trigger('change');
    },
    set: function (key, value) {
        var opts = this.get();
        opts[key] = value;
        this.setValues(opts);
    },
    get: function (key) {
        var defaults = this.defaults;

        var storage_settings;
        var json_text;

        // use session storage
        try {
            json_text = window.localStorage.getItem('vocabSettings');
            storage_settings = $.parseJSON(json_text || '{}');
        } catch (e) {
            storage_settings = {};
        }
        // maintain cookie method (delete this July 2019)
        if (!json_text) {
            try {
                json_text = this.readCookie('vocabSettings');
                storage_settings = $.parseJSON(json_text || '{}');
            } catch (e) {
                storage_settings = {};
            }
        }
        var res = $.extend({}, defaults, storage_settings);
        if (key) {
            return res[key];
        }
        return res;

    },
    setForm: function (settings) {
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
    readForm: function () {
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
    show: function () {
        Timer.pause();
        this.setForm(this.get());
        Mask.show();
        Mask.$e.bind(CLICK, $.proxy(this.hide, this));
        var me = this;
        $(document).bind('keyup', function (e) {
            if (e.keyCode == 27)
                me.hide();
        });
        this.$e.show().positionAbsolute(.5, .33);

    },
    hide: function (e) {

        Timer.resume();
        this.$e.hide();
        $(document).unbind('keyup');
        $(document).unbind('resize');
        Mask.$e.unbind(CLICK);
        Mask.hide();
    },
    createCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

});
//#endregion SettingsManager
