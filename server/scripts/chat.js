var chat_massages = [];
var chat_ignoreList = {};
var chat_userLastMessage = {};

var chat_mode = 'normal';

var chat_commandsList = {
	'ignore': 'userid',
	'unignore': 'userid',
	'ignorelist': 'none',
	'ban': 'userid',
	'unban': 'userid',
	'mute': 'userid',
	'unmute': 'userid',
	'deletemessage': 'id',
	'cleanchat': 'none',
	'chatmode': 'none',
	'setrank': 'userid',
	'maintenance': 'none',
	'unmaintenance': 'none',
	'banip': 'userid',
	'tradeonline': 'none',
	'bantrade': 'userid',
	'unbantrade': 'userid',
	'playonline': 'none',
	'banplay': 'userid',
	'unbanplay': 'userid',
	'givecoins': 'userid',
	'takecoins': 'userid',
	'tiprain': 'none',
	'lastrain': 'none',
	'rollrain': 'none',
};

var chat_commandsRank = {
	0: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain'],
	1: ['ignore', 'unignore', 'ignorelist', 'ban', 'unban', 'mute', 'unmute', 'deletemessage', 'cleanchat', 'chatmode', 'setrank', 'maintenance', 'unmaintenance', 'banip', 'tradeonline', 'bantrade', 'unbantrade', 'playonline', 'banplay', 'unbanplay', 'givecoins', 'takecoins', 'tiprain', 'lastrain', 'rollrain'],
	2: ['ignore', 'unignore', 'ignorelist', 'ban', 'unban', 'mute', 'unmute', 'deletemessage', 'cleanchat', 'chatmode', 'banip', 'tradeonline', 'bantrade', 'unbantrade', 'playonline', 'banplay', 'unbanplay', 'tiprain', 'lastrain', 'rollrain'],
	3: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain'],
	4: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain'],
	5: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain'],
	6: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain'],
	7: ['ignore', 'unignore', 'ignorelist', 'tiprain', 'lastrain', 'givecoins'],
	8: ['ignore', 'unignore', 'ignorelist', 'ban', 'unban', 'mute', 'unmute', 'deletemessage', 'cleanchat', 'chatmode', 'setrank', 'maintenance', 'unmaintenance', 'banip', 'tradeonline', 'bantrade', 'unbantrade', 'playonline', 'banplay', 'unbanplay', 'givecoins', 'takecoins', 'tiprain', 'lastrain', 'rollrain'],
	100: ['ignore', 'unignore', 'ignorelist', 'ban', 'unban', 'mute', 'unmute', 'deletemessage', 'cleanchat', 'chatmode', 'setrank', 'maintenance', 'unmaintenance', 'banip', 'tradeonline', 'bantrade', 'unbantrade', 'playonline', 'banplay', 'unbanplay', 'givecoins', 'takecoins', 'tiprain', 'lastrain', 'rollrain']
}

var chat_ranksList = [
	{ rank: 'player', code: 0 },
	{ rank: 'admin', code: 1 },
	{ rank: 'moderator', code: 2 },
	{ rank: 'helper', code: 3 },
	{ rank: 'veteran', code: 4 },
	{ rank: 'pro', code: 5 },
	{ rank: 'youtuber', code: 6 },
	{ rank: 'streamer', code: 7 },
	{ rank: 'developer', code: 8 },
	{ rank: 'owner', code: 100 }
]

chat_loadMessages();
function chat_loadMessages(){
	pool.query('SELECT * FROM `messages` WHERE `deleted` = 0 ORDER BY `id` DESC LIMIT ' + config.config_chat.max_messages, async function(err1, row1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		if(row1.length > 0){
			nextPlayerID = row1[0].id + 1;
			
			row1.reverse();
			
			loadMessage(0, row1);
			function loadMessage(index, messages){
				if(index >= messages.length) return;
				
				chat_getMentions(messages[index].message, function(mentions){
					var new_message = {
						type: 'player',
						id: messages[index].id,
						userid: messages[index].userid,
						name: messages[index].name,
						avatar: messages[index].avatar,
						rank: messages[index].rank,
						level: calculateLevel(messages[index].xp).level,
						message: messages[index].message,
						channel: messages[index].channel,
						mentions: mentions,
						time: messages[index].time
					}
					
					chat_massages.push(new_message);
					
					loadMessage(index + 1, messages);
				});
			}
		}
	});
}

