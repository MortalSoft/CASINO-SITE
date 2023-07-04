function setCookie(key,value){
	var exp = new Date();
	
	exp.setTime(exp.getTime() + (365 * 24 * 60 * 60 * 1000));
	document.cookie = key + '=' + value + '; expires=' + exp.toUTCString();
}

function getCookie(key){
	var patt = new RegExp(key + '=([^;]*)');
	
	var matches = patt.exec(document.cookie);
	if(matches) return matches[1];
	
	return null;
}

document.addEventListener('DOMContentLoaded', function(){
	$('#first_wellcome').fadeOut(500);
});

console.log('%cWARNING!', 'font-size: 26px; color: red;');
console.log('%cAdmin/Mods/Staff will NEVER ask you to paste text/code in this console.\n\nDo NOT paste anything in this console or use ANY third party extensions/applications, it WILL steal your coins and/or hack your account!', 'font-size: 20px;');

jQuery.fn.extend({
	countToFloat: function(x) {
		var $this = $(this);
		
		var start = parseFloat($this.text());
		start = parseInt(start * 100);

		var delta = parseInt(x * 100 - start);
		
		var dur = Math.min(400, Math.round(Math.abs(delta) / 500 * 400));
		
		$({
			count: start
		}).animate({
			count: parseInt(x * 100)
		}, {
			duration: dur,
			step: function(val) {
				var vts = parseInt(val);
				
				$this.text(getFormatAmountString(vts / 100));
			}
		});
	},
	
	countTo: function(x) {
		var $this = $(this);
		
		var start = parseInt($this.text());
		var delta = x - start;
		
		var durd = delta;
		var dur = Math.min(400, Math.round(Math.abs(durd) / 500 * 400));
		
		$({
			count: start
		}).animate({
			count: x
		}, {
			duration: dur,
			step: function(val) {
				var vts = parseInt(val);
				
				$this.text(vts);
			}
		});
	}
});

$(document).ready(function() {
	$(document).on('click', '#copyText', function(){
		var copyText = document.getElementById($(this).data('copy'));
		copyText.select();
		document.execCommand("copy");
		window.getSelection().removeAllRanges();
	});
	
	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": false,
		"progressBar": true,
		"positionClass": "toast-top-right",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "500",
		"hideDuration": "500",
		"timeOut": "10000",
		"extendedTimeOut": "2000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "slideUp"
	}
});

function notify(type, notify){
	toastr[type](notify);
}

//INPUT FIELD
$(document).ready(function() {
	$('.input_field').each(function(i, e) {
		changeInputFieldLabel($(this));
	});
	
	$('.input_field .field_element_input').on('focusout', function() {
		var text = $(this).val().trim();
		var $field = $(this).parent().parent().parent();
		
		if(text.length > 0) $field.find('.field_label').addClass('active');
		else $field.find('.field_label').removeClass('active');
		
		//$field.css('border', '2px solid var(--site-color-bg-dark)');
		
		changeInputFieldLabel($field);
	});
	
	$('.input_field .field_element_input').on('focus', function() {
		var $field = $(this).parent().parent().parent();
		
		$field.find('.field_label').addClass('active');
		
		verifyErrorInputField($field);
	});
	
	$('.input_field .field_element_input').on('input', function() {
		var text = $(this).val().trim();
		var $field = $(this).parent().parent().parent();
		
		verifyErrorInputField($field);
	});
});

function changeInputFieldLabel($field){
	var text = $field.find('.field_element_input').val().trim();
	
	if(text.length > 0) $field.find('.field_label').addClass('active');
	else $field.find('.field_label').removeClass('active');
	
	verifyErrorInputField($field);
}

