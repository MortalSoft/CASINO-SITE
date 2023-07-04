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
		
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-16x16.png?v=<?php echo time();?>" sizes="16x16">
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-32x32.png?v=<?php echo time();?>" sizes="32x32">
		<link rel="icon" type="image/png" href="<?php echo $site['root'];?>favicon-96x96.png?v=<?php echo time();?>" sizes="96x96">
		
		<!--  CSS  -->
		<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Roboto:400,300,500,400italic,500italic,700,700italic" rel="stylesheet">
		<link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet">
		
		<link href="<?php echo $site['root'];?>template/css/style.css?v=<?php echo time();?>" rel="stylesheet">
		<link href="<?php echo $site['root'];?>template/css/others.css?v=<?php echo time();?>" rel="stylesheet">
		<link href="<?php echo $site['root'];?>template/css/bouncer.css?v=<?php echo time();?>" rel="stylesheet">
		
		<!--  JAVASCRIPT  -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.3.2/socket.io.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/tinysort/2.3.6/tinysort.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
		<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
		
		<script src='https://www.google.com/recaptcha/api.js'></script>
		<script src="https://www.google-analytics.com/analytics.js"></script>
		
		<script>
			<?php echo 'var PAGE = "' . $page . '";'; ?>
			<?php echo 'var ROOT = "' . $site['root'] . '";'; ?>
			<?php echo 'var PATHS = ' . json_encode($paths) . ';'; ?>
			<?php echo 'var PORT = "' . $site['port'] . '";'; ?>
			<?php echo 'var RECAPTCHA_SITEKEY = "' . $site['recaptcha']['sitekey'] . '";'; ?>
		</script>
		
		<script type="text/javascript" src="<?php echo $site['root'];?>template/js/settings.js?v=<?php echo time();?>"></script>
		<script type="text/javascript" src="<?php echo $site['root'];?>template/js/app.js?v=<?php echo time();?>"></script>
	</head>
	
	<body>
		<?php include 'tools/first.php';?>
		
		<?php include 'tools/modals.php';?>
	
		<div class="flex column gap-4 justify-center items-center height-full width-full">
			<img class="width-4 responsive" src="<?php echo $site['root'];?>template/img/logo.png">
			
			<div class="mt-2 mb-2 font-12"><?php echo $maintenance_message;?></div>
		
			<div class="text-space-1 pl-4 pr-4 pt-2 pb-2 bt-l2 bb-l2 font-15">MAINTENANCE</div>
			
				<div class="grid split-column-2 gap-2">
					<a target="_blank" href="<?php echo $site['link_twitter'];?>"><div class="social-login twitter icon-medium rounded-1 flex justify-center items-center"></div></a>
					<a target="_blank" href="<?php echo $site['link_steam'];?>"><div class="social-login steam icon-medium rounded-1 flex justify-center items-center"></div></a>
				</div>
			
			<?php if(!$user){ ?>
				<button class="site-button black" data-modal="show" data-id="#modal_auth">LOGIN</button>
			<?php } ?>
		</div>
	</body>
</html>