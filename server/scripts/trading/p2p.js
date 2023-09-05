var p2pSystem_listings = {};
var p2pStstem_items = {};

//https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=E3C398164DF5CB0FD0F35E8E3E16568B&get_sent_offers=1&active_only=0&get_descriptions=1&language=en
//https://api.steampowered.com/IEconService/GetTradeOffer/v1?key=E3C398164DF5CB0FD0F35E8E3E16568B&tradeofferid=4446971641&language=en

var is_start_tracking = false;
var is_tracking = false;

p2pSystem_checkTracking();
p2pSystem_load();

function p2pSystem_load(){
	pool.query('SELECT * FROM `p2p_transactions` WHERE `status` IN (0, 1, 2, 3)', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		row1.forEach(function(item){
			var total_items = getItemsFromSql(item.items);
			var total_price = getFormatAmount(item.amount);
			
			total_items.forEach(function(item){
				if(p2pStstem_items[item.id] === undefined) p2pStstem_items[item.id] = true;
			});
			
			p2pSystem_listings[item.id] = {
				id: item.id,
				status: item.status,
				seller: {
					user: {
						userid: item.userid,
						name: item.name,
						avatar: item.avatar,
						level: calculateLevel(item.xp).level
					},
					steamid: item.steamid,
					apikey: item.apikey,
					tradelink: item.tradelink
				},
				buyer: {},
				game: item.game,
				items: total_items,
				amount: total_price,
				time_created: item.time,
				tradeofferid: item.tradeofferid || null,
				time: null,
				timeout: null
			};
			
			if(item.status == 1 || item.status == 2 || item.status == 3) p2pSystem_listings[item.id].time = time();
			if(item.status == 1) {
				p2pSystem_listings[item.id].timeout = setTimeout(function(){
					p2pSystem_cancelConfirm(item.id);
				}, config.config_offers.p2p.timer_confirm * 1000);
			} else if(item.status == 2) {
				p2pSystem_listings[item.id].timeout = setTimeout(function(){
					p2pSystem_cancelBuyer(item.id);
				}, config.config_offers.p2p.timer_send * 1000);
			}
			
			if(item.status != 0) {
				pool.query('SELECT * FROM `p2p_buyers` WHERE `offerid` = ' + pool.escape(item.id) + ' AND `canceled` = 0', function(err2, row2) {
					if(err2) {
						logger.error(err2);
						writeError(err2);
						return;
					}
					
					if(row2.length > 0){
						p2pSystem_listings[item.id].buyer = {
							user: {
								userid: row2[0].userid,
								name: row2[0].name,
								avatar: row2[0].avatar,
								level: calculateLevel(row2[0].xp).level
							},
							steamid: row2[0].steamid,
							apikey: row2[0].apikey,
							tradelink: row2[0].tradelink
						};
					}
				});
			}
		});
	});
}

function p2pSystem_cancelConfirm(id){
	pool.query('UPDATE `p2p_transactions` SET `status` = 0 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 1', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.affectedRows > 0){
			pool.query('UPDATE `p2p_buyers` SET `canceled` = 1 WHERE `offerid` = ' + pool.escape(id) + ' AND `canceled` = 0', function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.affectedRows > 0){
					var amount = getFormatAmount(p2pSystem_listings[id].amount);
												
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid) + ', `service` = ' + pool.escape('p2p_withdraw_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid), function(err3) {
						if(err3) {
							logger.error(err3);
							writeError(err3);
							return;
						}
						
						getBalance(p2pSystem_listings[id].buyer.user.userid);
						
						io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
							type: 'success',
							success: 'The P2P deposit #' + id + ' was successfully canceled. Reason: Seller did not confirm the bought.'
						});
						
						io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
							type: 'success',
							success: 'The P2P withdraw #' + id + ' was successfully canceled. Reason: Seller did not confirm the bought.'
						});
						
						if(p2pSystem_listings[id] !== undefined) {
							if(p2pSystem_listings[id].timeout != null) clearTimeout(p2pSystem_listings[id].timeout);
							
							p2pSystem_listings[id].status = 0;
							p2pSystem_listings[id].time = null;
							p2pSystem_listings[id].timeout = null;
						
							//ADD ITEMS TO WITHDRAW
							io.sockets.emit('message', {
								type: 'offers',
								command: 'add_items',
								offer: {
									items: [{
										id: p2pSystem_listings[id].id,
										items: p2pSystem_listings[id].items,
										amount: p2pSystem_listings[id].amount,
										time: p2pSystem_listings[id].time_created,
										game: p2pSystem_listings[id].game
									}],
									paths: ['withdraw', 'p2p', p2pSystem_listings[id].game],
									more: true
								}
							});
							
							//REMOVE ITEMS FROM DEPOSIT
							io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
								type: 'offers',
								command: 'remove_items',
								offer: {
									items: p2pSystem_listings[id].items,
									paths: ['deposit', 'p2p', p2pSystem_listings[id].game],
									all: false
								}
							});
							
							//EDIT PENDING FROM SELLER
							io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: p2pSystem_listings[id].id,
									type: 'deposit',
									method: 'p2p',
									status: p2pSystem_listings[id].status,
									items: p2pSystem_listings[id].items,
									data: {
										time: p2pSystem_listings[id].time_created
									}
								}
							});
							
							//EDIT PENDING FROM	BUYER
							io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: p2pSystem_listings[id].id,
									type: 'withdraw',
									method: 'p2p',
									status: p2pSystem_listings[id].status,
									items: p2pSystem_listings[id].items,
									data: {}
								}
							});
						}
					});
				}
			})
		}
	});
}

