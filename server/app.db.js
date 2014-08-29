Meteor.publish('users', function() {
	return Anagraphics.find();
});

Meteor.publish('artworks', function() {
	return Artworks.find();
});

Meteor.publish('exhibitions', function() {
	return Exhibitions.find();
});

Meteor.publish('attachments', function() {
	return Attachments.find();
});

Artworks.allow({
    update: function(userId) {
        return userId;
    },
    remove: function(userId) {
        return userId;
    }
});

Exhibitions.allow({
	insert: function(userId) {
		return userId;
	},
    update: function(userId) {
        return userId;
    },
    remove: function(userId) {
        return userId;
    }
});

Attachments.allow({
	insert: function(userId) {
		return userId;
	},
	update: function(userId) {
		return userId;
	},
	remove: function() {
		return userId;
	},
	download: function(userId) {
		return userId;
	}
});

Meteor.methods({
	// this method has become useless when switched to a temporary reactive 
	// data structure to store current artwork's changes
	removeMaterialAndTechnique: function(docId) {
		return Artworks.remove({_id: docId, fields: { material: 1, technique: 1}});
	}
});