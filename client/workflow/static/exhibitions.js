Template.exhibitions.rendered = function() {
	$('table').dataTable();
};

Template.exhibitions.exhibitionsWizardIsActive = function() {
	return Session.get('exhibitionsWizardIsActive');
};

Template.exhibitions.exhibitionContext = function() {
	var context;
	var current = Session.get('currentExhibition');
	var id = current._id;

	if(id === 'add') {
		_.each(Schemas.Exhibitions.firstLevelSchemaKeys(), function(key) {
			context[key] = "";
		});
	}
	else if(Object.keys(current).length === 1) {
		// in this case 'current' just has the id field so it
		// exists in the databse but hasn't been loaded in
		// memory yet, so we load it
		context = Exhibitions.findOne({_id: id});
	}
	else {
		// the object is present in memory so we use
		// it as datacontext to show unsaved changes reactively
		context = current;
	}

	Session.set('currentExhibition', context);

	return context;
};

Template.exhibitionsList.exhibitions = function() {
	return Exhibitions.find({}).fetch();
};

Template.exhibitionsList.events({
	'click .trial': function(evt, templ) {
		var id = evt.currentTarget.getAttribute('data-ref');
		Router.go('/exhibitions/' + id);
	}
});