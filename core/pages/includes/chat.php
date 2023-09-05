<!-- <div class="slider slider-right text-right slider-top flex justify-content transition-5 p-2 pullout_view" data-pullout="cart">
	<i class="fa fa-shopping-cart" aria-hidden="true"></i>
</div> -->

<!--<div class="pullout pullout-right flex column transition-5" data-pullout="cart">
	<div class="m-2">
		<div class="flex justify-between items-center mb-2 font-7">
			<div class="pullout_view pointer" data-pullout="cart"><i class="fa fa-times" aria-hidden="true"></i></div>
		</div>
		
		<?php if(($paths[0] == 'deposit' || $paths[0] == 'withdraw') && sizeof($paths) > 0){?>
		<div class="grid split-column-2 gap-1">
			<button class="site-button black switch_panel active" data-id="offers" data-panel="cart">CART</button>
			<button class="site-button black relative switch_panel" data-id="offers" data-panel="pending">PENDING<div class="sop-medium-right bg-danger rounded-full flex justify-center items-center hidden" id="pending_count">0</div></button>
		</div>
		<?php } else { ?>
		<button class="site-button black relative switch_panel width-full active" data-id="offers" data-panel="pending">PENDING<div class="sop-medium-right bg-danger rounded-full flex justify-center items-center hidden" id="pending_count">0</div></button>
		<?php } ?>
	</div>

	<div class="wrapper-page flex column height-full width-full">
		<div class="wrapper-page switch_content flex column pr-1 pl-1 <?php if(($paths[0] != 'deposit' && $paths[0] != 'withdraw') || sizeof($paths) <= 0) echo 'hidden'; ?>" data-id="offers" data-panel="cart">
			<button class="site-button purple width-full" id="confirm_offer">Confirm</button>
			
			<?php if($paths[0] == 'deposit' && $paths[1] == 'p2p'){ ?>
			<div class="mt-2">
				<div class="slider_field transition-5">
					<div class="field_container">
						<div class="field_content">
							<input type="range" class="field_element_input" id="bundle_offset" min="-10" max="10" step="1" value="0">
							
							<div class="field_cursor_content">
								<div class="field_cursor">
									<div class="field_cursor_text">0</div>
								</div>
							</div>
							
							<div class="field_label active transition-5">Offset Price</div>
						</div>
						
						<div class="field_extra"></div>
					</div>
					
					<div class="field_bottom">
						<div class="flex justify-between">
							<div>-10</div>
							<div>10</div>
						</div>
					</div>
				</div>
			</div>
			<?php } ?>
			
			<div class="header-items">
				<div class="text-left">Skins: <span id="cart_items_count">0</span></div>
				<div class="text-right">Coins: <span id="cart_items_total">0</span></div>
			</div>
			
			<div class="flex gap-1 column width-full p-1 pt-2 pb-2 overflow-a" id="cart-items">

			</div>
		</div>
		
		<div class="wrapper-page switch_content flex column pr-1 pl-1 <?php if(($paths[0] == 'deposit' || $paths[0] == 'withdraw') && sizeof($paths) > 0) echo 'hidden'; ?>" data-id="offers" data-panel="pending">
			<div class="header-items">
				<div class="text-left">Skins: <span id="padding_items_count">0</span></div>
				<div class="text-right">Coins: <span id="padding_items_total">0</span></div>
			</div>
			
			<div class="grid gap-2 width-full p-1 pt-2 pb-2 overflow-a" id="pending-offers">
				
			</div>
		</div>
	</div>
</div>-->


<div class="slider slider-right text-left slider-top flex justify-content show_chat p-2 pullout_view" data-pullout="chat">
	<i class="fa fa-comments" aria-hidden="true"></i>
</div>

