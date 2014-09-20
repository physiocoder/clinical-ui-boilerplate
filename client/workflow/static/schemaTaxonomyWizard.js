Template.schemaTaxonomyWizard.fields = function() {
	var rawFields = _.omit(Taxonomies.find().fetch()[0], "_id");

	var fields = [];

	_.each(Object.keys(rawFields), function(fieldName) {
		var field = rawFields[fieldName];
		field.name = fieldName;
		fields.push(field);

		_.each(SchemaDefinitions.Artwork[fieldName].maDependencies, function(dep) {
			var dependentField = {name: dep};
			fields.push(dependentField);
		});
	});

	return fields;
};

Template.schemaTaxonomyWizard.events({
	'click .taxonomy-field': function(evt, templ) {
		var field = evt.currentTarget.getAttribute('data-field');
		var rawFields = SchemaDefinitions.Artwork;
		var fieldNames = Object.keys(rawFields);

		var isDependency = _.some(fieldNames, function(fieldName) {
			var deps = rawFields[fieldName].maDependencies;
			if(deps && deps.indexOf(field) > -1)
				return true;
		});

		if(isDependency)
			console.log("It's a dependency!");
		else
			console.log("Not a dependency");
	}
});