setInterval(function(){
	otherMessages(config.config_chat.support.message, io.sockets, true);
}, config.config_chat.support.cooldown * 1000);

function chat_loadChannel(user, socket, channel){
	logger.debug(user.name + '(' + user.userid + ') - Chat Changed to ' + channel);
	
	socket.emit('message', {
		type: 'chat',
		command: 'channel',
		channel: channel
	});
	
	chat_massages.forEach(function(item){
		if(item.type == 'player'){
			if(item.channel == channel){
				var message = {
					type: item.type,
					id: item.id,
					userid: item.userid,
					name: item.name,
					avatar: item.avatar,
					rank: item.rank,
					level: item.level,
					message: item.message,
					channel: item.channel,
					mentions: item.mentions,
					time: item.time
				}
				
				socket.emit('message', {
					type: 'chat',
					command: 'message',
					message: message,
					added: false
				});
			}
		} else if(item.type == 'system'){
			var message = {
				type: item.type,
				message: item.message,
				time: item.time
			}
			
			socket.emit('message', {
				type: 'chat',
				command: 'message',
				message: message,
				added: false
			});
		}
	});
	
	otherMessages(config.config_chat.greeting, socket, false);
}

function chat_refreshMessages(user, socket){
	socket.emit('message', {
		type: 'chat',
		command: 'clean'
	});
	
	chat_massages.forEach(function(item){
		if(item.type == 'player'){
			var message = {
				type: item.type,
				id: item.id,
				userid: item.userid,
				name: item.name,
				avatar: item.avatar,
				rank: item.rank,
				level: item.level,
				message: item.message,
				channel: item.channel,
				mentions: item.mentions,
				time: item.time
			}
		} else if(item.type == 'system'){
			var message = {
				type: item.type,
				message: item.message,
				time: item.time
			}
		}
		
		socket.emit('message', {
			type: 'chat',
			command: 'message',
			message: message,
			added: false
		});
	});
}

function otherMessages(message, socket, keep){
	var new_message = {
		type: 'system',
		message: message,
		time: new Date().getTime()
	}
	
	socket.emit('message', {
		type: 'chat',
		command: 'message',
		message: new_message,
		added: false
	});
	
	if(keep){
		chat_massages.push(new_message);
		
		while(chat_massages.length > config.config_chat.max_messages) chat_massages.shift();
	}
}

function chat_checkCommand(command, rank){
	if(chat_commandsList[command] === undefined) return false;
	if(!chat_commandsRank[rank].includes(command)) return false;
	
	return true;
}

