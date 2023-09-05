/*
           ______________________________________
  ________|                                      |_______
  \       |                                      |      /
   \      |        Developed by MrCHICK          |     /
   /      |______________________________________|     \
  /__________)                                (_________\

*/
"use strict";

var USER = null;
var SOCKET = null;

var RECAPTCHA = null;

var MAX_BET = 0;
var MIN_BET = 0;
var BALANCE = 0;

var offers_currencyValues = {
	'BTC': 0,
	'ETH': 0,
	'LTC': 0,
	'BCH': 0
}

//AUDIO
var audio_roulette_rolling = new Audio(ROOT + 'template/audio/roulette_rolling.wav');
var audio_roulette_end = new Audio(ROOT + 'template/audio/roulette_end.wav');
var audio_jackpot_rolling = new Audio(ROOT + 'template/audio/jackpot_rolling.wav');
var audio_unbox_rolling = new Audio(ROOT + 'template/audio/unbox_rolling.wav');
var audio_plinko_end = new Audio(ROOT + 'template/audio/plinko_end.wav');

audio_roulette_rolling.volume = 0.75;
audio_roulette_end.volume = 0.75;
audio_jackpot_rolling.volume = 0.75;
audio_unbox_rolling.volume = 0.75;
audio_plinko_end.volume = 0.75;

//PROFILE SETTINGS

var profile_settings = {
	'sounds': {
		'type': 'cookie',
		'value': '1'
	},
	'channel': {
		'type': 'cookie',
		'value': 'en'
	},
	'chat': {
		'type': 'cookie',
		'value': '0'
	},
	'cart': {
		'type': 'cookie',
		'value': '0'
	},
	'anonymous': {
		'type': 'save',
		'value': '0'
	},
	'private': {
		'type': 'save',
		'value': '0'
	},
};

function play_sound(sound){
	sound.load();
	var play_promise = sound.play();

	if (play_promise !== undefined) {
		play_promise.then(function(){
			
		}).catch(function(err){
			sound.pause();
		});
	}
}

function profile_settingsChange(setting, value){
	if(profile_settings[setting] === undefined) return;
	
	profile_settings[setting].value = value;
	
	profile_settingsSave();
	profile_settingsAssign(setting, value);
}

function profile_settingsLoad(){
	var settings = JSON.parse(getCookie('settings'));
	
	if(!settings) return profile_settingsSave();
	
	var props1 = Object.keys(settings);
	props1.forEach(function(item){
		if(profile_settings[item] !== undefined){
			profile_settings[item].value = settings[item];
		}
	});
	
	var props2 = Object.keys(profile_settings);
	props2.forEach(function(item){
		profile_settingsAssign(item, profile_settings[item].value);
	});
}

function profile_settingsAssign(setting, value){
	if(setting == 'sounds' || setting == 'anonymous' || setting == 'private') $('.change-setting[data-setting="' + setting + '"]').prop('checked', (value == '1'));
	
	switch(setting) {
		case 'sounds':
			$('#profile_setting_sounds').prop('checked', (value == '1'));
		
			audio_roulette_rolling.volume = (value == '1') ? 0.75 : 0;
			audio_roulette_end.volume = (value == '1') ? 0.75 : 0;
			audio_jackpot_rolling.volume = (value == '1') ? 0.75 : 0;
			audio_unbox_rolling.volume = (value == '1') ? 0.75 : 0;
			audio_plinko_end.volume = (value == '1') ? 0.75 : 0;
		
			break;
			
		case 'channel':
			$('.flag').removeClass('active');
			$('.flag[data-channel=' + value + ']').addClass('active');
			$('#chat_message').attr('placeholder', 'Say something (' + $('.flag[data-channel=' + value + ']').data('name')+')');
		
			break;
			
		case 'chat':
			resize_pullout('chat', (value == '1'));
			
			break;
			
		case 'cart':
			resize_pullout('cart', (value == '1'));
			
			break;
			
		case 'anonymous':
			break;
			
		case 'private':
			break;
	}
}

function profile_settingsSave(){
	var settings = {};
	
	var props = Object.keys(profile_settings);
				
	props.forEach(function(item){
		if(profile_settings[item].type == 'cookie') {
			settings[item] = profile_settings[item].value;
		}
	});
	
	setCookie('settings', JSON.stringify(settings));
	
	profile_settingsLoad();
}

function profile_settingsGet(setting){
	if(profile_settings[setting] === undefined) return '';
	
	return profile_settings[setting].value;
}

/* SOCKET */
$(document).ready(function() {
	profile_settingsLoad();
	
	connect_socket();
	
	//EXCLUSION
	$('.self_exclision').on('click', function(){
		var exclusion = $(this).data('exclusion');
		
		$('#self_exclision').attr('data-exclusion', exclusion);
		$('#modal_self_exclusion').modal('show');
	});
	
	$('#self_exclision').on('click', function(){
		var exclusion = $(this).attr('data-exclusion');
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'account',
				'command': 'exclusion',
				'exclusion': exclusion,
				'recaptcha': render
			});
		});
	});
	
	//PULLOUT
	$('.pullout_view').on('click', function(){
		var pullout = $(this).data('pullout');
		
		var hide = $('.pullout[data-pullout="' + pullout + '"]').hasClass('active');
		
		if(pullout == 'menu') resize_pullout(pullout, hide);
		else profile_settingsChange(pullout, hide ? '1' : '0');
		
	});
	
	var last_width = $(window).width();
	$(window).resize(function(){
		if(last_width != $(window).width()){
			last_width = $(window).width();
			
			resize_pullout('manu', true);
			resize_pullout('chat', (profile_settings['chat'].value == '1'));
			
			resize_pullout('cart', (profile_settings['cart'].value == '1'));
		}
	});
	
	//PROFILE SETTINGS
	$('.change-setting').on('change', function(){
		var setting = $(this).data('setting');
		
		if(profile_settings[setting].type == 'cookie') {
			profile_settingsChange(setting, (profile_settings[setting].value == '1') ? '0' : '1');
		} else {
			profile_settings[setting].value = (profile_settings[setting].value == '1') ? '0' : '1';
			
			send_request_socket({
				'type': 'account',
				'command': 'profile_settings',
				'data': {
					'setting': setting,
					'value': profile_settings[setting].value
				}
			});
			
			profile_settingsAssign(setting, profile_settings[setting].value);
		}
	});
	
	//SWITCH PANELS
	$(document).on('click', '.switch_panel', function() {
		var id = $(this).data('id');
		var panel = $(this).data('panel');
		
		$('.switch_panel[data-id="' + id + '"]').removeClass('active');
		$(this).addClass('active');
		
		$('.switch_content[data-id="' + id + '"]').addClass('hidden');
		$('.switch_content[data-id="' + id + '"][data-panel="' + panel + '"]').removeClass('hidden');
	});
	
	//VERIFY ACCOUNT
	$(document).on("click", '.resend_verify', function() {
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'account',
				'command': 'resend_verify',
				'recaptcha': render
			});
		});
	});
	
	//SAVE TRADELINK
	$(document).on('click', '#save_steam_tradelink', function() {
		var tradelink = $('#steam_tradelink').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'account',
				'command': 'save_tradelink',
				'tradelink': tradelink,
				'recaptcha': render
			});
		});
	});
	
	//SAVE APIKEY
	$(document).on('click', '#save_steam_apikey', function() {
		var apikey = $('#steam_apikey').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'account',
				'command': 'save_apikey',
				'apikey': apikey,
				'recaptcha': render
			});
		});
	});
	
	//AFFILIATES
	$(document).on('click', '#collect_affiliates_referral_available', function() {
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'affiliates',
				'command': 'collect',
				'recaptcha': render
			});
		});
	});
	
	//REWARDS
	$(document).on('click', '#collect_reward_bind', function() {
		var bind = $(this).data('bind');
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'bind',
				'data': {
					'bind': bind
				},
				'recaptcha': render
			});
		});
	});
	
	$(document).on('click', '#collect_reward_referral_redeem', function() {
		var code = $('#referral_redeem_code').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'referral_redeem',
				'data': {
					'code': code
				},
				'recaptcha': render
			});
		});
	});
	
	$(document).on('click', '#collect_reward_referral_create', function() {
		var code = $('#referral_create_code').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'referral_create',
				'data': {
					'code': code
				},
				'recaptcha': render
			});
		});
	});
	
	$(document).on('click', '#collect_reward_bonus_redeem', function() {
		var code = $('#bonus_redeem_code').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'bonus_redeem',
				'data': {
					'code': code,
				},
				'recaptcha': render
			});
		});
	});
	
	$(document).on('click', '#collect_reward_bonus_create', function() {
		var code = $('#bonus_create_code').val();
		var amount = $('#bonus_create_amount').val();
		var uses = $('#bonus_create_uses').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'bonus_create',
				'data': {
					'code': code,
					'amount': amount,
					'uses': uses
				},
				'recaptcha': render
			});
		});
	});
	
	$(document).on('click', '#collect_reward_daily', function() {
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rewards',
				'command': 'daily_redeem',
				'data': {},
				'recaptcha': render
			});
		});
	});

	$(document).on('hide', '#modal_recaptcha', function(){
		grecaptcha.reset(RECAPTCHA);
		$('#modal_recaptcha .modal-body').html('<div class="flex justify-center" id="g-recaptcha"></div>');
	});
	
	//DROPDOWN BUTTON
	$('button').on('click', function(){
		$(this).animate({
			top: "5"
		}, {
			"duration": 100,
			"easing": "linear",
			complete: function(){
				$(this).animate({
					top: "0"
				}, {
					"duration": 100,
					"easing": "linear"
				});
			}
		});
	});
});

//CONNECT
var disconnected = false;
function connect_socket() {
	if(!SOCKET) {
		var session = getCookie('session');
		
		// SOCKET = io(':' + PORT);
		// SOCKET = io(`178.128.197.126:${PORT}`);
		//notify('info', 'Connecting!');
		const isDebug = localStorage.getItem('vgowitch_debug_url');
		// if(isDebug) SOCKET
		SOCKET = io(isDebug ? isDebug : `:${PORT}`);
		
		SOCKET.on('connect', function(msg) {
			SOCKET.emit('join', {
				session: session,
				channel: profile_settingsGet('channel')
			});
			$('#toast-container .toast').remove();
			//notify('info', 'Connected!');
			if(disconnected){
				disconnected = false;
			}
		});
		SOCKET.on('message', function(msg) {
			onMessageSocket(msg);
		});
		SOCKET.on('connect_error', function(msg) {
			if(disconnected) return;
			toastr['warning']('Reconnecting!', '', {
				timeOut: 0,
				extendedTimeOut: 0
			});
			disconnected = true;
		});
	}
}


//SENT REQUEST
function send_request_socket(request) {
	if (SOCKET) {
		SOCKET.emit('request', request);
	}
}

function requestRecaptcha(callback){
	$('#modal_recaptcha').modal('show');
	
	RECAPTCHA = grecaptcha.render('g-recaptcha', {
		'sitekey': RECAPTCHA_SITEKEY,
		'callback': function() {
			var render = grecaptcha.getResponse(RECAPTCHA);
			
			callback(render);
			
			setTimeout(function(){
				$('#modal_recaptcha').modal('hide');
				
				grecaptcha.reset(RECAPTCHA);
				$('#modal_recaptcha .modal-body').html('<div class="flex justify-center" id="g-recaptcha"></div>');
			}, 1000);
		},
		'theme' : 'dark'
	});
}

