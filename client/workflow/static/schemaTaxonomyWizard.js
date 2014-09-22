Template.schemaTaxonomyWizard.created = function() {
	Session.set('selectedType', "1");
};

Template.schemaTaxonomyWizard.rendered = function() {
	var table = this.$('table').DataTable({
		"paging":   false,
		"ordering": false,
		"scrollY": "400",
		"dom": 'lrtip'
	});

	this.autorun(function() {
		maWizard.getDataContext();

		// here we use a timeout to be sure that all the helpers
		// that react to the data context changes are executed before
		// rebuilding the multiselect, in order to be sure that the
		// HTML code has already been updated
		setTimeout(function() {
			table.draw();
		}, 0);
	});
};

Template.schemaTaxonomyWizard.fields = function() {
	var rawFields = _.omit(ArtworksTaxonomies.find().fetch()[0], "_id");

	var fields = [];

	_.each(Object.keys(rawFields), function(fieldName) {
		var field = rawFields[fieldName];
		var fieldDef = SchemaDefinitions.Artwork[fieldName];
		field.name = fieldName;
		field.label = fieldDef.label;
		fields.push(field);

		_.each(fieldDef.maDependencies, function(dep) {
			var dependentField = {
				name: dep,
				label: SchemaDefinitions.Artwork[dep].label
			};
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
			$('#typeModal').modal('show');
	}
});

Template.addTypeModal.typeNames = function() {
	try {
		return _.map(maWizard.getDataContext().type, function(elem, index) {
			return "type." + index + ".name";
		});
	}
	catch(e) {
		return [];
	}
};

Template.addTypeModal.events({
	'click .add-type': function(evt, templ) {
		var newType = $('.new-type').val();

		var types = maWizard.getDataContext().type;

		function generateTypeID() {
			var ID = Math.floor(Math.random() * 1000);
			if(_.pluck(maWizard.getDataContext().type, "id").indexOf(ID) > -1)
				return generateTypeID;
			else return ID;
		}

		if(newType) {
			maWizard.updateContext({
				type: {
					id: generateTypeID(),
					name: newType
				}
			});
		}
	}
});

Template.typesTable.isTypeSelected = function(id) {
	return Session.get('selectedType') === id ? "selected" : "";
};

Template.typesTable.events({
	'click tr': function(evt, templ) {
		Session.set('selectedType', evt.currentTarget.getAttribute('data-ref'));
	}
});

Template.materialsTable.materials = function() {
	return maWizard.getDataContext().materials;
};

Template.materialsTable.isSelected = function(materialID) {
	var currentMaterialsIDs = _.find(maWizard.getDataContext().type, function(elem) {
		return elem.id === Session.get('selectedType');
	}).material;

	var selected = _.filter(maWizard.getDataContext().materials, function(elem) {
		return currentMaterialsIDs.indexOf(elem.id) > -1;
	});

	if(_.pluck(selected, "id").indexOf(materialID) > -1)
		return "selected";
	else return "";
};

Template.materialsTable.events({
	'click tr': function(evt, templ) {
		var typeID = Session.get('selectedType');
		var typeIndex = _.pluck(maWizard.getDataContext().type, "id").indexOf(typeID);
		var type = maWizard.getDataContext().type;
		var current = type[typeIndex].material;
		var id = evt.currentTarget.getAttribute('data-ref');
		var updated;

		if(current === undefined)
			current = [];

		if(evt.currentTarget.classList.contains("selected")) {
			// remove elem from 'material' array
			current.splice(current.indexOf(id), 1);
			updated = current;
		}
		else current.push(id);

		evt.currentTarget.classList.toggle("selected");

		maWizard.updateContext({"type": type});
	}
});

Template.techniquesTable.isSelected = function(techniqueID) {
	var currentTechniquesIDs = _.find(maWizard.getDataContext().type, function(elem) {
		return elem.id === Session.get('selectedType');
	}).technique;

	var selected = _.filter(maWizard.getDataContext().techniques, function(elem) {
		return currentTechniquesIDs.indexOf(elem.id) > -1;
	});

	if(_.pluck(selected, "id").indexOf(techniqueID) > -1)
		return "selected";
	else return "";
};

Template.techniquesTable.events({
	'click tr': function(evt, templ) {
		var typeID = Session.get('selectedType');
		var typeIndex = _.pluck(maWizard.getDataContext().type, "id").indexOf(typeID);
		var type = maWizard.getDataContext().type;
		var current = type[typeIndex].technique;
		var id = evt.currentTarget.getAttribute('data-ref');
		var updated;

		if(current === undefined)
			current = [];

		if(evt.currentTarget.classList.contains("selected")) {
			// remove elem from 'material' array
			current.splice(current.indexOf(id), 1);
			updated = current;
		}
		else current.push(id);

		evt.currentTarget.classList.toggle("selected");

		maWizard.updateContext({"type": type});
	}
});