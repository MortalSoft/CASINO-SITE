<div class="p-2">
	<div class="grid split-column-full responsive gap-1 mb-2">
		<button class="site-button black switch_panel active" data-id="history" data-panel="roulette">Roulette</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="crash">Crash</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="jackpot">Jackpot</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="coinflip">Coinflip</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="dice">Dice</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="unbox">Unbox</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="minesweeper">Minesweeper</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="tower">Tower</button>
		<button class="site-button black switch_panel" data-id="history" data-panel="plinko">Plinko</button>
	</div>

	<div class="switch_content" data-id="history" data-panel="roulette">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Roll</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['roulette']) > 0){?>
				<?php foreach($histories['roulette'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['roll'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="crash">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Point</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['crash']) > 0){?>
				<?php foreach($histories['crash'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left">x<?php echo $value['point'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="jackpot">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Percentage</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['jackpot']) > 0){?>
				<?php foreach($histories['jackpot'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['percentage'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="coinflip">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Percentage</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['coinflip']) > 0){?>
				<?php foreach($histories['coinflip'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['percentage'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="dice">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Roll</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['dice']) > 0){?>
				<?php foreach($histories['dice'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['roll'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="unbox">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Percentage</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['unbox']) > 0){?>
				<?php foreach($histories['unbox'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['percentage'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="minesweeper">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Value</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['minesweeper']) > 0){?>
				<?php foreach($histories['minesweeper'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['value'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="tower">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Value</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['tower']) > 0){?>
				<?php foreach($histories['tower'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['value'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
	
	<div class="switch_content hidden" data-id="history" data-panel="plinko">
		<div class="table-container mt-2">
			<div class="table-header">
				<div class="table-row">
					<div class="table-column text-left">Id</div>
					<div class="table-column text-left">Hash</div>
					<div class="table-column text-left">Secret</div>
					<div class="table-column text-left">Value</div>
				</div>
			</div>
			
			<div class="table-body">
				<?php if(sizeof($histories['plinko']) > 0){?>
				<?php foreach($histories['plinko'] as $key => $value){ ?>
					<div class="table-row">
						<div class="table-column text-left">#<?php echo $value['id'];?></div>
						<div class="table-column text-left"><?php echo $value['hash'];?></div>
						<div class="table-column text-left"><?php echo $value['secret'];?></div>
						<div class="table-column text-left"><?php echo $value['value'];?></div>
					</div>
				<?php } ?>
				<?php } else { ?>
				<div class="table-row">
					<div class="table-column">No data found</div>
				</div>
				<?php } ?>
			</div>
		</div>
	</div>
</div>