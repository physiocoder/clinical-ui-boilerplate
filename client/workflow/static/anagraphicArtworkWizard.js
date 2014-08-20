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
		var inDatabase = Artworks.findOne({_id: Session.get('selectedArtworkId')});

		var goBack = function(result) {
			if(result) {
				ArtworksValidationContext.resetValidation();
				closeForm();
				updateSessionData({_id: ""});
			}
		};

		if(!_.isEqual(inDatabase, this)) {
			bootbox.confirm("Unsaved updates will be discarded. Do you really want to go back?", goBack);
		}
		else goBack(true);
	},
	'click .create': function() {
		var data = Session.get("currentArtwork");

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
	'change .form-control, change .form-checkbox': function(evt, templ) {
		// extracting field name from data-schemafield attribute
		var field = evt.currentTarget.getAttribute('data-schemafield');
		var inputType = evt.currentTarget.getAttribute('type');
		
		var value;
		if(inputType === "checkbox")
			value = evt.currentTarget.checked;
		else
			value = evt.currentTarget.value;

		// constructing the object to pass to validateOne(obj, key)
		var fieldValuePair = {};
		fieldValuePair[field] = value;

		// update the data context
		updateSessionData(fieldValuePair);

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
		var current = Session.get('currentArtwork');
		// up-to-date data are already in the session variable, just validate
		// the entire object without the _id field
		var toSave = _.omit(current, '_id');

		ArtworksValidationContext.resetValidation();
		// usual clean
		Schemas.Artwork.clean(toSave);
		ArtworksValidationContext.validate(toSave);

		if(ArtworksValidationContext.invalidKeys().length > 0) {
			// show the section to let the user correct highlighted values
			var selectors = $('.tab-selector');
			var n = selectors.length;
			for(var i = 0; i < n; i++) {
				var section = selectors[i].getAttribute('data-selection');
				var errors = $("#" + section + " .has-error").length;
				if(errors > 0) {
					Session.set('activeSection', section);
					setSectionFocus(section);
					break;
				}
			}
		}
		else {
			Artworks.update(current._id, {$set: toSave}, function(error, result) {
				// something went wrong... 
				// TODO: add a callback that saves the datacontext in order not
				// to lose changes
			});

			closeForm();
		}
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
	return Schemas.Accessories.firstLevelSchemaKeys();
};

Template.accessoriesSection.isChecked = function(artworkContext) {
	var current = Session.get("currentArtwork");
	if(current[this])
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
	return _.map(this.objects, function(elem, index, list) {
		elem["objNum"] = index + 1;
		elem["objnameFieldStr"] = "objects." + index + ".objname";
		elem["heightFieldStr"] = "objects." + index + ".height";
		elem["lengthFieldStr"] = "objects." + index + ".length";
		elem["depthFieldStr"] = "objects." + index + ".depth";
		return elem;
	});
};

Template.physicsDescriptionSection.events({
	'change .multiple-checkbox': function(evt, templ) {
		var isChecked = evt.currentTarget.checked;

		var updateStatus = function(isMultiple) {
			updateSessionData({multiple: isMultiple});
		};

		var current = Session.get("currentArtwork");

		if(!isChecked && current.objects.length !== 0) {
			bootbox.confirm("Proceeding, all objects will be removed.", function(result) {
				if (result) {
					updateStatus(false);
					//Artworks.update(Session.get('selectedArtworkId'), {$set: {multiple: false}});

					// Remove objects
					updateSessionData({objects: []});
					//Artworks.update(Session.get('selectedArtworkId'), {$unset: {objects: ""}});
					showMainPane();
				}
				else {
					// if the user aborts operation, set checkbox to true (it was true before checking)
					updateStatus(true);
					//var n = Artworks.update(Session.get('selectedArtworkId'), {$set: {multiple: true}});
				}
			});
		}
		else {
			updateStatus(true);
			//Artworks.update(Session.get('selectedArtworkId'), {$set: {multiple: true}});
		}
	},
	'click .add-object': function(evt, templ) {
		var current = Session.get('currentArtwork');
		
		// returns a random number between 0-999
		var getNewId = function() {
			return Math.floor(Math.random() * 1000);
		};

		// ids of current objects
		var ids = _.map(current.objects, function(value, key, list) {
			return value.id;
		});

		var _id;

		do {
			_id = getNewId();
		}
		while($.inArray(_id, ids) >= 0);
		
		var newObj = {
			id: _id,
			objname: "",
			height: "",
			length: "",
			depth: ""
		};

		updateSessionData({objects: newObj});

		// let the user insert values for the new object
		$('a[href=#' + newObj.id + 'Pane]').tab('show');
		
	},
	'click .remove-obj': function(evt, templ) {
		var objref = evt.currentTarget.getAttribute('data-objref');
		var current = Session.get('currentArtwork');

		var predicate = function(obj) {
			// here coercion is useful
			// (obj.id is Number and objref is String)
			if(obj.id == objref)
				return true;
			else
				return false;
		};

		// get objects to delete
		var objToDelete = _.find(current.objects, predicate);
		// remove object from objects array
		current.objects.splice($.inArray(objToDelete, current.objects), 1);
		// update session variable (seems useless, but reactivity...)
		updateSessionData({objects: current.objects});

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

Template.attachmentsSection.attachments = function() {
	return this.attachments;
};

Template.attachmentsSection.events({
	'change #fileinput': function(evt, templ) {
		FS.Utility.eachFile(event, function(file) {
			Attachments.insert(file, function (err, fileObj) {
				//If !err, we have inserted new doc with ID fileObj._id, and
				//kicked off the data upload using HTTP
				if(!err) {
					var newImg = {id: fileObj._id, type: "image"}; // for the moment, just treat images
					updateSessionData({attachments: newImg});
					bootbox.alert("Immagine caricata!");
				} else {
					bootbox.alert("Errore nel caricamento immagine!");
				}
			});
		});
	}
});

Template.attachmentThumb.thumbAddress = function(id) {
	return Attachments.findOne({_id: id}).url({store: "atcs_thumbs"});
};

function showMainPane() {
	$('a[href="#main').tab('show');
}

// Temporarily saves data in a session variable to exploit free
// reactivity. On global Save, the session variable (which is an 
// object) will be read and changes will be written to the database
function updateSessionData(newData) {
	var current = Session.get('currentArtwork');

	// apply changes to current object
	for(var field in newData) {
		// For 'objects' and 'attachments' if a single element is passed I add
		// it to the current array
		if(field === "objects" || field === "attachments" && !Array.isArray(newData[field])) {
			// Simple-Schema expects an array
			var elems = [];
			if(current[field] !== undefined)
				// use .slice() to achieve deep copy
				elems = current[field].slice(0);
			elems.push(newData[field]);
			current[field] = elems;
		}
		else if(field.length > 7 && field.indexOf("objects") === 0) {
			// we are dealing with a field of the type 'objects.$.fieldName'
			var index = field.substr(8,1);
			var subfield = field.substring(10);

			// the corresponding object must already exist in the 
			// data context, so I just assign the new value
			current.objects[index][subfield] = newData[field];
		}
		else current[field] = newData[field];
	}

	// save the modified object
	Session.set('currentArtwork', current);
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