function chat_checkMessage(user, socket, message, channel, hide) {
	if(message.trim().length <= 0){
		socket.emit('message', {
			type: 'error',
			error: 'Error: Message is empty!'
		});
		return;
	}
	
	var res = null;
	
	if(chat_ignoreList[user.userid] === undefined) chat_ignoreList[user.userid] = {};
	
	logger.debug(user.name + '(' + user.userid + ') - Chat Message | Message: ' + message);
	
	if (res = /^\/help ([a-zA-Z0-9 ]*)/.exec(message)) {
		if(!chat_checkCommand(res[1], user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
	
		if(res[1] == 'ban'){
			var text_message = 'By using this command you can ban the people that infringe the rules of site! If you ban innocent people you can lose this rank.';
			text_message += '<br><br>Type /ban [user id] [time] [reason]<br><br>For exemple [time] can be [amount][minutes/hours/days/months/years] or [permanent].';
		} else if(res[1] == 'unban'){
			var text_message = 'By using this command you can unban innocent people who have received the ban! If you unban guilty people you can lose this rank.';
			text_message += '<br><br>Type /unban [user id]';
		} else if(res[1] == 'mute'){
			var text_message = 'By using this command you can mute the people that infringe the rules of chat! If you mute innocent people you can lose this rank.';
			text_message += '<br><br>Type /mute [user id] [time] [reason]<br><br>For exemple [time] can be [amount][minutes/hours/days/months/years] or [permanent].';
		} else if(res[1] == 'unmute'){
			var text_message = 'By using this command you can unmute innocent people who have received the mute! If you unmute guilty people you can lose this rank.';
			text_message += '<br><br>Type /unmute [user id]';
		} else if(res[1] == 'deletemsg'){
			var text_message = 'By using this command you can delete messages that are spammed or contain mistakes or others!';
			text_message += '<br><br>Type /deletemsg [message id]';
		} else if(res[1] == 'cleanchat'){
			var text_message = 'By using this command you can clean the chat to be fresh!';
			text_message += '<br><br>Type /cleanchat';
		} else if(res[1] == 'ignorelist'){
			var text_message = 'By using this command you can view the list who contail all players ignored!';
			text_message += '<br><br>Type /ignorelist';
		} else if(res[1] == 'ignore'){
			var text_message = 'By using this command you can ignore the player who has annoyed you or who is spamming you or something else!';
			text_message += '<br><br>Type /ignore [user id]';
		} else if(res[1] == 'unignore'){
			var text_message = 'By using this command you can unignore the player who is ignored!';
			text_message += '<br><br>Type /unignore [user id]';
		} else if(res[1] == 'chatmode'){
			var text_message = 'By using this command you can change the chat mode to be a chat who contain spam or a chat who is stopped or a normal chat!';
			text_message += '<br><br>Type /chatmode [normal / fast / pause]';
		} else if(res[1] == 'setrank'){
			var text_message = 'By using this command you can change the player rank!';
			text_message += '<br><br>Code ranks available:<br>';
			
			chat_ranksList.forEach(function(item, index){
				text_message += item.code + ' - ' + item.rank
				
				if(index < chat_ranksList.length - 1) text_message += ',<br>';
				else text_message += '.';
			});
			
			text_message += '<br><br>Type /setrank [user id] [rank]';
		} else if(res[1] == 'maintenance'){
			var text_message = 'By using this command you can make the site to be in maintenance!';
			text_message += '<br><br>Type /maintenance [message]';
		} else if(res[1] == 'unmaintenance'){
			var text_message = 'By using this command you can make the site to be not in maintenance!';
			text_message += '<br><br>Type /unmaintenance';
		} else if(res[1] == 'banip'){
			var text_message = 'By using this command you can ban all account who have his ip!';
			text_message += '<br><br>Type /banip [user id]';
		} else if(res[1] == 'tradeonline'){
			var text_message = 'By using this command you can make the trade server online or not!';
			text_message += '<br><br>Type /tradeonline [1 / 0]';
		} else if(res[1] == 'playonline'){
			var text_message = 'By using this command you can make the site server online or not!';
			text_message += '<br><br>Type /playonline [1 / 0]';
		} else if(res[1] == 'bantrade'){
			var text_message = 'By using this command you can ban the people that infringe the rules of trade! If you ban innocent people you can lose this rank.';
			text_message += '<br><br>Type /bantrade [user id] [time] [reason]<br><br>For exemple [time] can be [amount][minutes/hours/days/months/years] or [permanent].';
		} else if(res[1] == 'unbantrade'){
			var text_message = 'By using this command you can unban innocent people who have received the ban! If you unban guilty people you can lose this rank.';
			text_message += '<br><br>Type /unbantrade [user id]';
		} else if(res[1] == 'banplay'){
			var text_message = 'By using this command you can unban innocent people who have received the ban! If you unban guilty people you can lose this rank.';
			text_message += '<br><br>Type /banplay [user id] [time] [reason]<br><br>For exemple [time] can be [amount][minutes/hours/days/months/years] or [permanent].';
		} else if(res[1] == 'unbanplay'){
			var text_message = 'By using this command you can unban innocent people who have received the ban! If you unban guilty people you can lose this rank.';
			text_message += '<br><br>Type /unbanplay [user id]';
		} else if(res[1] == 'givecoins'){
			var text_message = 'By using this command you can give coins to people!';
			text_message += '<br><br>Type /givecoins [user id] [amount]';
		} else if(res[1] == 'takecoins'){
			var text_message = 'By using this command you can take coins from people!';
			text_message += '<br><br>Type /takecoins [user id] [amount]';
		} else if(res[1] == 'loadoffers'){
			var text_message = 'By using this command you can load the offers!';
			text_message += '<br><br>Type /loadoffers';
		} else if(res[1] == 'loadprices'){
			var text_message = 'By using this command you can load the prices!';
			text_message += '<br><br>Type /loadprices';
		} else if(res[1] == 'tiprain'){
			var text_message = 'By using this command you can tip coins to rain!';
			text_message += '<br><br>Type /tiprain [amount]';
		} else if(res[1] == 'lastrain'){
			var text_message = 'By using this command you can see when was the last rain!';
			text_message += '<br><br>Type /lastrain';
		} else if(res[1] == 'rollrain'){
			var text_message = 'By using this command you can roll the rain faster than it should have been!';
			text_message += '<br><br>Type /rollrain';
		}
		
		otherMessages(text_message, socket, false);
	} else if (res = /^\/help/.exec(message)) {
		var text_message = 'Available commands: ';
		
		chat_commandsRank[user.rank].forEach(function(item, index){
			text_message += '/' + item;
			
			if(index < chat_commandsRank[user.rank].length - 1) text_message += ', ';
			else text_message += '.';
		});
		
		text_message += '<br><br>If you need help for a command please send /help [command] (Ex: /help ignore).'
		
		otherMessages(text_message, socket, false);
	} else if (res = /^\/ban ([a-z0-9_]*) ([a-zA-Z0-9]*) ([a-zA-Z0-9 ]*)/.exec(message)) {
		if(!chat_checkCommand('ban', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userSetRestriction(user, socket, {
			userid: res[1],
			restriction: 'site',
			time: res[2],
			reason: res[3]
		}, function(){
			io.sockets.in(res[1]).emit('message', {
				type: 'reload'
			});
		});
	} else if (res = /^\/unban ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('unban', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userUnsetRestriction(user, socket, {
			userid: res[1],
			restriction: 'site'
		}, function(){
			io.sockets.in(res[1]).emit('message', {
				type: 'reload'
			});
		});
	} else if (res = /^\/mute ([a-z0-9_]*) ([a-zA-Z0-9]*)/.exec(message)) {
		if(!chat_checkCommand('mute', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}

		res = message.split(' ');
		
		userSetRestriction(user, socket, {
			userid: res[1],
			restriction: 'mute',
			time: res[2],
			reason: res[3]
		});
	} else if (res = /^\/unmute ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('unmute', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userUnsetRestriction(user, socket, {
			userid: res[1],
			restriction: 'mute'
		});
	} else if (res = /^\/deletemessage ([0-9]*)/.exec(message)) {
		if(!chat_checkCommand('deletemessage', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(isNaN(Number(res[1]))){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid message id!'
			});
			return;
		}
		
		var message_id = res[1];
		
		var message_index = chat_massages.findIndex(item => item.id == message_id);
		
		if(message_index == -1){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Unknown message id or already deleted!'
			});
			return;
		}
			
		pool.query('UPDATE `messages` SET `deleted` = 1 WHERE `id` = ' + message_id);
		
		chat_massages.splice(message_index, 1);
		
		io.sockets.emit('message', {
			type: 'chat',
			command: 'delete',
			id: message_id
		});
	} else if (res = /^\/cleanchat/.exec(message)) {
		if(!chat_checkCommand('cleanchat', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(chat_massages.length <=  0){
			socket.emit('message', {
				type: 'error',
				error: 'Error: There are no messages!'
			});
			return;
		}
		
		chat_massages = [];
		
		io.sockets.emit('message', {
			type: 'chat',
			command: 'clean'
		});
		
		var text_message = 'Chat history has been wiped.';
		otherMessages(text_message, io.sockets, false);
	} else if (res = /^\/ignorelist/.exec(message)) {
		if(!chat_checkCommand('ignorelist', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(Object.keys(chat_ignoreList[user.userid]).length <= 0){
			var text_message = 'Your ignore list is empty.';
			otherMessages(text_message, socket, false);
			
			return;
		}
			
		var text_message = 'Ignored users UserId: ';
		
		var props = Object.keys(chat_ignoreList[user.userid]);
		for(var i = 0; i < props.length; i++){
			text_message += props[i];
			
			if(i != props.length - 1) text_message += ', ';
		}
		
		otherMessages(text_message, socket, false);
	} else if (res = /^\/ignore ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('ignore', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		pool.query('SELECT `name` FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err1, row1) {
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			if(row1.length == 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Unknown user to ignore it!'
				});
				return;
			}
			
			if(res[1] == user.userid){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You can\'t ignore yourself!'
				});
				return;
			}
			
			if(chat_ignoreList[user.userid][res[1]] !== undefined){
				socket.emit('message', {
					type: 'error',
					error: 'Error: This user is already ignored!'
				});
				return;
			}
			
			chat_ignoreList[user.userid][res[1]] = true;
			
			socket.emit('message', {
				type: 'chat',
				command: 'ignorelist',
				list: chat_ignoreList[user.userid]
			});
			
			chat_refreshMessages(user, socket);
			
			socket.emit('message', {
				type: 'info',
				info: 'User ' + row1[0].name + ' successfully ignored!'
			});
		});
	} else if (res = /^\/unignore ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('unignore', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		pool.query('SELECT `name` FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err1, row1) {
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			if(row1.length == 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Unknown user to unignore it!'
				});
				return;
			}
			
			if(res[1] == user.userid){
				socket.emit('message', {
					type: 'error',
					error: 'Error: You can\'t unignore yourself!'
				});
				return;
			}
		
			if(chat_ignoreList[user.userid][res[1]] === undefined){
				socket.emit('message', {
					type: 'error',
					error: 'Error: This user is not ignored!'
				});
				return;
			} else if(chat_ignoreList[user.userid][res[1]] == true){
				delete chat_ignoreList[user.userid][res[1]];
				
				socket.emit('message', {
					type: 'chat',
					command: 'ignorelist',
					list: chat_ignoreList[user.userid]
				});
				
				chat_refreshMessages(user, socket);
				
				socket.emit('message', {
					type: 'info',
					info: 'User ' + row1[0].name + ' successfully unignored!'
				});
			}
		});
	} else if (res = /^\/chatmode ([a-zA-Z0-9]*)/.exec(message)) {
		if(!chat_checkCommand('chatmode', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(res[1] != 'normal' && res[1] != 'fast' && res[1] != 'pause'){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid chat mode!'
			});
			return;
		}
		
		chat_mode = res[1];
		
		var text_message = 'Chat has changed to ' + res[1] + ' mode.';
		otherMessages(text_message, io.sockets, true);
	} else if (res = /^\/setrank ([a-z0-9_]*) ([0-9]*)/.exec(message)) {
		if(!chat_checkCommand('setrank', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		res = message.split(' ');

		// var rankInList = chat_ranksList.find(x => x.rank == res[2]);
		var rankInList = chat_ranksList[chat_ranksList.map(x => x.rank).indexOf(res[2].toLowerCase())];

		if(rankInList === undefined){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid rank!'
			});
			return;
		}
		
		pool.query('SELECT `name`, `rank` FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err1, row1) {
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			if(row1.length == 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Unknown user!'
				});
				return;
			}
			
			if(row1[0].rank == res[1].toLowerCase()) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: User have already this rank!'
				});
				return;
			}
			
			pool.query('UPDATE `users` SET `rank` = ' + rankInList.code + ' WHERE `userid` = ' + pool.escape(res[1]));
			
			socket.emit('message', {
				type: 'info',
				info: row1[0].name + ' was changed to ' + rankInList.rank
			});
			
			io.sockets.in(res[1]).emit('message', {
				type: 'info',
				info: 'Your rank was changed to ' + rankInList.rank + ' by ' + user.name
			});
		});
	} else if (res = /^\/maintenance ([a-zA-Z0-9- ]*)/.exec(message)) {
		if(!chat_checkCommand('maintenance', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
			
		pool.query('UPDATE `info` SET `maintenance` = 1, `maintenance_message` = ' + pool.escape(res[1]));
		
		socket.emit('message', {
			type: 'success',
			success: 'Maintenance status setted!'
		});
		
		io.sockets.emit('message', {
			type: 'reload'
		});
	} else if (res = /^\/unmaintenance/.exec(message)) {
		if(!chat_checkCommand('unmaintenance', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
			
		pool.query('UPDATE `info` SET `maintenance` = 0');
		
		socket.emit('message', {
			type: 'success',
			success: 'Maintenance status setted!'
		});
		
		io.sockets.emit('message', {
			type: 'reload'
		});
	} else if (res = /^\/banip ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('banip', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		pool.query('SELECT * FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err1, row1) {
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			if(row1.length == 0) {
				socket.emit('message', {
					type: 'error',
					error: 'Error: Unknown user!'
				});
				return;
			}
			
			pool.query('SELECT `ip` FROM `users_logins` WHERE `userid` = ' + pool.escape(row1[0].userid) + ' ORDER BY `id` DESC LIMIT 1', function(err2, row2) {
				if(err2){
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length == 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: User have no logins!'
					});
					return;
				}
			
				pool.query('SELECT * FROM `bannedip` WHERE `ip` = ' + pool.escape(row2[0].ip), function(err3, row3) {
					if(err3){
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					if(row3.length > 0){
						socket.emit('message', {
							type: 'error',
							error: 'His ip is already banned!'
						});
						return;
					}
					
					pool.query('INSERT INTO `bannedip` SET `ip` = ' + pool.escape(row2[0].ip) + ', `userid` = ' + pool.escape(user.userid) + ', `time` = ' + pool.escape(time()), function(err4) {
						if(err4){
							logger.error(err4);
							writeError(err4);
							return;
						}
						
						socket.emit('message', {
							type: 'info',
							info: 'The ip ' + row2[0].ip + ' was seccesfully banned!'
						});
						
						io.sockets.in(res[1]).emit('message', {
							type: 'reload'
						});
					});
				});
			});
		});
	} else if (res = /^\/bantrade ([a-z0-9_]*) ([a-zA-Z0-9]*) ([a-zA-Z0-9 ]*)/.exec(message)) {
		if(!chat_checkCommand('bantrade', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userSetRestriction(user, socket, {
			userid: res[1],
			restriction: 'trade',
			time: res[2],
			reason: res[3]
		});
	} else if (res = /^\/unbantrade ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('unbantrade', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userUnsetRestriction(user, socket, {
			userid: res[1],
			restriction: 'trade'
		});
	} else if (res = /^\/banplay ([a-z0-9_]*) ([a-zA-Z0-9]*) ([a-zA-Z0-9 ]*)/.exec(message)) {
		if(!chat_checkCommand('banplay', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userSetRestriction(user, socket, {
			userid: res[1],
			restriction: 'play',
			time: res[2],
			reason: res[3]
		});
	} else if (res = /^\/unbanplay ([a-z0-9_]*)/.exec(message)) {
		if(!chat_checkCommand('unbanplay', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		userUnsetRestriction(user, socket, {
			userid: res[1],
			restriction: 'play'
		});
	} else if (res = /^\/tradeonline ([0-1]*)/.exec(message)) {
		if(!chat_checkCommand('tradeonline', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(parseInt(res[1]) != 1 && parseInt(res[1]) != 0){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid online status!'
			});
			return;
		}
		
		pool.query('UPDATE `info` SET `trade` = ' + parseInt(res[1]));
		
		socket.emit('message', {
			type: 'success',
			success: 'Trade status setted!'
		});
	} else if (res = /^\/playonline ([0-1]*)/.exec(message)) {
		if(!chat_checkCommand('playonline', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(parseInt(res[1]) != 1 && parseInt(res[1]) != 0){
			socket.emit('message', {
				type: 'error',
				error: 'Error: Invalid online status!'
			});
			return;
		}
		
		pool.query('UPDATE `info` SET `play` = ' + parseInt(res[1]));
		
		socket.emit('message', {
			type: 'success',
			success: 'Play status setted!'
		});
	} else if (res = /^\/givecoins ([a-z0-9_]*) ([0-9.]*)/.exec(message)) {
		if(!chat_checkCommand('givecoins', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
	
		if(res[1] == user.userid && user.rank != 100){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You can\'t give coins to yourself!'
			});
			return;
		}
		
		verifyFormatAmount(res[2], function(err1, amount){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				return;
			}
		
			pool.query('SELECT `name` FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err2, row2) {
				if(err2){
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length == 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: Unknown receiver!'
					});
					return;
				}
				
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(res[1]) + ', `service` = ' + pool.escape('change_balance') + ', `amount` = ' + amount + ', `time` = ' + pool.escape(time()));
			
				pool.query('UPDATE `users` SET `balance` = `balance` + ' + amount + ' WHERE `userid` = ' + pool.escape(res[1]), function(err3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					io.sockets.in(res[1]).emit('message', {
						type: 'info',
						info: 'You got ' + getFormatAmountString(amount) + ' coins from ' + user.name+'!'
					});
					
					socket.emit('message', {
						type: 'info',
						info: 'You gave ' + getFormatAmountString(amount) + ' coins to ' + row2[0].name+'.'
					});
					
					getBalance(res[1]);
				});
			});
		});
	} else if (res = /^\/takecoins ([a-z0-9_]*) ([0-9.]*)/.exec(message)) {
		if(!chat_checkCommand('takecoins', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(res[1] == user.userid && user.rank != 100){
			socket.emit('message', {
				type: 'error',
				error: 'Error: You can\'t take coins from yourself!'
			});
			return;
		}
		
		verifyFormatAmount(res[2], function(err1, amount){
			if(err1){
				socket.emit('message', {
					type: 'error',
					error: err1.message
				});
				return;
			}
		
			pool.query('SELECT `name`, `balance` FROM `users` WHERE `userid` = ' + pool.escape(res[1]), function(err2, row2) {
				if(err2){
					logger.error(err2);
					writeError(err2);
					return;
				}
				
				if(row2.length == 0) {
					socket.emit('message', {
						type: 'error',
						error: 'Error: Unknown receiver!'
					});
					return;
				}
				
				if(getFormatAmount(row2[0].balance) < amount) amount = getFormatAmount(row2[0].balance);
				
				pool.query('INSERT INTO `users_transactions` SET `userid` = ' + pool.escape(res[1]) + ', `service` = ' + pool.escape('change_balance') + ', `amount` = ' + (-amount) + ', `time` = ' + pool.escape(time()));
			
				pool.query('UPDATE `users` SET `balance` = `balance` - ' + amount + ' WHERE `userid` = ' + pool.escape(res[1]), function(err3){
					if(err3) {
						logger.error(err3);
						writeError(err3);
						return;
					}
					
					io.sockets.in(res[1]).emit('message', {
						type: 'info',
						info: user.name+' took you ' + getFormatAmountString(amount) + ' coins!'
					});
					
					socket.emit('message', {
						type: 'info',
						info: 'You took ' + getFormatAmountString(amount) + ' coins from ' + row2[0].name+'.'
					});
					
					getBalance(res[1]);
				});
			});
		});
	} else if (res = /^\/tiprain ([0-9.]*)/.exec(message)) {
		if(!chat_checkCommand('tiprain', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		rain_tipGame(user, socket, res[1]);
	} else if (res = /^\/lastrain/.exec(message)) {
		if(!chat_checkCommand('lastrain', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		pool.query('SELECT `time_roll` FROM `rain_history` WHERE `ended` = 1 ORDER BY `id` DESC LIMIT 1', function(err1, row1) {
			if(err1) {
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			if(row1.length > 0){
				var last_rain = getFormatSeconds(time() - row1[0].time_roll);
				
				var text_message = 'Last rain was now ' + last_rain.minutes + ' minutes and ' + last_rain.seconds + ' seconds ago.';
				otherMessages(text_message, socket, false);
			} else {
				var text_message = 'This is first rain.';
				otherMessages(text_message, socket, false);
			}
		});
	} else if (res = /^\/rollrain/.exec(message)) {
		if(!chat_checkCommand('rollrain', user.rank)){
			socket.emit('message', {
				type: 'error',
				error: 'Invalid command name provided!'
			});
			return;
		}
		
		if(rain_game.status != 'wait') {
			socket.emit('message', {
				type: 'error',
				error: 'Error: You can only roll the rain until starts!'
			});
			return;
		}
		
		rain_rollGame();
	} else if (res = /^\/([a-zA-Z0-9]*)/.exec(message)) {
		socket.emit('message', {
			type: 'error',
			error: 'Invalid command provided!'
		});
	} else {
		chat_writeMessage(user, socket, message, channel, hide);
	}
}

function chat_writeMessage(user, socket, message, channel){
	if(chat_mode == 'pause' && (user.rank != 1 && user.rank != 2 && user.rank != 100)) return;
			
	if(chat_mode == 'normal') if(chat_userLastMessage[user.userid] + config.config_chat.cooldown_massage > time()) return;
	chat_userLastMessage[user.userid] = time();
	
	var message = chat_safeMessage(message).trim();
	
	if(message.length == 0) {
		socket.emit('message', {
			type: 'error',
			error: 'Error: You can\'t send a empty message.'
		});
		return;
	}
	
	if (message.length > 200) message = message.substr(0, 200);
	
	if(user.restrictions.mute >= time() || user.restrictions.mute == -1){
		socket.emit('message', {
			type: 'error',
			error: 'Error: You are restricted to use our chat. The restriction expires, ' + ((user.restrictions.mute == -1) ? 'never' : makeDate(new Date(user.restrictions.mute * 1000))) + '.'
		});
		return;
	}
	
	if(!config.config_chat.channels.includes(channel)){
		socket.emit('message', {
			type: 'error',
			error: 'Invalid channel!'
		});
		return;
	}

	if(user.xp < 500) { // level 1
		return socket.emit('message', {type: 'error', error: `You need to be atleast level 1 to chat.`});
	}
	
	chat_getMentions(message, function(mentions){
		pool.query('INSERT INTO `messages` SET `userid` = ' + pool.escape(user.userid) + ', `name` = ' + pool.escape(user.name) + ', `avatar` = ' + pool.escape(user.avatar) + ', `rank` = ' + parseInt(user.rank) + ', `xp` = ' + parseInt(user.xp) + ', `message` = ' + pool.escape(message) + ', `channel` = ' + pool.escape(channel) + ', `time` = ' + pool.escape(new Date().getTime()), function(err1, row1){
			if(err1){
				logger.error(err1);
				writeError(err1);
				return;
			}
			
			var new_message = {
				type: 'player',
				id: row1.insertId,
				userid: user.userid,
				name: user.name,
				avatar: user.avatar,
				rank: user.rank,
				level: calculateLevel(user.xp).level,
				message: message,
				channel: channel,
				mentions: mentions,
				time: new Date().getTime()
			}
			
			io.sockets.emit('message', {
				type: 'chat',
				command: 'message',
				message: new_message,
				added: true
			});
			
			chat_massages.push(new_message);
			
			while(chat_massages.length > config.config_chat.max_messages) chat_massages.shift();
		});
	});
}

//GET MENTIONS
function chat_getMentions(message, callback){
	var reg = /\B@([a-f\d]+)/gi;
	var mentions = message.match(reg);
	
	var array = [];
	
	if(!mentions) return callback(array);
	if(mentions.length <= 0) return callback(array);
	
	for(var i = 0; i < mentions.length; i++) mentions[i] = mentions[i].replace('@', '');
	
	pool.query('SELECT * FROM `users` WHERE `userid` IN (' + pool.escape(mentions.join(',')) + ')', function(err1, row1){
		if(err1){
			logger.error(err1);
			writeError(err1);
			return;
		}
		
		row1.forEach(function(mention){
			array.push({
				mention: '@' + mention.userid,
				name: '@' + mention.name
			});
		});
		
		callback(array);
	});
}

function chat_safeMessage(message) {
	function chat_replaceTag(tag) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;'}[tag] || tag; }
	
    return message.replace(/[&<>]/g, chat_replaceTag);
}