//GET REQUEST
function onMessageSocket(m) {
	if (m.type == 'first') {
		for(let i=0; i<=4; i++) {
			if(document.querySelectorAll('[data-channel]')[i].classList.length >= 7) {
				joinRoom(i, false);
				break;
			}
		}



		USER = m.user.userid;
		BALANCE = m.user.balance;
		MAX_BET = m.maxbet;
		MIN_BET = m.minbet;

		var progress = roundedToFixed((m.user.level.have - m.user.level.start) / (m.user.level.next - m.user.level.start) * 100, 2);
		
		$('#level_count').text(m.user.level.level);
		$('#level_have').text(m.user.level.have);
		$('#level_next').text(m.user.level.next);
		$('#level_bar').css('width', progress.toFixed(2) + '%');

		// console.log(progress);
		// console.log(parseInt(progress));
		
		$('#level_progress').css('--progress', parseInt(progress).toString());
		$('#level_progress').attr('data-isover50', parseInt(progress) >= 50);
		$('#level_progress').attr('data-progress', parseInt(progress));

		if(!m.user.initialized) $('#modal_auth_initializing').modal('show');
		
		var props = Object.keys(m.user.settings);
				
		props.forEach(function(item){
			if(profile_settings[item] !== undefined){
				profile_settings[item].value = m.user.settings[item];
				
				profile_settingsAssign(item, m.user.settings[item]);
			}
		});
		
		$('#pending-offers').empty();
		offers_refreshPendingItems();
				
		m.offers.p2p_pendings.forEach(function(offer){
			offers_addPending(offer, false);
		});
		
		m.offers.steam_pendings.forEach(function(offer){
			offers_addPending(offer, false);
		});

		$('.balance').countToFloat(m.user.balance);
		
		$('#chat-area').empty();
		
		chat_commands = m.chat.commands;
		chat_ignoreList = m.chat.listignore;
		// console.log(chat_commands);
		
		m.chat.messages.forEach(function(message){
			chat_message(message, false);
		});
		
		chat_message({
			type: 'system',
			message: m.chat.first.message,
			time: m.chat.first.time,
		}, false);
		
		alerts_add(m.chat.alerts);
		
		m.chat.notifies.forEach(function(notify){
			notifies_add(notify);
		});
		
		/* REQUESTS */
		
		if((PATHS[0] == 'deposit' || PATHS[0] == 'withdraw') && PATHS.length > 1){
			if(PATHS[1] == 'steam' || PATHS[1] == 'p2p'){
				$('.pullout-right').removeClass('hidden');
				
				if(PATHS[1] == 'p2p'){
					if(PATHS[0] == 'deposit') {
						send_request_socket({
							type: 'p2p',
							command: 'load_inventory',
							game: PATHS[2]
						});
					} else if(PATHS[0] == 'withdraw') {
						send_request_socket({
							type: 'p2p',
							command: 'load_shop',
							game: PATHS[2]
						});
					}
				} else if(PATHS[1] == 'steam') {
					if(PATHS[0] == 'deposit') {
						send_request_socket({
							type: 'steam',
							command: 'load_inventory',
							game: PATHS[2]
						});
					} else if(PATHS[0] == 'withdraw') {
						send_request_socket({
							type: 'steam',
							command: 'load_shop',
							game: PATHS[2]
						});
					}
				}
					
				$('#refresh_inventory').removeClass('hidden');
				
				$('#refresh_inventory').addClass('disabled').html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
				$('#list_items').html(createLoader());
				$('#cart-items').empty();
			} else $('#refresh_inventory').addClass('hidden');
		}
		
		if((PATHS[0] == 'unbox') && PATHS.length > 1){
			send_request_socket({
				'type': 'unbox',
				'command': 'show',
				'id': PATHS[1]
			});
		}
		
		/* END REQUESTS */
		
		if(PAGE == 'roulette'){
			$('#roulette_info_hash').text(m.roulette.hash);
			rouletteGame_last100Games = m.roulette.history100;
			
			var rolls100 = {
				'red': 0,
				'purple': 0,
				'black': 0
			};
			
			rouletteGame_last100Games.forEach(function(roll){
				rolls100[roll.color]++;
			});
			
			$('#roulette_history').removeClass('hidden');
			$('#roulette_hundred_red').text(rolls100['red']);
			$('#roulette_hundred_purple').text(rolls100['purple']);
			$('#roulette_hundred_black').text(rolls100['black']);
			
			$('#roulette_rolls').empty();
			m.roulette.history.forEach(function(roll){
				rouletteGame_addHistory(roll);
			});
			
			initializingSpinner_Roulette(m.roulette.last);
			
			$('.roulette-betslist').empty();
			
			rouletteGame_data = {
				'red': {
					higher_bet: 0,
					total_users: 0,
					total_amount: 0,
					total_my_amount: 0,
					users_amount: {}
				},
				'purple': {
					higher_bet: 0,
					total_users: 0,
					total_amount: 0,
					total_my_amount: 0,
					users_amount: {}
				},
				'black': {
					higher_bet: 0,
					total_users: 0,
					total_amount: 0,
					total_my_amount: 0,
					users_amount: {}
				}
			}
			
			m.roulette.bets.forEach(function(bet){
				rouletteGame_addBet(bet);
			});
		} else if(PAGE == 'crash'){
			$('#crash_info_hash').text(m.crash.hash);
			
			m.crash.history.forEach(function(crash){
				crashGame_addHistory(crash, true);
			});
			
			$('#crash_betlist').empty();
			$(`#crash_betlist_over`).html('');
			addNoPlayerMsg();
			
			m.crash.bets_all.forEach(function(bet){
				crashGame_addGame(bet);
			});
			
			m.crash.bets_win.forEach(function(bet){
				crashGame_editBet(bet);
			});
			
			m.crash.bets_lose.forEach(function(bet){
				$('#crash_betlist .crash_betitem[data-id="' + bet.id + '"]').removeClass('text-color').addClass('text-danger');
			});
		} else if(PAGE == 'jackpot'){
			$('#jackpot_betlist').empty();
			$('#jackpot_colors').html('<div class="meter"><span></span></div>');

			$('.round-container.current-round .players .player').each(function(i, obj) {
				$(obj).removeClass('lost');
			});
			
			m.jackpot.bets.forEach(function(bet){
				jackpotGame_addBet(bet, m.jackpot.total);
			});
			
			$('#jackpot_info_hash').text(m.jackpot.hash);
			$('#jackpot_total').countToFloat(m.jackpot.total);
			$('#jackpot_mychange').countToFloat(roundedToFixed(m.jackpot.chance, 2));
			$('#jackpot_mypart').countToFloat(roundedToFixed(m.jackpot.total * (m.jackpot.chance / 100)), 2);
			
			$('#jackpot_histories').empty();
			
			if(m.jackpot.history.length > 0){
				for(let i in m.jackpot.history) {
					if(!m.jackpot.history[i].id) {
						// var el = document.getElementsByClassName('jp-game-history')[0];
						// history.id = parseInt(el.getAttribute('data-id')) + 1;
						m.jackpot.history[i].id = i + 1;
					}
				}

				m.jackpot.history.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));

				m.jackpot.history.forEach(function(history){
					jackpotGame_addHistory(history);
				});
			} else {
				// $('#jackpot_histories').html('<div class="flex justify-center items-center width-full height-full">No jackpot histories</div>');
			}
		} else if(PAGE == 'coinflip'){
			$('#coinflip_betlist').empty();
			// for(var i = 0; i < 5; i++) {
			// 	$('#coinflip_betlist').append('<div class="coinflip-game bg-dark rounded-1 b-l2"></div>');
			// }
			
			m.coinflip.bets.forEach(function(bet){
				coinflipGame_addCoinFlip(bet.coinflip);
				if(bet.status > 0) coinflipGame_editCoinFlip(bet.coinflip, bet.status);
			});
		} else if(PAGE == 'dice'){
			$('#histories_dice').empty();
			
			m.dice.history.forEach(function(dice){
				diceGame_addHistory(dice);
			});
		} else if(PAGE == 'deposit' || PAGE == 'withdraw'){
			$('#last_offers').empty();
			
			if(m.offers.history.length > 0){
				m.offers.history.forEach(function(offer){
					offers_addHistory(offer);
				});
			} else {
				$('#last_offers').html('<div class="flex justify-center items-center width-full height-full">No trades</div>');
			}
			
			offers_currencyValues = m.offers.amounts;
			
			if(PAGE == 'withdraw') {
				$('#steam_bots').empty();
				
				m.offers.steam_bots.forEach(function(bot){
					var DIV = '<div class="steam-bot pointer flex items-center justify-center gap-1 rounded-1 bg-light b-d2 p-1 ' + ((bot.active) ? '' : 'disabled') + '" data-bot="' + bot.index + '">Bot #' + (bot.index + 1) + ' - Status<div class="flex rounded-full p-1 bg-' + ((bot.active) ? 'success' : 'danger') + '"></div></div>'
				
					$('#steam_bots').append(DIV);
				});
				
				
				$('.steam-bot:not(.disabled)').first().addClass('active');
			}
		} else if(PAGE == 'unbox'){
			$('#unboxing_list_cases').empty();
			
			m.cases.cases.forEach(function(case_unbox){
				unboxGame_addCase(case_unbox);
			});
			
			$('#unbox_history').html('<div class="history_message flex justify-center items-center width-full height-full">No unboxes</div>');
			
			m.cases.history.forEach(function(history){
				unboxGame_addHistory(history);
			});
		} else if(PAGE == 'plinko'){
			$("#plinko_history").empty();
			
			m.plinko.history.forEach(function(item){
				plinkoGame_addHistory(item);
			});
		} else if(PAGE == 'tower'){
			$('#tower_history').empty();
			
			for(var i = 0; i < m.tower.history.length; i++){
				towerGame_addHistory(m.tower.history[i])
			}
			
			$('.tower-grid .tile').removeClass('danger').removeClass('success').removeClass('checked');
			$('.tower-grid .tile').addClass('disabled');
			
			$('#tower_bet').removeClass('hidden');
			$('#tower_cashout').addClass('hidden');
			
			if(m.tower.game.active){
				$('#tower_info_hash').text(m.tower.game.hash);
				$('#tower_info_secret').text('hidden');
				
				$('#tower_bet').addClass('hidden');
				$('#tower_cashout').removeClass('hidden').text('CASHOUT: ' + m.tower.game.total.toFixed(5) + ' (' + getFormatAmountString(m.tower.game.total) + ')');
				
				m.tower.game.route.forEach(function(button, stage){
					$('.tower-grid .tile[data-stage="' + stage + '"][data-button="' + button + '"]').addClass('success');
					$('.tower-grid .tile[data-stage="' + stage + '"]:not(.success)').addClass('checked');
				});
				
				$('.tower-grid .tile[data-stage="' + m.tower.game.route.length + '"]').removeClass('disabled');
				
				towerGame_generateAmounts(m.tower.game.amount);
			} else towerGame_generateAmounts(0.01);
		} else if(PAGE == 'minesweeper'){
			$("#minesweeper_history").empty();
			
			for(var i = 0; i < m.minesweeper.history.length; i++){
				minesweeperGame_addHistory(m.minesweeper.history[i])
			}
			
			$('#minesweeper_bombs .bomb').removeClass('danger').removeClass('success').addClass('disabled');
			$('#minesweeper_bombs .bomb').text('');
			
			$('#minesweeper_bet').removeClass('hidden');
			$('#minesweeper_cashout').addClass('hidden');
			
			if(m.minesweeper.game.active){
				$('#minesweeper_info_hash').text(m.minesweeper.game.hash);
				
				$('#minesweeper_bombs .bomb').removeClass('disabled');
				
				$('#minesweeper_bet').addClass('hidden');
				$('#minesweeper_cashout').removeClass('hidden');

				$('#mines_next').html(m.minesweeper.game.next.toFixed(5));
				$('#mines_cashout').html(m.minesweeper.game.total.toFixed(5));
				$('#mines_profit').html(getFormatAmountString(m.minesweeper.game.total));

				// $('#minesweeper_cashout').removeClass('hidden').text('NEXT: ' + m.minesweeper.game.next.toFixed(5) + ' | CASHOUT: ' + m.minesweeper.game.total.toFixed(5) + ' (' + getFormatAmountString(m.minesweeper.game.total) + ')');
			
				m.minesweeper.game.route.forEach(function(button, stage){
					$('#minesweeper_bombs .bomb[data-bomb="' + button + '"]').addClass('success');
					$('#minesweeper_bombs .bomb[data-bomb="' + button + '"]').text('+' + m.minesweeper.game.amounts[stage].toFixed(5));
				});
			}
		}
	} else if(m.type == 'info'){
		notify('info', m.info);
	} else if (m.type == 'success') {
		notify('success', m.success);
	} else if (m.type == 'error') {
		notify('error', m.error);
		
		$('.plinko_bet.disabled').removeClass('disabled');
		$('.roulette-bet.disabled').removeClass('disabled');
		$('#dice_bet.disabled').removeClass('disabled');
		$('#jackpot_bet.disabled').removeClass('disabled');
		$('#coinflip_create.disabled').removeClass('disabled');
		$('#coinflip_join.disabled').removeClass('disabled');
	} else if (m.type == 'balance') {
		$('.balance').countToFloat(m.balance);
		BALANCE = m.balance;
	} else if (m.type == 'level') {
		$('#level_count').text(m.level.level);
		$('#level_have').text(m.level.have);
		$('#level_next').text(m.level.next);
		$('#level_bar').css('width', roundedToFixed((m.level.have - m.level.start) / (m.level.next - m.level.start) * 100, 2).toFixed(2) + '%');
		
		var progress = roundedToFixed((m.level.have - m.level.start) / (m.level.next - m.level.start) * 100, 2);

		$('#level_progress').css('--progress', parseInt(progress).toString());
		$('#level_progress').attr('data-isover50', parseInt(progress) >= 50);
		$('#level_progress').attr('data-progress', parseInt(progress));
	} else if (m.type == 'online') {
		$("#isonline").text(m.online);
	} else if (m.type == 'reload') {
		location.reload(true);
	} else if (m.type == 'refresh') {
		$('#page_loader').load(' #page_content', function(){
			$('.input_field').each(function(i, e) {
				changeInputFieldLabel($(this));
			});
		});
	} else if(m.type == "roulette" && PAGE == 'roulette'){ ////////////////////
		if(m.command == "timer"){
			rouletteGame_timer(m.time);
		} else if (m.command == "bet") {
			rouletteGame_addBet(m.bet);
		} else if (m.command == "bet_confirmed") {
			notify('success', 'Your bet has been placed!');
			
			$('.roulette-bet').removeClass('disabled');
		} else if (m.command == "roll") {
			$('.roulette-bet').addClass('disabled');
			
			$('#roulette_counter').finish();
			$('#roulette_timer').text('Rolling...');
			
			play_sound(audio_roulette_rolling);
			startSpinner_Roulette(m.roll, m.cooldown);
		} else if (m.command == "hash") {
			$('#roulette_info_hash').text(m.hash);
			$('#roulette_info_secret').text('hidden');
			$('#roulette_counter').finish().css('width', '100%');
		} else if (m.command == "secret") {
			$('#roulette_info_secret').text(m.secret);
		}
	} else if(m.type == "coinflip" && PAGE == 'coinflip'){ ////////////////////
		if (m.command == "add") {
			coinflipGame_addCoinFlip(m.coinflip);
		} else if (m.command == "bet_confirmed") {
			notify('success', 'Your bet has been placed!');
			
			$('#coinflip_create').removeClass('disabled');
		} else if (m.command == "edit") {
			coinflipGame_editCoinFlip(m.coinflip, m.status);
		} else if (m.command == "remove") {
			// var $field = $('#coinflip_betlist .coinflip-game .coinflip_betitem[data-id="' + m.coinflip.id + '"]').parent();
			// $field.removeClass('active').empty();
			
			// var last_game = $('#coinflip_betlist .coinflip-game.active').last().index() + 1;
			// var count_games = $('#coinflip_betlist .coinflip-game').length;
			// for(var i = 0; (i < (count_games - last_game > 5) * parseInt((count_games - last_game) / 5) * 5) && $('#coinflip_betlist .coinflip-game').length > 5; i++) {
			// 	var $last = $('#coinflip_betlist .coinflip-game').last();
			// 	
			// 	$last.remove();
			// }
			$(`.cf-game[data-id="${m.coinflip.id}"]`).remove();
			$(`#cf-game-${m.coinflip.id}-container`).remove();
		}
	} else if(m.type == "crash" && PAGE == 'crash'){ ////////////////////
		if(m.command == 'starting') {
			$('.crash-graph').removeClass('crash-graph-crashed');
			$('.crash-graph').removeClass('crash-graph-progress');
			$('.crash-graph').addClass('crash-graph-starting');
			
			crash_settings.stage = 'starting';
			
			var time_crash = m.time;
			var int_crash = setInterval(function(){
				if(time_crash < 0){
					clearInterval(int_crash);
				} else {
					$('#crash_timer').text(roundedToFixed(time_crash / 1000, 2).toFixed(2));
					
					time_crash -= 10;
				}
			}, 10);
			
			$('#crash_bet').removeClass('hidden').removeClass('disabled');
			$('#crash_cashout').addClass('hidden');
		} else if(m.command == 'started') {
			$('.crash-graph').removeClass('crash-graph-starting');
			$('.crash-graph').removeClass('crash-graph-progress');
			$('.crash-graph').addClass('crash-graph-progress');
			
			crash_settings.stage = 'progress';
			crash_settings.start_time = new Date().getTime();
			crash_settings.difference_time = m.difference;
			
			$('#crash_bet').removeClass('hidden').text('Round in progress').addClass('disabled');
			$('#crash_cashout').addClass('hidden');
		} else if(m.command == 'crashed') {
			$('.crash-graph').removeClass('crash-graph-progress');
			$('.crash-graph').removeClass('crash-graph-starting');
			$('.crash-graph').addClass('crash-graph-crashed');
		
			crash_settings.current_progress_time = m.time;
			crash_settings.stage = 'crashed';

			$('#crash_crash').css('color', '#F93131 !important');
			$('.crash .crash-c').css('color', '#F93131 !important');
			
			$('#crash_crash').text(parseFloat(m.number / 100).toFixed(2))
			
			if(m.history) crashGame_addHistory(parseFloat(m.number / 100).toFixed(2));
			
			$('#crash_bet').removeClass('hidden').addClass('disabled');
			$('#crash_cashout').addClass('hidden');
		} else if(m.command == 'reset') {
			$('#crash_betlist').empty();
			$(`#crash_betlist_over`).html('');
			addNoPlayerMsg();

			$('#crash_bet').removeClass('hidden').text('Place bet').removeClass('disabled');
			$('#crash_cashout').addClass('hidden');
		} else if (m.command == "bet") {
			crashGame_addGame(m.bet);
		} else if(m.command == "bet_win") {
			crashGame_editBet(m.bet);
		} else if(m.command == "bets_lose") {
			m.ids.forEach(function(id){
				$('#crash_betlist .crash_betitem[data-id="' + id + '"]').removeClass('text-color').addClass('text-danger');
			});
		} else if (m.command == "bet_confirmed") {
			notify('success', 'Your bet has been placed!');
			
			$('#crash_bet').removeClass('hidden').text('Bet placed').addClass('disabled');
			$('#crash_cashout').addClass('hidden');
		} else if (m.command == "cashed_out") {
			$('#crash_bet').addClass('hidden');
			$('#crash_cashout').removeClass('hidden').text('Cashed out @' + getFormatAmountString(m.amount)).addClass('disabled');
		} else if (m.command == "cashout") {
			$('#crash_bet').addClass('hidden');
			$('#crash_cashout').removeClass('hidden').text('Cashout ' + getFormatAmountString(m.amount)).removeClass('disabled');
		} else if (m.command == "hash") {
			$('#crash_info_hash').text(m.hash);
			$('#crash_info_secret').text('hidden');
		} else if (m.command == "secret") {
			$('#crash_info_secret').text(m.secret);
		}
	} else if(m.type == "jackpot" && PAGE == 'jackpot'){ ////////////////////
		if (m.command == "bet_confirmed") {
			notify('success', 'Your bet has been placed!');
			
			$('#jackpot_bet').removeClass('disabled');
		} else if (m.command == "chance") {
			$('#jackpot_mychange').countToFloat(roundedToFixed(m.chance, 2));
		} else if (m.command == "bet") {
			jackpotGame_addBet(m.bet, m.total);
			$('#jackpot_total').countToFloat(m.total.toFixed(2));
		} else if (m.command == "hash") {
			$('#jackpot_info_hash').text(m.hash);
			$('#jackpot_info_secret').text('hidden');
			$('#jackpot_info_percentage').text('hidden');
		} else if (m.command == "percentage") {
			$('#jackpot_info_percentage').text(m.percentage);
		} else if (m.command == "secret") {
			$('#jackpot_info_secret').text(m.secret);
		} else if(m.command == 'timer'){
			$('#jackpot_timer').text('Rolling in ' + parseInt(m.time) + 's');
			$('#jackpot_counter').css('width',  (m.time * 100 / m.total).toFixed(2) + '%');
		} else if(m.command == 'picking'){
			$('#jackpot_timer').text('Picking winner...');
		} else if(m.command == 'winner'){
			$('#jackpot_timer').text(m.winner.name + ' won ' + getFormatAmountString(m.winner.amount) + ' with a ' + m.winner.chance.toFixed(2) + '% chance!');
		} else if (m.command == "reset") {
			$('#jackpot_betlist').empty();
			$('#jackpot_colors').html('<div class="meter"><span></span></div>');

			$('#jackpot_total').countToFloat(0);
			$('#jackpot_mypart').countToFloat(0);
			$('#jackpot_mychange').countToFloat(0);
			
			// $('#jackpot_case').css('height', '0px');
			$('.round-container.current-round .players .player').each(function(i, obj) {
				$(obj).removeClass('lost');
			});
			
			setTimeout(function(){
				$('#jackpot_case').addClass('hidden');
				$('#jackpot_spinner').css('transform', 'translate3d(400px, 0px, 0px)');
			}, 500);
			
			$('#jackpot_info_percentage').text('Percentage: hidden');
			$('#jackpot_timer').text('Waiting for players...');
			
			$('#jackpot_counter').css('width', '100%');
		} else if (m.command == "history") {
			jackpotGame_addHistory(m.history);
		} else if (m.command == "roll") {
			console.log('jackpot roll');
			console.log(m);

			$('.round-container.current-round .players .player').each(function(i, obj) {
				$(obj).addClass('lost');
			});

			// get values
			var el = $(`#jp_bet_${m.winner.userid}_color`);
			var start = parseFloat(el.attr('data-start'));
			var end = parseFloat(el.attr('data-end'));
			var r = (parseInt(m.winner.userid.substr(0, 8), 16) % 100 + 1) / 100;

			// console.log(el);
			// console.log(end);
			// console.log(r);

			animateJackpot(`${(start + end) / 2}px`, m.winner.userid); // todo: get the random num from the user id, from the server or just make it land in the middle
			// var avatars = m.avatars;
			
			// var AVATARS = '';
			// avatars.forEach(function(avatar, index){
				// AVATARS += '<div class="reel-item flex justify-center items-center"><img class="width-full height-full" data-id="' + index + '" src="' + avatar + '"></div>';
			// });
			
			// $('#jackpot_case').removeClass('hidden').css('height', '100px');
			// $('#jackpot_field').html(AVATARS);
			$('#jackpot_timer').text('Rolling winner!');
			
			startSpinner_Jackpot(m.cooldown);
			play_sound(audio_jackpot_rolling);
		}
	} else if(m.type == "dice" && PAGE == 'dice'){ ////////////////////
		if (m.command == "bet") {
			notify('success', 'Your bet has been placed!');
			
			$('#dice_bet').removeClass('disabled');
			$('#dice_bet').removeClass('lose');
			$('#dice_bet').removeClass('win');
			
			$('#dice_info_hash').text(m.hash);
			$('#dice_info_secret').text(m.secret);
			
			if(diceGame_slow){
				for(let i=0; i<=3; i++) $(`[data-fastid="${i + 1}"]`).html('5');
				diceGame_rollSlow(m.number, m.numbers, m.win);
			} else {
				$('#dice_bet').removeClass('lose');
				$('#dice_bet').removeClass('win');

				if(m.win){
					// $('#dice_bet').text('You rolled ' + m.number + ' YOU WON!');
					$('#dice_bet').text('You win!');
					$('#dice_bet').removeClass('lose');
					$('#dice_bet').addClass('win');
				} else {
					// $('#dice_bet').text('You rolled ' + m.number + ' YOU LOSE!');
					$('#dice_bet').text('You lose!');
					$('#dice_bet').removeClass('win');
					$('#dice_bet').addClass('lose');
				}

				for(let i=0; i<=3; i++) $(`[data-fastid="${i + 1}"]`).html(m.numbers[i]);
				
				$('#dice_pointer').removeClass('hidden');
				$('#dice_pointer .dice-result-bar').css('left', roundedToFixed(m.number, 2) + '%');
				$('#dice_pointer .pointer').text(roundedToFixed(m.number, 2).toFixed(2) + '%');
			}
		} else if(m.command == "history"){
			diceGame_addHistory(m.history);
		}
	} else if(m.type == 'rewards' && (PAGE == 'rewards' || PAGE == 'promo')){ ////////////////////
		if (m.command == "timer") {
			var time_daily = m.time;
			
			clearInterval(interval_daily);
			
			var interval_daily = setInterval( function(){
				if(time_daily <= 0){
					$('#collect_reward_daily').text('Collect').removeClass('disabled');
					clearInterval(interval_daily);
					
					return;
				}
					
				$('#collect_reward_daily').text(getFormatSeconds(time_daily).hours + ':' + getFormatSeconds(time_daily).minutes + ':' + getFormatSeconds(time_daily).seconds).addClass('disabled');
				time_daily--;
			},1000);
		}
	} else if(m.type == 'chat'){ //////////////////////
		if (m.command == 'message') {
			chat_message(m.message, m.added);
		} else if (m.command == 'delete') {
			$('.chat-message[data-message="' + m.id + '"]').remove();
		} else if (m.command == 'ignorelist') {
			chat_ignoreList = m.list;
		} else if(m.command == 'clean'){
			$('#chat-area').empty();
		} else if(m.command == 'channel'){
			$('#chat-area').empty();
			chat_channelsMessages[m.channel] = 0;
			
			profile_settingsChange('channel', m.channel);
			
			$('.chat-input-scroll').addClass('hidden');
		}
	} else if(m.type == 'offers'){ ////////////////////
		if(PAGE == 'deposit' || PAGE == 'withdraw'){
			if(m.command == 'add_items'){
				var available = true;
				for(var i = 0; i < m.offer.paths.length; i++) {
					if(PATHS[i] != m.offer.paths[i]) {
						available = false;
						break;
					}
				}
				
				if(available) {
					if(!m.offer.more){
						$('#refresh_inventory').removeClass('disabled').text("Refresh");
						$('#list_items').empty();
						$('#cart-items').empty();
						
						offers_refreshCartItems();
					}
					
					m.offer.items.forEach(function(item){
						if($('#list_items .listing-item[data-id="' + item.id + '"]').length > 0) $('#list_items .listing-item[data-id="' + item.id + '"]').remove();
						
						if(PATHS[0] == 'deposit') offers_addItemInventory(item);
						if(PATHS[0] == 'withdraw') {
							if(PATHS[1] == 'steam') offers_addItemInventory(item);
							if(PATHS[1] == 'p2p') offers_addBundleInventory(item);
						}
					});
					
					if(PATHS[0] == 'withdraw' && PATHS[1] == 'steam'){
						$('#list_items>.listing-item').addClass('hidden').filter(function(i, e) {
							if($(this).data('bot') == $('.steam-bot.active').data('bot')) return true;
						}).removeClass('hidden');
					}
					
					if(m.offer.items.length > 0){
						tinysort('#list_items>.listing-item', {
							data: 'price',
							order: 'desc'
						});
						
						tinysort('#list_items .listing-item', {
							data: "accepted",
							order: "desc"
						});
					}
				}
			} else if(m.command == 'remove_items'){
				var available = true;
				if(m.offer.paths.length != PATHS.length) available = false;
				for(var i = 0; i < m.offer.paths.length && !available; i++) if(PATHS[i] != m.offer.paths[i]) available = false;
				
				if(available) {
					if(m.offer.all){
						$('#list_items').empty();
						$('#cart-items').empty();
					} else {
						m.offer.items.forEach(function(item){
							$('#cart-items .item-selected-content[data-id="' + item.id + '"]').remove();
							$('#list_items .listing-item[data-id="' + item.id + '"]').remove();
						});
					}
					
					if($('#list_items .listing-item').length <= 0) {
						$('#refresh_inventory').removeClass('disabled').text("Refresh");
						
						if(PATHS[0] == 'deposit') $('#list_items').html('<div class="in-grid font-8">Your Inventory is currently empty.</div>');
						if(PATHS[0] == 'withdraw') $('#list_items').html('<div class="in-grid font-8">The Marketplace is currently empty.</div>');
					}
					
					offers_refreshCartItems();
				}
			} else if(m.command == 'error'){
				$('#refresh_inventory').removeClass('disabled').text("Refresh");
				$('#list_items').html('<div class="in-grid font-8">' + m.error + '</div>');
			} else if(m.command == 'wait'){
				var uniqueId = time() + '_' + Math.floor(Math.random() * 100);
				var TIMER = '<script>';
					TIMER += 'var time_' + uniqueId + ' = ' + m.time + ';';
					TIMER += 'var timer_' + uniqueId + ' = setInterval(function(){';
						TIMER += 'if(time_' + uniqueId + ' <= 1){';
							TIMER += 'clearInterval(timer_' + uniqueId + ');';
							TIMER += '$("#refresh_inventory").removeClass("disabled").text("Refresh");';
						TIMER += '}else{';
							TIMER += 'time_' + uniqueId + '--;';
							TIMER += '$("#time_' + uniqueId + '").text(time_' + uniqueId + ');';
						TIMER += '}';
					TIMER += '}, 1000);';
				TIMER += '</script>';
				TIMER += '<span id="time_' + uniqueId + '">' + m.time + '</span>';
				
				$('#refresh_inventory').html('Refresh in ' + TIMER).addClass('disabled');
			} else if(m.command == 'last_offer'){
				offers_addHistory(m.offer);
			} else if(m.command == 'refresh'){
				$('.qrcode-crypto').empty();
				
				var qrcode = new QRCode($('.qrcode-crypto')[0], {
					text: m.address,
					width: 192,
					height: 192,
				});
				
				var $input_address = $('.currency-panel #' + m.currency.toLowerCase() + '_address');
				$input_address.val(m.address);
				
				$('.currency-panel #panel_currency_top').removeClass('hidden');
				$('.currency-panel #panel_currency_bottom').addClass('hidden');
				
				changeInputFieldLabel($input_address.parent().parent().parent());
			}
		}
		
		if(m.command == 'add_pending'){
			offers_addPending(m.offer, true);
		} else if(m.command == 'edit_pending'){
			offers_editPending(m.offer);
		} else if(m.command == 'remove_pending'){
			$('#pending-offers .bundle_offer[data-id="' + m.offer.id + '"][data-method="' + m.offer.method + '"]').remove();
			$('#modal_offers_pending').modal('hide');
			
			offers_refreshPendingItems();
		}
	} else if(m.type == 'tower' && PAGE == 'tower'){ ////////////////////
		if(m.command == 'bet_confirmed'){
			notify('success', 'Your bet has been placed!');
			
			$('#tower_info_hash').text(m.hash);
			$('#tower_info_secret').text('hidden');
			
			$('.tower-grid .tile').removeClass('danger').removeClass('success').removeClass('checked');
			$('.tower-grid .tile').addClass('disabled');
			
			$('.tower-grid .tile[data-stage="' + m.stage + '"]').removeClass('disabled');
			
			$('#tower_bet').addClass('hidden');
			$('#tower_cashout').removeClass('hidden').text('CASHOUT: ' + m.total.toFixed(5) + ' (' + getFormatAmountString(m.total) + ')');
		} else if(m.command == 'result_stage'){
			if(m.result == 'lose'){
				m.buttons.forEach(function(button, i){
					$('.tower-grid .tile[data-stage="' + i + '"][data-button="' + button + '"]').removeClass('success').removeClass('checked').addClass('danger');
				});
				
				$('.tower-grid .tile').addClass('disabled');
				
				$('#tower_bet').removeClass('hidden');
				$('#tower_cashout').addClass('hidden');
			} else if(m.result == 'win'){
				$('.tower-grid .tile[data-stage="' + m.stage + '"][data-button="' + m.button + '"]').addClass('success');
				$('.tower-grid .tile[data-stage="' + m.stage + '"]:not(.success)').addClass('checked');
				
				$('.tower-grid .tile[data-stage="' + (m.stage + 1) + '"]').removeClass('disabled');
				
				$('#tower_cashout').removeClass('hidden').text('CASHOUT: ' + m.total.toFixed(5) + ' (' + getFormatAmountString(m.total) + ')');
			}
		} else if(m.command == 'secret'){
			$('#tower_info_secret').text(m.secret);
		} else if(m.command == 'history'){
			towerGame_addHistory(m.history);
		}
	} else if(m.type == "minesweeper" && PAGE == 'minesweeper'){ ////////////////////
		if(m.command == 'bet_confirmed'){
			notify('success', 'Your bet has been placed!');
			
			$('#minesweeper_info_hash').text(m.hash);
			
			$('#minesweeper_bombs .bomb').removeClass('danger').removeClass('success').removeClass('disabled');
			$('#minesweeper_bombs .bomb').text('');
			
			$('#minesweeper_bet').addClass('hidden');
			$('#minesweeper_cashout').removeClass('hidden');

			$('#mines_next').html('0.00');
			$('#mines_cashout').html('0.00');
			$('#mines_profit').html('0.00');
			// $('#mines_next').html(m.next.toFixed(5));
			// $('#mines_cashout').html(m.total.toFixed(5));
			// $('#mines_profit').html(getFormatAmountString(m.total));
			// $('#minesweeper_cashout').removeClass('hidden').text('NEXT: ' + m.next.toFixed(5) + ' | CASHOUT: ' + m.total.toFixed(5) + ' (' + getFormatAmountString(m.total) + ')');
		} else if(m.command == 'result_bomb'){
			if(m.result == 'lose'){
				m.bombs.forEach(function(bomb){
					$('#minesweeper_bombs .bomb[data-bomb="' + bomb + '"]').addClass('danger');
				});
				
				$('#minesweeper_bombs .bomb').addClass('disabled');
				
				$('#minesweeper_bet').removeClass('hidden');
				$('#minesweeper_cashout').addClass('hidden');
			} else if(m.result == 'win'){
				$('#minesweeper_bombs .bomb[data-bomb="' + m.bomb + '"]').addClass('success');
				$('#minesweeper_bombs .bomb[data-bomb="' + m.bomb + '"]').text('+' + m.amount.toFixed(5));
				
				$('#minesweeper_cashout').removeClass('hidden');

				$('#mines_next').html(m.next.toFixed(5));
				$('#mines_cashout').html(m.total.toFixed(5));
				$('#mines_profit').html(getFormatAmountString(m.total));
				// $('#minesweeper_cashout').removeClass('hidden').text('NEXT: ' + m.next.toFixed(5) + ' | CASHOUT: ' + m.total.toFixed(5) + ' (' + getFormatAmountString(m.total) + ')');
			}
		} else if(m.command == 'history'){
			minesweeperGame_addHistory(m.history);
		}
	} else if(m.type == 'plinko' && PAGE == 'plinko'){ ////////////////////
		if(m.command == 'bet'){
			notify('success', 'Your bet has been placed!');
			
			$('.plinko_bet.disabled').removeClass('disabled');
			
			plinkoGame_play(m.id, m.value, m.color);
		} else if(m.command == 'hash'){
			$('#plinko_info_hash').text(m.hash);
			$('#plinko_info_secret').text('hidden');
		} else if(m.command == 'secret'){
			$('#plinko_info_secret').text(m.secret);
		} else if(m.command == 'history'){
			plinkoGame_addHistory(m.history);
		}
	} else if(m.type == 'unbox' && PAGE == 'unbox'){ ////////////////////
		if(m.command == 'show'){
			$('#unbox_info_hash').text('hidden');
			$('#unbox_info_secret').text('hidden');
			$('#unbox_info_percentage').text('hidden');
			
			unboxGame_showCase(m.items, m.case_unbox, m.spinner);
		} else if(m.command == 'roll'){
			$('#unbox_info_hash').text(m.hash);
			$('#unbox_info_secret').text('hidden')
			$('#unbox_info_percentage').text('hidden')
			
			unboxGame_openCase(m.items);
		} else if(m.command == 'history'){
			unboxGame_addHistory(m.history)
		} else if(m.command == 'secret'){
			$('#unbox_info_secret').text(m.secret);
		} else if(m.command == 'percentage'){
			$('#unbox_info_percentage').text(m.percentage);
		} else if(m.command == 'winning'){
			$('#modal_unbox_result').modal('show');
			
			$('#unbox_result_case').text(m.case_unbox.name);
			
			$('#unbox_result_hash').text(m.case_unbox.hash);
			$('#unbox_result_secret').text(m.case_unbox.secret);
			$('#unbox_result_percentage').text(m.case_unbox.percentage);
			$('#unbox_result_ticket').text(m.case_unbox.ticket);
			
			$('#unbox_result_winning').text(m.item.name);
			$('#unbox_result_image').attr('src', m.item.image);
			$('#unbox_result_price').text('Item automatically selled (' + m.item.price + ' coins)');
		}
	} else if(m.type == 'rain'){ ////////////////////
		if(m.command == 'started'){
			$('.rain_panel').removeClass('hidden');
			
			$('.rain_panel .rainJoin').removeClass('hidden');
			$('.rain_panel .rainJoined').addClass('hidden');
			$('.rain_panel .rainWait').addClass('hidden');
		} else if(m.command == 'joined'){
			$('.rain_panel').removeClass('hidden');
			
			$('.rain_panel .rainJoin').addClass('hidden');
			$('.rain_panel .rainWait').addClass('hidden');
			$('.rain_panel .rainJoined').removeClass('hidden');
		} else if(m.command == 'ended'){
			$('.rain_panel').addClass('hidden');
			
			$('.rain_panel .rainJoin').addClass('hidden');
			$('.rain_panel .rainJoined').addClass('hidden');
			$('.rain_panel .rainWait').addClass('hidden');
		} else if(m.command == 'waiting'){
			$('.rain_panel').removeClass('hidden');
			
			$('.rain_panel .rainWait').removeClass('hidden');
			$('.rain_panel .rainJoin').addClass('hidden');
			$('.rain_panel .rainJoined').addClass('hidden');
		}
	}
}
/* END SOCKET */

