var mysql = require('mysql');
var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var log4js = require('log4js');
var sha256 = require('sha256');
var math = require('mathjs');
var crypto = require('crypto');
var dateFormat = require('dateformat');
var twoFactor = require('node-2fa');
var cors = require('cors');
const axios = require('axios');

var express = require('express');
var app = express(); // slots server

app.use(express.json());
app.use(cors());

if(config.is_prod) {
	var options_ssl = {
	    key: fs.readFileSync('/etc/letsencrypt/live/demo.mortalsoft.online/privkey.pem', 'utf8').toString(),
	    cert: fs.readFileSync('/etc/letsencrypt/live/demo.mortalsoft.online/fullchain.pem', 'utf8').toString()
	};

	var server = require('https').createServer(options_ssl, app);
	var io = require('socket.io')(server, { cors: { origin: '*' } });
} else {
	var server = require('http').createServer(app);
	var io = require('socket.io')(server, { cors: { origin: '*' } });
}


server.listen(config.config_site.server_port, '0.0.0.0');




let live_results_homepage = [];
const should_refferals_count_wager = false;

updateLogs();

function updateLogs() {
	var date = dateFormat(new Date(), "dd.mm.yyyy");
	
	log4js.configure({
		appenders: {
			out:{ type: 'console' },
			app:{ type: 'file', filename: 'logs/'+date+'.log' }
		},
		categories: {
			default: { appenders: [ 'out', 'app' ], level: 'all' }
		}
	});
	
	setTimeout(function(){
		updateLogs();
	}, 24 * 3600 * 1000);
}

var logger = log4js.getLogger();

var pool = mysql.createPool({
	database: config.config_site.database.database,
	host: config.config_site.database.host,
	user: config.config_site.database.user,
	password: config.config_site.database.password
});

loadBetsToHomepage()

function dBetting(socket){
/*	Object.keys(metches_betting).forEach(function(matchid){
		io.sockets.emit('message', {
			type: 'betting',
			command: 'add_match',
			match: metches_betting[matchid]
		});
	});*/
}

function writeError(error){
	var date = dateFormat(new Date(), "dd.mm.yyyy");
	
	try{
		error = error.stack.toString();
	} catch(e) {
		error = error.toString();
	}
	
	if(!fs.existsSync('errors/' + date + '.error')){
		fs.writeFileSync('errors/' + date + '.error', '\t' + dateFormat(new Date(), "hh:MM:ss.sss") + ' \n ' + error + '\n\n', function(err1){
			if(err1) {
				logger.error(err1);
				return;
			}
			
			logger.debug('Whriting error completed!');
		});
    } else {
		fs.appendFile('errors/' + date + '.error', '\t' + dateFormat(new Date(), "hh:MM:ss.sss") + ' \n ' + error + '\n\n', function(err1){
			if(err1) {
				logger.error(err1);
				return;
			}
			
			logger.debug('Whriting error completed!');
		});
	}
}

process.on('uncaughtException', function (error) {
	logger.error('Strange error');
	logger.error(error);
	writeError(error);
});

// update leaderboard
var lb = JSON.parse(fs.readFileSync('./lb.json'));
function updateLeaderboard() {
	logger.info('updating leaderboard');

	pool.query('SELECT users.userid, users.name, users.avatar, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` > 0 GROUP BY users_transactions.userid) AS `winnings`, (SELECT SUM(amount) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `bets`, (SELECT COUNT(users_transactions.userid) FROM `users_transactions` WHERE users_transactions.userid = users.userid AND `amount` < 0 GROUP BY users_transactions.userid) AS `games` FROM `users` INNER JOIN `users_transactions` ON users.userid = users_transactions.userid WHERE users.userid IN (SELECT users_transactions.userid FROM (SELECT users_transactions.userid, SUM(amount) AS `profit` FROM `users_transactions` WHERE `amount` < 0 GROUP BY users_transactions.userid ORDER BY `profit` ASC LIMIT 10) AS `profit_tabel`) AND users_transactions.amount < 0 GROUP BY users.userid ORDER BY `bets` ASC', function(err, rows, fields) {
		if(!err) {
			// console.log(Object.values(rows));
			if(rows.length >= 10) {
				rows.length = 10;
			}

			lb = rows;

			fs.writeFileSync(`./lb.json`, JSON.stringify(rows));
		}
	});
}

updateLeaderboard();
setInterval(() => {
	updateLeaderboard();
}, 1800 * (1 * 1000))


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var item_exteriors = ['Battle-Scarred', 'Well-Worn', 'Field-Tested', 'Minimal Wear', 'Factory New'];

//SITE
var users_requests = {};
var users_online = {};
var users_flood = {};
var total_stats = {
	bets: 0,
	users: 0
};

setTimeout(() => {
	pool.query(`SELECT 'coinflip_bets' AS table_name, COUNT(*) FROM coinflip_bets UNION SELECT 'crash_bets' AS table_name, COUNT(*) FROM crash_bets UNION SELECT 'dice_bets' AS table_name, COUNT(*) FROM dice_bets UNION SELECT 'coinflip_bets' AS table_name, COUNT(*) FROM coinflip_bets UNION SELECT 'jackpot_bets' AS table_name, COUNT(*) FROM jackpot_bets UNION SELECT 'matches_bets' AS table_name, COUNT(*) FROM matches_bets UNION SELECT 'minesweeper_bets' AS table_name, COUNT(*) FROM minesweeper_bets UNION SELECT 'plinko_bets' AS table_name, COUNT(*) FROM plinko_bets UNION SELECT 'roulette_bets' AS table_name, COUNT(*) FROM roulette_bets UNION SELECT 'tower_bets' AS table_name, COUNT(*) FROM tower_bets UNION SELECT 'unbox_opens' AS table_name, COUNT(*) FROM unbox_opens`, function(err, rows, fields) {
	if(!err) {
		// console.log(Object.values(rows));
		for(let i in rows) {
			total_stats.bets += rows[i]['COUNT(*)']
		}
	}
});
}, 5 * 1000);

