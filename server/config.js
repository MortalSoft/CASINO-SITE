const config = {
	is_prod: true,
	
	config_site: {
		name: 'MortalSoft',
		
		url: 'https://demo.mortalsoft.online',
		root: '/',
		

		flood: {
			time: 1000,
			count: 10
		},
		
		mailer: {
			service: 'gmail',
			email: 'verify@demo.gg',
			password: '453543354-'
		},
		
		profile: {
			cooldown_verify: 2 * 60
		},
		
		recaptcha: {
			private_key: '6Lcewn8nAAAAAGlheLEcEnwH-EV5p5mLm_PD1i-x'
		},
		
		steam: {
			apikey: '',
		},
	
		server_port: 2053,
		
		database: {
			database : 'replace_db',
			host : '127.0.0.1',
			user : 'replace_user',
			password : 'replace_pass'
		},
		
		level: {
			start: 500,
			next: 0.235,
		},
		
		level_send_coins: 5,
		
		rain: {
			start: 0.10,
			cooldown_start: 1 * 120,
			timeout_interval: { min: 10 * 120, max: 30 * 120 }
		},
		
		multiplier_wager_withdraw: 3 / 4,
		
		interval_amount: {
			roulette: { min: 0.01, max: 100.00 },
			crash: { min: 0.01, max: 100.00 },
			jackpot: { min: 0.01, max: 100.00 },
			coinflip: { min: 0.01, max: 100.00 },
			dice: { min: 0.01, max: 100.00 },
			minesweeper: { min: 0.01, max: 100.00 },
			tower: { min: 0.01, max: 100.00 },
			plinko: { min: 0.01, max: 100.00 },
			send_coins: { min: 0.01, max: 100.00 },
			tip_rain: { min: 0.01, max: 100.00 },
			deposit_p2p: { min: 0.01, max: 5000.00 },
			deposit_skins: { min: 0.01, max: 5000.00 },
			withdraw_skins: { min: 0.01, max: 500.00 },
			withdraw_crypto: { min: 2.00, max: 500.00 }
		},
		
		interval_items: {
			deposit: { min: 1, max: 20 },
			withdraw: { min: 1, max: 20 },
			p2p: { min: 1, max: 20 }
		},
		
		rewards_amount: {
			google: 0.00,
			facebook: 0.50,
			steam: 0.00,
			
			refferal_code: 0.05,
			
			daily_start: 0.00,
			daily_step: 0.02
		},
		
		affiliates_requirement: [0.00, 200.00, 500.00, 750.00, 1000.00, 2000.00, 3500.00, 5000.00, 7500.00, 10000.00],
		affiliates_commission: {
			deposit: 1,
			bet: 2
		},
		
		daily_requirements: {
			amount: 5.00,
			time: 7 * 24 * 60 * 60
		}
	},
	
	config_offers: {
		steam: {
			time_cancel_trade: 5 * 60,
			time_remove_pending: 1 * 60,
		
			cooldown_inventory: 1 * 60,
			
			withdraw_offset: 10,
			deposit_offset: 0,
			
			bots: [{
				active: false,
				botname: 'demo.gg',
				steamid: '',
				username: '',
				password: '3th3rn3tR-',
				identity_secret: '',
				shared_secret: '',
				can_trade: true,
				can_info: true,
				can_apikey: true
			}
			],
			
			prices: {
				apikey: {
					key: '',
					secret: ''
				},
				
				cooldown_load: 1 * 60 * 60
			},
			
			games: {
				csgo: { game: { appid: 730, contextid: 2 } },
				dota2: { game: { appid: 570, contextid: 2 } },
				h1z1: { game: { appid: 433850, contextid: 1 } },
				rust: { game: { appid: 252490, contextid: 2 } },
				tf2: { game: { appid: 440, contextid: 2 } }
			},
			
			blacklist_items: {
				csgo: [],
				dota2: [],
				h1z1: [],
				rust: [],
				tf2: []
			}
		},
	
		coinpayments: {
			apikey: {
				public_key: '131213121312',
				private_key: '131213121312'
			},
			
			prices: {
				cooldown_load: 1 * 60 * 60
			},
			
			cooldown_check: 1 * 60,
			
			games: ['BTC', 'ETH', 'LTC', 'BCH', 'SOL']
		},
		
		p2p: {
			timer_confirm: 1 * 60,
			timer_send: 10 * 60
		}
	},
	
	config_games: {
		winning_to_chat: 100.00,
		
		games: {
			roulette: {
				active: true,
				timer: 20,
				cooldown_rolling: 10,
				total_bets: 3,
				normal_multiplier: 2,
				color_multiplier: 14,
			},
			
			crash: {
				active: true,
				timer: 5,
				max_profit: 5000.00,
				instant_chance: 5
			},
			
			coinflip: {
				active: true,
				commission: 2,
				cancel: false,
				timer_cancel: 1 * 60 * 60,
				timer_wait_start: 10,
				timer_delete: 1 * 60
			},
			
			jackpot: {
				active: true,
				commission: 2,
				timer: 30,
				total_bets: 5,
			},
			
			dice: { active: true},
			plinko: { active: true },
			
			unbox: {
				active: true,
				cases: require('./cases.js'),
			},
			
			minesweeper: { active: true },
			tower: { active: true },
			betMatches: { active: true },
			slots: { active: true }
		}
	},
	
	config_chat: {
		max_messages: 40,
		
		cooldown_massage: 1,
		
		channels: ['en', 'ro', 'fr', 'ru', 'de'],
	
		support: {
			message: 'If you find bugs contact us as soon as possible to solve them! With all due respect, the MortalSoft team.',
			cooldown: 24 * 60 * 60,
		},
		
		greeting: 'Please contact us if you need help. We don\'t resolve issues in the chat. Type /help for chat commands. With all due respect, the MortalSoft team.',
		
		message_double_xp: 'Weekly Double XP! Get double XP betting on our games until Sunday at 23:59PM GTM.',
		
		alerts: [
			 'This site is currently in BETA mode.'
			// 'We added P2P trading system and loading the CSGO items wear. Check it out.'
		],
		
		notifies: [
			// 'This site is for selling.',
			// 'We added P2P trading system and loading the CSGO items wear. Check it out.'
		]
	}
}

module.exports = config;
