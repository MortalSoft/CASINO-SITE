<div class="game-info mb-2 dice-game-info">
	<div>
		<p>Round hash:</p> <span id="minesweeper_info_hash">-</span>
	</div>
	<div>
		<p>Round secret:</p> <span id="minesweeper_info_secret">-</span>
	</div>
</div>

<div class="dice">
	<div class="left box">
		<h4>Place your bet</h4>

		<div class="inputs">
			<input class="field_element_input" id="betamount_minesweeper" type="number" value="0.20" placeholder="1.00" min="0" step="1" oninput="checkAmountBet($(this).val(), 'minesweeper')">
				
				<!-- <div class="field_label transition-5"><div class="input_coins coins mr-1"></div>Bet Amount</div> -->
			
			<div class="field_extra">
				<button class="site-button betshort_action" data-game="minesweeper" data-action="half">1/2</button>
				<button class="site-button betshort_action" data-game="minesweeper" data-action="double">x2</button>
				<button class="site-button betshort_action" data-game="minesweeper" data-action="max">Max</button>
			</div>
		</div>
				
				<!-- <div class="field_bottom">
					<div class="field_error" data-error="required">This field is required</div>
					<div class="field_error" data-error="number">This field must be a number</div>
					<div class="field_error" data-error="greater">You must enter a greater value</div>
					<div class="field_error" data-error="lesser">You must enter a lesser value</div>
				</div> -->

		<h4 style="margin-top:20px">Bombs amount</h4>
		<input type="number" class="field_element_input2" min="1" max="24" id="bombsamount_minesweeper" value="5">
<!-- 		<div class="field_extra">
      <button class="site-button changeshort_action" data-fixed="0" data-action="-1">-1</button>
      <button class="site-button changeshort_action" data-fixed="0" data-action="1">+1</button>
    </div> -->

		<!-- <button class="site-button purple" id="dice_bet">Roll</button> -->
		<button class="site-button purple" id="minesweeper_bet">Place bet</button>
    <button class="site-button pink hidden" id="minesweeper_cashout">Cashout</button>
	</div>

	<div class="right box dice-grid">
		<div class="minesweeper-grid justify-center" id="minesweeper_bombs">
      <?php for($i = 1; $i <= 25; $i++){ ?>
      <div class="bomb flex justify-center items-center rounded-0 disabled" data-bomb="<?php echo $i; ?>"></div>
      <?php } ?>
    </div>

    <div class="stats-mines">
    	<div class="box">
    		<p>Next</p>
    		<div>
    			<span id="mines_next">0.00</span>
    			<i class="fa fa-coins"></i>
    		</div>
    	</div>

    	<div class="box">
    		<p>Cashout</p>
    		<div>
    			<span id="mines_cashout">0.00</span>
    			<i class="fa fa-coins"></i>
    		</div>
    	</div>

    	<div class="box">
    		<p>Total profit</p>
    		<div>
    			<span id="mines_profit">0.00</span>
    			<i class="fa fa-coins"></i>
    		</div>
    	</div>
    </div>
	</div>
</div>


<div class="table-container dice-table responsive">
	<div class="table-header">
		<div class="table-row">
			<div class="table-column text-left">User</div>
			<div class="table-column text-left">Bet</div>
			<div class="table-column text-left">Bombs</div>
			<div class="table-column text-left">Profit</div>
		</div>
	</div>
	
	<div class="table-body" id="minesweeper_history"></div>
</div>