// get stats
function emitFooterStats() {
	pool.query(`SELECT COUNT(*) AS totalUsers FROM users`, function(err, rows, fields) {
	  if(!err) total_stats.users = parseInt(rows[0].totalUsers);

	  io.sockets.emit('footer stats', total_stats);
	});
}

function addToFooterStats(howMany = 1) {
	total_stats.bets += howMany;

	emitFooterStats();
}

/* -------------- CONNECT TO SOCKET -------------- */
io.on('connection', function(socket) {
	var user = {};
	var session = null;

	socket.on('rb_collect', (uuid) => {
		collectRakeback(uuid);
	})

	socket.on('request_leaderboard', () => {
		socket.emit('lb', lb);
	})
	
	socket.on('join', function(join_data) {
		session = join_data.session;

		emitFooterStats();

		for(let i in live_results_homepage) {
			socket.emit('live bet', live_results_homepage[i]);
		}
		
		pool.query('SELECT users.* FROM `users` INNER JOIN `users_sessions` ON users.userid = users_sessions.userid WHERE users_sessions.session = ' + pool.escape(session) + ' AND users_sessions.removed = 0 AND users_sessions.expire > ' + time(), function(err, row) {
			if(err) {
				logger.error(err);
				writeError(err);
			}
			
			if(row.length == 0){
				user = {
					userid: socket.client.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress,
					name: 'Guest',
					avatar: 'http://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
					balance: 0,
					rank: 0,
					xp: 0,
					tradelink: null,
					apikey: null,
					initialized: 0,
					verified: 0,
					email: null,
					binds: {},
					settings: {
						'anonymous': 0,
						'private': 0
					},
					restrictions: {},
					exclusion: 0,
					deposit: {
						count: 0,
						total: 0
					},
					withdraw: {
						count: 0,
						total: 0
					},
				};
			} else {
				user = {
					userid: row[0].userid,
					name: (row[0]['anonymous'] == 1) ? '[anonymous]' : row[0].name,
					avatar: (row[0]['anonymous'] == 1) ? 'http://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' : row[0].avatar,
					balance: roundedToFixed(row[0].balance, 2),
					rank: row[0].rank,
					xp: row[0].xp,
					tradelink: row[0].tradelink,
					apikey: row[0].apikey,
					initialized: row[0].initialized,
					verified: row[0].verified,
					email: row[0].email,
					binds: {},
					settings: {
						'anonymous': row[0]['anonymous'],
						'private': row[0]['private']
					},
					restrictions: {
						play: 0,
						trade: 0,
						site: 0,
						mute: 0
					},
					exclusion: row[0]['exclusion'],
					deposit: {
						count: row[0]['deposit_count'],
						total: row[0]['deposit_total']
					},
					withdraw: {
						count: row[0]['withdraw_count'],
						total: row[0]['withdraw_total']
					}
				};


				resendVerifyProfile(user, socket, '', true);
			}

			/*if(cooldownGames[user.steamid] === undefined) {
				cooldownGames[user.steamid] = {
					'roulette': false,
					'crash': false,
					'jackpot': false,
					'coinflip': false,
					'dice': false,
					'betting': false
				};
			}*/

			//getUserTickets(user, socket);
        	//getUserHistoryTickets(user, socket);
			
			if(users_requests[user.userid] === undefined) users_requests[user.userid] = false;
			if(users_online[user.userid] === undefined) users_online[user.userid] = 0;
			if(users_flood[user.userid] === undefined) users_flood[user.userid] = { time: new Date().getTime(), count: 0};
			
			socket.join(user.userid);
			users_online[user.userid]++;
			
			logger.debug('[SERVER] User with userid ' + user.userid + ' is connected');
			
			//CHAT
			var user_chatMessages = [];
			chat_massages.forEach(function(message){
				if(message.channel == join_data.channel || message.type == 'system') user_chatMessages.push(message);
			});
			
			if(chat_userLastMessage[user.userid] === undefined) chat_userLastMessage[user.userid] = time();
			
			var user_commands = []
			chat_commandsRank[user.rank].forEach(function(item){
				if(chat_commandsList[item] == 'userid' || chat_commandsList[item] == 'id'){
					user_commands.push({
						name: item,
						type: chat_commandsList[item]
					});
				}
			});
			
			var user_ignorelist = {};
			if(chat_ignoreList[user.userid] !== undefined){
				user_ignorelist = chat_ignoreList[user.userid];
			}
			
			//JACKPOT
			var user_jackpotChance = 0;
			
			if(jackpotGame_countBets[user.userid] !== undefined && jackpotGame_countBets[user.userid] >= 1) {
				user_jackpotChance = roundedToFixed(parseFloat(jackpotGame_amountBets[user.userid] / jackpotGame_totalAmounts * 100), 2);
			}
			
			//CRASH
			var user_chashBetsWin = [];
			var user_chashBetsLose = [];
			
			if(crashGame_totalBets.length > 0){
				crashGame_totalBets.forEach(function(bet){
					if(crashGame_userBets[bet.user.userid] !== undefined){
						if(crashGame_userBets[bet.user.userid]['cashedout'] == true) {
							user_chashBetsWin.push({
								id: bet.id,
								cashout: roundedToFixed(parseFloat(crashGame_userBets[bet.user.userid]['point_cashedout'] / 100), 2),
								profit: getFormatAmount(crashGame_userBets[bet.user.userid]['amount'] * crashGame_userBets[bet.user.userid]['point_cashedout'] / 100 - crashGame_userBets[bet.user.userid]['amount'])
							});
						} else if((!crashGame_userBets[bet.user.userid]['infinity_cashout'] && crashGame_userBets[bet.user.userid]['auto_cashout'] < crashGame_settings.point) || crashGame.status == 'ended'){
							user_chashBetsLose.push({
								id: bet.id
							});
						}
					}
				});
			}
			
			//COINFLIP
			var user_coinflipBets = [];
			
			for(var bet in coinflipGame_games){
				var coinflip_data = {};
				
				if(coinflipGame_games[bet].status == 1) {
					coinflip_data.time = config.config_games.games.coinflip.timer_wait_start - time() + coinflipGame_games[bet].time
				} else if(coinflipGame_games[bet].status == 2) {
					coinflip_data.winner = coinflipGame_getWinner(bet);
				} else if(coinflipGame_games[bet].status == 3) {
					coinflip_data.winner = coinflipGame_getWinner(bet);
				}
				
				user_coinflipBets.push({
					status: coinflipGame_games[bet].status,
					coinflip: {
						id: bet,
						player1: coinflipGame_games[bet].player1,
						player2: coinflipGame_games[bet].player2,
						creator: coinflipGame_games[bet].creator,
						amount: coinflipGame_games[bet].amount,
						data: coinflip_data,
						hash: coinflipGame_games[bet].hash
					}
				});
			}
			
			//MINESWEEPER
			var user_minesweeperAmounts = [];
			
			if(minesweeperGame_countBets[user.userid]){
				if(minesweeperGame_userBets[user.userid]['route'].length > 0){
					for(var i = 0; i < minesweeperGame_userBets[user.userid]['route'].length; i++){
						user_minesweeperAmounts.push(minesweeperGame_generateAmount(roundedToFixed(parseFloat(minesweeperGame_userBets[user.userid]['amount'] * minesweeperGame_userBets[user.userid]['amount_bombs'] / (25 - minesweeperGame_userBets[user.userid]['amount_bombs'])), 5), (25 - minesweeperGame_userBets[user.userid]['amount_bombs']))[i]);
					}
				}
			}
			
			//FIRST DATES
			socket.emit('message', {
				type: 'first',
				//maxbet: maxbet,
				//minbet: minbet,
				user: {
					userid: user.userid,
					name: user.name,
					balance: user.balance,
					rank: user.rank,
					initialized: (user.initialized || (row.length <= 0)),
					settings: user.settings,
					level: calculateLevel(user.xp)
				},
				jackpot: {
					hash: jackpotGame.hash,
					bets: jackpotGame_totalBets,
					total: jackpotGame_totalAmounts,
					chance: user_jackpotChance,
					history: jackpotGame_lastGames
				},
				crash: {
					hash: crashGame.hash,
					history: crashGame_lastGames,
					bets_all: crashGame_totalBets,
					bets_win: user_chashBetsWin,
					bets_lose: user_chashBetsLose,
				},
				roulette: {
					bets: rouletteGame_totalBets,
					last: rouletteGame_lastRoll,
					history: rouletteGame_lastGames,
					history100: rouletteGame_last100Games,
					hash: rouletteGame.hash
				},
				coinflip: {
					bets: user_coinflipBets
				},
				dice: {
					history: diceGame_lastGames
				},
				chat: {
					messages: user_chatMessages,
					first: {
						message: config.config_chat.greeting,
						time: new Date().getTime()
					},
					commands: user_commands,
					listignore: user_ignorelist,
					alerts: (new Date().getDay() == 0 || new Date().getDay() == 6) ? config.config_chat.alerts.concat(config.config_chat.message_double_xp) : config.config_chat.alerts,
					notifies: (new Date().getDay() == 0 || new Date().getDay() == 6) ? config.config_chat.notifies.concat(config.config_chat.message_double_xp) : config.config_chat.notifies
				}, offers: {
					history: [],
					amounts: [],
					p2p_pendings: [],
					steam_pendings: [],
					steam_bots: []
				}, cases: {
					cases: [],
					history: []
				}, plinko: {
					history: plinkoGame_lastGames
				}, minesweeper: {
					history: minesweeperGame_lastGames,
					game: {
						active: (minesweeperGame_countBets[user.userid]) ? true : false,
						total: (minesweeperGame_countBets[user.userid]) ? minesweeperGame_userBets[user.userid]['total'] : 0,
						route: (minesweeperGame_countBets[user.userid]) ? minesweeperGame_userBets[user.userid]['route'] : [],
						hash: (minesweeperGame_countBets[user.userid]) ? minesweeperGame_userBets[user.userid]['hash'] : '',
						amount: (minesweeperGame_countBets[user.userid]) ? minesweeperGame_userBets[user.userid]['amount'] : 0,
						amounts: user_minesweeperAmounts,
						next: (minesweeperGame_countBets[user.userid]) ? minesweeperGame_generateAmount(roundedToFixed(parseFloat(minesweeperGame_userBets[user.userid]['amount'] * minesweeperGame_userBets[user.userid]['amount_bombs'] / (25 - minesweeperGame_userBets[user.userid]['amount_bombs'])), 5), (25 - minesweeperGame_userBets[user.userid]['amount_bombs']))[minesweeperGame_userBets[user.userid]['route'].length] : 0
					}
				}, tower: {
					history: towerGame_lastGames,
					game: {
						active: (towerGame_countBets[user.userid]) ? true : false,
						total: (towerGame_countBets[user.userid]) ? ((towerGame_userBets[user.userid]['route'].length == 0) ? towerGame_userBets[user.userid]['amount'] : roundedToFixed(towerGame_generateAmounts(towerGame_userBets[user.userid]['amount'])[towerGame_userBets[user.userid]['route'].length - 1], 5)) : 0,
						route: (towerGame_countBets[user.userid]) ? towerGame_userBets[user.userid]['route'] : [],
						hash: (towerGame_countBets[user.userid]) ? towerGame_userBets[user.userid]['hash'] : '',
						amount: (towerGame_countBets[user.userid]) ? towerGame_userBets[user.userid]['amount'] : 0
					}
				}
			});
			
			dRoulette(user, socket);
			dCrash(user, socket);
			dJackpot(user, socket);
			dBetting(socket);
			bonusBattlesFirstJoin(socket, join_data.BONUS_GAME_ID);

			dRain(user, socket);
			
			rewards_dailyTime(user, socket);

			// dCrypto(user, socket);
			
			//USERS ONLINE
			io.sockets.emit('message', {
				type: 'online',
				online: Object.keys(users_online).length
			});
			
		});
	});
	
	socket.on('request', function(request) {
		if(!user || Object.keys(user).length == 0) {
			if(request.bypass) return;
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your page is now inactive! Prease refresh the page.'
			});
			return;
		}
		
		if(new Date().getTime() - users_flood[user.userid].time > config.config_site.flood.time) users_flood[user.userid] = { time: new Date().getTime(), count: 0};
		else users_flood[user.userid].count++;
		if(users_flood[user.userid].count >= config.config_site.flood.count) {
			logger.debug('[SERVER] User with userid ' + user.userid + ' is disconnected for flooding');
			
			return socket_disconnect(user, socket);
		}
		
		if(users_requests[user.userid] == true){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Wait for ending last action!'
			});
			return;
		}
		
		pool.query('SELECT * FROM `info`', function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			var site = {
				play: false,
				trade: false,
				maintenance: false
			}
			if(row1.length > 0) {
				var props = Object.keys(row1[0]);
				
				props.forEach(function(item){
					if(site[item] !== undefined) site[item] = (parseInt(row1[0][item]) == 1);
				});
			}
			
			pool.query('SELECT users.* FROM `users` INNER JOIN `users_sessions` ON users.userid = users_sessions.userid WHERE users_sessions.session = ' + pool.escape(session) + ' AND users_sessions.removed = 0 AND users_sessions.expire > ' + time(), function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length <= 0) return userRequest_request(user, socket, request, site, false);
				
				pool.query('SELECT `restriction`, `expire` FROM `users_restrictions` WHERE `removed` = 0 AND (`expire` = -1 OR `expire` > ' + pool.escape(time()) + ') AND `userid` = '+ pool.escape(user.userid), function(err3, row3){
					if(err3){
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					user = {
						userid: row2[0].userid,
						username: row2[0].username,
						name: (row2[0]['anonymous'] == 1) ? '[anonymous]' : row2[0].name,
						avatar: (row2[0]['anonymous'] == 1) ? 'http://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' : row2[0].avatar,
						balance: roundedToFixed(row2[0].balance, 2),
						rank: row2[0].rank,
						xp: row2[0].xp,
						tradelink: row2[0].tradelink,
						apikey: row2[0].apikey,
						initialized: row2[0].initialized,
						verified: row2[0].verified,
						email: row2[0].email,
						binds: {},
						settings: {
							'anonymous': row2[0]['anonymous'],
							'private': row2[0]['private']
						},
						restrictions: {
							play: 0,
							trade: 0,
							site: 0,
							mute: 0
						},
						exclusion: row2[0]['exclusion'],
						deposit: {
							count: row2[0]['deposit_count'],
							total: row2[0]['deposit_total']
						},
						withdraw: {
							count: row2[0]['withdraw_count'],
							total: row2[0]['withdraw_total']
						}
					};
					
					row3.forEach(function(item){
						if(user.restrictions[item.restriction] !== undefined) user.restrictions[item.restriction] = item.expire;
					});
					
					if(user.restrictions.site >= time() || user.restrictions.site == -1){
						socket.emit('message', {
							type: 'error',
							error: 'Error: You are restricted to use our site. The restriction expires ' + ((user.restrictions.site == -1) ? 'never' : makeDate(new Date(user.restrictions.site * 1000))) + '.'
						});
						return;
					}
					
					pool.query('SELECT `bind`, `bindid` FROM `users_binds` WHERE `removed` = 0 AND `userid` = ' + pool.escape(user.userid), function(err4, row4) {
						if(err4) {
							logger.error(err4);
							writeError(err4);
							return;
						}
						
						row4.forEach(function(bind){
							user.binds[bind.bind] = bind.bindid;
						});
						
						return userRequest_request(user, socket, request, site, true);
					});
				});
			});
		});
	});
	
	socket.on('disconnect', function() {
		socket_disconnect(user, socket);
	});
});

