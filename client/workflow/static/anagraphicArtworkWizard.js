Template.anagraphicArtworkWizard.anagraphicSectionIsValid = function() {
	if(Session.get('selectedArtworkId') === 'add')
		return false;
	else
		return true;
};

Template.anagraphicSection.artworkTypes = function() {
	return artworkType;
};

Template.anagraphicSection.fieldValidity = function(field) {
	var validationResult = ArtworksValidationContext.keyIsInvalid(field);
	if(validationResult)
		return 'has-error';
	else
		return '';
};

Template.anagraphicSection.errMsg = function(field) {
	return " -  " + ArtworksValidationContext.keyErrorMessage(field);
};

Template.anagraphicArtworkWizard.events({
	'click .pager > .cancel': function(evt, templ) {
		closeForm();
	},
	'click .pager > .create': function() {
		var data = getAnagraphicSectionData();

		//ArtworksValidationContext.resetValidation();
		if(ArtworksValidationContext.validate(data)) {
			//$('.alert').text("").removeClass('animated fadeIn').addClass('hidden');
			var selectedArtworkId = Artworks.insert(data, function(error, result) {
				if(error !== undefined)
					console.log("Error on insert", error);
			});
			Session.set('selectedArtworkId', selectedArtworkId);
		}
	},
	'click .pager > .back': function(evt, templ) {
		closeForm();
	},
	
	// ***** Validation events *****/
	// The change event fires when we leave the element and its content has changed
	'change .form-control': function(evt, templ) {
		// extracting field name from input id, whose format is #inputField
		var field = evt.currentTarget.getAttribute('data-schemafield');
		// constructing the object to pass to validateOne(obj, key)
		var fieldValuePair = {};
		fieldValuePair[field] = evt.currentTarget.value;

		ArtworksValidationContext.validateOne(fieldValuePair, field);
	}
});

function getAnagraphicSectionData() {
  var data = {
    inventory: $('#inventoryElem').val(),
    title: $('#titleElem').val(),
    authors: $('#authorsElem').val(),
    description: $('#descriptionElem').val(),
    dating: $('#datingElem').val(),
    type: $('#typeElem').val()
  };
  return data;
}

function closeForm() {
	Session.set('anagraphicArtworkFormIsActive', false);
}