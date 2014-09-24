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
	var schemaDef = SchemaDefinitions[current.definition];
	// deep copy the filtered array
	var filtered = $.extend(true, [], current.filtered);

	var currentField;
	var field = {};
	var deps = [];

	while(filtered.length > 0) {
		if(deps.length > 0) {
			currentField = deps[0];
			field.label = "-> ";
		}
		else {
			currentField = filtered[0];
			field.label = "";
		}

		field.name = currentField;
		field.label += schemaDef[currentField].label;

		fields.push($.extend({}, field));

		filtered.splice(filtered.indexOf(currentField), 1);

		if(schemaDef[currentField].maDependencies)
			deps = schemaDef[currentField].maDependencies;
		else if(deps.length > 0)
			deps = deps.slice(1);
	}

	return fields;
};

Template.fieldsListItem.isChecked = function() {
	return maWizard.getDataContext().visibleFields.indexOf(this.name) > -1 ? "checked" : "";
};

Template.fieldsListItem.isEnabled = function() {
	var defs = SchemaDefinitions[maWizard.getDataContext().definition];

	// if the `optional` property has not been set or is set to false, the field is required
	function isRequired(field) {
		if(defs[field].optional || defs[field].optional === false)
			return false;
		else
			return true;
	}
	
	if(isRequired(this.name))
		return "disabled";

	var state = "";

	for(var def in defs) {
		if(def.maDependencies && def.maDependencies.indexOf(this.name) > -1 && isRequired(def)) {
			state = "disabled";
		}
	}

	return state;
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