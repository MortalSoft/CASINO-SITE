<div class="p-2">
	<div class="title-page2">Provably Fair</div>
	
	<div class="text-left">
		<div class="ff"><?php echo $site['name'];?> uses provably fair method, that doesn't allow us to manipulate the outcome once the game is started, below you can see how the hash is caluclated.</div>
		<div class="ff" style="margin-bottom:40px">You can execute PHP code straight from your web browser with tools like <a href="http://www.phptester.net/" class="text-color" target="_blank">PHP Tester</a>. Simply copy-paste the code into the window and replace the values for your own. Execute the code to verify the hash.</div>
		
		<div class="pf-container">
			<div class="cntner">
				<div class="title2"><p>Roulette</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>

				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = 'eb44276374a962e7790a691e54d337612594e67fe744514b8c16be288d6b246d';</div>
				<div class="text-indent-0">$secret = 'zfbodo3TaO49YbCr';</div>
				<div class="text-indent-0">$roll = '1';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $roll);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Crash</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = 'db8b8c2b5ffca3a2dc21d3da2155fbab5361e716cfad679ee95e4d45f0a0f165';</div>
				<div class="text-indent-0">$secret = 'xHFed6szmurvfFNY';</div>
				<div class="text-indent-0">$crash_at = '8.96';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $crash_at);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Jackpot</p></div>
				
				<p>When a new round begins, we create a string of random characters called <span style="font-weight:600">the server seed</span>. This is displayed to the user immidiately.</p>
				<p>When all bets are finalized, we check the <a href="https://eosflare.io/" target="_blank">EOS Blockchain</a> for a number of a block that will be mined in the near future. The block number is displayed to the user immidiately after to avoid cherry-picking block IDs. After that block is mined, we use the hash from that block to create our final hash like this:

				<code style="background:var(--site-color-bg-body);width:100%;float:left;margin:4px 0;padding:10px;border-radius:6px;color:#ddd">final_hash = sha256(`${server_seed}-${eos_block_hash}`);</code>

				<p>From that hash, we use a simple function to get the winning ticket:</p>
				<code style="background:var(--site-color-bg-body);width:100%;float:left;margin:4px 0;padding:10px;border-radius:6px;color:#ddd">parseInt(final_hash.substr(0, 8), 16) % last_ticket</code>

				<p>Where "last_ticket" is the total number of tickets in this round.</p>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Coinflip</p></div>

				<p>When a new coinflip is added, we create a string of random characters called <span style="font-weight:600">the server seed</span>. This is displayed to the user immidiately.</p>
				<p>When another player joins the game, we check the <a href="https://eosflare.io/" target="_blank">EOS Blockchain</a> for a number of a block that will be mined in the near future. The block number is displayed to the user immidiately after to avoid cherry-picking block IDs. After that block is mined, we use the hash from that block to create our final hash like this:

				<code style="background:var(--site-color-bg-body);width:100%;float:left;margin:4px 0;padding:10px;border-radius:6px;color:#ddd">final_hash = sha256(`${server_seed}-${eos_block_hash}`);</code>

				<p>From that hash, we use a simple function to get the winning ticket:</p>
				<code style="background:var(--site-color-bg-body);width:100%;float:left;margin:4px 0;padding:10px;border-radius:6px;color:#ddd">parseInt(final_hash.substr(0, 8), 16) % 100</code>

				<p>If the ticket is equal or less than 50, it means that Player 1 has won (the one who created the game). If it's higher than 50, the winner is Player 2 (the one joining).</p>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Dice</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = '85ac1834632901b3a540eb8634284003d0a40ecf7f48f76ea231b078b988728f';</div>
				<div class="text-indent-0">$secret = 'B3v4a99eXWmbJQZRNGYV';</div>
				<div class="text-indent-0">$roll = '85.88';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $roll);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Unbox</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = '4843f4942c80300484f292487a5de1947eac550a47cb9a48690907dd6f5b39c1';</div>
				<div class="text-indent-0">$secret = 'fUWwnJlveLzfu6XF';</div>
				<div class="text-indent-0">$percentage = '69.04671153210356';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $percentage);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Minesweeper</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = '1aa55ffe7e2988444540254b1f82b89c0b25ef5e1ba523a985e900704202cc55';</div>
				<div class="text-indent-0">$secret = 'TldPofpK4Lh2yxqW';</div>
				<div class="text-indent-0">$value = '1721249';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $value);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Tower</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = '7027dff0adc5fe4370f478c953e80dfb7e314969753e35ec632c037f232f27cb';</div>
				<div class="text-indent-0">$secret = 'qPaClrroLEoolyt4';</div>
				<div class="text-indent-0">$value = '1331113232';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $value);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
			
			<div class="cntner">
				<div class="title2"><p>Plinko</p><a href="http://www.phptester.net/" target="_blank" rel="noopener noreferrer">Try it yourself <i class="fa fa-external-link-alt"></i></a></div>
				
				<div class="text-indent-0 mb-2">/* BEGIN VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash = '5c4a5782034b94ac1613d5d54da8775ff33ecf8479d751d0d9beae4d17811418';</div>
				<div class="text-indent-0">$secret = 'P0lVemVXJAHTqpD3';</div>
				<div class="text-indent-0">$value = '11121212121212';</div>
				<div class="text-indent-0 mt-2 mb-2">/* END VALUES YOU NEED TO CHANGE */</div>
				<div class="text-indent-0">$hash2 = hash('sha256', $secret . '-' . $value);</div>
				<div class="text-indent-0">if($hash == $hash2) {</div>
				<div class="text-indent-1">echo 'Hash does match!';</div>
				<div class="text-indent-0">} else {</div>
				<div class="text-indent-1">echo 'Hash does not match!';</div>
				<div class="text-indent-0">}</div>
			</div>
		</div>
	</div>
</div>