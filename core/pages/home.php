<script type="text/javascript">
  let si = setInterval(() => {
    nextSlide();
  }, 4 * 1000);

  let currentSlide = 0;
  let totalSlides = 3;

  const nextSlide = (i = -1, add = 0) => {
    let wdth = parseInt($('.slider2').css('width')) + 1;
    
    if(add == 0) currentSlide++;
    if(i !== -1) currentSlide = i;

    currentSlide += add;
    if(currentSlide >= totalSlides) currentSlide = 0;
    if(currentSlide < 0) currentSlide = totalSlides - 1;

    $('.slider2 img.s').each((j, item) => {
      $(item).fadeOut('slow', 'swing', () => {
        if(currentSlide == j) {
          $(item).fadeIn('slow', 'swing');
        }
      });
    })
    $('.slider-controls div[data-active]').attr('data-active', 'false');
    $($('.slider-controls div[data-active]')[currentSlide]).attr('data-active', 'true');
  }


  /*resize_events.push(data => {
    let wdth = parseInt($('.slider2').css('width'));
    $('.slider2 img').css('width', wdth + 'px');
  });*/
</script>

<div class="home">
  <div class="slider2">
    <!-- <div class="container" id="slider_container" style="transform:translateX(0);"> -->
      <img class="s" data-active="true" src="<?php echo $site['root'];?>template/img/home/bigbanner.png" alt="" style="border-radius:0" />
      <img class="s" data-active="false" src="<?php echo $site['root'];?>template/img/home/bigbanner2.png" alt="" style="border-radius:0" />
      <img class="s" data-active="false" src="<?php echo $site['root'];?>template/img/home/bigbanner3.png" alt="" style="border-radius:0" />
    <!-- </div> -->

    <div class="arrow left" onclick="nextSlide(-1, -1)"><i class="fa fa-chevron-left"></i></div>
    <div class="arrow right" onclick="nextSlide(-1, 1)"><i class="fa fa-chevron-right"></i></div>

    <img class="bg" src="<?php echo $site['root'];?>template/img/home/bigbanner.png" alt="" style="border-radius:0" />
  </div>

  <div class="slider-controls">
    <div style="display:inline-block;">
      <div data-active="true" onclick="nextSlide(0)"></div>
      <div data-active="false" onclick="nextSlide(1)"></div>
      <div data-active="false" onclick="nextSlide(2)"></div>
    </div>
  </div>

  <h2>Slots</h2>
  <p>Enjoy casino games at the comforts of your home!</p>
  <div class="grid2">
    <a href="/slots"><img src="<?php echo $site['root'];?>template/img/home/Slots.png" alt="" /></a>
  </div>

  <h2>Casino</h2>
  <p>Play one of our classic games!</p>
  <div class="grid3">
    <a href="/crash"><img src="<?php echo $site['root'];?>template/img/home/Crash.png" alt="" /></a>
    <a href="/dice"><img src="<?php echo $site['root'];?>template/img/home/Dice.png" alt="" /></a>
    <a href="/plinko"><img src="<?php echo $site['root'];?>template/img/home/Plinko.png" alt="" /></a>
    <a href="/tower"><img src="<?php echo $site['root'];?>template/img/home/Towers.png" alt="" /></a>
    <a href="/minesweeper"><img src="<?php echo $site['root'];?>template/img/home/Mines.png" alt="" /></a>
    <a href="/coinflip"><img src="<?php echo $site['root'];?>template/img/home/Coinflip.png" alt="" /></a>
    <a href="/jackpot"><img src="<?php echo $site['root'];?>template/img/home/Jackpot.png" alt="" /></a>
    <a href="/roulette"><img src="<?php echo $site['root'];?>template/img/home/Roulette.png" alt="" /></a>

  </div>

  <h2>Live winnings</h2>
  <div style="width:100%;height:3px;float:left;background:linear-gradient( 90deg, #33c16c 0%, #277d51 49.26%, rgba(11, 104, 192, 0) 100%, #33c16c 100%);margin:3px 0 10px"></div>

  <div class="table-container dice-table responsive" style="width:100%;">
      <div class="table-header">
        <div class="table-row">
          <div class="table-column text-left">Game</div>
          <div class="table-column text-left">Player</div>
          <div class="table-column text-left">Wager</div>
          <div class="table-column text-left">Multi</div>
          <div class="table-column text-left">Payout</div>
        </div>
      </div>
      
      <div class="table-body" id="live_history"></div>
    </div>
</div>