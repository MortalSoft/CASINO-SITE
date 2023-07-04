var offers_history = [];
var offers_steamActiveOffers = {};

var offers_inventoryDeposit = {};
var offers_inventoryWithdraw = {};

var offers_steamSiteInventory = {};

/* OFFERS */

function offers_verifyApikey(user, apikey, callback){
	var reg1 = /^(([a-f\d]{2}){16})$/i;
	
	if(!reg1.test(apikey)) return callback(new Error('Invalid apikey!'));
	
	if(user.binds.steam === undefined) return callback(new Error('Please bind your Steam Account.'));
		
	if(!user.tradelink) return callback(new Error('Firstly, you must set your valid Steam Trade Link from settings.'));
	
	var offer_message = config.config_site.name + ' | Verifing your Apikey';
	
	if(!haveActiveBots('apikey')) return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
	
	var steam_bot = getFreeBot('apikey');
	var game = 'csgo';
	
	getUserInventory(steam_bot.steamid, config.config_offers.steam.games[game].game.appid, config.config_offers.steam.games[game].game.contextid, false, function(err1, items){
		if(err1) return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
		
		var new_items = items.filter(a => a.marketable == true).filter(a => a.tradable == true);
		var item = {
			id: new_items[getRandomInt(0, new_items.length - 1)].assetid,
			game: game
		};
		
		offers_steamSendOffer(user.binds.steam, user.tradelink, offer_message, [item], [], steam_bot.steamid, function(err2, offer){
			if(err2) return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
			
			pool.query('INSERT INTO `steam_verifications` SET `userid` = ' + pool.escape(user.userid) + ', `botsteamid` = ' + pool.escape(steam_bot.steamid) + ', `tradeofferid` = ' + pool.escape(offer.id) + ', `item` = ' + pool.escape(JSON.stringify({item})) + ', `time` = ' + pool.escape(time()), function(err3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
				}
			
				offers_steamDeclineOffer(offer.id, steam_bot.steamid, function(err4){
					if(err4) return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
					
					var options = 'https://api.steampowered.com/IEconService/GetTradeOffer/v1?key=' + apikey + '&tradeofferid=' + offer.id;
				
					request(options, function(err5, response5, body5) {
						if(err5) return callback(new Error('We can\'t verify your Apikey. Please try again later.'));
					
						if(!response5) return callback(new Error('Invalid apikey!'));
						if(response5.statusCode != 200) return callback(new Error('Invalid apikey!'));
						if(!isJsonString(body5)) return callback(new Error('Invalid apikey!'));
					
						var body = JSON.parse(body5);
						
						var user_offer = body.response.offer;
						
						if(user_offer === undefined) return callback(new Error('Invalid apikey!'));
						
						callback(null);
					});
				});
			});
		});
	});
}

offers_loadHistory();
function offers_loadHistory(){
	pool.query('SELECT * FROM `users_trades` ORDER BY `id` DESC LIMIT 20', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		row1.forEach(function(offer){
			var table = { 'steam': 'steam_transactions', 'crypto': 'crypto_transactions', 'p2p': 'p2p_transactions' }[offer.method]
			
			pool.query('SELECT `userid`, `name`, `avatar`, `xp` FROM `' + table + '` WHERE `userid` = ' + pool.escape(offer.userid), function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length > 0){
					offers_history.push({
						type: offer.type,
						method: offer.method,
						game: offer.game,
						user: {
							userid: row2[0].userid,
							name: row2[0].name,
							avatar: row2[0].avatar,
							level: calculateLevel(row2[0].xp).level
						},
						amount: offer.value,
						time: offer.time
					});
					
					offers_history.sort(function(a, b){return a.time - b.time});
				}
			});
		});
	});
}

function offers_steamLoadOffers(bot){
	var steam_bot = offers_steamBots[getBotBySteamid(bot)];
	
	if(steam_bot == undefined) {
		logger.error(new Error('[BOT] ' + bot + ' Was Not Found'));
		writeError(new Error('[BOT] ' + bot + ' Was Not Found'));
		return;
	}
	
	logger.warn('[BOT] ' + steam_bot.name + ' - Steam Offers Are Loading');
	
	pool.query('SELECT * FROM `steam_transactions` WHERE (`status` = 0 OR `status` = 1) AND `botsteamid` = ' + pool.escape(bot), function(err1, row1){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		logger.warn('[BOT] ' + steam_bot.name + ' - ' + row1.length + ' Offers Loaded');
	
		row1.forEach(function(transaction){
			steam_bot.manager.getOffer(transaction.tradeofferid, function(err2, offer){
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				var total_items = [];
				var total_price = 0;
				
				total_items = getItemsFromSql(transaction.items);
				total_price = getFormatAmount(transaction.amount);
				
				offers_steamActiveOffers[offer.id] = {
					id: transaction.id,
					status: transaction.status,
					type: transaction.type,
					user: {
						userid: transaction.userid,
						name: transaction.name,
						avatar: transaction.avatar,
						level: calculateLevel(transaction.xp).level
					},
					game: transaction.game,
					items: total_items,
					amount: total_price,
					time_created: transaction.time,
					tradeofferid: transaction.tradeofferid,
					code: transaction.code,
					time: null,
					timeout: null
				};
				
				if(transaction.status == 1){
					offers_steamActiveOffers[offer.id].time = time();
					offers_steamActiveOffers[offer.id].timeout = setTimeout(function(){
						offers_steamDeclineOffer(offer.id, steam_bot.steamid, function(err3){
							if(err3){
								logger.error(err3);
								writeError(err3);
							}
						});
					}, config.config_offers.steam.time_cancel_trade * 1000);
				}
				
				offers_steamStateChanged(offer.state, offer.id, offer.itemsToGive, offer.itemsToReceive, transaction.botsteamid);
			});
		});
	});
}

//MAKE OFFER
function offers_steamSendOffer(steamid, tradelink, message, items_send, items_receive, bot, callback){
	var steam_bot = offers_steamBots[getBotBySteamid(bot)];
	
	if(steam_bot == undefined) {
		logger.error(new Error('[BOT] ' + bot + ' Was Not Found'));
		writeError(new Error('[BOT] ' + bot + ' Was Not Found'));
		return;
	}
	
	var create = steam_bot.manager.createOffer(steamid, tradelink.split('token=')[1]);
		
	items_receive.forEach(function(item){
		create.addTheirItem({
			'appid': config.config_offers.steam.games[item.game].game.appid,
			'contextid': config.config_offers.steam.games[item.game].game.contextid,
			'assetid': item.id
		});
	});
		
	items_send.forEach(function(item){
		create.addMyItem({
			'appid': config.config_offers.steam.games[item.game].game.appid,
			'contextid': config.config_offers.steam.games[item.game].game.contextid,
			'assetid': item.id
		});
	});
	
	create.setMessage(message);
	
	create.send(function(err1, status) {
		if(err1){
			logger.error(err1);
			writeError(err1);
			
			return callback(err1);
		}
		
		callback(null, create);
	});
}

//DECLINE OFFERS
function offers_steamDeclineOffer(offerid, bot, callback){
	var steam_bot = offers_steamBots[getBotBySteamid(bot)];
	
	if(steam_bot == undefined) return callback(new Error('[BOT] ' + bot + ' Was Not Found'));
	
	steam_bot.manager.getOffer(offerid, function(err1, offer){
		if(err1) return callback(err1);
		
		if(offer.state == 2 || offer.state == 9){
			offer.decline(function(err2) {
				if(err2) return callback(err2);
				
				steam_bot.community.checkConfirmations();
				
				if(offers_steamActiveOffers[offer.id] === undefined) logger.warn('[BOT] ' + steam_bot.name + ' - Unknown Offer #' + offer.id + ' Was Declined');
				
				callback(null);
			});
		}
	});
}

