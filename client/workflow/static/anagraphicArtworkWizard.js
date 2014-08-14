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

Template.anagraphicArtworkWizard.navigatorHidden = function(navBtn) {
	var section = Session.get('activeSection');
	if(navBtn === 'prev' && section === 'anagraphicTab')
		return "hidden";
	else if(navBtn === 'next' && section === 'expositionTab')
		return "hidden";
	else
		return "";
};

Template.anagraphicArtworkWizard.events({
	'click .back': function(evt, templ) {
		bootbox.confirm("Unsaved updates will be discarded. Do you really want to go back?", function(result) {
			if (result) {
				ArtworksValidationContext.resetValidation();
				closeForm();
			}
		});
	},
	'click .create': function() {
		var data = getAnagraphicSectionData();

		// the clean method performs useful operations to avoid
		// tricky validation errors (like conversion of String 
		// to Number when it is meaningful)
		Schemas.Artwork.clean(data);

		if(ArtworksValidationContext.validate(data)) {
			var selectedArtworkId = Artworks.insert(data, function(error, result) {
				if(error !== undefined)
					console.log("Error on insert", error);
			});

			Session.set('selectedArtworkId', selectedArtworkId);
		}
		else {
			setSectionFocus('anagraphicTab');
		}
	},
	'click .prev': function() {
		showPrevTab();
	},
	'click .next': function() {
		showNextTab();
	},
	
	// ***** Validation events *****/
	// The change event fires when we leave the element and its content has changed
	'change .form-control': function(evt, templ) {
		// extracting field name from data-schemafield attribute
		var field = evt.currentTarget.getAttribute('data-schemafield');
		// constructing the object to pass to validateOne(obj, key)
		var fieldValuePair = {};
		fieldValuePair[field] = evt.currentTarget.value;

		// clean the object "to avoid any avoidable validation errors" 
		// [cit. aldeed - Simple-Schema author]
		Schemas.Artwork.clean(fieldValuePair, {removeEmptyStrings: false});
		ArtworksValidationContext.validateOne(fieldValuePair, field);

		return true;
	},
	'click .tab-selector': function(evt, templ) {
		var selection = evt.currentTarget.getAttribute('data-selection');
		Session.set('activeSection', selection);
		setSectionFocus(selection);
	},
	'click .save': function() {
		if(writeToDatabase(this))
			closeForm();
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

Template.anagraphicSection.isSelectedHelper = function(context, current, field) {
	return isSelected(context, current, field);
};

Template.materialSection.isSelectedHelper = function(context,current,field) {
	return isSelected(context, current, field);
};

Template.materialSection.artworkMaterials = function() {
	// the following should never be true as type is a mandatory field
	if(!this.type) {
		console.log("Data on database are inconsistent!");
		return [];
	}

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
	return Accessories;
};

Template.accessoriesSection.isChecked = function(artworkContext) {
	if($.inArray(this.toString(), artworkContext.accessories) >= 0)
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

Template.physicsDescriptionSection.isMultiple = function() {
	return this.multiple;
};

Template.physicsDescriptionSection.objects = function() {
	return this.objects;
};

Template.physicsDescriptionSection.events({
	'change .multiple-checkbox': function(evt, templ) {
		// checkbox for multiple artworks
		Artworks.update(Session.get('selectedArtworkId'), {$set: {multiple: evt.currentTarget.checked}});
		showMainPane();

		//Note: notify the user that all the objects will be removed
		Artworks.update(Session.get('selectedArtworkId'), {$unset: {objects: ""}});
	},
	'click .add-object': function(evt, templ) {
		var obj = getNewObject();
		var n = Artworks.update(Session.get('selectedArtworkId'), {$push: {objects: obj}}, function(error, result) {
			if(error !== undefined)
				console.log("Error adding new object to database:", error);
		});

		if(n > 0) {
			// clear the new object tab content and show the main tab
			clearAddObjTab();
			showMainPane();
		}
		else {
			// perform validation here!
			// Maybe using a function which can be used also
			// in the global Save (it seems like objects are not correctly validated)
		}
	},
	'click .remove-obj': function(evt, templ) {
		var objref = evt.currentTarget.getAttribute('data-objref');
		Artworks.update(Session.get("selectedArtworkId"), {$pull: {objects: {objname: objref}}}, function(error, resutl) {
			if(error !== undefined)
				console.log("Error eliminating object", error);
		});
		// show main tab
		showMainPane();
	}
});

Template.environmentSection.isChecked = function() {
	// all sections are rendered when the form is activated,
	// this should be changed! (add an #if in the main template 
	// with a helper to check for activeSection)
	if(this === null)
		return "";
	if(this.UVP)
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
	var data = {
		height: $('#main #heightElem').val(),
		length: $('#main #lengthElem').val(),
		depth: $('#main #depthElem').val(),
		objects: getObjects()
	};
	return data;
}

function getNewObject() {
	var obj = {
		objname: $('#objnameElem').val(),
		height: $('#addObj #heightElem').val(),
		length: $('#addObj #lengthElem').val(),
		depth: $('#addObj #depthElem').val()
	};

	return obj;
}

function getObjects() {
	var names = _.map($('.object-tab'), function(elem) {
		return {
			objname: elem.innerText
		};
	});

	var l = names.length;
	var objs = [];

	for(var i = 0; i < l; i++) {
		objs[i] = {
			objname: names[i]["objname"],
			height: $('#' + names[i]["objname"] + 'Pane #heightElem').val(),
			length: $('#' + names[i]["objname"] + 'Pane #lengthElem').val(),
			depth: $('#' + names[i]["objname"] + 'Pane #depthElem').val()
		};
	}

	return objs;
}

function clearAddObjTab() {
	$('#objnameElem').val("");
	$('#addObj #heightElem').val("");
	$('#addObj #lengthElem').val("");
	$('#addObj #depthElem').val("");
}

function showMainPane() {
	$('a[href="#main').tab('show');
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

// return false if there are errors on validation or update, true otherwise
function writeSectionToDatabase(section, context, onObjIsInvalid, onUpdateError) {
	var dataToWrite;

	if(section === "anagraphicTab") {
		dataToWrite = getAnagraphicSectionData();
		// material and technique depend on type, so if the artwork type is changed I remove
		// material and technique fields from database.
		// Is there a better way to deal with this kind of dependencies?
		if($('#typeElem').val() !== context.type) {
			Meteor.call('removeMaterialAndTechnique', Session.get('selectedArtworkId'), function(error, result) {
				if(error !== undefined) {
					// in such a situation, it is likely that material and technique associated to the
					// current artwork are wrong. I couldn't update the database to solve the problem,
					// so should I show a modal and tell the user to set the correct values?
					console.log("Error removing material and technique fields");
				}
			});
		}
	}
	else if(section === "materialTab")
		dataToWrite = getMaterialSectionData();
	else if(section === "physicsDescTab")
		dataToWrite = getDimensionsSectionData();
	else if(section === "environmentTab")
		dataToWrite = getEnvironmentSectionData();

	ArtworksValidationContext.resetValidation();
	validateObj(dataToWrite, ArtworksValidationContext, Schemas.Artwork);

	if(ArtworksValidationContext.invalidKeys().length > 0) {
		// show the section to let the user correct highlighted values
		Session.set('activeSection', section);
		setSectionFocus(section);
		return false;
	}
	else // .update() returns the number of element corrctly updated. If none is updated, it returns 0 (false)
		return Artworks.update(Session.get('selectedArtworkId'), {$set: dataToWrite}, function(error, result) {
			if(error)
				console.log("Error on update: " + error);
			else
				console.log("On update: ", error, result);
		});

}

function setSectionFocus(section) {
	var invalidFields = $('#' + section + ' .form-group.has-error > .form-control');

	var elemToFocus;

	if(invalidFields.length > 0)
		elemToFocus = invalidFields[0];
	else
		elemToFocus = $('#' + section + ' .form-group > .form-control')[0];

	// wait to be sure that the element is visible before applying .focus()
	setTimeout(function(elem) {
		elem.focus();
	}, 300, elemToFocus);
}

function writeToDatabase(context) {
	// write each section stopping if there are validation/update mistakes
	if(
		writeSectionToDatabase("anagraphicTab", context) &&
		writeSectionToDatabase("materialTab", context) &&
		writeSectionToDatabase("physicsDescTab", context) &&
		writeSectionToDatabase("environmentTab", context)
	)
		return true;
	else
		return false;
}

function closeForm() {
	Session.set('anagraphicArtworkFormIsActive', false);
}

function showNextTab() {
	var current = $('.main > .tab-pane.active').attr('id');
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
	setSectionFocus(next);
}

function showPrevTab() {
	var current = $('.main > .tab-pane.active').attr('id');
	var prev = '';
	
	if(current === 'materialTab')
		prev = 'anagraphicTab';
	else if(current === 'physicsDescTab')
		prev = 'materialTab';
	else if(current === 'environmentTab')
		prev = 'physicsDescTab';
	else if(current === 'attachmentsTab')
		prev = 'environmentTab';
	else if(current === 'referentsTab')
		prev = 'attachmentsTab';
	else if(current === 'expositionTab')
		prev = 'referentsTab';
	else
		prev = 'anagraphicTab';

	Session.set('activeSection', prev);
	setSectionFocus(prev);
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

	if(current === "none" && isNaN(fieldIndex))
		return 'selected';
	else if(fieldIndex === current)
		return 'selected';
	else
		return '';
}