function p2pSystem_cancelBuyer(id){
	pool.query('UPDATE `p2p_transactions` SET `status` = -1 WHERE `id` = ' + pool.escape(id) + ' AND (`status` = 2 OR `status` = 3)', function(err1, row1) {
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.affectedRows > 0){
			pool.query('UPDATE `p2p_buyers` SET `canceled` = 1 WHERE `offerid` = ' + pool.escape(id) + ' AND `canceled` = 0', function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.affectedRows > 0){
					var amount = getFormatAmount(p2pSystem_listings[id].amount);
												
					pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid) + ', `service` = ' + pool.escape('p2p_withdraw_refund') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
					pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid), function(err3) {
						if(err3) {
							logger.error(err3);
							writeError(err3);
							return;
						}
						
						getBalance(p2pSystem_listings[id].buyer.user.userid);
						
						io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
							type: 'success',
							success: 'The P2P deposit #' + id + ' was successfully canceled. Reason: Seller did not sent the items.'
						});
						
						io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
							type: 'success',
							success: 'The P2P withdraw #' + id + ' was successfully canceled. Reason: Seller did not sent the items.'
						});
						
						if(p2pSystem_listings[id] !== undefined) {
							if(p2pSystem_listings[id].timeout != null) clearTimeout(p2pSystem_listings[id].timeout);
							
							p2pSystem_listings[id].status = -1;
							p2pSystem_listings[id].time = null;
							p2pSystem_listings[id].timeout = null;
						
							//REMOVE ITEMS FROM WITHDRAW
							io.sockets.emit('message', {
								type: 'offers',
								command: 'remove_items',
								offer: {
									items: [{
										id: p2pSystem_listings[id].id
									}],
									paths: ['withdraw', 'p2p', p2pSystem_listings[id].game],
									all: false
								}
							});
							
							//ADD ITEMS TO DEPOSIT
							io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
								type: 'offers',
								command: 'add_items',
								offer: {
									items: offers_assignItemsType(p2pSystem_listings[id].items, { type: 'deposit', method: 'p2p', game: p2pSystem_listings[id].game, tradelocked: false, offset: false }),
									paths: ['deposit', 'p2p', p2pSystem_listings[id].game],
									more: true
								}
							});
							
							//EDIT PENDING FROM SELLER
							io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: p2pSystem_listings[id].id,
									type: 'deposit',
									method: 'p2p',
									status: p2pSystem_listings[id].status,
									items: p2pSystem_listings[id].items,
									data: {}
								}
							});
							
							//EDIT PENDING FROM BUYER
							io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: p2pSystem_listings[id].id,
									type: 'withdraw',
									method: 'p2p',
									status: p2pSystem_listings[id].status,
									items: p2pSystem_listings[id].items,
									data: {}
								}
							});
							
							//REMOVE ITEMS BLACKLIST
							p2pSystem_listings[id].items.forEach(function(item){
								delete p2pStstem_items[item.id];
							});
							
							setTimeout(function(){
								if(p2pSystem_listings[id] !== undefined){
									//REMOVE PENDING FROM SELLER
									io.sockets.in(p2pSystem_listings[id].seller.user.buyer).emit('message', {
										type: 'offers',
										command: 'remove_pending',
										offer: {
											id: p2pSystem_listings[id].id,
											method: 'p2p'
										}
									});
									
									//REMOVE PENDING FROM BUYER
									io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
										type: 'offers',
										command: 'remove_pending',
										offer: {
											id: p2pSystem_listings[id].id,
											method: 'p2p'
										}
									});
									
									//REMOVE LISTING
									delete p2pSystem_listings[id];
								}
							}, config.config_offers.steam.time_remove_pending * 1000);
						}
					});
				}
			})
		}
	});
}

function p2pSystem_checkTracking(){
	if(is_start_tracking) return;
	
	is_start_tracking = true;
	
	setInterval(function(){
		if(!is_tracking) {
			//logger.debug('[P2P] Tracking offers');
			
			p2pSystem_tracking();
		} else logger.debug('[P2P] Still tracking offers');
	}, 1000);
}

async function p2pSystem_tracking(){
	is_tracking = true;
	
	var props = Object.keys(p2pSystem_listings);
	
	for(var i = 0; i < props.length; i++) await p2pSystem_trackOffer(props[i]);
	
	is_tracking = false;
}

