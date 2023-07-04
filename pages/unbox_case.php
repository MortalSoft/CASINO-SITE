<div class="cases" style="width:100%;float:left">
	<div class="drops-container">
		<div class="gradient"></div>
		
		<div class="drops" id="unbox_history"></div>
	</div>
</div>

<!-- <div class="flex justify-between pr-2 pl-2 font-9">
	<div id="unboxing_name"></div>
	<div class="flex">
		<div class="coins mr-1"></div>
		<div id="unboxing_price">0.00</div>
	</div>
</div> -->

<div class="game-info unbox-game-info">
	<div>
		<p>Round hash:</p> <span id="unbox_info_hash">-</span>
	</div>
	<div>
		<p>Round secret:</p> <span id="unbox_info_secret">-</span>
	</div>
	<div>
		<p>Round percentage:</p> <span id="unbox_info_percentage">-</span>
	</div>
</div>

<div class="unbox-case relative mt-2 transition-5" id="unbox_case">
	<div class="group-reel flex" id="unbox_spinner">
		<div class="flex" id="unbox_field"></div>
	</div>
	
	<div class="shadow shadow-left"></div>
	<div class="shadow shadow-right"></div>
	
	<div class="absolute top-0 bottom-0 left-0 right-0 flex justify-center">
		<div class="pointer flex items-center"></div>
	</div>
</div>

<div class="case-btns">
	<div id="unboxing_name"></div>

	<button class="site-button purple" id="unbox_open">
		<span>Open case (</span>
		<span id="unboxing_price">0.00</span>
		<span><i class="fa fa-coins"></i>)</span>
	</button>
	<button class="site-button pink" id="unbox_test">Demo Spin</button>
</div>

<div class="case-list">
	<div class="text-left font-8">This case contains:</div>

	<div class="unbox-list" id="unbox_list"></div>
</div>