//ACCEPT OFFERS
function offers_steamAcceptOffer(offerid, bot, callback){
	var steam_bot = offers_steamBots[getBotBySteamid(bot)];
		
	if(steam_bot == undefined) return callback(new Error('[BOT] ' + bot + ' Was Not Found'));
	
	steam_bot.manager.getOffer(offerid, function(err1, offer){
		if(err1) return callback(err1);
		
		if(offer.state == 2){
			offer.accept(function(err2) {
				if(err2) return callback(err2);
				
				steam_bot.community.checkConfirmations();
				
				if(offers_steamActiveOffers[offer.id] === undefined) logger.warn('[BOT] ' + steam_bot.name + ' - Unknown Offer #' + offer.id + ' Was Accepted');
			});
		}
	});
}

//OFFERS CHANGED
function offers_steamStateChanged(state, id, sender, recipient, bot){
	if(offers_steamActiveOffers[id] !== undefined){
	
		var steam_bot = offers_steamBots[getBotBySteamid(bot)];
		
		if(steam_bot == undefined) {
			logger.error(new Error('[BOT] ' + bot + ' Was Not Found'));
			writeError(new Error('[BOT] ' + bot + ' Was Not Found'));
			return;
		}
		
		var amount = getFormatAmount(offers_steamActiveOffers[id].amount);
		
		if(offers_steamActiveOffers[id].status == 0){
			if(state == 2){
				if(offers_steamActiveOffers[id].type == 'withdraw'){
					pool.query('UPDATE `steam_transactions` SET `status` = 1 WHERE `tradeofferid` = ' + pool.escape(id), function(err1) {
						if(err1) {
							logger.error(err1);
							writeError(err1);
							return;
						}
					
						offers_steamActiveOffers[id].status = 1;
						offers_steamActiveOffers[id].time = time();
						
						offers_steamActiveOffers[id].timeout = setTimeout(function(){
							offers_steamDeclineOffer(offers_steamActiveOffers[id].tradeofferid, steam_bot.steamid, function(err2){
								if(err2) {
									logger.error(err2);
									writeError(err2);
									return;
								}
							});
						}, config.config_offers.steam.time_cancel_trade * 1000)
						
						//EDIT PENDING FROM BUYER
						io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
							type: 'offers',
							command: 'edit_pending',
							offer: {
								id: offers_steamActiveOffers[id].id,
								type: offers_steamActiveOffers[id].type,
								method: 'steam',
								status: offers_steamActiveOffers[id].status,
								game: offers_steamActiveOffers[id].game,
								items: offers_steamActiveOffers[id].items,
								data: {
									tradeofferid: offers_steamActiveOffers[id].tradeofferid,
									code: offers_steamActiveOffers[id].code,
									time: offers_steamActiveOffers[id].time + config.config_offers.steam.time_cancel_trade
								}
							}
						});
						
						logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[id].type.toUpperCase() + ' | ' + offers_steamActiveOffers[id].user.userid + ' | Offer #' + id + ' Was Confirmed');
					});
				}
			}
		} else if(offers_steamActiveOffers[id].status == 1){
			if(state == 3){
				if(offers_steamActiveOffers[id].type == 'deposit'){
					steam_bot.manager.getOffer(id, function(err1, offer){
						if(err1) {
							logger.error(err1);
							writeError(err1);
							return;
						}
					
						offer.getReceivedItems(function(err2, items) {
							if(err2) {
								logger.error(err2);
								writeError(err2);
								return;
							}
							
							offers_assignItemsChanges(items, recipient, offers_steamActiveOffers[id].items, function(assign_items){
								if(assign_items.items.length != offers_steamActiveOffers[id].items.length) {
									logger.error(new Error('Unassigned items'));
									writeError(new Error('Unassigned items'));
									return;
								}
								
								pool.query('UPDATE `steam_transactions` SET `status` = 2 WHERE `tradeofferid` = ' + pool.escape(id), function(err3) {
									if(err3) {
										logger.error(err3);
										writeError(err3);
										return;
									}
									
									assign_items.items.forEach(function(item){
										pool.query('INSERT INTO `steam_history` SET `itemid` = ' + pool.escape(item.id) + ', `lastid` = ' + pool.escape(assign_items.assign[item.id]) + ', `time` = ' + pool.escape(time()), function(err4) {
											if(err4) {
												logger.error(err4);
												writeError(err4);
												return;
											}
										});
									});
										
									pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape(offers_steamActiveOffers[id].type) + ', `method` = ' + pool.escape("steam") + ', `game` = ' + pool.escape(offers_steamActiveOffers[id].game) + ', `userid` = ' + pool.escape(offers_steamActiveOffers[id].user.userid) + ', `amount` = ' + amount + ', `value` = ' + amount + ', `tradeid` = ' + pool.escape(offers_steamActiveOffers[id].tradeofferid) + ', `time` = ' + pool.escape(time()), function(err4){
										if(err4) {
											logger.error(err4);
											writeError(err4);
											return;
										}
										
										pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(offers_steamActiveOffers[id].user.userid) + ', `service` = ' + pool.escape('steam_deposit') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
										pool.query('UPDATE `users` SET `balance` =  `balance` + ' + amount + ', `deposit_count` = `deposit_count` + 1, `deposit_total` = `deposit_total` + ' + amount + ' WHERE `userid` = ' + pool.escape(offers_steamActiveOffers[id].user.userid), function(err5) {
											if(err5) {
												logger.error(err5);
												writeError(err5);
												return;
											}
											
											//AFFILIATES
											pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(offers_steamActiveOffers[id].user.userid) + ' GROUP BY referral_uses.referral', function(err6, row6) {
												if(err6) {
													logger.error(err6);
													writeError(err6);
													return;
												}
												
												if(row6.length > 0) {
													var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row6[0].amount), 'deposit'));
													
													pool.query('INSERT INTO `referral_deposited` SET `userid` = ' + pool.escape(offers_steamActiveOffers[id].user.userid) + ', `referral` = ' + pool.escape(row6[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
													pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row6[0].referral));
												}
											
												if(offers_steamActiveOffers[id].timeout != null) clearTimeout(offers_steamActiveOffers[id].timeout);
												
												offers_steamActiveOffers[id].status = 2;
												
												//EDIT PENDING FROM SELLER
												io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
													type: 'offers',
													command: 'edit_pending',
													offer: {
														id: offers_steamActiveOffers[id].id,
														type: offers_steamActiveOffers[id].type,
														method: 'steam',
														status: offers_steamActiveOffers[id].status,
														items: offers_steamActiveOffers[id].items,
														data: {
															tradeofferid: offers_steamActiveOffers[id].tradeofferid,
															amount: amount
														}
													}
												});
												
												//ADD ITEMS TO WITHDRAW
												io.sockets.emit('message', {
													type: 'offers',
													command: 'add_items',
													offer: {
														items: offers_assignItemsType(assign_items.items, { type: 'withdraw', method: 'steam', game: offers_steamActiveOffers[id].game, tradelocked: true, offset: true, bot: getBotBySteamid(bot) }),
														paths: ['withdraw', 'steam', offers_steamActiveOffers[id].game],
														more: true
													}
												});
												
												assign_items.items.forEach(function(item){
													pool.query('INSERT INTO `steam_inventory` SET `itemid` = ' + pool.escape(item.id) + ', `game` = ' + pool.escape(offers_steamActiveOffers[id].game) + ', `time` = ' + pool.escape(time()), function(err7, row7) {
														if(err7) {
															logger.error(err7);
															writeError(err7);
															return;
														}
														
														if(row7.affectedRows > 0) offers_steamSiteInventory[item.id] = false;
													});
												});
												
												var offerToAdd = {
													type: offers_steamActiveOffers[id].type,
													method: 'steam',
													game: offers_steamActiveOffers[id].game,
													user: offers_steamActiveOffers[id].user,
													amount: amount,
													time: time()
												};
												
												offers_history.push(offerToAdd);
												while(offers_history.length > 20) offers_history.shift();
												
												io.sockets.emit('message', {
													type: 'offers',
													command: 'last_offer',
													offer: offerToAdd
												});
												
												setTimeout(function(){
													if(offers_steamActiveOffers[id] !== undefined){
														//REMOVE PENDING FROM SELLER
														io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
															type: 'offers',
															command: 'remove_pending',
															offer: {
																id: offers_steamActiveOffers[id].id,
																method: 'steam'
															}
														});
														
														delete offers_steamActiveOffers[id];
													}
												}, config.config_offers.steam.time_remove_pending * 1000);
												
												logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[id].type.toUpperCase() + ' | ' + offers_steamActiveOffers[id].user.userid + ' | Offer #' + id + ' Was Accepted');
												
												getBalance(offers_steamActiveOffers[id].user.userid);
											});
										});
									});
								});
							});
						});
					});
				} else if(offers_steamActiveOffers[id].type == 'withdraw'){
					pool.query('UPDATE `steam_transactions` SET `status` = 2 WHERE `tradeofferid` = ' + pool.escape(id), function(err1) {
						if(err1) {
							logger.error(err1);
							writeError(err1);
							return;
						}
							
						pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape(offers_steamActiveOffers[id].type) + ', `method` = ' + pool.escape("steam") + ', `game` = ' + pool.escape(offers_steamActiveOffers[id].game) + ', `userid` = ' + pool.escape(offers_steamActiveOffers[id].user.userid) + ', `amount` = ' + amount + ', `value` = ' + amount + ', `tradeid` = ' + pool.escape(offers_steamActiveOffers[id].tradeofferid) + ', `time` = ' + pool.escape(time()), function(err2){
							if(err2) {
								logger.error(err2);
								writeError(err2);
								return;
							}
							
							pool.query('UPDATE `users` SET `withdraw_count` = `withdraw_count` + 1, `withdraw_total` = `withdraw_total` + ' + amount + ' WHERE `userid` = ' + pool.escape(offers_steamActiveOffers[id]['userid']), function(err3) {
								if(err3) {
									logger.error(err3);
									writeError(err3);
									return;
								}
								
								if(offers_steamActiveOffers[id].timeout != null) clearTimeout(offers_steamActiveOffers[id].timeout);
								
								offers_steamActiveOffers[id].status = 2;
								
								//EDIT PENDING FROM BUYER
								io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
									type: 'offers',
									command: 'edit_pending',
									offer: {
										id: offers_steamActiveOffers[id].id,
										type: offers_steamActiveOffers[id].type,
										method: 'steam',
										status: offers_steamActiveOffers[id].status,
										items: offers_steamActiveOffers[id].items,
										data: {
											tradeofferid: offers_steamActiveOffers[id].tradeofferid
										}
									}
								});
											
								//ADD ITEMS TO DEPOSIT
								io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
									type: 'offers',
									command: 'add_items',
									offer: {
										items: offers_assignItemsType(offers_steamActiveOffers[id].items, { type: 'deposit', method: 'steam', game: offers_steamActiveOffers[id].game, tradelocked: false, offset: false }),
										paths: ['deposit', 'steam', offers_steamActiveOffers[id].game],
										more: true
									}
								});
							
								//DELETE ITEMS
								offers_steamActiveOffers[id].items.forEach(function(item){
									pool.query('DELETE FROM `steam_inventory` WHERE `itemid` = ' + pool.escape(item.id) + ' AND `status` = 1', function(err4, row4) {
										if(err4) {
											logger.error(err4);
											writeError(err4);
											return;
										}
										
										if(row4.affectedRows > 0) if(offers_steamSiteInventory[item.id] !== undefined) delete offers_steamSiteInventory[item.id];
									});
								});
								
								var offerToAdd = {
									type: offers_steamActiveOffers[id].type,
									method: 'steam',
									game: offers_steamActiveOffers[id].game,
									user: offers_steamActiveOffers[id].user,
									amount: amount,
									time: time()
								};
								
								offers_history.push(offerToAdd);
								while(offers_history.length > 20) offers_history.shift();
								
								io.sockets.emit('message', {
									type: 'offers',
									command: 'last_offer',
									offer: offerToAdd
								});
								
								setTimeout(function(){
									if(offers_steamActiveOffers[id] !== undefined){
										//REMOVE PENDING FROM BUYER
										io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
											type: 'offers',
											command: 'remove_pending',
											offer: {
												id: offers_steamActiveOffers[id].id,
												method: 'steam'
											}
										});
										
										delete offers_steamActiveOffers[id];
									}
								}, config.config_offers.steam.time_remove_pending * 1000);
								
								logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[id].type.toUpperCase() + ' | ' + offers_steamActiveOffers[id].user.userid + ' | Offer #' + id + ' Was Accepted');
							});
						});
					});
				}
			} else if(state != 2 && state != 9){
				if(offers_steamActiveOffers[id].type == 'deposit'){
					pool.query('UPDATE `steam_transactions` SET `status` = -1 WHERE `tradeofferid` = ' + pool.escape(id), function(err1) {
						if(err1) {
							logger.error(err1);
							writeError(err1);
							return;
						}
						
						if(offers_steamActiveOffers[id].timeout != null) clearTimeout(offers_steamActiveOffers[id].timeout);
						
						offers_steamActiveOffers[id].status = -1;
						
						//EDIT PENDING FROM SELLER
						io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
							type: 'offers',
							command: 'edit_pending',
							offer: {
								id: offers_steamActiveOffers[id].id,
								type: offers_steamActiveOffers[id].type,
								method: 'steam',
								status: offers_steamActiveOffers[id].status,
								items: offers_steamActiveOffers[id].items,
								data: {
									tradeofferid: offers_steamActiveOffers[id].tradeofferid
								}
							}
						});
						
						//ADD ITEMS TO DEPOSIT
						io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
							type: 'offers',
							command: 'add_items',
							offer: {
								items: offers_assignItemsType(offers_steamActiveOffers[id].items, { type: 'deposit', method: 'steam', game: offers_steamActiveOffers[id].game, tradelocked: false, offset: false }),
								paths: ['deposit', 'steam', offers_steamActiveOffers[id].game],
								more: true
							}
						});
						
						setTimeout(function(){
							if(offers_steamActiveOffers[id] !== undefined){
								//REMOVE PENDING FROM SELLER
								io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
									type: 'offers',
									command: 'remove_pending',
									offer: {
										id: offers_steamActiveOffers[id].id,
										method: 'steam'
									}
								});
								
								delete offers_steamActiveOffers[id];
							}
						}, config.config_offers.steam.time_remove_pending * 1000);
						
						logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[id].type.toUpperCase() + ' | ' + offers_steamActiveOffers[id].user.userid + ' | Offer #' + id + ' Was Declined');
					});
					
				} else if(offers_steamActiveOffers[id].type == 'withdraw'){
					pool.query('UPDATE `steam_transactions` SET `status` = -1 WHERE `tradeofferid` = ' + pool.escape(id), function(err1) {
						if(err1) {
							logger.error(err1);
							writeError(err1);
							return;
						}
						
						pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(offers_steamActiveOffers[id]['userid']) + ', `service` = ' + pool.escape('steam_withdraw_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
						pool.query('UPDATE `users` SET `balance` =  `balance` + ' + amount + ', `available` = `available` + ' + amount + ' WHERE `userid` = ' + pool.escape(offers_steamActiveOffers[id]['userid']), function(err2) {
							if(err2) {
								logger.error(err2);
								writeError(err2);
								return;
							}
							
							if(offers_steamActiveOffers[id].timeout != null) clearTimeout(offers_steamActiveOffers[id].timeout);
							
							offers_steamActiveOffers[id].status = -1;
							
							//EDIT PENDING FROM BUYER
							io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: offers_steamActiveOffers[id].id,
									type: offers_steamActiveOffers[id].type,
									method: 'steam',
									status: offers_steamActiveOffers[id].status,
									items: offers_steamActiveOffers[id].items,
									data: {
										tradeofferid: offers_steamActiveOffers[id].tradeofferid,
										amount: amount
									}
								}
							});
							
							//ADD ITEMS TO WITHDRAW
							io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
								type: 'offers',
								command: 'add_items',
								offer: {
									items: offers_assignItemsType(offers_steamActiveOffers[id].items, { type: 'withdraw', method: 'steam', game: offers_steamActiveOffers[id].game, tradelocked: false, offset: true, bot: getBotBySteamid(bot) }),
									paths: ['withdraw', 'steam', offers_steamActiveOffers[id].game],
									more: true
								}
							});
							
							if(state != 8){
								offers_steamActiveOffers[id].items.forEach(function(item){
									pool.query('UPDATE `steam_inventory` SET `status` = 0 WHERE `itemid` = ' + pool.escape(item.id) + ' AND `status` = 1', function(err3, row3) {
										if(err3) {
											logger.error(err3);
											writeError(err3);
											return;
										}
										
										if(row3.affectedRows > 0) if(offers_steamSiteInventory[item.id] !== undefined) offers_steamSiteInventory[item.id] = false;
									});
								});
							}
							
							setTimeout(function(){
								if(offers_steamActiveOffers[id] !== undefined){
									//REMOVE PENDING FROM BUYER
									io.sockets.in(offers_steamActiveOffers[id].user.userid).emit('message', {
										type: 'offers',
										command: 'remove_pending',
										offer: {
											id: offers_steamActiveOffers[id].id,
											method: 'steam'
										}
									});
									
									delete offers_steamActiveOffers[id];
								}
							}, config.config_offers.steam.time_remove_pending * 1000);
							
							logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[id].type.toUpperCase() + ' | ' + offers_steamActiveOffers[id].user.userid + ' | Offer #' + id + ' Was Declined');
							
							getBalance(offers_steamActiveOffers[id].user.userid);
						});
					});
				}
				
				offers_steamDeclineOffer(id, bot, function(err1){
					if(err1){
						logger.error(err1);
						writeError(err1);
					}
				});
			}
		}
	}
}