/* AUTH */

$(document).ready(function() {
	$('.form_auth').on('submit', function(e) {
		e.preventDefault();
		
		$.ajax({
			url: $(this).attr('action'),
			type: $(this).attr('method'),
			data: $(this).serialize(),
			success: function(data){
				try {
					data = JSON.parse(data);
					
					if(data.success) {
						if(data.refresh) location.reload(true);
						else if(data.message.have) notify('success', data.message.message);
					} else {
						notify('error', data.error);
					}
				} catch(err) { 
					notify('error', err.message);
				}
			},
			error: function(err){
				notify('error', 'Error 500');
			}
		});
	});
	
	$('.form_auth_recover').on('submit', function(e) {
		e.preventDefault();
		
		var username = $(this).find('[name="username"]').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				type: 'account',
				command: 'recover',
				data: { username },
				recaptcha: render
			});
		});
	});
	
	$('.form_auth_settings').on('submit', function(e) {
		e.preventDefault();
		
		var username = $(this).find('[name="username"]').val();
		var email = $(this).find('[name="email"]').val();
		
		send_request_socket({
			type: 'account',
			command: 'account_settings',
			data: { username, email }
		});
	});
});

/* END AUTH */

/* CHAT */

var chat_ignoreList = {};
var chat_commands = [];
var chat_isScroll = true;
var chat_maxMessages = 20;
var chat_channelsMessages = {
	'en': 0,
	'ro': 0,
	'fr': 0,
	'ru': 0,
	'de': 0
}

var timeFormats = [
	{time: 1, time_format: 1, ago: 'seconds ago', next: 'seconds from now', count: true},
	{time: 60, time_format: 60, ago: 'minute ago', next: 'minute from now', count: true},
	{time: 120, time_format: 60, ago: 'minutes ago', next: 'minutes from now', count: true},
	{time: 3600, time_format: 3600, ago: 'hour ago', next: 'hour from now', count: true},
	{time: 7200, time_format: 3600, ago: 'hours ago', next: 'hours from now', count: true},
	{time: 86400, time_format: 86400, ago: 'Yesterday', next: 'Tomorrow', count: false},
	{time: 172800, time_format: 86400, ago: 'days ago', next: 'days from now', count: true},
	{time: 604800, time_format: 604800, ago: 'Last week', next: 'Next week', count: false},
	{time: 1209600, time_format: 604800, ago: 'weeks ago', next: 'weeks from now', count: true},
	{time: 2419200, time_format: 2419200, ago: 'Last month', next: 'Next month', count: false},
	{time: 4838400, time_format: 2419200, ago: 'months ago', next: 'months from now', count: true},
	{time: 29030400, time_format: 29030400, ago: 'Last year', next: 'Next year', count: false},
	{time: 58060800, time_format: 29030400, ago: 'years ago', next: 'years from now', count: true},
	{time: 2903040000, time_format: 2903040000, ago: 'Last century', next: 'Next century', count: false},
	{time: 5806080000, time_format: 2903040000, ago: 'centuries ago', next: 'centuries from now', count: true}
]

function getFormatTime(time, type){
	var seconds = parseInt((new Date().getTime() - time) / 1000);
    
	var text = 'Now';
	var count = false;
	var time_format = 1;
	
	for(var i = 0; i < timeFormats.length; i++){
		if(seconds >= timeFormats[i]['time']){
			text = timeFormats[i][type];
			count = timeFormats[i]['count'];
			time_format = timeFormats[i]['time_format'];
		}
	}
	
	if(count){
		return parseInt(seconds / time_format) + ' ' + text;
	} else {
		return text;
	}
}

//CHAT
$(window).click(function() {
  //Hide the menus if visible
  $('.chat-message').attr('data-activebox', 'false');
  $('#user_drp').attr('data-active', 'false');
});

function toggleHover(id, e) {
	e.stopPropagation();

	$('.chat-message').attr('data-activebox', 'false');

	var msg = $(`[data-message="${id}"]`);
	msg.attr('data-activebox', msg.attr('data-activebox') == 'false' ? 'true' : 'false');
}

function chat_message(message, added) {
	if(message.type == 'system'){
		var messageid = Math.floor(Math.random() * 1000);

		var DIV = '<div class="chat-message scale_center">';
				DIV += '<img class="avatar icon-medium rounded-full" src="/template/img/logoav2.png">';
				DIV += '<div class="content">';
					DIV += '<div class="name">BETHUB.GG</div>';
					DIV += '<script>setInterval(function(){$(".chat-message .time[data-id=' + messageid + ']").text(getFormatTime(' + message.time + ', "ago"))},1000)</script>';
				DIV += '<div class="msg">' + message.message + '</div>';
				DIV += '<div class="time" data-id="' + messageid + '">' + getFormatTime(message.time, "ago") + '</div>';
				DIV += '</div>';
			DIV += '</div>';
	} else if(message.type == 'player'){
		if(chat_ignoreList[message.userid] !== undefined) return;
		
		if(message.channel){
			if (message.channel != profile_settingsGet('channel')) {
				if (added == true) {
					chat_channelsMessages[message.channel]++;
					if(chat_channelsMessages[message.channel] > 0) $('.flag[data-channel=' + message.channel + '] .new-messages').removeClass('hidden').text(chat_channelsMessages[message.channel]);
				}
				return;
			}
		}

		var new_message = chat_checkMention(message.message, message.mentions);
		new_message = chat_checkEmotes(new_message);
		
		var rank_name = '';
		
		if (message.rank == 100) {
			rank_name = 'owner';
		} else if (message.rank == 1) {
			rank_name = 'admin';
		} else if (message.rank == 2) {
			rank_name = 'moderator';
		} else if (message.rank == 3) {
			rank_name = 'helper';
		} else if (message.rank == 4) {
			rank_name = 'veteran';
		} else if (message.rank == 5) {
			rank_name = 'pro';
		} else if (message.rank == 6) {
			rank_name = 'youtuber';
		} else if (message.rank == 7) {
			rank_name = 'streamer';
		} else if (message.rank == 8) {
			rank_name = 'developer';
		}

		// todo: get rid of the setinterval
		var cmd_map = {
			'ignore': ['Ignore', 'fa-volume-mute'],
			'unignore': ['Unignore', 'fa-volume-up'],
			'ban': ['Ban', 'fa-user-slash'],
			'unban': ['Unban', 'fa-check-circle'],
			'mute': ['Mute', 'fa-volume-mute'],
			'unmute': ['Unmute', 'fa-volume-up'],
			'deletemessage': ['Delete message', 'fa-trash'],
			'setrank': ['Set rank', 'fa-user'],
			'banip': ['Ban IP', 'fa-ban'],
			'bantrade': ['Ban trading', 'fa-ban'],
			'unbantrade': ['Unban trading', 'fa-check-circle'],
			'banplay': ['Ban playing', 'fa-ban'],
			'unbanplay': ['Unban playing', 'fa-check-circle'],
			'givecoins': ['Give coins', 'fa-user-plus'],
			'takecoins': ['Take coins', 'fa-user-minus'],
		}
		var cmds = '';

		chat_commands.forEach(function(command){
			if(command.type == 'id'){
				cmds += `
					<div class="cmd" id="chat_message_commands" data-setting="/${command.name} ${message.id}">
						<i class="fa ${cmd_map[command.name][1]}"></i>
						<span>${cmd_map[command.name][0]}</span>
					</div>
				`;
			}
		});

		chat_commands.forEach(function(command){
			if(command.type == 'userid'){
				cmds += `
					<div class="cmd" id="chat_message_commands" data-setting="/${command.name} ${message.userid}">
						<i class="fa ${cmd_map[command.name][1]}"></i>
						<span>${cmd_map[command.name][0]}</span>
					</div>
				`;
			}
		});

		var DIV = `<div class="chat-message user scale_center" data-message="${message.id}" data-activebox="false">
				<img class="avatar icon-medium rounded-full" src="${message.avatar}" />

				<div class="content">
					<div class="name">
						<span class="badge level">${message.level}</span>
						${rank_name ? `<span class="badge chat-rank-${rank_name}">${rank_name}</span>` : ''}
						<span style="line-height:22px">${message.name}</span>

						<i class="fa fa-ellipsis-h dropdown" onclick="toggleHover(${message.id}, event)"></i>
					</div>
					<script>setInterval(function(){$(".chat-message[data-message='${message.id}'] .time").text(getFormatTime('${message.time}', "ago"))},1000)</script>
					
					<div class="msg">${new_message}</div>
					<div class="time">${getFormatTime(message.time, 'ago')}</div>
				</div>

				<div class="dropdown-box" data-big="${chat_commands.length >= 5}">
					${cmds}
				</div>
			</div>`;
		
		/*var DIV = '<div class="chat-message p-1 scale_center chat-content-' + rank_name + '" data-message="' + message.id + '" >';
			DIV += '<div class="chat-user-info flex relative width-full">';
				DIV += '<div class="m-1">';
					DIV += createAvatarField({userid: message.userid, name: message.name, avatar: message.avatar, level: message.level}, 'medium', '');
				DIV += '</div>';
					
				DIV += '<div class="chat-message-header flex column justify-center">';
					DIV += '<div class="chat-message-name chat-link-' + rank_name + ' ellipsis">';
						if(rank_name) DIV += '<div class="chat-message-rank mr-1 rounded-0 chat-rank-' + rank_name + '">' + rank_name + '</div>';
						DIV += message.name;
					DIV += '</div>';
					DIV += '<div class="chat-message-time">' + getFormatTime(message.time, "ago") + '</div>';
					DIV += '<script>setInterval(function(){$(".chat-message[data-message=' + message.id + '] .chat-message-time").text(getFormatTime(' + message.time + ', "ago"))},1000)</script>';
				DIV += '</div>';
				
				DIV += '<div class="transition-5 flex justify-center items-center" id="chat-message-settings">';
					DIV += '<div class="grid split-column-full width-full">';
						//DIV += '<a href="http://steamcommunity.com/profiles/' + message.userid + '" target="_blank"><div class="chat-message-setting rounded-full flex items-center justify-center" data-toggle="tooltip" data-placement="bottom" title="PROFILE"><i class="fa fa-user" aria-hidden="true"></i></div></a>';
						DIV += '<div class="flex items-center justify-center"><div class="chat-message-setting rounded-full flex items-center justify-center" title="COMMANDS" id="user_commands"><i class="fa fa-code" aria-hidden="true"></i></div></div>';
						DIV += '<div class="flex items-center justify-center"><div class="chat-message-setting rounded-full flex items-center justify-center" title="MENTION" id="chat_message_commands" data-setting="@' + message.userid + '"><i class="fa fa-bell" aria-hidden="true"></i></div></div>';
						DIV += '<div class="flex items-center justify-center"><div class="chat-message-setting rounded-full flex items-center justify-center" title="SEND COINS" id="send_coins" data-user="' + message.userid + '"><i class="fa fa-gift" aria-hidden="true"></i></div></div>';
					DIV += '</div>';
					DIV += '<div class="hidden p-2 mt-1" id="chat-message-commands">';
						DIV += '<div class="title-panel rounded-1 p-1 mb-1">Commands</div>';
						
						chat_commands.forEach(function(command){
							if(command.type == 'id'){
								DIV += '<div class="ellipsis" id="chat_message_commands" data-setting="/' + command.name + ' ' + message.id + '">/' + command.name + '</div>';
							}
						});
						
						chat_commands.forEach(function(command){
							if(command.type == 'userid'){
								DIV += '<div class="ellipsis" id="chat_message_commands" data-setting="/' + command.name + ' ' + message.userid + '">/' + command.name + ' ' + message.userid + '</div>';
							}
						});
					DIV += '</div>';
				DIV += '</div>';
			DIV += '</div>';
			DIV += '<div class="chat-message-content bg-light-transparent p-2 rounded-1">' + new_message + "</div>";
		DIV += '</div>';*/
	}
	
	$('#chat-area').append(DIV);
	
	if(chat_isScroll){
		while($('#chat-area .chat-message').length > chat_maxMessages) $('#chat-area .chat-message').first().remove();
		
		$('#chat-area').scrollTop(5000);
		$('.chat-input-scroll').addClass('hidden');
		chat_isScroll = true;
	}
}

