$(function(){
	function hideDropdowns(){
		$('.dropdown').hide();
		edMenuDismiss(true);
	}
	$('header .user').on('click touchend',function(e){
		e.stopPropagation();
		e.preventDefault();
		var $user_dd = $('header .user-dropdown');
		if($user_dd.is(':visible')) {
			$(window).off('.user-dd');
			$user_dd.hide();
			return;
		}
		hideDropdowns();
		$user_dd.show();
		$(window).on('click.user-dd touchend.user-dd',function (e){
			console.log("window click ");
			console.log(e);
			if($(e.target).closest('.dropdown').length) {
				console.log("event contains target");
				return;
			}
			$user_dd.hide();
			$(window).off('.user-dd');
		});
	});
	$('header .select-lang').on('click touchend',function(e){
		e.stopPropagation();
		e.preventDefault();
		var $lang_dd = $('header .lang-dropdown');
		if($lang_dd.is(':visible')) {
			$(window).off('.lang-dd');
			$lang_dd.hide();
			return;
		}
		hideDropdowns();
		$lang_dd.show();
		$(window).on('click.lang-dd touchend.lang-dd',function (e){
			if($(e.target).closest('.dropdown').length) return;
			$lang_dd.hide();
			$(window).off('.lang-dd touchend.lang-dd');
		});
	});
	$('header .translate-link').on('click touchend',function(e){
		e.stopPropagation();
		var $translate_dd = $('header .translate-dropdown');
		if($translate_dd.is(':visible')) {
			$(window).off('.lang-dd');
			$translate_dd.hide();
			return;
		}
		hideDropdowns();
		$translate_dd.show();
		$(window).on('click.trans-dd touchend.trans-dd',function (e){
			if($(e.target).closest('.dropdown').length) return;
			$translate_dd.hide();
			$(window).off('.trans-dd');
		});
	});
	$('header .mobile_slide').on('touchend click',function(e){
		e.stopPropagation();
	});
	$('header .mobile_slide .close_link').on('touchend click',function(){
		$('header .mobile_slide').removeClass('active');
		$('body').off('.burger');
	});
	$('header #site-hamburger').on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		$('header .mobile_slide').addClass('active');
		$('body').on('touchend.burger click.burger',function(e){
			if($(e.target).closest('.mobile_slide').length) {
				return;
			} else {
				$('header .mobile_slide').removeClass('active');
				$('body').off('.burger');
			}
		});
	});


	$('.ed_menu_btn').on('click touchend',function(e) {
		e.stopPropagation();
		e.preventDefault();
		
		if($(this).hasClass('showing')) {
			edMenuDismiss();
		} else {
			hideDropdowns();
			edMenuShow();
			$('body').on('click.ed_cancel touchend.ed_cancel',function(e){
				if($(e.target).closest('#modal_master').length) {
					return;
				}
				
				edMenuDismiss();
				$(this).off('.ed_cancel');
			});
		}
	})

	$('.ed_menu').find('a').on('click touchend',function(e){
		e.stopPropagation();
	}).end()

	var ed_interval;
	var history_pushes = 0;
	function  edMenuShow() {
		if(history_pushes == 0) {
			window.history.pushState({ action: 'ed_menu_show' }, 'Educators Menu');
			history_pushes++;
			$(window).on('popstate.ed_pop',function(e) {
				history_pushes--;
				edMenuDismiss();
			});
		}
		
		clearTimeout(ed_interval);
		$('.ed_menu').show().stop().removeClass('hiding');
		$('.ed_menu_btn').addClass('showing');
		// refresh if expired...
		$.get('ed_menu_check.php',
			{ last_changed_at: $('.ed_menu').data('last_changed_at') },
			function(data){
				if(data.html) {
					// a bit ugly, but prevents flickering
					$('.ed_menu .ed_menu_inner').replaceWith( $(data.html).find('.ed_menu_inner') );
				}
				
			});
	}
	function edMenuDismiss(fast) {
		// 
		if(history_pushes == 1) {
			window.history.back();
			return;
		}
		$('.ed_menu').addClass('hiding');
		ed_interval = setTimeout(function(){
			$('.ed_menu').hide();
		},fast ? 0 : 400)
		
		$('.ed_menu_btn').removeClass('showing');
		$(window).off('.ed_pop');
		
	}
	$('.ed_menu .invite').on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		var $dialog = $('.ed_code_signup')
			.addClass('hide_teacher_text hide_student_text')
			.removeClass('hide_' + $(this).data('user_type') + '_text');

		$dialog.find('[name=code_url]').val( $(this).data('url') );
		$dialog.find('.text_code').text( $(this).data('code') );
		Modal_Master.show($('.ed_code_signup'));
		$dialog.find('[name=code_url]').focus();
	})

})

