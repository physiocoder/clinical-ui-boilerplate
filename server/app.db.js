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

Meteor.publish('schemas', function() {
	return Schemas.find();
});

Meteor.publish('artworks_taxonomies', function() {
    return ArtworksTaxonomies.find();
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

Schemas.allow({
    update: function(userId) {
        return userId;
    }
});

ArtworksTaxonomies.allow({
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

function saveSchemaDetailsToDatabase() {
    for(var schemaName in SchemaDefinitions) {
        if(!Schemas.findOne({name: schemaName})) {
            var entry = {};
	
            entry.name = schemaName;
            entry.visibleFields = Object.keys(SchemaDefinitions[schemaName]);
            entry.enabledFields = entry.visibleFields;

            Schemas.insert(entry);
        }
    }
}

Schemas.remove({});
saveSchemaDetailsToDatabase();