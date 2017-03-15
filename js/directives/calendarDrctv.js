angular.module('CalendarApp')
	.directive('calendar', function calendarDrctv(){
		'use strict';
		return {
			restrict: 'E',
			templateUrl: 'js/directives/calendar.tmpl.html',
			controllerAs: 'calendar',
			controller: function($scope, factory, uiCalendarConfig) {
			// Configuration for ui-calendar directive.
			  $scope.uiConfig = {
      		  calendar:{
      		  defaultDate: '2017-03-06',
      		  defaultView: 'agendaWeek',
      		  allDaySlot: false,
      		  weekends: false,
      		  scrollTime: '08:00:00',
      		  businessHours: {
      				dow: [1, 2, 3, 4, 5],
      				start: '8:00',
      				end: '17:00',
      		  },
       		  height: 500,
       		  editable: false,
       		  header:{
       		    left: '',
							center: 'title',
         		  right: 'today prev,next'
       		  }
      	  }
    		};
	    	$scope.curUser = '';  // Currently selected user name.
				$scope.eventSources = [];  // Event data for ui-calendar.
				$scope.userArr = [];  // Plain array of users.
				$scope.availableUserArr = [];  // Users available for the given repeating task.
				var calendar = factory.getCalendar('main');

				// Initialize the calendar and create userList/taskList
				calendar.init('json/users.json', 'json/resource_event.json')
					.then(function(){
						$scope.userList = calendar.users;
						$scope.taskList = calendar.tasks;
						$scope.userTasks = [];
						$scope.updateUserArr();
						$scope.curUser = $scope.userArr[0].name;
						for(var key in $scope.userList){
							if($scope.userList.hasOwnProperty(key)){
								var list = $scope.userList[key].task;
								var arr = [];
								for(var i = 0; i < list.length; i++) {
									arr.push($scope.taskList[list[i]]);
								}
								$scope.userTasks.push(arr);
							}
						}
						$scope.eventSources.push($scope.userTasks[0]);
						$scope.scheduleRepTask();
					});

				// Function to update the user array with userList.
				$scope.updateUserArr = function(){
					$scope.userArr = [];
					for(var key in $scope.userList){
						if($scope.userList.hasOwnProperty(key)){
							$scope.userArr.push($scope.userList[key]);
						}
					}
				}

				// Function to switch to different user
				$scope.swichUser = function(index){
					$scope.eventSources.pop();
					$scope.eventSources.push($scope.userTasks[index]);
					$scope.curUser = $scope.userArr[index].name;
				}

				// Function to get users available for the given repeating task
				$scope.scheduleRepTask = function(){
					$scope.availableUserArr = [];
					for(var i = 0; i < $scope.userArr.length; i++){
						var user = $scope.userArr[i];
						var thisUser = true;
						for(var day = 0; day < 5; day++){
							var ok = false;
							for(var hour = 0; hour < 4; hour++){
								let startMoment = moment("20170306T080000", "YYYYMMDDThhmmss");
								let s = startMoment.add(day, 'days').add(hour, "hours");
								let e = s.add(1, 'hours');
								if(!calendar.isBusy(s, e, user.sys_id)) {
									ok = true;
									break;
								}
							}
							if(!ok) {
								thisUser = false;
								break;
							}
						}
						if(thisUser) $scope.availableUserArr.push(user); 
					}
				}
			}
		}
	})