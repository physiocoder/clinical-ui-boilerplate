function maWizard() {
	var dataContext;
	var dataContextDep = new Deps.Dependency;

	var collection;
	var schema;

	var validationContext;

	var isInDatabase;

	var buildObjectFromSchema = function() {
		var obj = {};

		_.each(schema.firstLevelSchemaKeys(), function(key) {
			var keyValue;
			var keyType = schema.schema()[key].type();

			if(typeof keyType === 'string' || typeof keyType === 'number')
				keyValue = "";
			else if(typeof keyType === 'boolean')
				keyValue = false;
			else if(Array.isArray(keyType))
				keyValue = [];

			obj[key] = keyValue;
		});

		obj["_id"] = undefined;

		return obj;
	};

	this.setDataContext = function(context) {
		dataContext = context;
		dataContextDep.changed();
	};

	this.getDataContext = function() {
		dataContextDep.depend();
		return dataContext;
	};

	this.getValidationContext = function() {
		return validationContext;
	};

	this.buildFieldValuePair = function(field, value) {
		return new FieldValuePair(field, value);
	};

	this.parseHTMLElement = function(elem) {
		// extracting field name from data-schemafield attribute
		var field = elem.getAttribute('data-schemafield');
		var inputType = elem.type;

		// if the input is a checkbox we want to get its checked state,
		// for a multiple select we want the selected elements and for 
		// the other inputs we simply get the value
		var value;
		if(inputType === "checkbox")
			value = elem.checked;
		else if(inputType === "select-multiple") {
			var ops = _.filter(elem.options, function(elem) {
				if(elem.selected)
					return true;
			});
			value = _.map(ops, function(elem) {
				return elem.value;
			});
		}
		else value = elem.value;

		// constructing the object to pass to validateOne(obj, key)
		var fieldValuePair = this.buildFieldValuePair(field, value);
		
		return fieldValuePair;
	};

	this.saveHTMLElement = function(elem) {
		var toSave = this.parseHTMLElement(elem);

		this.processFieldValuePair(toSave);
	};

	this.processFieldValuePair = function(fieldValuePair) {
		var field = fieldValuePair.getFieldName();
		var value = fieldValuePair.getValue();
		
		var plainObj = {};
		plainObj[field] = value;
		// update the data context
		Meteor.maWizard.updateContext(plainObj);

		// clean the object "to avoid any avoidable validation errors" 
		// [cit. aldeed - Simple-Schema author]
		schema.clean(plainObj, {removeEmptyStrings: false});
		validationContext.validateOne(plainObj, field);
	};

	this.create = function() {
		// return a feedback about validation and database errors

		var data = Meteor.maWizard.getDataContext();

		// the clean method performs useful operations to avoid
		// tricky validation errors (like conversion of String 
		// to Number when it is meaningful)
		schema.clean(data);

		if(validationContext.validate(data)) {
			var id = collection.insert(data, function(error, result) {
				if(error !== undefined)
					console.log("Error on insert", error);
			});

			data["_id"] = id;
			this.setDataContext(data);
		}
		else return false;
	};

	this.updateContext = function(newData) {
		var current = dataContext;

		// apply changes to current object
		for(var field in newData) {

			var dotIndex = field.indexOf(".");

			if(dotIndex > -1 && field[dotIndex + 2] === '.') {
				// we are dealing with a field of the type 'mainField.$.customField',
				// which is a field of a custom object saved in an array named mainField
				var mainField = field.substring(0, dotIndex);
				var index = field.substr(dotIndex + 1,1);
				var customField = field.substring(dotIndex + 3);

				// the corresponding object must already exist in the 
				// data context, so I just assign the new value
				current[mainField][index][customField] = newData[field];

			} // following if condition is too long, refactor
			else if(_.contains(schema.firstLevelSchemaKeys(), field) && Array.isArray(schema.schema()[field].type()) && !Array.isArray(newData[field])) {
				// If for the current field the schema expects an array of objects 
				// but a single object is passed, I add the object to the current array
				var elems = [];
				if(current[field] !== undefined)
					// use .slice() to achieve deep copy
					elems = current[field].slice(0);
				elems.push(newData[field]);
				current[field] = elems;
			}
			else {
				// if the type changes, reset material and technique
				if(field === "type" && newData[field] !== current[field]) {
					current["material"] = [];
					current["technique"] = [];

					try {
						// the multiselect elements must be cleared programmatically
						// via the provided methods
						var techSelect = $('.multiselect.technique');
						var techVal = techSelect.val();
						if(techVal)
							techSelect.multiselect('deselect', techVal);
						var matSelect = $('.multiselect.material');
						var matVal = matSelect.val();
						if(matVal)
							matSelect.multiselect('deselect', matVal);
						//$('.multiselect').multiselect('refresh');
					}
					catch(e) {
						// if no values where selected an exception is thrown;
						// in such a case we don't need to do anything, just relax :)
					}
				}

				current[field] = newData[field];
			}
		}

		// save the modified object
		Meteor.maWizard.setDataContext(current);
	};

	this.removeFieldValue = function() {

	};

	this.saveToDatabase = function() {
		var current = Meteor.maWizard.getDataContext();
		// up-to-date data are already in the dataContext variable, just validate
		// the entire object without the _id field
		var toSave = _.omit(current, '_id');

		validationContext.resetValidation();
		// usual clean
		schema.clean(toSave, {removeEmptyStrings: false});
		validationContext.validate(toSave);

		if(validationContext.invalidKeys().length > 0)
			return false;
		else
			return collection.update(current._id, {$set: toSave}, function(error, result) {
				// something went wrong... 
				// TODO: add a callback that saves the datacontext in order not
				// to lose changes
			});
	};

	this.removeFromDatabase = function() {
		return collection.remove(this.getDataContext()._id, function(error, result) {
			console.log("Error on remove: " + error);
			console.log("Removed elements: " + result);
		});
	};

	this.existsInDatabase = function() {

	};

	this.changed = function() {
		var inDatabase = collection.findOne({_id: this.getDataContext()._id});

		return !_.isEqual(inDatabase, this.getDataContext());
	};

	this.discard = function() {
		// TODO: remove orphan attachments files!!!
		this.setDataContext(undefined);
	};

	this.init = function(conf) {
		var contextObj;

		collection = conf.collection;
		
		if(collection === undefined)
			throw "No collection defined for maWizard!";

		if(conf.schema === undefined)
			schema = collection.simpleSchema();
		else
			schema = conf.schema;

		validationContext = schema.namedContext();

		// if no id is specified I am adding a new object
		if(conf.id === undefined)
			contextObj = buildObjectFromSchema();
		else
			contextObj = collection.findOne(conf.id);

		this.setDataContext(contextObj);
	};
}

function FieldValuePair(field, value) {
	var _field = field;
	var _value = value;

	var _setValue = function(val) {
		_value = val;
	};

	this.getValue = function() { return _value; };
	this.setValue = function(val) {
		return _setValue(val);
	};

	this.getFieldName = function() { return _field; };
}

Meteor.startup(function() {
	Meteor.maWizard = new maWizard();
});