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

Template.anagraphicArtworkList.events({
  'click a': function(evt, templ) {
    $('a.list-group-item').removeClass('active');
    evt.currentTarget.classList.add("active");
    var id = $('a.list-group-item.active').attr('value');
    Session.set('selectedArtworkId', id);
    Session.set('anagraphicArtworkFormIsActive', true);
  }
});