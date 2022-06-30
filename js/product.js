function initProduct(product){
	initChoices(product);
	$('#description').html(product.description);
	$('#price').html('£'+product.price);
	product.options.forEach(function(option,i){
		if(option.type=='select'){
			let optionHTML = createSelect(option,i);
			$('#productoptions').append(optionHTML);
			$('#option_'+i).on('input',function() {
				let value = $('#option_'+i).val();
				choices.options[option.key] = value;
				updateGallery();
				updatePrice();
			});
		}

		if(option.type=='numeric'){
			let optionHTML = createNumeric(option,i);
			$('#productoptions').append(optionHTML);
			$('#option_'+i+'_value').html(option.values.default+ 'cm');
	  		$('#option_'+i).on('input',function() {
	  			let value = $('#option_'+i).val();
				$('#option_'+i+'_value').html(value+ 'cm');
				choices.options[option.key] = value*10;
				updateGallery();
				updatePrice();
			});
		}

		if(option.type=='imagebutton'){
			let optionHTML = createImageButton(option,i);
			$('#productoptions').append(optionHTML);
			$('.option_'+i).on('click',function(){
				$('.option_'+i).removeClass('imagebuttonactive');
				$(this).addClass('imagebuttonactive');
				let value = $(this).attr('value');
				choices.options[option.key] = value;
				updateGallery();
				updatePrice();
			});
		}
		if(option.type=='selectcolour'){
			let optionHTML = createColourSelect(option,i);
			$('#productoptions').append(optionHTML);
			$('.option_'+i).on('click',function(){
				console.log('hello');
				$('.option_'+i).removeClass('imagebuttonactive');
				$(this).addClass('imagebuttonactive');
				let value = $(this).attr('value');
				choices.options[option.key] = value;
				updateGallery();
				updatePrice();
			});
		}
		
	});
	initPhotos(product);
	$('.form-select').on('change',function(){
		updatePrice(product.price,product.options);
	});

	$('#buybutton').on('click',function(){
		$('#orderbutton').html('');
		$('#orderbutton').addClass('loader');
		order(product);
	});
}

function updateGallery(){
	let choices = getProductChoices(product);
	let photoname = product.photos[0];

	let initPhotoURL = photoURL.replace('xxx',photoname);
	


	if(product.phototype=='swap'){
		$('#photogallery').html('<img src="'+initPhotoURL+'" height="350px" class="stackimage"/>');
		choices.variants.forEach(function(choice){
			photoname = photoname.replace('{{ '+choice.key+' }}',choice.value);
		});
		
	} else if(product.phototype=='colour') {
		choices.variants.forEach(function(choice){
			product.options.forEach(function(option){
				if(option.key == choice.key){
					console.log('match');
					option.values.forEach(function(value){
						if(value.value == choice.value){
							console.log('Updating colours');
							console.log(option.colourkey);
							console.log(value);
							$('#'+option.colourkey+' path').css('fill',value.hex);
						}
					});
				}
			});
		});
	}
	else {
		$('#photogallery').html('<img src="'+initPhotoURL+'" height="350px" class="stackimage"/>');
		console.log('stacking images');
		console.log(choices);
		choices.variants.forEach(function(choice){
			product.options.forEach(function(option){
				console.log(option)
				console.log(option.values)
				option.values.forEach(function(value){
					if(value.value == choice.value){
						if(value.photo!=""){
							let photoname = value.photo;
							let newPhotoURL = photoURL.replace('xxx',photoname);
							$('#photogallery').append('<img src="'+newPhotoURL+'" height="350px" class="stackimage"/>');	
						}
					}					
				});
			});
		});
	}
}

function initPhotos(product){
	if(product.phototype=='colour'){
		let photoname = product.photos[0];
		let initPhotoURL = photoURL.replace('xxx',photoname);
		loadSVG(initPhotoURL);
	}
	updateGallery()
	$('#photogallery').height($('#photogallery').width()*1.1);
}

function loadSVG(imageURL){
	$.ajax({
        url: imageURL,
        dataType: 'text',
        success: function(result){
            $('#photogallery').html($.trim(result));
            //workaround to allow DOM to become accessible in some browsers
            $('#photogallery').html($('#photogallery').html());
            updateGallery()
        },
        error: function(error){
			console.log('cannot load svg');
			console.log(error);
        }
    });
}

