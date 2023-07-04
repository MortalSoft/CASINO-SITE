var p2pService_listings = {};

var is_start_tracking = false;
var is_tracking = false;

p2pService_checkTracking();
p2pService_load();

function p2pService_load(){
	pool.query('SELECT * FROM `p2p_tracking_listings` WHERE `status` IN (0, 1, 2)', function(err1, row1) {
		if(err1) return;
		
		row1.forEach(function(item){
			p2pService_listings[item.id] = {
				id: item.id,
				status: item.status,
				seller: {
					steamid: item.steamid,
					apikey: item.apikey,
					partenerid: item.partenerid
				},
				buyer: {},
				items: JSON.parse(item.items).items,
				time_created: item.time,
				tradeofferid: item.tradeofferid || null
			};
			
			if(item.status != 0) {
				pool.query('SELECT * FROM `p2p_tracking_buyers` WHERE `offerid` = ' + pool.escape(item.id) + ' AND `canceled` = 0', function(err2, row2) {
					if(err2) return;
					
					if(row2.length > 0){
						p2pService_listings[item.id].buyer = {
							steamid: row2[0].steamid,
							apikey: row2[0].apikey,
							partenerid: row2[0].partenerid
						};
					}
				});
			}
		});
	});
}

function p2pService_create(data, callback){
	if(data.items === undefined) return callback(new Error('Items is missing'));
	if(data.steamid === undefined) return callback(new Error('Steamid is missing'));
	if(data.tradelink === undefined) return callback(new Error('Tradelink is missing'));
	if(data.apikey === undefined) return callback(new Error('Apikey is missing'));
	
	var reg_tradelink = /^(http|https):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/;
	if(!reg_tradelink.test(data.tradelink)) return callback(new Error('Tradelink is invalid'));
	
	var reg_apikey = /^(([a-f\d]{2}){16})$/i;
	if(!reg_apikey.test(data.apikey)) return callback(new Error('Apikey is invalid'));
	
	var game = { appid: 730, contextid: 2 };
	
	p2pService_inventory(data.steamid, game, function(err1, items){
		if(err1) return callback(err1);
		
		data.items.forEach(function(item){
			if(!items.includes(item)) return callback(new Error('Invalid items'));
		});
		
		var partenerid = data.tradelink.split('partner=')[1].split('&token=')[0];
		
		pool.query('INSERT INTO `p2p_tracking_listings` SET `steamid` = ' + pool.escape(data.steamid) + ', `apikey` = ' + pool.escape(data.apikey) + ', `partenerid` = ' + pool.escape(partenerid) + ', `items` = ' + pool.escape(JSON.stringify({ items: data.items })) + ', `appid` = ' + pool.escape(game.appid) + ', `contextid` = ' + pool.escape(game.contextid) + ', `time` = ' + pool.escape(time()), function(err2, row2) {
			if(err2) return callback(err2);
			if(row2.affectedRows <= 0) return callback(new Error('Cannot create the offer'));
			
			p2pService_listings[row2.insertId] = {
				id: row2.insertId,
				status: 0,
				seller: {
					steamid: data.steamid,
					apikey: data.apikey,
					partenerid: partenerid
				},
				buyer: {},
				items: data.items,
				time_created: time(),
				tradeofferid: null
			};
			
			callback(null, p2pService_listings[row2.insertId]);
			
			p2pService_callback(row2.insertId);
		});
	});
}

