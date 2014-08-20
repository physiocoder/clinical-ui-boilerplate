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

Schemas.ArtworkEssentials = new SimpleSchema({
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
    'objects.$.id': {
        type: Number,
        label: "Object ID",
        max: 999
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
    },
    attachments: {
        type: [Object],
        label: "Attachments",
        optional: true
    },
    'attachments.$.id': {
        type: String,
        label: "Attachment ID"
    },
    'attachments.$.type': {
        type: String,
        label: "Attachment type"
    },
    'attachments.$.description': {
        type: String,
        label: "Attachment description",
        optional: true
    }
});

Schemas.Accessories = new SimpleSchema({
    frame: {
        type: Boolean,
        label: "Frame - accessory",
    },
    mount: {
        type: Boolean,
        label: "Mount - accessory",
    },
    base: {
        type: Boolean,
        label: "Base - accessory",
    },
    manuals: {
        type: Boolean,
        label: "Manuals - accessory",
    },
    covers: {
        type: Boolean,
        label: "Covers - accessory",
    },
    "case": {
        type: Boolean,
        label: "Case - accessory",
    },
    belts: {
        type: Boolean,
        label: "Belts - accessory",
    }
});

Schemas.Artwork = new SimpleSchema([Schemas.ArtworkEssentials, Schemas.Accessories]);

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
 * @param  {Object} options - Options to pass to mySchema.clean(obj, options)
 */
validateObj = function(obj, context, schema) {
    for(var field in obj) {

        var fieldValuePair = {};

        // Internally, Simple Schema treats arrays with a Mongo-style notation.
        // To use the validateOne() with arrays, we should then validate each 
        // element of the array passing the various fields one by one with
        // Mongo-style notation
        if(obj[field] instanceof Array) {
            var l = field.length;
            for(var i = 0; i < l; i++) {
                for(var internalField in obj[field][i]) {
                    fieldValuePair = {};
                    fieldValuePair[field + ".$." + internalField]  = obj[field][i][internalField];
                    validateField(fieldValuePair, context, schema);
                }
            }
        }
        else {
            fieldValuePair = {};
            fieldValuePair[field]  = obj[field];
            validateField(fieldValuePair, context, schema);
        }
    }
};

/**
 * Used by validateObj()
 * @param  {Object} fieldValuePair - Name and value of field to validate
 * @param  {Object} context - Simple-Schema validation context
 * @param  {Object} options - Options to pass to mySchema.clean(fieldValuePair, options)
 */
var validateField = function(fieldValuePair, context, schema) {
    var options = {};
    var fieldName = Object.keys(fieldValuePair)[0];

    // By default, the clean() method removes empty strings from
    // the object to validate. As we are doing a one by one validation,
    // we don't want this to happen if the field to validate is a required
    // field, so that the validateOne() can invalidate such field.
    // On the contrary, if the field to validate is optional, we want
    // the clean() method to remove it from the object so that the validateOne()
    // would validate it (no value is an acceptable value).
    if($.inArray(fieldName, schema.requiredSchemaKeys()) >= 0)
        options = {removeEmptyStrings: false};
    else
        options = {removeEmptyStrings: true};

    
    schema.clean(fieldValuePair, options);
    context.validateOne(fieldValuePair, fieldName);
};

Attachments = new FS.Collection("attachments", {
    filter: {
            maxSize: 1048576, //in bytes
            allow: {
                contentTypes: ['image/*'],
                extensions: ['png', 'jpg', 'jpeg']
            },
            deny: {
                contentTypes: ['audio/*', 'video/*'],
                extensions: ['pdf']
            },
            onInvalid: function (message) {
                if (Meteor.isClient) {
                    bootbox.alert(message);
                } else {
                    console.log(message);
                }
            }
        },
    // .autoOrient() read EXIF info and rotate image accordingly
    stores: [
        new FS.Store.FileSystem("attachments", {
            path: "~/repo/clinical-ui-boilerplate/memorart_uploads/attachments/raw"/*,
            transformWrite: function(fileObj, readStream, writeStream) {
                        // Rotate image according to EXIF info and scale to 1000px longest side
                        gm(readStream, fileObj.name()).autoOrient().resize('1200', '1200').quality(80).stream().pipe(writeStream);
                    }*/
        }),
        new FS.Store.FileSystem("atcs_thumbs", {
            path: "~/repo/clinical-ui-boilerplate/memorart_uploads/attachments/thumbs",
            transformWrite: function(fileObj, readStream, writeStream) {
                        // Rotate image according to EXIF info and transform into a 200px thumbnail
                        gm(readStream, fileObj.name()).autoOrient().resize('200', '200').stream().pipe(writeStream);
                    }
        })
    ]
});