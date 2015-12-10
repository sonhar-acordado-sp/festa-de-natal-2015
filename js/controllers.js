(function(angular){
    var app = angular.module('sonhar.controllers', []);

    app.controller('ContactFormCtrl', [
      '$scope', '$http', function($scope, $http) {
        $scope.contactFormData = {};
        $scope.submit = function(isValid) {
          if (isValid) {
            console.log($scope.contactFormData);
            $http.post('http://festasonharacordado.com.br/apiv1/contactemails/', $scope.contactFormData).success(function(data, status) {
              window.alert('Obrigado pelo seu email!');
              $('#contactForm')[0].reset();
            });
          }
          else {
            window.alert('Precisamos de seu Nome, Email, Assunto e Mensagem');
          }
        }
      }
    ]);

    app.controller('SubscriptionInfoCtrl', [
        '$scope', '$timeout', 'Volunteer', 'Subscription', 'pipe', 'cepcoder',
        function($scope, $timeout, Volunteer, Subscription, pipe, cepcoder){

            function debounce_watch(callback, timeout) {
                var timeout_id = null;
                return function(before, now) {
                    if(before !== now && now !== '') {
                        if(timeout_id) {
                            $timeout.cancel(timeout_id);
                        }
                        timeout_id = $timeout(function(){
                            callback(before, now);
                        }, timeout);
                    }
                };
            }

            $scope.errors = {};
            $scope.volunteer = pipe.volunteer || new Volunteer();

            /**
             * Find existing profile id
             */
            function recover_id(){
                var query = {'email': $scope.volunteer.email};
                Volunteer.query(query, function(results){
                    $scope.volunteer.id = results.length === 1 ? results[0].id : undefined;
                });
            }

            $scope.$watch('volunteer.email', debounce_watch(recover_id, 500));


            /**
             * Find address
             */
            function populate_address_from_cep() {
                cepcoder.code($scope.volunteer.cep).then(function(resp) {
                    var data = resp.data;
                    $scope.volunteer.address = data.logradouro || '';
                    $scope.volunteer.city = data.localidade || '';
                    $scope.volunteer.state = data.uf || '';
                });
            }

            $scope.$watch('volunteer.cep', debounce_watch(populate_address_from_cep, 500));

            $scope.save = function() {
                $scope.volunteer.save()
                    .then(function(){
                        pipe.volunteer = $scope.volunteer;
                        $timeout(function(){
                            document.location.hash = 'training';
                        }, 500);
                    })
                    ['catch'](function(response){
                        $scope.errors = response.data;
                    });
            };
        }
    ]);

    app.controller('SubscriptionTrainingCtrl', ['$scope', '$timeout', 'Training', 'Subscription', 'pipe',
        function($scope, $timeout, Training, Subscription, pipe) {
            $scope.pipe = pipe;

            $scope.$watch('pipe.volunteer', function(n, o){
                if(n && n.id) {
                    $scope.volunteer = pipe.volunteer;
                    $scope.subscription = new Subscription();
                    $scope.subscription.volunteer = $scope.volunteer.id;

                    Subscription.query({'volunteer': $scope.volunteer.id}, function(res) {
                        if(res.length > 0) {
                            $scope.subscription = res[0];
                        }
                    });

                    Training.query(function(list){
                        $scope.training_list = list;
                    });
                } else {
                    $scope.volunteer = null;
                    $scope.subscription = null;
                }
            });

            $scope.save = function() {
                $scope.subscription.save().then(function(){
                    pipe.subscription = $scope.subscription;
                    $timeout(function(){
                        document.location.hash = 'contribution';
                    }, 500);
                });
            };
        }
    ]);

    app.controller('SubscriptionPaymentCtrl', ['$scope', '$timeout', 'PaymentFormData', 'pipe',
        function($scope, $timeout, PaymentFormData, pipe) {
            $scope.pipe = pipe;

            $scope.$watch('pipe.subscription', function(n, o){
                if(n && n.id) {
                    $scope.subscription = pipe.subscription;
                    $scope.form_data = PaymentFormData.get({
                        'subscription_id': $scope.subscription.id
                    });
                } else {
                    $scope.subscription = null;
                    $scope.form_data = null;
                }
            });

            $scope.save = function() {
                $scope.subscription.save().then(function(){
                    pipe.subscription = $scope.subscription;
                    $timeout(function(){
                        document.location.hash = 'thankyou';
                    }, 500);
                });
            };
        }
    ]);

})(angular);
