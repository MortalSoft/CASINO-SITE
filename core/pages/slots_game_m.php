
<div id="game_wrapper"></div>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/MortalSoft/Gameloader@main/sg.min.js"></script>
<script>
    <?php
    $Config = new Config();
    if($user != "demo")
    {
      $api = $Config->api("mortalsoft")["url"]."/api/".$Config->api("mortalsoft")["key"]."/createSession?identifier=".$userid."&balance=".$balance;
    } else {
      $api = $Config->api("mortalsoft")["url"]."/api/".$Config->api("mortalsoft")["key"]."/createSession?identifier=demo&balance=100000";
    }
    $curl_handle = curl_init();
    curl_setopt($curl_handle, CURLOPT_URL, $api);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
    $curl_data = curl_exec($curl_handle);
    curl_close($curl_handle);

    $response = json_decode($curl_data, true);
    $token = $response['original']['token'];
    ?>
    var options = {
        target_element: "game_wrapper",
        launch_options: {
            strategy: "iframe",
            game_url: "<?php echo $Config->api("mortalsoft")["url"];?>/play/"+SLOTS_GAME_ID,
            token: "<?php echo $token; ?>"
        }
    };
    var onSuccess = function (gameDispatcher) { console.log(gameDispatcher) }
    var onError = function (error) { console.log(error) }
    window.sg.launch(options, onSuccess, onError);
  </script>
  <style>
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #game_wrapper {
    width: 100%;
    height: 100%;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    vertical-align: middle;
  }
</style>