function verifyErrorInputField($field){
	var text = $field.find('.field_element_input').val().trim();
	
	var border = $field.data('border');
	
	var have_error = false;
	var required_error = false;
	var default_error = false;
	
	$field.find('.field_bottom .field_error').removeClass('active');
	
	$field.find('.field_bottom .field_error').each(function(i, e) {
		var error_code = $(this).data('error');
		var error_local = false;
		
		if(error_code == 'required') required_error = true;
		if(error_code == 'default') default_error = true;
		
		if(text.length > 0){
			switch(error_code){
				case 'number':
					if(isNaN(Number(text))){
						have_error = true;
						error_local = true;
					}
					break;
				
				case 'greater':
					if(!isNaN(Number(text))){
						if(Number(text) < 0.01){
							have_error = true;
							error_local = true;
						}
					}
					break;
				
				case 'lesser':
					if(!isNaN(Number(text))){
						if(Number(text) > 500.00){
							have_error = true;
							error_local = true;
						}
					}
					break;
					
				case 'username_email':
					if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/.exec(text) && !/^[a-z0-9_]{6,}$/.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
					
				case 'email':
					if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w+$/.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
					
				case 'username':
					if(!/^[a-z0-9_]{6,}$/.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
					
				case 'password':
					if(!/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})$/.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
					
				case 'steam_trade_link':
					if(!/^(http|https):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
				
				case 'steam_api_key':
					if(!/^(([a-f\d]{2}){16})$/i.exec(text)){
						have_error = true;
						error_local = true;
					}
					break;
					
				case 'minimum_6_characters':
					if(text.length < 6){
						have_error = true;
						error_local = true;
					}
					break;
				
				case 'minimum_10_characters':
					if(text.length < 10){
						have_error = true;
						error_local = true;
					}
					break;			
					
				case 'only_letters_numbers':
					if(!(/(^[a-zA-Z0-9]*$)/.exec(text))){
						have_error = true;
						error_local = true;
					}
					break;
			}
		}
		
		if(error_local) $(this).addClass('active');
	});
	
	if(!have_error){
		if(required_error && text.length == 0) {
			$field.find('.field_bottom .field_error[data-error="required"]').addClass('active');
			have_error = true;
		} else if(default_error) $field.find('.field_bottom .field_error[data-error="default"]').addClass('active');
	}
	
	if(border.toString().trim().length > 0){
		//#484856
		if(have_error) {
			$field.css('border', '2px solid ' + border);
			$field.css('color', border);
		} else {
			if($field.find('.field_element_input').is(':focus') && text.length > 0) $field.css('border', '2px solid #66ff00');
			else $field.css('border', '2px solid var(--site-color-bg-dark)');
			
			$field.css('color', 'unset');
		}
	}
}

//DROPDOWN FIELD
$(document).ready(function() {
	$('.dropdown_field').each(function(i, e) {
		changeDropdownFieldElement($(this));
	});
	
	$(document).on('click', function() {
		setTimeout(function(){
			$('.dropdown_field .field_element_dropdowns.active').removeClass('active');
		}, 50);
	});
	
	$('.dropdown_field').on('click', function() {
		var $field = $(this);
		
		if($field.find('.field_element_dropdowns.active').length == 0){
			setTimeout(function(){
				var count = $field.find('.field_element_dropdowns .field_element_dropdown').length;
				var height = $field.find('.field_element_dropdowns').height();
				
				$field.find('.field_element_dropdowns').css('top', -(height / count * parseInt($field.attr('data-dropdown'))));
				$field.find('.field_element_dropdowns').addClass('active');
				
				$field.find('.field_element_dropdowns .field_element_dropdown').removeClass('active');
				$field.find($field.find('.field_element_dropdowns .field_element_dropdown')[$field.attr('data-dropdown')]).addClass('active');
			}, 100);
		}
	});
	
	$('.field_element_dropdown').on('click', function() {
		var index = $(this).index();
		var text = $(this).text().trim();
		var value = $(this).attr('value');
		
		var $field = $(this).parent().parent().parent().parent();
		
		$field.find('.field_dropdown').text(text);
		$field.find('.field_element_input').val(value).change();
		$field.attr('data-dropdown', index);
	});
});

function changeDropdownFieldElement($field){
	var index = $field.attr('data-dropdown');
	var text = $field.find($field.find('.field_element_dropdowns .field_element_dropdown')[index]).text().trim();
	var value = $field.find($field.find('.field_element_dropdowns .field_element_dropdown')[index]).attr('value');
		
	$field.find('.field_dropdown').text(text);
	$field.find('.field_element_input').val(value);
}

//SWITCH FIELD
$(document).ready(function() {
	$('.switch_field .field_switch').on('click', function() {
		var $field = $(this).parent().parent().parent();
		var $switch = $field.find('.field_element_input');
		
		$switch.attr('checked', !$switch.is(':checked'));
		$switch.trigger('change');
	});
});

//SLIDER FIELD
$(document).ready(function() {
	$('.slider_field').each(function(i, e) {
		var $slider = $(this).find('.field_element_input');
		
		changeSliderField($slider);
	});
	
	$('.slider_field .field_element_input').on('input', function () {
		changeSliderField($(this));
	});
	
	$('.slider_field .field_element_input').on('change', function () {
		changeSliderField($(this));
	});
});

function changeSliderField($slider){
	var min = parseInt($slider.prop('min') || 0);
	var max = parseInt($slider.prop('max') || 0);
	
	var percentage = ($slider.val() - min) / (max - min) * 100;
	
	$slider.css('backgroundSize', percentage + '% 100%');
	
	$cursor = $slider.parent().find('.field_cursor');
	
	if($cursor) $cursor.css('left', percentage + '%').find('.field_cursor_text').text($slider.val());
}

//MODAL
$(document).ready(function() {
	$('[data-modal="hide"]').on('click', function(){
		var $modal = $(this);
		
		var error = 0;
		while(!$modal.hasClass('modal') && error < 100) {
			$modal = $modal.parent();
			
			error++;
		}
		
		$modal.modal('hide');
	});
	
	$('[data-modal="show"]').on('click', function(){
		$($(this).data('id')).modal('show');
	});
	
	$('.modal .modal-dialog').on('click', function(e){
		if(e.target !== e.currentTarget) return;
		
		$(this).parent().modal('hide');;
	});
});

jQuery.fn.extend({
	modal: function(type) {
		var $modal = $(this);
		
		if($modal.hasClass('modal')){
			if(type == 'show'){
				modalShow($modal);
			} else if(type == 'hide'){
				modalHide($modal)
			}
		}
	}
});

function modalShow($modal){
	if(!$modal.hasClass('active')){
		$modal.css('opacity', 0);
		
		$modal.addClass('active');
		
		setTimeout(function(){
			$modal.css('opacity', 1);
		}, 50);
		
		$modal.trigger('show');
	}
}

function modalHide($modal){
	if($modal.hasClass('active')){
		$modal.css('opacity', 0);
			
		setTimeout(function(){
			$modal.removeClass('active');
		}, 200);
		
		$modal.trigger('hide');
	}
}