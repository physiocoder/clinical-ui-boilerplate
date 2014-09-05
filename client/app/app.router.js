hideFooter = function() {
  return $('footer').addClass("hide");
};

function fadeContentIn(context) {
  console.log("In fadeContentIn()");
  //console.log("Template: " + Router.current().lookupTemplate());
  var templateName = context.lookupTemplate();
  var templateDiv = $('#' + templateName);

  console.log("TemplateName, templateDiv ->");
  console.log(templateName, templateDiv);

  templateDiv.addClass("animated fadeIn");

  templateDiv.on('webkitTransitionEnd', function() {
    console.log("On webkitTransitionEnd");
    var templateName = 'aboutPage';//Router.current().lookupTemplate();

    console.log("On webkitTransitionEnd - div:", $('#' + templateName));
    // remove animation classes to let the browser re-run the
    // animation in case the classes are reapplied later
    $('#' + templateName).removeClass("animated fadeIn");
  });
}

Router.configure({
  onBeforeAction: function(pause) {
    // see: https://github.com/EventedMind/iron-router/issues/554
    // see also: https://groups.google.com/forum/#!topic/meteor-talk/lK3v9ZxIbco
    // see also: http://stackoverflow.com/questions/23038436/iron-router-wait-on-collection-findone-as-data-object-before-render
    // see also: http://matthewfieger.com/posts/me/2014/06/14/loading-template-in-iron-router.html
    if (!this.ready()) {
        this.render('spinner');
        this.renderRegions();
        pause();
    }
  }
});

//--------------------------------------------------------------
// Accounts Entry Routes

Router.map(function() {
  this.route("entrySignUpRoute", {
    path: "/sign-up",
    template: "entrySignUpPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      Session.set('entryError', void 0);
      setPageTitle("Sign Up");
    }
  });
  this.route("entrySignInRoute", {
    path: "/sign-in",
    template: "entrySignInPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      Session.set('entryError', void 0);
      setPageTitle("Sign In");
    }
  });

  this.route("entryForgotPasswordRoute", {
    path: "/forgot-password",
    template: "entryForgotPassword",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Forgot Password");
      return Session.set('entryError', void 0);
    }
  });
  this.route('entrySignOutRoute', {
    path: '/sign-out',
    template: "entrySignOut",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
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
      Session.set('entryError', void 0);
      setPageTitle("Browser Not Supported");
    }
  });
  this.route("pageNotFoundRoute", {
    path: "/notfound",
    template: "notFoundPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      Session.set('entryError', void 0);
      setPageTitle("Not Found Page");
    }
  });
  this.route("loadingPageRoute", {
    path: "/loading",
    template: "loadingPage",
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
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
      console.log('routing to: /dashboard');
      setPageTitle("Welcome");
    }
  });
  this.route('eulaRoute', {
    path: '/eula',
    template: 'eulaPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("End User License Agreement");
    }
  });
  this.route('privacyRoute', {
    path: '/privacy',
    template: 'privacyPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Privacy Policy");
    }
  });
  this.route('glossaryRoute', {
    path: '/glossary',
    template: 'glossaryPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Glossary");
    }
  });
  this.route('aboutRoute', {
    path: '/about',
    template: 'aboutPage',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("About");
    },
    onAfterAction: function() {
      console.log("In onAfterAction");
      fadeContentIn(this);
    }
  });
  this.route('anagraphic', {
    path: '/anagraphic',
    template: 'anagraphic',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Anagraphic");
      Session.set('selectedUser','add');
      Session.set('anagraphicFormIsActive', false);
    },
    waitOn: function() {
      return Meteor.subscribe('users');
    }
  });
  this.route('artworks', {
    path: '/artworks',
    template: 'anagraphicArtwork',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Artworks");
    },
    waitOn: function() {
      return Meteor.subscribe('artworks', {fields: {title: 1, authors: 1}});
    }
  });
  this.route('artworksWizard', {
    path: '/artworks/:_id',
    template: 'anagraphicArtworkWizardContainer',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Artworks");

      if(this.ready()) {
        var _id;

        if(this.params._id === 'add')
          _id = undefined;
        else
          _id = this.params._id;

        Meteor.maWizard.init({collection: Artworks, id: _id, baseRoute: "artworks", template: this.route.options.template});
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('artworks', this.params._id), Meteor.subscribe('attachments')];
    },
    data: function() {
      if(this.ready())
        return Meteor.maWizard.getDataContext();
    }
  });
  this.route('exhibitions', {
    path: '/exhibitions',
    template: 'exhibitions',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Exhibitions");
    },
    waitOn: function() {
      return Meteor.subscribe('exhibitions');
    }
  });
  this.route('exhibitionsWizard', {
    path: '/exhibitions/:_id',
    template: 'exhibitionsWizardContainer',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Exhibitions");

      if(this.ready()) {
        var _id;
      
        if(this.params._id === 'add')
            _id = undefined;
          else
            _id = this.params._id;
console.log("In exhibitions wizard");
        Meteor.maWizard.init({collection: Exhibitions, id: _id, baseRoute: "exhibitions", template: this.route.options.template});
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('exhibitions', this.params._id), Meteor.subscribe('artworks', {fields: {title: 1, author: 1}})];
    },
    data: function() {
      if(this.ready())
        return Meteor.maWizard.getDataContext();
    }
  });
});