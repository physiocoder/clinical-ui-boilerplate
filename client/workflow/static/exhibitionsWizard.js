Template.exhibitionsWizard.rendered = function() {
	maWizard.setOnSaveFailure(onSaveFailure);
};

Template.exhibitionsWizard.events({
	'click .switch': function(evt, templ) {
		Router.go('/artworks/add');
	}
});

function onSaveFailure() {
	// do nothing at the moment
}