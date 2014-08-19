Template.anagraphicArtworkForm.contextArtwork = function() {
	var contextObj;
  var id = Session.get('selectedArtworkId');
  
  try {
    // first time this is executed, 'currentArtwork' doesn't
    // exist so an exception is thrown.
    var current = Session.get('currentArtwork');

    if(current._id === id)
      contextObj = current;
    else
      contextObj = getContextFromDatabase(id);
  }
  catch(e) {
    if(id === 'add') {
      contextObj = {
        _id: id,
        inventory: "",
        title: "",
        authors: "",
        description: "",
        dating: "",
        type: "",
        material: "",
        technique: "",
        frame: false,
        mount: false,
        base: false,
        manuals: false,
        covers: false,
        "case": false,
        belts: false,
        site: "",
        city: "",
        UVP: "",
        RH: "",
        temperature: "",
        lux: "",
        AMO: "",
        height: "",
        length: "",
        depth: "",
        multiple: false,
        objects: []
      };
    }
    else {
      contextObj = getContextFromDatabase(id);
    }
  }

  Session.set('currentArtwork', contextObj);

  return contextObj;
};

Template.anagraphicArtwork.formShouldBeVisible = function() {
  return Session.get('anagraphicArtworkFormIsActive');
};

Template.anagraphicArtworkList.artworks = function() {
  return Artworks.find({},{fields: {title: 1, authors: 1}}).fetch();
};

Template.anagraphicArtworkListItem.itemIsActive = function(_id) {
  // if the session variable has not been set yet, just return ""
  try {
    var current = Session.get("selectedArtworkId");
    var formIsVisible = Session.get("anagraphicArtworkFormIsActive");
    if(current !== undefined && _id === current && formIsVisible)
      return "active";
    else
      return "";
  } catch(e) {
    return "";
  }
};

Template.anagraphicArtworkList.events({
  'click a': function(evt, templ) {
    var id = evt.currentTarget.getAttribute('value');
    Session.set('selectedArtworkId', id);
    Session.set('anagraphicArtworkFormIsActive', true);
  }
});

function getContextFromDatabase(id) {
  return Artworks.findOne({_id: Session.get('selectedArtworkId')});
}