<div class="header-max">
	<div class="header layout flex">
		<!---<img class="logobg" src="<?php echo $site['root'];?>template/img/logobg.svg"> --->

		<div class="header-logo justify-center">
			<a class="justify-center flex" href="<?php echo $site['root'];?>">
				<img src="<?php echo $site['root'];?>template/img/logogg.png">
			</a>
		</div>
		
		<div class="header-menu-top flex items-center justify-between small-menu">
			<div class="inline-block">
				<div class="inline-block">
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>deposit" class="<?php if($paths[0] == 'deposit') echo 'active';?>">Deposit</a></div> -->
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>withdraw" class="<?php if($paths[0] == 'withdraw') echo 'active';?>">Withdraw</a></div> -->
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'fair') echo 'active';?>"><a href="<?php echo $site['root'];?>fair">Provably Fair</a></div>
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'profile') echo 'active';?>"><a href="<?php echo $site['root'];?>profile#r">Referrals</a></div>
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'rewards') echo 'active';?>" style="opacity:1 !important"><a href="<?php echo $site['root'];?>rewards" style="color:#ffc34c !important;opacity:1 !important">Rewards</a></div>
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'leaderboard') echo 'active';?>"><a href="<?php echo $site['root'];?>leaderboard">Leaderboard</a></div>
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'faq') echo 'active';?>"><a href="<?php echo $site['root'];?>faq">FAQ</a></div>
					<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'support') echo 'active';?>"><a href="<?php echo $site['root'];?>support">Support</a></div>
					<?php if(isset($user['rank']) && $user['rank'] == '1' || isset($user['rank']) && $user['rank'] == '100') {  ?>
						<div class="header-menu-button inline-block mr-2 <?php if($paths[0] == 'admin') echo 'active';?>" style="opacity:1 !important"><a href="<?php echo $site['root'];?>admin" style="color:var(--site-color-main) !important;">Admin panel</a></div>
					<?php } ?>
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>tos" class="<?php if($paths[0] == 'tos') echo 'active';?>">Terms Of Service</a></div> -->
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>support" class="<?php if($paths[0] == 'support') echo 'active';?> <?php if($profile['have_supports'] > 0) { ?>text-success<?php } ?>">Support</a></div> -->
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>leaderboard" class="<?php if($paths[0] == 'leaderboard') echo 'active';?>">Leaderboard</a></div> -->
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>rewards" class="<?php if($paths[0] == 'rewards') echo 'active';?>">Rewards</a></div> -->
					<!-- <div class="header-menu-button inline-block mr-2"><a href="<?php echo $site['root'];?>history" class="<?php if($paths[0] == 'history') echo 'active';?>">History</a></div> -->
				</div>
				
				<!-- div class="inline-block ml-2">
					<div class="inline-block mr-1"><a href="<?php echo $site['link_twitter'];?>" target="_blank"><i class="fa fa-twitter" aria-hidden="true"></i></a></div>
					<div class="inline-block mr-1"><a href="<?php echo $site['link_steam'];?>" target="_blank"><i class="fa fa-steam" aria-hidden="true"></i></a></div>
				</div> -->
			</div>

			<div class="online">
					<div></div>
					<p><span id="isonline">0</span> online</p>
				</div>
			
			<!-- <div class="flex items-center gap-2 height-full pr-2"> -->
				<?php if($user){ ?>
				<!--<div class="level-bar flex items-center gap-1">
					<div class="text-bold">Lvl. <span id="level_count">0</span></div>
					
					<div class="progress-container rounded-0">
						<div class="progress-bar transition-2 linear rounded-0" id="level_bar" style="width: 0%;"></div>
						<div class="progress-content flex justify-center items_center text-bold"><span id="level_have">0</span> / <span id="level_next">100</span></div>
					</div>
				</div>-->
				
				<!-- <div class="pointer" data-modal="show" data-id="#modal_auth_settings"><i class="fa fa-cog" aria-hidden="true"></i></div> -->
				
				<!-- <div class="pointer" data-modal="show" data-id="#modal_auth_logout"><i class="fa fa-sign-out" aria-hidden="true"></i></div> -->
				<?php } ?>
			<!-- </div> -->
		</div>
		
		<div class="header-menu-bottom flex items-center justify-between big-menu">
			<div class="inline-block" style="height:50px">
				<!-- <div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>roulette">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'roulette') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/roulette.png">
							<div class="ml-1">Roulette</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>crash">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'crash') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/crash.png">
							<div class="ml-1">Crash</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>jackpot">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'jackpot') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/jackpot.png">
							<div class="ml-1">Jackpot</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>coinflip">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'coinflip') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/coinflip.png">
							<div class="ml-1">Coinflip</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>dice">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'dice') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/dice.png">
							<div class="ml-1">Dice</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>unbox">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'unbox') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/unbox.png">
							<div class="ml-1">Unbox</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>minesweeper">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'minesweeper') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/minesweeper.png">
							<div class="ml-1">Minesweeper</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>tower">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'tower') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/tower.png">
							<div class="ml-1">Tower</div>
						</div>
					</a>
				</div>
				<div class="header-menu-button inline-block mr-2">
					<a href="<?php echo $site['root'];?>plinko">
						<div class="header-side-button flex items-center <?php if($paths[0] == 'plinko') echo 'active';?>">
							<img src="<?php echo $site['root'];?>template/img/side-bar/plinko.png">
							<div class="ml-1">Plinko</div>
						</div>
					</a> 

					
				</div>-->
				<?php
					$casino_array = array('home', 'roulette', 'crash', 'jackpot', 'coinflip', 'dice', 'unbox', 'minesweeper', 'tower', 'plinko');
				?>

				<a href="<?php echo $site['root'];?>home" class="big-link <?php if(in_array($paths[0], $casino_array)) echo 'active';?>">Casino</a>
				<a href="<?php echo $site['root'];?>slots" class="big-link <?php if($paths[0] == 'slots' || $paths[0] == 'slots_game') echo 'active';?>">Slots</a>
				<!-- <a href="<?php echo $site['root'];?>esports" class="big-link <?php if($paths[0] == 'esports') echo 'active';?>">Esports</a> -->
			</div>
			
			<div class="flex items-center gap-2 height-full pr-2">
				<?php if($user){ ?>
				<!-- <a class="header-panel" href="<?php echo $site['root'];?>deposit">
					<div class="bg-light rounded-1 b-l2 pl-2 pr-2 flex items-center justify-center height-full">
						<div class="coins mr-1"></div>
						<span class="balance">0.00</span>
					</div>
				</a> -->
				<div class="header-panel bg-light rounded-1 flex items-center justify-center">
					<a href="/withdraw" class="rb site-button black height-full flex justify-center items-center pt-0 pb-0" style="line-height:30px; background-color: #00b549 !important;font-weight:600">Withdraw</a>
				</div>
				<a role="button" style="float:left;line-height: 20px;margin: 15px 0px;display: flex;-webkit-box-align: center;align-items: center;-webkit-box-pack: center;justify-content: center;border-radius: 3px;padding: 0px 14px;transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) 0s;border-width: 0px 0px 2px;border-top-style: initial;border-right-style: initial;border-left-style: initial;border-image: initial;border-bottom-style: solid;font-size: 14px;white-space: nowrap;overflow: hidden;cursor: pointer;border-color: rgb(41, 149, 84);box-shadow: rgb(51 193 108 / 15%) 0px 4px 4px;line-height: 30px;background-color: #00b549 !important;font-weight: 600;" class="rb" id="rake" data-modal="show" data-id="#modal_rake">Rakeback</a>
				<div class="balance-box">
					<div style="float:left; margin: 9px 0">
						<i class="fa fa-coins"></i>
						<span class="balance">0.00</span>
						<span class="balance-hidden" style="display:none">(In play)</span>
					</div>

					<a href="<?php echo $site['root'];?>deposit">
						<i class="fa fa-plus"></i>
					</a>
				</div>
			
				<!-- <a class="header-panel" href="<?php echo $site['root'];?>profile">
					<div class="bg-main-transparent rounded-1 b-l2 pl-2 pr-2 flex items-center justify-center height-full">
						<img class="rounded-full" src="<?php echo $user['avatar'];?>">
						
						<div class="ml-2"><?php echo $user['name'];?></div>
					</div>
				</a> -->
				<script type="text/javascript">
					const toggleUserDrp = (e) => {
						e.stopPropagation();

						var el = document.getElementById('user_drp');
						let isActive = el.getAttribute('data-active') == 'true';

						el.setAttribute('data-active', !isActive);
					}
				</script>
				<div class="user-av">
					<a href="<?php echo $site['root'];?>profile">
						<img class="rounded-full av" src="<?php echo $user['avatar'];?>">
					</a>

					<div class="progress-circle p2" data-progress="0" id="level_progress" data-isover50="true" style="--progress:0; --size: 38px; --color: var(--site-color-main)">
					  <div class="left-half-clipper">
					    <div class="first50-bar"></div>
					    <div class="value-bar"></div>
					  </div>
					</div>
					
					<div class="ml-2">
						<p class="name"><?php echo $user['name'];?></p>
						<p class="level">Level <span id="level_count">0</span></p>
					</div>



					<div class="wissman-gradient">
						<p>0%</p>
						<div class="g"><div style="width:0%"></div></div>
						<img src="/template/img/crown1.png" alt="" />
					</div>

					<i class="fa fa-angle-down user-dropdown" onclick="toggleUserDrp(event)"></i>

					<div class="drp" id="user_drp" data-active="false">
						<a href="<?php echo $site['root'];?>profile">
							<div>My profile</div>
						</a>
						<div data-modal="show" data-id="#modal_auth_settings">Settings</div>
						<div data-modal="show" data-id="#modal_auth_logout">Sign out</div>
					</div>
				</div>
				<?php }else{ ?>
				<div class="header-panel rounded-1 flex items-center justify-center">
					<button class="login-button site-button black height-full flex justify-center items-center pt-0 pb-0" data-modal="show" data-id="#modal_auth">Login</button>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
</div>

<div class="header-min">
	<div class="header layout flex">
		<div class="header-logo justify-center">
			<a class="justify-center flex" href="<?php echo $site['root'];?>">
				<img src="<?php echo $site['root'];?>template/img/logo.png">
			</a>
		</div>
		
		<div class="flex items-center justify-end gap-2 height-full pr-2">
			<?php if($user){ ?>
			<a href="<?php echo $site['root'];?>deposit">
				<div class="header-panel bg-light rounded-1 b-l2 pl-2 pr-2 flex items-center justify-center">
					<!-- <div class="coins mr-1"></div> -->
					<i class="fa fa-coins" style="margin:4px 4px 0 0;font-size:13px"></i>
					<span class="balance" style="font-weight:600">0.00</span>
				</div>
			</a>
			<?php }else{ ?>
			<div class="header-panel rounded-1 flex items-center justify-center">
				<button class="site-button black height-full flex justify-center items-center pt-0 pb-0" data-modal="show" data-id="#modal_auth">LOGIN</button>
			</div>
			<?php } ?>
		
			<button class="site-button pullout_view" data-pullout="menu"><i class="fa fa-bars" aria-hidden="true"></i></button>
		</div>
	</div>
</div>