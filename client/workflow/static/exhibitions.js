Template.exhibitions.rendered = function() {
	$('table').dataTable();
};

Template.exhibitionsList.exhibitions = function() {
	return Exhibitions.find({}).fetch();
};

Template.exhibitionsList.events({
	'click .list-item': function(evt, templ) {
		var id = evt.currentTarget.getAttribute('data-ref');
		Router.go('/exhibitions/' + id);
	}
});

Template.addExhibition.events({
	'click .add-exhibition': function(evt,templ) {
		Router.go('/exhibitions/add');
	}
});