<div class="pullout pullout-right flex column" data-pullout="chat">
	<div class="m-2">
		<div class="grid split-column-full gap-1" style="display:none !important">
			<div class="flag rounded-1 flex items-center justify-center relative active" data-channel="en" data-name="English"><img class="rounded-full" src="<?php echo $site['root'];?>template/img/lang/en.png"><div class="sop-medium-right bg-danger rounded-full flex justify-center items-center new-messages hidden">0</div></div>
			<div class="flag rounded-1 flex items-center justify-center relative" data-channel="es" data-name="Spanish"><img class="rounded-full" src="<?php echo $site['root'];?>template/img/lang/es.png"><div class="sop-medium-right bg-danger rounded-full flex justify-center items-center new-messages hidden">0</div></div>
			<div class="flag rounded-1 flex items-center justify-center relative" data-channel="fr" data-name="Français"><img class="rounded-full" src="<?php echo $site['root'];?>template/img/lang/fr.png"><div class="sop-medium-right bg-danger rounded-full flex justify-center items-center new-messages hidden">0</div></div>
			<div class="flag rounded-1 flex items-center justify-center relative" data-channel="ru" data-name="Pусский"><img class="rounded-full" src="<?php echo $site['root'];?>template/img/lang/ru.png"><div class="sop-medium-right bg-danger rounded-full flex justify-center items-center new-messages hidden">0</div></div>
			<div class="flag rounded-1 flex items-center justify-center relative" data-channel="de" data-name="German"><img class="rounded-full" src="<?php echo $site['root'];?>template/img/lang/de.png"><div class="sop-medium-right bg-danger rounded-full flex justify-center items-center new-messages hidden">0</div></div>
		</div>

		<div class="grid split-column-full gap-1">
			<script type="text/javascript">
				const joinRoom = (id, shouldClick = true) => {
					const room_data = {
						0: {name: 'English room', flag: 'US'},
						1: {name: 'Spanish room', flag: 'SP'},
						2: {name: 'French room', flag: 'FR'},
						3: {name: 'Russian room', flag: 'RU'},
						4: {name: 'German room', flag: 'DE'},
					}

					document.getElementById('rooms_container').setAttribute('data-activeroom', id);
					document.getElementById('chat_selected_name').innerHTML = room_data[id].name;
					document.getElementById('chat_selected_img').setAttribute('src', `https://purecatamphetamine.github.io/country-flag-icons/3x2/${room_data[id].flag}.svg`);

					if(shouldClick) document.querySelectorAll('[data-channel]')[id].click();
				}

				const toggleChatList = () => {
					const el = document.getElementsByClassName('lang-select')[0];

					el.setAttribute('data-active', el.getAttribute('data-active') == 'false' ? 'true' : 'false');
				}
			</script>

			<div class="lang-select" data-active="false" onclick="toggleChatList()">
				<div class="selected">
					<i class="fa fa-angle-down drop"></i>

					<img id="chat_selected_img" src="https://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg" />
					<p id="chat_selected_name">English room</p>
				</div>


				<div class="options" id="rooms_container" data-activeroom="0">
					<div class="opt" onclick="joinRoom(0)">
						<img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg" />
						<p>English room</p>

						<i class="fa fa-check check room-checkmark" data-roomid="0"></i>
					</div>

					<div class="opt" onclick="joinRoom(3)">
						<img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/RU.svg" />
						<p>Russian room</p>

						<i class="fa fa-check check room-checkmark" data-roomid="3"></i>
					</div>

					<div class="opt" onclick="joinRoom(4)">
						<img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/DE.svg" />
						<p>German room</p>

						<i class="fa fa-check check room-checkmark" data-roomid="4"></i>
					</div>

					<div class="opt" onclick="joinRoom(2)">
						<img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/FR.svg" />
						<p>French room</p>

						<i class="fa fa-check check room-checkmark" data-roomid="2"></i>
					</div>

					<div class="opt" onclick="joinRoom(1)">
						<img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/ES.svg" />
						<p>Spanish room</p>

						<i class="fa fa-check check room-checkmark" data-roomid="1"></i>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	
	
	<div class="chat-group flex column">
		<div class="rain_panel p-3 hidden">
			<div class="inline-block">
				<i class="fa fa-cloud-showers-heavy"></i>
				<div class="rain-title">It's raining!</div>
			</div>

			<div class="rainJoin hidden">
				<div class="text-center font-8">Join to claim some free coins - good luck!</div>
				
				<button type="button" class="site-button purple" id="join_rain">JOIN</button>
			</div>
			
			<div class="rainJoined hidden">
				<div class="text-center font-8">You have successfully joined the rain! You will receive your coins as soon as the rain is over.</div>
			</div>
			
			<div class="rainWait hidden">
				<div class="text-center font-8">The time to enter to rain has elapsed. You can enter the next rain.</div>
			</div>
		</div>

		<div id="chat-area">
			<!-- here be dragons -->
		</div>
			
		<div class="emojis-panel text-center">
			<?php
			$emojis = array('smile', 'smiley', 'grin', 'pensive', 'weary', 'astonished', 'rolling_eyes', 'relaxed', 'wink', 'woozy_face', 'zany_face', 'hugging', 'joy', 'sob', 'grimacing', 'rofl', 'face_monocle', 'thinking', 'pleading_face', 'sleeping', 'sunglasses', 'heart_eyes', 'smiling_hearts', 'kissing_heart', 'star_struck', 'nerd', 'innocent', 'face_vomiting', 'money_mouth', 'cold_sweat', 'partying_face', 'exploding_head', 'rage', 'hot_face', 'cold_face', 'smiling_imp', 'alien', 'clown', 'scream_cat', 'smiley_cat', 'robot', 'ghost', 'skull', 'poop', 'jack_o_lantern', '100', 'bell', 'birthday', 'gift', 'first_place', 'trophy', 'tada', 'crown', 'fire', 'heart', 'broken_heart', 'wave', 'clap', 'raised_hands', 'thumbsup', 'peace', 'ok_hand', 'muscle', 'punch', 'moneybag');
			
			if(sizeof($emojis) > 0){
				echo '<div class="emojis-content m-2">';
				echo '<div class="title-panel text-left rounded-0 p-1 mb-1">Emojis</div>';
				
				foreach($emojis as $emoji){
					echo '<img loading="lazy" id="chat_place_emoji" title=":' . $emoji . ':" data-emoji=":' . $emoji . ':" src="' . $site['root'] . 'template/img/emojis/' . $emoji . '.png">';
				}
				echo '</div>';
			}
			?>
			
			<?php
			$pepe = array('crypepe', 'firinpepe', 'happepe', 'monkachrist', 'okpepe', 'sadpepe');
			
			if(sizeof($pepe) > 0){
				echo '<div class="emojis-content m-2">';
				echo '<div class="title-panel text-left rounded-0 p-1 mb-1">Pepe</div>';
				
				foreach($pepe as $emoji){
					echo '<img loading="lazy" id="chat_place_emoji" title=":' . $emoji . ':" data-emoji=":' . $emoji . ':" src="' . $site['root'] . 'template/img/emojis/' . $emoji . '.png">';
				}
				echo '</div>';
			}
			?>
			
			<?php
			$faces = array('gaben', 'kappa', 'kappapride', 'kim', 'pogchamp', 'shaq');
			
			if(sizeof($faces) > 0){
				echo '<div class="emojis-content m-2">';
				echo '<div class="title-panel text-left rounded-0 p-1 mb-1">Faces</div>';
				
				foreach($faces as $emoji){
					echo '<img loading="lazy" id="chat_place_emoji" title=":' . $emoji . ':" data-emoji=":' . $emoji . ':" src="' . $site['root'] . 'template/img/emojis/' . $emoji . '.png">';
				}
				echo '</div>';
			}
			?>
			
			<?php
			$gifs = array('alert', 'awp', 'bananadance', 'carlton', 'fortdance', 'grenade', 'lolizard', 'partyblob', 'saxguy', 'squidab', 'turtle', 'zombie');
			
			if(sizeof($gifs) > 0){
				echo '<div class="emojis-content m-2">';
				echo '<div class="title-panel text-left rounded-0 p-1 mb-1">Gifs</div>';
				
				foreach($gifs as $emoji){
					echo '<img loading="lazy" id="chat_place_emoji" title=":' . $emoji . ':" data-emoji=":' . $emoji . ':" src="' . $site['root'] . 'template/img/emojis/' . $emoji . '.gif">';
				}
				echo '</div>';
			}
			?>
			
			<?php
			$messages = array('bet', 'cant', 'cashout', 'doit', 'dont', 'feelsbad', 'feelsgood', 'gg', 'gl', 'highroller', 'joinme', 'letsgo', 'win', 'lose', 'nice', 'sniped', 'midtick', 'lowtick');
			
			if(sizeof($messages) > 0){
				echo '<div class="emojis-content m-2">';
				echo '<div class="title-panel text-left rounded-0 p-1 mb-1">Messages</div>';
				
				foreach($messages as $emoji){
					echo '<img loading="lazy" id="chat_place_emoji" title=":' . $emoji . ':" data-emoji=":' . $emoji . ':" src="' . $site['root'] . 'template/img/emojis/' . $emoji . '.png">';
				}
				echo '</div>';
			}
			?>
		</div>
			
		<div class="chat-input">
			<div style="position: relative;">
				<div class="emojis-smile-icon flex" data-type="show"><i class="fa fa-smile-o" aria-hidden="true"></i></div>
				<div class="emojis-smile-icon flex hidden" data-type="hide"><i class="fa fa-times" aria-hidden="true"></i></div>
			
				<form id="chat-input-form"><input type="text" class="chat-input-field" style="padding-right:43px" placeholder="Say something" id="chat_message" maxlength="200" autocomplete="off"></form>
				<div class="chat-input-scroll flex items-center justify-center hidden">Scroll to recent messages</div>
			</div>
		</div>
	</div>
