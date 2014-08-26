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
	//Session.set('upFiles', []);
	Session.set('usingCustomaryUnits', false);
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
		var current = Session.get('currentArtwork');

		var goBack = function(result) {
			if(result) {
				//removeOrphanAttachmentsOnBack(current);
				ArtworksValidationContext.resetValidation();
				closeForm();
				updateSessionData({_id: ""});
			}
		};

		if(_.isEqual(inDatabase, current)) {
			goBack(true);
		}
		else bootbox.confirm("Unsaved updates will be discarded. Do you really want to go back?", goBack);
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
		Schemas.Artwork.clean(toSave, {removeEmptyStrings: false});
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
			//removeOrphanAttachmentsOnSave(current);
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

					// Remove objects
					updateSessionData({objects: []});

					showMainPane();
				}
				else {
					// if the user aborts operation, set checkbox to true (it was true before checking)
					updateStatus(true);
				}
			});
		}
		else {
			updateStatus(true);
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

		// let the user insert values for the new object <- doesn't work
		$('a[href=#' + newObj.id + 'Pane]').tab('show');
		
	},
	'click .remove-obj': function(evt, templ) {
		var objref = evt.currentTarget.getAttribute('data-objref');

		removeElemFromSessionDataArray(objref, "objects");

		// show main tab
		showMainPane();
	}
});

Template.dimensionsTemplate.getValue = function(field) {

	var value = parseInt(this[field], 10);

	if(isNaN(value))
		return "";

	var round = function(elem) {
		return +(Math.round(elem + "e+2")  + "e-2");
	};

	if(Session.get('usingCustomaryUnits'))
		return round(value / 2.54);
	else return round(value);
};

Template.unitsSelection.isActive = function(unit) {
	var customary = Session.get("usingCustomaryUnits");

	if(customary && unit === 'in' || unit === 'cm')
		return "active";
	else return "";
};

