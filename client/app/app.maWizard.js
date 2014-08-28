function maWizard() {
	var dataContext;
	var dataContextDep = new Deps.Dependency;

	var collection;
	var schema;

	var validationContext;

	var isInDatabase;

	var buildObjectFromSchema = function() {

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

	this.parseHTMLElement = function(elem) {

	};

	this.saveHTMLElement = function(elem) {

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

	this.updateContext = function() {

	};

	this.removeFieldValue = function() {

	};

	this.saveToDatabase = function() {

	};

	this.removeFromDatabase = function() {

	};

	this.existsInDatabase = function() {

	};

	this.changed = function() {
		var inDatabase = collection.findOne({_id: this.getDataContext()._id});

		return !_.isEqual(inDatabase, this.getDataContext());
	};

	this.discard = function() {
		// TODO: remove orphan attachments files!!!
		this.setDataContext = undefined;
	};

	this.configure = function(conf) {
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
		if(conf.id === undefined) {
			// refactor!
			// implement buildObjectFromSchema() and substitute
			contextObj = {
				_id: undefined,
				inventory: "",
				title: "",
				authors: "",
				description: "",
				dating: "",
				type: "",
				material: [],
				technique: [],
				frame: false,
				mount: false,
				base: false,
				manuals: false,
				covers: false,
				"case": false, // 'case' is a reserved word
				belts: false,
				site: "",
				city: "",
				UVP: "",
				RH: "",
				temperature: "",
				lux: "",
				AMO: "",
				height: "",
				length: "",
				depth: "",
				multiple: false,
				objects: [],
				attachments: []
			};
		}
		else contextObj = collection.findOne(conf.id);

		this.setDataContext(contextObj);
	};
}

Meteor.startup(function() {
	Meteor.maWizard = new maWizard();
});