function offers_assignItemsType(items, data){
	for(var i = 0; i < items.length; i++){
		if(items[i].accepted === undefined) items[i].accepted = true;
		if(items[i].inspect === undefined) items[i].inspect = null;
		
		if(!data.offset) items[i].offset = 0;
		
		if(items[i].bot === undefined) if(data.type == 'withdraw' && data.method == 'steam') items[i].bot = data.bot;
		
		if(items[i].tradelocked === undefined) {
			if(data.tradelocked) {
				items[i].tradelocked = {
					tradelocked: true,
					time: 7 * 24 * 60 * 60
				}
			} else {
				items[i].tradelocked = {
					tradelocked: false,
					time: 0
				}
			}
		}
	}
	
	return items;
}

function offers_assignItemsChanges(new_items, old_items, info_items, callback){
	var new_info_items = [];
	var assigned_items = {};
	
	info_items.forEach(function(item){
		var old_index = old_items.findIndex(old_item => old_item.assetid === item.id);
		
		if(old_index != -1) {
			var icon = item.image.split('https://steamcommunity-a.akamaihd.net/economy/image/')[1];
			
			var new_index = new_items.findIndex(new_item => (new_item.icon_url_large === icon || new_item.icon_url === icon));
			
			if(new_index != -1){
				assigned_items[new_items[new_index].assetid] = old_items[old_index].assetid;
				
				new_info_items.push(Object.assign(generateItem(item, {
					'id': new_items[new_index].assetid
				}), {}));
			}
		}
	});
	
	callback({
		items: new_info_items,
		assign: assigned_items
	});
}