function socket_disconnect(user, socket){
	socket.disconnect();
	socket.leave(user.userid);
	
	if(users_online[user.userid] != undefined) {
		users_online[user.userid]--;
		if(users_online[user.userid] <= 0) delete users_online[user.userid];
	}
	
	//USERS ONLINE
	io.sockets.emit('message', {
		type: 'online',
		online: Object.keys(users_online).length
	});
}

function userRequest_request(user, socket, request, site, logged){
	if(request) logger.debug(user.name + '(' + user.userid + ') - New Request: ' + JSON.stringify(request));
	
	if(site.maintenance && user.rank != 100){
		socket.emit('message', {
			type: 'error',
			error: 'Error: The server is now in maintenance. Please try again later!'
		});
		return;
	}

	if(!logged) {
	
		if(request.type == 'chat') if(request.command == 'get_channel') return chat_loadChannel(user, socket, request.channel);
		
		
		if(request.type == 'account') if(request.command == 'recover') return recoverAccount(socket, request.data, request.recaptcha);
		
		socket.emit('message', {
			type: 'error',
			error: 'Error: Session expired or you are not logged in. Please refresh the page and try again.'
		});
		
		return;
	}
	
	if(!user.initialized) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your account is not initialized. Please initialize your account and try again.'
		});
		
		return;
	}

	if(request.type == 'bonus') return bonusBattlesHandler(user, socket, request);
	if(request.type == 'rb_collect') return collectRakeback(user.userid);
	
	//ACCOUNT
	if(request.type == 'account') {
		if(request.command == 'resend_verify') return resendVerifyProfile(user, socket, request.recaptcha, request.bypass ? true : false);
		if(request.command == 'profile_settings') return profileSettings(user, socket, request.data);
		if(request.command == 'exclusion') return accountExclusion(user, socket, request.exclusion, request.recaptcha);
		if(request.command == 'account_settings') return accountSettings(user, socket, request.data);
		if(request.command == 'recover'){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You are logged in. You can\'t recover your password!'
			});
			return;
		}
	}
	
	//REWARDS
	if(request.type == 'rewards'){
		if(user.exclusion > time()) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'
			});
			return;
		}
		
		if(!user.verified) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your account is not verified. Please verify your account and try again.'
			});
			return;
		}
		
		if(request.command == 'bind') return rewards_bindRedeem(user, socket, request.data, request.recaptcha);
		if(request.command == 'referral_redeem') return rewards_referralRedeem(user, socket, request.data, request.recaptcha);
		if(request.command == 'referral_create') return rewards_referralCreate(user, socket, request.data, request.recaptcha);
		if(request.command == 'bonus_redeem') return rewards_bonusRedeem(user, socket, request.data, request.recaptcha);
		if(request.command == 'bonus_create') return rewards_bonusCreate(user, socket, request.data, request.recaptcha);
		if(request.command == 'daily_redeem') return rewards_dailyRedeem(user, socket, request.recaptcha);
	}
	
	//AFFILIATES
	if(request.type == 'affiliates') {
		if(request.command == 'collect') return affiliates_collectAvailable(user, socket, request.recaptcha);
	}
	
	//CHAT
	if(request.type == 'chat') {
		if(request.command == 'get_channel') return chat_loadChannel(user, socket, request.channel);
		if(request.command == 'message') return chat_checkMessage(user, socket, request.message, request.channel, request.hide);
		if(request.command == 'send_coins') return sendCoins(user, socket, request.to, request.amount, request.recaptcha);
	}
	
	//RAIN
	if(request.type == 'rain') {
		if(request.command == 'join') return rain_joinGame(user, socket, request.recaptcha);
	}
	
	//GAMES
	if(request.type == 'roulette' || request.type == 'crash' || request.type == 'jackpot' || request.type == 'coinflip' || request.type == 'dice' || request.type == 'unbox' || request.type == 'minesweeper' || request.type == 'tower' || request.type == 'plinko' || request.type == 'betMatches' || request.type == 'slots'){
		if(!site.play && user.rank != 100){
			socket.emit('message', {
				type: 'error',
				error: 'Error: The server bets is now offline. Please try again later!'
			});
			return;
		}
		
		if(user.restrictions.play >= time() || user.restrictions.play == -1){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You are restricted to use our games. The restriction expires ' + ((user.restrictions.play == -1) ? 'never' : makeDate(new Date(user.restrictions.play * 1000))) + '.'
			});
			return;
		}
		
		if(user.exclusion > time() && !(request.type == 'unbox' && (request.command == 'show' || request.command == 'test'))) {
			socket.emit('message', {
				type: 'error',
				error: 'Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'
			});
			return;
		}
		
		if(config.config_games.games[request.type] === undefined || !config.config_games.games[request.type].active){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Sorry this game are temporary unavailable!'
			});
			return;
		}
		
		if(request.type == 'unbox') {
			if(request.command == 'show') return casesGame_show(user, socket, request.id);
			if(request.command == 'test') return casesGame_test(user, socket, request.id);
			if(request.command == 'open') return casesGame_open(user, socket, request.id);
		}
		
		if(request.type == 'plinko') {
			if(request.command == 'bet') return plinkoGame_bet(user, socket, request.amount, request.color);
		}
		
		if(request.type == 'jackpot') {
			if(request.command == 'bet') return jackpotGame_bet(user, socket, request.amount);
		}
		
		if(request.type == 'crash') {
			if(request.command == 'bet') return crashGame_bet(user, socket, request.amount, request.auto);
			if(request.command == 'cashout') return crashGame_cashout(user, socket);
			if(request.command == 'prebet') return crashGame_prebet(user, socket, request.amount, request.auto);
		}
		
		if(request.type == 'roulette') {
			if(request.command == 'bet') return rouletteGame_bet(user, socket, request.amount, request.color);	
		}

		if(request.type == 'dice') {
			if(request.command == 'bet') return diceGame_bet(user, socket, request.amount, request.chance, request.mode, request.slow);
		}
		
		if(request.type == 'coinflip') {
			if(request.command == 'create') return coinflipGame_create(user, socket, request.amount, request.coin);
			if(request.command == 'join') return coinflipGame_join(user, socket, request.id);
			if(request.command == 'watch') return coinflipGame_watch(user, socket, request.id);
		}
		
		if(request.type == 'tower') {
			if(request.command == 'bet') return towerGame_bet(user, socket, request.amount);
			if(request.command == 'cashout') return towerGame_cashout(user, socket);
			if(request.command == 'stage') return towerGame_stage(user, socket, request.stage, request.button);
		}
		
		if(request.type == 'minesweeper') {
			if(request.command == 'bet') return minesweeperGame_bet(user, socket, request.amount, request.bombs);
			if(request.command == 'cashout') return minesweeperGame_cashout(user, socket);
			if(request.command == 'bomb') return minesweeperGame_bomb(user, socket, request.bomb);
		}

		if(request.type == 'betMatches') return betMatches(request, user, socket);
		if(request.type == 'slots') return slotsHandler(request, user, socket);
	}
	
	
	socket.emit('message', {
		type: 'error',
		error: 'Error: This is a null request! Please refresh the page.'
		// error: JSON.stringify(request)
	});
}

