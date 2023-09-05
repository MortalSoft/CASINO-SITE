<link rel="stylesheet" type="text/css" href="/template/css/bonus.css?v=9" />
<script type="text/javascript" src="/template/js/bonus.js?v=9"></script>

<div class="bonus">
  <div class="top">
    <h2>Slot arenas</h2>
    <button class="new" data-modal="show" data-id="#modal_battles">Create new battle</button>

    <div class="tabs">
      <div data-active="true" data-id="0" onclick="bonusTabSwitch(0)">Open</div>
      <div data-active="false" data-id="1" onclick="bonusTabSwitch(1)">In progress</div>
      <div data-active="false" data-id="2" onclick="bonusTabSwitch(2)">Finished</div>
    </div>
  </div>

  <div class="empty">
    <i class="fa fa-frown"></i>
    <p>Nothing here just yet</p>
  </div>

  <div class="battles" id="bonus_battles"></div>
</div>