/* END OFFERS */

/* DEPOSIT */

function depositSteam_deposit(user, socket, game, items, recaptcha){
	setUserRequest(user.userid, 'deposit', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'deposit', false, true);
			return;
		}
		
		socket.emit('message', {
			type: 'info',
			info: 'Preparing deposit Trade Offer. Please wait...'
		});
		
		depositSteam_confirmDeposit(user, game, items, function(err1, offer){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'deposit', false, true);
				return;
			}
			
			//REMOVE ITEMS FROM DEPOSIT
			io.sockets.in(offers_steamActiveOffers[offer.id].user.userid).emit('message', {
				type: 'offers',
				command: 'remove_items',
				offer: {
					items: offers_steamActiveOffers[offer.id].items,
					paths: [offers_steamActiveOffers[offer.id].type, 'steam', game],
					all: false
				}
			});
			
			//ADD PENDING TO SELLER
			io.sockets.in(offers_steamActiveOffers[offer.id].user.userid).emit('message', {
				type: 'offers',
				command: 'add_pending',
				offer: {
					id: offers_steamActiveOffers[offer.id].id,
					type: offers_steamActiveOffers[offer.id].type,
					method: 'steam',
					status: offers_steamActiveOffers[offer.id].status,
					items: offers_steamActiveOffers[offer.id].items,
					data: {
						tradeofferid: offers_steamActiveOffers[offer.id].tradeofferid,
						code: offers_steamActiveOffers[offer.id].code,
						time: offers_steamActiveOffers[offer.id].time + config.config_offers.steam.time_cancel_trade
					}
				}
			});
			
			setUserRequest(user.userid, 'deposit', false, false);
		});
	});
}

function depositSteam_confirmDeposit(user, game, items, callback){
	if(user.binds.steam === undefined) return callback(new Error('Please bind your Steam Account!'));
	
	if(user.restrictions.trade >= time() || user.restrictions.trade == -1) return callback(new Error('Error: You are restricted to use our trade. The restriction expires ' + ((user.restrictions.trade == -1) ? 'never' : makeDate(new Date(user.restrictions.trade * 1000))) + '.'));
	
	if(user.exclusion > time()) return callback(new Error('Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'));
	
	if(!user.tradelink) return callback(new Error('Error: Firstly, you must set your valid Steam Trade Link from settings.'));
		
	if(config.config_offers.steam.games[game] === undefined) return callback(new Error('Invalid deposit game!'));
	
	if(items.length < config.config_site.interval_items.deposit.min || items.length > config.config_site.interval_items.deposit.max) return callback(new Error('Error: Invalid items amount [' + config.config_site.interval_items.deposit.min + '-' + config.config_site.interval_items.deposit.max + ']!'));
	
	depositSteam_depositByGames(user.binds.steam, game, 0, items, config.config_offers.steam.deposit_offset, [], 0, function(err1, total_items, total_price){
		if(err1) return callback(new Error('Error: ' + err1.message));
		
		if(total_items.length != items.length) return callback(new Error('Error: Invalids items in your offer. Please refresh your inventory!'));
		
		if(total_price < config.config_site.interval_amount.deposit_skins.min || total_price > config.config_site.interval_amount.deposit_skins.max) return callback(new Error('Error: Invalid deposit amount [' + getFormatAmountString(config.config_site.interval_amount.deposit_skins.min) + '-' + getFormatAmountString(config.config_site.interval_amount.deposit_skins.max)  + ']!'));
		
		var offer_code = makeCode(6);
		var offer_message = config.config_site.name + ' | Deposit | +' + getFormatAmountString(total_price) + ' coins | Code ' + offer_code;
		
		if(!haveActiveBots('trade')) return callback(new Error('Error: There are no active bots. Please try again later.'));
		
		var steam_bot = getFreeBot('trade');
		
		offers_steamSendOffer(user.binds.steam, user.tradelink, offer_message, [], items, steam_bot.steamid, function(err2, offer){
			if(err2) return callback(new Error('Error: There was an error sending your trade offer. Please try again later.'));
			
			pool.query('INSERT INTO `steam_transactions` SET `status` = 1, `type` = ' + pool.escape('deposit') + ', `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + pool.escape(user.xp) + ', `steamid` = ' + pool.escape(user.binds.steam) + ', `items` = ' + pool.escape(getSqlItems(total_items)) + ', `amount` = ' + total_price + ', `code` = ' + pool.escape(offer_code) + ', `game` = ' + pool.escape(game) + ', `tradeofferid` = ' + pool.escape(offer.id) + ', `botsteamid` = ' + pool.escape(steam_bot.steamid) + ', `time` = ' + pool.escape(time()), function(err3, row3) {
				if(err3) {
					logger.error(err3);
					writeError(err3);
					return callback(new Error('Error in sending your trade offer'));
				}
				
				offers_steamActiveOffers[offer.id] = {
					id: row3.insertId,
					status: 1,
					type: 'deposit',
					user: {
						userid: user.userid,
						name: user.name,
						avatar: user.avatar,
						level: calculateLevel(user.xp).level
					},
					game: game,
					items: total_items,
					amount: total_price,
					time_created: time(),
					tradeofferid: offer.id,
					code: offer_code,
					time: time(),
					timeout: setTimeout(function(){
						offers_steamDeclineOffer(offer.id, steam_bot.steamid, function(err4){
							if(err4){
								logger.error(err4);
								writeError(err4);
							}
						});
					}, config.config_offers.steam.time_cancel_trade * 1000)
				};
				
				logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[offer.id].type.toUpperCase() + ' | ' + user.userid + ' | Offer #' + offer.id + ' Was Sent');
				
				callback(null, offer);
			});
		});
	});
}

