Template.anagraphicArtworkList.artworks = function() {
  return Artworks.find({},{fields: {title: 1, authors: 1}}).fetch();
};

Template.anagraphicArtworkList.events({
  'click a': function(evt, templ) {
    var id = evt.currentTarget.getAttribute('value');
    Router.go('/artworks/' + id);
  }
});