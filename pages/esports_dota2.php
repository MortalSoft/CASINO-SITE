<link rel="stylesheet" type="text/css" href="/template/css/crash.css" />
<script type="text/javascript" src="/template/js/graph2.js?v=<?php echo time(); ?>"></script>

<div class="container">
  <!--<script>
    var Engine = {
      gameState: 'CONNECTING', // either: STARTING, IN_PROGRESS,  ENDED, CONECTING
      startTime: new Date().getTime(),
      gameCrash: 0,
      elapsed: 0,
      crashTime: 0,
      graphPayout: 1
    }
  </script>-->
  <div class="cr-main count">
    <div class="cr-arrows"></div>
    <div id="CrashScreen" class="CrashScreen">
      <div class="cr-mtitle" id="Multiplier">X</div>
      <div class="rocket">
        <div class="rocket-body">
          <div class="body"></div>
          <div class="fin fin-left"></div>
          <div class="fin fin-right"></div>
          <div class="window"></div>
        </div>
        <div class="exhaust-flame"></div>
        <ul class="exhaust-fumes">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div class="cstars">
        <div class="stars-container">
          <div class="stars">
            <div></div><div></div><div></div>
          </div>
          <div class="stars">
            <div></div><div></div><div></div>
          </div>
          <div class="stars">
            <div></div><div></div><div></div>
          </div>
          <div class="stars">
            <div></div><div></div><div></div>
          </div>
          <div class="stars-2"></div>
          <div class="stars-2"></div>
          <div class="stars-2"></div>
        </div>
        <div class="moon"></div>
        <div class="planet-container">
          <div class="planet-ring2"></div>
          <div class="planet"></div>
          <div class="planet-ring"></div>
        </div>
        <div class="meteor-container">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="meteor-container-2">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div id="generated_stars" class="hidden"></div>
      <div id="generated_planets" class="hidden"></div>
      <img id="rocket"  class="hidden" src="../template/img/rocket.png">
      <div id="fire"  class="hidden"></div>
    </div>
  </div>
  <!--<canvas style="display: none;" id="crash-graph"></canvas>-->

  <div class="mainCrash" style="display: none;">
    <div class="crashFrame">
      <div class="crashLeft">
        <script>
          var Engine = {
            gameState: 'CONNECTING', // either: STARTING, IN_PROGRESS,  ENDED, CONECTING
            startTime: new Date().getTime(),
            gameCrash: 0,
            elapsed: 0,
            crashTime: 0,
            graphPayout: 1
          }
        </script>

        <canvas id="crash-graph"></canvas>

        <script>
          var graph = new Graph();
          graph.startRendering(document.getElementById('crash-graph'), {
            controlsSize: 'small',
            currentTheme: 'black',
            width: 400,
            height: 400
          });
        </script>
      </div>
    </div>
  </div>

</div>
<script>
// RESET ROCKET ON START
ResetRocket();
</script>