function depositSteam_depositByGames(steamid, game, gameid, itemsid, offset, total_items, total_price, callback){
	if(gameid >= Object.keys(config.config_offers.steam.games).length) return callback(null, total_items, total_price);
	
	if(game != Object.keys(config.config_offers.steam.games)[gameid]) return depositSteam_depositByGames(steamid, game, gameid + 1, itemsid, offset, total_items, total_price, callback);
	
	getUserInventory(steamid, config.config_offers.steam.games[Object.keys(config.config_offers.steam.games)[gameid]].game.appid, config.config_offers.steam.games[Object.keys(config.config_offers.steam.games)[gameid]].game.contextid, false, function(err1, items){
		if(err1) return callback(new Error('We can\'t load your inventory.'));
		
		depositSteam_depositByItems(Object.keys(config.config_offers.steam.games)[gameid], items, 0, itemsid, offset, [], 0, function(err2, new_total_items, new_total_price){
			if(err2) return callback(err2);
			
			return depositSteam_depositByGames(steamid, game, gameid + 1, itemsid, offset, total_items.concat(new_total_items), getFormatAmount(total_price + new_total_price), callback);
		});
	});
}

function depositSteam_depositByItems(game, items, itemid, itemsid, offset, total_items, total_price, callback){
	if(items === undefined) return callback(null, total_items, total_price);
	
	if(items[itemid] === undefined) return callback(null, total_items, total_price);
	
	if(itemsid.filter(a => a.id == items[itemid].assetid.toString()).length <= 0) return depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
	
	var price = getFormatAmount(prices_getPrice(items[itemid].name, config.config_offers.steam.games[game].game.appid));
	if(price > 0) price = getFormatAmount(price + getFeeFromCommission(price, offset));
	
	/* -- ACCEPTING --*/
	
	var accepted = true;
	
	if(accepted) if(!items[itemid].marketable || !items[itemid].tradable) accepted = false;
	if(accepted) if(total_items.filter(a => a.id == itemid).length > 0) accepted = false;
	if(accepted) if(p2pStstem_items[items[itemid].assetid] !== undefined) if(p2pStstem_items[items[itemid].assetid] == true) accepted = false;
	if(accepted) if(price == null) accepted = false;
	if(accepted) if(price < config.config_site.interval_amount.deposit_skins.min) accepted = false;
	if(accepted) if(price <= 0) accepted = false;
	if(accepted) if(config.config_offers.steam.blacklist_items[game].filter(a => items[itemid].name.toLowerCase().indexOf(a.toLowerCase()) >= 0).length > 0) accepted = false;
	
	if(!accepted) return depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
		
	if(items[itemid].inspect && item_exteriors.includes(getInfosByItemName(items[itemid].name).exterior)){
		pool.query('SELECT `wear` FROM `steam_items` WHERE `itemid` = ' + pool.escape(items[itemid].assetid), function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset,
					'wear': row1[0].wear
				}), {}));
				total_price += price;
				
				return depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			}
			
			if(row1.length > 0){
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset,
					'wear': row1[0].wear
				}), {}));
				total_price += price;
				
				depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			} else {
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset
				}), {}));
				total_price += price;
				
				depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			}
		});
	} else {
		total_items.push(Object.assign(generateItem(items[itemid], {
			'price': price,
			'offset': offset
		}), {}));
		total_price += price;
		
		depositSteam_depositByItems(game, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
	}
}

function depositSteam_inventory(user, socket, method, game, offset){
	setUserRequest(user.userid, 'deposit', true, true);
	
	if(user.binds.steam === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Please bind your Steam Account!'
		});
		setUserRequest(user.userid, 'deposit', false, true);
		return;
	}
	
	if(!user.tradelink){
		socket.emit('message', {
			type: 'offers',
			command: 'error',
			error: 'Firstly, you must set your valid Steam Trade Link from settings.'
		});
		setUserRequest(user.userid, 'deposit', false, true);
		return;
	}
	
	if(config.config_offers.steam.games[game] === undefined){
		socket.emit('message', {
			type: 'offers',
			command: 'error',
			error: 'Invalid deposit game!'
		});
		setUserRequest(user.userid, 'deposit', false, true);
		return;
	}
	
	if(offers_inventoryDeposit[user.userid] !== undefined){
		if(offers_inventoryDeposit[user.userid][method + '_' + game] !== undefined){
			if(offers_inventoryDeposit[user.userid][method + '_' + game]['time'] - time() > 0){
				if(offers_inventoryDeposit[user.userid][method + '_' + game]['error']['have']){			
					socket.emit('message', {
						type: 'offers',
						command: 'error',
						error: offers_inventoryDeposit[user.userid][method + '_' + game]['error']['error']
					});
				} else {
					if(offers_inventoryDeposit[user.userid][method + '_' + game]['items'].length > 0){
						socket.emit('message', {
							type: 'offers',
							command: 'add_items',
							offer: {
								items: offers_inventoryDeposit[user.userid][method + '_' + game]['items'],
								paths: ['deposit', method, game],
								more: false
							}
						});
					} else {
						socket.emit('message', {
							type: 'offers',
							command: 'error',
							error: 'Your Inventory is currently empty.'
						});	
					}
				}
				
				socket.emit('message', {
					type: 'offers',
					command: 'wait',
					time: offers_inventoryDeposit[user.userid][method + '_' + game]['time'] - time()
				});
				
				setUserRequest(user.userid, 'deposit', false, false);
				return;
			}
		}
	} else {
		offers_inventoryDeposit[user.userid] = {};
	}
	
	depositSteam_inventoryByGames(user.userid, user.binds.steam, game, 0, offset, [], function(err1, total_items){
		if(err1){
			socket.emit('message', {
				type: 'offers',
				command: 'error',
				error: err1.message
			});
			
			offers_inventoryDeposit[user.userid][method + '_' + game] = {
				time: time() + config.config_offers.steam.cooldown_inventory,
				items: [],
				error: {
					have: true,
					error: err1.message
				}
			}
			
			socket.emit('message', {
				type: 'offers',
				command: 'wait',
				time: config.config_offers.steam.cooldown_inventory
			});
			
			setUserRequest(user.userid, 'deposit', false, false);
			return;
		}
		
		if(total_items.length > 0){			
			socket.emit('message', {
				type: 'offers',
				command: 'add_items',
				offer: {
					items: total_items,
					paths: ['deposit', method, game],
					more: false
				}
			});
		} else {
			socket.emit('message', {
				type: 'offers',
				command: 'error',
				error: 'Your Inventory is currently empty.'
			});	
		}
		
		offers_inventoryDeposit[user.userid][method + '_' + game] = {
			time: time() + config.config_offers.steam.cooldown_inventory,
			items: total_items,
			error: {
				have: false,
				error: ''
			}
		}
		
		socket.emit('message', {
			type: 'offers',
			command: 'wait',
			time: config.config_offers.steam.cooldown_inventory
		});
		
		setUserRequest(user.userid, 'deposit', false, false);
	});
}

function depositSteam_inventoryByGames(userid, steamid, game, gameid, offset, total_items, callback){
	if(gameid >= Object.keys(config.config_offers.steam.games).length) return callback(null, total_items);
	
	if(game != Object.keys(config.config_offers.steam.games)[gameid]) return depositSteam_inventoryByGames(userid, steamid, game, gameid + 1, offset, total_items, callback);
	
	getUserInventory(steamid, config.config_offers.steam.games[Object.keys(config.config_offers.steam.games)[gameid]].game.appid, config.config_offers.steam.games[Object.keys(config.config_offers.steam.games)[gameid]].game.contextid, false, function(err1, items){
		if(err1) return callback(new Error('We can\'t load your inventory.'));
		
		depositSteam_inventoryByItems(userid, steamid, Object.keys(config.config_offers.steam.games)[gameid], items, 0, offset, [], [], function(err2, new_total_items){
			if(err2) return callback(err2);
			
			return depositSteam_inventoryByGames(userid, steamid, game, gameid + 1, offset, total_items.concat(new_total_items), callback);
		});
	});
}

