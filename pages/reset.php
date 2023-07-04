<div class="m-2">
	<div class="flex justify-center">
		<div class="width-6 responsive bg-light-transparent rounded-1 b-l2 p-2">
			<form class="form_auth" autocomplete="recover" method="POST" action="<?php echo $site['root'];?>auth/reset?key=<?php echo $key; ?>">
				<div class="flex column items-center">
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="password" class="field_element_input" name="password" value="">
								
								<div class="field_label">Password</div>
							</div>
							
							<div class="field_extra"></div>
						</div>
						
						<div class="field_bottom">
							<div class="field_error" data-error="required">This field is required</div>
							<div class="field_error" data-error="password">At least 8 characters, one uppercase, one lowercase, one number and one symbol</div>
						</div>
					</div>
					
					<div class="input_field bet_input_field transition-5" data-border="#de4c41">
						<div class="field_container">
							<div class="field_content">
								<input type="password" class="field_element_input" name="confirm_password" value="">
								
								<div class="field_label">Confirm Password</div>
							</div>
							
							<div class="field_extra"></div>
						</div>
						
						<div class="field_bottom">
							<div class="field_error" data-error="required">This field is required</div>
							<div class="field_error" data-error="password">At least 8 characters, one uppercase, one lowercase, one number and one symbol</div>
						</div>
					</div>
					
					<button type="submit" class="site-button purple mt-1">Sumbit</button>
				</div>
			</form>
		</div>
	</div>
</div>