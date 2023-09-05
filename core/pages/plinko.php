<div class="flex responsive justify-center mt-2">
	<div class="width-8 responsive">
		<div class="width-12 flex responsive column items-center mb-2 gap-2">
			<div class="plinko-grid width-full relative" id="plinko-case">
				<div class="absolute height-full width-full flex items-center justify-center">
					<div class="absolute flex justify-center" id="plinko-arena"></div>
				</div>
			
				<?php for($i = 1; $i <= 16; $i++){ ?>
					<div class="stage flex justify-center">
					<?php for($j = 1; $j <= $i; $j++){ ?>
						<div class="hole height-full flex justify-center items-center"></div>
					<?php } ?>
					</div>
				<?php } ?>
			</div>
			
			<div class="width-full">
				<div class="plinko-winnings easy width-full flex justify-center items-center">
					<div>50</div>
					<div>25</div>
					<div>3</div>
					<div>1.5</div>
					<div>1.2</div>
					<div>0</div>
					<div>1.1</div>
					<div>0.5</div>
					<div>1.1</div>
					<div>0</div>
					<div>1.2</div>
					<div>1.5</div>
					<div>3</div>
					<div>25</div>
					<div>50</div>
				</div>
				
				<div class="plinko-winnings medium width-full flex justify-center items-center">
					<div>100</div>
					<div>50</div>
					<div>10</div>
					<div>5</div>
					<div>2</div>
					<div>1</div>
					<div>0.2</div>
					<div>0</div>
					<div>0.2</div>
					<div>1</div>
					<div>2</div>
					<div>5</div>
					<div>10</div>
					<div>25</div>
					<div>50</div>
				</div>
				
				<div class="plinko-winnings hard width-full flex justify-center items-center">
					<div>250</div>
					<div>50</div>
					<div>20</div>
					<div>10</div>
					<div>5</div>
					<div>0.2</div>
					<div>0</div>
					<div>0.1</div>
					<div>0</div>
					<div>0.2</div>
					<div>5</div>
					<div>10</div>
					<div>20</div>
					<div>50</div>
					<div>250</div>
				</div>
			</div>
				
			<div class="input_field bet_input_field transition-5" data-border="#de4c41">
				<div class="field_container">
					<div class="field_content">
						<input type="text" class="field_element_input" id="betamount_plinko" oninput="checkAmountBet($(this).val(), 'plinko')" value="0.20">
						
						<div class="field_label transition-5"><i class="fa fa-coins" style="margin:0 4px 0 0;font-size:12px"></i>Bet Amount</div>
					</div>
					
					<div class="field_extra">
						<button class="site-button betshort_action" data-game="plinko" data-action="0.01">+0.01</button>
						<button class="site-button betshort_action" data-game="plinko" data-action="0.10">+0.10</button>
						<button class="site-button betshort_action" data-game="plinko" data-action="1.00">+1.00</button>
						<button class="site-button betshort_action" data-game="plinko" data-action="10.00">+10.00</button>
					</div>
				</div>
				
				<div class="field_bottom">
					<div class="field_error" data-error="required">This field is required</div>
					<div class="field_error" data-error="number">This field must be a number</div>
					<div class="field_error" data-error="greater">You must enter a greater value</div>
					<div class="field_error" data-error="lesser">You must enter a lesser value</div>
				</div>
			</div>
			
			<div class="grid split-column-3 width-full gap-3">
				<button class="site-button green width-full plinko_bet" data-color="green">PLACE BET</button>
				<button class="site-button orange width-full plinko_bet" data-color="orange">PLACE BET</button>
				<button class="site-button red width-full plinko_bet" data-color="red">PLACE BET</button>
			</div>
			
			<div class="game-info mb-2 plinko-game-info">
				<div>
					<p>Round hash:</p> <span id="plinko_info_hash">-</span>
				</div>
				<div>
					<p>Round secret:</p> <span id="plinko_info_secret">-</span>
				</div>
			</div>
		</div>
		
		<div class="table-container dice-table responsive">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">User</div>
					<div class="table-column text-left">Bet</div>
					<div class="table-column text-left">Pick</div>
					<div class="table-column text-left">Color</div>
					<div class="table-column text-left">Profit</div>
				</div>
			</div>
			
			<div class="table-body" id="plinko_history"></div>
		</div>
	</div>
</div>