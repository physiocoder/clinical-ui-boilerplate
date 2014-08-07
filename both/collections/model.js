Anagraphics = new Meteor.Collection('anagraphics');
Artworks = new Meteor.Collection('artworks');

var Schemas = {};

Schemas.User = new SimpleSchema({
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

Schemas.Artwork = new SimpleSchema({
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
    }
});

Anagraphics.attachSchema(Schemas.User);
Artworks.attachSchema(Schemas.Artwork);