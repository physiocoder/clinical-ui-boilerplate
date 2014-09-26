// this is used in wizards' routes
Meteor.subscribe('schemas');

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

        maWizard.init({
          collection: Artworks,
          id: _id,
          baseRoute: "artworks",
          template: this.route.options.template
        });
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('artworks', this.params._id), Meteor.subscribe('attachments')];
    },
    data: function() {
      if(this.ready())
        return maWizard.getDataContext();
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
          
        maWizard.init({
          collection: Exhibitions,
          id: _id,
          baseRoute: "exhibitions",
          template: this.route.options.template
        });
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('exhibitions', this.params._id), Meteor.subscribe('artworks', {fields: {title: 1, authors: 1}})];
    },
    data: function() {
      if(this.ready())
        return maWizard.getDataContext();
    }
  });
  this.route('UI', {
    path: '/settings/UI',
    template: 'UISettings',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("UI settings");
    },
    waitOn: function() {
      return Meteor.subscribe('schemas', {fields: {definition: 1}});
    }
  });
  this.route('schemaUI', {
    path: '/settings/UI/schema_:_id',
    template: 'schemaUIContainer',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Schemas UI");

      if(this.ready()) {
        var _id = this.params._id;
          
        maWizard.init({
          collection: Schemas,
          id: _id,
          baseRoute: "/settings/UI",
          template: this.route.options.template
        });
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('schemas', this.params._id)];
    },
    data: function() {
      if(this.ready())
        return maWizard.getDataContext();
    }
  });
  this.route('taxonomy', {
    path: '/settings/taxonomy',
    template: 'taxonomySettings',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Taxonomy settings");
    },
    waitOn: function() {
      return Meteor.subscribe('schemas', {fields: {definition: 1}});
    }
  });
  this.route('schemaTaxonomy', {
    path: '/settings/taxonomy/schema_:_id',
    template: 'schemaTaxonomyContainer',
    yieldTemplates: getYieldTemplates(),
    onBeforeAction: function() {
      setPageTitle("Schemas taxonomy");

      if(this.ready()) {
        var _id = this.params._id;

        maWizard.init({
          collection: ArtworksTaxonomies,
          id: ArtworksTaxonomies.find().fetch()[0]._id,
          baseRoute: "/settings/taxonomy/",
          template: this.route.options.template
        });
      }

    },
    waitOn: function() {
      return [Meteor.subscribe('artworks_taxonomies')];
    },
    data: function() {
      if(this.ready())
        return maWizard.getDataContext();
    }
  });
  this.route('collections', {
      path: '/collections',
      template: 'collections',
      // yieldTemplates: getYieldTemplates(),
      onBeforeAction: function() {
        setPageTitle("Collections List");
      },
      waitOn: function() {
        return [Meteor.subscribe('collections'), Meteor.subscribe('artworks')];
      },
      data: function() {
        return Collections.find().fetch();
      }
    });

    this.route('collectionsWizardDialog', {
      path: '/collections/edit/:_id',
      template: 'modal',
      // yieldTemplates: getYieldTemplates(),
      onBeforeAction: function() {
        if(this.ready()) {
          var _id;
        
          setPageTitle("Collection: " + this.name);

          if(this.params._id === 'add')
              _id = undefined;
            else
              _id = this.params._id;
            
          maWizard.init({
            collection: Collections,
            isModal: true,
            id: _id,
            baseRoute: "collections",
            template: this.route.options.template
          });
        }
      },
      waitOn: function() {
        return [Meteor.subscribe('collections'), Meteor.subscribe('artworks')];
      },
      data: function() {
        return Collections.find().fetch();
      }
    });

    this.route('collectionsWizard', {
      path: '/collections/:_id',
      template: 'collectionsWizardContainer',
      // yieldTemplates: getYieldTemplates(),
      onBeforeAction: function() {

        if(this.ready()) {
          var _id;
        
          setPageTitle("Collection: " + this.name);

          if(this.params._id === 'add')
              _id = undefined;
            else
              _id = this.params._id;
            
          maWizard.init({collection: Collections, id: _id, baseRoute: "collections", template: this.route.options.template});
        }

      },
      waitOn: function() {
        return [Meteor.subscribe('collections', this.params._id), Meteor.subscribe('artworks')];
      },
      data: function() {
        if(this.ready())
          return maWizard.getDataContext();
      }
    });
});