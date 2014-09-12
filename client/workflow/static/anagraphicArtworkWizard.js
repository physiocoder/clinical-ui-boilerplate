Template.anagraphicArtworkWizard.isTabActive = function(tab) {
	if(Session.equals('activeSection', tab))
		return "active";
	else
		return "";
};

Template.anagraphicArtworkWizard.created = function() {
	Session.set('activeSection', 'anagraphicTab');
	Session.set('usingCustomaryUnits', false);
};

Template.anagraphicArtworkWizard.rendered = function() {
	maWizard.setOnSaveFailure(onSaveFailure);
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
	'click .prev': function() {
		showPrevTab();
	},
	'click .next': function() {
		showNextTab();
	},
	'change [data-conversion]': function(evt, templ) {
		if(Session.get('usingCustomaryUnits')) {
			var fieldValuePair = maWizard.parseHTMLElement(evt.currentTarget);
			fieldValuePair.setValue(fieldValuePair.getValue() * 2.54);
			maWizard.processFieldValuePair(fieldValuePair);
		}
		else maWizard.saveHTMLElement(evt.currentTarget);

	},
	'click .tab-selector': function(evt, templ) {
		var selection = evt.currentTarget.getAttribute('data-selection');
		Session.set('activeSection', selection);
		setSectionFocus(selection);
	}
});

Template.accessoriesSection.accessories = function() {
	return Schemas.Accessories.objectKeys();
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
			maWizard.updateContext({multiple: isMultiple});
		};

		var current = maWizard.getDataContext();

		if(!isChecked && current.objects.length !== 0) {
			bootbox.confirm("Proceeding, all objects will be removed.", function(result) {
				if (result) {
					updateStatus(false);

					// Remove objects
					maWizard.updateContext({objects: []});

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
		var current = maWizard.getDataContext();
		
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

		maWizard.updateContext({objects: newObj});

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

Template.dimensionsTemplate.unit = function() {
	if(Session.get('usingCustomaryUnits'))
		return "in";
	else
		return "cm";
};

Template.dimensionsTemplate.convertValue = function(field) {

	var value = parseInt(this[field], 10);

	if(isNaN(value))
		return this[field];

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

Template.attachmentsSection.created = function() {
	// during upload, files ID are stored in this array
	this.upFiles = [];
};

Template.attachmentsSection.attachments = function() {
	var current = maWizard.getDataContext();
	var ids;

	if(current !== undefined)
		ids = _.map(current.attachments, function(elem) {
			return elem.id;
		});
	else ids = [];

	var FSFiles = Attachments.find({_id: {$in: ids}}).fetch();

	return _.map(FSFiles, function(elem) {
		var index = $.inArray(elem._id, ids);
		elem['descFieldStr'] = "attachments." + index + ".description";
		elem['description'] = current.attachments[index].description;
		return elem;
	});
};

Template.attachmentsSection.events({
	'change #fileinput': function(evt, templ) {
		
		var onInsertSuccess = function(FSFile) {
			var upFiles = templ.upFiles;
			upFiles.push(FSFile._id);

			// add the new attachment id to the data context
			var newAtc = {id: FSFile._id};
			maWizard.updateContext({attachments: newAtc});
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

function showMainPane() {
	$('a[href="#main').tab('show');
}

function removeElemFromSessionDataArray(elemRef, arrayName) {
	var current = maWizard.getDataContext();

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
	maWizard.updateContext(data);
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

function onSaveFailure() {
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
	var oldList = _.map(Artworks.findOne(maWizard.getDataContext()._id).attachments, function(elem) {
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
	var oldList = _.map(Artworks.findOne(maWizard.getDataContext()._id).attachments, function(elem) {
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