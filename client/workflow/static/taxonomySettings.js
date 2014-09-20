Template.taxonomySettings.rendered = function() {
	$('table').dataTable();
};

Template.taxonomySettings.events({
	'click .list-item': function(evt, templ) {
		var _id = evt.currentTarget.getAttribute('data-ref');
		Router.go('/settings/taxonomy/schema_' + _id);
	}
});