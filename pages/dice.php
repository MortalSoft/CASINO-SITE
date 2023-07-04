<div class="game-info mb-2 dice-game-info">
	<div>
		<p>Round hash:</p> <span id="dice_info_hash">-</span>
	</div>
	<div>
		<p>Round secret:</p> <span id="dice_info_secret">-</span>
	</div>
</div>

<div class="dice">
	<div class="left box">
		<h4>Place your bet</h4>

		<div class="inputs">
			<input class="field_element_input" id="betamount_dice" type="number" value="0.20" placeholder="1.00" min="0" step="1" oninput="checkAmountBet($(this).val(), 'dice')">
				
				<!-- <div class="field_label transition-5"><div class="input_coins coins mr-1"></div>Bet Amount</div> -->
			
			<div class="field_extra">
				<button class="site-button betshort_action" data-game="dice" data-action="half">1/2</button>
				<button class="site-button betshort_action" data-game="dice" data-action="double">x2</button>
				<button class="site-button betshort_action" data-game="dice" data-action="max">Max</button>
			</div>
		</div>
				
				<!-- <div class="field_bottom">
					<div class="field_error" data-error="required">This field is required</div>
					<div class="field_error" data-error="number">This field must be a number</div>
					<div class="field_error" data-error="greater">You must enter a greater value</div>
					<div class="field_error" data-error="lesser">You must enter a lesser value</div>
				</div> -->

		<h4 style="margin-top:20px">Winnings</h4>
		<input type="number" id="dice_winnings" disabled="" value="2.00">

		<script type="text/javascript">
			const checkFast = () => {
				$('#slow_dice_type').click();
				$('#fast_check').attr('data-check', !diceGame_slow);
			}
		</script>

		<input type="checkbox" class="field_element_input" id="slow_dice_type" data-type="slow" style="display:none" />
		<div class="check" data-check="false" onclick="checkFast()" id="fast_check">
			<div><i class="fa fa-check"></i></div>
			<p>Fast mode</p>
		</div>

		<button class="site-button purple" id="dice_bet">Roll</button>
	</div>

	<div class="right box dice-grid">

		<div id="type_slow" style="grid-column-start: 1; grid-column-end: 4; text-align:center">
			<div class="slots mt-2 mb-2" id="dice-slots">
				<?php for($i = 1; $i <= 4; $i++){ ?>
				<div class="slots-column" id="dice-slots-spinner" data-id="<?php echo $i; ?>">
					<?php for($j = 1; $j <= 4; $j++){ ?>
					<div class="">
						<div class="slots-row flex justify-center items-center">0</div>
						<div class="slots-row flex justify-center items-center">1</div>
						<div class="slots-row flex justify-center items-center">2</div>
						<div class="slots-row flex justify-center items-center">3</div>
						<div class="slots-row flex justify-center items-center">4</div>
						<div class="slots-row flex justify-center items-center" data-fast data-fastid="<?php echo $i; ?>">5</div>
						<div class="slots-row flex justify-center items-center">6</div>
						<div class="slots-row flex justify-center items-center">7</div>
						<div class="slots-row flex justify-center items-center">8</div>
						<div class="slots-row flex justify-center items-center">9</div>
					</div>
					<?php } ?>	
				</div>
				<?php } ?>			
			</div>
		</div>


		<div style="grid-column-start: 1; grid-column-end: 4;">
			<div class="relative hidden" id="dice_pointer">
				<div class="dice-result">
					<div class="dice-result-bar flex justify-center transition-5" style="width: 0%;">
						<div class="hover-message flex justify-center items-center">
							<div class="pointer">100.00%</div>
						</div>
					</div>
				</div>
			</div>
		
			<div class="slider_field transition-5">
				<div class="field_container">
					<div class="field_content">
						<input type="range" class="field_element_input" id="dice_chanceslider" min="0.01" max="100" step="0.01" value="47.5">
						
						<div class="field_label active transition-5">Chance</div>
					</div>
					
					<div class="field_extra"></div>
				</div>
				
				<div class="field_bottom">
					<div class="flex justify-between">
						<div>0</div>
						<div>100</div>
					</div>
				</div>
			</div>
		</div>





		<div class="inputs3">
			<div style="grid-column-start: 1; grid-column-end: 2;">
				<div class="input_field bet_input_field transition-5" data-border="#de4c41">
					<div class="field_container">	
						<div class="field_content" style="display:block;float:left;width:calc(100% - 40px)">
							<input type="text" class="field_element_input" id="dice_roll" disabled="" value="47.50" style="background:transparent !important;">
							
							<div class="field_label transition-5">Roll <span class="text-successful" id="dice_type">UNDER</span></div>
						</div>
						
						<div class="field_extra">
							<img class="icon-medium-31 pointer" src="<?php echo $site['root'];?>template/img/switch.svg" id="dice_switch">
						</div>
					</div>
					
					<div class="field_bottom"></div>
				</div>
			</div>
			
			<div style="grid-column-start: 2; grid-column-end: 3;">
				<div class="input_field bet_input_field transition-5" data-border="#de4c41">
					<div class="field_container">
						<div class="field_content">
							<input type="text" class="field_element_input" id="dice_multiplier" disabled="" value="2.00" style="background:transparent !important;">
							
							<div class="field_label transition-5">Multiplier</div>
						</div>
						
						<div class="field_extra">
						</div>
					</div>
					
					<div class="field_bottom"></div>
				</div>
			</div>
			
			<div style="grid-column-start: 3; grid-column-end: 4;">
				<div class="input_field bet_input_field transition-5" data-border="#de4c41">
					<div class="field_container">
						<div class="field_content">
							<input type="text" class="field_element_input" id="dice_chanceinput" value="47.50" style="background:transparent !important;">
							
							<div class="field_label transition-5">Win Chance</div>
						</div>
						
						<div class="field_extra"></div>
					</div>
					
					<div class="field_bottom">
						<div class="field_error" data-error="required">This field is required</div>
						<div class="field_error" data-error="number">This field must be a number</div>
						<div class="field_error" data-error="greater">You must enter a greater value</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!--<div class="left box">
		<div class="bg-light-transparent rounded-1 b-d2 mb-2 p-2">
			<div class="game-info mb-2">
				<div>
					<p>Round hash:</p> <span id="dice_info_hash">-</span>
				</div>
				<div>
					<p>Round secret:</p> <span id="dice_info_secret">-</span>
				</div>
			</div>
		
			<div class="dice-grid responsive">
				<div style="grid-column-start: 1; grid-column-end: 3;">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="text" class="field_element_input" id="betamount_dice" oninput="checkAmountBet($(this).val(), 'dice')" value="0.01">
								
								<div class="field_label transition-5"><div class="input_coins coins mr-1"></div>Bet Amount</div>
							</div>
							
							<div class="field_extra">
								<button class="site-button betshort_action" data-game="dice" data-action="half">1/2</button>
								<button class="site-button betshort_action" data-game="dice" data-action="double">x2</button>
								<button class="site-button betshort_action" data-game="dice" data-action="max">Max</button>
							</div>
						</div>
						
						<div class="field_bottom">
							<div class="field_error" data-error="required">This field is required</div>
							<div class="field_error" data-error="number">This field must be a number</div>
							<div class="field_error" data-error="greater">You must enter a greater value</div>
							<div class="field_error" data-error="lesser">You must enter a lesser value</div>
						</div>
					</div>
				</div>
				
				<div style="grid-column-start: 3; grid-column-end: 4;">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="text" class="field_element_input" id="dice_winnings" disabled="" value="0.02">
								
								<div class="field_label transition-5"><div class="input_coins coins mr-1"></div>Winnings</div>
							</div>
							
							<div class="field_extra">
							</div>
						</div>
						
						<div class="field_bottom"></div>
					</div>
				</div>
				
				<div style="grid-column-start: 1; grid-column-end: 2;">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">	
							<div class="field_content">
								<input type="text" class="field_element_input" id="dice_roll" disabled="" value="47.50">
								
								<div class="field_label transition-5">Roll <span class="text-successful" id="dice_type">UNDER</span></div>
							</div>
							
							<div class="field_extra">
								<img class="icon-medium pointer" src="<?php echo $site['root'];?>template/img/switch.svg" id="dice_switch">
							</div>
						</div>
						
						<div class="field_bottom"></div>
					</div>
				</div>
				
				<div style="grid-column-start: 2; grid-column-end: 3;">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="text" class="field_element_input" id="dice_multiplier" disabled="" value="2.00">
								
								<div class="field_label transition-5">Multiplier</div>
							</div>
							
							<div class="field_extra">
							</div>
						</div>
						
						<div class="field_bottom"></div>
					</div>
				</div>
				
				<div style="grid-column-start: 3; grid-column-end: 4;">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="text" class="field_element_input" id="dice_chanceinput" value="47.50">
								
								<div class="field_label transition-5">Win Chance</div>
							</div>
							
							<div class="field_extra"></div>
						</div>
						
						<div class="field_bottom">
							<div class="field_error" data-error="required">This field is required</div>
							<div class="field_error" data-error="number">This field must be a number</div>
							<div class="field_error" data-error="greater">You must enter a greater value</div>
						</div>
					</div>
				</div>
				
				<div style="grid-column-start: 1; grid-column-end: 2;">
					<div class="switch_field transition-5">
						<div class="field_container">
							<div class="field_content">
								<input type="checkbox" class="field_element_input" id="slow_dice_type" data-type="slow">
								
								<div class="field_switch">
									<div class="field_switch_bar"></div>
								</div>
								
								<div class="field_label active transition-5">SLOW ROLL</div>
							</div>
							
							<div class="field_extra"></div>
						</div>
						
						<div class="field_bottom"></div>
					</div>
				</div>
				
				<div style="grid-column-start: 2; grid-column-end: 4;">
					<div class="relative hidden" id="dice_pointer">
						<div class="dice-result">
							<div class="dice-result-bar flex justify-center transition-5" style="width: 0%;">
								<div class="hover-message flex justify-center items-center">
									<div class="pointer">100.00%</div>
								</div>
							</div>
						</div>
					</div>
				
					<div class="slider_field transition-5">
						<div class="field_container">
							<div class="field_content">
								<input type="range" class="field_element_input" id="dice_chanceslider" min="0.01" max="100" step="0.01" value="47.5">
								
								<div class="field_label active transition-5">Chance</div>
							</div>
							
							<div class="field_extra"></div>
						</div>
						
						<div class="field_bottom">
							<div class="flex justify-between">
								<div>0</div>
								<div>100</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="hidden" id="type_slow" style="grid-column-start: 1; grid-column-end: 4;">
					<div class="slots mt-2 mb-2" id="dice-slots">
						<?php for($i = 1; $i <= 4; $i++){ ?>
						<div class="slots-column" id="dice-slots-spinner" data-id="<?php echo $i; ?>">
							<?php for($j = 1; $j <= 4; $j++){ ?>
							<div class="">
								<div class="slots-row flex justify-center items-center">0</div>
								<div class="slots-row flex justify-center items-center">1</div>
								<div class="slots-row flex justify-center items-center">2</div>
								<div class="slots-row flex justify-center items-center">3</div>
								<div class="slots-row flex justify-center items-center">4</div>
								<div class="slots-row flex justify-center items-center">5</div>
								<div class="slots-row flex justify-center items-center">6</div>
								<div class="slots-row flex justify-center items-center">7</div>
								<div class="slots-row flex justify-center items-center">8</div>
								<div class="slots-row flex justify-center items-center">9</div>
							</div>
							<?php } ?>	
						</div>
						<?php } ?>			
					</div>
				</div>
				
				<div style="grid-column-start: 1; grid-column-end: 4;">
					<button class="site-button purple" id="dice_bet" style="width: 100%">ROLL!</button>
				</div>
			</div>
		</div>
		
		<div class="table-container">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">User</div>
					<div class="table-column text-left">Bet</div>
					<div class="table-column text-left">Multiplier</div>
					<div class="table-column text-left">Roll</div>
					<div class="table-column text-left">Game</div>
					<div class="table-column text-left">Profit</div>
				</div>
			</div>
			
			<div class="table-body" id="dice_history"></div>
		</div>
	</div>-->
</div>


<div class="table-container dice-table responsive">
	<div class="table-header">
		<div class="table-row">
			<div class="table-column text-left">User</div>
			<div class="table-column text-left">Bet</div>
			<div class="table-column text-left">Multiplier</div>
			<div class="table-column text-left">Roll</div>
			<div class="table-column text-left">Game</div>
			<div class="table-column text-left">Profit</div>
		</div>
	</div>
	
	<div class="table-body" id="dice_history"></div>
</div>