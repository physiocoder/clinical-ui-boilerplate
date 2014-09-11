Template.exhibitionsWizard.rendered = function() {
	maWizard.setOnSaveFailure(onSaveFailure);
};

Template.exhibitionsWizard.artworks = function() {
	return _.map(Artworks.find({}, {fields: {title: 1}}).fetch(), function(elem) {
		return {name: elem.title, id: elem._id};
	});
};

Template.exhibitionsWizard.events({
	'click .switch': function(evt, templ) {
		Router.go('/artworks/add');
	}
});

function onSaveFailure() {
	// do nothing at the moment
}