function depositSteam_inventoryByItems(userid, steamid, game, items, itemid, offset, total_items, inspect_items, callback){
	if(items[itemid] === undefined) {
		if(inspect_items.length > 0) {
			requestItemsFloat(userid, inspect_items, function(err1, new_items){
				if(!err1){
					new_items.forEach(function(item){
						pool.query('INSERT INTO `steam_items` SET `itemid` = ' + pool.escape(item.id) + ', `wear` = ' + parseFloat(item.wear) + ', `time` = ' + pool.escape(time()));
					});
				}
				
				callback(null, total_items.concat(new_items));
			});
		} else callback(null, total_items);
	} else {
		var price = getFormatAmount(prices_getPrice(items[itemid].name, config.config_offers.steam.games[game].game.appid));
		// if(price > 0) price = getFormatAmount(parseFloat(price + getFeeFromCommission(price, offset)));
		if(price > 0) price *= 0.9;

		var tradelocked = {
			tradelocked: false,
			time: null
		};
		
		if(items[itemid].tradelocked) {
			tradelocked = {
				tradelocked: true,
				time: items[itemid].tradelocked - time()
			}
		}
		
		/* -- ACCEPTING --*/
		
		var accepted = true;
		
		if(accepted) if(!tradelocked.tradelocked && (!items[itemid].marketable || !items[itemid].tradable)) accepted = false;
		if(accepted) if(total_items.filter(a => a.id == itemid).length > 0) accepted = false;
		if(accepted) if(p2pStstem_items[items[itemid].assetid] !== undefined) if(p2pStstem_items[items[itemid].assetid] == true) accepted = false;
		if(accepted) if(price == null) accepted = false;
		if(accepted) if(price < config.config_site.interval_amount.deposit_skins.min) accepted = false;
		if(accepted) if(price <= 0) accepted = false;
		if(accepted) if(accepted) if(config.config_offers.steam.blacklist_items[game].filter(a => items[itemid].name.toLowerCase().indexOf(a.toLowerCase()) >= 0).length > 0) accepted = false;
		
		if((!tradelocked.tradelocked && (!items[itemid].marketable || !items[itemid].tradable)) || price <= 0) return depositSteam_inventoryByItems(userid, steamid, game, items, itemid + 1, offset, total_items, inspect_items, callback);
			
		if(items[itemid].inspect && item_exteriors.includes(getInfosByItemName(items[itemid].name).exterior) && accepted && !tradelocked.tradelocked){
			pool.query('SELECT `wear` FROM `steam_items` WHERE `itemid` = ' + pool.escape(items[itemid].assetid), function(err1, row1) {
				if(err1) {
					logger.error(err1);
					writeError(err1);
					
					total_items.push(Object.assign(generateItem(items[itemid], {
						'price': price,
						'offset': offset
					}), {
						'inspect': items[itemid].inspect,
						'accepted': accepted,
						'tradelocked': tradelocked
					}));
					
					return depositSteam_inventoryByItems(userid, steamid, game, items, itemid + 1, offset, total_items, inspect_items, callback);
				}
				
				if(row1.length > 0){
					total_items.push(Object.assign(generateItem(items[itemid], {
						'price': price,
						'offset': offset,
						'wear': row1[0].wear
					}), {
						'inspect': items[itemid].inspect,
						'accepted': accepted,
						'tradelocked': tradelocked
					}));
					
					depositSteam_inventoryByItems(userid, steamid, game, items, itemid + 1, offset, total_items, inspect_items, callback);
				} else {
					inspect_items.push({
						item: Object.assign(generateItem(items[itemid], {
							'price': price,
							'offset': offset
						}), {
							'inspect': items[itemid].inspect,
							'accepted': accepted,
							'tradelocked': tradelocked
						}),
						inspect: {
							s: steamid,
							a: items[itemid].assetid,
							d: items[itemid].inspect.split('A' + items[itemid].assetid + 'D')[1]
						}
					});
					
					depositSteam_inventoryByItems(userid, steamid, game, items, itemid + 1, offset, total_items, inspect_items, callback)
				}
			});
		} else {
			total_items.push(Object.assign(generateItem(items[itemid], {
				'price': price,
				'offset': offset
			}), {
				'inspect': items[itemid].inspect,
				'accepted': accepted,
				'tradelocked': tradelocked
			}));
			
			depositSteam_inventoryByItems(userid, steamid, game, items, itemid + 1, offset, total_items, inspect_items, callback);
		}
	}
}

/* END DEPOSIT */

/* WITHDRAW */

offers_steamLoadBotItems();
function offers_steamLoadBotItems(){
	pool.query('SELECT `itemid`, `status` FROM `steam_inventory`', function(err1, items) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		items.forEach(function(item){
			if(offers_steamSiteInventory[item.itemid] === undefined) offers_steamSiteInventory[item.itemid] = (item.status) ? true : false;
		});
		
		logger.debug('[BOT] Items withdraw loaded!');
	});
}

function withdrawSteam_withdraw(user, socket, game, items, bot, recaptcha){
	setUserRequest(user.userid, 'withdraw', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'withdraw', false, true);
			return;
		}
		
		socket.emit('message', {
			type: 'info',
			info: 'Preparing withdraw Trade Offer. Please wait...'
		});
		
		withdrawSteam_confirmWithdraw(user, game, items, bot, function(err1, offer){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'withdraw', false, true);
				return;
			}
			
			//REMOVE ITEMS FROM WITHDRAW
			io.sockets.in(offers_steamActiveOffers[offer.id].user.userid).emit('message', {
				type: 'offers',
				command: 'remove_items',
				offer: {
					items: offers_steamActiveOffers[offer.id].items,
					paths: [offers_steamActiveOffers[offer.id].type, 'steam', game],
					all: false
				}
			});
			
			//ADD PENDING TO BUYER
			io.sockets.in(offers_steamActiveOffers[offer.id].user.userid).emit('message', {
				type: 'offers',
				command: 'add_pending',
				offer: {
					id: offers_steamActiveOffers[offer.id].id,
					type: offers_steamActiveOffers[offer.id].type,
					method: 'steam',
					status: offers_steamActiveOffers[offer.id].status,
					items: offers_steamActiveOffers[offer.id].items,
					data: {
						tradeofferid: offers_steamActiveOffers[offer.id].tradeofferid,
						code: offers_steamActiveOffers[offer.id].code
					}
				}
			});
			
			//EDIT ITEMS
			total_items.forEach(function(item){
				pool.query('UPDATE `steam_inventory` SET `status` = 1 WHERE `itemid` = ' + pool.escape(item.id) + ' AND `status` = 0', function(err5, row5) {
					if(err5) {
						logger.error(err5);
						writeError(err5);
						return;
					}
					
					if(row5.affectedRows > 0) if(offers_steamSiteInventory[item.id] !== undefined) offers_steamSiteInventory[item.id] = true;
				});
			});

			getBalance(user.userid);
							
			setUserRequest(user.userid, 'withdraw', false, false);
		});
	});
}