//EMOTES
function chat_checkEmotes(message) {
	var emotes = {
		'smile': 'png', 'smiley': 'png', 'grin': 'png', 'pensive': 'png', 'weary': 'png', 'astonished': 'png', 'rolling_eyes': 'png', 'relaxed': 'png', 'wink': 'png', 'woozy_face': 'png', 'zany_face': 'png', 'hugging': 'png', 'joy': 'png', 'sob': 'png', 'grimacing': 'png', 'rofl': 'png', 'face_monocle': 'png', 'thinking': 'png', 'pleading_face': 'png', 'sleeping': 'png', 'sunglasses': 'png', 'heart_eyes': 'png', 'smiling_hearts': 'png', 'kissing_heart': 'png', 'star_struck': 'png', 'nerd': 'png', 'innocent': 'png', 'face_vomiting': 'png', 'money_mouth': 'png', 'cold_sweat': 'png', 'partying_face': 'png', 'exploding_head': 'png', 'rage': 'png', 'hot_face': 'png', 'cold_face': 'png', 'smiling_imp': 'png', 'alien': 'png', 'clown': 'png', 'scream_cat': 'png', 'smiley_cat': 'png', 'robot': 'png', 'ghost': 'png', 'skull': 'png', 'poop': 'png', 'jack_o_lantern': 'png', '100': 'png', 'bell': 'png', 'birthday': 'png', 'gift': 'png', 'first_place': 'png', 'trophy': 'png', 'tada': 'png', 'crown': 'png', 'fire': 'png', 'heart': 'png', 'broken_heart': 'png', 'wave': 'png', 'clap': 'png', 'raised_hands': 'png', 'thumbsup': 'png', 'peace': 'png', 'ok_hand': 'png', 'muscle': 'png', 'punch': 'png', 'moneybag': 'png',
		'crypepe': 'png', 'firinpepe': 'png', 'happepe': 'png', 'monkachrist': 'png', 'okpepe': 'png', 'sadpepe': 'png',
		'gaben': 'png', 'kappa': 'png', 'kappapride': 'png', 'kim': 'png', 'pogchamp': 'png', 'shaq': 'png',
		'alert': 'gif', 'awp': 'gif', 'bananadance': 'gif', 'carlton': 'gif', 'fortdance': 'gif', 'grenade': 'gif', 'lolizard': 'gif', 'partyblob': 'gif', 'saxguy': 'gif', 'squidab': 'gif', 'turtle': 'gif', 'zombie': 'gif',
		'bet': 'png', 'cant': 'png', 'cashout': 'png', 'doit': 'png', 'dont': 'png', 'feelsbad': 'png', 'feelsgood': 'png', 'gg': 'png', 'gl': 'png', 'highroller': 'png', 'joinme': 'png', 'letsgo': 'png', 'win': 'png', 'lose': 'png', 'nice': 'png', 'sniped': 'png', 'midtick': 'png', 'lowtick': 'png'
	};
	
	var props = Object.keys(emotes);
	for (var i = 0; i < props.length; i++) {
		message = message.replace(new RegExp(":" + props[i] + ":( |$)", "g"), "<img class='emojis-chat-icon' src='" + ROOT + "template/img/emojis/" + props[i] + "." + emotes[props[i]] + "'> ");
	}
	return message;
}

//CHECK MENTIONS NAME
function chat_checkMention(message, mentions){
	mentions.forEach(function(mention){
		while(message.indexOf(mention.mention) != -1){
			if(mention.mention.replace('@', '') == USER) {
				message = message.replace(mention.mention, '<div class="inline-block bg-info rounded-0 pr-1 pl-1 chat-mention">' + mention.name + '</div>');
			} else {
				message = message.replace(mention.mention, mention.name);
			}
		}
	});
	
	return message;
}

//ALERTS
function alerts_add(alerts){
	if(alerts.length > 0){
		$('.alerts-panel').fadeIn(500);
		
		var current_alert = 0;
		
		alerts_change();
		function alerts_change(){
			$('.alerts-panel .text-alert').text(alerts[current_alert]);
			if(current_alert >= alerts.length) current_alert = 0; else current_alert++;
			setTimeout(function(){
				alerts_change();
			}, 10000);
		}
	}
}

//NOTIFY
function notifies_add(notify){
	toastr['info'](notify, '', {
		timeOut: 0,
		extendedTimeOut: 0
	});
}

//SCROLL CHAT
function chat_checkScroll(){
	var scroll_chat = $('#chat-area').scrollTop() + $('#chat-area').innerHeight();
	var scroll_first_message = $('#chat-area')[0].scrollHeight;
	
	if(Math.ceil(scroll_chat) >= Math.floor(scroll_first_message)) return true;
	return false;
}

//ON RESIZE CHAT

function resize_pullout(pullout, hide) {
	var width_pullout = 275;
	if($(window).width() <= 768) width_pullout = $(window).width();
	
	if($('.pullout[data-pullout="' + pullout + '"]').length <= 0) return;
	
	if($('.pullout[data-pullout="' + pullout + '"]').hasClass('pullout-left')) var type = 'left';
	if($('.pullout[data-pullout="' + pullout + '"]').hasClass('pullout-right')) var type = 'right';
	
	// if(type == 'left') width_pullout = 210;
	width_pullout = type == 'left' ? 210 : 310;

	if($(window).width() <= 768) {
		if(hide) {
			$('.pullout[data-pullout="' + pullout + '"]').css(type, -width_pullout + 'px').css('width', width_pullout + 'px').removeClass('active');
			
			$('.main-panel').css(type, '0');
			$('.alerts-panel').css(type, '0');
		} else {
			$('.pullout[data-pullout="' + pullout + '"]').css(type, '0px').css('width', width_pullout + 'px').addClass('active');
				
			$('.main-panel').css(type, '0');
			$('.alerts-panel').css(type, '0');
		}
	} else {
		if(hide) {
			$('.pullout[data-pullout="' + pullout + '"]').css(type, -width_pullout + 'px').css('width', width_pullout + 'px').removeClass('active');
				
			$('.main-panel').css(type, '0');
			$('.alerts-panel').css(type, '0');
		} else {
			$('.pullout[data-pullout="' + pullout + '"]').css(type, '0px').css('width', width_pullout + 'px').addClass('active');
				
			if($(window).width() <= 768){
				$('.main-panel').css(type, '0');
				$('.alerts-panel').css(type, '0');
			} else {
				$('.main-panel').css(type, width_pullout + 'px');
				$('.alerts-panel').css(type, width_pullout + 'px');
			}
		}
		
		if(PATHS[0] == 'roulette' || PATHS[0] == 'jackpot' || PATHS[0] == 'unbox' || PATHS[0] == 'crash'){
			var timeout_resize = 0;
		
			var interval_resize = setInterval(function(){
				if(timeout_resize > 500) clearInterval(interval_resize);
				
				if(PATHS[0] == 'roulette') initializingSpinner_Roulette();
				if(PATHS[0] == 'jackpot') initializingSpinner_Jackpot();
				if(PATHS[0] == 'unbox') initializingSpinner_Unbox();
				if(PATHS[0] == 'crash') crashGame_resize();
				timeout_resize += 10;
			}, 10);
		}
	}
}

function checkAmountBet(amount, game){
	var $input_amount = $('#betamount_' + game);
	
	//if(parseInt(amount) > BALANCE) amount = BALANCE;
	//if(parseInt(amount) > MAX_BET) amount = MAX_BET;
	
	$input_amount.val(amount);
	
	amount = getNumberFromString(amount);
	
	amount = getFormatAmount(amount);
	
	if(game == 'tower') towerGame_generateAmounts(amount);
	else if(game == 'dice') diceGame_assign();
}

$(document).ready(function() {
	$(document).on("click", ".betshort_action", function() {
		var $field = $(this).parent().parent().parent();
		var $input = $field.find('.field_element_input');
		
		var game = $(this).data('game'); 
		
		var amount = $input.val();
		
		amount = getNumberFromString(amount);
		
		var bet_amount = getFormatAmount(amount);
		var action = $(this).data('action');
		
		if (action == 'clear') {
			bet_amount = 0;
		} else if (action == 'double') {
			bet_amount *= 2;
		} else if (action == 'half') {
			bet_amount /= 2;
		} else if (action == 'max') {
			bet_amount = BALANCE;
		} else {
			action = getNumberFromString(action);
			bet_amount += getFormatAmount(action);
		}
		
		$input.val(getFormatAmountString(bet_amount));
		
		//if(bet_amount > BALANCE) bet_amount = BALANCE;
		//if(bet_amount > MAX_BET) bet_amount = MAX_BET;
		
		if(game == 'tower') towerGame_generateAmounts(bet_amount);
		else if(game == 'dice') diceGame_assign();
		
		changeInputFieldLabel($field);
	});
	
	$(document).on("click", ".changeshort_action", function() {
		var fixed = parseInt($(this).data('fixed'));
		
		var $field = $(this).parent().parent().parent();
		var $input = $field.find('.field_element_input');
		
		var value = $input.val();
		value = getNumberFromString(value);
		
		if(fixed) var new_value = roundedToFixed(value, 2);
		else var new_value = parseInt(value);
		
		var action = $(this).data('action');
		
		if (action == 'clear') {
			new_value = 0;
		} else {
			action = getNumberFromString(action);
			
			if(fixed) new_value += roundedToFixed(action, 2);
			else new_value += parseInt(action);
		}
		
		if(fixed) $input.val(roundedToFixed(new_value, 2).toFixed(2));
		else $input.val(parseInt(new_value));
		
		changeInputFieldLabel($field);
	});
	
	//SHOW / HIDE COMMANDS PLAYER
	$(document).on('mouseover', '.chat-user-info', function() {
		$(this).find('#chat-message-settings').css('opacity', 1);
	});
	
	$(document).on('mouseleave', '.chat-user-info', function() {
		$(this).find('#chat-message-settings').css('opacity', 0);
	
		$(this).find('#chat-message-commands').css('z-index', '-1000').addClass('hidden');
	});
	
	
	//HIDE ALERTS
	$(document).on("click", ".demiss-alert", function() {
		$('.alerts-panel').fadeOut(500);
	});

	//SELLECT LANGUAGE
	$('.flag').on("click", function() {
		send_request_socket({
			type: 'chat',
			command: 'get_channel',
			channel: $(this).data('channel')
		});
	});
	
	//CHAT SCHOLL
	$('#chat-area').bind('scroll', function() {
		if(chat_checkScroll()) {
			while($("#chat-area .chat-message").length > chat_maxMessages) $("#chat-area .chat-message").first().remove();
			
			$('.chat-input-scroll').addClass('hidden');
			chat_isScroll = true;
		} else {
			$('.chat-input-scroll').removeClass('hidden');
			chat_isScroll = false;
		}
	});
	
	$('.chat-input-scroll').on('click', function(){
		$('.chat-input-scroll').addClass('hidden');
		chat_isScroll = true;
		
		$('#chat-area').animate({
			scrollTop: 5000
		},{
			duration: 500
		});
	});
	
	//EMOGIES
	$(document).on('click', '.emojis-smile-icon', function(){
		var type = $(this).data('type');
		
		$('.emojis-smile-icon').removeClass('hidden');
		$(this).addClass('hidden');
		
		// if(type == 'show') $('.emojis-panel').fadeIn(300);
		// else if(type == 'hide') $('.emojis-panel').fadeOut(300);
		$('.emojis-panel').attr('data-active', type == 'show');
	});
	
	$(document).on('click', '#chat_place_emoji', function() {
		var smile = $(this).data('emoji');
		
		$('#chat_message').val($('#chat_message').val() + smile + ' ');
		$('#chat_message').focus();
	});
	
	//SHOW COMMANDS SETTINGS ICON
	$(document).on('click', '#user_commands', function(){
		$(this).parent().parent().parent().find('#chat-message-commands').removeClass('hidden').css('z-index', '1001');
	});
	
	//COMMAND SETTING
	$(document).on('click', '#chat_message_commands', function(){
		var command = $(this).data('setting');
		
		$('#chat_message').val(command + ' ').focus();
	});
	
	//SEND COINS
	$(document).on('click', '#send_coins', function(){
		$('#modal_send_coins').modal('show');
		
		$('#modal_send_coins #send_coins_to_user').attr('data-user', $(this).data('user'));
	});
	
	$(document).on('click', '#send_coins_to_user', function(){
		var amount = $('#send_coins_amount').val();
		var user = $(this).attr('data-user');
		
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'chat',
				'command': 'send_coins',
				'to': user,
				'amount': amount,
				'recaptcha': render
			});
		});
	});
	
	//SUBMIT MESSAGE
	$("#chat-input-form").on("submit", function() {
		var message = $("#chat_message").val();
		
		if (message.trim().length > 0) {
			send_request_socket({
				type: 'chat',
				command: 'message',
				message: message,
				channel: profile_settingsGet('channel'),
			});
			
			$("#chat_message").val('');
		}
		
		return false;
	});
	
	//RAIN
	$(document).on('click', '#join_rain', function(){
		requestRecaptcha(function(render){
			send_request_socket({
				'type': 'rain',
				'command': 'join',
				'recaptcha': render
			});
		});
	});
});

/* END CHAT */

/* MINES */

