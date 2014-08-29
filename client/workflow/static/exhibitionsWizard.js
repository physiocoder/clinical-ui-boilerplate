Template.exhibitionsWizard.events({
	'click .cancel, click .back': function(evt, templ) {
		// this was copy-pasted, unify with artworksWizard
		var goBack = function(result) {
			if(result) {
				Meteor.maWizard.discard();
				Router.go('/exhibitions');
			}
		};

		if(Meteor.maWizard.changed()) {
			bootbox.confirm("Unsaved updates will be discarded. Do you really want to go back?", goBack);
		}
		else goBack(true);
	},
	'click .create': function(evt, templ) {
		if(Meteor.maWizard.create())
			Router.go('/exhibitions/' + Meteor.maWizard.getDataContext()._id);
	},
	'click .delete': function(evt, templ) {
		if(Meteor.maWizard.removeFromDatabase())
			Router.go('/exhibitions');
	},
	'click .save': function(evt, templ) {
		if(Meteor.maWizard.saveToDatabase()) {
			Router.go('/exhibitions');
			Meteor.maWizard.discard();
		}
	},
	'change .form-control': function(evt, templ) {
		Meteor.maWizard.saveHTMLElement(evt.currentTarget);
	}
});