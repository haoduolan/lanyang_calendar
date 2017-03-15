angular.module('CalendarApp')
	.factory('factory', function factory($q, $http){
		'use strict';
		var exports = {};
		var calendars = {};
    var usersSymbol = Symbol("users");
    var tasksSymbol = Symbol("tasks");
    // Calendar is a class that has an {id: user} map and an {id: task} map.
    // it provides public getter function for both maps.
    function Calendar() {
    	this[usersSymbol] = {};
    	this[tasksSymbol] = {};
    };
    Object.defineProperty(Calendar.prototype, 'users', {
      get: function() { return this[usersSymbol]; },
    });
    Object.defineProperty(Calendar.prototype, 'tasks', {
      get: function() { return this[tasksSymbol]; }
    });

    // Initialize user map with given json file.
    // Returns a promise.
    Calendar.prototype.initUserList = function(json) {
			var deferred = $q.defer();
			var users = this[usersSymbol];
			$http.get(json)
				.success(function(data){
					var list = data.result;
          for(var i = 0; i < list.length; i++){
            var ob = {"name": list[i].name,
                      "sys_id": list[i].sys_id,
                      "task_hour": 0,
                      "meeting_hour": 0,
                      "task": []
                    };
            users[list[i].sys_id] = ob;
          }
					deferred.resolve(data);
				})
			.error(function(data){
				deferred.reject(data);
			})
			return deferred.promise;
    };

    // Initialize task map with given json file.
    // Shall be called after user map is initialized.
    // Returns a promise.
    Calendar.prototype.initTaskList = function(json) {
    	
			var deferred = $q.defer();
			var users = this[usersSymbol];
			var tasks = this[tasksSymbol];
			var cal = this;
			$http.get(json)
				.success(function(data){
					var list = data.result;
					for(var i = 0; i < list.length; i++){
			   		var ob = {
              "type": list[i].type,
              "title": list[i].type + ":  " + list[i].name,
              "user": list[i].user.value,
              "sys_id": list[i].sys_id,
              "start": moment(list[i].start_date_time, "YYYYMMDDThhmmss"),
              "end": moment(list[i].end_date_time, "YYYYMMDDThhmmss")
            };
            if(!cal.addTask(ob)) console.log("Init task list: failed to add task");
					}					
					deferred.resolve(data);
				})
			.error(function(data){
				deferred.reject(data);
			})
			return deferred.promise;
    };

    // Initialize the calendar with both user json and task json files.
    // Returns a promise.
    Calendar.prototype.init = function (userjson, taskjson) {
    	  var cal = this;
    	  var deferred = $q.defer();
				cal.initUserList(userjson)
					.then(function(){
						cal.initTaskList(taskjson)
							.then(function(){
								deferred.resolve();
							});
					});
				return deferred.promise;
    };

    // Checks if a user is busy during the given time frame.
    // If the user does not exist, or the time frame overlaps with lunch time, return false
		Calendar.prototype.isBusy = function(begin_time, end_time, user_id){
    	if(this.users[user_id] === undefined) return false;
      // Lunch time is between 12pm to 13pm each day.
    	if(begin_time.hours() < 13 && end_time.hours() > 12) return true;
      var list = this.users[user_id].task;
      for(var i = 0; i < list.length; i++){
        var task = this.tasks[list[i]];
        if(begin_time <= task.end && end_time >= task.start) return true;
      }
      return false;
    };

    // Add a new task to its corresponding user.
    // return true if added successfully, otherwise, return false.
    Calendar.prototype.addTask = function(task){
    	if(task.start.years() != task.end.years() || 
    		task.start.months() != task.end.months() || 
    		task.start.days() != task.end.days()) {
    		console.log("Invalid task: unsupported over-day tasks");
    		console.log(task);
    		return false;
    	}
    	if(task.end <= task.start) {
    		console.log("Invalid task: start should be before end");
    		console.log(task);
    		return false;
    	}
    	if(this.users[task.user] === undefined) {
    		console.log("Invalid task: user not found");
    		console.log(task);
    		return false;
    	}
    	if(this.isBusy(task.start, task.end, task.user)) {
    		console.log("Unable to add task: user is busy at the time");
    		console.log(task);
    		return false;
    	}
    	this[usersSymbol][task.user].task.push(task.sys_id);
    	this[tasksSymbol][task.sys_id] = task;
    	if(task.type == 'task') {
    		this[usersSymbol][task.user].task_hour += task.end.hours() - task.start.hours();
    	}
      else this[usersSymbol][task.user].meeting_hour += task.end.hours() - task.start.hours();
    	return true;
    }

    // Get or create a calendar instance in the factory with given name.
    exports.getCalendar = function(name) {
    	if (calendars[name] === undefined) {
    		calendars[name] = new Calendar();
    	}
    	return calendars[name];
    };
		return exports;
	})