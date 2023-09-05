<div class="flex responsive items-center site-panel" style="grid-gap:20px">
	<div class="width-8 responsive">
		<div class="input_field bet_input_field transition-5" data-border="#de4c41">
			<div class="field_container">
				<div class="field_content">
					<input type="text" class="field_element_input" id="betamount_coinflip" oninput="checkAmountBet($(this).val(), 'coinflip')" value="0.20">
					
					<div class="field_label transition-5"><i class="fa fa-coins" style="margin:0 4px 0 0;font-size:12px"></i>Bet Amount</div>
				</div>
				
				<div class="field_extra">
					<button class="site-button betshort_action" data-game="coinflip" data-action="clear">Clear</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="0.01">+0.01</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="0.10">+0.10</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="1.00">+1.00</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="10.00">+10.00</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="100.00">+100.00</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="half">1/2</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="double">x2</button>
					<button class="site-button betshort_action" data-game="coinflip" data-action="max">Max</button>
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

	<div class="responsive">
		<div class="flex responsive items-center justify-between gap-2 cf-coins">
			<div class="cf-coins-bg">
				<p>Choose your side:</p>
				<div class="rounded-full coinflip-select active" data-coin="1">
					<img src="<?php echo $site['root'];?>template/img/coinflip/coin1.png">
				</div>
				<div class="rounded-full coinflip-select" data-coin="2">
					<img src="<?php echo $site['root'];?>template/img/coinflip/coin2.png">
				</div>
			</div>
			
			<button class="site-button purple" id="coinflip_create" >Create game</button>
		</div>
	</div>
</div>

<h2 class="cf-header">Active games</h2>

<div class="coinflip-grid gap-2" id="coinflip_betlist"></div>