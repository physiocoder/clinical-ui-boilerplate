Anagraphics = new Meteor.Collection('anagraphics');

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

Anagraphics.attachSchema(Schemas.User);