$(function() {
	
	var CardView = {
		current_page: 0,
		cards_per_page: 50, 
		total_cards: 1865,
		$e: $('#card_table'),
		$top: $('#hdr'),
		init: function() {
			var self = this;
			this.$e.find('.prev').on('click touchend',function(e) {
				e.preventDefault();
				self.loadCards(Math.max(0,self.current_page - 1));
			});
			this.$e.find('.next').on('click touchend',function(e) {
				e.preventDefault();
				self.loadCards(
					Math.min( 
						self.current_page + 1, 
						Math.ceil(self.total_cards/self.cards_per_page) ) );
			});
			this.$e.find('.show_all').on('click touchend',function(e){
				e.preventDefault();
				self.loadCards('all');
			});
			this.$e.find('.delete_all').on('click',function(e){
				e.preventDefault();
				self.deleteAll();
			});
			this.delegateDelete();
			$('#vocabulary_delete_warning .btn-cancel').on('click',function(){ 
				Modal_Master.dismiss() 
			});

			this.$e.on('click touchend','.play_audio',function(e) {
				e.preventDefault();
				var card = $(this).closest('tr').data('card');
				self.playAudio(card.audio_url);
			});
			this.$e.on('click touchend','.edit',function(e) {
				e.preventDefault();
				var card = $(this).closest('tr').data('card');
				self.showForm(card,$(this));
			});
			this.$e.find('.show_create').on('click touchend',function(e) {
				e.preventDefault();
				var card = $(this).closest('tr');
				self.showForm({},$(this),true);
			});
			var mastery_toggle = 0;
			this.$e.on('click touchend','th.mastery',function() {
				var dir = mastery_toggle++ % 2 == 1 ? 'asc' : 'desc';
				self.loadCards(0,'mastery_' + dir)
			});
			var sch_toggle = 0;
			this.$e.on('click touchend','th.sch_at',function() {
				var dir = sch_toggle++ % 2 == 1 ? 'asc' : 'desc';
				self.loadCards(0,'sch_' + dir)
			});

			this.initForm($('.edit_form'));

			this.initTradToggle();



			this.$e.find('.total').text(this.total_cards);
			return this;
		},
		delegateDelete: function() {
			var self = this;
			$(document).on('click','.delete_card',function(){
				var $tr = $(this).closest('tr');
				var card_id = $tr.attr('id');
				$.post('vocabulary.php',{
					action:'delete',
					card_id: card_id
					},function(){
						$tr.fadeOut(function(){
							$tr.remove();
						});
					});
				self.updateCount();
				return false;
			});
		},
		updateCount: function() {
			this.total_cards--;
			this.$e.find('.total').text(this.total_cards);
			var temp_cards_per_page = this.$e.find('.end').text();
			temp_cards_per_page--;
			this.$e.find('.end').text(temp_cards_per_page);
			var urgent_card_count = this.$top.find('.urgent_card_count').text();
			urgent_card_count--;
			this.$top.find('.urgent_card_count').text(urgent_card_count);
		},
		deleteAll: function() {
			var self = this;
			var	end_count = Math.min((self.current_page+1)* self.cards_per_page,self.total_cards);
			if(self.current_page == 'all') {
				$('#vocabulary_delete_warning .end_count').text(self.total_cards)
				$('#vocabulary_delete_warning input[name="end"]').val(self.total_cards)
				$('#vocabulary_delete_warning input[name="start"]').val(0)
			}else{
				$('#vocabulary_delete_warning .end_count').text(end_count)
				$('#vocabulary_delete_warning input[name="end"]').val(end_count)
				$('#vocabulary_delete_warning input[name="start"]').val( self.current_page * self.cards_per_page)
			}

			Modal_Master.show($('#vocabulary_delete_warning'));
		},
		last_orderby: '',
		loadCards: function(page, orderby) {
			var self = this;
			if(orderby == null) orderby = this.last_orderby;
			this.last_orderby = orderby;

			$.getJSON('vocabulary.php', 
				{ cards: 1, page: page, orderby: orderby },
				function(data){
					self.current_page = page;
					self.$e.find('tbody').empty()
					$.each(data,function(k,c) {
						var $html = self.makeRowForCard(c);
						
						self.$e.find('tbody').append($html);
					});
					self.updateButtons();
			});
			
			return this;
			
		},
		makeRowForCard: function(c) {
			var html = '<tr id="'+c.card_id+'">'
				+ '<td class="audio_cell"><i class="fa fa-volume-up play_audio"></i>'
				+ '<td class="card_text">'
				+  '<span class="zh_CN">' + c.zh_CN + '</span>'
				+  '<span class="zh_TW">' + c.zh_TW + '</span>'
				+  ' <i class="sep">::</i> <span class="pinyin">' + c.pinyin + '</span>'
				+  ' <i class="sep mean">::</i> <span class="meaning">' + c.meaning_trimmed + '</span>'
				+  '  <i class="fa fa-pencil edit"></i>'
				+ '</td>'
				+ '<td>'
				+  '<div class="progress">'
				+  '<div class="bar" style="width:' + c.percent_mastered	+ '%"></div>'
				+  '</div>'
				+ '</td><td>'
			 	+   c.scheduled 
				+ '</td>'
				+ '<td class="delete_cell"><a href="#" class="delete_card"><i class="fa fa-trash"></i></a></td>'
				+ '</tr>';
			var $html = $(html).data('card',c);
			return $html;
		},
		updateButtons: function() {
			this.$e.find('.prev, .next').show();
			if (this.current_page == 0) 
				this.$e.find('.prev').hide();
			if ( (this.current_page + 1) * this.cards_per_page >= this.total_cards) 
				this.$e.find('.next').hide();
			if(this.current_page == 'all' || this.total_cards <= this.cards_per_page) {
				this.$e.find('.num_nav, .show_all').hide();
			}
			this.$e.find('.start').text(this.current_page * this.cards_per_page +1);
			this.$e.find('.end').text( Math.min( (this.current_page+1)* this.cards_per_page,this.total_cards));
			return this;
		},
		playAudio: function(url) {
			var a = new Audio(url);
			a.play();
		},
		initTradToggle: function() {


			this.$e.find('.do_show_trad').on('click',function(){
				$(this).closest('#card_list').addClass('show_trad');
				Cookies.set('prefer_trad_chars',1,100);
			});
			this.$e.find('.do_show_simp').on('click',function(){
				$(this).closest('#card_list').removeClass('show_trad');
				Cookies.delete('prefer_trad_chars');
			});
			if(Cookies.get('prefer_trad_chars')) {
				this.$e.find('.do_show_trad').trigger('click');
			}
		},
		initForm: function($form) {
			var self = this;
			$form.on('click',function(e) {
				e.stopPropagation();
			})

			$form.find('.form_close').on('click',function(){
				$form.hide();
			});
			$form.find('button[type="submit"]').on('click',function(){
				self.submitForm($form);
			});
			$form.find('button.btn-cancel').on('click',function() {
				$form.hide();
			});
			$form.find('[name=pinyin]').enable_pinyin_input();
			$form.find('.auto_hanzi,.auto_pinyin').on('click',function(){
				$(this).toggleClass('disabled');
			});
			// auto traditional / Simplified
			$form.find('[name=zh_CN],[name=zh_TW]').on('input',function(){
				if($form.find('.auto_hanzi').hasClass('disabled')) return;

				var $target,from_lang_id,to_lang_id;
				if($(this).attr('name') == 'zh_CN') {
					$target = $form.find('[name=zh_TW]');
					to_lang_id = 'zh_TW';
					from_lang_id = 'zh_CN';
				} else {
					$target = $form.find('[name=zh_CN]');
					to_lang_id = 'zh_CN';
					from_lang_id = 'zh_TW';
				}
				$.get('', {
					action:'translate',
					from_lang_id:from_lang_id,
					to_lang_id:to_lang_id,
					word: $(this).val()
					}, function(r){
						$target.val(r.word)
					}
				);
			});
			// auto pinyin
			$form.find('[name=zh_CN],[name=zh_TW]').on('input',function(){
				if($form.find('.auto_pinyin').hasClass('disabled')) return;
				
				var $target = $form.find('[name=pinyin]');
				var to_lang_id = 'zh_CN_US';
				var from_lang_id;
				
				if($(this).attr('name') == 'zh_CN') {
					from_lang_id = 'zh_CN';
				} else {
					from_lang_id = 'zh_TW';
				}
				$.get('', {
					action:'translate',
					from_lang_id:from_lang_id,
					to_lang_id:to_lang_id,
					word: $(this).val()
					}, function(r){
						$target.val(r.word)
					}
				);

			});
			// auto show dictionary results when creating
			$form.find('[name=zh_CN],[name=zh_TW]').on('blur',function(){
				if(!(this).val()) return;
				if(!$form.hasClass('is_card_create')) return;

				var from_lang_id = $(this).attr('name');
				var $target = $form.find('.dict_help');
				$.get('', {
					action:'definition_hint',
					from_lang_id:from_lang_id,
					to_lang_id:'en',
					word: $(this).val()
					}, function(r){
						console.log(r.definition);
						$target.html(r.definition.text)
					}
				);

			});
		},	
		showForm: function(card,$el,is_card_create) {
			card = card || {};
			var $row = $el.closest('tr');
			var $form = $('.edit_form');

			$form.data('card',card)
				.data('is_card_create',is_card_create)
				.data('$row',$row)
				[is_card_create ? "addClass" : "removeClass"]('is_card_create');
			$form.find('[name=zh_CN]').val(card.zh_CN).end()
				.find('[name=zh_TW]').val(card.zh_TW).end()
				.find('[name=pinyin]').val(card.pinyin).end()
				.find('[name=meaning_trimmed]').val(card.meaning_trimmed).end()
				.appendTo('body')
				.show();
			var form_height = $form.outerHeight();
			var row_height = $row.outerHeight();
			var row_pos = $row.offset();
			var screen_width = $(window).innerWidth();
			if(screen_width < 500) {
				$form.css({ top: row_pos.top + row_height + 2, left:0 })
			} else {
				$form.css({ top: row_pos.top + row_height + 2, left:row_pos.left + 40 })
			}
			
			
		},
		submitForm($form) {
			var self = this;
			var is_card_create = $form.data('is_card_create')
			var card = $form.data('card');
			var $target_row = $form.data('$row');
			$.post('?action=edit_card',{
					card_id: card.card_id,
					zh_CN: $form.find('[name=zh_CN]').val(),
					zh_TW: $form.find('[name=zh_TW]').val(),
					pinyin: $form.find('[name=pinyin]').val(),
					meaning_trimmed: $form.find('[name=meaning_trimmed]').val()

				},function(new_card){
					var $new_row = self.makeRowForCard(new_card);
					if(is_card_create) {
						$new_row.prependTo( $('#card_list tbody') );
					} else {
						$new_row.insertAfter($target_row);
						$target_row.remove();
					}
					$new_row.addClass('edit_flash animate_bg');
					setTimeout(function(){
						$new_row.removeClass('edit_flash');
					},1)

					
				}
			);


			$form.hide();
		}
	}
	CardView.init().loadCards(0);
	
	function renderCharts() {
		var data = [[1641099600000,0],[1641186000000,0],[1641272400000,0],[1641358799999,0],[1641358800000,"45"],[1641445199999,"45"],[1641445200000,"137"],[1641790799999,"137"],[1641790800000,"382"],[1641877199999,"382"],[1641877200000,"656"],[1641963599999,"656"],[1641963600000,"863"],[1642049999999,"863"],[1642050000000,"902"],[1642481999999,"902"],[1642482000000,"1083"],[1642827599999,"1083"],[1642827600000,"1107"],[1643000399999,"1107"],[1643000400000,"1239"],[1643259599999,"1239"],[1643259600000,"1271"],[1643345999999,"1271"],[1643346000000,"1346"],[1643605199999,"1346"],[1643605200000,"1483"],[1643691599999,"1483"],[1643691600000,"1698"],[1643777999999,"1698"],[1643778000000,"1773"],[1643864399999,"1773"],[1643864400000,"1925"],[1644123599999,"1925"],[1644123600000,"2108"],[1644209999999,"2108"],[1644210000000,"2412"],[1644469199999,"2412"],[1644469200000,"2578"],[1644814799999,"2578"],[1644814800000,"2623"],[1645505999999,"2623"],[1645506000000,"2873"],[1645592399999,"2873"],[1645592400000,"2961"],[1645678799999,"2961"],[1645678800000,"3138"],[1645765199999,"3138"],[1645765200000,"3192"],[1645851599999,"3192"],[1645851600000,"3207"],[1646024399999,"3207"],[1646024400000,"3389"],[1646110799999,"3389"],[1646110800000,"3517"],[1646197199999,"3517"],[1646197200000,"3696"],[1646283599999,"3696"],[1646283600000,"3945"],[1646369999999,"3945"],[1646370000000,"4045"],[1646715599999,"4045"],[1646715600000,"4158"],[1646801999999,"4158"],[1646802000000,"4198"],[1646888399999,"4198"],[1646888400000,"4399"],[1646974799999,"4399"],[1646974800000,"4644"],[1647230399999,"4644"],[1647230400000,"4665"],[1647316799999,"4665"],[1647316800000,"4974"],[1647403199999,"4974"],[1647403200000,"5001"],[1647575999999,"5001"],[1647576000000,"5202"],[1647748799999,"5202"],[1647748800000,"5242"],[1647835199999,"5242"],[1647835200000,"5482"],[1647921599999,"5482"],[1647921600000,"6039"],[1648007999999,"6039"],[1648008000000,"6205"],[1648094399999,"6205"],[1648094400000,"6386"],[1648180799999,"6386"],[1648180800000,"6587"],[1648353599999,"6587"],[1648353600000,"6688"],[1648439999999,"6688"],[1648440000000,"6841"],[1648526399999,"6841"],[1648526400000,"6954"],[1648612799999,"6954"],[1648612800000,"7082"],[1648699199999,"7082"],[1648699200000,"7473"],[1648785599999,"7473"],[1648785600000,"7501"],[1648871999999,"7501"],[1648872000000,"7768"],[1648958399999,"7768"],[1648958400000,"8562"],[1649217599999,"8562"],[1649217600000,"8894"],[1649303999999,"8894"],[1649304000000,"9068"],[1649476799999,"9068"],[1649476800000,"9320"],[1649735999999,"9320"],[1649736000000,"9562"],[1649822399999,"9562"],[1649822400000,"9643"],[1649908799999,"9643"],[1649908800000,"9683"],[1649995199999,"9683"],[1649995200000,"9763"],[1650254399999,"9763"],[1650254400000,"9843"],[1650427199999,"9843"],[1650427200000,"9959"],[1650513599999,"9959"],[1650513600000,"10043"],[1650772799999,"10043"],[1650772800000,"10116"],[1650859199999,"10116"],[1650859200000,"10512"],[1651031999999,"10512"],[1651032000000,"10749"],[1651118399999,"10749"],[1651118400000,"10805"],[1651204799999,"10805"],[1651204800000,"11210"],[1651550399999,"11210"],[1651550400000,"11246"],[1651636799999,"11246"],[1651636800000,"11282"],[1651723199999,"11282"],[1651723200000,"11499"],[1651809599999,"11499"],[1651809600000,"11539"],[1651895999999,"11539"],[1651896000000,"11557"],[1651982399999,"11557"],[1651982400000,"11811"],[1652155199999,"11811"],[1652155200000,"11891"],[1652846399999,"11891"],[1652846400000,"11966"],[1653019199999,"11966"],[1653019200000,"12106"],[1654401599999,"12106"],[1654401600000,"12209"],[1654660799999,"12209"],[1654660800000,"12394"],[1654919999999,"12394"],[1654920000000,"12495"],[1655006399999,"12495"],[1655006400000,"12535"],[1655092799999,"12535"],[1655092800000,"12562"],[1655265599999,"12562"],[1655265600000,"12664"],[1655351999999,"12664"],[1655352000000,"12779"],[1655524799999,"12779"],[1655524800000,"12809"],[1655697599999,"12809"],[1655697600000,"13095"],[1655783999999,"13095"],[1655784000000,"13141"],[1655870399999,"13141"],[1655870400000,"13342"],[1656388799999,"13342"],[1656388800000,"13529"],[1656820799999,"13529"],[1656820800000,"13565"],[1656907199999,"13565"],[1656907200000,"13754"],[1657339199999,"13754"],[1657339200000,"13822"],[1657425599999,"13822"],[1657425600000,"14096"],[1657684799999,"14096"],[1657684800000,"14219"],[1657943999999,"14219"],[1657944000000,"14225"],[1658030399999,"14225"],[1658030400000,"15023"],[1658116799999,"15023"],[1658116800000,"15341"],[1658289599999,"15341"],[1658289600000,"15698"],[1658375999999,"15698"],[1658376000000,"15944"],[1658721599999,"15944"],[1658721600000,"16047"],[1658894399999,"16047"],[1658894400000,"16120"],[1659153599999,"16120"],[1659153600000,"16383"],[1659239999999,"16383"],[1659240000000,"16515"],[1659326399999,"16515"],[1659326400000,"16656"],[1659412799999,"16656"],[1659412800000,"16790"],[1659499199999,"16790"],[1659499200000,"16850"],[1659585599999,"16850"],[1659585600000,"16932"],[1659758399999,"16932"],[1659758400000,"17445"],[1659844799999,"17445"],[1659844800000,"17560"],[1660103999999,"17560"],[1660104000000,"17635"],[1660795199999,"17635"],[1660795200000,"17695"],[1660881599999,"17695"],[1660881600000,"17762"],[1661227199999,"17762"],[1661227200000,"17865"],[1661572799999,"17865"],[1661572800000,"17985"],[1661745599999,"17985"],[1661745600000,"18101"],[1661831999999,"18101"],[1661832000000,"18429"],[1661918399999,"18429"],[1661918400000,"18718"],[1662004799999,"18718"],[1662004800000,"18854"],[1662091199999,"18854"],[1662091200000,"18994"],[1662263999999,"18994"],[1662264000000,"19281"],[1662350399999,"19281"],[1662350400000,"19574"],[1662436799999,"19574"],[1662436800000,"19844"],[1662523199999,"19844"],[1662523200000,"20041"],[1662609599999,"20041"],[1662609600000,"20121"],[1662695999999,"20121"],[1662696000000,"20284"],[1662955199999,"20284"],[1662955200000,"20375"],[1663041599999,"20375"],[1663041600000,"20451"],[1663300799999,"20451"],[1663300800000,"21191"],[1663387199999,"21191"],[1663387200000,"21200"],[1663559999999,"21200"],[1663560000000,"21274"],[1663819199999,"21274"],[1663819200000,"21318"],[1663905599999,"21318"],[1663905600000,"21369"],[1664942399999,"21369"],[1664942400000,"21447"],[1665028799999,"21447"],[1665028800000,"21471"],[1665115199999,"21471"],[1665115200000,"21681"],[1665201599999,"21681"],[1665201600000,"22216"],[1665287999999,"22216"],[1665288000000,"22261"],[1665460799999,"22261"],[1665460800000,"22337"],[1665806399999,"22337"],[1665806400000,"22457"],[1665892799999,"22457"],[1665892800000,"22642"],[1665979199999,"22642"],[1665979200000,"22813"],[1666065599999,"22813"],[1666065600000,"22842"],[1666151999999,"22842"],[1666152000000,"22923"],[1666238399999,"22923"],[1666238400000,"23157"],[1666497599999,"23157"],[1666497600000,"23419"],[1666583999999,"23419"],[1666584000000,"23752"],[1666670399999,"23752"],[1666670400000,"23783"],[1666843199999,"23783"],[1666843200000,"23783"]];
		$.plot($('#time_chart'),
			[
				{ 
					data: data,
					color: 'rgba(34,74,154,1)',
					shadowSize: 2,
					lines: { lineWidth: 6,fill: true, fillColor: 'rgba(34,74,154,.5)' } 
				}
			],
			{ 
				xaxis: { 
					mode: "time",
					tickLength: 0,
					autoScaleMargin: 1,

				},
				yaxis: {
					tickLength: 0,
				},
				grid: {
					borderColor: '#bbb',
					margin: {
						right:25,
					}
				}
			}
		);
		var hdata = [[1,"163"],[2,"446"],[3,"367"],[4,"1155"]];
		$.plot($('#category_chart'),
			[
				{ 
					data: hdata,
					color: 'rgba(167,182,108,1)',
					shadowSize: 2,
					lines: { show:false },
					bars: { 
						show:true, 
						barWidth:0.5, 
						align: 'center', 
						lineWidth:0, 
						fillColor:'#f6822b' 
					},

				}
			],
			{
				xaxis: { 
					min: 0,
					max: 5,
					ticks: [[1,"New"],[2,"Reviewed"],[3,"Familiar"],[4,"Mastered"]],
					tickLength: 0,
					reserveSpace: false,
					margin:0,
				},
				yaxis: {
					tickLength: 0,
				},
				
				grid: { 
					show: true,
					borderColor: '#bbb',
					margin: {
						right:0,
					}
				}
				
			}
		)
	};
	renderCharts();
	$(window).on('resize',()=>renderCharts())

	if (typeof FeedbackModule !== 'undefined')  {
		FeedbackModule.init({ 
			page_key: 'chinese_vocab_list',
			feedback_title: 'How is the upgraded vocabulary review?',
			feedback_sub_title: 'Help us make it better.',
			show_revert: false,
		});
	}
});


