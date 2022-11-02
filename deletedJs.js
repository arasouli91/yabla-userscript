

/* line 403
$.replaceFunkyQuotes = function(str) {
	var fixed = str
		.replace(/’/g,"'")
		.replace(/‘/g,"'")
		.replace(/”/g,'"')
		.replace(/“/g,'"');
	return fixed;
}

var IS_IPAD = false;
var IS_TOUCH_DEVICE = !!('ontouchstart' in window);
var CLICK = IS_TOUCH_DEVICE ? 'click' : 'click';
var IS_ASSIGNED = false;

var AudioPlayer = {};

var SpeechRecognitionSupported = false;
(function() {
	window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
	if ('SpeechRecognition' in window && window.SpeechRecognition) {
		SpeechRecognitionSupported = true;
	}
})();
*/


/* line 448 undearneath if(IS_TOUCH_DEVICE) {  
	$.ajax({
		url: '/js/soundmanager2/soundmanager2-jsmin.js',
		dataType: 'script',
		success: function()
		{
			window.soundManager = new SoundManager(); // Flash expects window.soundManager.

			soundManager.debugMode = false;
			soundManager.defaultOptions.volume = 50
			soundManager.debugFlash = false;
			soundManager.url = '/js/soundmanager2/';
			soundManager.debugMode = false;
			soundManager.flashVersion = 8;
			soundManager.beginDelayedInit();
			soundManager.onready(function () {
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
				if(IS_IPAD)
					$(function(){
						$('body').bind('touchend',preloadAudio);
					});

				// fix missing audio by replacing the audio file from Forvo
				CARDS.map(function(card, i) {
					var a = new Audio(card.front_audio_file);
					a.onerror = function() {
						// for words like 'el cáscara', forvo doesn't return a result
						// so remove the first word lik 'el' and 'la'
						var word = card.front;
						var word_split = card.front.split(' ');
						if (word_split.length == 2 && (word_split[0] == 'el' || word_split[0] == 'la')) {
							word = word_split[1];
						}

						$.get('free-dictionary.php', {
							"word": word,
							"action": "get_audio_data",
							"player_lang_id": OPTS.lang_id
						}, function (data) {

							// no result as empty array string
							if (data == '[]') {
								// show some error msg?
							} else {
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

function initAudio() {

	for(var i = 0;i<CARDS.length;i++) {

		if (CARDS[i].front_audio_file) {
			CARDS[i].front_audio = soundManager.createSound(
				{
					id: CARDS[i].front_audio_file,
					url:CARDS[i].front_audio_file,
					volume:80,
					onload: preloadAudio
				}
			);
		}
	}

}
var preload_index = 0
function preloadAudio() {
	if(gc && gc.card_index + 10 < preload_index) {
		return;
	}
	if(preload_index < CARDS.length) {
		if(CARDS[preload_index].front_audio) {
			CARDS[preload_index++].front_audio.load();
		} else {
			preload_index++;
			preloadAudio();
		}
	}
};


$.clamp = function(v,min,max) {
	return Math.min(Math.max(v,min),max);
}
$.shuffle = function(arr) {
	var r, t;
	for(var i = 0,l = arr.length;i<l;i++) {
		t = arr[i];
		r = Math.floor(Math.random() * l);
		arr[i] = arr[r];
		arr[r] = t;
	}
}
$.fn.positionAbsolute = function(x_pct,y_pct) {
	x_pct = x_pct === undefined && .5 || x_pct;
	y_pct = y_pct === undefined && .5 || y_pct;

	return this.each(function() {
		var $e = $(this);
		$e.css(
			{
				left: Math.max(($(window).width() - $e.outerWidth()) * x_pct,0),
				top: Math.max(($(window).height() - $e.outerHeight()) * y_pct,0)
			}
		)
	});
}

var event_mixin = {
	bind :function(e,handler) {
		this.$e.bind(e,handler);
		return this;
	},
	trigger : function(e,obj) {
		this.$e.trigger(e,[obj]);
		return this;
	}
};
var display_mixin = {
	hide: function() {
		this.$e.hide();
		return this;
	},
	show: function() {
		this.$e.show();
		return this;
	}
};
//above var Mask={}*/



function insertAtCaret(obj, text) {
	if(document.selection) {
		obj.focus();
		var orig = obj.value.replace(/\r\n/g, "\n");
		var range = document.selection.createRange();

		if(range.parentElement() != obj) {
			return false;
		}

		range.text = text;

		var actual, tmp;
		actual = tmp = obj.value.replace(/\r\n/g, "\n");

		for(var diff = 0; diff < orig.length; diff++) {
			if(orig.charAt(diff) != actual.charAt(diff)) break;
		}

		for(var index = 0, start = 0;
			tmp.match(text)
				&& (tmp = tmp.replace(text, ""))
				&& index <= diff;
			index = start + text.length
		) {
			start = actual.indexOf(text, index);
		}
	} else if(obj.selectionStart) {
		var start = obj.selectionStart;
		var end   = obj.selectionEnd;

		obj.value = obj.value.substr(0, start)
			+ text
			+ obj.value.substr(end, obj.value.length);
	}

	if(start != null) {
		setCaretTo(obj, start + text.length);
	} else {
		obj.value += text;
	}
}

function setCaretTo(obj, pos) {
	if(obj.createTextRange) {
		var range = obj.createTextRange();
		range.move('character', pos);
		range.select();
	} else if(obj.selectionStart) {
		obj.focus();
		obj.setSelectionRange(pos, pos);
	}
}