angular.module('CalendarApp')
.controller('controller', ["$scope", "$q", "$http",
	function controller($scope, factory) {
		'use strict';
		$scope.show = false;
		$scope.showText = "Show Unit Tests";
		$scope.runTest = function(){
			if($scope.show){
				$scope.show = false;
				$scope.showText = "Show Unit Tests";
			}
			else{
				$scope.show = true;
				$scope.showText = "Hide Unit Tests";
			}
		}
	}]);