function p2pService_buy(data, callback){
	if(data.id === undefined) return callback(new Error('Id is missing'));
	if(data.steamid === undefined) return callback(new Error('Steamid is missing'));
	if(data.tradelink === undefined) return callback(new Error('Tradelink is missing'));
	if(data.apikey === undefined) return callback(new Error('Apikey is missing'));
	
	var reg_tradelink = /^(http|https):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/;
	if(!reg_tradelink.test(data.tradelink)) return callback(new Error('Tradelink is invalid'));
	
	var reg_apikey = /^(([a-f\d]{2}){16})$/i;
	if(!reg_apikey.test(data.apikey)) return callback(new Error('Apikey is invalid'));
	
	if(p2pService_listings[data.id] === undefined) return callback(new Error('Invalid id'));
	if(p2pService_listings[data.id].status != 0) return callback(new Error('The offer is already bought'));
	
	var partenerid = data.tradelink.split('partner=')[1].split('&token=')[0];
	
	pool.query('INSERT INTO `p2p_tracking_buyers` SET `steamid` = ' + pool.escape(data.steamid) + ', `apikey` = ' + pool.escape(data.apikey) + ', `partenerid` = ' + pool.escape(partenerid) + ', `offerid` = ' + pool.escape(data.id) + ', `time` = ' + pool.escape(time()), function(err1, row1) {
		if(err1) return callback(err2);
		if(row1.affectedRows <= 0) return callback(new Error('Cannot buy the offer'));
		
		pool.query('UPDATE `p2p_tracking_listings` SET `status` = 1 WHERE `id` = ' + pool.escape(data.id) + ' AND `status` = 0', function(err2, row2) {
			if(err2) return callback(err2);
			if(row2.affectedRows <= 0) return callback(new Error('Cannot buy the offer'));
			
			p2pService_listings[data.id].status = 1;
			
			p2pService_listings[data.id].buyer = {
				steamid: data.steamid,
				apikey: data.apikey,
				partenerid: partenerid
			};
			
			callback(null, p2pService_listings[data.id]);
			
			p2pService_callback(data.id);
		});
	});
}

function p2pService_checkTracking(){
	if(is_start_tracking) return;
	
	is_start_tracking = true;
	
	setInterval(function(){
		if(!is_tracking) p2pService_tracking();
	}, 1000);
}

function p2pService_tracking(){
	is_tracking = true;
	
	var props = Object.keys(p2pService_listings);
	
	for(var i = 0; i < props.length; i++) await p2pService_trackOffer(props[i]);
	
	is_tracking = false;
}

function p2pService_trackOffer(id){
  	return new Promise(function(resolve, reject) {
		if(p2pService_listings[id] === undefined) return resolve();
		if(p2pService_listings[id] != 1 && p2pService_listings[id] != 2) return resolve();
		
		check_user_offers(p2pService_listings[id].seller.apikey, p2pService_listings[id].buyer.partenerid, 'sent', function(err1, success1){
			if(err1) return resolve();
			if(success1) return resolve();
			
			check_user_offers(p2pService_listings[id].buyer.apikey, p2pService_listings[id].seller.partenerid, 'received', function(err2, success2){
				if(err2) return resolve();
				if(success2) return resolve();
			});
		});
		
		function check_user_offers(apikey, partenerid, type, callback){
			if(type == 'sent') var options = 'https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=' + apikey + '&get_sent_offers=1&active_only=0';
			else if(type == 'received') var options = 'https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=' + apikey + '&get_received_offers=1&active_only=0';
			
			request(options, function(err1, response1, body1) {
				if(err1) return callback(true);
			
				if(!response1) return callback(true);
				if(response1.statusCode != 200) return callback(true);
				if(!p2pService_isJson(body1)) return callback(true);
			
				var body = JSON.parse(body1);
				
				var user_offers = body.response.trade_offers_sent;
				var offers = user_offers.filter(a => a.time_created >= p2pService_listings[id].time_created).sort(function(a, b){ return b.time_created - a.time_created });
				
				var any_trade_found = false;
				for(var i = 0; i < offers.length; i++){
					var trade_found = true;
					
					if(offers[i].accountid_other == parteneridd) {
						var all_items = true;
						
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
							
						p2pService_listings[id].items.forEach(function(item){
							if(!items.includes(item.toString())) all_items = false;
						});
						
						trade_found = all_items;
					}
					
					if(trade_found) {
						if(offers[i].trade_offer_state == 2 && p2pService_listings[id].status == 1) {
							any_trade_found = true;
							
							pool.query('UPDATE `p2p_tracking_listings` SET `status` = 2 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 1', function(err2, row2) {
								if(err2) return callback(true);
								if(row2.affectedRows <= 0) return callback(true);
								
								p2pService_listings[id].status = 2;
								p2pService_listings[id].tradeofferid = offers[i].tradeofferid;
								
								p2pService_callback(id);
							});
						} else if(offers[i].trade_offer_state == 3 && (p2pService_listings[id].status == 1 || p2pService_listings[id].status == 2)) {
							any_trade_found = true;
							
							pool.query('UPDATE `p2p_tracking_listings` SET `status` = 3 WHERE `id` = ' + pool.escape(id) + ' AND (`status` = 1 OR `status` = 2)', function(err2, row2) {
								if(err2) return callback(true);
								if(row2.affectedRows <= 0) return callback(true);
								
								p2pService_listings[id].status = 3;
								p2pService_listings[id].tradeofferid = offers[i].tradeofferid;
								
								p2pService_callback(id);
							});
						} else if(offers[i].trade_offer_state != 2) p2pService_cancelBuyer(id);
						
						break;
					}
				}
				
				callback(false, any_trade_found);
			});
		}
	});
}