</script>

</head>
<body class="page chinese_custom">

	

		
	
		<header class="logged-in  nav-items-5">
	<div class="container">
		<div id="site-title"><a href="./"><svg width="130" height="45" viewBox="0 0 130 45" fill="none" xmlns="http://www.w3.org/2000/svg">
<path class="letters" d="M47.1004 33.7999L41.2004 19.7C41.0004 19.2 40.9004 18.8 40.9004 18.4C40.9004 17.8 41.2004 17.2999 41.7004 16.7999C42.2004 16.3999 42.8004 16.2 43.4004 16.2C44.0004 16.2 44.6004 16.4 45.0004 16.7C45.5004 17 45.8004 17.5 46.0004 18L49.6004 27.6L53.5004 18C53.7004 17.4 54.1004 17 54.5004 16.7C55.0004 16.4 55.5004 16.2 56.1004 16.2C56.7004 16.2 57.3004 16.3999 57.8004 16.7999C58.3004 17.1999 58.6004 17.7 58.6004 18.4C58.6004 18.9 58.5004 19.3 58.3004 19.7L49.7004 41C49.1004 42.3 48.3004 43 47.2004 43C46.4004 43 45.7004 42.7999 45.2004 42.2999C44.7004 41.8999 44.4004 41.2999 44.4004 40.7999C44.4004 40.3999 44.5004 39.8999 44.7004 39.2999L47.1004 33.7999Z" fill="#224A9A"/>
<path class="letters" d="M78.1006 19.6V32.2C78.1006 33.2 78.0006 34 77.7006 34.6C77.4006 35.2 76.7006 35.5 75.6006 35.5C74.9006 35.5 74.3006 35.3 73.9006 35C73.5006 34.6 73.2006 34.1 73.0006 33.4C71.6006 35 69.9006 35.8 67.9006 35.8C66.3006 35.8 64.8006 35.4 63.4006 34.5C62.1006 33.7 61.0006 32.5 60.2006 31C59.4006 29.5 59.1006 27.8 59.1006 25.9C59.1006 24.1 59.5006 22.4 60.3006 20.9C61.1006 19.4 62.1006 18.2 63.5006 17.3C64.8006 16.4 66.3006 16 67.9006 16C68.9006 16 69.8006 16.2 70.8006 16.6C71.7006 17 72.4006 17.6 73.0006 18.3C73.1006 17.7 73.4006 17.2 73.8006 16.8C74.3006 16.4 74.9006 16.2 75.5006 16.2C76.6006 16.2 77.3006 16.5 77.6006 17.1C78.0006 17.8 78.1006 18.6 78.1006 19.6ZM64.5006 25.9C64.5006 26.8 64.7006 27.6 65.0006 28.4C65.3006 29.2 65.8006 29.8 66.4006 30.3C67.0006 30.8 67.8006 31 68.7006 31C70.0006 31 71.0006 30.5 71.7006 29.4C72.4006 28.4 72.8006 27.2 72.8006 25.8C72.8006 24.9 72.6006 24.1 72.3006 23.3C72.0006 22.5 71.5006 21.8 70.9006 21.3C70.3006 20.8 69.5006 20.5 68.7006 20.5C67.8006 20.5 67.0006 20.8 66.4006 21.3C65.8006 21.8 65.3006 22.5 65.0006 23.3C64.7006 24.2 64.5006 25.1 64.5006 25.9Z" fill="#224A9A"/>
<path class="letters" d="M80.8008 32.7V10.9C80.8008 10.1 81.0008 9.4 81.5008 8.9C82.0008 8.3 82.7008 8 83.5008 8C84.0008 8 84.5008 8.1 84.9008 8.4C85.3008 8.6 85.6008 9 85.8008 9.4C86.0008 9.8 86.1008 10.3 86.1008 10.9V17.8C86.8008 17.2 87.6008 16.8 88.4008 16.5C89.3008 16.2 90.2008 16 91.1008 16C92.9008 16 94.5008 16.5 95.8008 17.4C97.1008 18.4 98.1008 19.6 98.7008 21.2C99.4008 22.7 99.7008 24.4 99.7008 26.1C99.7008 27.7 99.3008 29.3 98.6008 30.7C97.9008 32.2 96.8008 33.4 95.5008 34.3C94.2008 35.2 92.6008 35.7 90.9008 35.7C89.9008 35.7 89.0008 35.5 88.1008 35.1C87.2008 34.7 86.5008 34.1 86.0008 33.4C85.6008 34.8 84.7008 35.5 83.3008 35.5C82.5008 35.5 81.9008 35.2 81.4008 34.7C81.0008 34.2 80.8008 33.5 80.8008 32.7ZM86.1008 25.7C86.1008 27.1 86.5008 28.3 87.2008 29.4C87.9008 30.5 88.9008 31 90.3008 31C91.2008 31 91.9008 30.7 92.6008 30.2C93.2008 29.7 93.7008 29 94.0008 28.3C94.3008 27.5 94.5008 26.7 94.5008 25.9C94.5008 25 94.3008 24.2 94.0008 23.4C93.7008 22.6 93.2008 21.9 92.6008 21.4C92.0008 20.9 91.2008 20.6 90.3008 20.6C89.4008 20.6 88.6008 20.8 88.0008 21.3C87.4008 21.8 86.9008 22.4 86.6008 23.2C86.3008 24 86.1008 24.9 86.1008 25.7Z" fill="#224A9A"/>
<path class="letters" d="M101.601 32.7V10.9C101.601 10.1 101.801 9.39997 102.301 8.89997C102.801 8.39997 103.401 8.09998 104.201 8.09998C104.701 8.09998 105.201 8.19998 105.601 8.49998C106.001 8.69998 106.301 9.09998 106.501 9.49998C106.701 9.89998 106.801 10.4 106.801 11V32.8C106.801 33.4 106.701 33.8 106.501 34.3C106.301 34.7 106.001 35.1 105.501 35.3C105.101 35.5 104.601 35.7 104.101 35.7C103.301 35.7 102.701 35.4 102.201 34.9C101.801 34.2 101.601 33.5 101.601 32.7Z" fill="#224A9A"/>
<path class="letters" d="M127.7 19.6V32.2C127.7 33.2 127.6 34 127.3 34.6C127 35.2 126.3 35.5 125.2 35.5C124.5 35.5 123.9 35.3 123.5 35C123.1 34.6 122.8 34.1 122.6 33.4C121.2 35 119.5 35.8 117.5 35.8C115.9 35.8 114.4 35.4 113 34.5C111.7 33.7 110.6 32.5 109.8 31C109 29.5 108.7 27.8 108.7 25.9C108.7 24.1 109.1 22.4 109.9 20.9C110.7 19.4 111.7 18.2 113.1 17.3C114.4 16.4 115.9 16 117.5 16C118.5 16 119.4 16.2 120.4 16.6C121.3 17 122 17.6 122.6 18.3C122.7 17.7 123 17.2 123.4 16.8C123.9 16.4 124.5 16.2 125.1 16.2C126.2 16.2 126.9 16.5 127.2 17.1C127.5 17.8 127.7 18.6 127.7 19.6ZM114 25.9C114 26.8 114.2 27.6 114.5 28.4C114.8 29.2 115.3 29.8 115.9 30.3C116.5 30.8 117.3 31 118.2 31C119.5 31 120.5 30.5 121.2 29.4C121.9 28.4 122.3 27.2 122.3 25.8C122.3 24.9 122.1 24.1 121.8 23.3C121.5 22.5 121 21.8 120.4 21.3C119.8 20.8 119 20.5 118.2 20.5C117.3 20.5 116.5 20.8 115.9 21.3C115.3 21.8 114.8 22.5 114.5 23.3C114.2 24.2 114 25.1 114 25.9Z" fill="#224A9A"/>
<path class="tv_lines" d="M32.0489 38.2078L9.7048 39.1057L7.30462 36.9473V35.5486L4.38641 27.1739L2.84961 20.0597L3.62665 16.7616L15.9211 15.1212L29.5106 16.7616L34.4491 18.0394L36.1068 20.0597L33.5685 35.5486L32.0489 38.2078Z" fill="white"/>
<path class="tv_lines" d="M6.60352 34.844C10.7784 34.844 12.5315 29.922 12.5315 29.922C12.5315 29.922 15.1429 22.8409 21.542 23.2773C26.7842 23.6945 27.5722 21.882 27.47 17.1248" stroke="#F6822B" stroke-width="3.14738" stroke-linecap="square" stroke-linejoin="round"/>
<path class="tv_lines" d="M14.3711 38.97C17.028 37.6421 17.3796 34.3584 18.0907 31.7995C19.4192 27.0192 24.4673 28.4884 27.3899 27.8159C32.4784 26.645 34.0321 21.4421 34.0321 16.3962" stroke="#F6822B" stroke-width="2.09825"/>
<path class="tv" d="M31.5999 15.1C29.7999 14.8 26.5999 14.1 22.2999 13.7C22.4999 12.3 22.9999 10.3 24.1999 8.7C24.3999 8.8 24.5999 8.8 24.7999 8.8C25.7999 8.8 26.5999 8 26.5999 6.9C26.5999 5.9 25.7999 5.1 24.6999 5.1C23.6999 5.1 22.8999 5.9 22.8999 7C22.8999 7.2 22.8999 7.4 22.9999 7.6C21.3999 9.5 20.7999 11.9 20.5999 13.6C19.6999 13.5 18.6999 13.5 17.6999 13.4C17.4999 11.9 16.6999 8.9 14.5999 6.7C14.6999 6.5 14.7999 6.2 14.7999 5.9C14.8999 4.8 13.9999 4 12.9999 4C11.9999 4 11.1999 4.8 11.1999 5.9C11.1999 6.9 11.9999 7.7 13.0999 7.7C13.1999 7.7 13.3999 7.7 13.4999 7.6C15.2999 9.3 15.8999 11.8 16.1999 13.2C13.1999 13.1 9.7999 13.2 6.0999 13.6C0.299899 14.3 1.0999 19 1.0999 19C1.0999 19 1.9999 26.4 4.4999 36.2C5.4999 40.2 10.8999 39.9 10.8999 39.9L13.2999 39.8L12.1999 41.1C12.1999 41.1 11.3999 42.2 12.7999 42.3C14.1999 42.3 15.3999 42.6 15.7999 42C15.9999 41.7 16.7999 40.6 17.4999 39.7L22.1999 39.5C22.8999 40.5 23.6999 41.6 23.9999 41.9C24.3999 42.5 25.5999 42.2 26.9999 42.2C28.3999 42.2 27.5999 41 27.5999 41L26.1999 39.4L29.9999 39.3C33.2999 39.3 34.0999 37.8 34.5999 35.8C36.3999 28.9 36.9999 25.7 37.1999 20.9C37.4999 16.2 35.1999 15.7 31.5999 15.1ZM34.0999 21.9C33.8999 25.8 33.3999 28.4 31.8999 34.1C31.4999 35.8 30.7999 36.9 28.0999 37L12.2999 37.6C12.2999 37.6 7.8999 37.8 6.9999 34.6C4.8999 26.6 4.1999 20.5 4.1999 20.5C4.1999 20.5 3.4999 16.6 8.1999 16.1C18.7999 15.1 26.3999 16.7 29.2999 17.2C32.2999 17.8 34.2999 18.2 34.0999 21.9Z" fill="#224A9A"/>
</svg>
</a></div>	
		<nav id="page-nav">
			<ul>
										<li class=" ">
					<a href="videos.php?fn=1" class="">Videos</a>
				</li>
							<li class=" active">
					<a href="vocabulary.php" class="active">Vocabulary</a>
				</li>
							<li class=" ">
					<a href="chinese-english-pinyin-dictionary.php" class="">Dictionary</a>
				</li>
							<li class=" ">
					<a href="chinese-pinyin-chart.php" class="">Pinyin Chart</a>
				</li>
							<li class=" ">
					<a href="chinese-tones-learn-the-right-way-with-tone-pairs.php" class="">Tone Pairs</a>
				</li>
						
			</ul>
		</nav>
		<div class="user-opts">
			<a href="#" class="select-lang"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-zh_CN.png" width=30 height=30 class="lang-indicator"></a>
			<div class="lang-dropdown dropdown">
				<ul>
					<li class="label">Learn</li>
										<li><a href="https://spanish.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-es.png" class="lang-ind" /> Spanish</a></li>
										<li><a href="https://french.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-fr.png" class="lang-ind" /> French</a></li>
										<li><a href="https://german.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-de.png" class="lang-ind" /> German</a></li>
										<li><a href="https://italian.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-it.png" class="lang-ind" /> Italian</a></li>
										<li><a href="https://chinese.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-zh.png" class="lang-ind" /> Chinese</a></li>
										<li><a href="https://english.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-en.png" class="lang-ind" /> English</a></li>
									</ul>
			</div>

			<a href="#" class="user"> <i class="fa fa-user"></i> arasouli91 <i class="fa fa-chevron-down"></i></a>
			<div class="user-dropdown dropdown">
				<ul>
					<li><a href="myyabla_info.php"><i class="fa fa-user-circle-o"></i> Profile</a></li>
															<li><a href="myyabla_manage_subscriptions.php"><i class="fa fa-dollar"></i> Subscriptions &amp; Payment</a></li>
										<li><a href="myyabla_classes.php"><i class="fa fa-group"></i> Classes</a></li>
															<li><a href="leaderboard.php"><i class="fa fa-trophy"></i> Leaderboard &amp; Scores</a></li>
					<li class="group"><a href="logout.php">Sign Out</a></li>
																<li class="group label">Chinese Script</li>
						<li class="translation">
							<a href="set_zh_script.php?script_lang_id=CN&redirect=chinese.yabla.com/vocabulary.php">
								Simplified Characters <span class="check">✓</span>
							</a>
						</li>
						<li class="translation">
							<a href="set_zh_script.php?script_lang_id=TW&redirect=chinese.yabla.com/vocabulary.php">
								Traditional Characters <span class="check"></span>
							</a>
						</li>
									</ul>
			</div>
		</div>
		<div id="site-hamburger"><i class="fa fa-navicon"></i></div>
	</div>
		<div class="mobile_slide">
		<div class="mobile_scroll">
			<div class="mobile_product_name">Yabla Chinese</div>
			<div class="close_link"><i class="fa fa-times"></i></div>
			<ul class="links">
							<li >
					<a href="videos.php?fn=1" class="">Videos</a>
				</li>
							<li >
					<a href="vocabulary.php" class="active">Vocabulary</a>
				</li>
							<li >
					<a href="chinese-english-pinyin-dictionary.php" class="">Dictionary</a>
				</li>
							<li >
					<a href="chinese-pinyin-chart.php" class="">Pinyin Chart</a>
				</li>
							<li >
					<a href="chinese-tones-learn-the-right-way-with-tone-pairs.php" class="">Tone Pairs</a>
				</li>
						</ul>
			<ul class="learn_options">
				<li class="label">Learn</li>
								<li><a href="https://spanish.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-es.png" class="lang-ind" /> Spanish</a></li>
								<li><a href="https://french.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-fr.png" class="lang-ind" /> French</a></li>
								<li><a href="https://german.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-de.png" class="lang-ind" /> German</a></li>
								<li><a href="https://italian.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-it.png" class="lang-ind" /> Italian</a></li>
								<li><a href="https://chinese.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-zh.png" class="lang-ind" /> Chinese</a></li>
								<li><a href="https://english.yabla.com/"><img src="//yabla.vo.llnwd.net/media.yabla.com/images/lang_icons/icon-lang-en.png" class="lang-ind" /> English</a></li>
							</ul>
		</div>
		
	</div>
