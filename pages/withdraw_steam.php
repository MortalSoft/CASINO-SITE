<script type="text/javascript">
    const selectSlot = (id, shouldClick = true) => {
      const room_data = {
        0: {name: 'Price high -> low'},
        1: {name: 'Price low -> high'},
        2: {name: 'Name A-Z'},
        3: {name: 'Name Z-A'},
      }

      document.getElementById('slots_container').setAttribute('data-activeslot', id);
      document.getElementById('slots_selected_name').innerHTML = room_data[id].name;

      $(`.field_element_dropdown.fdp[value="${id + 1}"]`).click();

      // if(shouldClick) document.querySelectorAll('[data-channel]')[id].click();
    }

    const toggleSlotList = () => {
      const el = document.getElementsByClassName('slot-select')[0];

      el.setAttribute('data-active', el.getAttribute('data-active') == 'false' ? 'true' : 'false');
    }
  </script>

<div class="deposit">
	<div class="btns">
		<button class="back" onclick="window.location='/withdraw';">
			<i class="fa fa-arrow-left"></i>
			<span>Back to options</span>
		</button>

		<div class="right">
			<button class="rf" id="refresh_inventory">
				<span>Refresh</span>
				<!-- <i class="fa fa-sync"></i> -->
			</button>

			<button class="dp" id="confirm_offer">
				<span>Withdraw</span>
			</button>
		</div>
	</div>

	<div class="parameters">
		<input type="text" class="filter" placeholder="Search by name..." />

		<div class="slot-select" data-active="false" onclick="toggleSlotList()">
	    <div class="selected">
	      <i class="fa fa-angle-down drop"></i>

	      <p id="slots_selected_name">Price low -> high</p>
	    </div>


	    <div class="options" id="slots_container" data-activeslot="0">
	      <div class="opt" onclick="selectSlot(0)">
	        <p>Price high -> low</p>
	      </div>

	      <div class="opt" onclick="selectSlot(1)">
	        <p>Price low -> high</p>
	      </div>

	      <div class="opt" onclick="selectSlot(2)">
	        <p>Name A-Z</p>
	      </div>

	      <div class="opt" onclick="selectSlot(3)">
	        <p>Name Z-A</p>
	      </div>
	    </div>
	  </div>
	</div>

	<div id="list_items"></div>
</div>





<div class="dropdown_field transition-5" data-dropdown="0" style="display:none !important">
  <div class="field_container">
    <div class="field_content">
      <input type="text" class="field_element_input" id="order_by" value="">
      <div class="field_dropdown"></div>
    
      <div class="field_element_dropdowns">
        <div class="field_element_dropdown fdp" value="1">Price descending</div>
        <div class="field_element_dropdown fdp" value="2">Acending price</div>
        <div class="field_element_dropdown fdp" value="3">Name A-Z</div>
        <div class="field_element_dropdown fdp" value="4">Name Z-A</div>
      </div>
    
      <div class="field_label active transition-5">Order by</div>
    </div>
    
    <div class="field_extra">
      <div class="field_caret">
        <i class="fa fa-caret-down"></i>
      </div>
    </div>
  </div>
  
  <div class="field_bottom"></div>
</div>