function p2pService_cancelTrade(id, callback){
	if(p2pService_listings[id] === undefined) return callback(new Error('Invalid id'));
	if(p2pService_listings[id].status != 0) return callback(new Error('The offer can not be canceled'));
	
	pool.query('UPDATE `p2p_tracking_listings` SET `status` = -1 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 0', function(err1, row1) {
		if(err1) return callback(err1);
		if(row1.affectedRows <= 0) return callback(new Error('The offer can not be canceled'));
		
		p2pService_listings[id].status = -1;
		
		p2pService_callback(id);
	});
}

function p2pService_cancelBuyer(id){
	if(p2pService_listings[id] === undefined) return;
	if(p2pService_listings[id].status != 1) return;
	
	pool.query('UPDATE `p2p_tracking_listings` SET `status` = 0 WHERE `id` = ' + pool.escape(id) + ' AND `status` = 1', function(err1, row1) {
		if(err1) return callback(err1);
		if(row1.affectedRows <= 0) return callback(new Error('The offer can not be canceled'));
	
		pool.query('UPDATE `p2p_tracking_buyers` SET `canceled` = 1 WHERE `offerid` = ' + pool.escape(id) + ' AND `canceled` = 0', function(err2, row2) {
			if(err2) return;
			if(row2.affectedRows <= 0) return;
			
			p2pService_listings[id].status = 0;
			p2pService_listings[id].buyer = {};
			
			p2pService_callback(id);
		});
	});
}

function p2pService_callback(id){
	if(p2pService_listings[id] === undefined) return;
	
	p2pSystem_stateChanged(p2pService_listings[id]);
}

function p2pService_inventory(steamid, game, callback){
	var options = {
		headers: {
			'Referer': 'https://steamcommunity.com/profiles/' + steamid + '/inventory'
		},
		uri: 'https://steamcommunity.com/profiles/' + steamid + '/inventory/json/' + game.appid + '/' + game.contextid,
		qs: {
			'start': 0,
			'trading': 1
		}
	}
	
	request(options, function(err1, response1, body1) {
		if(err1) return callback(err1);
		
		if(!response1) return callback(new Error('User invenory can not be loaded'));
		if(response1.statusCode != 200) return callback(new Error('User invenory can not be loaded'));
		if(!p2pService_isJson(body1)) return callback(new Error('User invenory can not be loaded'));
		
		var body = JSON.parse(body1);

		if(!body.success || !body.rgInventory) return callback(new Error('User invenory can not be loaded'));

		var rgInventory = body.rgInventory
		
		var items = Object.keys(rgInventory);
		
		return callback(null, items);
	});
}

function p2pService_isJson(string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
	
    return true;
}