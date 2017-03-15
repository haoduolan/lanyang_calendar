var app = angular.module('CalendarApp', ['ngRoute', 'ui.calendar']);
app.config(function($routeProvider){
  $routeProvider
    .when('/calendar', {
      templateUrl: 'views/calendar.html',
      controller: 'calendarCtrl'
      })
    .otherwise({
       redirectTo: "/calendar"
    })
})