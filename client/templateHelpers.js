UI.registerHelper('fieldValidity', function(field) {
	if(field === undefined)
		return '';
	var validationResult = ArtworksValidationContext.keyIsInvalid(field);
	if(validationResult)
		return 'has-error';
	else
		return '';
});

UI.registerHelper('errMsg', function(field) {
	if(field === undefined)
		return '';
	var msg = ArtworksValidationContext.keyErrorMessage(field);
	if(msg === "")
		return "";
	else
		return " - " + msg;
});

UI.registerHelper('getThumbURL', function() {
	return this.url({store: 'atcs_thumbs_cloud'});
});

UI.registerHelper('optionIsSelected', function(field) {
	var current = Session.get('currentArtwork');

	// NOTE: current[field] could be either a String or an Array, in either case
	// the indexOf() method is defined and the result is the wanted behaviour
	if(this.id !== undefined && current[field].indexOf(this.id.toString()) > -1)
		return "selected";
	else return "";
});