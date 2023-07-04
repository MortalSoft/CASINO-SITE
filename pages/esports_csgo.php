<link rel="stylesheet" href="/template/css/esport.css?v=<?php echo time();?>" />
<script type="text/javascript" src="/template/js/esports.js?v=<?php echo time();?>"></script>

<div class="esports">
  <div class="left">
    <h3 style="visibility:hidden">Bet slip</h3>

    <div class="slip">
      <div class="header">
        <div data-mode="single" data-active="true" onclick="toggleMode('single')">Single</div>
        <div data-mode="combo" data-active="false" onclick="toggleMode('combo')">Combo</div>
      </div>

      <div class="content empty" id="betslip_container" data-mode="single">
        <div class="emptyc">
          <img class="ticket" src="/template/img/ticket.png" />
          <h3>Your bet slip is empty</h3>
          <p>Click on the odds to add selection</p>
        </div>
      </div>

      <!-- <div class="content" id="betslip_container">
        <div class="box">
          <img src="/template/img/logocase.png" alt="" class="logocase" />
          <i class="fa fa-times close"></i>

          <img src="/template/img/matches/csgo.png" alt="" class="game" />
          <p class="short">EnVyUs vs G2</p>

          <p class="pickname">EnVyUs</p>

          <div class="pick">
            <i class="fa fa-chart-bar"></i>
            <span>x1.21</span>
          </div>

          <input class="bet" type="text" placeholder="Bet amount" />
        </div>
      </div> -->

      <div class="summary">
        <div class="line mb">
          <div>Single stake</div>

          <input type="text" placeholder="1.00" value="1.00" oninput="updateBetValues()" id="single_stake_val" />
        </div>

        <div class="line">
          <div>Total stake</div>

          <p>
            <i class="fa fa-coins"></i>
            <span id="single_total_stake">0.00</span>
          </p>
        </div>

        <div class="line hl">
          <div>Potential win</div>

          <p>
            <i class="fa fa-coins"></i>
            <span id="single_potential_win">0.00</span>
          </p>
        </div>

        <button class="submit" id="betSlipButton">Place bet</button>
      </div>
    </div>

    <!--<div class="bet">
      <div class="top">
        <img src="/template/img/side-bar/csgo.png" alt="" class="game" />
        <div class="name">
          <span class="bold">EnVyUs</span>
          <span>vs</span>
          <span class="bold">G2</span>
        </div>

        <div class="val">1.21</div>
      </div>

      <div class="pick">
        <img src="https://d1fs8ljxwyzba6.cloudfront.net/assets/article/2017/08/12/149369f0958bba7d238b5cd6fc0bd856ff77a964_512_feature.png" alt="" class="logo" />
        <p>EnVyUs</p>

        <div>
          <i class="fa fa-coins"></i>
          <span>21.37</span>
        </div>
      </div>
    </div>-->

    <h3 style="margin:50px 0 10px;display:none" id="active_tickets_text">Active tickets</h3>

    <div id="active_tickets"></div>

    <!--<div class="ticket">
      <div class="top">
        <p class="l">Ticket #82</p>
        <p class="r">
          <i class="fa fa-coins"></i>
          <span>21.37</span>
        </p>
      </div>

      <div class="list">
        <div class="m">
          <img src="http://localhost/template/img/matches/csgo.png" class="game" alt="" />
          <p class="teams">EnVyUs vs G2</p>

          <div class="pick">
            <p>EnVyUs</p>
            <div>
              <i class="fa fa-chart-bar"></i>
              <span>x2.00</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom">
        <div>
          <p>Odds</p>
          <span>4.00</span>
        </div>

        <div>
          <p>Possible win</p>
          <span><i class="fa fa-coins"></i> 420.69</span>
        </div>
      </div>
    </div>-->
  </div>


  <div class="main">
    <h3>
      <div class="live"></div>
      <span>Live games</span>
    </h3>
    <div id="live_matches"></div>
    

    <h3 style="margin-top:40px">Upcoming</h3>
    <div id="open_matches"></div>
  </div>
</div>