</header>



	
	
	

<div class="container" id="vocabulary">

<div id="hdr">
			<h1>You have <em class="urgent_card_count">926</em> words to review </h1>

		<div class="actions">
						<a href="vocabulary-flashcard-review.php?limit=25" class="btn cta review">Review 25 Words</a>
			<a href="vocabulary-flashcard-review.php?limit=50" class="btn cta review">Review 50 Words</a>
			<a href="vocabulary-flashcard-review.php" class="btn cta review">Review All Words</a>
					</div>
	</div>

 
<h2 class="progress_label reg">Your Progress</h2>
<div id="charts" class="">
	<div class="chart_wrap">
		<div class="chart_title">Total Correct Responses</div>
		<div class="chart" id="time_chart"></div>
	</div>
	<div class="chart_wrap">
		<div class="chart_title">Word Counts</div>
		<div class="chart" id="category_chart"></div>
	</div>
	<div style="clear:both"></div>
</div>


<div id="card_list">
  <table id="card_table"><thead>
	<tr>
		<td colspan=6>
			<div class="hl">Your Vocabulary Words</div>
			<a class="show_create"><i class="fa fa-plus"></i> Custom Card</a>
			<div class="hr">
				<span class="num_nav">
					<a href="#prev" class="prev"><i class="fa fa-chevron-left"></i></a> 
					Showing <span class="start"></span>-<span class="end"></span>
						of <span class="total"></span> 
					<a href="#next" class="next"><i class="fa fa-chevron-right"></i></a>
				</span>
				<a href="#all" class="show_all">Show all</a>
				<a href="" class="delete_all">Delete all showing</a>
			</div>
		</td>
	</tr>
	<tr>
		<th colspan="2">Cards
			<div class="toggle_trad">
				<span class="do_show_simp active">Simp.</span>
				|
				<span class="do_show_trad">Trad.</span>
			</div>
		</th>
		<th class="mastery">Mastery</th>
		<th colspan="2" class="sch_at">Scheduled</th>
	</tr></thead><tbody>
	</tbody></table>