function dRain(user, socket){
	socket.emit('message', {
		type: 'rain',
		command: 'ended'
	});
	
	if(rain_game.status != 'wait'){
		if(rain_userBets[user.userid] === undefined){
			if(rain_game.status == 'started'){
				socket.emit('message', {
					type: 'rain',
					command: 'started'
				});
			} else {
				socket.emit('message', {
					type: 'rain',
					command: 'waiting'
				});
			}
		} else {
			socket.emit('message', {
				type: 'rain',
				command: 'joined'
			});
		}
	}
}

function dJackpot(user, socket){
	if(jackpotGame.status == 'rolling'){
		socket.emit('message', {
			type: 'jackpot',
			command: 'roll',
			avatars: jackpotGame_settings.avatars_rolling,
			cooldown: new Date().getTime() - jackpotGame_settings.start_time
		});
		
		if(new Date().getTime() - jackpotGame_settings.start_time > 7000){
			socket.emit('message', {
				type: 'jackpot',
				command: 'winner',
				winner: jackpotGame_lastWinner
			});
			
			socket.emit('message', {
				type: 'jackpot',
				command: 'percentage',
				percentage: jackpotGame.percentage
			});
			
			socket.emit('message', {
				type: 'jackpot',
				command: 'secret',
				secret: jackpotGame.secret
			});
		}
	} else if(jackpotGame.status == 'picking'){
		socket.emit('message', {
			type: 'jackpot',
			command: 'picking'
		});
	}
}

