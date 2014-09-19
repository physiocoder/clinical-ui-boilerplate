Template.UISettings.rendered = function() {
	$('table').dataTable();
};

Template.schemasList.schemas = function() {
	return Schemas.find({}).fetch();
};

Template.schemasList.events({
	'click .list-item': function(evt, templ) {
		var id = evt.currentTarget.getAttribute('data-ref');
		Router.go('/settings/UI/schema_' + id);
	}
});