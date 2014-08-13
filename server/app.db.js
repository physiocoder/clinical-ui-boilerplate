Meteor.publish('users', function() {
	return Anagraphics.find();
});

Meteor.publish('artworks', function() {
	return Artworks.find();
});

Artworks.allow({
    update: function(userId) {
        return userId;
    },
    remove: function(userId) {
        return userId;
    }
});

Meteor.methods({
	removeMaterialAndTechnique: function(docId) {
		return Artworks.remove({_id: docId, fields: { material: 1, technique: 1}});
	},
	removeObject: function(artworkId, objname) {
		return Artworks.remove({_id: artworkId});
	}
});