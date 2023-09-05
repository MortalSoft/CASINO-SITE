<div class="progress-container small width-full mb-2 rp">
	<div class="progress-bar" id="roulette_counter" style="width: 100%"></div>
	<div class="progress-content flex justify-center items-center" id="roulette_timer">Waiting for players...</div>
</div>

<div class="game-info roulette-game-info">
	<div>
		<p>Round hash:</p> <span id="roulette_info_hash">-</span>
	</div>
	<div>
		<p>Round secret:</p> <span id="roulette_info_secret">-</span>
	</div>
</div>

<div class="roulette-case relative mb-1" id="roulette_case">
	<div class="roulette-gradient top"></div>
	<div class="roulette-gradient bottom"></div>

	<div class="roulette-arrow top"></div>
	<div class="roulette-arrow bottom"></div>

	<div class="group-reel flex" id="roulette_spinner">
		<?php 
			for($i = 0; $i <= 7; $i++){
				echo '<div class="flex">
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">1</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">14</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">2</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">13</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">3</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">12</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">4</span></div>
					<div class="reel-item reel-purple flex justify-center items-center"><span class="text-shadow">0</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">11</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">5</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">10</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">6</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">9</span></div>
					<div class="reel-item reel-red flex justify-center items-center"><span class="text-shadow">7</span></div>
					<div class="reel-item reel-black flex justify-center items-center"><span class="text-shadow">8</span></div>
				</div>';
			}
		?>
	</div>
	
	<div class="shadow shadow-left"></div>
	<div class="shadow shadow-right"></div>
	
	<!-- <div class="absolute top-0 bottom-0 left-0 right-0 flex justify-center"> -->
		<!-- <div class="pointer"></div> -->
	<!-- </div> -->
</div>

