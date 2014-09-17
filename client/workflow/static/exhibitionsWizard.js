/****************** Global interface ***********************************/

Template.exhibitionsWizard.created = function() {
	Session.set('activeSection', 'anagraphicTab');
};

Template.exhibitionsWizard.rendered = function() {
	maWizard.setOnSaveFailure(onSaveFailure);
};

Template.exhibitionsWizard.isTabActive = function(tab) {
	if(Session.equals('activeSection', tab))
		return "active";
	else
		return "";
};

Template.exhibitionsWizard.navigatorHidden = function(navBtn) {
	var section = Session.get('activeSection');
	if(navBtn === 'prev' && section === 'anagraphicTab')
		return "hidden";
	else if(navBtn === 'next' && section === 'artworksTab')
		return "hidden";
	else
		return "";
};

Template.exhibitionsWizard.events({
	'click .prev': function() {
		showPrevTab();
	},
	'click .next': function() {
		showNextTab();
	},
	'click .tab-selector': function(evt, templ) {
		var selection = evt.currentTarget.getAttribute('data-selection');
		Session.set('activeSection', selection);
		setSectionFocus(selection);
	}
});

function showNextTab() {
	var current = $('.main > .tab-pane.active').attr('id');
	var next = '';
	if(current === 'anagraphicTab')
		next = 'artworksTab';

	Session.set('activeSection', next);
	//setSectionFocus(next);
}

function showPrevTab() {
	var current = $('.main > .tab-pane.active').attr('id');
	var prev = '';
	
	if(current === 'artworksTab')
		prev = 'anagraphicTab';

	Session.set('activeSection', prev);
	setSectionFocus(prev);
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
	// do nothing at the moment
}

/****************************************************************************************/

/******************************** Artworks tab ******************************************/
Template.artworksTab.created = function() {
	Session.set('inUpdateMode', false);
};

Template.artworksTab.rendered = function() {
	var table = this.$('table');

	this.autorun(function() {
		maWizard.getDataContext();

		// here we use a timeout to be sure that all the helpers
		// that react to the data context changes are executed before
		// rebuilding the multiselect, in order to be sure that the
		// HTML code has already been updated
		setTimeout(function() {
			table.dataTable();
		}, 0);
	});
};

Template.artworksTab.inUpdateMode = function() {
	return Session.get('inUpdateMode');
};

Template.artworksTab.getDimension = function() {
	if(Session.get('inUpdateMode'))
		return "col-xs-6";
	else
		return "col-xs-12";
};

Template.artworksTab.events({
	'click .update': function(evt, templ) {
		Session.set('inUpdateMode', true);
	},
	'click .ok': function(evt, templ) {
		Session.set('inUpdateMode', false);
	}
});

Template.artworksListItem.selectedIfParticipating = function() {
	if(Session.get('inUpdateMode') && maWizard.getDataContext()['artworks'].indexOf(this._id) > -1)
		return "selected";
	else
		return "";
};

Template.currentArtworksTable.participatingArtworks = function() {
	return Artworks.find({ _id: {$in: maWizard.getDataContext()['artworks']}}, {fields: { title: 1, authors: 1}}).fetch();
};

Template.currentArtworksTable.events({
	'click tr': function(evt, templ) {
		if(!Session.get('inUpdateMode')) {
			var id = evt.currentTarget.getAttribute('data-ref');
			Router.go('/artworks/' + id);
		}
	}
});

Template.artworksUpdatingTable.rendered = function() {
	var table = this.$('table');

	this.autorun(function() {
		maWizard.getDataContext();

		// here we use a timeout to be sure that all the helpers
		// that react to the data context changes are executed before
		// rebuilding the multiselect, in order to be sure that the
		// HTML code has already been updated
		setTimeout(function() {
			table.dataTable();
		}, 0);
	});
};

Template.artworksUpdatingTable.artworksList = function() {
	return Artworks.find({}, {fields: {title: 1, authors: 1}}).fetch();
};

Template.artworksUpdatingTable.events({
	'click tr': function(evt, templ) {
		var current = maWizard.getDataContext()['artworks'];
		var id = evt.currentTarget.getAttribute('data-ref');
		var updated;

		if(evt.currentTarget.classList.contains("selected")) {
			// remove elem from 'artworks' array
			current.splice(current.indexOf(id), 1);
			updated = current;
		}
		else current.push(id);

		evt.currentTarget.classList.toggle("selected");

		maWizard.processFieldValuePair(maWizard.buildFieldValuePair("artworks", updated));
	}
});