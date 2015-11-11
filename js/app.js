(function(angular){
    var app = angular.module('sonhar', [
        'sonhar.controllers',
        'sonhar.models'
    ]);

    app.config(function setup($httpProvider, $resourceProvider, $sceDelegateProvider) {
        //setup django
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $resourceProvider.defaults.stripTrailingSlashes = false;

        $sceDelegateProvider.resourceUrlWhitelist([
            /^https?:\/\/(www\.)?youtube\.com\/.*/,
            /^https?:\/\/(www\.)?(sandbox\.)?paypal\.com\/.*/,
            /^https?:\/\/(www\.)?bcash\.com\.br\/.*/,
            /^https?:\/\/(\w+\.)+akamai\.net\/.*/,
            'self',
        ]);
    });

    window.addEventListener('load', function(evt){
        angular.bootstrap(document.documentElement, ['sonhar']);
    });
})(angular);