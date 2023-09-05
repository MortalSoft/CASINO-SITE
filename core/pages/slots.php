<link rel="stylesheet" type="text/css" href="/template/css/slots.css?v=12" />


<div class="sl-options">
  <div class="search">
    <i class="fa fa-search"></i>
    <input type="text" placeholder="Search a game..." oninput="updateSlotsSearch()" id="search_slots" />
  </div>

  <script type="text/javascript">
    let producerNames = [
      {name: 'All', id: 'all'},
      {name: 'Aristocrat', id: 'Aristocrat'},
      {name: 'Betsoft', id: 'Betsoft'},
	    {name: 'Bingo', id: 'Bingo'},
      {name: 'C-Technology', id: 'C-Technology'},
      {name: 'Card', id: 'Card'},
	    {name: 'Greentube', id: 'Greentube'},
      {name: 'Keno', id: 'Keno'},
      {name: 'New', id: 'New'},
	    {name: 'Novomatic', id: 'Novomatic'},
	    {name: 'Playngo', id: 'Playngo'},
	    {name: 'Pragmatic', id: 'Pragmatic'}
    ];

    let liveProducers = [
    ];

    let allGames = [];
    let producers = [];

    let currentProducer = 'all';
    let currentSearch = '';
    let totalResultsShow = 36;
    let searchType = 'slots';


    $(document).ready(() => {
      getGames(() => {
        if(window.location.hash.substring(1) == 'live') {
          switchType('live');
        }

        var wdth = $('.slotsgames .game').width();
        $('.slotsgames2 .game').width(wdth + 'px');
        $('.slotsgames2 .game').attr('data-wdth', wdth);
      });
    });

    let drawProducers = () => {
      let el = document.getElementById('slots_container');
      let producers2 = JSON.parse(JSON.stringify(producers));
      producers2.sort((a, b) => a.localeCompare(b));
      for(let i in producers2) {
        if(producers2[i] == 'all') producers2.splice(i, 1);
      }

      producers2.unshift('all');

      for(let i in producers2) {
        if(!producers2[i]) continue;
        let prodData = producerNames.filter(x => x.id == producers2[i])[0] || {name: producers2[i], id: producers2[i]};

        el.innerHTML += `
          <div class="opt" onclick="selectSlot('${prodData.id}')">
            <p>${prodData.name}</p>

            <div data-providercount="${prodData.id}" ${i == 0 ? 'style="background:var(--site-color-main)"' : ''}>0</div>
          </div>
        `;
      }
    }

    let scrollPopular = dir => {
      var el = $('.slotsgames-scroll[data-type="popular"][data-game="slots"]');
      var el2 = $('.slotsgames2');
      var wdth = $('.slotsgames .game').width();
      if(!wdth) wdth = $('.slotsgames2 .game').width();

      var totalgames = el.children().length;
      var visiblegames = Math.floor(el2.width() / wdth);


      let transform = parseInt(el.attr('data-transform'));
      let newtransform = transform + ((wdth + 30) * (dir == 'left' ? 1 : -1));

      let currentScroll = parseInt(((dir == 'right' ? Math.abs(transform) : transform * -1) + wdth) / wdth);
      if((currentScroll > totalgames - visiblegames) && dir == 'right') return;

      if(newtransform > 0 && dir == 'left') return;

      el.css('transform', `translateX(${newtransform}px)`);
      el.attr('data-transform', newtransform);
    }

    let switchType = (type = 'slots') => {
      searchType = type;
      totalResultsShow = 36;

      $('.cl button').attr('data-active', false);
      $(`.cl button[data-type="${type}"]`).attr('data-active', true);

      if(type == 'slots') {
        if(currentProducer == 'all') {
          $('#games_popular_live').hide();
          $('#games_popular_slots').show();
        } else {
          $('#games_popular_live').hide();
          $('#games_popular_slots').hide();
        }
      } else if(type == 'live') {
        if(currentProducer == 'all') {
          $('#games_popular_slots').hide();
          $('#games_popular_live').show();
        } else {
          $('#games_popular_live').hide();
          $('#games_popular_slots').hide();
        }
      }

      drawGames();
    }

    let loadMore = () => {
      totalResultsShow += 36;

      drawGames();
    }

    let updateSlotsSearch = () => {
      currentSearch = document.getElementById('search_slots').value.toLowerCase();

      // if(totalResultsShow < 36) totalResultsShow = 36;
      totalResultsShow = 36;

      drawGames();
    }

    let selectSlot = (id, shouldClick = true) => {
      let prodData = producerNames.filter(x => x.id == id)[0] || {name: id, id: id};

      document.getElementById('slots_container').setAttribute('data-activeslot', id);
      document.getElementById('slots_selected_name').innerHTML = prodData.name;

      $('[data-providercount]').css('background', '');
      $(`[data-providercount="${prodData.id.toLowerCase()}"]`).css('background', 'var(--site-color-main)');

      currentProducer = prodData.id.toLowerCase();
      totalResultsShow = 36;

      if(liveProducers.includes(prodData.id.toLowerCase())) {
        searchType = 'live';
        $('.cl button').attr('data-active', false);
        $(`.cl button[data-type="live"]`).attr('data-active', true);
      } else {
        searchType = 'slots';
        $('.cl button').attr('data-active', false);
        $(`.cl button[data-type="slots"]`).attr('data-active', true);
      }

      if(id == 'all') {
        $('.disable-non-all').show();

        if(searchType == 'slots') {
          $('#games_popular_live').hide();
          $('#games_popular_slots').show();
        } else {
          $('#games_popular_slots').hide();
          $('#games_popular_live').show();
        }
      } else {
        $('.disable-non-all').hide();
      }

      drawGames();
    }

    let toggleSlotList = () => {
      let el = document.getElementsByClassName('slot-select')[0];

      el.setAttribute('data-active', el.getAttribute('data-active') == 'false' ? 'true' : 'false');
    }
  </script>

  <div class="cl">
    <!-- <button data-type="slots" data-active="true" onclick="switchType('slots')">Slots</button>
    <button data-type="live" data-active="false" onclick="switchType('live')">Live</button> -->
  </div>

  <div class="slot-select" data-active="false" onclick="event.stopPropagation();toggleSlotList()">
    <div class="selected">
      <i class="fa fa-angle-down drop" style="right:25px"></i>

      <p id="slots_selected_name" style="margin-left:10px">All</p>
    </div>


    <div class="options" id="slots_container" data-activeslot="0"></div>
  </div>
