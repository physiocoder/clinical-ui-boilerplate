Anagraphics = new Meteor.Collection('anagraphics');
Artworks = new Meteor.Collection('artworks');

Artworks.allow({
    remove: function(userId) {
        return userId;
    }
});

var schemas = {};

schemas.User = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 20
    },
    surname: {
        type: String,
        label: "Surname",
        max: 20
    },
    sex: {
		type: String,
		label: "sex",
		max: 1
    }
});

schemas.Artwork = new SimpleSchema({
    inventory: {
        type: String,
        label: "Inventory",
        max: 20
    },
    title: {
    type: String,
        label: "Title",
        max: 200
    },
    authors: {
        type: String,
        label: "Author(s)",
        max: 20
    },
    description: {
        type: String,
        label: "Description",
        max: 200,
        optional: true
    },
    dating: {
        type: String,
        label: "Dating",
        max: 20
    },
    type: {
        type: String,
        label: "Artwork type",
        max: 200
    }
});

Anagraphics.attachSchema(schemas.User);
Artworks.attachSchema(schemas.Artwork);

ArtworksValidationContext = schemas.Artwork.namedContext("artworksContext");