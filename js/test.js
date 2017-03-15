var injector = angular.injector(['CalendarApp']);

injector.invoke(function(factory) {
	QUnit.test("Init User List Test", function(assert){
		var done = assert.async();
		var calendar = factory.getCalendar("Init User List Test");
		calendar.initUserList("json/users.json").then(function() {
			assert.ok(calendar.users["44513c5ddb19320049a1dfea5e9619e5"] !== undefined, "User list created!");
			done();
		});
	});
	QUnit.test("Init Function Test", function(assert){
		var done = assert.async();
		var calendar = factory.getCalendar("Init Function Test");
		calendar.init("json/users.json", "json/resource_event.json").then(function(){
			var taskList = calendar.tasks;
			var userList = calendar.users;
			assert.ok(taskList["00e0019ddb19320049a1dfea5e96196b"], "Init task list successfully.");
			assert.ok(userList["44513c5ddb19320049a1dfea5e9619e5"] !== undefined, "Init user list successfully.");
			done();
		})
	})
	QUnit.test("Test isBusy Function", function(assert){
		var calendar = factory.getCalendar("Test isBusy function");
		var done = assert.async();
		calendar.init("json/users.json", "json/resource_event.json").then(function() {
			var beginTime = moment("20170309T090000", "YYYYMMDDThhmmss");
			var endTime = moment("20170309T100000", "YYYYMMDDThhmmss");
			var curTime = moment(new Date());
			var user_id = "44513c5ddb19320049a1dfea5e9619e5"
			assert.ok(calendar.isBusy(curTime, curTime, '1234') == false, "Get false because user dose not exist.");
			assert.ok(calendar.isBusy(curTime, curTime, '26d1f8d9db19320049a1dfea5e961915') == false, "User is not busy at this time.");
			assert.ok(calendar.isBusy(beginTime, endTime, "44513c5ddb19320049a1dfea5e9619e5") == true, "User AB deVilliers is busy at this time.");
			done();
		});
	});
	QUnit.test("Test addTask Function", function(assert){
		var calendar = factory.getCalendar("Test addTask Function");
		var done = assert.async();
		calendar.init("json/users.json", "json/resource_event.json").then(function(){
			var beginTime = moment("20170309T090000", "YYYYMMDDThhmmss");
			var endTime = moment("20170309T100000", "YYYYMMDDThhmmss");
			var curTime = moment(new Date());
			var user_id = "44513c5ddb19320049a1dfea5e9619e5"
			var invalidUser = {
        "type": "task",
        "name": "invalidUser",
        "user": "1234",
        "sys_id": "5678",
        "start": curTime,
        "end": curTime};
      var taskAtBusyTime = {
        "type": "meeting",
        "name": "BusyTime",
        "user": user_id,
        "sys_id": "5678",
        "start": beginTime,
        "end": endTime};
      var validTask = {
        "type": "meeting",
        "name": "ValidTask",
        "user": user_id,
        "sys_id": "5678",
        "start": moment("20170409T090000", "YYYYMMDDThhmmss"),
        "end": moment("20170409T100000", "YYYYMMDDThhmmss")};
      assert.ok(calendar.addTask(invalidUser) == false, "Invalid User");
      assert.ok(calendar.addTask(taskAtBusyTime) == false, "Add task at busy Time");
      assert.ok(calendar.addTask(validTask) == true, "Valid task added");
      assert.ok(calendar.tasks["5678"] !== undefined, "Valid task added to task list");
      assert.ok(calendar.users[user_id].task.includes("5678"), "Valid task added to user's task list");
      done();
		});
	});
});