</div>

<div class="pullout pullout-left flex column transition-5" data-pullout="menu">
	<div class="header-menu-center wrapper-page flex column height-full width-full">
		<div class="flex column gap-4 pr-4 pl-4 pb-4" style="height: 100%;overflow: hidden; overflow-y: auto; padding-top: 20px">
			<div class="flex column">
				<script type="text/javascript">
					const toggleSideMenu = id => {
						const menu = $(`.section-menu[data-id="${id}"]`);
						const links = $(`.section-menu[data-id="${id}"] .links`);

						if(menu.attr('data-hidden') == 'false') {
							links.slideDown(0).slideUp('fast');
						} else {
							links.slideUp(0).slideDown('fast');
						}

						menu.attr('data-hidden', menu.attr('data-hidden') == 'false' ? 'true' : 'false');
						// links.slideDown(0).slideUp('fast');
					}
				</script>

				<div class="section-menu" data-hidden="false" data-id="0">
					<h4 class="menu-section-title" onclick="toggleSideMenu(0)">
						<span>Casino</span>
						<i class="fa fa-caret-down"></i>
					</h4>

					<div class="links">
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>slots">
								<div class="header-side-button flex items-center  <?php if($paths[0] == 'slots') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/Slots.png">
									<div class="ml-1">Slots</div>
								</div>
							</a>
						</div>

					<!--	<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>slots#live">
								<div class="header-side-button flex items-center  <?php if($paths[0] == 'slots') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/live.png">
									<div class="ml-1">Live Games</div>
								</div>
							</a>
						</div>

						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>slot_arenas">
								<div class="header-side-button flex items-center  <?php if($paths[0] == 'slot_arenas') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/swords_1.svg">
									<div class="ml-1">Slot Arena</div>
								</div>
							</a>
						</div> -->
					</div>
				</div>





				<div class="section-menu" data-hidden="false" data-id="0">
					<h4 class="menu-section-title" onclick="toggleSideMenu(0)">
						<span>House games</span>
						<i class="fa fa-caret-down"></i>
					</h4>

					<div class="links">
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>roulette">
								<div class="header-side-button flex items-center  <?php if($paths[0] == 'roulette') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/Roulette.png">
									<div class="ml-1">Roulette</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>crash">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'crash') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/crash.png">
									<div class="ml-1">Crash</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>jackpot">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'jackpot') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/Jackpot.png">
									<div class="ml-1">Jackpot</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>coinflip">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'coinflip') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/coinflip.png">
									<div class="ml-1">Coinflip</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>dice">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'dice') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/Dice.png">
									<div class="ml-1">Dice</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>minesweeper">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'minesweeper') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/MineSweeper.png">
									<div class="ml-1">Minesweeper</div>
								</div>
							</a>
						</div>
						<div class="header-menu-button">
							<a href="<?php echo $site['root'];?>tower">
								<div class="header-side-button flex items-center <?php if($paths[0] == 'tower') echo 'active';?>">
									<img src="<?php echo $site['root'];?>template/img/new_icons/Tower.png">
									<div class="ml-1">Tower</div>
								</div>
							</a>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>