function dRoulette(user, socket){
	if(rouletteGame.status == 'rolling' || rouletteGame.status == 'rolled'){
		socket.emit('message', {
			type: 'roulette',
			command: 'timer',
			time: 0
		});
		
		if(rouletteGame.status == 'rolled'){
			socket.emit('message', {
				type: 'roulette',
				command: 'roll',
				roll: {
					roll: rouletteGame.roll,
					progress: rouletteGame.progress,
					color: rouletteGame.color,
					id: rouletteGame.id,
				},
				cooldown: config.config_games.games.roulette.cooldown_rolling - rouletteGame_settings.timer - 3
			});
		}
	} else {
		if(rouletteGame_settings.timer - config.config_games.games.roulette.cooldown_rolling >= 0){
			socket.emit('message', {
				type: 'roulette',
				command: 'timer',
				time: rouletteGame_settings.timer - config.config_games.games.roulette.cooldown_rolling
			});
		}
	}
}

function dCrash(user, socket){
	if(crashGame.status == 'started'){
		socket.emit('message', {
			type: 'crash',
			command: 'reset'
		});
		
		socket.emit('message', {
			type: 'crash',
			command: 'starting',
			time: (crashGame_settings.start_time > 0) ? parseInt(config.config_games.games.crash.timer * 1000 - new Date().getTime() + crashGame_settings.start_time) : parseInt(config.config_games.games.crash.timer * 1000)
		});
		
	} else if(crashGame.status == 'counting'){
		socket.emit('message', {
			type: 'crash',
			command: 'started',
			difference: new Date().getTime() - crashGame_settings.progress_time
		});
		
		if(crashGame_userBets[user.userid] !== undefined){
			if(crashGame_userBets[user.userid]['cashedOut'] == true){
				var win = parseInt(crashGame_userBets[user.userid]['amount'] + crashGame_userBets[user.userid]['profit']);
				
				socket.emit('message', {
					type: 'crash',
					command: 'cashed_out',
					amount: win
				});
			}
		}
	} else if(crashGame.status == 'ended'){
		socket.emit('message', {
			type: 'crash',
			command: 'crashed',
			number: crashGame.roll,
			time: crashGame_settings.end_time,
			history: false
		});
		
		io.sockets.emit('message', {
			type: 'crash',
			command: 'secret',
			secret: crashGame.secret
		});
		
		if(crashGame_userBets[user.userid] !== undefined){
			var win = crashGame_userBets[user.userid]['amount'] + crashGame_userBets[user.userid]['profit'];
			socket.emit('message', {
				type: 'crash',
				command: 'cashed_out',
				amount: win
			});
		}
	}
}
/* -------------- END CONNECT TO SOCKET -------------- */

