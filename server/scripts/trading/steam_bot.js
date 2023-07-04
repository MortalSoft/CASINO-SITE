/* -------------- BOT -------------- */

function getUserInventory(steamid, appID, contextID, tradableOnly, callback){
	var options = {
		headers: {
			'Referer': 'https://steamcommunity.com/profiles/' + steamid + '/inventory'
		},
		uri: 'https://steamcommunity.com/profiles/' + steamid + '/inventory/json/' + appID + '/' + contextID,
		qs: {
			'start': 0,
			'trading': tradableOnly ? 1 : undefined
		}
	}
	
	request(options, function(err, response, body) {
		if(err) {
			logger.error(err);
			writeError(err);
			return callback(err);
		}
		
		if(response && response.statusCode != 200) return callback(new Error('Error. (1)'));
		
		if(!isJsonString(body)) return callback(new Error('Error. (2)'));
		
		var body = JSON.parse(body);

		if(!body.success || !body.rgInventory || !body.rgDescriptions) return callback(new Error('Error. (3)'));

		var rgInventory = body.rgInventory
		var rgDescriptions = body.rgDescriptions;
		
		var items_id = {};
		for(var id in rgInventory){
			items_id[id] = rgInventory[id].classid + '_' + rgInventory[id].instanceid;
		}
		
		var items = [];
		for(var item in items_id){
			var inspect = null;
			
			if(rgDescriptions[items_id[item]].actions !== undefined){
				var actions = rgDescriptions[items_id[item]].actions[0];
				if(actions !== undefined){
					inspect = actions.link;
					inspect = inspect.replace("%owner_steamid%", steamid);
					inspect = inspect.replace("%assetid%", item);
				}
			}
			
			var quality = null;
			var color = null;
			
			rgDescriptions[items_id[item]].tags.forEach(function(tag){
				if(tag.category !== undefined){
					if(tag.category == 'Rarity'){
						quality = tag.name;
						
						color = tag.color;						
						if(color.indexOf('#') < 0) color = '#' + color;
					}
				}
			});
			
			var tradelocked = null;
			if(rgDescriptions[items_id[item]].cache_expiration !== undefined) tradelocked = parseInt(new Date(rgDescriptions[items_id[item]].cache_expiration).getTime() / 1000);
			
			var stickers = [];

			if(rgDescriptions[items_id[item]].descriptions !== undefined){
				if(Array.isArray(rgDescriptions[items_id[item]].descriptions)){
					rgDescriptions[items_id[item]].descriptions.forEach(function(description){
						if(description.value !== undefined){
							var value = description.value;
							
							if(value.indexOf('sticker_info') != -1){
								var dates = value.split('<center>');
								dates = dates[1].split('</center>')[0];
								dates = dates.split('<br>Sticker: ');
								
								var images = dates[0].split('">');
								delete images[images.length - 1]; 
								
								var names = dates[1].split(', ');
								
								images.forEach(function(image, index){
									stickers.push({
										image: image.split('src="')[1],
										name: names[index]
									});
								});
							}
						}
					});
				}
			}
			
			items.push({
				assetid: item,
				classid: rgDescriptions[items_id[item]].classid,
				instanceid: rgDescriptions[items_id[item]].instanceid,
				game: Object.keys(config.config_offers.steam.games).find(a => config.config_offers.steam.games[a].game.appid == appID) || null,
				name: rgDescriptions[items_id[item]].market_name || rgDescriptions[items_id[item]].market_hash_name || rgDescriptions[items_id[item]].name,
				icon: 'https://steamcommunity-a.akamaihd.net/economy/image/' + (rgDescriptions[items_id[item]].icon_url_large || rgDescriptions[items_id[item]].icon_url),
				price: 0,
				offset: 0,
				color: color,
				stickers: stickers,
				wear: null,
				inspect: inspect,
				quality: quality,
				tradable: rgDescriptions[items_id[item]].tradable,
				marketable: rgDescriptions[items_id[item]].marketable,
				tradelocked: tradelocked
			});
		}
		
		return callback(null, items);
	});
}

var offers_steamUsersWear = {};

function requestItemsFloat(user, items, callback){
	if(!haveActiveBots('info')) return callback(new Error('No active bots'), items);
	
	if(offers_steamUsersWear[user] !== undefined) return [];
	
	offers_steamUsersWear[user] = {
		pos_array: [],
		
		user: user,
		items: items,
		
		callback: callback,
		
		new_items: [],
		
		start: function(){
			for(var i = 0; i < this.items.length; i++) this.pos_array.push(0);
		},
		
		registerFloat: function(index, wear){
			this.pos_array[index] = 1;
			
			var new_item = this.items[index].item;
			new_item.wear = wear;
			
			this.new_items.push(new_item);
			
			var copy_pos_array = [...this.pos_array];
			copy_pos_array.sort(function(a, b){ return a - b});
			
			if(copy_pos_array[0] == 1) {
				this.callback(null, this.new_items);
				
				delete offers_steamUsersWear[this.user];
			}
		}
	}
	
	offers_steamUsersWear[user].start();
	
	items.forEach(function(item, i){
		addQueueRequestFloat({
			index: i,
			inspect: item.inspect,
			callback: function(index, wear){
				if(offers_steamUsersWear[user] !== undefined){
					offers_steamUsersWear[user].registerFloat(index, wear);
				}
			}
		})
	})
}

