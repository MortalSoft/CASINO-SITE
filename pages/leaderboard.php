<script type="text/javascript">
  function loadlb() {
    SOCKET.emit('request_leaderboard');

    SOCKET.on('lb', data => {
      formatLb(data);
    })
  }

  connect_events.push(loadlb);

  function formatLb(data) {
    var html = '';

    for(let i in data) {
      html += `
        <div class="table-row">
          <div class="table-column text-left rank" data-rank="${parseInt(i) + 1}"><div><span>${parseInt(i) + 1}</span></div></div>
          <div class="table-column text-left">
            <div class="flex items-center height-full gap-1" style="justify-content:center">
              <img class="icon-small rounded-full" src="${data[i].avatar}" />
              <div class="text-left ellipsis pr-1">${data[i].name}</div>
            </div>
          </div>
          <div class="table-column text-left">${data[i].games}</div>
          <div class="table-column text-left winn">
            <div>${parseFloat(data[i].winnings).toFixed(2)}<i class="fa fa-coins"></i></div>
            <p>${parseFloat(data[i].bets).toFixed(2)}</p>
          </div>
        </div>
      `;
    }

    $('#lb_body').html(html);
  }  
</script>

<div class="p-2">
	<div class="table-container dice-table lb-table">
		<div class="table-header">
			<div class="table-row">
				<div class="table-column text-left">Rank</div>
				<div class="table-column text-left">User</div>
				<div class="table-column text-left">Games played</div>
				<div class="table-column text-left">Total winnings</div>
			</div>
		</div>
		
		<div class="table-body" id="lb_body">
      <div class="table-row">
        <div class="table-column text-left">Loading...</div>
      </div>
    </div>
	</div>
</div>