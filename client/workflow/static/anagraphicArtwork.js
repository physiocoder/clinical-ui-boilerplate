Template.anagraphicArtworkForm.contextArtwork = function() {
	var contextObj;

  if(Session.get('selectedArtworkId') === 'add') {
    contextObj = {
      inventory: "",
      title: "",
      authors: "",
      description: "",
      dating: "",
      type: "",
      material: "",
      technique: "",
      accessories: [],
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
      objects: [],
      isAdding: true  // not in database
    };
  }
  else {
    var artwork = Artworks.findOne({_id: Session.get('selectedArtworkId')});
    if(artwork !== undefined)
      contextObj = {
        inventory: artwork.inventory,
        title: artwork.title,
        authors: artwork.authors,
        description: artwork.description,
        dating: artwork.dating,
        type: artwork.type,
        material: artwork.material,
        technique: artwork.technique,
        accessories: artwork.accessories,
        site: artwork.site,
        city: artwork.city,
        UVP: artwork.UVP,
        RH: artwork.RH,
        temperature: artwork.temperature,
        lux: artwork.lux,
        AMO: artwork.AMO,
        height: artwork.height,
        length: artwork.length,
        depth: artwork.depth,
        multiple: artwork.multiple,
        objects: artwork.objects,
        isAdding: false // not in database
      };
  }

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