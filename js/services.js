(function(angular){
    var SERVER = 'http://festasonharacordado.com.br';

    var app = angular.module('sonhar.models', [
        'ngResource'
    ]);

    app.service('cepcoder', ['$q', '$http', function($q, $http){
        this.code = function(cep) {
            cep = (cep || '').replace(/[^\d]/g, '');

            if(cep.match(/^\d{8,8}$/)){
                return $http.get('http://cep.correiocontrol.com.br/'+cep+'.json');
            }

            var deferred = $q.defer();
            deferred.reject('Formato inválido para cep');
            return deferred.promise;
        };
    }]);

    app.factory('pipe', [
        function(){
            return {};
        }
    ]);

    function drf_resource_setup(url) {
        return function($resource){
            var Entity = $resource(SERVER + url, {'id': '@id'}, {'update': {'method': 'PUT'}});

            Entity.prototype.save = function() {
                return this.id ? this.$update() : this.$save();
            };

            return Entity;
        };
    }

    app.factory('Subscription', ['$resource', drf_resource_setup('/apiv1/subscriptions/:id/')]);
    app.factory('Volunteer', ['$resource', drf_resource_setup('/apiv1/volunteers/:id/')]);
    app.factory('Training', ['$resource', drf_resource_setup('/apiv1/trainings/:id/')]);

    app.factory('PaymentFormData', function($resource){
        return $resource(SERVER + '/apiv1/paymentform/:subscription_id', {'subscription_id': '@subscription_id'});
    });

})(angular);
