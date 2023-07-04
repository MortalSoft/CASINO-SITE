<script type="text/javascript">
	const toggleFaq = j => {
		let el = document.getElementsByClassName('faq-el');
		for(let i in el) {
			el[i].classList.remove('active');
			if(i == j) el[i].classList.add('active');
		}
	}
</script>

<div class="p-2">
	<div class="faqs">
		<a class="faq-el" onclick="toggleFaq(0)" href="#general_type" class="active">General</a>
		<a class="faq-el" onclick="toggleFaq(1)" href="#apikey_type">API Key</a>
		<a class="faq-el" onclick="toggleFaq(2)" href="#coins_type">Coins</a>
		<a class="faq-el" onclick="toggleFaq(3)" href="#affiliate_type">Affiliates</a>
		<a class="faq-el" onclick="toggleFaq(4)" href="#deposit_type">Deposit</a>
		<a class="faq-el" onclick="toggleFaq(5)" href="#withdraw_type">Withdraw</a>
		<a class="faq-el" onclick="toggleFaq(6)" href="#games_type">Games</a>
		<a class="faq-el" onclick="toggleFaq(7)" href="#fairness_type">Fairness</a>
		<a class="faq-el" onclick="toggleFaq(8)" href="#promotion_type">Promotion</a>
		<a class="faq-el" onclick="toggleFaq(9)" href="#help_type">Help</a>
	</div>

	<div class="faq-grid">
		<!-- GENERAL -->
		<div>
			<div class="title-faq" id="general_type" style="margin:0">GENERAL</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">What is <?php echo $site['name'];?>?</div>
				<div><?php echo $site['name'];?> is a brand new way to gamble Crypto, CS:GO and other Steam Skins, We are NOT a jackpot site – instead players deposit crypto or skins for credits and these credits are transferred to our site.Bet those credits on our inspired games: Slots, Roulette, Crash, Coinflip, Jackpot, Dice, Cases, Minesweeper, Tower, Plinko.</div>
				<div>It doesn't matter how big your inventory is, or how much you bet, your odds are always the same.</div>
				<div>Bets occur in real time, across the entire site, meaning you bet, win, and lose along with other players.</div>
				<div>All rolls are generated using a provably fair system – ensuring a fair roll each and every bet.</div>
			
				<div class="text-color text-bold mt-2 mb-1">How to use the chat?</div>
				<div>Before using chat, read "Chat Rules". If you do not follow those rules, you will receive a time-out, if you continue to break the rules you will receive a permanent ban.</div>
				<ol type="1">
					<li>To send coins you need to be atleast Level 1.</li>
					<li>Don't beg for coins.</li>
					<li>Don't post your affiliates codes in chat.</li>
					<li>Don't advertise other websites.</li>
					<li>Technical problems are not solved on chat but through support page</li>
					<li>Do not ask about support tickets in chat. You can expect a response within 48 hours of sending your ticket.</li>
					<li>Do not lie about transactions on support tickets, as this can result in a permanent ban.</li>
					<li>Respect our staff. Any rude remarks or attempts to belittle them will result in a mute.</li>
				</ol>
			</div>
		</div>
		
		<div>
			<div class="title-faq" id="apikey_type" >API KEY</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">API Key FAQ</div>
				<div><?php echo $site['name'];?> has a P2P (player-to-player) CS: GO skins deposit and withdraw system. Our system allows users to deposit and withdraw CS: GO items even when critical loading of Steam inventory. This is made possible through the Steam API key. To use the Steam API key, we need the user to generate and provide us with their API key.</div>
				<div class="text-color text-bold mt-2 mb-1">Why we ask you to provide an API Key?</div>
				<div>API Key is required to ensure stable and correct operation of P2P. This makes our P2P trading system more reliable. Using the Steam API Key, we can confirm that the transaction was made between two users and track the status of your trade (only trade created on <?php echo $site['name'];?> website). Your Steam API Key will be used on <?php echo $site['name'];?> only to check the status of the sent and received trade offers which is created on <?php echo $site['name'];?></div>
				<div class="text-color text-bold mt-2 mb-1">Whi should I trust and provide <?php echo $site['name'];?> with my Steam API Key?</div>
				<div><?php echo $site['name'];?> never endangered our users and did not demand from them information that could harm them. The biggest misconception regarding the Steam API Key is that with this 'key' you can do absolutely everything with your Steam account. It is not true! Steam API Key has a limited set of features. This 'key' does not allow us to reset the password, change the email address of the account, disable two-factor authentication, send and receive trading offers, view any other confidential information in your account. You can check this and learn more about the actions that can be performed with the Steam API Key on the official Steam API website - <a class="text-color" href="https://partner.steamgames.com/doc/webapi" target="_blank">https://partner.steamgames.com/doc/webapi</a>.</div>
				<div class="text-color text-bold mt-2 mb-1">How do I generate my Steam API Key and provide it with <?php echo $site['name'];?>?</div>
				<div><?php echo $site['name'];?> will request your Steam API Key when you try to use the P2P system. We will provide a link directly to the page where you can create this “key”. A ”domain” will be requested on the page. This value can be anything, for example ”localhost” or ”google”. Once your key is generated, simply copy and paste it into the field provided on the exchange page. If you successfully check our system for your Steam API Key, you can start making exchanges in the P2P system.</div>
				<div class="text-color text-bold mt-2 mb-1">Secure rules with API Key.</div>
				<div>Unfortunately, there is such a thing as “API scam” in the Steam and CS: GO community. If scammers gained access to your API key, then they can replace your exchange offer on Steam and your items will be sent to scammers.</div>
				<div>API Key alone is not enough for scammers. They need your data from a Steam account, they can get it using browser extensions (do not install suspicious and unfamiliar extensions) and phishing sites (these sites are similar to regular sites with Steam authorization, only for authorization they use a fake page, very similar on Steam). Before authorizing via Steam on an unfamiliar resource, check the address specified in the browser (does it belong to Steam).</div>
				<div>If you went to the API Key generation page and found that the key was generated earlier, but you do not remember how you created it, immediately change the password for your steam account, then change API Key to a new one.</div>
				<div>If during the exchange for <?php echo $site['name'];?> our system detects that your Steam exchange offer has been replaced, we will try to cancel this exchange offer as soon as possible and we will send you a notification that you need to change the password for your Steam account.</div>
			</div>
		</div>
		
		<!-- COINS -->
		<div>
			<div class="title-faq" id="coins_type">COINS</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">What are coins?</div>
				<div>1 Euro = 1 Coin</div>
				<div>Coins have no real currency value, but are used to withdraw Crypto/Skins from the withdraw page on our website.</div>
				
				<div class="text-color text-bold mt-2 mb-1">Can I send my coins to other players?</div>
				<div>In order to send coins you must be atleast Level 1, You can send coins to other players by clicking on their username in the chat and/or directly through the chat using the format "/send <steam id> <amount>".</div>
				
				<div class="text-color text-bold mt-2 mb-1">I logged into my account and all my coins are gone?</div>
				<div>There are multiple reasons as to why this may happen, Unfortunately this has nothing to do with our website.</div>
				<div>Reason 1: Make sure no one else is using your account.</div>
				<div>Reason 2: Virus / Exploits / Harmful browser extensions. <?php echo $site['name'];?> does not advice any of their users to use any kind of extensions in their browser when playing on <?php echo $site['name'];?>.</div>
				<div>Listed above are two examples as to why your coins may be missing. Kindly note, we do NOT refund these types of incidents. We only refund what we can see and prove in our logs/DataBase.</div>
				<div><?php echo $site['name'];?> Admins/Bots/Moderators will NEVER add you on Steam and they will never request any of your items. Be wary of giveaway and impersonation scams.</div>
				
				<div class="text-color text-bold mt-2 mb-1">How can I get free coins?</div>
				<div>Head over to your profile tab and make sure your account is verified.</div>
				<div>There is a couple of ways you can earn free coins on <?php echo $site['name'];?>:</div>
				<ol type="1">
					<li>
						Daily reward:
						<div>You can earn up to <?php echo getFormatAmountString($rewards['amounts']['daily_start'] + 100 * $rewards['amounts']['daily_step']); ?> coins daily by claiming your Daily Reward.</div>
						<div><i>Don't forget that you'll receive more coins as you level up!</i></div>
					</li>
					<li>Chat Rain:
						<div>Every hour there is a chance of "Rain" in chat that can reward you an amount of coins based on your website level.</div>
					</li>
				</ul>
			</div>
		</div>
		
		<!-- AFFILIATE -->
		<div>
			<div class="title-faq" id="affiliate_type" >AFFILIATE</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">How can I earn extra coins by referring new users?</div>
				<div>Create your unique code in the affiliate tab and receive <?php echo getFormatAmountString($rewards['amounts']['refferal_join']); ?> coins for every user who used your code.</div>
				<div>The code will also generate <?php echo getFormatAmountString($rewards['amounts']['refferal_use']); ?> coins for the person who uses the code.</div>
				<div><i>Note: The code should not be misleading or violate any trademarks.</i></div>
			</div>
		</div>
		
		<!-- DEPOSIT -->
		<div>
			<div class="title-faq" id="deposit_type">DEPOSIT</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">How do I deposit Skins?</div>
				<ol type="1">
					<li>Start by setting up your Steam URL by clicking on your profile tab and entering your trade URL under "Tradelink - Find my tradelink".</li>
					<li>Click on the "Deposit" page and select the Skins you would like to convert into coins.</li>
					<li>Our Bot will send you a trade offer with your selected item(s). Accept the trade after making sure the security codes on both the trade offer and the site match.</li>
					<li>Head to the home page, select the number of coins you want to play with and start busting!</li>
				</ol>
				
				<div class="text-color text-bold mt-2 mb-1">How are items prices determined?</div>
				<div>The prices of the skins in our marketplace is determined through the Bitskins API price averages. We apply a discount to discourage player from depositing a large quantity of low value items.</div>
			</div>
		</div>
		
		<!-- WITHDRAW -->
		<div>
			<div class="title-faq" id="withdraw_type">WITHDRAW</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">Can I withdraw skins right after depositing?</div>
				<div>If you never played on our site before then you wont be able to withdraw without playing on our site due to the Anti-Trade System. You can read more about it in the next point.</div>
				
				<div class="text-color text-bold mt-2 mb-1">What is the Anti-Trade System?</div>
				<div>The Anti-Trade system is to prevent users that just deposit to withdraw other items without even playing on the site.</div>
				<div>We call them traders, they want to make profit from such situation. To prevent this we have added a system where you need to place bets worth 3/4x of the amount your withdraw.</div>
				<div class="text-bold mt-1">How it work:</div>
				<ul>
					<li><span class="text-bold">Roulette:</span> amount of your bet = wager</li>
					<li><span class="text-bold">Crash:</span> profit of your win bet = wager</li>
					<li><span class="text-bold">Jackpot:</span> amount of your bet = wager</li>
					<li><span class="text-bold">Coinflip:</span> profit of your win bet = wager</li>
					<li><span class="text-bold">Dice:</span> profit of your win bet = wager</li>
					<li><span class="text-bold">Unbox:</span> amount of your case opened = wager</li>
					<li><span class="text-bold">Minesweeper:</span> profit of your win bet = wager</li>
					<li><span class="text-bold">Tower:</span> profit of your win bet = wager</li>
					<li><span class="text-bold">Plinko:</span> amount of your bet = wager</li>
				</ul>
			</div>
		</div>
		
		<!-- GAMES -->
		<div>
			<div class="title-faq" id="games_type">GAMES</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">Is there a maximum and minimum bet?</div>
				<div>The minimum for any game is 0.20 coins</div>
				<div>The maximum for any game is 500.00 coins</div>
				
				<div class="text-color text-bold mt-2 mb-1">Is there a maximum profit on crash?</div>
				<div>You'll be automatically cashed out if you profit more than 5.000.00 coins.</div>
			</div>
		</div>
		
		<!-- FAIRNESS -->
		<div>
			<div class="title-faq" id="fairness_type">FAIRNESS</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">Are the games fair?</div>
				<div>Absolutely! And we can prove it. Please see our <a href="<?php echo $site['root'];?>fair" target="_blank" class="text-color">provably fair</a> page for technical details.</div>
			</div>
		</div>
		
		<!-- PROMOTION -->
		<div>
			<div class="title-faq" id="promotion_type">PROMOTION</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">PARTNERSHIP / SPONSORSHIP - WOULD YOU LIKE TO SPONSOR ME?</div>
				<div>We do not sponsor youtube channels with under 10 000 subscribers.</div>
				<div>If you do have more than 10 000 but without an active fan base, there is only a slim chance of getting us to sponsor you.</div>
				<div>We do not sponsor CSGO teams at the moment, if we ever will do it, we will be contacting them.</div>
				<div>For business related questions, we advice you to contact <?php echo $site['name'];?> team .</div>
			</div>
		</div>
		
		<!-- HELP -->
		<div>
			<div class="title-faq" id="help_type">HELP</div>
			<div class="pl-3">
				<div class="text-color text-bold mt-2 mb-1">What if I can't stop?</div>
				<div>Like all forms of gambling, online gambling can become an addiction that can have serious negative effects on your life.</div>
				<div>If you lose more than you planned to or can't safely afford and find yourself struggling to control time and/or money spent gambling, please check these sites for information that could help you:</div>
				<div>HELP: <a href="http://www.psychguides.com/" target="_blank" class="text-color">http://www.psychguides.com/</a></div>
				<div>Self Help: <a href="http://www.gamblersanonymous.org/ga/" target="_blank" class="text-color">http://www.gamblersanonymous.org/ga/</a></div>
			</div>
		</div>
	</div>
</div>