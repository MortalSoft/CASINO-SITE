const fetch = require('node-fetch');
const fs = require('fs');

const APIKEY = "";

const providers = [
  'all'
];

const disabledGames = [
];


const getAllProviderGames = () => {
  let list2 = [];
  this.all = [];
  
  console.log(`Start time: ${new Date().toGMTString()}`);

  this.getSingleGame = async (i, cb) => {
    fetch(`https://api-prod.mortalsoft.online/api/`+APIKEY+`/listGames`, {method: 'GET'})
    .then(res => res.json())
    .then((d) => {
      var list = d.data;
      for(let j in list) {
        const game = {
          title: list[j].title,
          identifier: list[j].id,
          identifier2: list[j].name,
          provider: list[j].category,
          producer: list[j].category,
          category: "slots",
          feature_group: "new"
        };
      
        if(providers.includes(game.provider) || providers.includes("all")) {
              if(disabledGames.includes(game.identifier2) || disabledGames.includes(game.provider)) 
              {
                console.log(`[${providers[i]}] Skipping ${game.title} (${parseInt(j) + 1} out of ${list.length})`);
              } else {
                list2.push(game);
                console.log(`[${providers[i]}] Added game ${game.title} (${parseInt(j) + 1} out of ${list.length})`);
              }
        }
      }
      this.all = [...list2, ...this.all];

      fs.writeFileSync(`b_games_all.json`, JSON.stringify(this.all));
      fs.writeFileSync(`disabledGames.json`, JSON.stringify(disabledGames));

      console.log(`Loaded ${list2.length} games from ${providers[i]} (${this.all.length} total)`);

      if(providers[i + 1]) {
        this.getSingleGame(i + 1, cb);
      } else {
        return cb(this.all, this.disabledGames);
      }
  }); 
  }

  this.getSingleGame(0, (games, disabledGames = []) => {
    games = [ ...games];
    
    fs.writeFileSync(`b_games_all.json`, JSON.stringify(games));
    fs.writeFileSync(`disabledGames.json`, JSON.stringify(disabledGames));

    console.log(`Done! Got a total of ${games.length} games from ${providers.length} providers`);
    console.log(`There is a total of ${disabledGames.length} not-working games:`);
    console.log(disabledGames);
  });
}

getAllProviderGames();



















