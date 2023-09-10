<link rel="stylesheet" type="text/css" href="/template/css/support.css?v=5" />

<?php
$departaments = array(
  '1'=>'General / Others',
  '2'=>'Bug report',
  '3'=>'Trade offer issue',
  '4'=>'Improvements / Ideas',
  '5'=>'Marketing / Partnership',
  '6'=>'Ranking up'
); ?>

<script type="text/javascript">
	const openTicket = id => {
		if(id == 0) {
			$('.msg_container_full').hide();
			$('.new_msg').show();
			$('.support .container').hide();
		} else {
			$('.new_msg').hide();
			$('.msg_container_full').hide();
			$(`.msg_container_full[data-id="${id}"]`).show();
			$('.support .container').show();
		}
	}



	$(document.body).on('change',".new_msg select",function (e) {
    $('#new_category').val(e.target.value);
  });
</script>

<div class="support">
	<div class="left">
		<button class="new" onclick="openTicket(0)">New ticket</button>

		<?php foreach($support as $key => $value_support){
       
     $tickets_support = array();
     
     foreach($tickets as $key => $value_ticket){
       if($value_ticket['support_id'] == $value_support['id']){
         array_push($tickets_support, $value_ticket);
       }
     } 

     //$answered = ($tickets_support[(sizeof($tickets_support) - 1)]['user'] == $value_support['to_user']) ? 1 : 0;
     
     ?>

		<div class="ticket" onclick="openTicket(`<?php echo $value_support['id'];?>`)">
			<p class="big"><?php echo $value_support['title'];?></p>
			<p class="small"><?php echo $departaments[$value_support['departament']];?></p>

			<p class="date"><?php echo date('d-m-Y H:i', $value_support['time']);?></p>

			
			<?php if($value_support['closed'] == 1) echo '<i class="fa fa-lock"></i>'; ?>
		</div>

		<?php } ?>
	</div>

	<div class="main">
		<div class="new_msg">
			<form method="POST">
				<label>Title</label>
				<input type="text" placeholder="Your ticket title" name="title" />

				<label>Category</label>
				<select name="departament">
					<option value="3">Improvement / Ideas</option>
					<option value="2">Bug report</option>
					<option value="4">Marketing / Sponsoring</option>
					<option value="1">General / Others</option>
				</select>

				<label>Message</label>
				<textarea placeholder="Your message" name="message" id="message_textarea"></textarea>
				<button class="send" type="submit" id="new_ticket" name="new_ticket">Send message</button>
			</form>
		</div>

		<div class="container" style="display:none">
			<?php foreach($support as $key => $value_support){
       
		     $tickets_support = array();
		     
		     foreach($tickets as $key => $value_ticket){
		       if($value_ticket['support_id'] == $value_support['id']){
		         array_push($tickets_support, $value_ticket);
		       }
		     } 
		     
		     //$answered = ($tickets_support[(sizeof($tickets_support) - 1)]['user'] == $value_support['to_user']) ? 1 : 0;
		     
		     ?>
			     <div class="msg_container_full" style="display:none" data-id="<?php echo $value_support['id'];?>">
						<div class="msg_container<?php if($value_support['closed'] == 1) echo ' full'; ?>">
							<?php foreach($tickets_support as $key => $value_ticket){ ?>
			          <div class="msg<?php echo ($value_ticket['response'] == 1)? ' support' : '';?>">
									<div class="info">
										<p><?php echo ($user['userid'] == isset($value_ticket['user'])) ? 'You' : $value_ticket['name'];?></p>
										<div><?php echo date('d.m.Y H:i', $value_ticket['time']);?></div>
									</div>

									<div class="content">
										<?php echo $value_ticket['message'];?>
									</div>
								</div>
		          <?php } ?>
						</div>

						<?php if($value_support['closed'] == 0) { ?>
						<div class="input">
							<form action="<?php echo $site['root'];?>support?id=<?php echo $value_support['id'];?>" method="POST">
								<textarea placeholder="Write your message here" name="message" id="message_textarea"></textarea>
								<div>
									<button class="send" type="submit" name="reply_ticket">Reply</button>
									<button class="close" type="submit" name="close_ticket">Close ticket</button>
								</div>
							</form>
						</div>
						<?php } ?>

					</div>
				<?php } ?>






			<!-- <div class="msg_container">
				<div class="msg">
					<div class="info">
						<p>hxtnv</p>
						<div>19.12.2021, 17:22</div>
					</div>

					<div class="content">
						Hey!
					</div>
				</div>

				<div class="msg support">
					<div class="info">
						<p>hxtnv</p>
						<div>19.12.2021, 17:22</div>
					</div>

					<div class="content">
						Hey!
					</div>
				</div>
			</div> -->



			<!-- <div class="input">
				<textarea placeholder="Write your message here"></textarea>
				<div>
					<button class="send">Send message</button>
					<button class="close">Close ticket</button>
				</div>
			</div> -->
		</div>
	</div>
</div>