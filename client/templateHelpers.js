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