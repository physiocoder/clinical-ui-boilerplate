/* NOTE: this file must be loaded before model.js.
 * It currently resides in the same folder and its name
 * comes before model.js in alphabetical order so it is
 * loaded as needed. In future, this being a package, we
 * won't have to be careful about this issue.
 */

// extending SimpleSchema for usage with maWizard
SimpleSchema.extendOptions({
	maDependencies: Match.Optional(Array),
	maAllowedValues: Match.Optional(Function)
});

maSimpleSchema = function(schemaObj) {
	var simpleSchema;

	var customValidationFunction = function() {
		var self = this;
		var getFieldValue = function(field) {
			return self.field(field).value;
		};

		var allowedValues = this.definition.maAllowedValues(getFieldValue);

		var contained = _.every(this.value, function(elem) {
			var values = _.map(allowedValues, function(elem) {
				return elem.value.toString();
			});

			return values.indexOf(elem) > -1;
		});

		if(contained) return true;
		else return "notAllowed";
	};

	var maAllowedValuesField;
	for(var field in schemaObj) {
		maAllowedValuesField = schemaObj[field].maAllowedValues;
		if(maAllowedValuesField) {
			schemaObj[field].custom = customValidationFunction;
		}
	}

	simpleSchema = new SimpleSchema(schemaObj);

	return simpleSchema;
};