<div class="flex column gap-2 m-2">
	<div class="flex hidden2" id="roulette_history">
		<div class="inline-block width-6 text-left rl">
			<!-- <span class="inline-block text-upper mr-1 font-6">Previous rolls </span> -->
			<div class="inline-block" id="roulette_rolls"></div>							
		</div>
		
		<div class="inline-block width-6 text-right rl">
			<!-- <span class="inline-block text-upper mr-1 font-6">Last 100 rolls </span> -->
			
			<div class="inline-block">
				<div class='rl-num' id="roulette_hundred_black">0</div>
				<div class="pick-ball pick-ball-black text-shadow flex items-center justify-center"></div>

				<div class='rl-num' id="roulette_hundred_red">0</div>
				<div class="pick-ball pick-ball-red text-shadow flex items-center justify-center"></div>
				
				<div class='rl-num' id="roulette_hundred_purple">0</div>
				<div class="pick-ball pick-ball-purple text-shadow flex items-center justify-center"></div>
			</div>
		</div>
	</div>

	<!-- <div class="game-info">
		<div>Round hash: <span id="roulette_info_hash">hidden</span></div>
		<div>Round secret: <span id="roulette_info_secret">hidden</span></div>
	</div> -->

	<div class="input_field bet_input_field transition-5" data-border="#de4c41">
		<div class="field_container">
			<div class="field_content">
				<input type="text" class="field_element_input" id="betamount_roulette" oninput="checkAmountBet($(this).val(), 'roulette')" value="0.20">
				
				<div class="field_label transition-5" style="padding: 3px 8px"><i class="fa fa-coins" style="margin:0 4px 0 0;font-size:12px"></i>Bet Amount</div>
			</div>
			
			<div class="field_extra rl-buttons">
				<button class="site-button betshort_action" data-game="roulette" data-action="clear">Clear</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="0.01">+0.01</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="0.10">+0.10</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="1.00">+1.00</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="10.00">+10.00</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="100.00">+100.00</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="half">1/2</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="double">x2</button>
				<button class="site-button betshort_action" data-game="roulette" data-action="max">Max</button>
			</div>
		</div>
		
		<div class="field_errors">
			<div class="field_error" data-error="required">This field is required</div>
			<div class="field_error" data-error="number">This field must be a number</div>
			<div class="field_error" data-error="greater">You must enter a greater value</div>
			<div class="field_error" data-error="lesser">You must enter a lesser value</div>
		</div>
	</div>
				
	<div class="flex gap-2 responsive">
		<div class="responsive" id="roulette_panel_red">
			<div>
				<div class="roulette-bet-container">
					<span class="roulette-mytotal">0.00</span>

					<button class="site-button bet-button roulette-bet" data-color="red">Bet 2x</button>
				</div>

				<div class="mt-1" style="margin-top:10px">
					<!-- <div class="items-center text-left text-bold mb-2 font-8">
						<i class="fa fa-money" aria-hidden="true"></i>
						<span class="roulette-mytotal">0.00</span>
					</div> -->
					
					<div class="roulette-high bg-light-transparent flex items-center gap-2 p-2 mb-1">
						<div>
							<img class="roulette-highicon icon-large" src="/template/img/logoav.png">
						</div>
						
						<div class="text-left">
							<!-- <i class="fa fa-trophy" aria-hidden="true"></i> -->
							<!-- <div class="text-upper font-9 text-bold">Highest Red</div> -->
							
							<div class="xmt-1">
								<div class="roulette-highname">No Bets</div>
								<div>
									<i class="fas fa-coins" aria-hidden="true" style="color: #ffc34c"></i>
									<span class="roulette-hightotal">0.00</span>
								</div>
							</div>
						</div>

						<div class="desc">
							<p>Highest</p>
							<p>Red</p>
						</div>
					</div>
					
					<div class="flex items-center justify-between mb-1 rl-total">
						<div>
							<i class="fa fa-users" aria-hidden="true"></i>
							<span class="roulette-betscount">0</span>
						</div>
						
						<div class="roulette-betstotal">
							<span>Total: </span>
							0.00
						</div>
					</div>
					
					<div class="roulette-betslist grid gap-1"></div>


					<!-- <div class="roulette-betslist grid gap-1"><div class="roulette-betitem bg-light-transparent flex items-center justify-between p-2 pr-2 p-1" data-userid="b38c20cd9c93a81c50b8706f" data-amount="11.02" style=""><div class="flex items-center gap-1"><div class="avatar-field tier-bronze relative"><img class="avatar icon-small rounded-full" src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/93/9398a99f44d7f8f7e2e99bbde4a1330a23f8bef2_full.jpg"><div class="level sup-small-left flex justify-center items-center b-d2 bg-dark rounded-full">35</div></div><div class="text-left width-full ellipsis">hxtnv.</div></div><div class="flex items-center">11.02</div></div></div> -->
				</div>
			</div>
		</div>
		
		<div class=" responsive" id="roulette_panel_purple">
			<div>
				<!-- <button class="site-button bet-button roulette-bet" data-color="purple">0, Win 14x</button> -->
				<div class="roulette-bet-container">
					<span class="roulette-mytotal">0.00</span>
					
					<button class="site-button bet-button roulette-bet" data-color="purple">Bet 14x</button>
				</div>
				
				<div class="mt-1" style="margin-top:10px">
					<!-- <div class="items-center text-left text-bold mb-2 font-8">
						<i class="fa fa-money" aria-hidden="true"></i>
						<span class="roulette-mytotal">0.00</span>
					</div> -->
					
					<div class="roulette-high bg-light-transparent flex items-center gap-2 p-2 mb-1">
						<div>
							<img class="roulette-highicon icon-large" src="/template/img/logoav.png">
						</div>
						
						<div class="text-left">
							<!-- <i class="fa fa-trophy" aria-hidden="true"></i> -->
							<!-- <div class="text-upper font-9 text-bold">Highest Red</div> -->
							
							<div class="xmt-1">
								<div class="roulette-highname">No player yet</div>
								<div>
									<i class="fas fa-coins" aria-hidden="true" style="color: #ffc34c"></i>
									<!-- <i class="fa fa-money" aria-hidden="true"></i> -->
									<span class="roulette-hightotal">0.00</span>
								</div>
							</div>
						</div>

						<div class="desc">
							<p>Highest</p>
							<p>Green</p>
						</div>
					</div>
					
					<div class="flex items-center justify-between mb-1 rl-total">
						<div>
							<i class="fa fa-users" aria-hidden="true"></i>
							<span class="roulette-betscount">0</span>
						</div>
						
						<div class="roulette-betstotal">
							<span>Total: </span>
							0.00
						</div>
					</div>
					
					<div class="roulette-betslist grid gap-1"></div>
				</div>
			</div>
		</div>
		
		<div class="responsive" id="roulette_panel_black">
			<div>
				<!-- <button class="site-button bet-button roulette-bet" data-color="black">8 To 14, Win 2x</button> -->
				<div class="roulette-bet-container">
					<span class="roulette-mytotal">0.00</span>
					
					<button class="site-button bet-button roulette-bet" data-color="black">Bet 2x</button>
				</div>
				
				<div class="mt-1" style="margin-top:10px">
					<!-- <div class="items-center text-left text-bold mb-2 font-8">
						<i class="fa fa-money" aria-hidden="true"></i>
						<span class="roulette-mytotal">0.00</span>
					</div> -->
					
					<div class="roulette-high bg-light-transparent flex items-center gap-2 p-2 mb-1">
						<div>
							<img class="roulette-highicon icon-large" src="/template/img/logoav.png">
						</div>
						
						<div class="text-left">
							<!-- <i class="fa fa-trophy" aria-hidden="true"></i> -->
							<!-- <div class="text-upper font-9 text-bold">Highest Red</div> -->
							
							<div class="xmt-1">
								<div class="roulette-highname">No player yet</div>
								<div>
									<i class="fas fa-coins" aria-hidden="true" style="color: #ffc34c"></i>
									<!-- <i class="fa fa-money" aria-hidden="true"></i> -->
									<span class="roulette-hightotal">0.00</span>
								</div>
							</div>
						</div>

						<div class="desc">
							<p>Highest</p>
							<p>Black</p>
						</div>
					</div>
					
					<div class="flex items-center justify-between mb-1 rl-total">
						<div>
							<i class="fa fa-users" aria-hidden="true"></i>
							<span class="roulette-betscount">0</span>
						</div>
						
						<div class="roulette-betstotal">
							<span>Total: </span>
							0.00
						</div>
					</div>
					
					<div class="roulette-betslist grid gap-1"></div>
				</div>
			</div>
		</div>
	</div>
</div>