</div>

<h3 class="sss disable-non-all" style="margin-top:0px">
  <i class="fa fa-star"></i>
  <span>Popular</span>

  <div class="arrows">
    <div data-action="left" onclick="scrollPopular('left')"><i class="fa fa-long-arrow-left"></i></div>
    <div data-action="right" onclick="scrollPopular('right')"><i class="fa fa-long-arrow-right"></i></div>
  </div>
</h3>

<div class="slotsgames slotsgames2 disable-non-all" id="games_popular_slots"></div>
<div class="slotsgames slotsgames2 disable-non-all" id="games_popular_live" style="display:none"></div>

<h3 class="sss disable-non-all" style="margin-top:40px">
  <i class="fa fa-bars"></i>
  <span>All games</span>
</h3>

<div class="slotsgames" id="games"></div>

<div class="load">
  <p>Loaded <span id="current">0</span> out of <span id="total">0</span> games</p>
  <div style="display:inline-block;width:160px">
    <div class="progress" id="load_progress" style="--progress:0%"></div>
    <div style="width:100%;float:left;height:1px"></div>
    <button onclick="loadMore()" id="load_more_btn">Load more</button>
  </div>
</div>

<script type="text/javascript">
let isDebug = localStorage.getItem('vgowitch_debug_url');
let BACKEND_URL = isDebug ? `https://${isDebug}` : '<?php echo $GLOBALS['siteurl']; ?>:<?php echo $GLOBALS['port']; ?>';

let popularSlots = ['SweetBonanza', 'GatesofOlympus', 'FruitParty2', 'FireHot100', 'BookOfRaDX6GT'];
let popularLive = [];

let displayedGameIds = [];

function isGameDisplayed(gameId) {
  return displayedGameIds.includes(gameId);
}