</div>

<div class="edit_form">
	<div class="form_close"><i class="fa fa-close"></i></div>
	<div class="row">
		<label><span class="lbl">Simplified Chinese</span>
			<input type="text" name="zh_CN" class="form-input" placeholder="Simplified" /> 
		</label>
		<span class="auto_hanzi">⇌</span>
		<label><span class="lbl">Traditional Chinese</span>
			<input type="text" name="zh_TW" placeholder="Traditional" /> 
		</label>
		<span class="auto_pinyin">↦</span>
		<label><span class="lbl">Pinyin</span>
			<input type="text" name="pinyin" placeholder="Pinyin" /> 
		</label>
	</div>
	<div class="row">
		<label><span class="lbl">Card Back</span>
			<textarea name="meaning_trimmed" placeholder="Meaning"></textarea>
		</label>
		<div class="dict_help"><span class="placeholder">dictionary</div>
	</div>
	<button type="submit" class="btn btn-primary">Save</button>
	<button class="btn btn-cancel">Cancel</button>
</div>

  




<div class="clear"> </div>

<div id="vocabulary_delete_warning">

	<h2>Warning</h2>
	<h2 class="second"> You are about to delete<em class="end_count"></em>words from your vocabulary list.</h2>
	<b class="end_count_val"></b>
	<div class="start_count_val"></div>

	<form method="post" action="vocabulary.php">
		<input type="hidden" name="action" value="deleteAll">
		<input type="hidden" name="start">
	 	<input type="hidden" name="end" >

	    <div class="buttons">
	 		<button type="submit" name="MButton" value="Continue" class="btn btn-red">
	    		Delete
	  		</button>
	  		<button type="button" class="btn btn-cancel" >
	    		Cancel
	  		</button>
	  	</div>
	</form>

