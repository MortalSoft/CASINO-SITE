<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/MortalSoft/Gameloader@main/sg.min.js"></script>
<script>
    function launchGame() {
    <?php
    if($user['userid'])
    {
      $api = $GLOBALS['api']."/api/".$GLOBALS['apiToken']."/createSession?identifier=".$user['userid'];
    } else {
      $api = $GLOBALS['api']."/api/".$GLOBALS['apiToken']."/createSession?identifier=demo555";
    }
    $curl_handle = curl_init();
    curl_setopt($curl_handle, CURLOPT_URL, $api);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
    $curl_data = curl_exec($curl_handle);
    curl_close($curl_handle);

    $response = json_decode($curl_data, true);
    $token = $response['original']['token'];
    ?>

    $('#game_wrapper .error').hide();
    // document.getElementById('game_wrapper').innerHTML = '';
    // document.getElementById('game_wrapper').style.paddingBottom = 'initial';
    document.getElementById('game_wrapper_btns').style.background = '#000000d9';

    var options = {
        target_element: "game_wrapper",
        launch_options: {
            strategy: "iframe",
            game_url: "<?php echo $GLOBALS['api'];?>/play/"+game,
            token: "<?php echo $token; ?>"
        }
    };

    var onSuccess = function (gameDispatcher) { console.log(gameDispatcher) }
    var onError = function (error) { console.log(error) }

    $('#game_wrapper_btns').hide();
    window.sg.launch(options, onSuccess, onError);
  }
  </script>
<link rel="stylesheet" type="text/css" href="/template/css/slots.css?v=4" />
<style type="text/css">
  .balance-box .balance {display: none !important;}
  .balance-box .balance-hidden {display: block !important;}
</style>

<script type="text/javascript">
  $(document).ready(() => {
    if(PATHS.length >= 4) {
      $('.hide_if_battle').hide();
      $('.hide_if_not_battle').show();

      $('#bb_id').text(PATHS[3]);
      $('#bb_link').attr('href', `/slot_arena/${PATHS[3]}`);
    }
  });
</script>

<h2 class="bb hide_if_not_battle" style="margin:0 0 10px">
  <span style="float:left">Slot arena #<span id="bb_id">0</span></span>
  <a href="" id="bb_link">
    <i class="fa fa-chevron-left"></i>
    <span>Go back</span>
  </a>
</h2>

<div id="game_wrapper_c">
  <div id="game_wrapper">
    <div class="btns hide_if_battle" id="game_wrapper_btns">
      <div>
        <button class="theme" onclick="launchGame();">
          <i class="fa fa-play"></i>
          <span>Play</span>
        </button>

        <!--<button onclick="startPlaying('fun')">
          <i class="fa fa-play"></i>
          <span>Fun play</span>
        </button> -->
      </div>
    </div>

    <div class="error" style="display:none">
      <h2>Error</h2>
      <p id="slots_error">This game is currently not supported. Please try again later.</p>
    </div>
  </div>
</div>

<div class="controls">
  <div class="btns">
    <div><svg onclick="enableFullscreen()" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="expand" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-expand fa-w-14 fa-7x"><path fill="currentColor" d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z" class=""></path></svg></div>
    <!-- <div><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="compress" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-compress fa-w-14 fa-5x"><path fill="currentColor" d="M436 192H312c-13.3 0-24-10.7-24-24V44c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v84h84c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm-276-24V44c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v84H12c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24zm0 300V344c0-13.3-10.7-24-24-24H12c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-84h84c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12H312c-13.3 0-24 10.7-24 24v124c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12z" class=""></path></svg></div> -->
  </div>

 <!-- <div class="switch hide_if_battle">
    <p>Real play</p>

    <div onclick="startPlaying()" class="s" data-side="1" id="rf_switch"><div></div></div>

    <p>Fun play</p>
  </div> -->
</div>


<h3 class="sss hide_if_not_battle" style="margin:20px 0 10px"><i class="fa fa-question-circle"></i>How to play?</h3>
<p class="hide_if_not_battle" style="color:#eee;float:left;width:80%;margin:0;text-align:left">
  After the game loads, buy a bonus for the same amount that the battle was for.
  When your bonus spins are over, you will be redirected back to the page with
  battle results. The player with the biggest bonus win takes everything.
</p>

<h3 class="sss hide_if_battle"><i class="fa fa-star"></i>Suggested</h3>
<div class="slotsgames hide_if_battle" id="games"></div>

<!-- <div onclick="loadGame()">click here to load</div> -->
<!-- <div onclick="loadDemo()">click here to load demo</div> -->

