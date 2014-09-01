UI.registerHelper('fieldValidity', function(field) {
	if(field === undefined)
		return '';
	var validationResult = Meteor.maWizard.getValidationContext().keyIsInvalid(field);
	if(validationResult)
		return 'has-error';
	else
		return '';
});

UI.registerHelper('errMsg', function(field) {
	if(field === undefined)
		return '';
	var msg = Meteor.maWizard.getValidationContext().keyErrorMessage(field);
	if(msg === "")
		return "";
	else
		return " - " + msg;
});

UI.registerHelper('getThumbURL', function() {
	return this.url({store: 'atcs_thumbs_cloud'});
});

UI.registerHelper('optionIsSelected', function(field) {
	var current = Meteor.maWizard.getDataContext();

	// sometimes I have this.id (Number), sometimes this._id (String),
	// so I should get the right field and datatype
	var id = this.id;

	if(this._id !== undefined)
		id = this._id;

	if(id === undefined)
		return "";
	else
		id = id.toString();

	// NOTE: current[field] could be either a String or an Array, in either case
	// the indexOf() method is defined and the result is the wanted behaviour
	if(current && current[field].indexOf(id) > -1)
		return "selected";
	else return "";
});