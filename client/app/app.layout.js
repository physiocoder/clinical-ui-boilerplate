//--------------------------------------------------------------
// Layout Resizing

UI.body.resized = function(){

  $('#westPanel').sidebar();
  $('#eastPanel')
    .sidebar({overlay: false});

  $('#errorPanel').sidebar();
  $('#contextPanel').sidebar();

  return Session.get('resize');
};

//--------------------------------------------------------------
// Template.errorPanel

Template.errorPanel.getErrorMessage = function(){
  return "Error Message!";
};

//--------------------------------------------------------------
// Routing Layouts

Router.configure({
  layoutTemplate: 'appLayout',
  notFoundTemplate: 'notFoundPage'
});
Router.onBeforeAction(function() {
  if (!Meteor.loggingIn() && !Meteor.user()) {
    this.redirect('/sign-in');
  }
}, {
  except: [
    'landingRoute',
    'entrySignUpRoute',
    'entrySignInRoute',
    'eulaRoute',
    'privacyRoute',
    'aboutRoute',
    'glossaryRoute',
    'browserNotSupportedRoute',
    'pageNotFoundRoute',
    'entryForgotPasswordRoute',
    'entrySignOutRoute',
    'entryResetPasswordRoute'
  ]
});
Router.onBeforeAction(function() {
  if(!bowser.webkit){
    this.render('browserNotSupportedPage');
    this.pause();
  }
});

//--------------------------------------------------------------
// Routing Layout Helper Functions

setPageTitle = function(newTitle) {
  document.title = newTitle;
};
checkBrowserIsSupported = function(scope) {
  console.log('checkBrowserIsSupported');
  if(!bowser.webkit){
    scope.render('browserNotSupportedPage');
    scope.pause();
  }
};

checkUserHasEmployer = function(scope) {
  console.log('checkUserHasEmployer');
  if (Meteor.user()) {
    if (!Meteor.user().profile.employer_id) {
      scope.render("noEmployerSetPageErrorPage");

      scope.render("navbarHeader", {to: 'header'});
      //scope.render("sidebarTemplate",{to: 'aside'});
      scope.pause();
    } else {
      scope.render("navbarHeader", {to: 'header'});
      //scope.render("sidebarTemplate",{to: 'aside'});
      scope.pause();
    }
  }
};

getYieldTemplates = function() {
  if (Meteor.userId()) {
    return {
      'navbarHeader': {
        to: 'header'
      },
      'navbarFooter': {
        to: 'footer'
      }
      //'sidebarTemplate': {to: 'aside'}
    };
  } else {
    return {
      'navbarHeader': {
        to: 'header'
      },
      'navbarFooter': {
        to: 'footer'
      }

      //'sidebarTemplate': {to: 'aside'}
    };
    //return {};
  }
};
