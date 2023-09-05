var apikey = 'zD50rkNrppMvnUVPD3Sq2yfgjdbx32eo';
var metches_betting = {};
var cooldownGames = {};
var maxbet = 100000000;
var minbet = 1;

loadMatches();
checkWinners();
payTickets();
setInterval(function(){
  loadMatches();
  checkWinners();
  payTickets();
}, 60000);

function betMatches(m, user, socket){
  if(user.userid !== 'b38c20cd9c93a81c50b8706f'){
    return socket.emit('message', {
      type: 'error',
      error: 'Esports is currently disabled - try other games in the meantime!'
    });
  }

  if(!cooldownGames[user.userid]) cooldownGames[user.userid] = {betting: false};

  if(cooldownGames[user.userid]['betting']){
    return socket.emit('message', {
      type: 'error',
      error: 'Error: Wait for ending last action!'
    });
  }



  cooldownGames[user.userid]['betting'] = true;

  var isValidBet = verifyBet(m.bets, m.amount, user);

  if(isValidBet.length < 1) {
    // Valid
    pool.query('UPDATE `users` SET `balance` = `balance` - '+parseInt(m.amount)+' WHERE `userid` = '+pool.escape(user.userid), function(err2) {
      if(err2) {
        logger.error(err2);
        writeError(err2);
        cooldownGames[user.userid]['betting'] = false;
        return;
      }


      var xpGet = m.amount;
      if(new Date().getDay() == 0 || new Date().getDay() == 6) xpGet *= 2;

      if(user.countDeposits >= 1) pool.query('UPDATE `users` SET `available` = `available` + '+parseInt(m.amount / 10)+' WHERE `userid` = '+pool.escape(user.userid));
      pool.query('UPDATE `users` SET `xp` = `xp` + '+parseInt(xpGet)+' WHERE `userid` = '+pool.escape(user.userid));
      pool.query('INSERT INTO `user_transactions` SET `user` = '+pool.escape(user.userid)+', `service` = '+pool.escape('match_betting_bet')+', `title` = '+pool.escape('Bet Match Betting')+', `amount` = '+parseInt(-1*m.amount)+', `time` = '+pool.escape(time()));

      var odds = calculateOdds(m.bets);

      logger.info('insert into bet_tickets');
      logger.info(user);
      logger.info(`${user.userid} / ${pool.escape(user.userid)}`);

      // Create specific ticket
      pool.query('INSERT INTO `bet_tickets` SET `user` = '+pool.escape(user.userid)+', `odds` = '+pool.escape(odds)+', `amount` = '+parseInt(m.amount), function(err3, row3) {
        if(err3) {
          logger.error(err3);
          writeError(err3);
          cooldownGames[user.userid]['betting'] = false;
          return;
        }


        var createdTicket = row3.insertId;

        // Insert matches for specific ticket
        for(var i = 0; i < m.bets.length; i++) {
          var match = m.bets[i];
          var multiplier = parseFloat(metches_betting[match.id]['opponent' + match.pick]['bet']).toFixed(2);

          pool.query('INSERT INTO `match_ticket` SET `matchid` = '+pool.escape(match.id)+', `ticketid` = '+pool.escape(createdTicket)+', `opponent` = '+parseInt(match.pick) + ', `multiplier` = '+ multiplier + ', `bet_amount` = '+ m.amount, function(err4, row4) {
            if(err4) {
              logger.error(err4);
              writeError(err4);
              cooldownGames[user.userid]['betting'] = false;
              return;
            }
          });
        }


        socket.emit('matchBettingDone', {
          success: true,
          errors: null,
          message: 'Ticket #' + createdTicket + ' created. Possible winnings are ' + parseInt(odds * m.amount) + '. Enjoy!'
        });

        getUserTickets(user,socket);
        loadMatches();
        getBalance(user.userid);
        addToFooterStats();
        cooldownGames[user.userid]['betting'] = false;
      });
    });
  } else {
    // Return errors
    cooldownGames[user.userid]['betting'] = false;
    socket.emit('matchBettingDone', {
      success: false,
      errors: isValidBet
    });
  }
}

