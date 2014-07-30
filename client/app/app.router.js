hideFooter = function() {
  return $('footer').addClass("hide");
};

/**
 * Set an element as invisible but still taking space in the page
 * (present in the DOM Tree)
 * @param  {string} selector - Any valid css selector
 */
hideElement = function (selector) {
  $(selector).css('visibility', 'hidden');
};

animateContentOut = function() {
  hideFooter();
  hideElement('#templateWrapper');
};

//--------------------------------------------------------------
// Accounts Entry Routes

Router.map(function() {
  this.route("entrySignUpRoute", {
    path: "/sign-up",
    template: "entrySignUpPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Sign Up");
    }
  });
  this.route("entrySignInRoute", {
    path: "/sign-in",
    template: "entrySignInPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Sign In");
    }
  });

  this.route("entryForgotPasswordRoute", {
    path: "/forgot-password",
    template: "entryForgotPassword",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("Forgot Password");
      return Session.set('entryError', void 0);
    }
  });
  this.route('entrySignOutRoute', {
    path: '/sign-out',
    template: "entrySignOut",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      Meteor.logout();
      Router.go('/');
    }
  });
  this.route('entryResetPasswordRoute', {
    path: 'reset-password/:resetToken',
    template: "entryResetPassword",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Reset Password");
      return Session.set('resetToken', this.params.resetToken);
    }
  });
});


//--------------------------------------------------------------
// Error Routes

Router.map(function() {
  this.route("browserNotSupportedRoute", {
    path: "/notsupported",
    template: "browserNotSupportedPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Browser Not Supported");
    }
  });
  this.route("pageNotFoundRoute", {
    path: "/notfound",
    template: "notFoundPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Not Found Page");
    }
  });
  this.route("loadingPageRoute", {
    path: "/loading",
    template: "loadingPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      Session.set('entryError', void 0);
      setPageTitle("Loading");
    }
  });

});

//--------------------------------------------------------------
// Routes

renderHomePage = function(scope){
  if (Meteor.userId()) {
    scope.render("homePage");
    scope.render("navbarHeader", {to: 'header'});
    //scope.render("sidebarTemplate",{to: 'aside'});
  }else{
    scope.render("landingPage");
    scope.render("navbarHeader", {to: 'header'});
    //scope.render("sidebarTemplate",{to: 'aside'});
  }
};

Router.map(function() {
  this.route('landingRoute', {
    path: '/',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      console.log('routing to: /');
    },
    onAfterAction: function(){
      renderHomePage(this);
      setPageTitle("Landing Page");
    }
  });

  this.route('dashboardRoute', {
    path: '/dashboard',
    template: "homePage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      console.log('routing to: /dashboard');
      setPageTitle("Welcome");
    }
  });
  this.route('eulaRoute', {
    path: '/eula',
    template: 'eulaPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("End User License Agreement");
    }
  });
  this.route('privacyRoute', {
    path: '/privacy',
    template: 'privacyPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("Privacy Policy");
    }
  });
  this.route('glossaryRoute', {
    path: '/glossary',
    template: 'glossaryPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("Glossary");
    }
  });
  this.route('aboutRoute', {
    path: '/about',
    template: 'aboutPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("About");
    }
  });
  this.route('anagraphic', {
    path: '/anagraphic',
    template: 'anagraphic',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      animateContentOut();
      setPageTitle("Anagraphic");
      Session.set('selectedUser','add');
    },
    waitOn: function() {
      return Meteor.subscribe('users');
    }
  });
});
