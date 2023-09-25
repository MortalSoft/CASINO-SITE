<?php
	global $Config;
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

					
				<?php if($Config->api("metamask")["enabled"]==1) { ?>
					<div class="options-container-grid">
						<a href="/metamask">
							<div class="option">
								<div class="img"><img src="template/img/payments/metamask.png" alt="" /></div>

								<div class="text">
									<p>MetaMask</p>
									<span>Crypto Deposit</span>
								</div>
							</div>
						</a>
					</div>
				<?php } ?> 

				<?php if($Config->api("nowpayments")["enabled"]==1) { ?>
					<div class="options-container-grid">
						<a href="/nowpayments">
							<div class="option">
								<div class="img"><img src="template/img/payments/nowpayments.webp" alt="" /></div>

								<div class="text">
									<p>NowPayments</p>
									<span>Crypto Deposit</span>
								</div>
							</div>
						</a>
					</div>
				<?php } ?> 
				<div class="options-container-grid" style="visibility:hidden;">
						<a href="/coinpayments">
							<div class="option">
								<div class="img"><img src="template/img/payments/coinpayments.png" alt="" /></div>

								<div class="text">
									<p>CoinPayments</p>
									<span>Crypto Deposit</span>
								</div>
							</div>
						</a>
					</div>
				</div>
				<br>
				<div class="width-12 options-container">
				<?php if($Config->api("stripe")["enabled"]==1) { ?>
					<div class="options-container-grid">
						<a href="/stripe">
							<div class="option">
								<div class="img"><img src="template/img/payments/stripe.png" alt="" /></div>

								<div class="text">
									<p>Stripe</p>
									<span>Credit Card</span>
								</div>
							</div>
						</a>
					</div>
				<?php } ?> 

				<?php if($Config->api("openpix")["enabled"]==1) { ?>
					<div class="options-container-grid">
						<a href="/pix">
							<div class="option">
								<div class="img"><img src="template/img/payments/pix.png" alt="" /></div>

								<div class="text">
									<p>PIX</p>
									<span>PIX Brasil</span>
								</div>
							</div>
						</a>
					</div>
				<?php } ?> 

				<?php if($Config->api("paymentwall")["enabled"]==1) { ?>
					<div class="options-container-grid">
						<a href="/paymentwall">
							<div class="option">
								<div class="img"><img style="max-width: 100px;" src="template/img/payments/paymentwal.png" alt="" /></div>

								<div class="text">
									<p>PaymentWall</p>
									<span>SMS / Card / Other</span>
								</div>
							</div>
						</a>
					</div>
				<?php } ?> 
			</div>
</div>
</div>
</div>