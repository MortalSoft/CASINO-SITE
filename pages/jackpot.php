<!--<div class="width-12 inline-table">
	<div class="width-full inline-grid">
		<div class="panel-histories small flex gap-1 p-2" id="jackpot_histories">
			<div class="flex justify-center items-center width-full height-full">No jackpot histories</div>
		</div>
	</div>
</div>-->

<div class="mt-2 jackpot">
	<div class="game-info">
		<div>
			<p>Server seed:</p> <span id="jackpot_info_hash">-</span>
		</div>
		<div>
			<p>EOS Block ID:</p> <span id="jackpot_info_secret">-</span>
		</div>
		<!-- <div>
			<p>Round percentage:</p> <span id="jackpot_info_percentage">-</span>
		</div> -->
	</div>

	<!--<div class="jackpot-case relative hidden mb-2 transition-5" id="jackpot_case" style="height:0">
		<div class="group-reel flex" id="jackpot_spinner"></div>
		
		<div class="shadow shadow-left"></div>
		<div class="shadow shadow-right"></div>-->
		<!-- <div class="arrow"></div> -->

		<!-- <div class="overlay">
			<p>Waiting for players...</p>
		</div>
		
		<div class="absolute top-0 bottom-0 left-0 right-0 justify-center" style="display:block">
			<div class="flex items-center"></div>
		</div>
	</div> -->

	<div class="flex responsive justify-center">
		<div class="jpppp">
				<!--<div class="progress-container meter small width-full rounded-0 mb-2 jp-progress">
					<div class="transition-10 linear rounded-0" id="jackpot_counter" style="width: 100%"></div>
					<div class="progress-content flex justify-center items_center" id="jackpot_timer">
						Waiting for players...
					</div>
				</div> -->
				
				<!--<div class="flex justify-between">
					<div class="bg-main-transparent rounded-1 b-d2 pl-2 pr-2 flex items-center justify-center">
						<span class="mr-2">JACKPOT</span>
						<div class="coins"></div>
						<span class="ml-2"><span id="jackpot_total">0.00</span></span>
					</div>
					
					<div class="bg-main-transparent rounded-1 b-d2 pl-2 pr-2 flex items-center justify-center">
						<span>CHANCE</span>
						<span class="ml-2"><span id="jackpot_mychange">0.00</span>%</span>
					</div>
				</div>-->
			
			<div class="input_field jackpot-input bet_input_field transition-5" data-border="#de4c41">
				<div class="field_container">
					<div class="field_content jp">
						<input type="text" class="field_element_input" id="betamount_jackpot" oninput="checkAmountBet($(this).val(), 'jackpot')" value="0.20">
						
						<div class="field_label transition-5"><i class="fa fa-coins" style="margin:0 4px 0 0;font-size:12px"></i>Bet Amount</div>
					</div>
					
					<div class="field_extra jp">
						<button class="site-button betshort_action" data-game="jackpot" data-action="0.01">+0.01</button>
						<button class="site-button betshort_action" data-game="jackpot" data-action="0.10">+0.10</button>
						<button class="site-button betshort_action" data-game="jackpot" data-action="1.00">+1.00</button>
						<button class="site-button betshort_action" data-game="jackpot" data-action="10.00">+10.00</button>
						<button class="site-button betshort_action" data-game="jackpot" data-action="100.00">+100.00</button>
						<button class="site-button purple" id="jackpot_bet">Join jackpot</button>
					</div>
				</div>
				
				<div class="field_bottom">
					<div class="field_error" data-error="required">This field is required</div>
					<div class="field_error" data-error="number">This field must be a number</div>
					<div class="field_error" data-error="greater">You must enter a greater value</div>
					<div class="field_error" data-error="lesser">You must enter a lesser value</div>
				</div>
			</div>

			<!--<div class="stats">
				<div class="box">
					<span class="title2">Total amount</span>
					<p>
						<span id="jackpot_total">0.00</span>
						<i class="fa fa-coins"></i>
					</p>
				</div>

				<div class="box">
					<span class="title2">Your part</span>
					<p>
						<span id="jackpot_mypart">0.00</span>
						<i class="fa fa-coins"></i>
					</p>
				</div>

				<div class="box">
					<span class="title2">Your chance</span>
					<p>
						<span id="jackpot_mychange">0.00</span>%
					</p>
				</div>
			</div>
			
			<!--<div class="table-container">
				<div class="table-header">
					<div class="table-row">
						<div class="table-column text-left">User</div>
						<div class="table-column"></div>
						<div class="table-column text-right">Bet</div>
					</div>
				</div>
				
				<div class="table-body" id="jackpot_betlist"></div>
			</div>-->

			

			<h3 class="jptitle" onclick="animateJackpot(50, 64)">Current round</h3>

			<!-- <div id="jackpot_betlist"></div> -->

			<div class="round-container current-round">
				<div class="progress-container meter small width-full rounded-0 mb-2 jp-progress">
					<div class="transition-10 linear rounded-0" id="jackpot_counter" style="width: 100%"></div>
					<div class="progress-content flex justify-center items_center" id="jackpot_timer">
						Waiting for players...
					</div>
				</div>

				<div class="jp-data">
					<div>
						<i class="fa fa-coins"></i>
						<span id="jackpot_total">0.00</span>
					</div>

					<div>
						<i class="fa fa-percentage"></i>
						<span id="jackpot_mychange">0.00</span>
					</div>
				</div>

				<div class="round">
					<!-- <div style="position:absolute;top:0;bottom:0;background:green;left:60%;right:36%"></div> -->

					<div class="arrows" id="jackpot_arrows"></div>

					<div class="colors" id="jackpot_colors">
						<div class="meter"><span></span></div>
						<!-- <div style="--background:#003B72"></div>
						<div style="--background:#1D9144"></div>
						<div style="--background:#B29B33"></div>
						<div style="--background:#F11745"></div> -->
					</div>
				</div>

				<div class="players" id="jackpot_betlist"></div>
			</div>






			<h3 class="jptitle" style="margin:50px 0 10px">History</h3>

			<div class="jp-history" id="jackpot_histories"></div>
		</div>
	</div>
</div>