function withdrawSteam_confirmWithdraw(user, game, items, bot, callback){
	if(user.binds.steam === undefined) return callback(new Error('Please bind your Steam Account!'));
	
	if(user.restrictions.trade >= time() || user.restrictions.trade == -1) return callback(new Error('Error: You are restricted to use our trade. The restriction expires ' + ((user.restrictions.trade == -1) ? 'never' : makeDate(new Date(user.restrictions.trade * 1000))) + '.'));
	
	if(!user.verified > time()) return callback(new Error('Error: Your account is not verified. Please verify your account and try again.'));
	
	if(!user.tradelink) return callback(new Error('Error: Firstly, you must set your valid Steam Trade Link from settings.'));
		
	if(config.config_offers.steam.games[game] === undefined) return callback(new Error('Invalid withdraw game!'));
	
	if(items.length < config.config_site.interval_items.withdraw.min || items.length > config.config_site.interval_items.withdraw.max) return callback(new Error('Error: Invalid items amount [' + config.config_site.interval_items.withdraw.min + '-' + config.config_site.interval_items.withdraw.max + ']!'));
	
	withdrawSteam_withdrawByGames(game, 0, items, config.config_offers.steam.withdraw_offset, [], 0, function(err1, total_items, total_price){
		if(err1) return callback(new Error('Error: ' + err1.message));
			
		if(total_items.length != items.length) return callback(new Error('Error: Invalids items in your offer. Please refresh your inventory!'));
		
		if(total_price < config.config_site.interval_amount.withdraw_skins.min || total_price > config.config_site.interval_amount.withdraw_skins.max) return callback(new Error('Error: Invalid withdraw amount [' + getFormatAmountString(config.config_site.interval_amount.withdraw_skins.min) + '-' + getFormatAmountString(config.config_site.interval_amount.withdraw_skins.max)  + ']!'));
		
		if(user.deposit.count <= 0) return callback(new Error('Error: You need to deposit minimum 1 time to withdraw!'));
		
		if(getFormatAmount(user.available) < total_price) return callback(new Error('Error: You need to have withdraw available ' + getFormatAmountString(total_price) + ' coins. Need ' + getFormatAmountString(total_price - user.available) + '!'));
		
		if(getFormatAmount(user.balance) < total_price) return callback(new Error('Error: You don\'t have enough money!'));
		
		var offer_code = makeCode(6);
		var offer_message = config.config_site.name + ' | Withdraw | -' + getFormatAmountString(total_price) + ' coins | Code ' + offer_code;
		
		if(!haveActiveBots('trade')) return callback(new Error('Error: There are no active bots. Please try again later.'));
		
		var steam_bot = getBotByIndex(bot);
		
		offers_steamSendOffer(user.binds.steam, user.tradelink, offer_message, items, [], steam_bot.steamid, function(err2, offer){
			if(err2) return callback(new Error('Error: There was an error sending your trade offer. Please try again later.'));
			
			pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('steam_withdraw') + ', `amount` = ' + (-total_price) + ', `time` = ' + pool.escape(time()));
			pool.query('UPDATE `users` SET `balance` = `balance` - ' + total_price + ', `available` = `available` - ' + total_price + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3) {
				if(err3){
					logger.error(err3);
					writeError(err3);
					return callback(new Error('Error in sending your trade offer'));
				}
				
				pool.query('INSERT INTO `steam_transactions` SET `type` = ' + pool.escape('withdraw') + ', `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + pool.escape(user.xp) + ', `steamid` = ' + pool.escape(user.binds.steam) + ', `items` = ' + pool.escape(getSqlItems(total_items)) + ', `amount` = ' + total_price + ', `code` = ' + pool.escape(offer_code) + ', `game` = ' + pool.escape(game) + ', `tradeofferid` = ' + pool.escape(offer.id) + ', `botsteamid` = ' + pool.escape(steam_bot.steamid) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
					if(err4) {
						logger.error(err4);
						writeError(err4);
						return callback(new Error('Error in sending your trade offer'));
					}
					
					offers_steamActiveOffers[offer.id] = {
						id: row4.insertId,
						status: 0,
						type: 'withdraw',
						user: {
							userid: user.userid,
							name: user.name,
							avatar: user.avatar,
							level: calculateLevel(user.xp).level
						},
						game: game,
						items: total_items,
						amount: total_price,
						time_created: time(),
						tradeofferid: offer.id,
						code: offer_code,
						time: null,
						timeout: null
					};
					
					steam_bot.community.checkConfirmations();
					
					logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[offer.id].type.toUpperCase() + ' | ' + user.userid + ' | Offer #' + offer.id + ' Was Sent');
					
					callback(null, offer);
				});
			});
		});
	});
}

function withdrawSteam_withdrawByGames(game, gameid, itemsid, offset, total_items, total_price, callback) {
	if(gameid >= Object.keys(config.config_offers.steam.games).length) return callback(null, total_items, total_price);
	
	if(game != Object.keys(config.config_offers.steam.games)[gameid]) return withdrawSteam_withdrawByGames(game, gameid + 1, itemsid, offset, total_items, total_price, callback);
	
	withdrawSteam_withdrawByBots(Object.keys(config.config_offers.steam.games)[gameid], 0, itemsid, offset, [], 0, function(err1, new_total_items, new_total_price){
		if(err1) return callback(err1);
		
		 return withdrawSteam_withdrawByGames(game, gameid + 1, itemsid, offset, total_items.concat(new_total_items), getFormatAmount(total_price + new_total_price), callback);
	});
}

function withdrawSteam_withdrawByBots(game, bot, itemsid, offset, total_items, total_price, callback) {
	if(getBotByIndex(bot) === undefined) return callback(new Error('Error: Invalid bot. Please try again later.'));
	
	if(!getBotByIndex(bot).connected || !getBotByIndex(bot).can_trade || !getBotByIndex(bot).active) return callback(new Error('Error: The bot is no longer active. Please try again later.'));
	
	getUserInventory(getBotByIndex(bot).user._client.steamID, config.config_offers.steam.games[game].game.appid, config.config_offers.steam.games[game].game.contextid, false, function(err1, items){
		if(err1) return callback(new Error('We can\'t load shop inventory.'));
		
		withdrawSteam_withdrawByItems(game, bot, items, 0, itemsid, offset, [], 0, function(err2, new_total_items, new_total_price){
			if(err2) return callback(err2);
			
			return callback(null, total_items.concat(new_total_items), getFormatAmount(total_price + new_total_price));
		});
	});
}

function withdrawSteam_withdrawByItems(game, bot, items, itemid, itemsid, offset, total_items, total_price, callback){
	if(items[itemid] === undefined) return callback(null, total_items, total_price);
	
	if(itemsid.filter(a => a.id == items[itemid].assetid.toString()).length <= 0) return withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
	
	var price = getFormatAmount(prices_getPrice(items[itemid].name, config.config_offers.steam.games[game].game.appid));
	if(price > 0) price = getFormatAmount(parseFloat(price + getFeeFromCommission(price, offset)));
	
	/* -- ACCEPTING --*/
	
	var accepted = true;
	
	if(accepted) if(!items[itemid].marketable || !items[itemid].tradable) accepted = false;
	if(accepted) if(total_items.filter(a => a.id == itemid).length > 0) accepted = false;
	if(accepted) if(offers_steamSiteInventory[items[itemid].assetid] === undefined || offers_steamSiteInventory[items[itemid].assetid] == true) accepted = false;
	if(accepted) if(price == null) accepted = false;
	if(accepted) if(price < config.config_site.interval_amount.withdraw_skins.min) accepted = false;
	if(accepted) if(price <= 0) accepted = false;
	if(accepted) if(accepted) if(config.config_offers.steam.blacklist_items[game].filter(a => items[itemid].name.toLowerCase().indexOf(a.toLowerCase()) >= 0).length > 0) accepted = false;
	
	if(!accepted) return withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
		
	if(items[itemid].inspect && item_exteriors.includes(getInfosByItemName(items[itemid].name).exterior)){
		pool.query('SELECT steam_items.wear FROM `steam_items` INNER JOIN `steam_history` ON steam_items.itemid = steam_history.lastid WHERE steam_history.itemid = ' + parseInt(items[itemid].assetid), function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset
				}), {}));
				total_price += price;
				
				return withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			}
			
			if(row1.length > 0){
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset,
					'wear': row1[0].wear
				}), {}));
				total_price += price;
				
				withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			} else {
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset
				}), {}));
				total_price += price;
				
				withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
			}
		});
	} else {
		total_items.push(Object.assign(generateItem(items[itemid], {
			'price': price,
			'offset': offset
		}), {}));
		total_price += price;
		
		withdrawSteam_withdrawByItems(game, bot, items, itemid + 1, itemsid, offset, total_items, total_price, callback);
	}
}