eval(fs.readFileSync('./scripts/games/roulette.js')+''); //LOAD ROULETTE SCRIPT
eval(fs.readFileSync('./scripts/games/crash.js')+''); //LOAD CRASH SCRIPT
eval(fs.readFileSync('./scripts/games/jackpot.js')+''); //LOAD JACKPOT SCRIPT
eval(fs.readFileSync('./scripts/games/coinflip.js')+''); //LOAD COINFLIP SCRIPT
eval(fs.readFileSync('./scripts/games/dice.js')+''); //LOAD DICE SCRIPT
//eval(fs.readFileSync('./scripts/games/unbox.js')+''); //LOAD UNBOX SCRIPT
eval(fs.readFileSync('./scripts/games/minesweeper.js')+''); //LOAD MINESWEEPER SCRIPT
eval(fs.readFileSync('./scripts/games/tower.js')+''); //LOAD TOWER SCRIPT
eval(fs.readFileSync('./scripts/games/plinko.js')+''); //LOAD PLINKO SCRIPT
//eval(fs.readFileSync('./scripts/games/esports.js')+''); //LOAD ESPORTS SCRIPT
// eval(fs.readFileSync('./scripts/games/bonus_battles.js')+'');
eval(fs.readFileSync('./scripts/games/slots.js')+''); //LOAD SLOTS SCRIPT VERY IMPORTANT

