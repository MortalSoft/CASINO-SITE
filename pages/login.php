<div class="m-2">
	<div class="flex justify-center">
		<div class="width-6 responsive bg-light-transparent rounded-1 b-l2 p-2">
			<div class="text-left text-bold mb-4 font-8">To have access to <?php echo $page; ?> page please login.</div>
			
			<div class="grid split-column-2 gap-1 mb-2">
				<button class="site-button black switch_panel active" data-id="auth" data-panel="login">LOGIN</button>
				<button class="site-button black switch_panel" data-id="auth" data-panel="register">REGISTER</button>
			</div>
			
			<div class="switch_content" data-id="auth" data-panel="login">
				<div class="grid split-column-3 gap-2 mr-2 ml-2">
					<a href="<?php echo $site['root'];?>auth/steam?assign=0&return=<?php echo $site['path'];?>">
						<div class="social-login steam rounded-1 flex justify-center items-center width-full"></div>
					</a>
					
					<a href="<?php echo $site['root'];?>auth/google?assign=0&return=<?php echo $site['path'];?>">
						<div class="social-login google rounded-1 flex justify-center items-center width-full"></div>
					</a>
					
					<div class="social-login facebook rounded-1 flex justify-center items-center width-full disabled"></div>
				</div>
				
				<div class="title width-full flex items-center justify-center mt-1 mb-1">or</div>
			
				<form class="form_auth" autocomplete="login" method="POST" action="<?php echo $site['root'];?>auth/login?return=<?php echo $site['path'];?>">
					<div class="flex column items-center gap-2">
						<div class="input_field bet_input_field transition-5" data-border="#de4c41">
							<div class="field_container">
								<div class="field_content">
									<input type="text" class="field_element_input" name="username" value="" autocomplete="email">
									
									<div class="field_label">Username / E-mail</div>
								</div>
								
								<div class="field_extra"></div>
							</div>
							
							<div class="field_bottom">
								<div class="field_error" data-error="required">This field is required</div>
								<div class="field_error" data-error="username_email">This field must be a username or a email</div>
							</div>
						</div>
						
						<div class="input_field bet_input_field transition-5" data-border="#de4c41">
							<div class="field_container">
								<div class="field_content">
									<input type="password" class="field_element_input" name="password" value="" autocomplete="password">
									
									<div class="field_label">Password</div>
								</div>
								
								<div class="field_extra"></div>
							</div>
							
							<div class="field_bottom">
								<div class="field_error" data-error="required">This field is required</div>
								<div class="field_error" data-error="password">At least 8 characters, one uppercase, one lowercase, one number and one symbol</div>
							</div>
						</div>
						
						<div class="flex justify-start width-full mt-2">
							<div class="text-gray pointer font-6" data-modal="show" data-id="#modal_auth_recover">Recover password</div>
						</div>
						
						<button type="submit" class="site-button purple mt-1">Sumbit</button>
					</div>
				</form>
			</div>
			
			<div class="switch_content hidden" data-id="auth" data-panel="register">
				<form class="form_auth" autocomplete="register" method="POST" action="<?php echo $site['root'];?>auth/register?return=<?php echo $site['path'];?>">
					<div class="flex column items-center gap-2">
						<div class="input_field bet_input_field transition-5" data-border="#de4c41">
							<div class="field_container">
								<div class="field_content">
									<input type="text" class="field_element_input" name="email" value="" autocomplete="email">
									
									<div class="field_label">E-mail</div>
								</div>
								
								<div class="field_extra"></div>
							</div>
							
							<div class="field_bottom">
								<div class="field_error" data-error="required">This field is required</div>
								<div class="field_error" data-error="email">This field must be a email</div>
							</div>
						</div>
						
						<div class="input_field bet_input_field transition-5" data-border="#de4c41">
							<div class="field_container">
								<div class="field_content">
									<input type="text" class="field_element_input" name="username" value="" autocomplete="username">
									
									<div class="field_label">Username</div>
								</div>
								
								<div class="field_extra"></div>
							</div>
							
							<div class="field_bottom">
								<div class="field_error" data-error="required">This field is required</div>
								<div class="field_error" data-error="username">At least 6 characters, only lowercase, numbers and underscore are allowed</div>
							</div>
						</div>
						
						<div class="input_field bet_input_field transition-5" data-border="#de4c41">
							<div class="field_container">
								<div class="field_content">
									<input type="password" class="field_element_input" name="password" value="" autocomplete="password">
									
									<div class="field_label">Password</div>
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
</div>