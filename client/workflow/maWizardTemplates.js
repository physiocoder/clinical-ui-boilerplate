Template.maWizardSave.events({
	'click [data-ma-wizard-save]': function(evt, templ) {
		if(Meteor.maWizard.saveToDatabase()) {
			Router.go(Meteor.maWizard.baseRoute);
			Meteor.maWizard.discard();
		}
		else {
			var onSaveFailure = Meteor.maWizard.getOnSaveFailure();

			if(onSaveFailure === undefined || (typeof onSaveFailure !== "function")) {
				bootbox.alert("Cannot save to database! Check inserted data");
			}
			else onSaveFailure();
		}
	}
});

Template.maWizardCancel.events({
	'click [data-ma-wizard-cancel]': backToBase
});

Template.maWizardBackToList.events({
	'click [data-ma-wizard-backToList]': backToBase
});

Template.maWizardCreate.events({
	'click [data-ma-wizard-create]': function(evt, templ) {
		if(Meteor.maWizard.create())
			Router.go(Meteor.maWizard.baseRoute + "/" + Meteor.maWizard.getDataContext()._id);
	}
});

Template.maWizardDelete.events({
	'click [data-ma-wizard-delete]': function(evt,templ) {
		if(Meteor.maWizard.removeFromDatabase())
			Router.go(Meteor.maWizard.baseRoute);
	}
});

function backToBase(evt, templ) {
	var goBack = function(result) {
		if(result) {
			Meteor.maWizard.discard();
			Router.go(Meteor.maWizard.baseRoute);
		}
	};

	if(Meteor.maWizard.changed()) {
		bootbox.confirm("Unsaved updates will be discarded. Do you really want to go back?", goBack);
	}
	else goBack(true);
}