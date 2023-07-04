<link rel="stylesheet" type="text/css" href="/template/css/esport_temp.css" />
<script type="text/javascript" src="/template/js/esports.js"></script>
<div class="container">
	<div class="body-title">BET<span>SKINS</span>.GG</div>

	<!-- <div id="bettingSlip" class="bet-slip">
		<div class="bet-sclose centered">
			<i class="fas fa-times-circle"></i>
		</div>
		<div id="slipMatches" class="bet-smatches matches">
		</div>
		<div class="bet-sbottom bottom">
			<div class="bet-slbutton betButton" id="betSlipButton">BET</div>
			<input class="bet-slinput" type="text" step="any" name="bet" id="betAmountSlip" placeholder="Bet amount"/>
			<div class="bet-sinfo betInfo">
				<div class="bet-sline total totalOdds">Multiplier:	<span id="totalOdds">x 0.00</span></div>
				<div class="bet-sline total totalWin">Potential win: <span id="totalWin">0</span></div>
			</div>
		</div>
	</div> -->
	<div id="showBettingSlip">
		<div class="left">
			<p class="title">Betting Slip</p>
		</div>
		<div class="right">
			<div class="bets">
				<div class="totalActiveBets">0</div>
				<div>Matches</div>
			</div>
		</div>
	</div>
	<div id="bettingSlip">
		<div class="top">
			<div class="left">
				<p class="title">Betting Slip</p>
			</div>
			<div class="right">
				<div class="icon delete"></div>
				<div class="icon close"></div>
			</div>
		</div>
		<div id="slipMatches" class="matches">
		</div>
		<div class="bottom">
			<div class="betAmountText">Enter bet amount:</div>
			<div class="betInput">
				<input type="text" step="any" name="bet" id="betAmountSlip" placeholder="Bet amount"/>
			</div>
			<div class="betInfo">
				<div class="total totalOdds">
					<div class="text">Total odds:</div>
					<div class="betValue" id="totalOdds">x 0.00</div>
				</div>
				<div class="total totalStake">
					<div class="text">Total stake:</div>
					<div class="betValue" id="totalStake">0</div>
				</div>
				<div class="total totalWin">
					<div class="text">Total potential win:</div>
					<div class="betValue" id="totalWin">0</div>
				</div>
			</div>
			<button class="btn btn-primary betButton" id="betSlipButton">Place bet</button>
		</div>
	</div>

	<div class="sideBetting">
		<div class="gameList">

		<div class="gameInner active" id="csgo" data-game="csgo">
			<img src="/template/img/csgoo.png"/>
			<div class="game">
					<p>COUNTER-STRIKE</p>
			</div>
		</div>
		<div class="gameInner" id="lol" data-game="lol">
			<img src="/template/img/icons8-league-of-legends-48.png"/>
			<div class="game">
				<p>LEAGUE OF LEGENDS</p>
			</div>
		</div>
		<div class="gameInner" id="dota2" data-game="dota">
			<img src="/template/img/icons8-dota-2-48.png"/>
			<div class="game">
				<p>DOTA2</p>
			</div>
		</div>
		<div class="gameInner" id="overwatch" data-game="ow">
			<img src="/template/img/icons8-overwatch-48.png"/>
			<div class="game">
				<p>OVERWATCH</p>
			</div>
		</div>
		<div class="gameInner" id="hearthstone" data-game="hs">
			<img src="/template/img/hearthstone.png"/>
			<div class="game">
				<p>HEARTHSTONE</p>
			</div>
		</div>


		</div>
	</div>

	<div id="myBetsButton" class="myBetsTab">MY BETS<div class="my-bets__toggle"><i class="fa fa-angle-down t--bold my-bets__title--icon"></i></div></div>
	<div id="myBetsPanel" class="myBetsTab">
		<ul class="nav nav-tabs">
			<li class="active"><a data-toggle="tab" href="#pending">Pending</a></li>
			<li><a data-toggle="tab" href="#history">History</a></li>
		</ul>

		<div class="tab-content">
			<div id="pending" class="tab-pane active in"></div>
			<div id="history" class="tab-pane">
				<p>History tickets.</p>
			</div>
		</div>
	</div>

	<div class="mainBetting">
		<div class="bettingMatches">
			<!--div class="bet-ttitle pageName animated fadeInDown delay-1s">
				<span class="csgo">CSGO</span> MATCHES
			</div-->
			<div class="bet-tabs">
			  <div id="bup" class="bet-tab open">Upcoming</div>
			  <div id="blive" class="bet-tab">Live</div>
				<div class="bet-tab bets right"><span class="totalActiveBets">0</span>Matches</div>
			</div>

			<div class="bet-wrapper">
			  <div id="upcoming" class="bet-pane open">
					<div class="open_matches animated slideInRight">
						<div id="open_matches" class="bet_matches">
						</div>
					</div>
			  </div>
			  <div id="live" class="bet-pane">
					<div class="liveMatchFrame"></div>
					<div class="live_matches animated slideInRight">
						<div id="live_matches" class="bet_matches">
						</div>
					</div>
			  </div>
			</div>
		</div>
	</div>
</div>


<!--div class="sideBetting">
	<div class="typeHistory"><b>GAMES</b></div>
	<div class="gameList">

		<div class="gameInner" id="csgo" data-game="csgo">
			<img src="/template/img/csgoo.png"/>
			<div class="game">
					<p>COUNTER-STRIKE</p>
			</div>
		</div>
		<div class="gameInner" id="lol" data-game="lol">
			<img src="/template/img/icons8-league-of-legends-48.png"/>
			<div class="game">
				<p>LEAGUE OF LEGENDS</p>
			</div>
		</div>
		<div class="gameInner" id="dota2" data-game="dota">
			<img src="/template/img/icons8-dota-2-48.png"/>
			<div class="game">
				<p>DOTA2</p>
			</div>
		</div>
		<div class="gameInner" id="overwatch" data-game="ow">
			<img src="/template/img/icons8-overwatch-48.png"/>
			<div class="game">
				<p>OVERWATCH</p>
			</div>
		</div>
		<div class="gameInner" id="hearthstone" data-game="hs">
			<img src="/template/img/hearthstone.png"/>
			<div class="game">
				<p>HEARTHSTONE</p>
			</div>
		</div>
	</div>
</div-->