<script type="text/javascript">
  let isDebug = localStorage.getItem('vgowitch_debug_url');
  let BACKEND_URL = isDebug ? `http://${isDebug}` : '<?php echo $GLOBALS['siteurl']; ?>:<?php echo $GLOBALS['port']; ?>';
  let isFs = false;
  let gm = '';
  let provider = window.location.href.split('/')[4].split("?")[0];
  let game = new URLSearchParams(window.location.search).get('id');

  let slotsHandler = data => {

    if(data.command == 'launch game') {
      launchGame();
    }
  }

  let startPlaying = type => {
    if(!type) type = gm == 'real' ? 'fun' : 'real';

    if(type == gm) {
      return document.getElementById('game_wrapper_btns').style.display = 'none';
    }

    if(type == 'real') {
      launchGame();
    } else {
      loadDemo();
    }

    document.getElementById('rf_switch').setAttribute('data-side', type == 'real' ? 0 : 1);
    document.getElementById('game_wrapper_btns').style.display = 'none';
  }

  let loadAvailableGame = () => {
    <?php if($user['name']) { echo 'var USER2 = "'.$user['name'].'";'; } else { echo 'var USER2 = "";'; } ?>

    if(USER2 !== '' && USER2 !== null) {
      launchGame();
    } else {
      loadDemo();
    }
  }

  let loadGameSlots = () => {
    setTimeout(() => {
      gm = 'real';
      document.getElementById('rf_switch').setAttribute('data-side', gm == 'real' ? 0 : 1);

      send_request_socket({
        'type': 'slots',
        'command': 'get game',
        'isBonusBattle': PATHS.length >= 4,
        'game': `${provider}:${game}`,
      });
    }, 500);
  }


  let fetchData = async (url = '', body = {}) => {
    try {
      let r = await fetch(`${BACKEND_URL}${url}`, {
        method: 'POST',
        headers: {'Accept': 'application/json','Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });

      let content = await r.json();

      return content;
    } catch(e) {
      $('#game_wrapper iframe').remove();
      $('#game_wrapper .error').show();
      $('#game_wrapper .error p').html(e);
      $('#game_wrapper_btns').hide();
    }
  }

  let loadDemo = async () => {
    gm = 'fun';
    document.getElementById('rf_switch').setAttribute('data-side', gm == 'real' ? 0 : 1);

    let data = await fetchData(`/backend/getDemoGame/${game}`);
    if(!data) data = {};

    if(data.launch_options) launchGame(data.launch_options);
    else {
      $('#game_wrapper iframe').remove();
      $('#game_wrapper .error').show();
      $('#game_wrapper .error p').html(data.message);
      $('#game_wrapper_btns').hide();
    }
  }



  let toggleFsElements = (enabled = true) => {
    let classes = ['header-max', 'header-min-', 'pullout'];

    for(let i in classes) {
      let x = document.getElementsByClassName(classes[i]);

      for(let j in x) {
        if(x[j].style) x[j].style.display = enabled ? 'flex' : 'none';
      }
    }
  }

  let enableFullscreen = () => {
    toggleFsElements(false);

    document.getElementById('game_wrapper').setAttribute('data-fs', true);

    var elem = document.documentElement;
    if(elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }

  let disableFullscreen = () => {
    toggleFsElements(true);

    document.getElementById('game_wrapper').setAttribute('data-fs', false);

    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if(document.msExitFullscreen) document.msExitFullscreen();
  }

  let exitHandler = () => {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

    if(fullscreenElement == null) {
      disableFullscreen();
    }
  }

  document.addEventListener('fullscreenchange', exitHandler, false);
  document.addEventListener('mozfullscreenchange', exitHandler, false);
  document.addEventListener('MSFullscreenChange', exitHandler, false);
  document.addEventListener('webkitfullscreenchange', exitHandler, false);

  let drawGames = (games) => {
    let el = document.getElementById('games');

    for(let i in games) {
      let game = games[i];

      el.innerHTML += `
        <a class="slots-game" data-title="${game.title.toLowerCase()}" href="/slots_game/${game.provider}/${game.identifier2 || game.identifier.split(':')[1]}">
          <div class="game">
            <img onerror="this.onerror=null;this.src='https://cdn.discordapp.com/attachments/912084522936438854/913606134869409842/Frame_12.png'" src="https://cdn.softswiss.net/i/s4/${game.provider}/${game.identifier2}.png" alt="" />

            <div class="overlay"></div>
            <div class="provider">
              <span>${game.provider}</span>
            </div>

            <div class="name">
              <span>${game.title}</span>
            </div>
          </div>
        </a>
      `;
    }
  }

  drawGames([{"title":"All Lucky Clovers","identifier":"softswiss:AllLuckyClover","identifier2":"AllLuckyClover","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":false,"feature_group":"new","devices":["desktop","mobile"],"lines":100,"payout":97,"description":"Next level of gaming experience is presented in slot All Lucky Clovers. The game includes four\r\nmodes which can be played anytime: play with 5, 20, 40 or 100 lines. The layout of the reels\r\nfor 5 and 20 lines is 5С…3. The layout for 40 and 100 line-game is 5С…4. The game features 2\r\nScatters, Expanding Wilds, Gamble Round and a lot of action in general. All Lucky Clovers is\r\nexciting to play and enlarge the winnings.","volatility_rating":"high","hd":true,"multiplier":3000,"restrictions":{"default":{"blacklist":[]}}},{"title":"All Lucky Clovers 100","identifier":"softswiss:AllLuckyClover100","identifier2":"AllLuckyClover100","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":true,"feature_group":"new","devices":["desktop","mobile"],"lines":100,"payout":97,"description":"Next level of gaming experience is presented in slot All Lucky Clovers. The game includes four\r\nmodes which can be played anytime: play with 5, 20, 40 or 100 lines. The layout of the reels\r\nfor 5 and 20 lines is 5С…3. The layout for 40 and 100 line-game is 5С…4. The game features 2\r\nScatters, Expanding Wilds, Gamble Round and a lot of action in general. All Lucky Clovers is\r\nexciting to play and enlarge the winnings.","volatility_rating":"high","hd":true,"multiplier":3000,"restrictions":{"default":{"blacklist":[]}}},{"title":"All Lucky Clovers 20","identifier":"softswiss:AllLuckyClover20","identifier2":"AllLuckyClover20","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":true,"feature_group":"new","devices":["desktop","mobile"],"lines":20,"payout":97,"description":"Next level of gaming experience is presented in slot All Lucky Clovers. The game includes four\r\nmodes which can be played anytime: play with 5, 20, 40 or 100 lines. The layout of the reels\r\nfor 5 and 20 lines is 5С…3. The layout for 40 and 100 line-game is 5С…4. The game features 2\r\nScatters, Expanding Wilds, Gamble Round and a lot of action in general. All Lucky Clovers is\r\nexciting to play and enlarge the winnings.","volatility_rating":"high","hd":true,"multiplier":3000,"restrictions":{"default":{"blacklist":[]}}},{"title":"All Lucky Clovers 40","identifier":"softswiss:AllLuckyClover40","identifier2":"AllLuckyClover40","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":true,"feature_group":"new","devices":["desktop","mobile"],"lines":40,"payout":97,"description":"Next level of gaming experience is presented in slot All Lucky Clovers. The game includes four\r\nmodes which can be played anytime: play with 5, 20, 40 or 100 lines. The layout of the reels\r\nfor 5 and 20 lines is 5С…3. The layout for 40 and 100 line-game is 5С…4. The game features 2\r\nScatters, Expanding Wilds, Gamble Round and a lot of action in general. All Lucky Clovers is\r\nexciting to play and enlarge the winnings.","volatility_rating":"high","hd":true,"multiplier":3000,"restrictions":{"default":{"blacklist":[]}}},{"title":"All Lucky Clovers 5","identifier":"softswiss:AllLuckyClover5","identifier2":"AllLuckyClover5","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":true,"feature_group":"new","devices":["desktop","mobile"],"lines":5,"payout":97,"description":"Next level of gaming experience is presented in slot All Lucky Clovers. The game includes four\r\nmodes which can be played anytime: play with 5, 20, 40 or 100 lines. The layout of the reels\r\nfor 5 and 20 lines is 5С…3. The layout for 40 and 100 line-game is 5С…4. The game features 2\r\nScatters, Expanding Wilds, Gamble Round and a lot of action in general. All Lucky Clovers is\r\nexciting to play and enlarge the winnings.","volatility_rating":"medium","hd":true,"multiplier":3000,"restrictions":{"default":{"blacklist":[]}}},{"title":"Aloha King Elvis","identifier":"softswiss:AlohaKingElvis","identifier2":"AlohaKingElvis","provider":"softswiss","producer":"bgaming","category":"slots","has_freespins":true,"feature_group":"basic","devices":["desktop","mobile"],"lines":25,"payout":94.92,"volatility_rating":"medium-high","hd":true,"released_at":"2021-07-22T00:00:00.000Z","multiplier":2000,"restrictions":{"default":{"blacklist":[]}}}]);

  connect_events.push(loadAvailableGame);
</script>