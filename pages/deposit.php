<?php
	$steam_options = array(
		array("CS:GO", "Instant", "csgo", "steam/csgo", "#2B3254"),
		//array("Dota 2", "Instant", "dota2", "steam/dota2", "#2D2A2A"),
		array("Team Fortress 2", "Instant", "tf2", "steam/tf2", "#523F26"),
		array("Rust", "Instant", "rust", "steam/rust", "#732B21"),
		//array("H1Z1", "Instant", "h1z1_shop", "steam/h1z1", "#000"),
	);

	$p2p_options = array(
		array("CS:GO", "P2P Marketplace", "csgo", "p2p/csgo", "#2B3254"),
		//array("Dota 2", "P2P Marketplace", "dota2", "p2p/dota2", "#2D2A2A"),
		array("Team Fortress 2", "P2P Marketplace", "tf2", "p2p/tf2", "#523F26"),
		array("Rust", "P2P Marketplace", "rust", "p2p/rust", "#732B21"),
		//array("H1Z1", "P2P Marketplace", "h1z1_shop", "p2p/h1z1", "#000"),
	);

	$crypto_options = array(
		array("BTC", "Bitcoin", "btc", "currency/btc", "#F79413"),
		array("ETH", "Ethereum", "eth", "currency/eth", "#5E7DEF"),
		array("LTC", "Litecoin", "ltc", "currency/ltc", "#345D9D"),
		array("BCH", "Bitcoin Cash", "bch", "currency/bch", "#8DC351"),
		array("SOL", "Solana", "sol", "currency/sol", "#9E55DF"),
	);
?>


<div class="flex column height-full width-full">
	<div class="wrapper-page flex row">
		<div class="flex column height-full width-full">
			<!-- <div class="width-12 inline-table">
				<div class="width-full inline-grid">
					<div class="panel-histories small flex gap-1 p-2" id="last_offers">
						<div class="flex justify-center items-center width-full height-full">No trades</div>
					</div>
				</div>
			</div> -->
		
			<div class="width-12 options-container">
				<h3 class="dp-title" style="margin-top:0">Steam Deposit</h3>

				<div class="options-container-grid">
					<?php foreach ($steam_options as $value) { ?>
						<a href="<?php echo $site['root'];?>deposit/<?php echo $value[3]; ?>">
							<div class="option">
								<div class="img" style="background:<?php echo $value[4]; ?>"><img src="<?php echo $site['root'];?>template/img/methods/new/<?php echo $value[2]; ?>.png" alt="" /></div>

								<div class="text">
									<p><?php echo $value[0]; ?></p>
									<span><?php echo $value[1]; ?></span>
								</div>
							</div>
						</a>
					<?php } ?>
				</div>

				<h3 class="dp-title">P2P Deposit</h3>

				<div class="options-container-grid">
					<?php foreach ($p2p_options as $value) { ?>
						<a href="<?php echo $site['root'];?>deposit/<?php echo $value[3]; ?>">
							<div class="option">
								<div class="img" style="background:<?php echo $value[4]; ?>"><img src="<?php echo $site['root'];?>template/img/methods/new/<?php echo $value[2]; ?>.png" alt="" /></div>

								<div class="text">
									<p><?php echo $value[0]; ?></p>
									<span><?php echo $value[1]; ?></span>
								</div>
							</div>
						</a>
					<?php } ?>
				</div>

				<h3 class="dp-title">Crypto Deposit</h3>

				<div class="options-container-grid">
					<?php foreach ($crypto_options as $value) { ?>
						<a href="<?php echo $site['root'];?>deposit/<?php echo $value[3]; ?>">
							<div class="option">
								<div class="img" style="background:<?php echo $value[4]; ?>"><img src="<?php echo $site['root'];?>template/img/methods/new/<?php echo $value[2]; ?>.png" alt="" /></div>

								<div class="text">
									<p><?php echo $value[0]; ?></p>
									<span><?php echo $value[1]; ?></span>
								</div>
							</div>
						</a>
					<?php } ?>
				</div>
			</div>
		</div>
	</div>
</div>