function withdrawSteam_inventory(user, socket, method, game, offset){
	setUserRequest(user.userid, 'withdraw', true, true);
	
	if(config.config_offers.steam.games[game] === undefined){
		socket.emit('message', {
			type: 'offers',
			command: 'error',
			error: 'Invalid withdraw game!'
		});
		setUserRequest(user.userid, 'withdraw', false, true);
		return;
	}
	
	if(offers_inventoryWithdraw[user.userid] !== undefined){
		if(offers_inventoryWithdraw[user.userid][method + '_' + game] !== undefined){
			if(offers_inventoryWithdraw[user.userid][method + '_' + game]['time'] - time() > 0){
				if(offers_inventoryWithdraw[user.userid][method + '_' + game]['error']['have']){			
					socket.emit('message', {
						type: 'offers',
						command: 'error',
						error: offers_inventoryWithdraw[user.userid][method + '_' + game]['error']['error']
					});
				} else {
					if(offers_inventoryWithdraw[user.userid][method + '_' + game]['items'].length > 0){
						socket.emit('message', {
							type: 'offers',
							command: 'add_items',
							offer: {
								items: offers_inventoryWithdraw[user.userid][method + '_' + game]['items'],
								paths: ['withdraw', method, game],
								more: false
							}
						});
					} else {
						socket.emit('message', {
							type: 'offers',
							command: 'error',
							error: 'The Marketplace is currently empty.'
						});	
					}
				}
				
				socket.emit('message', {
					type: 'offers',
					command: 'wait',
					time: offers_inventoryWithdraw[user.userid][method + '_' + game]['time'] - time()
				});
				
				
				setUserRequest(user.userid, 'withdraw', false, false);
				return;
			}
		}
	} else {
		offers_inventoryWithdraw[user.userid] = {};
	}
	
	withdrawSteam_inventoryByGames(game, 0, offset, [], function(err1, total_items){
		if(err1){
			socket.emit('message', {
				type: 'offers',
				command: 'error',
				error: err1.message
			});
			
			offers_inventoryWithdraw[user.userid][method + '_' + game] = {
				time: time() + config.config_offers.steam.cooldown_inventory,
				items: [],
				error: {
					have: true,
					error: err1.message
				}
			};
			
			socket.emit('message', {
				type: 'offers',
				command: 'wait',
				time: config.config_offers.steam.cooldown_inventory
			});
			
			setUserRequest(user.userid, 'withdraw', false, false);
			return;
		}
		
		if(total_items.length > 0){
			socket.emit('message', {
				type: 'offers',
				command: 'add_items',
				offer: {
					items: total_items,
					paths: ['withdraw', method, game],
					more: false
				}
			});
		} else {
			socket.emit('message', {
				type: 'offers',
				command: 'error',
				error: 'The Marketplace is currently empty.'
			});	
		}
		
		offers_inventoryWithdraw[user.userid][method + '_' + game] = {
			time: time() + config.config_offers.steam.cooldown_inventory,
			items: total_items,
			error: {
				have: false,
				error: ''
			}
		};
		
		socket.emit('message', {
			type: 'offers',
			command: 'wait',
			time: config.config_offers.steam.cooldown_inventory
		});
		
		setUserRequest(user.userid, 'withdraw', false, false);
	});
}

function withdrawSteam_inventoryByGames(game, gameid, offset, total_items, callback) {
	if(gameid >= Object.keys(config.config_offers.steam.games).length) return callback(null, total_items);
	
	if(game != Object.keys(config.config_offers.steam.games)[gameid]) return withdrawSteam_inventoryByGames(game, gameid + 1, offset, total_items, callback);
	
	withdrawSteam_inventoryByBots(Object.keys(config.config_offers.steam.games)[gameid], 0, offset, [], function(err1, new_total_items){
		if(err1) return callback(err1);
		
		 return withdrawSteam_inventoryByGames(game, gameid + 1, offset, total_items.concat(new_total_items), callback)
	});
}

function withdrawSteam_inventoryByBots(game, bot, offset, total_items, callback) {
	if(getBotByIndex(bot) === undefined) return callback(null, total_items);
	
	if(!getBotByIndex(bot).connected || !getBotByIndex(bot).can_trade || !getBotByIndex(bot).active) return withdrawSteam_inventoryByBots(game, bot + 1, offset, total_items, callback);
	
	getUserInventory(getBotByIndex(bot).user._client.steamID, config.config_offers.steam.games[game].game.appid, config.config_offers.steam.games[game].game.contextid, false, function(err1, items){
		if(err1) return callback(new Error('We can\'t load shop inventory.'));
		
		withdrawSteam_inventoryByItems(game, bot, items, 0, offset, [], function(err2, new_total_items){
			if(err2) return callback(err2);
			
			return withdrawSteam_inventoryByBots(game, bot + 1, offset, total_items.concat(new_total_items), callback);
		});
	});
}

function withdrawSteam_inventoryByItems(game, bot, items, itemid, offset, total_items, callback){
	if(items[itemid] === undefined) return callback(null, total_items);
	
	var price = getFormatAmount(prices_getPrice(items[itemid].name, config.config_offers.steam.games[game].game.appid));
	if(price > 0) price = getFormatAmount(parseFloat(price + getFeeFromCommission(price, offset)));
	
	var tradelocked = {
		tradelocked: false,
		time: null
	};
	
	if(items[itemid].tradelocked) {
		tradelocked = {
			tradelocked: true,
			time: items[itemid].tradelocked - time()
		}
	}
	
	/* -- ACCEPTING --*/
	
	var accepted = true;
	
	if(accepted) if(!tradelocked.tradelocked && (!items[itemid].marketable || !items[itemid].tradable)) accepted = false;
	if(accepted) if(total_items.filter(a => a.id == itemid).length > 0) accepted = false;
	if(accepted) if(offers_steamSiteInventory[items[itemid].assetid] === undefined || offers_steamSiteInventory[items[itemid].assetid] == true) accepted = false;
	if(accepted) if(price == null) accepted = false;
	if(accepted) if(price < config.config_site.interval_amount.withdraw_skins.min) accepted = false;
	if(accepted) if(price <= 0) accepted = false;
	if(accepted) if(accepted) if(config.config_offers.steam.blacklist_items[game].filter(a => items[itemid].name.toLowerCase().indexOf(a.toLowerCase()) >= 0).length > 0) accepted = false;
	
	if(!accepted) return withdrawSteam_inventoryByItems(game, bot, items, itemid + 1, offset, total_items, callback);
		
	if(items[itemid].inspect && item_exteriors.includes(getInfosByItemName(items[itemid].name).exterior)){
		pool.query('SELECT steam_items.wear FROM `steam_items` INNER JOIN `steam_history` ON steam_items.itemid = steam_history.lastid WHERE steam_history.itemid = ' + parseInt(items[itemid].assetid), function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset
				}), {
					'inspect': items[itemid].inspect,
					'accepted': accepted,
					'tradelocked': tradelocked,
					'bot': bot
				}));
				
				return withdrawSteam_inventoryByItems(game, bot, items, itemid + 1, offset, total_items, callback);
			}
			
			if(row1.length > 0){
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset,
					'wear': row1[0].wear
				}), {
					'inspect': items[itemid].inspect,
					'accepted': accepted,
					'tradelocked': tradelocked,
					'bot': bot
				}));
				
				withdrawSteam_inventoryByItems(game, bot, items, itemid + 1, offset, total_items, callback);
			} else {
				total_items.push(Object.assign(generateItem(items[itemid], {
					'price': price,
					'offset': offset
				}), {
					'inspect': items[itemid].inspect,
					'accepted': accepted,
					'tradelocked': tradelocked,
					'bot': bot
				}));
				
				withdrawSteam_inventoryByItems(game, bot, items, itemid + 1, offset, total_items, callback);
			}
		});
	} else {
		total_items.push(Object.assign(generateItem(items[itemid], {
			'price': price,
			'offset': offset
		}), {
			'inspect': items[itemid].inspect,
			'accepted': accepted,
			'tradelocked': tradelocked,
			'bot': bot
		}));
		
		withdrawSteam_inventoryByItems(game, bot, items, itemid + 1, offset, total_items, callback);
	}
}

/* END WITHDRAW */
