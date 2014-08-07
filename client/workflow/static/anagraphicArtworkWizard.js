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

Template.anagraphicArtworkWizard.isTabActive = function(tab) {
	if(Session.equals('activeSection', tab))
		return "active";
	else
		return "";
};

Template.anagraphicArtworkWizard.created = function() {
	Session.set('activeSection', 'anagraphicTab');
};

Template.anagraphicArtworkWizard.destroyed = function() {
	delete Session.keys['activeSection'];
};

Template.anagraphicArtworkWizard.events({
	'click .pager > .back': function(evt, templ) {
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
			showNextTab();
		}
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
	},
	'click .tab-selector': function(evt, templ) {
		var selection = evt.currentTarget.getAttribute('data-selection');
		Session.set('activeSection', selection);
	},
	'click .save': function() {
		showNextTab();
	},
	'click .delete': function() {
		
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

function showNextTab() {
	var current = $('.tab-pane.active').attr('id');
	var next = '';
	if(current === 'anagraphicTab')
		next = 'materialTab';
	else if(current === 'materialTab')
		next = 'physicsDescTab';
	else if(current === 'physicsDescTab')
		next = 'environmentTab';
	else if(current === 'environmentTab')
		next = 'attachmentsTab';
	else if(current === 'attachmentsTab')
		next = 'referentsTab';
	else if(current === 'referentsTab')
		next = 'expositionTab';
	else
		next = 'anagraphicTab';

	Session.set('activeSection', next);
}