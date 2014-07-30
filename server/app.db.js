Meteor.publish('users', function() {
	return Anagraphics.find();
});