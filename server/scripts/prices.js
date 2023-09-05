// const _path = '/var/server';
const _path = './';

function prices_getPrice(name, game){
	var price = -1;
	
	if (name && game) {
		var prices = require(_path + config.config_site.root + 'prices/prices_' + game + '.json');
		
		if(prices[name] !== undefined){
			var list_price = prices[name];
			
			if(list_price != null && list_price > 0) price = roundedToFixed(list_price, 2);
		}
	}
	return price;
}

prices_loadAllPlices();
function prices_loadAllPlices(){
	prices_loadPlices(730);
	prices_loadPlices(570);
	prices_loadPlices(252490);
}

setTimeout(function(){
	prices_loadAllPlices();
	
	nextTimeLoadPrices = time() + config.config_offers.steam.prices.cooldown_load;
}, config.config_offers.steam.prices.cooldown_load * 1000);

function prices_loadPlices(game){
	var options = 'https://bitskins.com/api/v1/get_all_item_prices/?api_key=' + config.config_offers.steam.prices.apikey.key + '&code=' + twoFactor.generateToken(config.config_offers.steam.prices.apikey.secret).token + '&app_id=' + game;
	
	request(options, function(err, response, body) {
		if(err) {
			logger.error(err);
			return;
		}
		
		if (200 == response.statusCode) {
			var body = JSON.parse(body);
			
			var prices = {};
			
			body.prices.forEach(function(item){
				prices[item.market_hash_name] = roundedToFixed(item.price, 2).toFixed(2);
			});
			
			fs.writeFileSync(_path + config.config_site.root + 'prices/prices_' + game + '.json', JSON.stringify(prices));
			
			logger.debug("[BOT] Prices Loaded");
		}
	});
}