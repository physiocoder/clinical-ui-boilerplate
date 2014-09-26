Meteor.publish('users', function() {
	return Anagraphics.find();
});

Meteor.publish('artworks', function() {
	return Artworks.find();
});

Meteor.publish('exhibitions', function() {
	return Exhibitions.find();
});

Meteor.publish('collections', function() {
    return Collections.find();
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

Collections.allow({
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

        // returns false for fields whose name is equal to/contains the String "id";
        // these usually are internal fields that we don't want to show to the user.
        // NOTE: I'm well aware of closures working, so you can safely ignore JSHint's warning
        function filter(field) {
            if(field === "id") return false;
            // check if `field` ends with ".id"
            if(field.indexOf(".id", field.length - 3) !== -1)
                return false;

            // check if `field` ends with ".$"
            if(field.indexOf(".$", field.length - 2) !== -1)
                return false;

            var fieldEntry = SchemaDefinitions[schemaName][field + ".$"];

            if(fieldEntry && fieldEntry.type() instanceof Object)
                return false;

            return true;
        }

        if(!Schemas.findOne({definition: schemaName})) {
            var entry = {};
	
            entry.definition = schemaName;
            entry.filtered = _.filter(Object.keys(SchemaDefinitions[schemaName]), filter);
            entry.visibleFields = entry.filtered;

            Schemas.insert(entry);
        }
    }
}

if(Schemas.find().fetch().length === 0)
    saveSchemaDetailsToDatabase();