eval(fs.readFileSync('./scripts/rewards.js')+''); //LOAD REWARDS SCRIPT
eval(fs.readFileSync('./scripts/affiliates.js')+''); //LOAD AFFILIATES SCRIPT

eval(fs.readFileSync('./scripts/other.js')+''); //LOAD OTHER SCRIPT

eval(fs.readFileSync('./scripts/rain.js')+''); //LOAD RAIN SCRIPT

eval(fs.readFileSync('./scripts/chat.js')+''); //LOAD CHAT SCRIPT

//eval(fs.readFileSync('./scripts/trading/steam_bot.js')+''); //LOAD BOT SCRIPT
//eval(fs.readFileSync('./scripts/trading/steam.js')+''); //LOAD STEAM SCRIPT
//eval(fs.readFileSync('./scripts/trading/crypto.js')+''); //LOAD CRYPTO SCRIPT
//eval(fs.readFileSync('./scripts/trading/p2p.js')+''); //LOAD P2P SCRIPT

//eval(fs.readFileSync('./scripts/prices.js')+''); //LOAD PRICES SCRIPT

eval(fs.readFileSync('./scripts/mailer.js')+''); //LOAD MAILER SCRIPT

//GENERATE ITEMS
function generateItem(item, data){
	var new_item = {
		'id': item.assetid || item.id || null,
		'game': item.game || null,
		'name': item.name || null,
		'image': item.icon || item.image || null,
		'price': item.price || 0,
		'offset': item.offset || 0,
		'color': item.color || null,
		'stickers': item.stickers || [],
		'wear': item.wear || null,
	};
	
	Object.keys(data).forEach(function(prop){
		if(new_item[prop] !== undefined){
			new_item[prop] = data[prop];
		}
	});
	
	return new_item;
}

//GET SQL ITEMS
function getSqlItems(items){
	return JSON.stringify({items});
}

function getItemsFromSql(items){
	return JSON.parse(items).items;
}