let returnGameHtml = game => {
  let name = game.title.replaceAll(' ', '').replace(/[^a-zA-Z0-9 ]/g, '');

  let prodData = producerNames.filter(x => x.id == game.producer)[0] || { name: game.producer, id: game.producer };
  if (isGameDisplayed(game.identifier2)) {
    return '';
  }

  if (currentProducer !== 'all' && game.producer.toLowerCase() !== currentProducer) {
    return '';
  }

  displayedGameIds.push(game.identifier2);

  return `
    <a class="slots-game" href="/slots_game/${game.identifier2}" id="game_${game.title.toLowerCase()}">
      <div class="game">
        <img onerror="this.onerror=null;this.setAttribute('src', 'https://steamuserimages-a.akamaihd.net/ugc/885384897182110030/F095539864AC9E94AE5236E04C8CA7C2725BCEFF/');" src="https://api-prod.mortalsoft.online/i/${game.identifier2}.jpg" alt="${name}" />

        <div class="overlay"></div>
        <div class="provider">
          <span>${prodData.name}</span>
        </div>

        <div class="p"><i class="fa fa-play"></i></div>

        <div class="name">
          <span>${game.title}</span>
        </div>
      </div>
    </a>
  `;
};

let drawPopular = () => {
  let pslots = '<div class="slotsgames-scroll" data-type="popular" data-game="slots" data-transform="0">';
  let plive = '<div class="slotsgames-scroll" data-type="popular" data-game="live" data-transform="0">';

  for (let i in allGames) {
    let game = allGames[i];

    let psi = popularSlots.indexOf(game.identifier2);
    let psl = popularLive.indexOf(game.identifier2);

    if (psi !== -1) {
      popularSlots[psi] = game;
    }

    if (psl !== -1) {
      popularLive[psl] = game;
    }
  }

  for (let i in popularSlots) {
    if (typeof popularSlots[i] == 'object') pslots += returnGameHtml(popularSlots[i]);
  }

  for (let i in popularLive) {
    if (typeof popularLive[i] == 'object') plive += returnGameHtml(popularLive[i]);
  }

  pslots += '</div>';
  plive += '</div>';

  document.getElementById('games_popular_slots').innerHTML = pslots;
  document.getElementById('games_popular_live').innerHTML = plive;
}

let getGames = async (cb) => {
  let r = await fetch(`${BACKEND_URL}/backend/games`);
  let content = await r.json();
  let gameCounts = { all: 0 };

  allGames = content;  // Store all games in the allGames array

  for (let i in content) {
    if (content[i] !== null && content[i] !== undefined) {
      if (content[i].producer) {
        if (!gameCounts[content[i].producer]) gameCounts[content[i].producer] = 0;

        gameCounts.all += 1;
        gameCounts[content[i].producer] += 1;
      }

      if (!content[i].provider) content[i].provider = '';
      if (!content[i].producer) content[i].producer = '';
      if (!content[i].title) content[i].title = '';
    }
  }

  producers = [...new Set(content.map(x => x.producer))];
  drawProducers();

  for (let i in gameCounts) {
    let el = document.querySelector(`[data-providercount="${i}"]`);

    el.innerHTML = gameCounts[i];
  }

  drawGames();
  drawPopular();

  if (cb) cb();
}

let drawGames = () => {
  let html = '';
  let livegames = ['live', 'live_classic'];
  let searchList = JSON.parse(JSON.stringify(allGames)); // Use the allGames array for search

  if (currentProducer !== 'all') {
    searchList = searchList.filter(x => x.producer.toLowerCase() == currentProducer);
  }

  if (currentSearch !== '') searchList = searchList.filter(x => x.title.toLowerCase().includes(currentSearch));

  if (searchType == 'slots') {
    searchList = searchList.filter(x => livegames.indexOf(x.feature_group) == -1);
  } else {
    searchList = searchList.filter(x => livegames.includes(x.feature_group));
  }

  if (totalResultsShow > searchList.length) {
    totalResultsShow = searchList.length;
  }

  document.getElementById('load_more_btn').style.display = totalResultsShow >= searchList.length ? 'none' : 'block';

  document.getElementById('current').innerHTML = totalResultsShow;
  document.getElementById('total').innerHTML = searchList.length;
  document.getElementById('load_progress').style.setProperty('--progress', `${(totalResultsShow / searchList.length) * 100}%`);

  displayedGameIds = []; // Reset the displayedGameIds array

  for (let i = 0; i < totalResultsShow; i++) {
    if (searchList[i]) {
      html += returnGameHtml(searchList[i]);
    }
  }

  document.getElementById('games').innerHTML = html;
}

</script>