</div>

</div>


	
		<footer id="footer">
	<div class="container">
		<div class="row main-footer">
			<ul>
				<h3 class="reg">Yabla Languages</h3>
				<li><a href="https://spanish.yabla.com/">Learn Spanish</a></li>
								
					<li><a href="https://french.yabla.com/">Learn French</a></li>
					<li><a href="https://italian.yabla.com/">Learn Italian</a></li>
								<li><a href="https://german.yabla.com/">Learn German</a></li>
								
					<li><a href="https://chinese.yabla.com/">Learn Chinese</a></li>
								<li><a href="https://english.yabla.com/">Learn English</a></li>
			</ul>

			<ul>
				<h3 class="reg">Get Yabla</h3>
				<li><a href="subscribe.php">Buy Individual subscription</a></li>
				<li><a href="subscribe_group.php">Buy School/Organization subscription</a></li>
				<li><a href="subscribe_group.php">QUOTE for School/Organization</a></li>
				<li><a href="subscribe_join.php">Signup for students</a></li>
				<li><a href="code">Sign up with access code</a></li>
				<li><a href="gift_yabla.php">Send a Gift</a></li>

			</ul>

			<ul>
				<h3 class="reg">Help</h3>
				<li><a href="getting_started.php">Individuals - Getting Started</a></li>
				<li><a href="faq.php">Individuals - FAQ</a></li>
				<li><a href="faq.php#tutorial">Individuals - Video Tutorials</a></li>
				<li><a href="school_quickstart_guide.php">School Accounts - Getting Started</a></li>
				<li><a href="faq_group.php">School Accounts - FAQ</a></li>
				<li><a href="faq_group.php#tutorial">School Accounts - Video Tutorials</a></li>
				<li><a href="contact.php">Contact</a></li>
									<li><a href="type-chinese-characters.php">How to Type Chinese</a></li>
							</ul>

			<ul>

				<h3 class="reg">Yabla</h3>
									<li><a href="mailing_list.php">Yabla Newsletter Signup</li>
								<li><a href="https://5t60.app.link/bBerPi5M4F?yabla_campaign_id=1858"><span class="fa fa-apple"></span> iOS App</a></li>

				<!-- tvOS app available for all languages-->
									<li>
						<a href="tvOS.php">
							<span class="fa fa-apple"></span> tvOS App
						</a>
					</li>
				
								<li><a href="leaderboard.php">Leaderboard</a></li>
				
								<li><a href="scores.php">Your Scores</a></li>
								<li><a href="reviews.php">Yabla Reviews</a></li>
								<li></li>

				<h3 class="blog-header reg">Blogs</h3>
				<li><a href="https://www.yabla.com/yabla-blog/" target="_blank">Yabla Blog</a></li>
				
				<div class="social">
					<ul>
						<li><a href="https://twitter.com/yabla" target="_blank"><span class="fa fa-twitter"></span></a></li>
						<li><a href="https://www.facebook.com/YablaLanguages" target="_blank"><span class="fa fa-facebook"></span></a></li>
					</ul>
				</div>


			</ul>
		</div>
	</div>

