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

	if(this.id === undefined && current[field] === "")
		return "selected";
	else if(this.id == current[field]) // this.id is Number and current[field] is String, exploit coercion!
		return "selected";
	else return "";
});