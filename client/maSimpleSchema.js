// extending SimpleSchema for usage with maWizard
SimpleSchema.extendOptions({
    maDependsOn: Match.Optional(String),
});

maSimpleSchema = function(schemaObj) {
	var simpleSchema = new SimpleSchema(schemaObj);

	simpleSchema.maWizardAllowedValues = [];

	for(var field in schemaObj) {
		if(schemaObj[field].mawizard && schemaObj[field].mawizard.allowedValues)
			simpleSchema.maWizardAllowedValues.push({'field': field, values: schemaObj[field].mawizard.allowedValues()});
	}

	simpleSchema.getAllowedValues = function(field) {
		var found = _.find(simpleSchema.maWizardAllowedValues, function(elem) {
			return elem.field === field;
		});

		if(found)
			return found.values;
		else
			return undefined;
	};

	return simpleSchema;
};