function isJsonString(string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
	
    return true;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function getFeeFromCommission(amount, commission){
	return roundedToFixed(amount * commission / 100, 5);
}

function getAffiliateCommission(deposits, type){
	var tier = 0;
	for(tier = 0; tier < config.config_site.affiliates_requirement.length; tier++) {
		if(deposits < config.config_site.affiliates_requirement[tier]) break;
	}
	
	return tier * config.config_site.affiliates_commission[type];
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

function getXpByAmount(amount){
	var xp = parseInt(getFormatAmount(amount) * 100);
	
	if(new Date().getDay() == 0 || new Date().getDay() == 6) xp *= 2;
	
	return xp;
}

function getAvailableAmount(amount){
	return getFormatAmount(amount * config.config_site.multiplier_wager_withdraw);
}

function verifyFormatAmount(amount, callback){
	if(isNaN(Number(amount))) return callback(new Error('Error: Invalid amount. This field must to be a number!'));
	
	amount = getFormatAmount(amount);
	
	//if(amount < minbet || amount > maxbet) return callback(new Error('Error: Invalid bet amount [' + minbet + '-' + maxbet  + ']!'));
	
	return callback(null, amount);
}

function getColorByQuality(quality){
	switch(quality){
		case "Consumer Grade":
			return "#b0c3d9";
		break;
		
		case "Mil-Spec Grade":
			return "#4b69ff";
		break;
		
		case "Industrial Grade":
			return "#5e98d9";
		break;
		
		case "Restricted":
			return "#8847ff";
		break;
		
		case "Classified":
			return "#d32ce6";
		break;
		
		case "Covert":
			return "#eb4b4b";
		break;
		
		case "Base Grade":
			return "#b0c3d9";
		break;
		
		case "Extraordinary":
			return "#eb4b4b";
		break;
		
		case "High Grade":
			return "#4b69ff";
		break;
		
		case "Remarkable":
			return "#8847ff";
		break;
		
		case "Exotic":
			return "#d32ce6";
		break;
		
		case "Contraband":
			return "#e4ae39";
		break;
		
		case "Distinguished":
			return "#4b69ff";
		break;
		
		case "Exceptional":
			return "#8847ff";
		break;
		
		case "Superior":
			return "#d32ce6";
		break;
		
		case "Master":
			return "#eb4b4b";
		break;
	}
}

function calculateLevel(xp){
	var start = 0;
	var next = config.config_site.level.start;
	
	var level = 0;
	
	for(var i = 1; next <= xp && level < 1000; i++){
		start = next;
		next += parseInt(next * config.config_site.level.next * (1.00 - 0.0095 * level));
		
		level++;
	}
	
	return {
		level: level,
		start: 0,
		next: next - start,
		have: ((xp > next) ? next : xp) - start
	};
}

function makeCode(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function generateHexCode(length) {
    var text = '';
    var possible = 'abcdef0123456789';

    for(var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function makeDate(date){
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	
	var type_time = (date.getHours() < 12) ? 'AM' : 'PM';
	
	return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ', ' + ('0'.concat(date.getHours() % 12).slice(-2)) + ':' + ('0'.concat(date.getMinutes()).slice(-2)) + ' ' + type_time;
}

function setUserRequest(user, type, value, urgent){
	users_requests[user] = value;
	// users_requests[user] = false;
	if(type == 'p2p') users_requests[user] = false;
	
	if(value || urgent){
		if(type == 'dice') diceGame_cooldown[user] = value;
		if(type == 'unbox') unboxGame_cooldown[user] = value;
		if(type == 'plinko') plinkoGame_cooldown[user] = value;
	}
}

function time() {
	return parseInt(new Date().getTime()/1000);
}

function countDecimals(value) {
    if (Math.floor(value) !== value) return value.toString().split('.')[1].length || 0;
    
	return 0;
}

function getFormatSeconds(time){
	var days = parseInt((time) / (24 * 60 * 60));
	var hours = parseInt((time - (days * 24 * 60 * 60)) / (60 * 60));
	var minutes = parseInt((time - (days * 24 * 60 * 60) - (hours * 60 * 60)) / (60));
	var seconds = parseInt((time - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)));
	
	days = '0'.concat(days).slice(-2);
	hours = '0'.concat(hours).slice(-2);
	minutes = '0'.concat(minutes).slice(-2);
	seconds = '0'.concat(seconds).slice(-2);
	
	return {
		days,
		hours,
		minutes,
		seconds
	};
}

function getTimeString(string){
	var time_restriction = 0;
	
	if(string == 'permanent'){
		time_restriction = -1; //PERMANENT
	} else {
		var reg = /^([0-9]*)([a-zA-Z]*)/.exec(string);
		
		if(reg[2] == 'minutes') time_restriction = parseInt(time() + (reg[1] * 60)); //MINUTES
		else if(reg[2] == 'hours') time_restriction = parseInt(time() + (reg[1] * 60 * 60)); //HOURS
		else if(reg[2] == 'days') time_restriction = parseInt(time() + (reg[1] * 60 * 60 * 24)); //DAYS
		else if(reg[2] == 'months') time_restriction = parseInt(time() + (reg[1] * 60 * 60 * 24 * 30)); //MONTHS
		else if(reg[2] == 'years') time_restriction = parseInt(time() + (reg[1] * 60 * 60 * 24 * 30 * 12)); //YEARS
	}
	
	return time_restriction;
}

Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&.');
};

function addLiveBet(game, user, wager, payout, multi) {
  const obj = {
    game: game,
    player: user,
    wager: wager,
    payout: payout,
    multi: multi
  };

  const objsql = {
    game: game,
    player: JSON.stringify(user),
    wager: wager,
    payout: payout,
    multi: multi
  };

  io.emit('live bet', obj);
  live_results_homepage.push(obj);
  
  pool.query('INSERT INTO live_bets SET ?', objsql, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
    } else {
      console.log('Data inserted successfully');
    }
  });

  if(live_results_homepage.length > 10) live_results_homepage.length = 10;
}

function loadBetsToHomepage() {
	const selectBetsQuery = 'SELECT * FROM live_bets ORDER BY id DESC LIMIT 10';
  
	pool.query(selectBetsQuery, (err, results) => {
	  if (err) {
		console.error('Error selecting bets:', err);
	  } else {
		const bets = results.reverse();
		
		const parsedBets = bets.map(bet => {
		  return {
			...bet,
			player: JSON.parse(bet.player)
		  };
		});
  
		live_results_homepage = parsedBets;
		console.log('Bets loaded to homepage array:', live_results_homepage);

		parsedBets.forEach(bet => {
			io.emit('live bet', bet);
		});
	  }
	});
  }

  