function verifyBet(bets, amount, user) {
  var matchesErrors = [];
  var sameMatch = [];

  for(var i = 0; i < bets.length; i++) {
    var match = bets[i];

    if(isInArray(match.id, sameMatch)) {
      matchesErrors.push({
        matchid: match.id,
        message: 'You cannot bet on the same match twice.'
      });
    }

    sameMatch.push(match.id);

    if(match.pick != 1 && match.pick != 2){
      matchesErrors.push({
        matchid: match.id,
        message: 'Invalid opponent'
      });
    }

    if(metches_betting[match.id] === undefined){
      matchesErrors.push({
        matchid: match.id,
        message: 'Invalid match'
      });
    } else {
      if(metches_betting[match.id]['status'] != 'not_started'){
        matchesErrors.push({
          matchid: match.id,
          message: 'This match have stopped bets and starting soon'
        });
      }
    }

    if(!(/(^[0-9]*$)/.exec(amount))){
      matchesErrors.push({
        matchid: match.id,
        message: 'Invalid bet amount! ['+minbet.format(0, 3)+'-'+maxbet.format(0, 3)+']'
      });
    }

    if((parseInt(amount) < minbet) || (parseInt(amount) > maxbet)) {
      matchesErrors.push({
        matchid: match.id,
        message: 'Invalid bet amount ['+minbet.format(0, 3)+'-'+maxbet.format(0, 3)+']'
      });
    }

    if(user.balance < parseInt(amount)) {
      matchesErrors.push({
        matchid: match.id,
        message: 'You do not have enough money'
      });
    }
  }

  return matchesErrors;
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function calculateOdds(bets) {
  var odds = 0;

  for(var i = 0; i < bets.length; i++) {
    var match = metches_betting[bets[i].id];
    var pick = match['opponent' + bets[i].pick];

    if(odds == 0) {
      odds = pick.bet;
    } else {
      odds *= pick.bet;
    }
  }

  return parseFloat(odds).toFixed(2);
}

function loadMatches(){
  request('https://esport-api.com/api/v2/?token=' + apikey + '&date=future', function(err1, response1) {
    if(err1) {
      logger.error(err1);
      writeError(err1);
      return;
    }


    if(response1.body[0] == '<') return;
    var matches = JSON.parse(response1.body);

    if(matches.length > 0){
      matches.forEach(function(match){
        match.timestamp = new Date(match.date) / 1000;
        if(match.timestamp <= new Date().getTime() / 1000 + 18 * 60 * 60){
          pool.query('SELECT * FROM `matches` WHERE `matchid` = '+parseInt(match.id), function(err2, row2){
            if(err2) {
              logger.error(err2);
              writeError(err2);
              return;
            }

            var scoreO1 = 0;
            var scoreO2 = 0;
            if(match.scoreOpponent1) scoreO1 = parseInt(match.scoreOpponent1);
            if(match.scoreOpponent2) scoreO2 = parseInt(match.scoreOpponent2);

            var provably_winO1 = '50%';
            var provably_winO2 = '50%';
            if(match.winProbabilityOpponent1) provably_winO1 = match.winProbabilityOpponent1;
            if(match.winProbabilityOpponent2) provably_winO2 = match.winProbabilityOpponent2;

            var betO1 = 2;
            var betO2 = 2;
            if(match.betOpponent1 && match.betOpponent2){
              betO1 = parseFloat(match.betOpponent1).toFixed(2);
              betO2 = parseFloat(match.betOpponent2).toFixed(2);
            } else if(match.winProbabilityOpponent1 && match.winProbabilityOpponent2){
              var pO1 = parseFloat(match.winProbabilityOpponent1.split('%')[0]).toFixed(2);
              var pO2 = parseFloat(match.winProbabilityOpponent2.split('%')[0]).toFixed(2);

              betO1 = parseFloat(100 / pO1).toFixed(2);
              betO2 = parseFloat(100 / pO2).toFixed(2);
            }

            if(match.bet1 == '') match.bet1 = 2;
            if(match.bet2 == '') match.bet2 = 2;

            if(row2.length == 0){
              pool.query('INSERT INTO `matches` SET `bet1` = ' + pool.escape(match.bet1) + ', `bet2` = ' + pool.escape(match.bet2) + ', `matchid` = '+parseInt(match.id)+', `time` = '+pool.escape(match.timestamp)+', `game` = '+pool.escape(match.game)+', `status` = '+pool.escape(match.status)+', `opponent1_name` = '+pool.escape(match.opponent1)+', `opponent1_score` = '+parseInt(scoreO1)+', `opponent1_bet` = '+parseFloat(betO1)+', `opponent1_probably_win` = '+pool.escape(provably_winO1)+', `opponent2_name` = '+pool.escape(match.opponent2)+', `opponent2_score` = '+parseInt(scoreO2)+', `opponent2_bet` = '+parseFloat(betO2)+', `opponent2_probably_win` = '+pool.escape(provably_winO2)+', `stream_link` = '+pool.escape(match.streamlink)+', `name_tournament` = '+pool.escape(match.tournament), function(err3, row3){
                if(err3) {
                  logger.error(err3);
                  writeError(err3);
                  return;
                }

                metches_betting[match.id] = {
                  matchid: match.id,
                  status: match.status,
                  game: match.game,
                  bet1: match.bet1,
                  bet2: match.bet2,
                  opponent1: {
                    name: match.opponent1,
                    logo: match.opponent1Logo,
                    score: scoreO1,
                    bet: parseFloat(betO1),
                    probably_win: provably_winO1,
                    bets: 0,
                    total_bets: 0
                  },
                  opponent2: {
                    name: match.opponent2,
                    logo: match.opponent2Logo,
                    score: scoreO2,
                    bet: parseFloat(betO2),
                    probably_win: provably_winO2,
                    bets: 0,
                    total_bets: 0
                  },
                  time: match.timestamp,
                  stream_link: match.streamLink1,
                  name_tournament: match.tournament
                }

                io.sockets.emit('message', {
                  type: 'betting',
                  command: 'add_match',
                  match: metches_betting[match.id]
                });
              });
            } else {
              pool.query('UPDATE `matches` SET `bet1` = ' + pool.escape(match.bet1) + ', `bet2` = ' + pool.escape(match.bet2) + ', `time` = '+pool.escape(match.timestamp)+', `status` = '+pool.escape(match.status)+', `opponent1_name` = '+pool.escape(match.opponent1)+', `opponent1_score` = '+parseInt(scoreO1)+', `opponent1_bet` = '+parseFloat(betO1)+', `opponent1_probably_win` = '+pool.escape(provably_winO1)+', `opponent2_name` = '+pool.escape(match.opponent2)+', `opponent2_score` = '+parseInt(scoreO2)+', `opponent2_bet` = '+parseFloat(betO2)+', `opponent2_probably_win` = '+pool.escape(provably_winO2)+' WHERE `matchid` = '+pool.escape(match.id), function(err3, row3){
                if(err3) {
                  logger.error(err3);
                  writeError(err3);
                  return;
                }

                pool.query('SELECT COUNT(*) AS `bets`, SUM(bet_amount) AS `total_bets` FROM `match_ticket` WHERE `opponent` = 1 AND `matchid` = '+pool.escape(match.id)+' GROUP BY `matchid`', function(err4, row4){
                  if(err4) {
                    logger.error(err4);
                    writeError(err4);
                    return;
                  }

                  pool.query('SELECT COUNT(*) AS `bets`, SUM(bet_amount) AS `total_bets` FROM `match_ticket` WHERE `opponent` = 2 AND `matchid` = '+pool.escape(match.id)+' GROUP BY `matchid`', function(err5, row5){
                    if(err5) {
                      logger.error(err5);
                      writeError(err5);
                      return;
                    }

                    var o1_bets = 0;
                    var o1_total_bets = 0;
                    if(row4.length){
                      o1_bets = row4[0].bets;
                      o1_total_bets = row4[0].total_bets;
                    }

                    var o2_bets = 0;
                    var o2_total_bets = 0;
                    if(row5.length){
                      o2_bets = row5[0].bets;
                      o2_total_bets = row5[0].total_bets;
                    }

                    if(match.status == 'ended'){
                      if(metches_betting[match.id] !== undefined) delete metches_betting[match.id];
                    } else {
                      metches_betting[match.id] = {
                        matchid: match.id,
                        status: match.status,
                        game: match.game,
                        bet1: match.bet1,
                        bet2: match.bet2,
                        opponent1: {
                          name: match.opponent1,
                          logo: match.opponent1Logo,
                          score: scoreO1,
                          bet: parseFloat(betO1),
                          probably_win: provably_winO1,
                          bets: o1_bets,
                          total_bets: o1_total_bets
                        },
                        opponent2: {
                          name: match.opponent2,
                          logo: match.opponent2Logo,
                          score: scoreO2,
                          bet: parseFloat(betO2),
                          probably_win: provably_winO2,
                          bets: o2_bets,
                          total_bets: o2_total_bets
                        },
                        time: match.timestamp,
                        stream_link: match.streamLink1,
                        name_tournament: match.tournament,
                        bets: 0,
                        total_bets: 0
                      }

                      io.sockets.emit('message', {
                        type: 'betting',
                        command: 'add_match',
                        match: metches_betting[match.id]
                      });
                    }
                  });
                });
              });
            }
          });
        }
      });
    }
  });
}

function checkWinners() {
  // logger.info('Checking winners');
  pool.query('SELECT `matchid` FROM `matches` WHERE `status` = '+pool.escape('live'), function(err1, row1){
    if(err1) {
      // logger.error(err1);
      writeError(err1);
      return;
    }

    row1.forEach(function(match_sql){
      request('https://esport-api.com/api/v2/?token=' + apikey + '&matchid=' + pool.escape(match_sql.matchid), function(err2, response2) {
        if(err2) {
          logger.error(err2);
          return writeError(err2);
        }

        if(response2.body[0] == '<') return;


        var match = JSON.parse(response2.body)[0];

        if(match.status == 'ended'){ 
          var winner_opponent = match.result1 == 'won' ? 1 : 2;
          var multiplyer = match.result1 == 'won' ? parseFloat(match.bet1) : parseFloat(match.bet2);

          // logger.info(`match ${match.matchid} has ended, winner: ${match.result1} / ${match.result2}`)

          pool.query('SELECT * FROM `match_ticket` WHERE `matchid` = '+pool.escape(match.matchid) + ' AND `is_finished` = 0', function(err3, bets){
            if(err3) {
              logger.error(err3);
              return writeError(err3);
            }

            pool.query('UPDATE `matches` SET `status` = '+pool.escape(match.status)+', `opponent1_name` = '+pool.escape(match.opponent1)+', `opponent2_name` = '+pool.escape(match.opponent2)+' WHERE `matchid` = '+pool.escape(match.matchid), function(err3, row3){
              if(err3) {
                logger.error(err3);
                return writeError(err3);
              }


              if(metches_betting[match.matchid] !== undefined) delete metches_betting[match.matchid];
            });

            if(bets.length <= 0) return;

            bets.forEach(function(bet){
              // Check if passed
              var isPassed = bet.opponent == winner_opponent;

              pool.query('UPDATE `match_ticket` SET `is_finished` = 1, `is_passed` = ' + pool.escape(isPassed) + ' WHERE `id` = ' + pool.escape(bet.id), function(err4) {
                if(err4) {
                  logger.error(err4);
                  return writeError(err4);
                }
              });
            });
          });
        } else if(match.status == 'deleted' || match.status == 'cancelled' || match.status == 'abandoned') {
          pool.query('SELECT * FROM `match_ticket` WHERE `matchid` = '+pool.escape(match.matchid) + ' AND `is_finished` = 0', function(err3, bets){
            if(err3) {
              logger.error(err3);
              return writeError(err3);
            }

            pool.query('UPDATE `matches` SET `status` = '+pool.escape(match.status)+', `opponent1_name` = '+pool.escape(match.opponent1)+', `opponent2_name` = '+pool.escape(match.opponent2)+' WHERE `matchid` = '+pool.escape(match.matchid), function(err3, row3){
              if(err3) {
                logger.error(err3);
                return writeError(err3);
              }

              if(metches_betting[match.matchid] !== undefined) delete metches_betting[match.matchid];
            });

            if(bets.length <= 0) return;

            bets.forEach(function(bet){
              pool.query('UPDATE `match_ticket` SET `is_finished` = 1, `is_passed` = 1, `is_draw` = 1 WHERE `id` = ' + pool.escape(bet.id), function(err4) {
                if(err4) {
                  logger.error(err4);
                  writeError(err4);
                  return;
                }
              });
            });
          });
        }
      });
    });
  })
}

function payTickets() {
  // logger.info('Pay tickets');
  // Find active tickets
  pool.query('SELECT * FROM `bet_tickets` WHERE `is_active` = 1', function(err1, tickets){
    if(err1) {
      logger.error(err1);
      writeError(err1);
      return;
    }

    // if(tickets.length < 1) logger.info('No unprocessed tickets');

    tickets.forEach(function(ticket){
      // Find matches per ticket
      pool.query('SELECT * FROM `match_ticket` WHERE `ticketid` = ' + pool.escape(ticket.id), function(err2, ticket_matches){
        if(err2) {
          logger.error(err2);
          writeError(err2);
          return;
        }

        var allFinished = true;
        var allPassed = true;
        var drawMultipier = 1;

        ticket_matches.forEach(function(match){
          if(!match.is_finished) allFinished = false;
          if(match.is_finished && !match.is_passed) allPassed = false;
          if(match.is_finished && match.is_draw) drawMultipier *= match.multiplier;
        });

        if(allFinished) {
          if(allPassed) {
            var amountBet = ticket.amount;
            var odds = parseFloat(ticket.odds / drawMultipier).toFixed(2);

            logger.info('Paying user ' + ticket.user + 'for ticket #' + ticket.id + ' ' + parseInt(amountBet * odds) + ' coins.');

            pool.query('UPDATE `users` SET `balance` = `balance` + '+parseInt(amountBet * odds)+' WHERE `userid` = '+pool.escape(ticket.user), function(err3) {
              if(err3) {
                logger.error(err3);
                writeError(err3);
                return;
              }

              pool.query('INSERT INTO `user_transactions` SET `user` = '+pool.escape(ticket.user)+', `service` = '+pool.escape('match_betting_winnings')+', `title` = '+pool.escape('Winnings Match Betting')+', `amount` = '+parseInt(amountBet * odds)+', `time` = '+pool.escape(time()));

              getBalance(ticket.user);
            });
          } else {
            // Update ticket to inactive
            logger.info('Not all matches are passed for ticket #' + ticket.id + '. Setting it to inactive.');
          }

          pool.query('UPDATE `bet_tickets` SET `is_active` = 0 WHERE `id` = '+pool.escape(ticket.id));
        } else {
          logger.info('Not all matches are finished for ticket #' + ticket.id);
        }
      })
    });
  })
}











async function getUsersBetTickets(userid) {
  return new Promise( (resolve) => {
    pool.query('SELECT * FROM `bet_tickets` WHERE is_active = 1 AND user = ' + pool.escape(userid), (error, row) => {
          resolve ({err: error, result: row});
        });
    });
}

async function getUsersHistoryTickets(userid) {
  return new Promise( (resolve) => {
    pool.query('SELECT * FROM `bet_tickets` WHERE is_active = 0 AND user = ' + pool.escape(userid), (error, row) => {
          resolve ({err: error, result: row});
        });
    });
}

async function getMatchesPerTicket(ticketid) {
  return new Promise( (resolve) => {
    pool.query('SELECT * FROM `match_ticket` WHERE `ticketid` = ' + pool.escape(ticketid), (error, row) => {
          resolve ({err: error, result: row});
        });
    });
}

async function getMatchDetails(matchid) {
  return new Promise( (resolve) => {
    pool.query('SELECT * FROM `matches` WHERE `matchid` = ' + pool.escape(matchid), (error, row) => {
          resolve ({err: error, result: row});
        });
    });
}

async function getUserTickets(user, socket) {
  try {
    var ticketsToSend = [];

    var userBetTickets = await getUsersBetTickets(user.userid);
    logger.info(`found ${userBetTickets.result.length} tickets for ${user.userid}`);

    if(userBetTickets.err) {
      logger.error(userBetTickets.err);
      writeError(userBetTickets.err);
      return;
    }

    for(const ticket of userBetTickets.result) {
      var matchesPerTicket = await getMatchesPerTicket(ticket.id);

      if(matchesPerTicket.err) {
        logger.error(matchesPerTicket.err);
        writeError(matchesPerTicket.err);
        return;
      }

      var newTicket = {
        id: ticket.id,
        amount: ticket.amount,
        odds: ticket.odds,
        matches: []
      };

      for(const match of matchesPerTicket.result) {
        var matchDetails = await getMatchDetails(match.matchid);

        if(matchDetails.err) {
          logger.error(matchDetails.err);
          writeError(matchDetails.err);
          return;
        }

        var newMatch = {
          id: match.matchid,
          opponent: match.opponent,
          is_passed: match.is_passed,
          is_finished: match.is_finished,
          is_draw: match.is_draw,
          multiplier: match.multiplier,
          opponent1_name: matchDetails.result[0].opponent1_name,
          opponent2_name: matchDetails.result[0].opponent2_name,
          opponent_winner: matchDetails.result[0]['opponent' + match.opponent + '_name']
        }

        newTicket.matches.push(newMatch);
      }

      ticketsToSend.push(newTicket);
    }

    socket.emit('user tickets', {
      tickets: ticketsToSend
    });
  } catch(e) {
    logger.error('failed to get tickets');
    logger.error(e);
  }
  /*
  pool.query('SELECT * FROM `bet_tickets` WHERE is_active = 1 AND user = ' + pool.escape(user.userid), function(err1, tickets) {

    if(err1) {
      logger.error(err1);
      writeError(err1);
      return;
    }

    tickets.forEach(function(ticket){
      // Find matches per ticket
      pool.query('SELECT * FROM `match_ticket` WHERE `ticketid` = ' + pool.escape(ticket.id), function(err2, ticket_matches){
        if(err2) {
          logger.error(err2);
          writeError(err2);
          return;
        }

        var newMatches = [];

        ticket_matches.forEach(function(match){
          var matchToSend = {
            id: match.matchid,
            opponent: match.opponent,
            is_passed: match.is_passed,
            is_finished: match.is_finished,
            is_draw: match.is_draw,
            multiplier: match.multiplier,
          };

          newMatches.push(matchToSend);
        });

        ticketsToSend.push({
          id: ticket.id,
          amount: ticket.amount,
          odds: ticket.odds,
          matches: newMatches
        });
      });
    });

  });*/
}

async function getUserHistoryTickets(user, socket) {
  var ticketsToSend = [];

  var userBetTickets = await getUsersHistoryTickets(user.userid);

  if(userBetTickets.err) {
    logger.error(userBetTickets.err);
    writeError(userBetTickets.err);
    return;
  }

  for(const ticket of userBetTickets.result) {
    var matchesPerTicket = await getMatchesPerTicket(ticket.id);

    if(matchesPerTicket.err) {
      logger.error(matchesPerTicket.err);
      writeError(matchesPerTicket.err);
      return;
    }

    var newTicket = {
      id: ticket.id,
      amount: ticket.amount,
      odds: ticket.odds,
      matches: []
    };

    var allFinished = true;
    var allPassed = true;
    var drawMultipier = 1;

    for(const match of matchesPerTicket.result) {
      var matchDetails = await getMatchDetails(match.matchid);

      if(matchDetails.err) {
        logger.error(matchDetails.err);
        writeError(matchDetails.err);
        return;
      }

      if(!match.is_finished) allFinished = false;
      if(match.is_finished && !match.is_passed) allPassed = false;
      if(match.is_finished && match.is_draw) drawMultipier *= match.multiplier;

      var newMatch = {
        id: match.matchid,
        opponent: match.opponent,
        is_passed: match.is_passed,
        is_finished: match.is_finished,
        is_draw: match.is_draw,
        multiplier: match.multiplier,
        opponent1_name: matchDetails.result[0].opponent1_name,
        opponent2_name: matchDetails.result[0].opponent2_name,
        opponent_winner: matchDetails.result[0]['opponent' + match.opponent + '_name']
      }

      newTicket.matches.push(newMatch);
    }

    if(allFinished) {
      if (allPassed) {
        newTicket.is_passed = true;
      } else {
        newTicket.is_passed = false;
      }
    }

    newTicket.odds = newTicket.odds / drawMultipier;

    ticketsToSend.push(newTicket);
  }

  socket.emit('user history tickets', {
    tickets: ticketsToSend
  });
}
