Template.anagraphicArtworkWizard.anagraphicSectionIsValid = function() {
	if(Session.get('selectedArtworkId') === 'add')
		return false;
	else
		return true;
};

Template.anagraphicSection.artworkTypes = function() {
	return artworkType;
};

Template.anagraphicArtworkWizard.events({
	'click .pager > .cancel': function(evt, templ) {
		closeForm();
	},
	'click .pager > .create': function() {

		$('#anagraphicSection > .form-group').removeClass('has-error');

		// data validation is done by attributes on HTML elements
		// and by SimpleSchema. Thus I just check that the user provided
		// all needed information
		if(dataArePresent()) {
			var data = getAnagraphicSectionData();
			//$('.alert').text("").removeClass('animated fadeIn').addClass('hidden');
			var selectedArtworkId = Artworks.insert(data, function(error, result) {
				if(error !== undefined)
					console.log("Error on insert", error);
			});
			Session.set('selectedArtworkId', selectedArtworkId);
		}
		else {
			graphicInvalidation();
			//$('.alert').text("All fields are mandatory!").removeClass('hidden').addClass('animated fadeIn');
		}
	},
	'click .pager > .back': function(evt, templ) {
		closeForm();
	},
	
	// validation events
	'change .field-inventory': function() {
		//console.log("Changed value in field-inventory");
		$('.form-group.field-inventory').removeClass('has-error');
	},
	'change .field-title': function() {
		//console.log("Changed value in field-title");
		$('.form-group.field-title').removeClass('has-error');
	},
	'change .field-authors': function() {
		//console.log("Changed value in field-authors");
		$('.form-group.field-authors').removeClass('has-error');
	},
	'change .field-type': function() {
		//console.log("Changed value in field-type");
		$('.form-group.field-type').removeClass('has-error');
	}

});

function getAnagraphicSectionData() {
  var data = {
    inventory: $('#inputInventory').val(),
    title: $('#inputTitle').val(),
    authors: $('#inputAuthors').val(),
    description: $('#description').val(),
    dating: $('#inputDating').val(),
    type: $('#artworkTypeSelect').val()
  };
  //console.log("Data:", data);
  return data;
}

function dataArePresent() {
	var data = getAnagraphicSectionData();

	if(!fieldIsPresent(data.inventory))
		return false;
	else if(!fieldIsPresent(data.title))
		return false;
	else if(!fieldIsPresent(data.authors))
		return false;
	else if(!fieldIsPresent(data.type))
		return false;
	else
		return true;
}

function fieldIsPresent(field) {
	if(field === null || field === undefined || field === "")
		return false;
	else
		return true;
}

function graphicInvalidation() {
	if(!fieldIsPresent($('#inputInventory').val()))
		$('.form-group.field-inventory').addClass('has-error');

	if(!fieldIsPresent($('#inputTitle').val()))
		$('.form-group.field-title').addClass('has-error');

	if(!fieldIsPresent($('#inputAuthors').val()))
		$('.form-group.field-authors').addClass('has-error');

	if(!fieldIsPresent($('#artworkTypeSelect').val()))
		$('.form-group.field-type').addClass('has-error');
}

function closeForm() {
	Session.set('anagraphicArtworkFormIsActive', false);
}