function p2pSystem_trackOffer(id){
  	return new Promise(function(resolve, reject) {
		if(p2pSystem_listings[id] === undefined) return resolve();
		if(p2pSystem_listings[id].status != 2 && p2pSystem_listings[id].status != 3) return resolve();
		
		check_user_offers(p2pSystem_listings[id].seller.apikey, p2pSystem_listings[id].buyer.tradelink, 'sent', function(err1, success1){
			if(err1) return resolve();
			if(success1) return resolve();
			
			check_user_offers(p2pSystem_listings[id].buyer.apikey, p2pSystem_listings[id].seller.tradelink, 'received', function(err2, success2){
				if(err2) return resolve();
				
				return resolve();
			});
		});
		
		function check_user_offers(apikey, tradelink, type, callback){
			if(type == 'sent') var options = 'https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=' + apikey + '&get_sent_offers=1&active_only=0';
			else if(type == 'received') var options = 'https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=' + apikey + '&get_received_offers=1&active_only=0';
			
			request(options, function(err1, response1, body1) {
				if(err1) return callback(true);
			
				if(!response1) return callback(true);
				if(response1.statusCode != 200) return callback(true);
				if(!isJsonString(body1)) return callback(true);
			
				var body = JSON.parse(body1);
				
				if(type == 'sent') var user_offers = body.response.trade_offers_sent;
				else if(type == 'received') var user_offers = body.response.trade_offers_received;
				
				var partenerid = tradelink.split('partner=')[1].split('&token=')[0];
				
				var offers = user_offers.filter(a => a.time_created >= p2pSystem_listings[id].time_created).sort(function(a, b){ return b.time_created - a.time_created }).filter(a => a.accountid_other == partenerid);
				
				var any_trade_found = false;
				for(var i = 0; i < offers.length; i++){
					var trade_found = true;
						
					var items = [];
					if(type == 'sent'){
						offers[i].items_to_give.forEach(function(item){
							items.push(item.assetid.toString());
						});
					} else if(type == 'received'){
						offers[i].items_to_receive.forEach(function(item){
							items.push(item.assetid.toString());
						});
					}
						
					p2pSystem_listings[id].items.forEach(function(item){
						if(!items.includes(item.id.toString())) trade_found = false;
					});
					
					if(trade_found) {
						any_trade_found = true;
						
						if(offers[i].trade_offer_state == 2 && p2pSystem_listings[id].status == 2) {
							logger.debug('[P2P] Tracking seccessfully. Offer #' + id + ' found Trade #' + offers[i].tradeofferid);
							
							pool.query('UPDATE `p2p_transactions` SET `status` = 3, `tradeofferid` = ' + pool.escape(offers[i].tradeofferid) + ' WHERE `id` = ' + pool.escape(id) + ' AND `status` = 2', function(err2, row2) {
								if(err2) return callback(true);
								if(row2.affectedRows <= 0) return callback(true);
										
								/**/
								
								if(p2pSystem_listings[id].timeout != null) clearTimeout(p2pSystem_listings[id].timeout);
								
								p2pSystem_listings[id].status = 3;
								p2pSystem_listings[id].tradeofferid = offers[i].tradeofferid;
								
								//EDIT PENDING FROM SELLER
								io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
									type: 'offers',
									command: 'edit_pending',
									offer: {
										id: p2pSystem_listings[id].id,
										type: 'deposit',
										method: 'p2p',
										status: p2pSystem_listings[id].status,
										items: p2pSystem_listings[id].items,
										data: {
											time: p2pSystem_listings[id].time + config.config_offers.p2p.timer_send,
											user: p2pSystem_listings[id].buyer.user,
											steamid: p2pSystem_listings[id].buyer.steamid,
											tradelink: p2pSystem_listings[id].buyer.tradelink
										}
									}
								});
								
								//EDIT PENDING FROM BUYER
								io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
									type: 'offers',
									command: 'edit_pending',
									offer: {
										id: p2pSystem_listings[id].id,
										type: 'withdraw',
										method: 'p2p',
										status: p2pSystem_listings[id].status,
										items: p2pSystem_listings[id].items,
										data: {
											time: p2pSystem_listings[id].time + config.config_offers.p2p.timer_send,
											tradeoffer: 'https://steamcommunity.com/tradeoffer/' + p2pSystem_listings[id].tradeofferid
										}
									}
								});
								
								/**/
							});
						} else if(offers[i].trade_offer_state == 3 && (p2pSystem_listings[id].status == 2 || p2pSystem_listings[id].status == 3)) {
							logger.debug('[P2P] Tracking seccessfully. Offer #' + id + ' found Trade #' + offers[i].tradeofferid);
							
							var amount = getFormatAmount(p2pSystem_listings[id].amount);
							
							pool.query('UPDATE `p2p_transactions` SET `status` = 4, `tradeofferid` = ' + pool.escape(offers[i].tradeofferid) + ' WHERE `id` = ' + pool.escape(id) + ' AND (`status` = 2 OR `status` = 3)', function(err2, row2) {
								if(err2) return callback(true);
								if(row2.affectedRows <= 0) return callback(true);
								
								pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' `deposit_count` = `deposit_count` + 1, `deposit_total` = `deposit_total` + ' + amount + ' WHERE `userid` = ' + pool.escape(p2pSystem_listings[id].seller.user.userid), function(err3) {
									if(err3) return callback(true);
									
									pool.query('UPDATE `users` SET `withdraw_count` = `withdraw_count` + 1, `withdraw_total` = `withdraw_total` + ' + amount + ' WHERE `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid), function(err4) {
										if(err4) return callback(true);
										
										//AFFILIATES
										pool.query('SELECT COALESCE(SUM(referral_deposited.amount), 0) AS `amount`, referral_uses.referral FROM `referral_uses` LEFT JOIN `referral_deposited` ON referral_uses.referral = referral_deposited.referral WHERE referral_uses.userid = ' + pool.escape(p2pSystem_listings[id].seller.user.userid) + ' GROUP BY referral_uses.referral', function(err5, row5) {
											if(err5) return callback(true);
											
											if(row5.length > 0) {
												var commission_deposit = getFeeFromCommission(amount, getAffiliateCommission(getFormatAmount(row5[0].amount), 'deposit'));
												
												pool.query('INSERT INTO `referral_deposited` SET `userid` = ' + pool.escape(p2pSystem_listings[id].seller.user.userid) + ', `referral` = ' + pool.escape(row5[0].referral) + ', `amount` = ' + amount + ', `commission` = ' + commission_deposit + ', `time` = ' + pool.escape(time()));
												pool.query('UPDATE `referral_codes` SET `available` = `available` + ' + commission_deposit + ' WHERE `userid` = ' + pool.escape(row5[0].referral));
											}
								
											pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape("deposit") + ', `method` = ' + pool.escape("p2p") + ', `game` = ' + pool.escape(p2pSystem_listings[id].game) + ', `userid` = ' + pool.escape(p2pSystem_listings[id].seller.user.userid) + ', `amount` = ' + amount + ', `value` = ' + amount + ', `id_transaction` = ' + pool.escape(p2pSystem_listings[id].id) + ', `time` = ' + pool.escape(time()), function(err6){
												if(err6) return callback(true);
												
												var offerToAdd_seller = {
													type: 'deposit',
													method: 'crypto',
													game: p2pSystem_listings[id].game,
													user: p2pSystem_listings[id].seller.user,
													amount: amount,
													time: time()
												};
												
												if(offers_history.length >= 20) offers_history.shift();
												offers_history.push(offerToAdd_seller);
												
												io.sockets.emit('message', {
													type: 'offers',
													command: 'last_offer',
													offer: offerToAdd_seller
												});
												
												pool.query('INSERT INTO `users_trades` SET `type` = ' + pool.escape("withdraw") + ', `method` = ' + pool.escape("p2p") + ', `game` = ' + pool.escape(p2pSystem_listings[id].game) + ', `userid` = ' + pool.escape(p2pSystem_listings[id].buyer.user.userid) + ', `amount` = ' + amount + ', `value` = ' + amount + ', `id_transaction` = ' + pool.escape(p2pSystem_listings[id].id) + ', `time` = ' + pool.escape(time()), function(err7){
													if(err7) return callback(true);
													
													var offerToAdd_buyer = {
														type: 'withdraw',
														method: 'crypto',
														game: p2pSystem_listings[id].game,
														user: p2pSystem_listings[id].buyer.user,
														amount: amount,
														time: time()
													};
													
													if(offers_history.length >= 20) offers_history.shift();
													offers_history.push(offerToAdd_buyer);
													
													io.sockets.emit('message', {
														type: 'offers',
														command: 'last_offer',
														offer: offerToAdd_buyer
													});
													
													/**/
													
													if(p2pSystem_listings[id].timeout != null) clearTimeout(p2pSystem_listings[id].timeout);
											
													p2pSystem_listings[id].status = 4;
													p2pSystem_listings[id].tradeofferid = offers[i].tradeofferid;
													
													//EDIT PENDING FROM SELLER
													io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
														type: 'offers',
														command: 'edit_pending',
														offer: {
															id: p2pSystem_listings[id].id,
															type: 'deposit',
															method: 'p2p',
															status: p2pSystem_listings[id].status,
															items: p2pSystem_listings[id].items,
															data: {}
														}
													});
													
													//EDIT PENDING FROM BUYER
													io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
														type: 'offers',
														command: 'edit_pending',
														offer: {
															id: p2pSystem_listings[id].id,
															type: 'withdraw',
															method: 'p2p',
															status: p2pSystem_listings[id].status,
															items: p2pSystem_listings[id].items,
															data: {}
														}
													});
													
													//REMOVE ITEMS BLACKLIST
													p2pSystem_listings[id].items.forEach(function(item){
														delete p2pStstem_items[item.id];
													});
													
													setTimeout(function(){
														if(p2pSystem_listings[id] !== undefined){
															//REMOVE PENDING FROM SELLER
															io.sockets.in(p2pSystem_listings[id].seller.user.buyer).emit('message', {
																type: 'offers',
																command: 'remove_pending',
																offer: {
																	id: p2pSystem_listings[id].id,
																	method: 'p2p'
																}
															});
															
															//REMOVE PENDING FROM BUYER
															io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
																type: 'offers',
																command: 'remove_pending',
																offer: {
																	id: p2pSystem_listings[id].id,
																	method: 'p2p'
																}
															});
															
															//REMOVE LISTING
															delete p2pSystem_listings[id];
														}
													}, config.config_offers.steam.time_remove_pending * 1000);
												});
											});
										});
									});
								});
							});
						} else if(offers[i].trade_offer_state != 2 && offers[i].trade_offer_state != 9) {
							logger.debug('[P2P] Tracking seccessfully. Offer #' + id + ' found Trade #' + offers[i].tradeofferid);
							
							p2pSystem_cancelBuyer(id);
						}
						
						break;
					}
				}
				
				callback(false, any_trade_found);
			});
		}
	});
}

