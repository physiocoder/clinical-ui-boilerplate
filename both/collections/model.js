Anagraphics = new Meteor.Collection('anagraphics');
Artworks = new Meteor.Collection('artworks');

Schemas = {};

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
    },
    type: {
        type: String,
        label: "Artwork type",
        max: 200
    },
    material: {
        type: String,
        label: "Material",
        optional: true
    },
    technique: {
        type: String,
        label: "Technique",
        optional: true
    },
    accessories: {
        type: [String],
        label: "Accessories",
        optional: true
    },
    site: {
        type: String,
        label: "Site",
        optional: true
    },
    city: {
        type: String,
        label: "City",
        optional: true
    },
    UVP: {
        type: Boolean,
        label: "UV protection",
        optional: true
    },
    RH: {
        type: Number,
        label: "Relative Humidity",
        optional: true
    },
    temperature: {
        type: Number,
        label: "Temperature",
        optional: true
    },
    lux: {
        type: String,
        label: "lux",
        optional: true
    },
    AMO: {
        type: String,
        label: "Adesione Microbica Oraria",
        optional: true
    },
    height: {
        type: Number,
        label: "Height",
        min: 1,
        optional: true
    },
    length: {
        type: Number,
        label: "Length",
        min: 1,
        optional: true
    },
    depth: {
        type: Number,
        label: "Depth",
        min: 1,
        optional: true
    },
    multiple: {
        type: Boolean,
        label: "Multiple",
        optional: true
    },
    objects: {
        type: [Object],
        label: "Ojects of multiple artworks",
        optional: true,
        custom: function() {
            return true;
        }
    },
    'objects.$.objname': {
        type: String,
        label: "Object name",
        max: 200
    },
    'objects.$.height': {
        type: Number,
        label: "Object's height",
        decimal: true
    },
    'objects.$.length': {
        type: Number,
        label: "Object's length",
        decimal: true
    },
    'objects.$.depth': {
        type: Number,
        label: "Object's depth",
        decimal: true
    }
});

Anagraphics.attachSchema(Schemas.User);
Artworks.attachSchema(Schemas.Artwork);

ArtworksValidationContext = Schemas.Artwork.namedContext("artworksContext");

/**
 * Useful method to validate the fields of a given object
 * one by one. This solves the problem of directly validating
 * an object against the whole schema using validate(obj).
 * As it relies on validateOne(), all validation context properties
 * and reactivity are preserved.
 * @param  {Object} obj - Object to validate
 * @param  {Object} context - Simple-Schema validation context
 * @param  {Object} options - Options to pass to mySchema.clean(obj)
 */
validateObj = function(obj, context, schema) {
    var options = {};
    for(var field in obj) {

        // By default, the clean() method removes empty strings from
        // the object to validate. As we are doing a one by one validation,
        // we don't want this to happen if the field to validate is a required
        // field, so that the validateOne() can invalidate such field.
        // On the contrary, if the field to validate is optional, we want
        // the clean() method to remove it from the object so that the validateOne()
        // would validate it (no value is an acceptable value).
        if($.inArray(field, schema.requiredSchemaKeys()) >= 0)
            options = {removeEmptyStrings: false};
        else
            options = {removeEmptyStrings: true};

        var fieldValuePair = {};
        fieldValuePair[field]  = obj[field];
        schema.clean(fieldValuePair, options);
        context.validateOne(fieldValuePair, field);
    }
};