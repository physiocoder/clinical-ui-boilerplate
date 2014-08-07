Meteor.publish('users', function() {
	return Anagraphics.find();
});

Meteor.publish('artworks', function() {
	return Artworks.find();
});