</footer>
	<div id="feedback_mod_buttons">
	<button id="feedback_mod_feedback"><i class="fa fa-bullhorn"></i> Send Feedback</button>
	<button id="feedback_mod_revert"><i class="fa fa-undo"></i> Revert</button>
</div>

<div id="feedback_module"> 
	<i class="fa fa-close feedback_close"></i>
	<div class="inner">
		<h2 class="show_feed reg">How are we doing?</h2>
		<div class="satisfaction">
			<div class="prompt">Please choose one to rate your experience:</div>
			<ul>
				<li class="sat1" data-value="1"><i class="fa fa-frown-o"></i><span class="label">I hate it!</span></li>
				<li class="sat2" data-value="2"><i class="fa fa-frown-o"></i></li>
				<li class="sat3" data-value="3"><i class="fa fa-meh-o"></i><span class="label">Satisfactory</span></li>
				<li class="sat4" data-value="4"><i class="fa fa-smile-o"></i></li>
				<li class="sat5" data-value="5"><i class="fa fa-smile-o"></i><span class="label">I love it!</span></li>
			</ul>
		</div>
		<h3 class="show_feed reg">The good, the bad, the ugly?</h3>
		<h2 class="show_revert reg">Help us improve.</h2>
		<h3 class="show_revert reg">We'll get back to you.</h3>
		<textarea placeholder="Write feedback here..."></textarea>
		<div class="buttons">
			<button type="submit" class="btn btn-primary show_feed"><i class="fa fa-send"></i> Send</button>
			<button class="btn btn-cancel show_feed">Cancel</button>
			<button type="submit" class="btn btn-primary show_revert btn-send">Send Feedback and Revert</button>
			<button class="btn show_revert btn-revert revert_action"><i class="fa fa-undo"></i> Just take me back</button>
		</div>
	</div>
</div>
 
</body>
</html>
