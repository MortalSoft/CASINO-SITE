<?php if(isset($_GET['minimal'])) {
	echo '<script>PAGE = "' . $page . '";';
	echo 'PATHS = ' . json_encode($paths) . ';</script>';

	return include $_SERVER["DOCUMENT_ROOT"].'/core/pages/'.$name_page.'.php';
} ?>

<html lang="en">
	<head>
		<!--  META  -->
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title><?php echo $name;?> | <?php echo $site['name'];?></title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1">
		<meta name="keywords" content="<?php echo $site['keywords'];?>">
		<meta name="description" content="<?php echo $site['description'];?>">
		<meta name="author" content="<?php echo $site['author'];?>">
		<meta property="og:url" content="<?php echo $site['url'];?>">
		<meta property="og:site_name" content="<?php echo $site['name'];?>">
		<meta property="og:title" content="<?php echo $site['name'];?>" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="<?php echo $site['url'];?>" />
		<meta property="og:image" content="<?php echo $site['root'];?>favicon-96x96.png" />
		<meta property="og:description" content="The world of high stakes" />
		<meta name="theme-color" content="#3CA1D7">
		
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-16x16.png" sizes="16x16">
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-32x32.png" sizes="32x32">
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-96x96.png" sizes="96x96">
		
		<!--  CSS  -->
		<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Roboto:400,300,500,400italic,500italic,700,700italic" rel="stylesheet"> 
		<link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet">
		
		<link href="<?php echo $site['root'];?>template/css/style.css" rel="stylesheet">
		<link href="<?php echo $site['root'];?>template/css/others.css" rel="stylesheet">
		<link href="<?php echo $site['root'];?>template/css/bouncer.css" rel="stylesheet">
		
	</head>
	
	<body>
		<?php include $_SERVER["DOCUMENT_ROOT"].'/core/pages/includes/first.php';?>
		
		<?php include $_SERVER["DOCUMENT_ROOT"].'/core/pages/includes/modals.php';?>
		
		<div class="flex column height-full width-full">
			<?php include $_SERVER["DOCUMENT_ROOT"].'/core/pages/includes/header.php'; ?>
			<div class="wrapper-page flex row">
				<div class="main-panel text-center" id="page_loader">
					<div id="page_content" style="min-height:calc(100vh - 120px);min-width:1px">
						<div id="page_content2">
							<?php include  $_SERVER["DOCUMENT_ROOT"].'/core/pages/'.$name_page.'.php'; ?>
						</div>
					</div>
					
					<!-- <div class="alerts-panel transition-5 flex items-center justify-center p-2" style="display: none;">
						<span class="text-alert"></span>
						<i class="fa fa-times hide_chat demiss-alert" aria-hidden="true"></i>
					</div>
				</div> -->

					<?php include $_SERVER["DOCUMENT_ROOT"].'/core/pages/includes/footer.php'; ?>
				</div>
				
				<?php include $_SERVER["DOCUMENT_ROOT"].'/core/pages/includes/chat.php'; ?>
			</div>
		</div>

		<div id="bb_info_container">

			<div class="bb_info hidden">
				<div class="left">
					<h3>Bonus battle starting!</h3>
					<p>Your battle <span id="bb_info_id">#21</span> for <span id="bb_info_val">20.00</span> <i class="fa fa-coins"></i> has started. Click the button on the right to start playing.</p>
				</div>

				<a href="" id="bb_info_link">Open battle</a>
			</div>

		</div>
		<!--  JAVASCRIPT  -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.3.2/socket.io.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/tinysort/2.3.6/tinysort.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
		<!-- <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script> -->
		<script type="text/javascript" src="<?php echo $site['root'];?>template/js/settings.js"></script>
		<script type="text/javascript" src="<?php echo $site['root'];?>template/js/app.js"></script>
		<script>
			const WELCOME = `

				==========================================
					DEMO DEMO DEMO DEMO DEMO DEMO DEMO
				==========================================

			`;


			<?php echo 'var PAGE = "' . $page . '";'; ?>
			<?php echo 'var ROOT = "' . $site['root'] . '";'; ?>
			<?php echo 'var PATHS = ' . json_encode($paths) . ';'; ?>
			<?php echo 'var PORT = "' . $site['port'] . '";'; ?>
			<?php echo 'var RECAPTCHA_SITEKEY = "' . $site['recaptcha']['sitekey'] . '";'; ?>
			<?php if($user['name']) { echo 'var USER = "'.$user['name'].'";'; } else { echo 'var USER = "";'; } ?>
		</script>
		<script src='https://www.google.com/recaptcha/api.js'></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/all.min.js" crossorigin="anonymous"></script>
	</body>
</html>