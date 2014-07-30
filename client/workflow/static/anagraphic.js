Template.anagraphic.usernames = function() {
  return Anagraphics.find().fetch();
};
/*
Template.anagraphic.rendered = function() {
  $('#submitBtn').on('click', function (event) {
    console.log("Submitting form");
    var name = $('#inputName').val();
    var surname = $('#inputSurname').val();
    var sex = $('.btn.active >').attr('value');
    if (name && surname && sex) {
      var user = {
        name: name,
        surname: surname,
        sex: sex
      };
      Meteor.subscribe('user', name);
      Users_data.insert(user);
      Session.set('username',name);
      Router.go('showData');
    }
    else {
      Router.go('anagraphic');
    }
  });
};
*/