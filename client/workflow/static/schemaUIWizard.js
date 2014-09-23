Template.schemaUIWizard.rendered = function() {
	var table = this.$('table');

	table.dataTable({
				"paging":   false,
				"ordering": false,
				"scrollY": "400"
			});
};

Template.schemaUIWizard.fields = function() {
	var current = maWizard.getDataContext();

	if(!current) return [];

	var fields = [];
	// deep copy the schema definition
	var schemaDef = $.extend(true, {}, SchemaDefinitions[current.definition]);

	function getFields(schemaDef, fields, deps) {
		if(_.size(schemaDef) === 0) return fields;

		var currentField;
		var field = {};

		if(deps && deps.length > 0) {
			currentField = deps[0];
			field.label = "-> ";
		}
		else {
			currentField = Object.keys(schemaDef)[0];
			field.label = "";
		}

		field.name = currentField;
		field.label += schemaDef[currentField].label;

		fields.push(field);

		if(schemaDef[currentField].maDependencies)
			return getFields(_.omit(schemaDef, currentField), fields, schemaDef[currentField].maDependencies);
		else if(deps)
			return getFields(_.omit(schemaDef, currentField), fields, deps.slice(1));
		else
			return getFields(_.omit(schemaDef, currentField), fields);
	}

	return getFields(schemaDef, fields);
};

Template.fieldsListItem.isChecked = function() {
	return maWizard.getDataContext().visibleFields.indexOf(this.name) > -1 ? "checked" : "";
};

Template.fieldsListItem.isEnabled = function() {
	return maWizard.getDataContext().enabledFields.indexOf(this.name) > -1 ? "" : "disabled";
};

Template.fieldsListItem.events({
	'change': function(evt, templ) {
		var visibleFields = maWizard.getDataContext().visibleFields;
		var enabledFields = maWizard.getDataContext().enabledFields;
		var currentSchema = maWizard.getDataContext().definition;
		var currentField = this.name;

		function enable(field) {
			if(visibleFields.indexOf(field) === -1)
				visibleFields.push(field);
			if(enabledFields.indexOf(field) === -1)
				enabledFields.push(field);
		}

		function disable(field) {
			if(visibleFields.indexOf(field) > -1)
				visibleFields.splice(visibleFields.indexOf(field), 1);
			if(enabledFields.indexOf(field) > -1)
				enabledFields.splice(enabledFields.indexOf(field), 1);
		}
		
		if(visibleFields.indexOf(this.name) > -1) {
			visibleFields.splice(visibleFields.indexOf(this.name), 1);

			if(SchemaDefinitions[currentSchema][currentField].maDependencies) {
				_.each(SchemaDefinitions[currentSchema][currentField].maDependencies, disable);
			}
		}
		else {
			visibleFields.push(this.name);
			if(SchemaDefinitions[currentSchema][currentField].maDependencies) {
				_.each(SchemaDefinitions[currentSchema][currentField].maDependencies, enable);
			}
		}

		maWizard.updateContext({"visibleFields": visibleFields});
		maWizard.updateContext({"enabledFields": enabledFields});
	}
});