//BOT STEAM
var BotManager = require('./scripts/trading/steam_bot_manager');

var offers_steamBots = [];

instantiateSteamBots();

function instantiateSteamBots(){
	config.config_offers.steam.bots.forEach(function(bot){
		var new_steam_bots = new BotManager(bot);
		
		new_steam_bots.on('error', steamBotError);
		new_steam_bots.on('message', steamBotMessage);
		new_steam_bots.on('ready', steamBotReady);
		
		new_steam_bots.on('sentOfferChanged', steamBotSentOfferChanged);
		new_steam_bots.on('newOffer', steamBotNewOffer);
		new_steam_bots.on('confirmationAccepted', steamBotConfirmationAccepted);
		
		offers_steamBots.push(new_steam_bots);
	});
}

function haveActiveBots(type){
	return (offers_steamBots.filter(a => a.connected && a['can_' + type] && a.active).length > 0);
}

function getFreeBot(type){
	var filter = offers_steamBots.filter(a => a.connected && a['can_' + type] && a.active);
	
	return filter[getRandomInt(0, filter.length - 1)];
}

function getBotByIndex(index){
	return offers_steamBots[index];
}

function getBotBySteamid(steamid){
	return offers_steamBots.findIndex(a => a.steamid == steamid);
}

function addQueueRequestFloat(request){
	var free_bot = getFreeBot('info');
	
	free_bot.addQueueRequestFloat(request);
}

function steamBotError(error){
	logger.error(error);
	writeError(error);
}

function steamBotMessage(message){
	logger.warn(message);
}

function steamBotReady(bot){
	setTimeout(function(){
		offers_steamLoadOffers(bot);
	}, 1000);
}

function steamBotSentOfferChanged(response){
	var steam_bot = offers_steamBots[getBotBySteamid(response.bot)];
	
	if(steam_bot == undefined) {
		logger.error(new Error('[BOT] ' + response.bot + ' Was Not Found'));
		writeError(new Error('[BOT] ' + response.bot + ' Was Not Found'));
		return;
	}
	
	steam_bot.manager.getOffer(response.offer.id, function(err1, offer){
		if(err1) {
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		offers_steamStateChanged(offer.state, offer.id, offer.itemsToGive, offer.itemsToReceive, response.bot);
	});
}

function steamBotNewOffer(response){
	//offers_steamDeclineOffer(response.offer.id, response.bot);
}

function steamBotConfirmationAccepted(response){
	var steam_bot = offers_steamBots[getBotBySteamid(response.bot)];
	
	if(steam_bot == undefined) {
		logger.error(new Error('[BOT] ' + response.bot + ' Was Not Found'));
		writeError(new Error('[BOT] ' + response.bot + ' Was Not Found'));
		return;
	}
	
	if(offers_steamActiveOffers[response.offer.creator] !== undefined){
		if(offers_steamActiveOffers[response.offer.creator].type == 'withdraw'){
			pool.query('UPDATE `steam_transactions` SET `status` = 1 WHERE `tradeofferid` = ' + pool.escape(response.offer.creator), function(err1) {
				if(err1) {
					logger.error(err1);
					writeError(err1);
					return;
				}
			
				offers_steamActiveOffers[response.offer.creator].status = 1;
				offers_steamActiveOffers[response.offer.creator].time = time();
				
				offers_steamActiveOffers[response.offer.creator].timeout = setTimeout(function(){
					offers_steamDeclineOffer(offers_steamActiveOffers[response.offer.creator].tradeofferid, steam_bot.steamid, function(err2){
						if(err2) {
							logger.error(err2);
							writeError(err2);
							return;
						}
					});
				}, config.config_offers.steam.time_cancel_trade * 1000)
				
				//EDIT PENDING FROM BUYER
				io.sockets.in(offers_steamActiveOffers[response.offer.creator].user.userid).emit('message', {
					type: 'offers',
					command: 'edit_pending',
					offer: {
						id: offers_steamActiveOffers[response.offer.creator].id,
						type: offers_steamActiveOffers[response.offer.creator].type,
						method: 'steam',
						status: offers_steamActiveOffers[response.offer.creator].status,
						game: offers_steamActiveOffers[response.offer.creator].game,
						items: offers_steamActiveOffers[response.offer.creator].items,
						data: {
							tradeofferid: offers_steamActiveOffers[response.offer.creator].tradeofferid,
							code: offers_steamActiveOffers[response.offer.creator].code,
							time: offers_steamActiveOffers[response.offer.creator].time + config.config_offers.steam.time_cancel_trade
						}
					}
				});
				
				logger.warn('[BOT] ' + steam_bot.name + ' - ' + offers_steamActiveOffers[response.offer.creator].type.toUpperCase() + ' | ' + offers_steamActiveOffers[response.offer.creator].user.userid + ' | Offer #' + response.offer.creator + ' Was Confirmed');
			});
		}
	} else {
		logger.warn('[BOT] ' + steam_bot.name + ' - Unknown Offer #' + response.offer.creator + ' Was Confirmed');
	}
}
/* -------------- END BOT -------------- */