function p2pSystem_getListings(user, socket, game){
	setUserRequest(user.userid, 'p2p', true, true);
	
	var listings = [];
	
	var listings_props = Object.keys(p2pSystem_listings).filter(a => p2pSystem_listings[a].game == game);
	listings_props.forEach(function(key){
		var accepted = true;
		
		if(p2pSystem_listings[key].status != 0) accepted = false;
			
		if(accepted){
			listings.push({
				id: p2pSystem_listings[key].id,
				items: p2pSystem_listings[key].items,
				amount: p2pSystem_listings[key].amount,
				time: p2pSystem_listings[key].time_created,
				game: p2pSystem_listings[key].game
			});
		}
	});
	
	if(listings.length == 0){
		socket.emit('message', {
			type: 'offers',
			command: 'error',
			error: 'The Marketplace is currently empty.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	socket.emit('message', {
		type: 'offers',
		command: 'add_items',
		offer: {
			items: listings,
			paths: ['withdraw', 'p2p', game],
			more: false
		}
	});
	
	setUserRequest(user.userid, 'p2p', false, false);
}

function p2pSystem_listingBundle(user, socket, items, offset, game, recaptcha){
	setUserRequest(user.userid, 'p2p', true, true);
	
	if(user.binds.steam === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Please bind your Steam Account!'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(user.restrictions.trade >= time() || user.restrictions.trade == -1){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You are restricted to use our trade. The restriction expires ' + ((user.restrictions.trade == -1) ? 'never' : makeDate(new Date(user.restrictions.trade * 1000))) + '.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(user.exclusion > time()){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your exclusion expires ' + makeDate(new Date(user.exclusion * 1000)) + '.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(!user.tradelink){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Firstly, you must set your valid Steam Trade Link from settings.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(!user.apikey){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Firstly, you must set your valid Steam API Key from settings.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'p2p', false, true);
			return;
		}
		
		socket.emit('message', {
			type: 'info',
			info: 'Processing your Apikey verify!'
		});
		
		offers_verifyApikey(user, user.apikey, function(err1){
			if(err1) {
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			socket.emit('message', {
				type: 'info',
				info: 'Your Api Key does meet all conditions!'
			});
			
			if(config.config_offers.steam.games[game] === undefined){
				socket.emit('message', {
					type: 'error',
					error: 'Invalid deposit game!'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(isNaN(Number(offset))){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid offset!'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			offset = parseInt(offset);
		
			if(offset < -10 || offset > 10){
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid offset [-10 - 10]!'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(items.length < config.config_site.interval_items.p2p.min || items.length > config.config_site.interval_items.p2p.max) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Invalid items amount [' + config.config_site.interval_items.p2p.min + '-' + config.config_site.interval_items.p2p.max + ']!'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			depositSteam_depositByGames(user.binds.steam, game, 0, items, offset, [], 0, function(err2, total_items, total_price){
				if(err2) {
					socket.emit('message', {
						type: 'error',
						error: err2.message
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				if(total_items.length != items.length){
					socket.emit('message', {
						type: 'error',
						error: 'Error: Invalids items in your offer. Please refresh your inventory!'
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				if(total_price < config.config_site.interval_amount.deposit_p2p.min || total_price > config.config_site.interval_amount.deposit_p2p.max) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: Invalid deposit amount [' + getFormatAmountString(config.config_site.interval_amount.deposit_p2p.min) + '-' + getFormatAmountString(config.config_site.interval_amount.deposit_p2p.max)  + ']!'
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				/**/
				
				pool.query('INSERT INTO `p2p_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + pool.escape(user.xp) + ', `steamid` = ' + pool.escape(user.binds.steam) + ', `apikey` = ' + pool.escape(user.apikey) + ', `tradelink` = ' + pool.escape(user.tradelink) + ', `items` = ' + pool.escape(getSqlItems(total_items)) + ', `amount` = ' + total_price + ', `game` = ' + pool.escape(game) + ', `time` = ' + pool.escape(time()), function(err3, row3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						setUserRequest(user.userid, 'p2p', false, true);
						return;
					}
					
					if(row3.affectedRows <= 0) {
						socket.emit('message', {
							type: 'error',
							error: 'Error: Cannot create the offer.'
						});
						setUserRequest(user.userid, 'p2p', false, true);
						return;
					}
					
					total_items.forEach(function(item){
						if(p2pStstem_items[item.id] === undefined) p2pStstem_items[item.id] = true;
					});
					
					p2pSystem_listings[row3.insertId] = {
						id: row3.insertId,
						status: 0,
						seller: {
							user: {
								userid: user.userid,
								name: user.name,
								avatar: user.avatar,
								level: calculateLevel(user.xp).level
							},
							steamid: user.binds.steam,
							apikey: user.apikey,
							tradelink: user.tradelink
						},
						buyer: {},
						game: game,
						items: total_items,
						amount: total_price,
						time_created: time(),
						tradeofferid: null,
						time: null,
						timeout: null
					};
					
					socket.emit('message', {
						type: 'success',
						success: 'The P2P deposit #' + row3.insertId + ' was successfully listed.'
					});
					
					//ADD ITEMS TO WITHDRAW
					io.sockets.emit('message', {
						type: 'offers',
						command: 'add_items',
						offer: {
							items: [{
								id: p2pSystem_listings[row3.insertId].id,
								items: p2pSystem_listings[row3.insertId].items,
								amount: p2pSystem_listings[row3.insertId].amount,
								time: p2pSystem_listings[row3.insertId].time_created,
								game: p2pSystem_listings[row3.insertId].game
							}],
							paths: ['withdraw', 'p2p', p2pSystem_listings[row3.insertId].game],
							more: true
						}
					});
					
					//REMOVE ITEMS FROM DEPOSIT
					io.sockets.in(p2pSystem_listings[row3.insertId].seller.user.userid).emit('message', {
						type: 'offers',
						command: 'remove_items',
						offer: {
							items: p2pSystem_listings[row3.insertId].items,
							paths: ['deposit', 'p2p', p2pSystem_listings[row3.insertId].game],
							all: false
						}
					});
					
					//EDIT PENDING FROM SELLER
					io.sockets.in(p2pSystem_listings[row3.insertId].seller.user.userid).emit('message', {
						type: 'offers',
						command: 'add_pending',
						offer: {
							id: p2pSystem_listings[row3.insertId].id,
							type: 'deposit',
							method: 'p2p',
							status: p2pSystem_listings[row3.insertId].status,
							items: p2pSystem_listings[row3.insertId].items,
							data: {
								time: p2pSystem_listings[row3.insertId].time_created
							}
						}
					});
					
					setUserRequest(user.userid, 'p2p', false, false);
				});
				
				/**/
				
			});
		});
	});
}

function p2pSystem_cancelBundle(user, socket, id, recaptcha){
	setUserRequest(user.userid, 'p2p', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'p2p', false, true);
			return;
		}
		
		/**/
		
		pool.query('SELECT * FROM `p2p_transactions` WHERE `id` = ' + pool.escape(id) + ' AND `status` = 0', function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(row1.length <= 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be canceled.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
		
			if(p2pSystem_listings[id] === undefined) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be canceled.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(p2pSystem_listings[id].status != 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be canceled.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			pool.query('UPDATE `p2p_transactions` SET `status` = -1 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 0', function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				if(row2.affectedRows <= 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: This P2P deposit can\'t be canceled.'
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				p2pSystem_listings[id].status = -1;
				
				socket.emit('message', {
					type: 'success',
					success: 'The P2P deposit #' + id + ' was successfully canceled.'
				});
				
				//REMOVE ITEMS FROM WITHDRAW
				io.sockets.emit('message', {
					type: 'offers',
					command: 'remove_items',
					offer: {
						items: [{
							id: p2pSystem_listings[id].id
						}],
						paths: ['withdraw', 'p2p', p2pSystem_listings[id].game],
						all: false
					}
				});
				
				//ADD ITEMS TO DEPOSIT
				io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
					type: 'offers',
					command: 'add_items',
					offer: {
						items: offers_assignItemsType(p2pSystem_listings[id].items, { type: 'deposit', method: 'p2p', game: p2pSystem_listings[id].game, tradelocked: false, offset: false }),
						paths: ['deposit', 'p2p', p2pSystem_listings[id].game],
						more: true
					}
				});
				
				//EDIT PENDING FROM SELLER
				io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
					type: 'offers',
					command: 'edit_pending',
					offer: {
						id: p2pSystem_listings[id].id,
						type: 'deposit',
						method: 'p2p',
						status: p2pSystem_listings[id].status,
						items: p2pSystem_listings[id].items,
						data: {}
					}
				});
				
				//REMOVE ITEMS BLACKLIST
				p2pSystem_listings[id].items.forEach(function(item){
					delete p2pStstem_items[item.id];
				});
				
				setTimeout(function(){
					if(p2pSystem_listings[id] !== undefined){
						//REMOVE PENDING FROM SELLER
						io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
							type: 'offers',
							command: 'remove_pending',
							offer: {
								id: p2pSystem_listings[id].id,
								method: 'p2p'
							}
						});
						
						//REMOVE LISTING
						delete p2pSystem_listings[id];
					}
				}, config.config_offers.steam.time_remove_pending * 1000);
				
				setUserRequest(user.userid, 'p2p', false, false);
			});
		});
		
		/**/
		
	});
}

function p2pSystem_buyBundle(user, socket, steamid, items, recaptcha){
	setUserRequest(user.userid, 'p2p', true, true);
	
	if(user.binds.steam === undefined) {
		socket.emit('message', {
			type: 'error',
			error: 'Please bind your Steam Account!'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(user.restrictions.trade >= time() || user.restrictions.trade == -1){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You are restricted to use our trade. The restriction expires ' + ((user.restrictions.trade == -1) ? 'never' : makeDate(new Date(user.restrictions.trade * 1000))) + '.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(!user.verified > time()){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Your account is not verified. Please verify your account and try again.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(!user.tradelink){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Firstly, you must set your valid Steam Trade Link from settings.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	if(!user.apikey){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Firstly, you must set your valid Steam API Key from settings.'
		});
		setUserRequest(user.userid, 'p2p', false, true);
		return;
	}
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'p2p', false, true);
			return;
		}
		
		if(items.length <= 0 || items.length > 1){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You need to withdraw only 1 bundle!'
			});
			setUserRequest(user.userid, 'p2p', false, true);
			return;
		}
		
		/**/
		
		pool.query('SELECT * FROM `p2p_transactions` WHERE `id` = ' + pool.escape(items[0].id) + ' AND `status` = 0', function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(row1.length <= 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be bought.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
		
			if(p2pSystem_listings[items[0].id] === undefined) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be bought.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(p2pSystem_listings[items[0].id].status != 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be bought.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(row1[0].userid == user.userid){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You can\'t buy your P2P offer.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			socket.emit('message', {
				type: 'info',
				info: 'Processing your Apikey verify!'
			});
			
			offers_verifyApikey(user, user.apikey, function(err2){
				if(err2) {
					socket.emit('message', {
						type: 'error',
						error: err2.message
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				socket.emit('message', {
					type: 'info',
					info: 'Your Api Key does meet all conditions!'
				});
				
				var amount = getFormatAmount(p2pSystem_listings[items[0].id].amount);
				
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(user.userid) + ', `service` = ' + pool.escape('p2p_withdraw') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
				pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(user.userid), function(err3) {
					if(err3) {
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					getBalance(user.userid);
				
					pool.query('INSERT INTO `p2p_buyers` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `xp` = ' + pool.escape(user.xp) + ', `steamid` = ' + pool.escape(user.binds.steam) + ', `apikey` = ' + pool.escape(user.apikey) + ', `tradelink` = ' + pool.escape(user.tradelink) + ', `offerid` = ' + pool.escape(items[0].id) + ', `time` = ' + pool.escape(time()), function(err4, row4) {
						if(err4) {
							logger.error(err4);
							writeError(err4);
							setUserRequest(user.userid, 'p2p', false, true);
							return;
						}
						
						if(row4.affectedRows <= 0) {
							socket.emit('message', {
								type: 'error',
								error: 'Error: This P2P deposit can\'t be bought.'
							});
							setUserRequest(user.userid, 'p2p', false, true);
							return;
						}
						
						pool.query('UPDATE `p2p_transactions` SET `status` = 1 WHERE `id` = ' + pool.escape(items[0].id) + ' AND `status` = 0', function(err5, row5) {
							if(err5) {
								logger.error(err5);
								writeError(err5);
								setUserRequest(user.userid, 'p2p', false, true);
								return;
							}
							
							if(row5.affectedRows <= 0) {
								socket.emit('message', {
									type: 'error',
									error: 'Error: This P2P deposit can\'t be bought.'
								});
								setUserRequest(user.userid, 'p2p', false, true);
								return;
							}
							
							if(p2pSystem_listings[items[0].id].timeout != null) clearTimeout(p2pSystem_listings[items[0].id].timeout);
							
							p2pSystem_listings[items[0].id].status = 1;
							p2pSystem_listings[items[0].id].buyer = {
								user: {
									userid: user.userid,
									name: user.name,
									avatar: user.avatar,
									level: calculateLevel(user.xp).level
								},
								steamid: user.binds.steam,
								apikey: user.apikey,
								tradelink: user.tradelink
							};
							p2pSystem_listings[items[0].id].time = time();
							p2pSystem_listings[items[0].id].timeout = setTimeout(function(){
								p2pSysrem_cancelConfirm(items[0].id);
							}, config.config_offers.p2p.timer_confirm * 1000);
							
							socket.emit('message', {
								type: 'success',
								success: 'The P2P deposit #' + items[0].id + ' was successfully bought.'
							});
							
							//REMOVE ITEMS FROM WITHDRAW
							io.sockets.emit('message', {
								type: 'offers',
								command: 'remove_items',
								offer: {
									items: [{
										id: p2pSystem_listings[items[0].id].id
									}],
									paths: ['withdraw', 'p2p', p2pSystem_listings[items[0].id].game],
									all: false
								}
							});
							
							//EDIT PENDING FROM SELLER
							io.sockets.in(p2pSystem_listings[items[0].id].seller.user.userid).emit('message', {
								type: 'offers',
								command: 'edit_pending',
								offer: {
									id: p2pSystem_listings[items[0].id].id,
									type: 'deposit',
									method: 'p2p',
									status: p2pSystem_listings[items[0].id].status,
									items: p2pSystem_listings[items[0].id].items,
									data: {
										time: p2pSystem_listings[items[0].id].time + config.config_offers.p2p.timer_confirm,
										user: p2pSystem_listings[items[0].id].buyer.user,
										steamid: p2pSystem_listings[items[0].id].buyer.steamid,
										id: p2pSystem_listings[items[0].id].id
									}
								}
							});
							
							//ADD PENDING TO BUYER
							io.sockets.in(p2pSystem_listings[items[0].id].buyer.user.userid).emit('message', {
								type: 'offers',
								command: 'add_pending',
								offer: {
									id: p2pSystem_listings[items[0].id].id,
									type: 'withdraw',
									method: 'p2p',
									status: p2pSystem_listings[items[0].id].status,
									items: p2pSystem_listings[items[0].id].items,
									data: {
										time: p2pSystem_listings[items[0].id].time + config.config_offers.p2p.timer_confirm
									}
								}
							});
							
							setUserRequest(user.userid, 'p2p', false, false);
						});
					});
				});
			});
		});
	
		/**/
		
	});
}

function p2pSystem_confirmBundle(user, socket, id, recaptcha){
	setUserRequest(user.userid, 'p2p', true, true);
	
	verifyRecaptcha(recaptcha, function(verified){
		if(!verified){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid recaptcha!'
			});
			setUserRequest(user.userid, 'p2p', false, true);
			return;
		}
		
		/**/
		
		pool.query('SELECT * FROM `p2p_transactions` WHERE `id` = ' + pool.escape(id) + ' AND `status` = 1', function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(row1.length <= 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be confirmed.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
		
			if(p2pSystem_listings[id] === undefined) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be confirmed.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(p2pSystem_listings[id].status != 1) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: This P2P deposit can\'t be confirmed.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
			
			if(row1[0].userid != user.userid){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You can\'t confirm this P2P offer.'
				});
				setUserRequest(user.userid, 'p2p', false, true);
				return;
			}
				
			pool.query('UPDATE `p2p_transactions` SET `status` = 2 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 1', function(err2, row2) {
				if(err2) {
					logger.error(err2);
					writeError(err2);
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				if(row2.affectedRows <= 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: This P2P deposit can\'t be confirmed.'
					});
					setUserRequest(user.userid, 'p2p', false, true);
					return;
				}
				
				if(p2pSystem_listings[id].timeout != null) clearTimeout(p2pSystem_listings[id].timeout);
				
				p2pSystem_listings[id].status = 2;
				p2pSystem_listings[id].time = time();
				p2pSystem_listings[id].timeout = setTimeout(function(){
					p2pSysrem_cancelBuyer(id);
				}, config.config_offers.p2p.timer_send * 1000);
				
				socket.emit('message', {
					type: 'success',
					success: 'The P2P deposit #' + id + ' was successfully confirmed.'
				});
				
				//EDIT PENDING FROM SELLER
				io.sockets.in(p2pSystem_listings[id].seller.user.userid).emit('message', {
					type: 'offers',
					command: 'edit_pending',
					offer: {
						id: p2pSystem_listings[id].id,
						type: 'deposit',
						method: 'p2p',
						status: p2pSystem_listings[id].status,
						items: p2pSystem_listings[id].items,
						data: {
							time: p2pSystem_listings[id].time + config.config_offers.p2p.timer_send,
							user: p2pSystem_listings[id].buyer.user,
							steamid: p2pSystem_listings[id].buyer.steamid,
							tradelink: p2pSystem_listings[id].buyer.tradelink
						}
					}
				});
				
				//EDIT PENDING FROM BUYER
				io.sockets.in(p2pSystem_listings[id].buyer.user.userid).emit('message', {
					type: 'offers',
					command: 'edit_pending',
					offer: {
						id: p2pSystem_listings[id].id,
						type: 'withdraw',
						method: 'p2p',
						status: p2pSystem_listings[id].status,
						items: p2pSystem_listings[id].items,
						data: {
							time: p2pSystem_listings[id].time + config.config_offers.p2p.timer_send
						}
					}
				});
				
				setUserRequest(user.userid, 'p2p', false, false);
			});
		});
		
		/**/
		
	});
}