function initChoices(product){
	choices.name = product.id;
	choices.variants = [];
	choices.options = {}
	product.options.forEach(function(option){
		if(option.type == 'numeric'){
			choices.options[option.key] = option.values.default*10;
		} else {
			choices.options[option.key] = option.values[0].value;
		}
	});
}



function updatePrice(){
	let choices = getProductChoices(product);
	let price = parseInt(product.price);
	choices.variants.forEach(function(choice){
		product.options.forEach(function(option){
			if(choice.key == option.key){
				if(option.type!='numeric'){
					option.values.forEach(function(value){
						if(value.value == choice.value){
							price += parseInt(value.price)
						}
					});
				}
			}
		});
	});
	$('#price').html('£'+price);	
}

function createSelect(option,i){
	let selectHTML = `
		<div class="optionselect option">
			<p class="selectlabel">{{ option }}</p>
			<select id="{{ optionID }}" class="form-select">
				{{ optionBlock }}
			</select>
		</div>
	`;
	let optionBlock = '';
	option.values.forEach(function(value){
		optionBlock += '<option value="'+value.value+'">'+value.text+'</option>';
	});
	selectHTML = selectHTML.replace('{{ option }}', option.key).replace('{{ optionBlock }}',optionBlock).replace('{{ optionID }}','option_'+i);
	return selectHTML;
}

function createImageButton(option,i){
	let selectHTML = `
		<div class="optionimagebutton option">
			<p class="selectlabel">{{ option }}</p>
			<div class="row">
				{{ optionBlock }}
			</div>
		</div>
	`;
	let optionBlock = '';
	option.values.forEach(function(value,j){
		let buttonURL = photoURL.replace('xxx',value.button);
		if(j==0){
			activeclass= 'imagebuttonactive';
		} else {
			activeclass= '';
		}
		optionBlock += '<div class="col-4"><div id="option_'+j+'_'+i+'" class="option_'+i+' optionImageButton '+activeclass+'" value="'+value.value+'"><img src="'+buttonURL+'" width=100% /><p class="text-center">'+value.text+'</p></div></div>';
	});
	selectHTML = selectHTML.replace('{{ option }}', option.key).replace('{{ optionBlock }}',optionBlock).replace('{{ optionID }}','option_'+i);
	return selectHTML;
}

function createNumeric(option,i){
	let numericHTML = `
		<div class="measure option">
            <p class="selectlabel">{{ option }} - <span id="{{ optionID }}_value" class="measurevalue"></span></p>
            <input class="slider" type="range" min="{{ min }}" max="{{ max }}" value="{{ default }}" class="slider" id="{{ optionID }}">
        </div>
    `
    numericHTML = numericHTML.replace('{{ option }}', option.key).replace('{{ min }}',option.values.min).replace('{{ max }}',option.values.max).replace('{{ default }}',option.values.default).replace('{{ optionID }}','option_'+i).replace('{{ optionID }}','option_'+i);
    return numericHTML;
}

function createColourSelect(option,i){
	let selectHTML = `
		<div class="optioncolours option">
			<p class="selectlabel">{{ option }}</p>
			<div class="row">
				{{ optionBlock }}
			</div>
		</div>
	`;
	let optionBlock = '';
	option.values.forEach(function(value,j){
		let buttonURL = photoURL.replace('xxx',value.button);
		if(j==0){
			activeclass= 'imagebuttonactive';
		} else {
			activeclass= '';
		}
		optionBlock += '<div class="col-3"><div id="option_'+j+'_'+i+'" class="option_'+i+' optionColourButton '+activeclass+'  option" value="'+value.value+'" style="background-color:'+value.hex+'"></div><p class="text-center">'+value.text+'</p></div>';
	});
	selectHTML = selectHTML.replace('{{ option }}', option.key).replace('{{ optionBlock }}',optionBlock).replace('{{ optionID }}','option_'+i);
	return selectHTML;
}

function getProductChoices(){
	choices.variants = [];
	for(key in choices.options){
		choices.variants.push({'key':key,'value':choices.options[key]});
	}
	return choices
}

initProduct(product);