Template.unitsSelection.events({
	'change': function(evt, templ) {

		if(evt.currentTarget.getAttribute('data-unit') === "cm")
			Session.set('usingCustomaryUnits', false);
		else Session.set('usingCustomaryUnits', true);

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

Template.attachmentsSection.created = function() {
	// during upload, files ID are stored in this array
	this.upFiles = [];
};

Template.attachmentsSection.attachments = function() {
	var current = Session.get('currentArtwork');
	var ids = _.map(current.attachments, function(elem) {
		return elem.id;
	});
	var FSFiles = Attachments.find({_id: {$in: ids}}).fetch();

	return _.map(FSFiles, function(elem) {
		var index = $.inArray(elem._id, ids);
		elem['descFieldStr'] = "attachments." + index + ".description";
		elem['description'] = current.attachments[index].description;
		return elem;
	});
};

// following helper is not used anymore
Template.attachmentsSection.upFiles = function() {
	// get the template instance
	// WARNING: in date 21 Aug 2014 the method UI._templateInstance()
	// is not reported in the official documentation. While the functionality
	// will be provided for sure, it is not sure that the method name will remain
	// unchanged. If this breaks, check Documentation to access template instance.
	var inst = UI._templateInstance();

	var upFiles = inst.upFiles;

	// get FS.File objects whose _id is stored in upFiles template variable
	var upFSFiles = Attachments.find({}).fetch();

	_.each(upFSFiles, function(elem) {
		var index = $.inArray(elem._id, upFiles);
		// if the file is present in upFiles but isUploaded()
		// returns true, then the upload is finished and we
		// should remove the file's id from upFiles
		if(index > -1 && elem.isUploaded()) {
			// remove file's id from upFiles
			upFiles.splice(index, 1);

			// TODO: add growl notification 
		}
	});
	return upFSFiles;
};

Template.attachmentsSection.events({
	'change #fileinput': function(evt, templ) {
		
		var onInsertSuccess = function(FSFile) {
			var upFiles = templ.upFiles;
			upFiles.push(FSFile._id);

			// add the new attachment id to the data context
			var newAtc = {id: FSFile._id};
			updateSessionData({attachments: newAtc});
		};

		FS.Utility.eachFile(event, function(file) {
			Attachments.insert(file, function (err, fileObj) {
				//If !err, we have inserted new doc with ID fileObj._id, and
				//kicked off the data upload using HTTP
				if(!err) {
					onInsertSuccess(fileObj);
				} else {
					// message from collection's filter + is better
					//bootbox.alert(err);
				}
			});
		});
	},
	'click .remove-atc': function(evt, templ) {
		var atcref = evt.currentTarget.getAttribute('data-atcref');

		removeElemFromSessionDataArray(atcref, "attachments");
	}
});

function convertTo(unit, current) {
	var computation;

	var round = function(elem) {
		return +(Math.round(elem + "e+2")  + "e-2");
	};

	if(unit === 'cm') {
		computation = function(elem) {
			return round(round(elem) * 2.54);
		};
	}
	else if(unit === 'in') {
		computation = function(elem) {
			return round(round(elem) / 2.54);
		};
	}

	var predicate = function(elem) {
		elem.height = computation(parseInt(elem.height, 10));
		elem.length = computation(parseInt(elem.length, 10));
		elem.depth =  computation(parseInt(elem.depth, 10));
	};

	predicate(current);

	_.each(current.objects, predicate);

	return current;
}

function showMainPane() {
	$('a[href="#main').tab('show');
}

// Temporarily saves data in a session variable to exploit free
// reactivity. On global Save, the session variable (which is an 
// object) will be read and changes will be written to the database
function updateSessionData(newData) {
	var current = Session.get('currentArtwork');
	var schema = Schemas.Artwork;

	// apply changes to current object
	for(var field in newData) {

		var dotIndex = field.indexOf(".");

		if(dotIndex > -1 && field[dotIndex + 2] === '.') {
			// we are dealing with a field of the type 'mainField.$.customField',
			// which is a field of a custom object saved in an array named mainField
			var mainField = field.substring(0, dotIndex);
			var index = field.substr(dotIndex + 1,1);
			var customField = field.substring(dotIndex + 3);

			// the corresponding object must already exist in the 
			// data context, so I just assign the new value
			current[mainField][index][customField] = newData[field];

			if(Session.get('usingCustomaryUnits') &&
				field.substring(field.length - 6) === "height" ||
				field.substring(field.length - 6) === "length" ||
				field.substring(field.length - 5) === "depth") {

				var value1 = parseInt(current[mainField][index][customField], 10);

				if(!isNaN(value1))
					current[mainField][index][customField] = value1 * 2.54;
			}
		} // following if condition is too long, refactor
		else if(_.contains(schema.firstLevelSchemaKeys(), field) && Array.isArray(schema.schema()[field].type()) && !Array.isArray(newData[field])) {
			// If for the current field the schema expects an array of objects 
			// but a single object is passed, I add the object to the current array
			var elems = [];
			if(current[field] !== undefined)
				// use .slice() to achieve deep copy
				elems = current[field].slice(0);
			elems.push(newData[field]);
			current[field] = elems;
		}
		else {
			// if the type changes, reset material and technique
			if(field === "type" && newData[field] !== current[field]) {
				current["material"] = "";
				current["technique"] = "";
			}

			current[field] = newData[field];
		}
	}

	if(Session.get('usingCustomaryUnits') &&
			field === "height" ||
			field === "length" ||
			field === "depth") {

			var value = parseInt(current[field], 10);

			if(!isNaN(value))
				current[field] = value * 2.54;
		}

	// save the modified object
	Session.set('currentArtwork', current);
}

function removeElemFromSessionDataArray(elemRef, arrayName) {
	var current = Session.get('currentArtwork');

	var predicate = function(obj) {
			// here coercion is useful
			// (obj.id is Number and objref is String)
			if(obj.id == elemRef)
				return true;
			else
				return false;
		};

	// get elem to delete
	var elemToDelete = _.find(current[arrayName], predicate);
	// remove elem from array
	current[arrayName].splice($.inArray(elemToDelete, current[arrayName]), 1);

	var data = {};
	data[arrayName] = current[arrayName];
	// update session variable (seems useless, but reactivity...)
	updateSessionData(data);
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

// is there a good way to unify the following two functions?
function removeOrphanAttachmentsOnBack(context) {
	var oldList = _.map(Artworks.findOne(Session.get('selectedArtworkId')).attachments, function(elem) {
			return elem.id;
		});
	var newList = _.map(context.attachments, function(elem) { return elem.id; });

	var diff = _.difference(newList, oldList);

	// untrusted code can only remove one element at a time
	_.each(diff, function(elem) {
		Attachments.remove(elem.id);
	});
}

function removeOrphanAttachmentsOnSave(context) {
	var oldList = _.map(Artworks.findOne(Session.get('selectedArtworkId')).attachments, function(elem) {
			return elem.id;
		});
	var newList = _.map(context.attachments, function(elem) { return elem.id; });

	var diff = _.difference(_.union(oldList, newList), _.intersection(oldList, newList));
	var toRemove = _.difference(diff, newList);

	// untrusted code can only remove one element at a time
	_.each(oldList, function(elem) {
		if($.inArray(elem, newList) < 0)
			// it seems like this remove is not working properly
			Attachments.remove(elem.id, function(err, result) {
				if(err !== undefined)
					console.log("Err", err);
			});
	});
}