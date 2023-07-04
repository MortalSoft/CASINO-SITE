var Steam = require('steam');
var TradeOfferManager = require('steam-tradeoffer-manager');
var SteamTotp = require('steam-totp');
var SteamWebLogon = require('steam-weblogon');
var SteamCommunity = require('steamcommunity');
var crypto = require('crypto');
var protos = require('./protos');
var fs2 = require('fs');
var EventEmitter = require('events').EventEmitter;

// var config2 = require('./config.js');

function prices_getPrice2(name, game){
  var price = -1;
  
  if (name && game) {
    var prices = JSON.parse(fs2.readFileSync('./prices/prices_' + game + '.json'));
    
    if(prices[name] !== undefined){
      var list_price = prices[name];
      
      if(list_price != null && list_price > 0) price = parseFloat(list_price).toFixed(2);
    }
  }
  return price;
}

class Bot extends EventEmitter {
  constructor(props){
    super();
    
    this._bot_props = {
      username: props.username,
      password: props.password,
      identity_secret: props.identity_secret,
      shared_secret: props.shared_secret,
    };
    
    this.name = props.botname;
    this.steamid = props.steamid;
    this.can_trade = props.can_trade;
    this.can_info = props.can_info;
    this.can_apikey = props.can_apikey;
    this.active = props.active;
    
    this.connected = false;
    this.coordinatorReady = false;
    this.intervalSendClientHello = null;
    
    this.queueRequestFloat = [];
    
    this.client = new Steam.SteamClient();
    this.user = new Steam.SteamUser(this.client);
    this.friends = new Steam.SteamFriends(this.client);
    this.webLogon = new SteamWebLogon(this.client, this.user);
    
    this.community = new SteamCommunity();
    this.manager = null;
    
    if(this.can_trade && this.active){
      this.manager = new TradeOfferManager({
        steam: this.client,
        community: this.community,
        domain: 'localhost',
        language: 'en',
        //cancelTime: 150000
      });
    }
    
    this.coordinator = new Steam.SteamGameCoordinator(this.client, 730);
    
    this.client.connect();
    
    //EVENTS
    if(this.can_info && this.active){
      this.coordinator.on('message', (header, buffer) => {
        var type = header.msg;
        
        switch(type){
          case 4004:
            this.emit('message', '[BOT] ' + this.name + ' - Counter Strike Global Offensive Are Ready');
            
            if(this.intervalSendClientHello) {
              clearInterval(this.intervalSendClientHello);
            
              this.intervalSendClientHello = null;
              
              this.coordinatorReady = true;
            }
          
            break;
            
          case 9157:
            
            var itemDataResponse = protos.CMsgGCCStrike15_v2_Client2GCEconPreviewDataBlockResponse.decode(buffer);
            
            var buf = new Buffer.alloc(4);
            buf.writeUInt32LE(Number(itemDataResponse.iteminfo.paintwear), 0);
            
            this.queueRequestFloat[0].callback(this.queueRequestFloat[0].index, buf.readFloatLE(0).toString());
            
            this.queueRequestFloat.shift();
            
            if(this.queueRequestFloat.length > 0){
              setTimeout(() => {
                this.requestFloat(this.queueRequestFloat[0].inspect);
              }, 500);
            }
            
            break;
        }
      });
      
      this.coordinator._client.on('message', (header, buffer) => {
        var type = header.msg;
        
        switch(type){
          case 4004:
            this.emit('message', '[BOT] ' + this.name + ' - Counter Strike Global Offensive Are Ready');
            
            if(this.intervalSendClientHello) {
              clearInterval(this.intervalSendClientHello);
            
              this.intervalSendClientHello = null;
              
              this.coordinatorReady = true;
            }
          
            break;
            
          case 9157:
            
            var itemDataResponse = protos.CMsgGCCStrike15_v2_Client2GCEconPreviewDataBlockResponse.decode(buffer);
            
            var buf = new Buffer.alloc(4);
            buf.writeUInt32LE(Number(itemDataResponse.iteminfo.paintwear), 0);
            
            this.queueRequestFloat[0].callback(this.queueRequestFloat[0].index, buf.readFloatLE(0).toString());
            
            this.queueRequestFloat.shift();
            
            if(this.queueRequestFloat.length > 0){
              setTimeout(() => {
                this.requestFloat(this.queueRequestFloat[0].inspect);
              }, 500);
            }
            
            break;
        }
      });
    }
    
    this.client.on('connected', () => {
      this.emit('message', '[BOT] ' + this.name + ' - Client Connected Successfuly');
      
      this.user.logOn({
        account_name: this._bot_props.username,
        password: this._bot_props.password,
        two_factor_code: SteamTotp.generateAuthCode(this._bot_props.shared_secret)
      });
    });

    this.client.on('logOnResponse', (response) =>{
      if(response.eresult !== Steam.EResult.OK) {
        this.emit('message', '[BOT] ' + this.name + ' - Client Login Failed');
        
        this.client.connect();  
        return;
      }
      
      this.emit('message', '[BOT] ' + this.name + ' - Client Login Successfuly');

      this.setWebLogOn();
      
      if(this.can_info && this.active){
        this.friends.setPersonaState(Steam.EPersonaState.Busy);
        this.user.gamesPlayed([{game_id: '730'}]);
    
        this.intervalSendClientHello = setInterval(() => {
          if(this.coordinator){
            if(this.coordinator._client && this.coordinator._client._connection){
              this.coordinator.send({
                msg: 4006, proto: {}
              }, new protos.CMsgClientHello({}).toBuffer());
            } else {
              this.coordinatorReady = false;
              
              if(this.intervalSendClientHello) {
                clearInterval(this.intervalSendClientHello);
              
                this.intervalSendClientHello = null;
              }
              
              this.emit('message', '[BOT] ' + this.name + ' - Game Coordinator Missing');
            }
          }
        }, 2500);
      }
    });

    this.client.on('loggedOff', (eresult) => {
      this.emit('message', '[BOT] ' + this.name + ' - Client Logout. Client Reconnecting');
      
      this.client.connect();
    });

    this.client.on('error', (err) => {
      this.emit('message', '[BOT] ' + this.name + ' - Client Error. Error: ' + err.message);
      
      if(err.message == 'Disconnected') {
        this.emit('message', '[BOT] ' + this.name + ' - Client Disconnected. Client Reconnecting');
        
        this.client.connect();  
      }
    });

    this.community.on('confKeyNeeded', (deepDataAndEvents, updateFunc) => {
      this.emit('message', '[BOT] ' + this.name + ' - Need Confirmation Key');
      
      updateFunc(null, time, SteamTotp.getConfirmationKey(this._bot_props.identity_secret, time(), deepDataAndEvents));
    });

    this.community.on('sessionExpired', (err) => {
      this.emit('message', '[BOT] ' + this.name + ' - Session Expired. Session Are Setting');
      this.connected = false;
      
      this.community.stopConfirmationChecker();
      
      this.setWebLogOn();
    });

    this.user.on('updateMachineAuth', (sentry, callback) => { 
      callback({
        sha_file: this.getSHA1(sentry.bytes)
      });
    });
    
    if(this.manager != null){
      this.manager.on('sentOfferChanged', (offer) => {
        this.emit('sentOfferChanged', {
          bot: this.steamid,
          offer: offer
        });
      });
      
      this.manager.on('newOffer', (offer) => {
        this.emit('newOffer', {
          bot: this.steamid,
          offer: offer
        });
      });
    }
    
    this.community.on('confirmationAccepted', (offer) => {
      this.emit('confirmationAccepted', {
        bot: this.steamid,
        offer: offer
      });
    });
  }
  
