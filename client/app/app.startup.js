Session.setDefault('resize', null);

Meteor.startup(function(){
  if(Meteor.userId()){

    Meteor.subscribe('schemas');
    Meteor.subscribe('artworks_taxonomies');

    removeWallpaper();
  }else{
    setWallpaper();
  }

  $(window).resize(function(evt) {
    Session.set("resize", new Date());
  });
});


setWallpaper = function(){
  console.log('setting wallpaper...');
  $('html').addClass('landscapeLogin');
};
removeWallpaper = function(){
  console.log('removing wallpaper...');
  $('html').removeClass('landscapeLogin');
};