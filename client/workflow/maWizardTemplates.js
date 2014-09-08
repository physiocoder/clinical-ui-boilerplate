Template.maWizardMultiselect.rendered = function() {
	var ms = $('.multiselect');

	this.autorun(function() {
		Meteor.maWizard.getDataContext();

		// here we use a timeout to be sure that all the helpers
		// that react to the data context changes are executed before
		// rebuilding the multiselect, in order to be sure that the
		// HTML code has already been updated
		setTimeout(function() {
			ms.multiselect('rebuild');
		}, 0);
	});
};

Template.maWizardMultiselect.allowedValuesFromSchema = function(field) {
	return _.map(Meteor.maWizard.getSchemaObj()[field].mawizard.allowedValues(), function(elem) {
		return {name: elem.name, id: elem.id};
	});
};

Template.maWizardCheckbox.isChecked = function(field) {
	var current = Meteor.maWizard.getDataContext();
	if(current && current[field])
		return 'checked';
	else
		return '';
};