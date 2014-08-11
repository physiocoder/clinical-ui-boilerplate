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
	Session.set('typeIsSet', false);
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
			// put the focus on first invalid element - CHECK IF WORKING!!!
			var fieldClass = 'field-' + ArtworksValidationContext.invalidKeys()[0].name;
			$("." + fieldClass + " > .form-control").focus();
		}
	},
	
	// ***** Validation events *****/
	// The change event fires when we leave the element and its content has changed
	'change .form-control': function(evt, templ) {
		// extracting field name from data-schemafield attribute
		var field = evt.currentTarget.getAttribute('data-schemafield');
		// constructing the object to pass to validateOne(obj, key)
		var fieldValuePair = {};
		fieldValuePair[field] = evt.currentTarget.value;

		// do we want to always perform validation?
		ArtworksValidationContext.validateOne(fieldValuePair, field);
	},
	'click .tab-selector': function(evt, templ) {
		var selection = evt.currentTarget.getAttribute('data-selection');
		Session.set('activeSection', selection);
	},
	'click .save': function() {
		writeSectionToDatabase(Session.get('activeSection'), this);
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

Template.materialSection.artworkMaterials = function() {
	// the following should never be true as type is a mandatory field
	if(!this.type) return [];

	return _.map(artworkTypeLookUp[this.type].materials, function(elem) {
		return {name: elem.name, id: elem.id};
	});
};

Template.materialSection.artworkTechniques = function() {
	// the following should never be true as type is a mandatory field
	if(!this.type) return [];

	return _.map(artworkTypeLookUp[this.type].tecnica, function(elem) {
		return {name: elem.name, id: elem.id};
	});
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

// this relates to the checbox for multiple artworks
Template.physicsDescriptionSection.isChecked = function() {
	if(this.multiple)
		return 'checked';
	else
		return '';
};

Template.physicsDescriptionSection.objects = function() {
	//return [];

	return [
		{
			objname: "Sword",
			height: "20",
			length: "30"
		}
	];
};

Template.environmentSection.isChecked = function(context) {
	// all sections are rendered when the form is activated,
	// this should be changed! (add an #if in the main template 
	// with a helper to check for activeSection)
	if(context === null)
		return "";
	if(context.UVP)
		return "checked";
	else
		return "";
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

function getDimensionsSectionData() {
	var names = _.map($('.object-tab'), function(elem) {
		return {
			objname: elem.innerText
		};
	});

	var values = _.map($('.object-pane').children(), function(elem) {
		//console.log("Elem: ", elem);
		return {
			height: parseInt(elem.children[0].children[1].value, 10),
			length: parseInt(elem.children[1].children[1].value, 10),
			depth: parseInt(elem.children[2].children[1].value, 10)
		};
	});

	var l = names.length;
	var objs = [];
	for(var i = 0; i < l; i++) {
		objs[i] = {
			objname: names[i]["objname"],
			height: values[i]["height"],
			length: values[i]["length"],
			depth: values[i]["depth"]
		};
	}

	var data = {
		height: parseInt($('#main > #heightElem').val(), 10),
		length: parseInt($('#main > #lengthElem').val(), 10),
		depth: parseInt($('#main > #depthElem').val(), 10),
		objects: objs
	};
	return data;
}

function getEnvironmentSectionData() {
	var data = {
		site: $('#siteElem').val(),
		city: $('#cityElem').val(),
		UVP: $('#UVPElem').get(0).checked,
		RH: $('#RHElem').val(),
		temperature: $('#temperatureElem').val(),
		lux: $('#luxElem').val(),
		AMO: $('#AMOElem').val()
	};
	return data;
}

function writeSectionToDatabase(section, context) {
	var dataToWrite;

	if(section === "anagraphicTab") {
		dataToWrite = getAnagraphicSectionData();
		// material and technique depend on type, so if the artwork type is changed I delete
		// material and technique fields from database.
		// Is there a better way to deal with this kind of dependencies?
		if($('#typeElem').val() !== context.type) {
			var n = Artworks.update(Session.get('selectedArtworkId'), {$set: { material: "", technique: ""}});
			if(n === 0) {
				// in such a situation, it is likely that material and technique associated to the
				// current artwork are wrong. I couldn't update the database to solve the problem,
				//  so should I show a modal and tell the user to set the correct values?
				console.log("Error updating after type changed");
			}
		}
	}
	else if(section === "materialTab")
		dataToWrite = getMaterialSectionData();
	else if(section === "environmentTab")
		dataToWrite = getEnvironmentSectionData();
	
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
	// all sections are rendered when the form is activated,
	// this should be changed! (add an #if in the main template 
	// with a helper to check for activeSection)
	Session.get('activeSection');
	if(context === null)
		return '';

	var fieldIndex = parseInt(context[field], 10);

	if(current === "none" && fieldIndex === 0)
		return 'selected';
	else if(fieldIndex === current)
		return 'selected';
	else
		return '';
}