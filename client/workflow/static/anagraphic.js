Template.anagraphic.formShouldBeVisible = function() {
  return Session.get('anagraphicFormIsActive');
};

Template.anagraphicList.usernames = function() {
  return Anagraphics.find({},{fields: {name: 1, surname: 1}}).fetch();
};

Template.anagraphicForm.destroyed = function() {
  //debugger;
};

Template.anagraphicForm.actionContext = function() {
  var contextObj;

  if(Session.get('selectedUser') === 'add') {
    contextObj = {
      name: "",
      surname: "",
      sex: "m",
      isAdding: true
    };
  }
  else {
    var user = Anagraphics.findOne({_id: Session.get('selectedUser')});
    contextObj = {
      name: user.name,
      surname: user.surname,
      sex: user.sex,
      isAdding: false
    };
  }

  return contextObj;
};

Template.anagraphicForm.activeIfUserIs = function(sex) {
  if(sex === this.sex)
    return "active";
  else
    return "";
};

Template.anagraphicList.events({
  'click a': function(evt, templ) {
    $('a.list-group-item').removeClass('active');
    evt.currentTarget.classList.add("active");
    var id = $('a.list-group-item.active').attr('value');
    Session.set('selectedUser', id);
    Session.set('anagraphicFormIsActive', true);
  }
});

function getAnagraphicFormData() {
  var sexValue;

  if($('#maleLabel').hasClass('active'))
    sexValue = 'm';
  else
    sexValue = 'f';

  var data = {
    name: $('#inputName').val(),
    surname: $('#inputSurname').val(),
    sex: sexValue
  };

  return data;
}

function removeForm() {
  Session.set('anagraphicFormIsActive', false);
  $('a.list-group-item').removeClass('active');
}

Template.anagraphicForm.events({
  'click #submitAdd': function() {
    // inserisce l'utente nel database
    Anagraphics.insert(getAnagraphicFormData());
    // nasconde il form
    removeForm();
  },
  'click #submitUpdate': function() {
    Anagraphics.update(Session.get('selectedUser'),getAnagraphicFormData());
    // nasconde il form
    removeForm();
  }
});