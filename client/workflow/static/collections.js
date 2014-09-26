Template.collectionsWizardDialog.rendered = function() {
	$("#collectionsWizardDialog").modal('show');
};

Template.collectionsList.rendered = function() {
	$('table').dataTable();
	console.log("ROUTER params: ", Router.current().params);
};

Template.collectionsListItem.itemsNumber = function () {
	return Artworks.find({collection: this._id}).count();
};

Template.collectionsWizardDialog.currentCollection = function() {
	return maWizard.getDataContext();
};

Template.collectionsList.events({
	'click .list-item': function(evt, templ) {
		var id = evt.currentTarget.getAttribute('data-ref');
		Router.go('collectionsWizardDialog', { _id: id } );
	}
});

Template.addListItem.events({
	'click .add': function(evt,templ) {
		console.log(evt.currentTarget);
		var id = evt.currentTarget.getAttribute('data-collection');
		Router.go('/' + id + '/add');
	}
});