function minesweeperGame_addHistory(history) {
	var class_history =  (getFormatAmount(history.win - history.amount) >= 0) ? 'isWin' : 'isLose';
	
	var DIV = '<div class="table-row minesweeper_historyitem ' + class_history + '" data-id="' + history.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(history.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis" style="color:#fff">' + history.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column text-left">' + getFormatAmountString(history.amount) + ' <i class="fa fa-coins"></i></div>';
		DIV += '<div class="table-column text-left">' + parseInt(history.amount_bombs) + '</div>';
		DIV += '<div class="table-column text-left profit">' + getFormatAmountString(history.win - history.amount) + ' <i class="fa fa-coins"></i></div>';
	DIV += '</div>';
	
	$('#minesweeper_history').prepend(DIV);
	$('#minesweeper_history .minesweeper_historyitem[data-id="' + history.id + '"]').slideUp(0).slideDown('fast');
	
	while($('#minesweeper_history .minesweeper_historyitem').length > 10) $('#minesweeper_history .minesweeper_historyitem').last().remove();
}

$(document).ready(function() {
	$(document).on('click', '#minesweeper_bet', function() {
		var amount = $('#betamount_minesweeper').val();
		var bombs = $('#bombsamount_minesweeper').val();
		
		send_request_socket({
			'type': 'minesweeper',
			'command': 'bet',
			'bombs': bombs,
			'amount': amount
		});
	});
	
	$(document).on('click', '#minesweeper_bombs .bomb', function() {
		var bomb = $(this).data('bomb');
		
		send_request_socket({
			'type': 'minesweeper',
			'command': 'bomb',
			'bomb': bomb
		});
	});
	
	$(document).on('click', '#minesweeper_cashout', function() {
		send_request_socket({
			'type': 'minesweeper',
			'command': 'cashout'
		});
	});
});

/* END MINESWEEPER */

/* TOWER */

function towerGame_generateAmounts(amount){
	var multiplier = [1.45, 2.1025, 3.048625, 4.42050625, 6.4097340625, 9.294114390625, 13.47646586640625, 19.54087550628906, 28.33426948411914, 41.08469075197275];
	
	for(var i = 0; i <= multiplier.length; i++){
		$('.tower-grid .tile[data-stage="' + i + '"]').text((amount * multiplier[i]).toFixed(5));
	}
}

function towerGame_addHistory(history) {
	var class_history =  (getFormatAmount(history.win - history.amount) >= 0) ? 'isWin' : 'isLose';
	
	var DIV = '<div class="table-row tower_historyitem ' + class_history + '" data-id="' + history.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(history.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis">' + history.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column text-left">' + getFormatAmountString(history.amount) + ' <i class="fa fa-coins"></i></div>';
		DIV += '<div class="table-column text-left">' + parseInt(history.stage) + '</div>';
		DIV += '<div class="table-column text-left profit">' + getFormatAmountString(history.win - history.amount) + '<i class="fa fa-coins"></i> </div>';
	DIV += '</div>';
	
	$('#tower_history').prepend(DIV);
	$('#tower_history .tower_historyitem[data-id="' + history.id + '"]').slideUp(0).slideDown('fast');
	
	while($('#tower_history .tower_historyitem').length > 10) $('#tower_history .tower_historyitem').last().remove();
}

$(document).ready(function() {
	$(document).on('click', '#tower_bet', function(){
		var amount = $('#betamount_tower').val();
		
		send_request_socket({
			'type': 'tower',
			'command': 'bet',
			'amount': amount
		});
		
		amount = getNumberFromString(amount);
		
		amount = getFormatAmount(amount);
		
		towerGame_generateAmounts(amount);
	});
	
	$(document).on('click', '.tower-grid .tile', function(){
		var stage = $(this).data('stage');
		var button = $(this).data('button');
		
		send_request_socket({
			'type': 'tower',
			"command": 'stage',
			'stage': stage,
			'button': button
		});
	});
	
	$(document).on('click', '#tower_cashout', function(){
		send_request_socket({
			'type': 'tower',
			'command': 'cashout'
		});
	});	
});

/* END TOWER */

/* DICE */

var diceGame_mode = 'under';
var diceGame_slow = true;

var durationSpinner_Dice = 9;
var partSpinnerWidth_Dice = 80; // was 40

$(document).ready(function() {
	$('#dice_chanceslider').on('input', function(){
		diceGame_checkChanceSlider();
	});
	
	$('#dice_chanceinput').on('input', function(){
		diceGame_checkChanceInput();
	});
		
	$('#slow_dice_type').on('change', function(){
		// $('#type_slow').addClass('is_fast');
		// diceGame_slow = false;
		if(diceGame_slow) {
			$('#type_slow').addClass('is_fast');
			diceGame_slow = false;
		} else {
			$('#type_slow').removeClass('is_fast');
			diceGame_slow = true;
		}

		// console.log(diceGame_slow);
		
		// if($(this).is(':checked')) {
		// 	var type = $(this).data('type');
		// 	
		// 	if(type == 'slow'){
		// 		$('#type_slow').removeClass('is_fast');
		// 		diceGame_slow = true;
		// 	}
		// }
	});
	
	$(document).on('click', '#dice_switch', function(){
		if(diceGame_mode == 'under'){
			diceGame_mode = 'over';
			
			$('#dice_chanceslider').css('transform', 'rotateY(180deg)');
		} else if(diceGame_mode == 'over'){
			diceGame_mode = 'under';
			
			$('#dice_chanceslider').css('transform', 'rotateY(0deg)');
		}
		
		$('#dice_type').html(diceGame_mode.toUpperCase());
		
		diceGame_assign();
	});
	
	$(document).on('click', '#dice_bet:not(.restart_dice)', function(){
		$(this).addClass('disabled');
		
		var amount = $('#betamount_dice').val();
		var chance = $('#dice_chanceslider').val();
		
		send_request_socket({
			type: 'dice',
			command: 'bet',
			amount: amount,
			chance: chance,
			mode: diceGame_mode,
			slow: diceGame_slow
		});
		
		$(this).text("Rolling...").addClass('restart_dice');
	});
	
	$(document).on('click', '#dice_bet.restart_dice', function(){
		$(this).text("Roll").removeClass('restart_dice');
	});
});

function diceGame_checkChanceSlider() {
	var chance = $('#dice_chanceslider').val();
	chance = getNumberFromString(chance);
	chance = roundedToFixed(chance, 2);
	
	if(chance > 94) chance = 94;
	if(chance < 0.01) chance = 0.01;
	
	$('#dice_chanceslider').val(chance.toFixed(2));
	$('#dice_chanceinput').val(chance.toFixed(2));
	
	diceGame_assign();
}

function diceGame_checkChanceInput() {
	var chance = $('#dice_chanceinput').val();
	
	$('#dice_chanceinput').val(chance);
	
	chance = getNumberFromString(chance);
	chance = roundedToFixed(chance, 2);
	
	if(chance > 94) chance = 94;
	if(chance < 0.01) chance = 0.01;
	
	$('#dice_chanceslider').val(chance.toFixed(2));
	
	diceGame_assign();
}

function diceGame_assign() {
	var chance = $('#dice_chanceslider').val();
	chance = getNumberFromString(chance);
	chance = roundedToFixed(chance, 2);
	
	if(diceGame_mode == 'under'){
		$('#dice_roll').val(chance.toFixed(2));
	}else if(diceGame_mode == 'over'){
		$('#dice_roll').val(roundedToFixed(100 - chance, 2).toFixed(2));
	}
	
	var multipler = roundedToFixed(95 / chance, 2);
	$('#dice_multiplier').val(multipler.toFixed(2));
	
	var amount = $('#betamount_dice').val();
	amount = getNumberFromString(amount);
	amount = getFormatAmount(amount);
	
	$('#dice_winnings').val(getFormatAmountString(multipler * amount));
	
	$('#dice_chanceslider').trigger('change');
}

function diceGame_addHistory(history) {
	var class_history =  (getFormatAmount(history.win - history.amount) >= 0) ? 'isWin' : 'isLose';
	
	var DIV = '<div class="table-row dice_historyitem ' + class_history + '" data-id="' + history.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(history.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis" style="color:#fff">' + history.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column text-left">' + getFormatAmountString(history.amount) + ' <i class="fa fa-coins"></i></div>';
		DIV += '<div class="table-column text-left">' + roundedToFixed(history.multiplier, 2).toFixed(2) + 'x</div>';
		DIV += '<div class="table-column text-left">' + roundedToFixed(history.roll, 2).toFixed(2) + '</div>';
		DIV += '<div class="table-column text-left">' + history.type.charAt(0).toUpperCase() + history.type.substr(1) + ' ' + roundedToFixed(history.number, 2).toFixed(2) + '</div>';
		DIV += '<div class="table-column text-left profit">' + getFormatAmountString(history.win - history.amount) + ' <i class="fa fa-coins"></i> </div>';
	DIV += '</div>';
	
	$('#dice_history').prepend(DIV);
	$('#dice_history .dice_historyitem[data-id="' + history.id + '"]').slideUp(0).slideDown('fast');
	
	while($('#dice_history .dice_historyitem').length > 10) $('#dice_history .dice_historyitem').last().remove();
}

function diceGame_rollSlow(roll, numbers, win){
	$('#dice_bet').removeClass('disabled');
	$('#dice_bet').addClass('disabled');

	setTimeout(function(){
		if(win){
			// $('#dice_bet').text('You rolled ' + roll + ' YOU WON!');
			$('#dice_bet').text('You win!');
			$('#dice_bet').removeClass('lose');
			$('#dice_bet').addClass('win');
		} else {
			$('#dice_bet').text('You lose!');
			$('#dice_bet').removeClass('win');
			$('#dice_bet').addClass('lose');
			// $('#dice_bet').text('You rolled ' + roll + ' YOU LOSE!');
		}
		
		$('#dice_bet').removeClass('disabled');

		$('#dice_pointer').removeClass('hidden');
		$('#dice_pointer .dice-result-bar').css('left', roundedToFixed(roll, 2) + '%');
		$('#dice_pointer .pointer').text(roundedToFixed(roll, 2).toFixed(2) + '%');
	}, 6500);
	
	rollNumber(1);

	$('#dice_bet').removeClass('lose');
	$('#dice_bet').removeClass('win');
	
	function rollNumber(number){
		var height = $('#dice-slots').height(); // was 40
		partSpinnerWidth_Dice = $('.slots-row').height();

		var distance = numbers[number - 1] * partSpinnerWidth_Dice;
		distance += partSpinnerWidth_Dice * 10 * 5 - ((height - partSpinnerWidth_Dice) / 2);
		
		var beginSpinner_Dice = new Date().getTime();
		var viewSpinner_Dice = 0.01 - distance * Math.log((0.99 + 0.001 * durationSpinner_Dice));
		var timeSpinner_Dice = (Math.log(0.01) - Math.log(viewSpinner_Dice)) / Math.log((0.99 + 0.001 * durationSpinner_Dice));
		
		renderDice(number);
		
		function renderDice(number) {
			var time = new Date().getTime() - beginSpinner_Dice;
			if (time > timeSpinner_Dice) time = timeSpinner_Dice;
			
			var deg = viewSpinner_Dice * (Math.pow((0.99 + 0.001 * durationSpinner_Dice), time) - 1) / Math.log((0.99 + 0.001 * durationSpinner_Dice));
			
			var offset = -(deg % (partSpinnerWidth_Dice * 10));
			$('#dice-slots #dice-slots-spinner[data-id="' + number + '"]').css('transform', 'translate3d(0px, ' + offset + 'px, 0px)');
			
			if(time < timeSpinner_Dice) {
				setTimeout(function(){
					renderDice(number);
				}, 1);
			}
		}
		
		if(number < 4){
			setTimeout(function(){
				rollNumber(number + 1);
			}, 300);
		}
	}
}

/* END DICE */

/*  ROULETTE  */

var rouletteGame_last100Games = [];

var rouletteGame_data = {
	'red': {
		higher_bet: 0,
		total_users: 0,
		total_amount: 0,
		total_my_amount: 0,
		users_amount: {}
	},
	'purple': {
		higher_bet: 0,
		total_users: 0,
		total_amount: 0,
		total_my_amount: 0,
		users_amount: {}
	},
	'black': {
		higher_bet: 0,
		total_users: 0,
		total_amount: 0,
		total_my_amount: 0,
		users_amount: {}
	}
}

var spinnerWidth_Roulette = 0;
var lastSpinner_Roulette = 0;
var timeSpinner_Roulette = 0;
var viewSpinner_Roulette = 0;
var beginTimeSpinner_Roulette = 0;
var movingSpinner_Roulette = false;
var durationSpinner_Roulette = 9;

var partSpinnerWidth_Roulette = 100;

function rouletteGame_finish(roll) {
	$('#roulette_timer').text('Rolled ' + roll.roll + '!');
	
	play_sound(audio_roulette_end);
	rouletteGame_addHistory(roll);
	
	if(rouletteGame_last100Games.length >= 100) rouletteGame_last100Games.shift();
	rouletteGame_last100Games.push({roll: roll.roll, color: roll.color});
	
	var rolls100 = {
		'red': 0,
		'green': 0,
		'black': 0
	};		
	rouletteGame_last100Games.forEach(function(last){
		rolls100[last.color]++;
	});
	$('#roulette_history').removeClass('hidden');
	$('#roulette_hundred_red').text(rolls100['red']);
	$('#roulette_hundred_green').text(rolls100['green']);
	$('#roulette_hundred_black').text(rolls100['black']);

	var cats = [
		['purple', 14],
		['red', 2],
		['black', 2]
	];
	
	for (var i = 0; i < cats.length; i++) {
		var $mytotal = $('#roulette_panel_' + cats[i][0] + ' .roulette-mytotal');
		var $total = $('#roulette_panel_' + cats[i][0] + ' .roulette-betstotal');
		
		if (roll.color == cats[i][0]) {
			$total.countToFloat(rouletteGame_data[cats[i][0]].total_amount * cats[i][1]);
			
			$mytotal.countToFloat(rouletteGame_data[cats[i][0]].total_my_amount * cats[i][1]);
		} else {
			$total.countToFloat(-rouletteGame_data[cats[i][0]].total_amount);
			
			$mytotal.countToFloat(-rouletteGame_data[cats[i][0]].total_my_amount);
		}
	}
	
	setTimeout(function() {
		initializingSpinner_Roulette(roll);
	}, 1000);
	
	setTimeout(function() {
		$('.roulette-mytotal,.roulette-betstotal').text(getFormatAmountString(0));
		$('.roulette-betscount').text(0);
		$('.roulette-betslist').empty();
		
		$('.roulette-highname').text('Nothing');
		$('.roulette-hightotal').text(getFormatAmountString(0));
		$('.roulette-highicon').attr('src', '/template/img/logoav.png');
		
		rouletteGame_data = {
			'red': {
				higher_bet: 0,
				total_users: 0,
				total_amount: 0,
				total_my_amount: 0,
				users_amount: {}
			},
			'purple': {
				higher_bet: 0,
				total_users: 0,
				total_amount: 0,
				total_my_amount: 0,
				users_amount: {}
			},
			'black': {
				higher_bet: 0,
				total_users: 0,
				total_amount: 0,
				total_my_amount: 0,
				users_amount: {}
			}
		}
	}, 2000);
}

function rouletteGame_addHistory(roll) {
	var count = $('#roulette_rolls .pick-ball').length;
	if (count >= 10) $('#roulette_rolls .pick-ball').first().remove();
	
	$('#roulette_rolls').append("<div class='pick-ball pick-ball-" + roll.color + "'><div class='width-full height-full text-shadow flex items-center justify-center'>" + roll.roll + "</div></div>");
}

function rouletteGame_highBet(bet){
	if(bet.amount > rouletteGame_data[bet.color].higher_bet){
		rouletteGame_data[bet.color].higher_bet = bet.amount;
		
		$('#roulette_panel_' + bet.color + ' .roulette-highname').text(bet.user.name);
		$('#roulette_panel_' + bet.color + ' .roulette-highicon').attr('src', bet.user.avatar);
		$('#roulette_panel_' + bet.color + ' .roulette-hightotal').text(getFormatAmountString(bet.amount));
	}
}

function rouletteGame_addBet(bet) {
	if(rouletteGame_data[bet.color].users_amount[bet.user.userid] === undefined){
		rouletteGame_data[bet.color].users_amount[bet.user.userid] = 0;
		rouletteGame_data[bet.color].total_users++;
		
		$('#roulette_panel_' + bet.color + ' .roulette-betscount').text(rouletteGame_data[bet.color].total_users);
	}
	
	rouletteGame_data[bet.color].users_amount[bet.user.userid] += parseFloat(bet.amount);

	rouletteGame_data[bet.color].total_amount += parseFloat(bet.amount);
	$('#roulette_panel_' + bet.color + ' .roulette-betstotal').countToFloat(rouletteGame_data[bet.color].total_amount);
	
	if(USER == bet.user.userid) {
		rouletteGame_data[bet.color].total_my_amount += parseFloat(bet.amount);
		$('#roulette_panel_' + bet.color + ' .roulette-mytotal').countToFloat(rouletteGame_data[bet.color].total_my_amount);
	}
	
	if(getFormatAmount(rouletteGame_data[bet.color].users_amount[bet.user.userid]) < 0.1) return;
	
	$('#roulette_panel_' + bet.color + ' .roulette-betslist .roulette-betitem[data-userid="' + bet.user.userid + '"]').remove();
	
	var DIV = '<div class="roulette-betitem bg-light-transparent flex items-center justify-between p-2 pr-2 p-1" data-userid="' + bet.user.userid + '" data-amount="' + rouletteGame_data[bet.color].users_amount[bet.user.userid] + '">';
		DIV += '<div class="flex items-center gap-1">';
			DIV += createAvatarField(bet.user, 'small', '');
			DIV += '<div class="text-left width-full ellipsis">' + bet.user.name + '</div>';
		DIV += '</div>';
		
		DIV += '<div class="flex items-center">' + getFormatAmountString(rouletteGame_data[bet.color].users_amount[bet.user.userid]) + '</div>';
	DIV += '</div>';
	
	$('#roulette_panel_' + bet.color + ' .roulette-betslist').prepend(DIV);
	$('#roulette_panel_' + bet.color + ' .roulette-betslist .roulette-betitem[data-userid="' + bet.user.userid + '"]').slideUp(0).slideDown('fast');
	
	rouletteGame_highBet({
		user: bet.user,
		amount: rouletteGame_data[bet.color].users_amount[bet.user.userid],
		color: bet.color
	});
	
	try {
		tinysort('#roulette_panel_red>.roulette-betslist>.roulette-bet-item', {
			data: 'amount',
			order: 'desc'
		});
	} catch (e) {}
	try {
		tinysort('#roulette_panel_purple>.roulette-betslist>.roulette-bet-item', {
			data: 'amount',
			order: 'desc'
		});
	} catch (e) {}
	try {
		tinysort('#roulette_panel_black>.roulette-betslist>.roulette-bet-item', {
			data: 'amount',
			order: 'desc'
		});
	} catch (e) {}
}

function renderSpinner_Roulette() {
	var time = new Date().getTime() - beginTimeSpinner_Roulette;
	if (time > timeSpinner_Roulette) time = timeSpinner_Roulette;
	
	var deg = viewSpinner_Roulette * (Math.pow((0.99 + 0.001 * durationSpinner_Roulette), time) - 1) / Math.log((0.99 + 0.001 * durationSpinner_Roulette));
	
	rotateSpinner_Roulette(deg);
	
	if(time < timeSpinner_Roulette) {
		setTimeout(function(){
			renderSpinner_Roulette();
		}, 1);
	} else {
		lastSpinner_Roulette = deg;
		movingSpinner_Roulette = false;
	}
}

function rotateSpinner_Roulette(offset) {
	offset = -((offset - spinnerWidth_Roulette / 2) % (partSpinnerWidth_Roulette * 15)) - (partSpinnerWidth_Roulette * 15);
	$('#roulette_spinner').css('transform', 'translate3d(' + offset + 'px, 0px, 0px)');
}

function initializingSpinner_Roulette(roll) {
	spinnerWidth_Roulette = $('#roulette_case').width();

	if(!movingSpinner_Roulette){
		if (roll === undefined) {
			rotateSpinner_Roulette(lastSpinner_Roulette);
		} else {
			var order = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
			var index = order.indexOf(roll.roll);
			
			var distance = index * partSpinnerWidth_Roulette;
			distance += (partSpinnerWidth_Roulette * 15) * 5;
			distance += Math.floor(roll.progress * partSpinnerWidth_Roulette);
			
			lastSpinner_Roulette = distance;
			
			rotateSpinner_Roulette(lastSpinner_Roulette);
		}
	}
}

function startSpinner_Roulette(roll, cooldown) {
	initializingSpinner_Roulette();
	
	var order = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
	var index = order.indexOf(roll.roll);
	
	var distance = index * partSpinnerWidth_Roulette;
	distance += (partSpinnerWidth_Roulette * 15) * 5;
	distance += Math.floor(roll.progress * partSpinnerWidth_Roulette);
	
	beginTimeSpinner_Roulette = new Date().getTime() - cooldown * 1000;
	viewSpinner_Roulette = 0.01 - distance * Math.log((0.99 + 0.001 * durationSpinner_Roulette));
	timeSpinner_Roulette = (Math.log(0.01) - Math.log(viewSpinner_Roulette)) / Math.log((0.99 + 0.001 * durationSpinner_Roulette));
	movingSpinner_Roulette = true;
	
	renderSpinner_Roulette();
	
	setTimeout(function() {
		rouletteGame_finish(roll);
	}, timeSpinner_Roulette - cooldown * 1000);
}

function rouletteGame_timer(time) {
	$('.roulette-bet').removeClass('disabled');
	
	$('#roulette_counter').animate({
		'width': '0'
	}, {
		'duration': time * 1000,
		'easing': 'linear',
		'progress': function(animation, progress, msRemaining) {
			var remaing = (msRemaining / 1000).toFixed(2);
			$('#roulette_timer').text('Rolling in ' + remaing);
			
			var las = remaing * 100 / 20;
			$('#roulette_counter').css('width', las + '%');
		},
		'complete': function() {
			$('#roulette_timer').text('Confirming all bets...');
		}
	});
}

$(document).ready(function() {
	$(window).resize(function() {
		initializingSpinner_Roulette();
	});
	
	$('.roulette-bet').on('click', function() {
		$(this).addClass('disabled');
		
		var amount = $('#betamount_roulette').val();
		var color = $(this).data("color");
		
		send_request_socket({
			'type': 'roulette',
			'command': 'bet',
			'amount': amount,
			'color': color
		});
	});
});

/* END ROULETTE */

/* CRASH */

function crashGame_resize(){
	canvas.width = $('#crash_canvas').parent().width();
	canvas.height = $('#crash_canvas').parent().width() / 2;
}

function crashGame_addGame(bet) {
	/*var DIV = '<div class="table-row crash_betitem text-color" data-id="' + bet.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(bet.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis">' + bet.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column text-left"><span class="at">-</span></div>';
		DIV += '<div class="table-column text-left"><span class="total">' + getFormatAmountString(bet.amount) + '</span></div>';
		DIV += '<div class="table-column text-left"><span class="profit">-</span></div>';
	DIV += '</div>';*/
	var DIV = `
		<div class="user playing" data-id="${bet.id}" data-didcrash="false">
			<img src="${bet.user.avatar}" alt="" />

			<p>
				<i class="fa fa-coins"></i>
				<span class="active-crash-bet-value">${parseFloat(bet.amount).toFixed(2)}</span>
			</p>

			<i class="fa fa-long-arrow-alt-right arrow"></i>

			<p class="win">
				<i class="fa fa-coins"></i>
				<span class="active-crash-bet">${parseFloat(bet.amount).toFixed(2)}</span>
			</p>

			<div class="loader"></div>
			<i class="fa fa-times crash-icon"></i>
		</div>
	`;

	var DIV2 = `
		<div class="user" data-id="${bet.id}" style="display:none">
			<img src="${bet.user.avatar}" alt="" />

			<p>
				<i class="fa fa-coins"></i>
				<span class="og-bet">${parseFloat(bet.amount).toFixed(2)}</span>
			</p>

			<i class="fa fa-long-arrow-alt-right arrow"></i>

			<p class="win">
				<i class="fa fa-coins"></i>
				<span class="green win-amount">${parseFloat(bet.amount).toFixed(2)}</span>
			</p>

			<div class="res">1.00</div>
		</div>
	`;

	$('#crash_nop').hide();
	
	$('#crash_betlist').prepend(DIV);
	$('#crash_betlist .user[data-id="' + bet.id + '"]').slideUp(0).slideDown('fast');

	$('#crash_betlist_over').prepend(DIV2);
}

function addNoPlayerMsg() {
	$('#crash_nop').show();
	$('#crash_nop_over').show();
}

const CRASH_VAL_COLORS = [
	{min: 1, max: 5, bg: '#00c9c9', color: ''},
	{min: 5.01, max: 10, bg: '#f70707', color: ''},
	{min: 10.01, max: 20, bg: '#c600f2', color: ''},
	{min: 20.01, max: 50, bg: '#fff200', color: '#fff200'},
	{min: 50.01, max: 9999999, bg: '#FFD700', color: '#ffd700'},
];

function getCrashColor(val) {
	for(let i in CRASH_VAL_COLORS) {
		let c = CRASH_VAL_COLORS[i];

		if(val >= c.min && val <= c.max) {
			return c;
		}
	}

	return CRASH_VAL_COLORS[0];
}

function crashGame_addHistory(crash, isInitial = false){
	// var class_pick = (crash <= 1.79) ? 'pick-number-low' : (crash >= 2.00) ? 'pick-number-high' : 'pick-number-medium';
	let c = getCrashColor(crash);

	$('#crash_history').prepend('<div class="pick-number mr-1" style="--color:' + c.color + ';--color-bg:' + c.bg + '">' + roundedToFixed(crash, 2).toFixed(2) + 'x</div>');
	while($('#crash_history .pick-number').length > 20) $('#crash_history .pick-number').last().remove();

	if(!isInitial) {
		$('.crash .list .user').attr('data-didcrash', true);
		// $(`#crash_betlist_over`).html('');
	}
}

function crashGame_editBet(bet){
	$(`#crash_betlist_over .user[data-id="${bet.id}"] .win-amount`).html(
		parseFloat(bet.profit + parseFloat($(`#crash_betlist_over .user[data-id="${bet.id}"] .og-bet`).html())).toFixed(2)
		);
	$(`#crash_betlist_over .user[data-id="${bet.id}"] .res`).html(
		roundedToFixed(bet.cashout, 2).toFixed(2)
	);

	$('#crash_nop_over').hide();

	$(`#crash_betlist .user[data-id="${bet.id}"]`).slideDown(0).slideUp('fast');
	$(`#crash_betlist_over .user[data-id="${bet.id}"]`).slideUp(0).slideDown('fast');
	// $('#crash_betlist .crash_betitem[data-id="' + bet.id + '"] .at').text(roundedToFixed(bet.cashout, 2).toFixed(2));
	// $('#crash_betlist .crash_betitem[data-id="' + bet.id + '"] .profit').text(getFormatAmountString(bet.profit));
	// $('#crash_betlist .crash_betitem[data-id="' + bet.id + '"]').removeClass('text-color').addClass('text-success');
}

$(document).ready(function() {
	$('#crash_bet').on('click', function() {
		var amount = $('#betamount_crash').val();
		var auto = parseInt($('#betauto_crash').val() * 100);

		send_request_socket({
			'type': 'crash',
			'command': 'bet',
			'amount': amount,
			'auto': auto
		});
	});
	
	$('#crash_cashout').on('click', function() {
		send_request_socket({
			'type': 'crash',
			'command': 'cashout'
		});
	});
});

/* END CRASH */

/* JACKPOT */

var spinnerWidth_Jackpot = 0;
var lastSpinner_Jackpot = 0;
var timeSpinner_Jackpot = 0;
var viewSpinner_Jackpot = 0;
var beginTimeSpinner_Jackpot = 0;
var movingSpinner_Jackpot = false;
var durationSpinner_Jackpot = 9;

var partSpinnerWidth_Jackpot = 80;

var jp_colors = [
	'#f44336',
	'#673ab7',
	'#3f51b5',
	'#1c7fcf',
	'#03a9f4',
	'#009688',
	'#8bc34a',
	'#ffeb3b',
	'#ff9800',
	'#ff5722',
	'#1D9144'
];

var jackpotAnim;
var jackpotAnim2;

const animateJackpot = (val, winnerId) => {
	clearInterval(jackpotAnim);

	var el = document.getElementById('jackpot_arrows');
	var current = 50;
	var speed = 7;
	var cycle = 0;
	var isEnd = false;

	jackpotAnim = setInterval(() => {
		if(isEnd) {
			// todo: restart this on a new round
			return clearInterval(jackpotAnim);
		}

		if(cycle == 2 && current == -2) {
			// el.style.transition = `left ${(((b1 + b2) / 2) / speed) * 100}ms ease-out`;
			el.style.transition = `left 2000ms ease-out`;
			// el.style.left = `${(b1 + b2) / 2}%`;
			el.style.left = val;
			isEnd = true;

			jackpotAnim2 = setTimeout(() => {
				$(`#jp_bet_${winnerId}`).removeClass('lost');
			}, 2000);

			return;
		}

		current += speed;

		el.style.left = `${current}%`;

		if(current >= 100 + speed + 1) {
			current = -2;
			el.style.transition = 'none';
			el.style.left = `${current}%`;

			cycle++;
			speed -= 1;
		} else {
			el.style.transition = 'left 100ms linear';
		}
	}, 100);
}

// setTimeout(() => animateJackpot(60, 78), 3000);

function jackpotGame_addBet(bet, total){
	/*var DIV = '<div class="table-row jackpot_betitem text-color" data-id="' + bet.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(bet.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis">' + bet.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column">TICKETS: #' + bet.tickets.min + ' TO #' + bet.tickets.max + '</div>';
		DIV += '<div class="table-column text-right">' + getFormatAmountString(bet.amount) + '</div>';
	DIV += '</div>';*/
	if(!bet.user.userid) bet.user.userid = bet.user.user;

	let index = document.getElementsByClassName('player-jp').length;

	var DIV = `
    <div class="player player-jp" style="--background:${jp_colors[index]}" id="jp_bet_${bet.user.userid}" data-id="${bet.id}" data-jpuserid="${bet.user.userid}">
			<div class="avatar">
				<img src="${bet.user.avatar}" alt="" />
			</div>

			<p class="name">${bet.user.name}</p>
			<div class="price">
				<i class="fa fa-coins"></i>
				<span id="jp_bet_${bet.user.userid}_amount">${getFormatAmountString(bet.amount)}</span>
			</div>
		</div>
	`;

	// update width of all existing colors
	$('.jp-single-color').each(function(i, obj) {
	  $(obj).css('width', `${(parseFloat($(obj).attr('data-amount')) / total) * 100}%`);
	});

	// check if we should update the user or create new one
	let exBet = document.getElementById(`jp_bet_${bet.user.userid}`);

	if(exBet !== null) {
		let el = document.getElementById(`jp_bet_${bet.user.userid}_amount`);
		let color = document.getElementById(`jp_bet_${bet.user.userid}_color`);

		let totalself = (parseFloat(el.innerText) + bet.amount);

		el.innerHTML = totalself.toFixed(2);

		color.setAttribute('data-amount', totalself);
		color.style.width = `${(totalself / total) * 100}%`;
	} else {
		$('#jackpot_betlist').prepend(DIV);
		$('#jackpot_betlist .player[data-id="' + bet.id + '"]').slideUp(0).slideDown('fast');

		$('#jackpot_colors').prepend(`<div class="jp-single-color" style="--background:${jp_colors[index]};width:${(bet.amount / total) * 100}%" id="jp_bet_${bet.user.userid}_color" data-amount="${bet.amount}"></div>`);
	}

	// get starting and ending values for the animation
	let s = 0;
	$('.jp-single-color').each(function(i, obj) {
		let width = parseFloat($(obj).css('width'));

	  $(obj).attr('data-start', s);
	  $(obj).attr('data-end', s + width);

	  s += width;
	});

	$('#jackpot_colors .meter').remove();
}

function renderSpinner_Jackpot() {
	var time = new Date().getTime() - beginTimeSpinner_Jackpot;
	if (time > timeSpinner_Jackpot) time = timeSpinner_Jackpot;
	
	var deg = viewSpinner_Jackpot * (Math.pow((0.99 + 0.001 * durationSpinner_Jackpot), time) - 1) / Math.log((0.99 + 0.001 * durationSpinner_Jackpot));
	
	rotateSpinner_Jackpot(deg);
	
	if(time < timeSpinner_Jackpot) {
		setTimeout(function(){
			renderSpinner_Jackpot();
		}, 1);
	} else {
		lastSpinner_Jackpot = deg;
		movingSpinner_Jackpot = false;
	}
}

function rotateSpinner_Jackpot(offset) {
	offset = -(offset - spinnerWidth_Jackpot / 2);
	$('#jackpot_spinner').css('transform', 'translate3d(' + offset + 'px, 0px, 0px)');
}

function initializingSpinner_Jackpot() {
	spinnerWidth_Jackpot = $('#jackpot_case').width();
	
	if(!movingSpinner_Jackpot) rotateSpinner_Jackpot(lastSpinner_Jackpot);
}

function startSpinner_Jackpot(cooldown) {
	initializingSpinner_Jackpot();
	
	var distance = partSpinnerWidth_Jackpot * 99;
	distance += Math.floor(partSpinnerWidth_Jackpot / 2);
	
	beginTimeSpinner_Jackpot = new Date().getTime();
	viewSpinner_Jackpot = 0.01 - distance * Math.log((0.99 + 0.001 * durationSpinner_Jackpot));
	timeSpinner_Jackpot = (Math.log(0.01) - Math.log(viewSpinner_Jackpot)) / Math.log((0.99 + 0.001 * durationSpinner_Jackpot));
	movingSpinner_Jackpot = true;

	renderSpinner_Jackpot();
}

function jackpotGame_addHistory(history){
	// if(!history.id) {
	// 	var el = document.getElementsByClassName('jp-game-history')[0];
	// 	history.id = parseInt(el.getAttribute('data-id')) + 1;
	// }

	if(typeof history.players !== 'object') {
		history.players = history.players.substring(1, history.players.length - 1);
		history.players = JSON.parse(history.players);
	}

	if(history.players.length == 0) {
		history.players.push({
			amount: history.amount,
			chance: history.chance,
			id: history.id,
			user: history.user
		});
	}

	var players = '';

	for(let i in history.players) {
		let p = history.players[i];

		players += `
			<div class="player${p.user.userid == history.user.userid ? '' : ' lost'}" style="--background:${jp_colors[i]}">
        <div class="avatar">
          <img src="${p.user.avatar}" alt="" />
        </div>

        <p class="name">${p.user.name}</p>
        <div class="price">
          <i class="fa fa-coins"></i>
          <span>${p.amount}</span>
        </div>
      </div>
		`;
	}


	var DIV = `
		<div class="round-container jp-game-history" data-id="${history.id}">
      <div class="game-id">Round #${history.id}</div>

      <div class="win-text">
        <span class="bold">${history.user.name}</span>
        <span>won </span>
        <span class="bold"><i class="fa fa-coins"></i> ${history.amount}</span>
        <span>with </span>
        <span class="bold">${history.chance}%</span>
        <span>chance!</span>
      </div>

      <div class="players">
        ${players}
      </div>
    </div>
	`;
	
	$('#jackpot_histories').prepend(DIV);
	
	while($('#jackpot_histories .round-container').length > 10) $('#jackpot_histories .round-container').last().remove();
}

$(document).ready(function() {
	$(window).resize(function() {
		initializingSpinner_Jackpot();
	});
	
	$(document).on('click', '#jackpot_bet', function(){
		$(this).addClass('disabled');
		
		var amount = $('#betamount_jackpot').val();
		
		send_request_socket({
			'type': 'jackpot',
			'command': 'bet',
			'amount': amount
		});
	});
});

/* END JACKPOT */

/* COINFLIP */

var coinflipGame_coin = 1;

function coinflipGame_addCoinFlip(coinflip){
	var DIV = coinflipGame_generateBet(coinflip, 0);
	
	$('#coinflip_betlist').prepend(DIV);
}

function coinflipGame_editCoinFlip(coinflip, status){
	var DIV = coinflipGame_generateBet(coinflip, status, true);
	
	document.getElementById(`cf-game-${coinflip.id}`).setAttribute('data-isempty', status <= 0);
	document.getElementById(`cf-game-${coinflip.id}-container`).innerHTML = DIV;

	if(status == 3) {
		document.getElementById(`cf-game-${coinflip.id}`).setAttribute('data-showwinner', 'true');
	}
}

var cf_tmt = {};

function coinflipGame_generateBet(coinflip, status) {
  // 1 = new player just joined
  // 2 = in progress
  // 3 = over
  var p1 = coinflip.creator == 1 ? coinflip.player1 : coinflip.player2;
  var p2 = coinflip.creator == 1 ? coinflip.player2 : coinflip.player1;

  var p1i = coinflip.creator == 1 ? 1 : 2;
  var p2i = coinflip.creator == 1 ? 2 : 1;
  
  // debug
  /*if(coinflip.id == 15) {
  	status = 3;

  	p2 = p1;
  	coinflip.data.time = 5;
  	coinflip.data.winner = 1;
  }*/

  var mid = '<p class="vs">vs</p>';
  var showWinner = false;

  let cf = document.getElementById(`cf-game-${coinflip.id}`);
  if(cf == null && status == 3) showWinner = true;

  if(status == 1) {
  	mid = `
  		<div class="cf-timer" id="coinflip_timer_${coinflip.id}">${coinflip.data.time || 0}</div>
  	`;

  	$('<script>')
	    .attr('type', 'text/javascript')
	    .text(`
	    	var coinflip_timer_${coinflip.id} = ${coinflip.data.time};
        
        clearInterval(coinflip_interval_${coinflip.id});
        var coinflip_interval_${coinflip.id} = setInterval(function(){
          coinflip_timer_${coinflip.id}--;
        
          $("#coinflip_timer_${coinflip.id}").text(coinflip_timer_${coinflip.id});
          
          if(coinflip_timer_${coinflip.id} <= 0) clearInterval(coinflip_interval_${coinflip.id});
        }, 1000);
	    	`)
	    .appendTo('head');
  } else if(status == 2) {
  	mid = `
  		<div class="cf-anim-container">
	  		<div class="coinflip-coin coinflip-coin-animation-${coinflip.data.winner}">
	  			<div class="front absolute top-0 bottom-0 left-0 right-0"></div>
	  			<div class="back absolute top-0 bottom-0 left-0 right-0"></div>
	  		</div>
	  	</div>
  	`;
  } else if(status == 3) {
  	mid = `
  		<div class="flex justify-center items-center relative">
  			<div class="cf-anim-container coinflip-pick-${coinflip.data.winner}"></div>
  		</div>
  	`;
  }

	var DIV = `
		<div id="cf-game-${coinflip.id}-container">
			<div id="cf-game-${coinflip.id}" class="cf-game" data-isempty="${status <= 0}" data-showwinner="${showWinner}" data-winner="${coinflip.data.winner}" data-id="${coinflip.id}">
		    <div class="left" data-id="${p1i}">
		      <div class="avatar">
		        <img src="${p1.avatar}" alt="" class="avatar-user" />
		        <img src="./template/img/coinflip/coin${coinflip.creator}.png" alt="" class="coin" />
		      </div>

		      <div class="name">
		        <p>${p1.name}</p>
		        <i class="fa fa-trophy"></i>
		      </div>

		      <div class="value">
		        <span>${getFormatAmountString(coinflip.amount)}</span>
		        <i class="fa fa-coins"></i>
		      </div>
		    </div>

		    <div class="mid">
		      ${mid}
		    </div>

		    <div class="right" data-id="${p2i}">
		      <div class="avatar">
		        <img src="${p2.avatar}" alt="" class="avatar-user" />
		        <img src="./template/img/coinflip/coin${coinflip.creator == 1 ? 2 : 1}.png" alt="" class="coin" />
		      </div>

		      <div class="name">
		      	<i class="fa fa-trophy"></i>
		        <p>${p2.name}</p>
		      </div>

		      <button class="site-button purple join-cf${status > 0 ? ' hidden' : ''}" id="coinflip_join" data-id="${coinflip.id}">Join game</button>

		      <div class="value">
		        <span>${getFormatAmountString(coinflip.amount)}</span>
		        <i class="fa fa-coins"></i>
		      </div>
		    </div>
		  </div>
		</div>
	`;
	
	return DIV;
}

function coinflipGame_getWinner(percentage){
	var chanceSeparator = 50;
	
	if(parseFloat(percentage) <= chanceSeparator) return 1;
	else return 2;
}

$(document).ready(function() {
	$(document).on('click', '#coinflip_join', function() {
		$(this).addClass('disabled');
		
		var id = $(this).attr('data-id');
		
		send_request_socket({
			type: 'coinflip',
			command: 'join',
			id: id
		});
	});
	
	$(document).on('click', '.coinflip-select', function(){
		var coin = $(this).data('coin');
		
		if(coinflipGame_coin != coin) {
			coinflipGame_coin = coin;
			$('.coinflip-select').removeClass('active');
			$(this).addClass('active');
		}
	});
	
	$('#coinflip_create').click(function() {
		$(this).addClass('disabled');
		
		var amount = $('#betamount_coinflip').val();
		
		send_request_socket({
			type: 'coinflip',
			command: 'create',
			amount: amount,
			coin: coinflipGame_coin
		});
	});
});

/* END COINFLIP */

/* UNBOX */

var spinnerWidth_Unbox = 0;
var lastSpinner_Unbox = 0;
var timeSpinner_Unbox = 0;
var viewSpinner_Unbox = 0;
var beginTimeSpinner_Unbox = 0;
var movingSpinner_Unbox = false;
var durationSpinner_Unbox = 8;

var partSpinnerWidth_Unbox = 150;

$(document).ready(function() {
	$(document).on('click', '#unbox_test', function() {
		var id = $(this).attr('data-id');
		
		send_request_socket({
			'type': 'unbox',
			'command': 'test',
			'id': PATHS[1]
		});
	});
	
	$(document).on('click', '#unbox_open', function() {
		var id = $(this).attr('data-id');
		
		send_request_socket({
			'type': 'unbox',
			'command': 'open',
			'id': PATHS[1]
		});
	});
	
	$(window).resize(function() {
		initializingSpinner_Unbox();
	});
});

function renderSpinner_Unbox() {
	var time = new Date().getTime() - beginTimeSpinner_Unbox;
	if (time > timeSpinner_Unbox) time = timeSpinner_Unbox;
	
	var deg = viewSpinner_Unbox * (Math.pow((0.99 + 0.001 * durationSpinner_Unbox), time) - 1) / Math.log((0.99 + 0.001 * durationSpinner_Unbox));
	
	rotateSpinner_Unbox(deg);
	
	if(time < timeSpinner_Unbox) {
		setTimeout(function(){
			renderSpinner_Unbox();
		}, 1);
	} else {
		lastSpinner_Unbox = deg;
		movingSpinner_Unbox = false;
	}
}

function rotateSpinner_Unbox(offset) {
	if(offset > 0) offset = -(offset - spinnerWidth_Unbox / 2);
	
	$('#unbox_spinner').css('transform', 'translate3d(' + offset + 'px, 0px, 0px)');
}

function initializingSpinner_Unbox() {
	spinnerWidth_Unbox = $('#unbox_case').width();
	
	if(!movingSpinner_Unbox) rotateSpinner_Unbox(lastSpinner_Unbox);
}

function startSpinner_Unbox() {
	initializingSpinner_Unbox();
	
	var distance = partSpinnerWidth_Unbox * 99;
	distance += Math.floor(Math.random() * partSpinnerWidth_Unbox);
	
	beginTimeSpinner_Unbox = new Date().getTime();
	viewSpinner_Unbox = 0.01 - distance * Math.log((0.99 + 0.001 * durationSpinner_Unbox));
	timeSpinner_Unbox = (Math.log(0.01) - Math.log(viewSpinner_Unbox)) / Math.log((0.99 + 0.001 * durationSpinner_Unbox));
	movingSpinner_Unbox = true;

	renderSpinner_Unbox();
}

function unboxGame_openCase(items){
	play_sound(audio_unbox_rolling);
	
	$('#unbox_spinner').css('transform', 'translate3d(0px, 0px, 0px)');
	
	$('#unbox_field').empty();
	
	items.forEach(function(item){
		var ITEM = '<div class="reel-item flex justify-center items-center">';
			ITEM += unboxGame_generateItem(item);
		ITEM += '</div>';
		
		$('#unbox_field').append(ITEM);
	});
	
	startSpinner_Unbox();
}

function unboxGame_addCase(case_unbox){
	/*var DIV = '<a href="' + ROOT + 'unbox/' + case_unbox.id + '">';
		DIV += '<div class="unbox-case bg-dark b-m2 rounded-1">';
			DIV += '<div class="unbox-image width-full flex justify-center items-center">';
				DIV += '<img class="width-full transition-5" src="' + ROOT + 'template/img/cases/' + case_unbox.id + '.png">';
				DIV += '<img class="unbox-case-mainitem transition-5" src="' + case_unbox.main_item + '">';
			DIV += '</div>';
			
			DIV += '<div class="unbox-case-name width-full flex column justify-end items-center pt-3">';
				DIV += '<div class="text-bold font-9">' + case_unbox.name + '</div>';
				DIV += '<div class="font-8"><div class="coins mr-1"></div>' + getFormatAmountString(case_unbox.price) + '</div>';
			DIV += '</div>';
		DIV += '</div>';
	DIV += '</a>';*/

	console.log(ROOT + 'template/img/cases/' + case_unbox.id + '.png');
	console.log(`${ROOT}template/img/cases/${case_unbox.id}.png`);

	var DIV = `
		<a href="${ROOT}unbox/${case_unbox.id}">
			<div class="case">
        <img class="logo" src="${ROOT}template/img/cases/${case_unbox.id}.png" alt="" />

        <p class="name">${case_unbox.name}</p>
        <p>
          <span>${getFormatAmountString(case_unbox.price)}</span>
          <i class="fa fa-coins"></i>
        </p>
      </div>
		</a>
	`;
	
	$('#unboxing_list_cases').append(DIV);
}

function unboxGame_showCase(items, case_unbox, spinner){
	$('#unbox_spenner').css('transform', 'translate3d(0px, 0px, 0px)');
	
	$('#unboxing_name').text(case_unbox.name);
	$('#unboxing_price').text(getFormatAmountString(case_unbox.price));
	
	$('#unbox_list').empty();
	items.forEach(function(item){
		var ITEM = unboxGame_generateItem(item);
		
		$('#unbox_list').append(ITEM);
	});
	
	$('#unbox_field').empty();
	spinner.forEach(function(item){
		var ITEM = '<div class="reel-item flex justify-center items-center">';
			ITEM += unboxGame_generateItem(item);
		ITEM += '</div>';
		
		$('#unbox_field').append(ITEM);
	});
}

function unboxGame_generateItem(item){
	var name = getInfosByItemName(item.name);
	
	var ITEM = '<div class="listing-item flex column">';
		ITEM += '<div class="listing-slot rounded-0" style="border-bottom: solid 3px ' + item.color + ' !important;">';
			if(item.exterior != null) ITEM += '<div class="item-quality text-left">' + item.exterior + '</div>';
			
			ITEM += '<div class="item-chance text-right">' + roundedToFixed(item.chance, 2).toFixed(2) + '%</div>';
		
			ITEM += '<div class="item-image-content flex items-center justify-center p-2">';
				ITEM += '<img class="item-image transition-5" src="' + item.image + '">';
			ITEM += '</div>';
			
			ITEM += '<div class="item-name-content text-left">';
				if(name.brand != null) ITEM += '<div class="item-brand ellipsis">' + name.brand + '</div>';
				if(name.name != null) ITEM += '<div class="item-name ellipsis">' + name.name + '</div>';
			ITEM += '</div>';
		
			ITEM += '<div class="item-price text-left">' + getFormatAmountString(item.price) + '<i class="fa fa-coins" style="margin-left:3px"></i></div>';
		ITEM += '</div>';
	ITEM += '</div>';
	
	return ITEM;
}

function unboxGame_addHistory(history){
	$('#unbox_history .history_message').remove();
	
	var name = getInfosByItemName(history.winning.name);
	
	/*var DIV = '<div class="history-container medium success rounded-1 p-5 fade_center" style="border: 2px solid ' + history.winning.color + '80; background: linear-gradient(to top, ' + history.winning.color + '80 0%, var(--site-color-bg-dark-transparent) 100%);">';
		DIV += '<a href="' + ROOT + 'unbox/' + history.case_unbox.id + '" target="_blank">';
			DIV += '<div class="history-content unbox flex justify-center items-center">';
				DIV += '<div class="unbox transition-5">';
					DIV += '<img class="image" src="' + history.winning.image + '">';
				
					DIV += '<div class="exterior text-bold text-left pl-1">' + name.exterior + '</div>' ;
					DIV += '<div class="chance text-bold text-right pr-1">' + parseFloat(history.winning.chance).toFixed(2) + '%</div>' ;
					
					DIV += '<div class="name text-left pl-1">';
						DIV += '<div class="text-bold">' + name.brand + '</div>';
						DIV += '<div>' + name.name + '</div>';
					DIV += '</div>';
					
					DIV += '<div class="price text-right pr-1"><div class="coins-mini mr-1"></div>'+ getFormatAmountString(history.winning.price) + '</div>';
				DIV += '</div>';
			
				DIV += '<div class="case transition-5">';
					DIV += '<img class="image" src="' + ROOT + 'template/img/cases/' + history.case_unbox.id + '.png?v=' + time() + '">';
					
					DIV += '<div class="name text-bold">' + history.case_unbox.name + '</div>';
					
					DIV += '<div class="price"><div class="coins mr-1"></div>'+ getFormatAmountString(history.case_unbox.price) + '</div>';
					
					DIV += '<div class="absolute top-0 bottom-0 left-0 right-0 p-1 flex items-center justify-center height-full gap-1">';
						DIV += createAvatarField(history.user, 'medium', '');
						DIV += '<div class="text-left width-full ellipsis">' + history.user.name + '</div>';
					DIV += '</div>';
				DIV += '</div>';
			DIV += '</div>';
		DIV += '</a>';
	DIV += '</div>';*/
	var DIV = `
		<div class="item" style="--color:${history.winning.color}">
			<div class="user">
				<img src="${history.user.avatar}" alt="" />
			</div>

			<div class="item-details">
	      <img class="skin" src="${history.winning.image}" alt="" />

	      <p>${name.brand}</p>
	      <span>${name.name}</span>
	    </div>

	    <div class="case-details">
	    	<img class="skin" src="${ROOT}template/img/cases/${history.case_unbox.id}.png" alt="" />

	    	<p>${history.case_unbox.name}</p>
	    </div>

      <div class="price price-item">
      	<span>${getFormatAmountString(history.winning.price)}</span>
      	<i class="fa fa-coins"></i>
      </div>

      <div class="price price-case">
      	<span>${getFormatAmountString(history.case_unbox.price)}</span>
      	<i class="fa fa-coins" style="opacity:0"></i>
      </div>

      <img class="logo" src="${ROOT}template/img/logocase.png" alt="" />
    </div>
	`;
	
	$('#unbox_history').prepend(DIV);
	
	while($('#unbox_history .history-container').length > 20) $('#unbox_history .history-container').last().remove();
}

/* END UNBOX */

/* PLINKO */

function plinkoGame_play(id, value, color){
	var DIV = '<div class="plinko-ball ' + color + ' flex column items-center justify-end transition-5" data-id="' + id + '">';				
		DIV += '<script>';
			DIV += 'plinkoGame_roll_' + id + '(' + value + ', "' + color + '");';
		
			DIV += 'function plinkoGame_roll_' + id + '(deep, color){';
				DIV += 'var deepY = 0;';
				DIV += 'var deepX = 0;';
				
				DIV += 'var deep_route = deep;';
				
				DIV += '$(".plinko-ball[data-id=' + id + ']").css("top", "0px");';
				DIV += '$(".plinko-ball[data-id=' + id + ']").css("left", "0px");';
				
				DIV += 'var deeps = 0;';

				DIV += 'var int_deep = setInterval(function(){';
					DIV += 'var width_arena = $("#plinko-case").width();';
					DIV += 'var height_arena = $("#plinko-case").height();';
					
					DIV += 'var width_hole = width_arena / 32;';
					DIV += 'var height_hole = height_arena / 16;';
					
					DIV += 'if(deeps >= 14) {';
						DIV += 'clearInterval(int_deep);';
						
						DIV += 'var deep_winnings = { "green": 1, "orange": 2, "red": 3 };';
						
						DIV += '$(".plinko-ball[data-id=' + id + ']").css("top", (deepY * height_hole + 30 * deep_winnings[color]) + "px");';
						
						DIV += 'setTimeout(function(){';
							DIV += '$(".plinko-ball[data-id=' + id + ']").remove()';
						DIV += '}, 10000);';
						
						DIV += 'return;';
					DIV += '}';
					
					DIV += 'var route = deep_route % 10;';
					DIV += 'deep_route = parseInt(deep_route / 10);';
					
					DIV += 'deepY++;';
					
					DIV += 'if(route == 1) deepX--;';
					DIV += 'else deepX++;';
					
					DIV += '$(".plinko-ball[data-id=' + id + ']").css("top", (deepY * height_hole) + "px");';
					DIV += '$(".plinko-ball[data-id=' + id + ']").css("left", (deepX * width_hole) + "px");';
					
					DIV += 'deeps++;';
				DIV += '}, 500);';
			DIV += '}';
		DIV += '</script>';
	DIV += '</div>';
	
	$('#plinko-arena').append(DIV);
}

function plinkoGame_addHistory(history) {
	var class_history =  (getFormatAmount(getFormatAmount(history.amount * history.pick) - history.amount) >= 0) ? 'isWin' : 'isLose';
	
	var DIV = '<div class="table-row plinko_historyitem ' + class_history + '" data-id="' + history.id + '">';
		DIV += '<div class="table-column text-left">';
			DIV += '<div class="flex items-center gap-1">';
				DIV += createAvatarField(history.user, 'small', '');
				DIV += '<div class="text-left width-full ellipsis">' + history.user.name + '</div>';
			DIV += '</div>';
		DIV += '</div>';
		DIV += '<div class="table-column text-left">' + getFormatAmountString(history.amount) + ' <i class="fa fa-coins"></i></div>';
		DIV += '<div class="table-column text-left">' + roundedToFixed(history.pick, 2).toFixed(2) + 'x</div>';
		DIV += '<div class="table-column text-left"><div class="color" data-color="' + history.color.toLowerCase() + '">' + history.color.toLowerCase() + '</div></div>';
		DIV += '<div class="table-column text-left profit">' + getFormatAmountString(getFormatAmount(history.amount * history.pick) - history.amount) + ' <i class="fa fa-coins"></i></div>';
	DIV += '</div>';
	
	$('#plinko_history').prepend(DIV);
	$('#plinko_history .plinko_historyitem[data-id="' + history.id + '"]').slideUp(0).slideDown('fast');
	
	while($('#plinko_history .plinko_historyitem').length > 10) $('#plinko_history .plinko_historyitem').last().remove();
}

$(document).ready(function() {
	$(document).on('click', '.plinko_bet', function() {
		$(this).addClass('disabled');
		
		var amount = $('#betamount_plinko').val();
		var color = $(this).data('color');

		send_request_socket({
			'type': 'plinko',
			'command': 'bet',
			'amount': amount,
			'color': color
		});
	});
});

/* END PLINKO */

/* OFFERS */

var offers_maxSelectItems = 20;
var offers_selectedItems = 0;

var offers_nameGames = {
	'csgo': 'CS:GO',
	'dota2': 'DOTA 2',
	'h1z1': 'H1Z1',
	'rust': 'RUST',
	'tf2': 'TEAM FORTRESS 2',
}

function offers_generateItem(items, data, feathers, classes, header, footer){
	var price = 0;
	var offset = 0;
	var games = [];
	
	items.forEach(function(item){
		price += item.price;
		offset += item.offset;
		if(!games.includes(offers_nameGames[item.game])) games.push(offers_nameGames[item.game]);
	});
	
	var ITEM = '<div class="listing-item flex column ' + classes+ '" ' + data + '>';
		ITEM += header;
	
		ITEM += '<div class="listing-slot rounded-0" style="border-bottom: solid 3px ' + items[0].color + ' !important;">';
			ITEM += feathers;
			
			if(items.length == 1){
				var name = getInfosByItemName(items[0].name);
				
				if(name.exterior != null) ITEM += '<div class="item-quality text-left">' + name.exterior + '</div>';
			
				ITEM += '<div class="item-image-content flex items-center justify-center p-2">';
					ITEM += '<img class="item-image transition-5" src="' + items[0].image + '">';
				ITEM += '</div>';
				
				if(items[0].stickers !== undefined){
					if(items[0].stickers.length > 0){
						ITEM += '<div class="item-stickers-content flex justify-end">';
							ITEM += '<div class="item-stickers flex">';
								items[0].stickers.forEach(function(sticker){
									ITEM += '<div class="item-sticker flex justify-start" title="' + sticker.name + '">';
										ITEM += '<img src="' + sticker.image + '">';
									ITEM += '</div>';
								});
							ITEM += '</div>';
						ITEM += '</div>';
					}
				}
				
				ITEM += '<div class="item-name-content text-left">';
					if(name.brand != null) ITEM += '<div class="item-brand ellipsis">' + name.brand + '</div>';
					if(name.name != null) ITEM += '<div class="item-name ellipsis">' + name.name + '</div>';
				ITEM += '</div>';
				
				if(items[0].wear !== undefined){
					if(items[0].wear != null){
						ITEM += '<div class="item-wear-bar flex column justify-end">';
							ITEM += '<div class="wear-bar-pointer flex justify-center width-0" style="left: ' + items[0].wear * 100 + '%;"><i class="fa fa-caret-down"></i></div>';
							ITEM += '<div class="wear-bar-content rounded-1">';
								ITEM += '<div class="wear-bar-exterior wear-bar-content-fn"></div>';
								ITEM += '<div class="wear-bar-exterior wear-bar-content-mw"></div>';
								ITEM += '<div class="wear-bar-exterior wear-bar-content-ft"></div>';
								ITEM += '<div class="wear-bar-exterior wear-bar-content-ww"></div>';
								ITEM += '<div class="wear-bar-exterior wear-bar-content-bs"></div>';
							ITEM += '</div>';
						ITEM += '</div>';
						
						ITEM += '<div class="item-wear text-right">~' + items[0].wear.toString().slice(0, 6) + '</div>';
					}
				}
			} else if(items.length > 1){
				ITEM += '<div class="item-image-content item-bundle-content flex items-center justify-center p-2">';
					for(var i = 1; i <= 3; i++){
						ITEM += '<div class="item-bundle flex items-center">';
							if(items.length >= i) {
								ITEM += '<img class="item-bundle-image transition-5" src="' + items[i - 1].image + '">';
								
								if(items[i - 1].stickers !== undefined){
									if(items[i - 1].stickers.length > 0){
										ITEM += '<div class="item-bundle-stickers-content">';
											ITEM += '<div class="item-stickers flex">';
												items[i - 1].stickers.forEach(function(sticker){
													ITEM += '<div class="item-sticker flex justify-start" title="' + sticker.name + '">';
														ITEM += '<img src="' + sticker.image + '">';
													ITEM += '</div>';
												});
											ITEM += '</div>';
										ITEM += '</div>';
									}
								}
							}
						ITEM += '</div>';
					}
					
					ITEM += '<div class="item-bundle flex items-center view_more_bundle">';
						if(items.length > 3){
							ITEM += '<div class="item-bundle-image-more text-center">';
								ITEM += '<div class="font-8">+' + (items.length - 3) + '</div>';
								ITEM += '<div class="font-6">more</div>';
							ITEM += '</div>';
						} else {
							ITEM += '<div class="item-bundle-image-more text-center">';
								ITEM += '<div class="font-8">' + items.length + ' Items</div>';
								ITEM += '<div class="font-6">view</div>';
							ITEM += '</div>';
						}
					ITEM += '</div>';
				ITEM += '</div>';
				
				ITEM += '<div class="item-name-content text-left">';
					ITEM += '<div class="item-brand ellipsis">ITEM BUNDLE X' + items.length + '</div>';
					ITEM += '<div class="item-name ellipsis">' + games.sort().join(', ') + '</div>';
				ITEM += '</div>';
			}
			
			ITEM += '<div class="item-price text-left">';
				ITEM += '<div class="coins"></div> ' + getFormatAmountString(price);
				
				if(offset > 0) ITEM += '<span class="text-danger ml-1 font-6">(+' + roundedToFixed(offset / items.length).toFixed(2) + '%)</span>';
				if(offset < 0) ITEM += '<span class="text-success ml-1 font-6">(-' + roundedToFixed(-offset / items.length).toFixed(2) + '%)</span>';
			ITEM += '</div>';
		ITEM += '</div>';
		
		ITEM += footer;
	ITEM += '</div>';
	
	return ITEM;
}

function offers_addItemInventory(item){
	var items = [item];
	
	if(item.tradelocked === undefined) {
		item.tradelocked = {
			tradelocked: false,
			time: 0
		}
	}
	
	if(item.accepted === undefined) item.accepted = true;
	
	var time_tradelocked = getFormatSeconds(item.tradelocked.time);
	
	var data = "data-id='" + item.id + "'  data-game='" + item.game + "' data-accepted='" + ((!item.accepted || item.tradelocked.tradelocked) ? 0 : 1) + "' data-name='" + item.name + "' data-price='" + item.price + "' data-items='" + JSON.stringify({items}).replaceAll('\'', '') + "'";
	if(PATHS[0] == 'withdraw') data += " data-bot='" + item.bot + "'";
	
	var feathers = '<div class="item-selected flex justify-center items-center hidden font-8"><i class="fa fa-check" aria-hidden="true"></i></div>';
		
	if(!item.accepted || item.tradelocked.tradelocked) {
		feathers += '<div class="item-not-accepted"></div>';
	}					
	if(PATHS[0] == 'withdraw'){
		feathers += '<div class="item-tradelocked rounded-0 flex items-center">';
			if(item.tradelocked.tradelocked) feathers += '<div class="m-a text-danger"><i class="fa fa-lock" aria-hidden="true"></i> ' + time_tradelocked.days + 'D ' + time_tradelocked.hours + 'H</div>';
			else feathers += '<div class="m-a text-success"><i class="fa fa-lock " aria-hidden="true"></i> INSTANT</div>';
		feathers += '</div>';
	} else if(PATHS[0] == 'deposit'){
		if(!item.accepted || item.tradelocked.tradelocked){
			feathers += '<div class="item-tradelocked rounded-0 flex items-center">';
				if(item.tradelocked.tradelocked) feathers += '<div class="m-a text-danger"><i class="fa fa-lock" aria-hidden="true"></i> ' + time_tradelocked.days + 'D ' + time_tradelocked.hours + 'H</div>';
				else if(!item.accepted) feathers += '<div class="m-a text-danger"><i class="fa fa-lock" aria-hidden="true"></i> NOT ACCEPTED</div>';
			feathers += '</div>';
		}
	}
	var classes = '';
	if(!item.accepted || item.tradelocked.tradelocked) classes = 'not-accepted';
	var header = '';
	var footer = '';
	
	$('#list_items').append(offers_generateItem([item], data, feathers, classes, header, footer));
}

function offers_addBundleInventory(item){
	if($('#list_items .listing-item').length <= 0) $('#list_items').empty();
	
	item.items.sort(function(a, b){
		return b.price - a.price
	});
	
	var data = "data-id='" + item.id + "' data-accepted='1' data-name='Bundle' data-price='" + item.amount + "' data-items='" + JSON.stringify({ items: item.items }).replaceAll('\'', '') + "'";
	var feathers = '<div class="item-selected flex justify-center items-center hidden font-8"><i class="fa fa-check" aria-hidden="true"></i></div>';
	var classes = 'bundle';
	var header = '';
	var footer = '<div class="item-bundle-time-content">';
		footer += '<span class="item_bundle_time" data-id="' + item.id + '">' + getFormatTime(item.time * 1000, "ago") + '</span>';
		footer += '<script>setInterval(function(){$(".item_bundle_time[data-id=' + item.id + ']").text(getFormatTime(' + item.time * 1000 + ', "ago"))},1000)</script>';
	footer += '</div>';
	
	$('#list_items').append(offers_generateItem(item.items, data, feathers, classes, header, footer));
}

function offers_editPending(offer){
	if($('#pending-offers .bundle_offer[data-id="' + offer.id + '"][data-method="' + offer.method + '"]').length <= 0) return;
	
	var DIV = offers_generatePadding(offer);
	$('#pending-offers .bundle_offer[data-id="' + offer.id + '"][data-method="' + offer.method + '"]').replaceWith(DIV);
	
	offers_refreshPendingItems();
	
	offers_addStatusPending(offer);
}

function offers_addPending(offer, notify){
	var DIV = offers_generatePadding(offer);
	$('#pending-offers').append(DIV);
	
	offers_refreshPendingItems();
	
	if(notify) offers_addStatusPending(offer);
}

function offers_generatePadding(offer){
	var price = 0;
	
	offer.items.forEach(function(item){
		price += getFormatAmount(item.price);
	});
	
	offer.items.sort(function(a, b){
		return b.price - a.price
	});
	
	var text_status = '';
	var class_status = '';
	if(offer.method == 'p2p'){
		if(offer.status == -1) {
			text_status = 'Listing Canceled';
			class_status = 'error';
		}
		if(offer.status == 0) text_status = 'Waiting for buyer...';
		if(offer.status == 1) text_status = 'Waiting for seller confirmation...';
		if(offer.status == 2) text_status = 'Buyer found. Tracking for trade...';
		if(offer.status == 3) text_status = 'Trade found. Waithing for accepting trade...';
		if(offer.status == 4) {
			text_status = 'Items Delivered';
			class_status = 'success';
		}
	} else if(offer.method == 'steam'){
		if(offer.status == -1) {
			text_status = 'Offer Declined';
			class_status = 'error';
		}
		if(offer.status == 0) text_status = 'Waiting for bot confirmation...';
		if(offer.status == 1) text_status = 'Waiting for accepting...';
		if(offer.status == 2) {
			text_status = 'Offer Accepted';
			class_status = 'success';
		}
	}
	
	var data = "data-id='" + offer.id + "' data-method='" + offer.method + "' data-price='" + price + "' data-offer='" + JSON.stringify({status: offer.status, type: offer.type, data: offer.data}) + "' data-items='" + JSON.stringify({items: offer.items}).replaceAll('\'', '') + "'";
	var feathers = '<div class="item-bundle-settings transition-5" style="opacity: 0; display: unset;">';
		feathers += '<div class="flex items-center justify-center height-full width-full">';
			feathers += '<button class="site-button purple inspect_pending_offer m-a" data-id="' + offer.id + '" data-method="' + offer.method + '">INSPECT</button>';
		feathers += '</div>';
	feathers += '</div>';
	var classes = 'p-1 rounded-1 bundle_offer unselectable ' + class_status;
	var header = '<div class="item-pending-title text-left text-upper">' + offer.type + ' ' + offer.method + '</div>';
	var footer = '<div class="item-pending-status text-center">' + text_status + '</div>';
	
	return offers_generateItem(offer.items, data, feathers, classes, header, footer);
}

function offers_refreshCartItems() {
    var amount = 0;
    var count = 0;
	
    $('#list_items .listing-item.active').each(function(i, e) {
        amount += getFormatAmount($(this).data('price'));
        count += $(this).data('items').items.length;
    });
	
	$('#cart_items_total').countToFloat(amount);
    $('#cart_items_count').text(count);
	
	offers_selectedItems = count;
	
    if (count == 0) $('#confirm_offer').addClass('disabled');
	else $('#confirm_offer').removeClass('disabled');
}

function offers_refreshPendingItems() {
    var total = 0;
    var amount = 0;
    var count = 0;
	
    $('#pending-offers .bundle_offer').each(function(i, e) {
		total++;
		amount += getFormatAmount($(this).data('price'));
		count += $(this).data('items').items.length;
    });
	
	if(total <= 0) $('#pending_count').addClass('hidden');
	else $('#pending_count').removeClass('hidden');
	
	$('#pending_count').text(total);
	$('#padding_items_total').countToFloat(amount);
    $('#padding_items_count').text(count);
}

function offers_addHistory(offer){
	var class_history =  (offer.type == 'deposit') ? 'success' : 'danger';
	
	var DIV = '<div class="history-container small success rounded-1 p-5 fade_center ' + class_history + '">';
		DIV += '<div class="history-content flex justify-center items-center">';
			DIV += '<img class="image icon-medium rounded-full" src="' + offer.user.avatar + '">';
			DIV += '<div class="name">' + offer.user.name + '</div>';
			DIV += '<div class="price">' + ((offer.method == 'crypto') ? '<div class="' + offer.game + '-coins-mini"></div> ' + offer.amount + ' with ' + offer.game.toUpperCase() : '<div class="coins-mini"></div> ' + getFormatAmountString(offer.amount) + ' with ' + offer.game.toUpperCase()) + '</div>';
		DIV += '</div>';
	DIV += '</div>';
	
	$('#last_offers').prepend(DIV);
	
	while($('#last_offers .history-container').length > 10) $('#last_offers .history-container').last().remove();
}

function offers_calculateCurrencyValue(type, currency){
	var $input_amount = $('.currency-panel #currency_coin_' + type.toLowerCase());
	var value = $input_amount.val();
	
	var amount = value;
	amount = getNumberFromString(amount);
	
	if(type == 'from'){
		$('.currency-panel #currency_coin_from').val(value);
		
		$('.currency-panel #currency_coin_to').val((getFormatAmount(amount) / offers_currencyValues[currency]).toFixed(8));
	} else if(type == 'to'){
		$('.currency-panel #currency_coin_to').val(value);
		
		$('.currency-panel #currency_coin_from').val(getFormatAmountString(offers_currencyValues[currency] * amount));
	}
	
	var types = {
		from: 'to',
		to: 'from'
	};
	
	var $input_check = $('.currency-panel #currency_coin_' + types[type.toLowerCase()]);
	
	changeInputFieldLabel($input_check.parent().parent().parent());
}

function offers_addStatusPending(offer){
	$('#modal_offers_pending').modal('hide');
	
	$('#modal_offers_pending .offers_pending_method').addClass('hidden');
	$('#modal_offers_pending .offers_pending_method[data-method="' + offer.method + '"]').removeClass('hidden');
	
	$('#modal_offers_pending .offers_pending_method[data-method="' + offer.method + '"] .offers_pending_type').addClass('hidden');
	$('#modal_offers_pending .offers_pending_method[data-method="' + offer.method + '"] .offers_pending_type[data-type="' + offer.type + '"]').removeClass('hidden');
	
	var $content = $('#modal_offers_pending .offers_pending_method[data-method="' + offer.method + '"] .offers_pending_type[data-type="' + offer.type + '"] .offers_pending_status[data-status="' + offer.status + '"]');
	
	$('#modal_offers_pending .offers_pending_method[data-method="' + offer.method + '"] .offers_pending_type[data-type="' + offer.type + '"] .offers_pending_status').addClass('hidden');
	$content.removeClass('hidden');
	
	var data = "data-items='" + JSON.stringify({items: offer.items}).replaceAll('\'', '') + "'";
	var feathers = '';
	var classes = 'bundle_offer unselectable';
	var header = '';
	var footer = '';
	
	$content.find('.bundle_items_pending').html(offers_generateItem(offer.items, data, feathers, classes, header, footer));

	if(offer.method == 'p2p'){
		if(offer.status == 0) {
			var COUNTER = 'Waiting for <span class="counter" id="counter_' + offer.method + '_' + offer.id + '_' + offer.status + '">00:00:00</span>';
			
			COUNTER += '<script>';
				COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(getFormatSeconds(' + (time() - offer.data.time) + ').days + ":" + getFormatSeconds(' + (time() - offer.data.time) + ').hours + ":" + getFormatSeconds(' + (time() - offer.data.time) + ').minutes + ":" + getFormatSeconds(' + (time() - offer.data.time) + ').seconds);';
			
				COUNTER += 'var time_' + offer.method + '_' + offer.id + '_' + offer.status + ' = ' + (time() - offer.data.time) + ';';
			
				COUNTER += 'clearInterval(int_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
				COUNTER += 'var int_' + offer.method + '_' + offer.id + '_' + offer.status + ' = setInterval(function(){';
					COUNTER += 'var time = getFormatSeconds(time_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
					
					COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(time.days + ":" + time.hours + ":" + time.minutes + ":" + time.seconds);';
					
					COUNTER += 'time_' + offer.method + '_' + offer.id + '_' + offer.status + ' ++;';
				COUNTER += '}, 1000);';
			COUNTER += '</script>';
			
			$content.find('.counter_content').html(COUNTER);
			
			$content.find('#cancel_p2p_listing').attr('data-listing', offer.id);
		}
		if(offer.status == 1 || offer.status == 2 || offer.status == 3) {
			var COUNTER = 'Expire in <span class="counter" id="counter_' + offer.method + '_' + offer.id + '_' + offer.status + '">00:00</span>';
			
			COUNTER += '<script>';
				COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(getFormatSeconds(' + (offer.data.time - time()) + ').minutes + ":" + getFormatSeconds(' + (offer.data.time - time()) + ').seconds);';
			
				COUNTER += 'var time_' + offer.method + '_' + offer.id + '_' + offer.status + ' = ' + (offer.data.time - time()) + ';';
			
				COUNTER += 'clearInterval(int_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
				COUNTER += 'var int_' + offer.method + '_' + offer.id + '_' + offer.status + ' = setInterval(function(){';
					COUNTER += 'if(time_' + offer.method + '_' + offer.id + '_' + offer.status + ' <= 0){';
						COUNTER += 'clearInterval(int_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
						COUNTER += 'return;';
					COUNTER += '}';
					
					COUNTER += 'var time = getFormatSeconds(time_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
					
					COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(time.minutes + ":" + time.seconds);';
					
					COUNTER += 'time_' + offer.method + '_' + offer.id + '_' + offer.status + ' --;';
				COUNTER += '}, 1000);';
			COUNTER += '</script>';
			
			$content.find('.counter_content').html(COUNTER);
		}
		if(offer.type == 'deposit'){
			if(offer.status == 1) $content.find('#confirm_p2p_listing').attr('data-listing', offer.id); 
			if(offer.status == 1 || offer.status == 2 || offer.status == 3){
				var DIV = createAvatarField(offer.data.user, 'medium', '');
				DIV += '<div>' + offer.data.user.name + '</div>';
				
				$content.find('.offer_buyer_profile').attr('href', 'http://steamcommunity.com/profiles/' + offer.data.steamid);
				$content.find('.offer_buyer_profile').html(DIV);
			}
			if(offer.status == 2 || offer.status == 3) $content.find('.trade_link_offer').attr('href', offer.data.tradelink);
		}
		if(offer.type == 'withdraw'){
			if(offer.status == 3){
				$content.find('.trade_link_offer').attr('href', offer.data.tradeoffer);
			}
		}
	} else if(offer.method == 'steam'){
		if(offer.status == -1 || offer.status == 0 || offer.status == 1 || offer.status == 2) $content.find('.offer_id').text(offer.data.tradeofferid);
		if(offer.status == 0 || offer.status == 1) $content.find('.offer_code').text(offer.data.code);
		if(offer.type == 'deposit'){
			if(offer.status == 2) $content.find('.offer_coins').text(offer.data.amount);
		}
		if(offer.type == 'withdraw'){
			if(offer.status == -1) $content.find('.offer_coins').text(offer.data.amount);
		}
		if(offer.status == 1) {
			var COUNTER = 'Expire in <span class="counter" id="counter_' + offer.method + '_' + offer.id + '_' + offer.status + '">00:00</span>';
			
			COUNTER += '<script>';
				COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(getFormatSeconds(' + (offer.data.time - time()) + ').minutes + ":" + getFormatSeconds(' + (offer.data.time - time()) + ').seconds);';
			
				COUNTER += 'var time_' + offer.method + '_' + offer.id + '_' + offer.status + ' = ' + (offer.data.time - time()) + ';';
			
				COUNTER += 'clearInterval(int_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
				COUNTER += 'var int_' + offer.method + '_' + offer.id + '_' + offer.status + ' = setInterval(function(){';
					COUNTER += 'if(time_' + offer.method + '_' + offer.id + '_' + offer.status + ' <= 0){';
						COUNTER += 'clearInterval(int_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
						COUNTER += 'return;';
					COUNTER += '}';
					
					COUNTER += 'var time = getFormatSeconds(time_' + offer.method + '_' + offer.id + '_' + offer.status + ');';
					
					COUNTER += '$("#counter_' + offer.method + '_' + offer.id + '_' + offer.status + '").text(time.minutes + ":" + time.seconds);';
					
					COUNTER += 'time_' + offer.method + '_' + offer.id + '_' + offer.status + ' --;';
				COUNTER += '}, 1000);';
			COUNTER += '</script>';
			
			$content.find('.counter_content').html(COUNTER);
			
			$content.find('.offer_trade').attr('href', 'https://steamcommunity.com/tradeoffer/' + offer.data.tradeofferid + '/');
		}
	}

	setTimeout(function(){
		$('#modal_offers_pending').modal('show');
	}, 500);
}

$(document).ready(function() {
	$(document).on("mouseover", ".bundle_offer", function() {
		$(this).find('.item-bundle-settings').css('display', 'unset').css('opacity', 1);
	});
	
	$(document).on("mouseleave", ".bundle_offer", function() {
		$(this).find('.item-bundle-settings').css('opacity', 0);
		
		setTimeout(function(){
			$(this).find('.item-bundle-settings').css('display', 'none');
		}, 500);
	});
	
	$(document).on('click', '.bundle_offer .view_more_bundle', function() {
		var $bundle = $(this).parent().parent().parent();
		
		var items = $bundle.data('items').items;
			
		$('#modal_view_bundle').modal('show');
		$('#modal_view_bundle .bundle-items').empty();
		
		items.forEach(function(item){
			var data = '';
			var feathers = '';
			var classes = 'bundle_offer';
			var header = '';
			var footer = '';
			
			$('#modal_view_bundle .bundle-items').append(offers_generateItem([item], data, feathers, classes, header, footer));
		});
	});
		
	$(document).on("click", "#cancel_p2p_listing", function() {
		var listing = $(this).attr('data-listing');
		
		requestRecaptcha(function(render){
			send_request_socket({
				type: 'p2p',
				command: 'cancel_listing',
				id: listing,
				recaptcha: render
			});
		});
	});
	
	$(document).on("click", "#confirm_p2p_listing", function() {
		var listing = $(this).data('listing');
		
		requestRecaptcha(function(render){
			send_request_socket({
				type: 'p2p',
				command: 'confirm_listing',
				id: listing,
				recaptcha: render
			});
		});
	});
	
	$(document).on("click", "#generate_address", function() {
		var currency = $(this).data('currency');
		
		requestRecaptcha(function(render){
			send_request_socket({
				type: 'currency',
				command: 'generate_address',
				currency: currency,
				recaptcha: render
			});
		});
	});
	
	$(document).on("click", "#crypto_withdraw", function() {
		var currency = $(this).data('game').toLowerCase();
		var address = $('.currency-panel #currency_withdraw_address').val();
		var amount = $('.currency-panel #currency_coin_from').val();
		
		requestRecaptcha(function(render){
			send_request_socket({
				type: 'currency',
				command: 'withdraw',
				currency: currency.toUpperCase(),
				amount: amount,
				address: address,
				recaptcha: render
			});
		});
	});
	
	$('#order_by').on('change', function() {
		var type = $(this).val();
		if (type == 1) {
			tinysort('#list_items .listing-item', {
				data: 'price',
				order: 'desc'
			});
		} else if (type == 2) {
			tinysort('#list_items .listing-item', {
				data: 'price',
				order: 'asc'
			});
		} else if (type == 3) {
			tinysort('#list_items .listing-item', {
				data: 'name',
				order: 'asc'
			});
		} else if (type == 4) {
			tinysort('#list_items .listing-item', {
				data: 'name',
				order: 'desc'
			});
		}
		
		tinysort('#list_items .listing-item', {
			data: "accepted",
			order: "desc"
		});
	});
	
	$('.filter').on('keyup', function() {
        var filter = $(this).val().toLowerCase();
		
		$('#list_items>.listing-item').addClass('hidden').filter(function(i, e) {
			var name = $(this).data('name');
			
			if (name.toLowerCase().indexOf(filter) >= 0) return true;
		}).removeClass('hidden');
		
		tinysort('#list_items .listing-item', {
			data: 'accepted',
			order: 'desc'
		});
    });
	
	$(document).on('click', '.listing-item:not(.not-accepted):not(.unselectable)', function() {
        var dataPos = $(this).data("id");
		
		if ($(this).hasClass('active')) {
            $(this).removeClass('active').find('.item-selected').addClass('hidden');
			
			$('#cart-items .item-selected-content[data-id="' + dataPos + '"]').remove();
        } else {
			if($(this).hasClass('bundle') || offers_selectedItems < offers_maxSelectItems){
				var items = $(this).data('items').items;
				
				items.sort(function(a, b){
					return b.price - a.price
				});
				
				if(items.length == 1){
					var name = getInfosByItemName(items[0].name);
					
					if($(this).hasClass('bundle')){
						$('#list_items .listing-item.active').removeClass('active');
						$('#cart-items').empty();
					}
					
					$(this).addClass('active').find('.item-selected').removeClass('hidden');
					
					var DIV = '<div class="item-selected-content p-2 flex gap-1 items-center justify-between rounded-0" style="border-left: solid 4px ' + items[0].color + '" data-id="' + dataPos + '">';
						DIV += '<div class="flex ellipsis gap-2">';
							DIV += '<img class="icon-large" src="' + items[0].image + '">';
							DIV += '<div class="ellipsis text-left">';
								DIV += '<div class="mb-2">';
									DIV += '<div class="ellipsis font-6 text-bold">' + items[0].name + '</div>';
									if(name.exterior != null) if(name.exterior.trim()) DIV += '<div class="ellipsis font-5 text-gray">' + name.exterior + '</div>';
								DIV += '</div>';
								DIV += '<div class="font-7"><div class="coins mr-1"></div>' + getFormatAmountString(items[0].price) + '</div>';
							DIV += '</div>';
						DIV += '</div>';
						DIV += '<div class="pointer" id="remove_item" data-id="' + dataPos + '">';
							DIV += '<i class="fa fa-times" aria-hidden="true"></i>';
						DIV += '</div>';
					DIV += '</div>';
					
					$('#cart-items').append(DIV);
				} else {
					var bundle_total = getFormatAmount($(this).data('price'));
					
					$('#modal_select_bundle').modal('show');
					$('#modal_select_bundle .bundle-items').empty(dataPos);
					
					$('#modal_select_bundle #select_bundle').attr('data-bundle', dataPos);
					$('#modal_select_bundle #bundle_total_amount').text(getFormatAmountString(bundle_total));
					
					items.forEach(function(item){
						var data = '';
						var feathers = '';
						var classes = 'bundle_offer';
						var header = '';
						var footer = '';
						
						$('#modal_select_bundle .bundle-items').append(offers_generateItem([item], data, feathers, classes, header, footer));
					});
				}
			}else{
				notify('error', 'Error: You can select maximum ' + offers_maxSelectItems + ' item!');
			}
        }
		
		offers_refreshCartItems();
    });
	
	$(document).on('click', '#select_bundle', function() {
        var dataPos = $(this).attr("data-bundle");

		$('#list_items .listing-item.active').removeClass('active').find('.item-selected').addClass('hidden');
		
		$('#cart-items').empty();
		
		$('#list_items .listing-item[data-id="' + dataPos + '"]').addClass('active').find('.item-selected').removeClass('hidden');
		
		var items = $('#list_items .listing-item.bundle[data-id="' + dataPos + '"]').data('items').items;
		
		items.forEach(function(item){
			var name = getInfosByItemName(item.name);
			
			var DIV = '<div class="item-selected-content p-2 flex gap-1 items-center justify-between rounded-0" style="border-left: solid 4px ' + item.color + '" data-id="' + dataPos + '">';
				DIV += '<div class="flex ellipsis gap-2">';
					DIV += '<img class="icon-large" src="' + item.image + '">';
					DIV += '<div class="ellipsis text-left">';
						DIV += '<div class="mb-2">';
							DIV += '<div class="ellipsis font-6 text-bold">' + item.name + '</div>';
							if(name.exterior != null) if(name.exterior.trim()) DIV += '<div class="ellipsis font-5 text-gray">' + name.exterior + '</div>';
						DIV += '</div>';
						DIV += '<div class="font-7"><div class="coins mr-1"></div>' + getFormatAmountString(item.price) + '</div>';
					DIV += '</div>';
				DIV += '</div>';
				DIV += '<div class="pointer" id="remove_item" data-id="' + dataPos + '">';
					DIV += '<i class="fa fa-times" aria-hidden="true"></i>';
				DIV += '</div>';
			DIV += '</div>';
			
			$('#cart-items').append(DIV);
		});
		
		offers_refreshCartItems();
    });
	
	$(document).on('click', '#refresh_inventory', function() {
		if(PATHS[1] == 'p2p'){
			if(PATHS[0] == 'deposit') {
				send_request_socket({
					type: 'p2p',
					command: 'load_inventory',
					game: PATHS[2]
				});
			} else if(PATHS[0] == 'withdraw') {
				send_request_socket({
					type: 'p2p',
					command: 'load_shop',
					game: PATHS[2]
				});
			}
		} else if(PATHS[1] == 'steam'){
			if(PATHS[0] == 'deposit') {
				send_request_socket({
					type: 'steam',
					command: 'load_inventory',
					game: PATHS[2]
				});
			} else if(PATHS[0] == 'withdraw') {
				send_request_socket({
					type: 'steam',
					command: 'load_shop',
					game: PATHS[2]
				});
			}
		}
		
		$('#refresh_inventory').addClass('disabled').html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
		$('#list_items').html(createLoader());
		$('#cart-items').empty();
	});
	
	$(document).on("click", "#remove_item", function() {
		var id = $(this).data('id');
		
		$('#list_items .listing-item[data-id="' + id + '"]').removeClass('active').find('.item-selected').addClass('hidden');
		
		$('#cart-items .item-selected-content[data-id="' + id + '"]').remove();
		
		offers_refreshCartItems();
	});
	
	$(document).on('click', '.steam-bot', function(){
		var bot = $(this).data('bot');
		
		$('.steam-bot').removeClass('active');
		$('.steam-bot[data-bot="' + bot + '"]').removeClass('active');
		
		$('#list_items>.listing-item').addClass('hidden').filter(function(i, e) {
			if($(this).data('bot') == bot) return true;
		}).removeClass('hidden');
	});
		
	$(document).on('click', '#confirm_offer', function(){
		var items = [];
		$('#list_items .listing-item.active').each(function(i, e) {
			items.push({
				id: $(this).data('id').toString(),
				game: $(this).data('game').toString()
			});
		});
		
		requestRecaptcha(function(render){
			if(PATHS[1] == 'steam'){
				if(PATHS[0] == 'deposit') {
					send_request_socket({
						type: 'steam',
						command: PATHS[0],
						items: items,
						game: PATHS[2],
						recaptcha: render
					});
				} else if(PATHS[0] == 'withdraw') {
					var bot = $('.steam-bot.active').data('bot');
					
					send_request_socket({
						type: 'steam',
						command: PATHS[0],
						items: items,
						game: PATHS[2],
						bot: bot,
						recaptcha: render
					});
				}
			} else if(PATHS[1] == 'p2p'){
				if(PAGE == 'deposit'){
					var offset = $('#bundle_offset').val();
					
					send_request_socket({
						type: 'p2p',
						command: 'create_listing',
						items: items,
						game: PATHS[2],
						offset: offset,
						recaptcha: render
					});
				}else if(PAGE == 'withdraw'){
					send_request_socket({
						type: 'p2p',
						command: 'buy_listing',
						bundles: items,
						recaptcha: render
					});
				}
			}
		});
	});
	
	$(document).on('click', '.inspect_pending_offer', function(){
		var $placeholder = $('#pending-offers .bundle_offer[data-id="' + $(this).data('id') + '"][data-method="' + $(this).data('method') + '"]');
		
		var offer = JSON.parse($placeholder.attr('data-offer').toString());
		
		offers_addStatusPending({
			id: $(this).data('id'),
			type: offer.type,
			method: $(this).data('method'),
			status: offer.status,
			game: offer.game,
			items: $placeholder.data('items').items,
			data: offer.data
		});
	});
});

/* END OFFERS */

function getInfosByItemName(name){
	var infos = {
		brand: null,
		name: null,
		exterior: null
	}
	
	var stage1 = name.split(' | ');
	
	if(stage1.length > 0){
		infos.brand = stage1[0];
		
		if(stage1.length > 1){
			if(stage1[1].indexOf('(') >= 0 && stage1[1].indexOf(')') >= 0){
				var stage2 = stage1[1].split(' (');
				infos.name = stage2[0];
				
				var stage3 = stage2[1].split(')');
				infos.exterior = stage3[0];
			} else infos.name = stage1[1];
		}
	}
	
	return infos;
}

function createLoader(){
	var DIV = '<div class="flex in-grid justify-center items-center width-full height-full">';
		DIV += '<div class="loader">';
			DIV += '<div class="loader-part loader-part-1">';
				DIV += '<div class="loader-dot loader-dot-1"></div>';
				DIV += '<div class="loader-dot loader-dot-2"></div>';
			DIV += '</div>';
			
			DIV += '<div class="loader-part loader-part-2">';
				DIV += '<div class="loader-dot loader-dot-1"></div>';
				DIV += '<div class="loader-dot loader-dot-2"></div>';
			DIV += '</div>';
		DIV += '</div>';
	DIV += '</div>';
	
	return DIV;
}

function createAvatarField(user, type, more){
	if(user.level >= 100) var level_class = 'tier-diamond';
	else if(user.level >= 75) var level_class = 'tier-gold';
	else if(user.level >= 50) var level_class = 'tier-silver';
	else if(user.level >= 25) var level_class = 'tier-bronze';
	else if(user.level >= 0) var level_class = 'tier-steel';
	
	var DIV = '<div class="avatar-field ' + level_class + ' relative">';
		DIV += '<img class="avatar icon-' + type + ' rounded-full" src="' + user.avatar + '">';
		DIV += '<div class="level sup-' + type + '-left flex justify-center items-center b-d2 bg-dark rounded-full">' + user.level + '</div>';
		DIV += more;
	DIV += '</div>';
	
	return DIV;
}

function roundedToFixed(number, decimals){
	number = Number((parseFloat(number).toFixed(5)));
	
	var number_string = number.toString();
	var decimals_string = 0;
	
	if(number_string.split('.')[1] !== undefined) decimals_string = number_string.split('.')[1].length;
	
	while(decimals_string - decimals > 0) {
		number_string = number_string.slice(0, -1);
		
		decimals_string --;
	}
	
	return Number(number_string);
}

function getFormatAmount(amount){
	return roundedToFixed(Number(amount), 2);
}

function getFormatAmountString(amount){
	return getFormatAmount(amount).toFixed(2);
}

function getNumberFromString(amount){
	if(amount.toString().trim().length <= 0) return 0;
	if(isNaN(Number(amount.toString().trim()))) return 0;
	
	return amount;
}

function generate_code(field, length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for(var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

	$(field).val(text);
	changeInputFieldLabel($(field).parent().parent().parent());
}

function getFormatSeconds(time){
	var days = parseInt((time) / (24 * 60 * 60));
	var hours = parseInt((time - (days * 24 * 60 * 60)) / (60 * 60));
	var minutes = parseInt((time - (days * 24 * 60 * 60) - (hours * 60 * 60)) / (60));
	var seconds = parseInt((time - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)));
	
	if(days < 10) days = '0'.concat(days);
	if(hours < 10) hours = '0'.concat(hours);
	if(minutes < 10) minutes = '0'.concat(minutes);
	if(seconds < 10) seconds = '0'.concat(seconds);
	
	return {
		days,
		hours,
		minutes,
		seconds
	};
}

function hexToRgb(hex) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function time(){
	return parseInt(new Date().getTime()/1000);
}