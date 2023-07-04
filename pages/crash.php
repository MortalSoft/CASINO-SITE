<link rel="stylesheet" type="text/css" href="/template/css/crash.css" />
<script type="text/javascript" src="/template/js/graph2.js?v=<?php echo time(); ?>"></script>


<script type="text/javascript">
	/*let currentCrash = 0;

	$('body').on('DOMSubtreeModified', '#crash_crash', function() {
	  let val = $(this).text();
	  if(val == '' || val == currentCrash) return;

	  currentCrash = val;

	  let betValues = document.getElementsByClassName('active-crash-bet-value');
	  let bets = document.getElementsByClassName('active-crash-bet');

	  for(let i in betValues) {
	  	if(!betValues[i].innerText) break;
	  	if(!bets[i]) break;

	  	bets[i].innerHTML = (parseFloat(betValues[i].innerText) * (parseFloat(currentCrash))).toFixed(2);
	  }
	});*/
	ResetRocket();
</script>

<div class="crash">
	<div class="left">
		<div class="crash_history_container">
			<div id="crash_history"></div>
			<div class="grd"></div>
		</div>

		<div class="container crash-graph relative">
		  <!--<script>
		    var Engine = {
		      gameState: 'CONNECTING', // either: STARTING, IN_PROGRESS,  ENDED, CONECTING
		      startTime: new Date().getTime(),
		      gameCrash: 0,
		      elapsed: 0,
		      crashTime: 0,
		      graphPayout: 1
		    }
		  </script>-->
		  <div class="cr-main count">
		    <div class="cr-arrows"></div>
		    <div id="CrashScreen" class="CrashScreen">
		      <div class="cr-mtitle" id="Multiplier">X</div>
		      <div class="rocket">
		        <div class="rocket-body">
		          <div class="body"></div>
		          <div class="fin fin-left"></div>
		          <div class="fin fin-right"></div>
		          <div class="window"></div>
		        </div>
		        <div class="exhaust-flame"></div>
		        <ul class="exhaust-fumes">
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		          <li></li>
		        </ul>
		      </div>
		      <div class="cstars">
		        <div class="stars-container">
		          <div class="stars">
		            <div></div><div></div><div></div>
		          </div>
		          <div class="stars">
		            <div></div><div></div><div></div>
		          </div>
		          <div class="stars">
		            <div></div><div></div><div></div>
		          </div>
		          <div class="stars">
		            <div></div><div></div><div></div>
		          </div>
		          <div class="stars-2"></div>
		          <div class="stars-2"></div>
		          <div class="stars-2"></div>
		        </div>
		        <div class="moon"></div>
		        <div class="planet-container">
		          <div class="planet-ring2"></div>
		          <div class="planet"></div>
		          <div class="planet-ring"></div>
		        </div>
		        <div class="meteor-container">
		          <div></div>
		          <div></div>
		          <div></div>
		          <div></div>
		        </div>
		        <div class="meteor-container-2">
		          <div></div>
		          <div></div>
		          <div></div>
		          <div></div>
		        </div>
		      </div>

		      <div id="generated_stars" class="hidden"></div>
		      <div id="generated_planets" class="hidden"></div>
		      <img id="rocket"  class="hidden" src="../template/img/rocket.png">
		      <div id="fire"  class="hidden"></div>
		    </div>
		  </div>
		  <!--<canvas style="display: none;" id="crash-graph"></canvas>-->

		  <div class="mainCrash" style="display: none;">
		    <div class="crashFrame">
		      <div class="crashLeft">
		        <script>
		          var Engine = {
		            gameState: 'CONNECTING', // either: STARTING, IN_PROGRESS,  ENDED, CONECTING
		            startTime: new Date().getTime(),
		            gameCrash: 0,
		            elapsed: 0,
		            crashTime: 0,
		            graphPayout: 1
		          }
		        </script>

		        <canvas id="crash-graph"></canvas>

		        <script>
		          var graph = new Graph();
		          graph.startRendering(document.getElementById('crash-graph'), {
		            controlsSize: 'small',
		            currentTheme: 'black',
		            width: 400,
		            height: 400
		          });
		        </script>
		      </div>
		    </div>
		  </div>

		</div>

    <div class="game-info crash-game-info">
			<div>
				<p>Round hash:</p> <span id="crash_info_hash">-</span>
			</div>
			<div>
				<p>Round secret:</p> <span id="crash_info_secret">-</span>
			</div>
		</div>


    <div class="input_field bet_input_field transition-5" data-border="#de4c41" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">
      <div class="field_container">
        <div class="field_content">
          <input type="text" class="field_element_input" id="betamount_crash" oninput="checkAmountBet($(this).val(), 'crash')" value="0.20">
          
          <div class="field_label transition-5"><i class="fa fa-coins" style="margin:0 4px 0 0;font-size:12px"></i>Bet Amount</div>
        </div>
        
        <div class="field_extra">
          <button class="site-button betshort_action" data-game="crash" data-action="0.01">+0.01</button>
          <button class="site-button betshort_action" data-game="crash" data-action="0.10">+0.10</button>
          <button class="site-button betshort_action" data-game="crash" data-action="1.00">+1.00</button>
          <button class="site-button betshort_action" data-game="crash" data-action="10.00">+10.00</button>
        </div>
      </div>
      
      <div class="field_bottom">
        <div class="field_error" data-error="required">This field is required</div>
        <div class="field_error" data-error="number">This field must be a number</div>
        <div class="field_error" data-error="greater">You must enter a greater value</div>
        <div class="field_error" data-error="lesser">You must enter a lesser value</div>
      </div>
    </div>


    <div class="input_field bet_input_field transition-5" data-border="#de4c41" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">
      <div class="field_container">
        <div class="field_content">
          <input type="text" class="field_element_input" id="betauto_crash" value="2.00">
          
          <div class="field_label transition-5">Auto Cashout (0 = disabled)</div>
        </div>
        
        <div class="field_extra">
          <button class="site-button changeshort_action" data-id="betauto_crash" data-fixed="1" data-action="clear">0</button>
          <button class="site-button changeshort_action" data-id="betauto_crash" data-fixed="1" data-action="-1.00">-1.00</button>
          <button class="site-button changeshort_action" data-id="betauto_crash" data-fixed="1" data-action="1.00">+1.00</button>
          <button class="site-button changeshort_action" data-id="betauto_crash" data-fixed="1" data-action="10.00">+10.00</button>
          <!-- <button class="site-button changeshort_action" data-id="betauto_crash" data-fixed="1" data-action="-10.00">-10.00</button> -->
        </div>
      </div>
      
      <div class="field_bottom">
        <div class="field_error" data-error="required">This field is required</div>
        <div class="field_error" data-error="number">This field must be a number</div>
      </div>
    </div>

    <button class="site-button purple bet-btn custom-btn" id="crash_bet">Place bet</button>
    <button class="site-button pink hidden bet-btn custom-btn" id="crash_cashout">Place bet</button>
	</div>


	<div class="right">
		<h3>
			<div><p></p></div>
			<span>Playing</span>
		</h3>

		<div class="nop" id="crash_nop">
			<i class="fa fa-frown"></i>
			<p>No players yet...</p>
		</div>

		<div class="list" id="crash_betlist">
			<!--<div class="user playing" data-didcrash="true">
				<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/93/9398a99f44d7f8f7e2e99bbde4a1330a23f8bef2_full.jpg" alt="" />

				<p>
					<i class="fa fa-coins"></i>
					<span class="active-crash-bet-value">21.37</span>
				</p>

				<i class="fa fa-long-arrow-alt-right arrow"></i>

				<p class="win">
					<i class="fa fa-coins"></i>
					<span class="active-crash-bet">0.00</span>
				</p>

				<div class="loader"></div>
				<i class="fa fa-times crash-icon"></i>
			</div>-->
		</div>



		<h3 style="margin-top:60px" class="win">
			<div><p></p></div>
			<span>Cashed out</span>
		</h3>

		<div class="nop" id="crash_nop_over">
			<i class="fa fa-frown"></i>
			<p>No players yet...</p>
		</div>

		<div class="list" id="crash_betlist_over">
			<!--<div class="user">
				<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/93/9398a99f44d7f8f7e2e99bbde4a1330a23f8bef2_full.jpg" alt="" />

				<p>
					<i class="fa fa-coins"></i>
					<span>21.37</span>
				</p>

				<i class="fa fa-long-arrow-alt-right arrow"></i>

				<p class="win">
					<i class="fa fa-coins"></i>
					<span class="green">210.37</span>
				</p>

				<div class="res">21.37x</div>
			</div>-->
		</div>
	</div>
</div>