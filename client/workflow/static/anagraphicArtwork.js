Template.anagraphicArtworkForm.contextArtwork = function() {
	var contextObj;

  if(Session.get('selectedArtworkId') === 'add') {
    contextObj = {
      inventory: "",
      title: "",
      authors: "",
      description: "",
      dating: "",
      isAdding: true
    };
  }
  else {
    var artwork = Artworks.findOne({_id: Session.get('selectedArtworkId')});
    contextObj = {
      inventory: artwork.inventory,
      title: artwork.title,
      authors: artwork.authors,
      description: artwork.description,
      dating: artwork.dating,
      isAdding: false
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