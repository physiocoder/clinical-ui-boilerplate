Template.anagraphicArtworkWizard.anagraphicSectionIsValid = function() {
	if(Session.get('selectedArtworkId') === 'add')
		return false;
	else
		return true;
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

		if(ArtworksValidationContext.validate(data)) {
			var selectedArtworkId = Artworks.insert(data, function(error, result) {
				if(error !== undefined)
					console.log("Error on insert", error);
			});
			//ArtworksValidationContext.resetValidation();
			Session.set('selectedArtworkId', selectedArtworkId);
			showNextTab();
		}
		else {
			// put the focus on first invalid element
			var fieldClass = 'field-' + ArtworksValidationContext.invalidKeys()[0].name;
			$("." + fieldClass + " > .form-control").focus();
		}
	},
	
	// ***** Validation events *****/
	// The change event fires when we leave the element and its content has changed
	'change .form-control': function(evt, templ) {
		// extracting field name from input id
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
		writeSectionToDatabase(Session.get('activeSection'));
		showNextTab();
	},
	'click .delete': function() {
		var result = Artworks.remove(Session.get('selectedArtworkId'), function(error, result) {
			console.log("Error on remove: " + error);
			console.log("Removed elements: " + result);
		});
		if(result) closeForm();
	}
});

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

Template.anagraphicSection.isSelectedHelper = function(context, current, field) {
	return isSelected(context, current, field);
};

Template.materialSection.isSelectedHelper = function(context,current,field) {
	return isSelected(context, current, field);
};

Template.materialSection.artworkTechniques = function() {
	// refactor
	return [
		{
			id: 1,
			name: "a koftgari"
		},
		{
			id: 2,
			name: "acquerello"
		}
	];
};

Template.accessoriesSection.accessories = function() {
	// of course, refactor
	return [
		"frame",
		"mount",
		"base",
		"manuals",
		"covers",
		"case",
		"belts"
	];
};

Template.accessoriesSection.isChecked = function() {
	if($.inArray(this.toString(), ['frame']) >= 0)
		return 'checked';
	else
		return '';
};

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

function getMaterialSectionData() {
	var checkboxes = $('.checkbox > label > input');
	var selectedAccessories = [];

	for(var i = 0; i < checkboxes.length; i++)
		if(checkboxes.get(i).checked)
			selectedAccessories.push(checkboxes.get(i).value);

	var data = {
		material: $('#materialElem').val(),
		technique: $('#techniqueElem').val(),
		accessories: selectedAccessories,
	};

	return data;
}

function writeSectionToDatabase(section) {
	var dataToWrite;

	if(section === "anagraphicTab")
		dataToWrite = getAnagraphicSectionData();
	else if(section === "materialTab")
		dataToWrite = getMaterialSectionData();
	
	Artworks.update(Session.get('selectedArtworkId'), {$set: dataToWrite}, function(error, result) {
		if(error)
			console.log("Error on update: " + error);
		else
			console.log("On update: ", error, result);
	});

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

	if(next === 'anagraphicTab')
		closeForm();

	Session.set('activeSection', next);
}

function isSelected(context, current, field) {
	// refactor
	Session.get('activeSection');
	if(context === null)
		return '';
	if(current === "none" && context[field] === "")
		return 'selected';
	else if(context[field] === current)
		return 'selected';
	else
		return '';
}