  addQueueRequestFloat(request) {
    var firstRequest = false;
    if(this.queueRequestFloat.length == 0) firstRequest = true;
    
    this.queueRequestFloat.push(request);
    
    if(firstRequest) this.requestFloat(this.queueRequestFloat[0].inspect);
  }
  
  requestFloat(inspect){
    var payload = new protos.CMsgGCCStrike15_v2_Client2GCEconPreviewDataBlockRequest({
      param_s: inspect.s.toString(),
      param_a: inspect.a.toString(),
      param_d: inspect.d.toString(),
      param_m: '0',
    });

    this.coordinator.send({
      msg: 9156, proto: {}
    }, payload.toBuffer());
    
    setTimeout(() => {
      if(this.queueRequestFloat.length > 0) if(inspect.a == this.queueRequestFloat[0].inspect.a) this.requestFloat(inspect);
    }, 5000);
  }
  
  getSHA1(bytes) {
    var shasum = crypto.createHash('sha1');
    shasum.end(bytes);
    
    return shasum.read();
  }
  
  setWebLogOn(){
    try{
      this.webLogon.webLogOn((sessionID, cookies) => {
        this.emit('message', '[BOT] ' + this.name + ' - Session Cookies Have Been Set');
        
        if(this.manager != null){
          this.manager.setCookies(cookies, (err) => {
            if (err) {
              this.emit('error', err);
              //process.exit(1);
            }
          });
        }
        
        this.community.setCookies(cookies);
        this.community.startConfirmationChecker(5000, this._bot_props.identity_secret);
        
        setTimeout(() => {
          this.connected = true;
          
          this.emit('ready', this.steamid);
        }, 1000);
      });
    } catch(err){
      this.emit('message', '[BOT] ' + this.name + ' - Session Cookies Have Not Been Set. Error: ' + err.message);
      
      if(this.client.loggedOn){
        this.user.requestWebAPIAuthenticateUserNonce((result) => {
          this.emit('message', '[BOT] ' + this.name + ' - Request Web API Authenticate User Nonce. Message: ' + result);
        });
      } else {
        this.client.connect();
      }
    }
  }

  /**
   * Return all items on the bot account
   * @param {Int} appid - steam id of the app (730 is csgo)
   * @param {Int} contextid - context id is different for each game, check manually
  */
  getAllItems(appid = 730, contextid = 2) {
    return new Promise((resolve, reject) => {
      try {
        this.manager.getInventoryContents(appid, contextid, false, (err, inventory) => {
          if(err) return reject(err);

          let inv = [];

          for(let i in inventory) {
            inventory[i].price = prices_getPrice2(inventory[i].market_hash_name, appid);

            if(inventory[i].price > 0 && inventory[i].marketable) {
              inv.push(inventory[i]);
            }
          }

          resolve(inv);
        });
      } catch(e) {
        reject(e);
      }
    });
  }

  /**
  * 
  */
  sendAdminOffer(items, link) {
    return new Promise(async (resolve, reject) => {
      let offer = this.manager.createOffer(link);

      offer.addMyItems(items);

      offer.send(async (err, status) => {
        if(err) return reject(err.message);

        // log('Bot', `Sent a new ${type} to ${user.get('name')} (${user.get('steamid')}), ${data.items.length} item${data.items.length !== 1 ? 's' : ''} valued at $${totalPrice.toFixed(2)} (#${offer.id})`, `#${this.id}`);
        // console.log(data);
        resolve(offer.id);

        // if(status == 'pending') {
        //   this.community.acceptConfirmationForObject(this._bot_props.identity_secret, offer.id, (err) => {
        //     if(err) return reject(err.message);
        //     else resolve(offer.id);
        //   });
        // } else {
        //   return resolve(offer.id);
        // }
      });
    });
  }
};

module.exports = Bot;