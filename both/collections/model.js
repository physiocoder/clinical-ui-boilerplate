Anagraphics = new Meteor.Collection('anagraphics');
Artworks = new Meteor.Collection('artworks');
Exhibitions = new Meteor.Collection('exhibitions');

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
        type: [String],
        label: "Material",
        optional: true
    },
    technique: {
        type: [String],
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
        decimal: true,
        label: "Height",
        min: 1,
        optional: true
    },
    length: {
        type: Number,
        decimal: true,
        label: "Length",
        min: 1,
        optional: true
    },
    depth: {
        type: Number,
        decimal: true,
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

var localStore = [
        new FS.Store.FileSystem("attachments", {
            path: "~/repo/clinical-ui-boilerplate/memorart_uploads/attachments/raw",
            transformWrite: function(fileObj, readStream, writeStream) {
                if(fileObj.isImage()) {
                    // Rotate image according to EXIF info and scale to 1000px longest side
                    gm(readStream, fileObj.name()).autoOrient().resize('1200', '1200').quality(80).stream().pipe(writeStream);
                } // does nothing, just links read-write streams
                else readStream.pipe(writeStream);
            }
        }),
        new FS.Store.FileSystem("atcs_thumbs", {
            beforeWrite: function(fileObj) {
              // in transformWrite() we convert the file, so here we set
              // the right metadata to store in the database
              return {
                extension: 'png',
                type: 'image/png'
              };
            }, // the path should be got from a variable, not hardcoded
            path: "~/repo/clinical-ui-boilerplate/memorart_uploads/attachments/thumbs",
            transformWrite: function(fileObj, readStream, writeStream) {
                // Rotate image according to EXIF info, transform into a 200px thumbnail and convert to png.
                // Second parameter of gm() is the filename for which an array notation is used to get always the
                // first frame (the first page for a pdf, the image itself for an image)
                gm(readStream, fileObj.name() + "[0]")
                    .autoOrient()
                    .resize('200', '200')
                    .stream('png')
                    .pipe(writeStream);
            }
        })
    ];


var s3Store = [
  new FS.Store.S3("attachments_cloud", {
    folder: "/artwork_img/fullsize",
    // region: "eu-west-1", //optional in most cases
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID, //required if environment variables are not set
    // secretAccessKey: process.AWS_SECRET_ACCESS_KEY, //required if environment variables are not set
    bucket: "mastorage", //required
    // ACL: myValue //optional, default is 'private', but you can allow public or secure access routed through your app URL
    // The rest are generic store options supported by all storage adapters
    transformWrite: function(fileObj, readStream, writeStream) {
        if(fileObj.isImage()) {
            // Rotate image according to EXIF info and scale to 1000px longest
            // side
            gm(readStream, fileObj.name()).autoOrient().resize('1200', '1200').quality(80).stream().pipe(writeStream);
        } // does nothing, just links read-write streams
        else readStream.pipe(writeStream);
    },
    maxTries: 1 //optional, default 5
  }),
  new FS.Store.S3("medium", {
    folder: "/artwork_img/medium",
    // region: "eu-west-1", //optional in most cases
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID, //required if environment variables are not set
    // secretAccessKey: process.AWS_SECRET_ACCESS_KEY, //required if environment variables are not set
    bucket: "mastorage", //required
    transformWrite: function(fileObj, readStream, writeStream) {
        if(fileObj.isImage()) {
            // Rotate image according to EXIF info and scale to 1200px longest side
            gm(readStream, fileObj.name()).autoOrient().resize('1200', '1200').quality(50).stream().pipe(writeStream);
        } // does nothing, just links read-write streams
        else readStream.pipe(writeStream);
    },
    maxTries: 1 //optional, default 5
  }),
  new FS.Store.S3("atcs_thumbs_cloud", {
    folder: "/artwork_img/thumbs",
    // region: "eu-west-1", //optional in most cases
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID, //required if environment variables are not set
    // secretAccessKey: process.AWS_SECRET_ACCESS_KEY, //required if environment variables are not set
    bucket: "mastorage", //required
    beforeWrite: function(fileObj) {
      // in transformWrite() we convert the file, so here we set
      // the right metadata to store in the database
      return {
        extension: 'png',
        type: 'image/png'
      };
    },
    transformWrite: function(fileObj, readStream, writeStream) {
        // Rotate image according to EXIF info, transform into a 200px thumbnail and convert to png.
        // Second parameter of gm() is the filename for which an array notation is used to get always the
        // first frame (the first page for a pdf, the image itself for an image)
        gm(readStream, fileObj.name() + "[0]")
            .autoOrient()
            .resize('200', '200')
            .stream('png')
            .pipe(writeStream);
    },
    maxTries: 1 //optional, default 5
  })
];

Attachments = new FS.Collection("attachments", {
    filter: {  // note: the filter option should be passed on the server
            maxSize: 20485760, //in bytes
            allow: {
                // it would be better to check for contentTypes
                extensions: ['png', 'jpg', 'jpeg', 'pdf']
            },
            onInvalid: function (message) {
                if (Meteor.isClient) {
                    bootbox.alert(message);
                } else {
                    console.log(message);
                }
            }
        },
    stores: s3Store
});

Schemas.Exhibitions = new SimpleSchema({
    name: {
        type: String,
        label: "Exhibition name",
    },
    organizer: {
        type: String,
        label: "Exhibition organizer"
    },
    venue: {
        type: String,
        label: "Venue"
    },
    date: {
        type: String,
        label: "Earliest and latest date"
    }
});

Exhibitions.attachSchema(Schemas.Exhibitions);