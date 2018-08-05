function EventData(data){
	this.data  = data;

	this.checkYear = function(year){
		return angular.isDefined(data[year]);
	}
	this.checkMonth = function(year, month){
		if(!this.checkYear(year)) return false;
		return angular.isDefined(data[year][month]);
	}
	this.checkDate = function(year, month, date){
		if(!this.checkMonth(year, month)) return false;
		return angular.isDefined(data[year][month][date]);
	}

	this.addYear = function(year){
		if(!this.checkYear(year)) this.data[year] = {};
	}

	this.addMonth = function(year, month){
		this.addYear(year);
		if(!this.checkMonth(year, month))
			this.data[year][month] = {};
	}

	this.addDate = function(year, month, date){
		this.addMonth(year, month);
		if(!this.checkDate(year, month, date))
			this.data[year][month][date] = [];
	}

	this.getEvent = function(year, month, date){
		if(this.checkDate(year, month, date))
			return this.data[year][month][date];
		else
			return null;
	}

	this.addEvent = function(obj, event){
		var arr = this.getEvent(obj.year, obj.month + 1, obj.date);
		if(arr == null)
		{
			this.addDate(obj.year, obj.month + 1, obj.date);
			arr = this.getEvent(obj.year, obj.month + 1, obj.date);
		}

		var id = 0;
		if(arr.length > 0)
			id = arr[arr.length - 1].id + 1;
		event.id = id;

		arr.push(event);
	}
}

function cmpDate(obj1, obj2){
	return obj1.date == obj2.date && obj1.month == obj2.month && obj1.year == obj2.year;
}

var app = angular.module("myApp", ['mgcrea.ngStrap', 'ngAnimate']);

app.factory("AppService", function(){
	function getTableDate(month, year){
		var date = new Date(year + "-" + month + "-01");
		date.setDate(-(date.getDay() - 1));

		var tableDate = [];

		for(var i = 0; i<=5; ++i)
		{
			tableDate[i] = [];
			for(var j = 0; j<=6; ++j)
			{
				tableDate[i].push({
					date: date.getDate(), month: date.getMonth(), year: date.getFullYear()
				});
				date.setDate(date.getDate() + 1);
			}
		}

		return tableDate;
	}

	function getTableMonth(){
		var tableMonth = [];
		var row = 2, col = 4;
		for(var i = 0; i<=row; ++i)
		{
			tableMonth[i] = [];
			for(var j = 1; j<=col; ++j)
				tableMonth[i].push("Tháng " + (i*col + j));
		}
		return tableMonth;
	}

	return {
		getTableDate: getTableDate,
		getTableMonth: getTableMonth
	};
});

app.controller("MainController", function($scope, AppService, $modal){
	var date = new Date();
	$scope.DateNow = {
		date: date.getDate(),
		month: date.getMonth(),
		year: date.getFullYear()
	};

	$scope.Month = $scope.DateNow.month + 1;
	$scope.Year = $scope.DateNow.year;

	$scope.template = "tableDate";
	$scope.TableMonth = AppService.getTableMonth();
	$scope.TableDate = AppService.getTableDate($scope.Month, $scope.Year);
	$scope.selectDateObj = $scope.DateNow;

	$scope.$watch("Month", function(){
		$scope.TableDate = AppService.getTableDate($scope.Month, $scope.Year);
	});

	$scope.$watch("Year", function(){
		$scope.TableDate = AppService.getTableDate($scope.Month, $scope.Year);
	});
	
	$scope.MarkDate = function(col){
		if(cmpDate(col, $scope.DateNow))
			return "bg-primary";
		if(cmpDate(col, $scope.selectDateObj))
			return "bg-info";
		if(col.month != ($scope.Month - 1))
			return "text-muted";
		return ""
	}

	$scope.changeMonth = function(s){
		if(s == "left")
		{
			if($scope.Month == 1)
			{
				$scope.Month = 12;
				$scope.Year--;
			}
			else
				$scope.Month--;
		}
		else
		{
			if($scope.Month == 12)
			{
				$scope.Month = 1;
				$scope.Year++;
			}
			else
				$scope.Month++;
		}
	};

	$scope.changeYear = function(s){
		if(s == "left")
		{
			if($scope.Year > 1900)
				$scope.Year--;
		}
		else
		{
			if($scope.Year < 2100)
				$scope.Year++;
		}
	}

	$scope.setMonthOnTableMonth = function(col){
		$scope.Month = parseInt(col.substring(6));
		$scope.template = "tableDate";
	}

	$scope.changeTemplate = function(s){
		$scope.template = s;
	};

	$scope.today = function(){
		$scope.Month = $scope.DateNow.month + 1;
		$scope.Year = $scope.DateNow.year;
		$scope.selectDate($scope.DateNow);
		$scope.template = "tableDate";
	}

	var data = {
		2016: {
			12:{
				9:[
					{id: 0, time: new Date(2016, 12, 9, 10, 0), title:"Test", content: "Test", type: 'danger'},
					{id: 1, time: new Date(2016, 12, 9, 11, 0), title:"Test", content: "Test", type: 'warning'},
					{id: 2, time: new Date(2016, 12, 9, 12, 0), title:"Test", content: "Test", type: 'success'},
					{id: 3, time: new Date(2016, 12, 9, 10, 0), title:"Test", content: "Test", type: 'info'},
					{id: 4, time: new Date(2016, 12, 9, 11, 0), title:"Test", content: "Test", type: 'info'},
					{id: 5, time: new Date(2016, 12, 9, 12, 0), title:"Test", content: "Test", type: 'warning'}
				]
			}
		}
	};

	$scope.eventData = new EventData(data);

	$scope.selectDate = function(obj){
		$scope.selectDateObj = obj;
	}

	$scope.eventCount = function(obj){
		var data = $scope.eventData.getEvent(obj.year, obj.month + 1, obj.date);
		if(data) 
			return data.length;
		else
			return 0;
	}

	$scope.eventRecently = $scope.eventCount($scope.DateNow);

	$scope.filter = {
		type: ""
	}

	$scope.titleTooltip = function(col){
		var s = $scope.eventCount(col);
		if(s > 0)
			return "Bạn có " + s + " sự kiện";
		else
			return "Bạn không có sự kiện";
	}

	$scope.$watch("selectDateObj", function(){
		var obj = $scope.selectDateObj;
		$scope.eventSelectDate = $scope.eventData.getEvent(obj.year, obj.month + 1, obj.date);
	});

	$scope.colorPicker = ["info", "success", "danger", "warning"];

	$scope.addClassColor = function(item, event){
		if(!event) return "";
		var s = "bg-" + item;
		if(item == event.type)
		{
			s+=" color-select";
		}
		return s;
	}

	$scope.selectColor = function(item, event){
		event.type = item;
	}

	//Modal, add, edit, remove event

	var EventModal = $modal({scope: $scope, animation: "am-slide-top", templateUrl:"template/Event.html", show: false});

	$scope.openAddEventModal = function(){
		EventModal.$promise.then(EventModal.show);
		$scope.modal = {
			title: "Thêm sự kiện", isEdit: false
		};
		$scope.event = {type: "info"};
	};

	$scope.addEvent = function(event, hide){
		var obj = $scope.selectDateObj;

		$scope.eventData.addEvent(obj, event);

		$scope.eventSelectDate = $scope.eventData.getEvent(obj.year, obj.month + 1, obj.date);

		hide();

		$scope.modal = null;

		$scope.eventRecently = $scope.eventCount($scope.DateNow);
	}

	$scope.removeEvent = function(event){
		var i;
		$scope.eventSelectDate.forEach(function(obj, index){
			if(obj.id == event.id)
			{
				i = index;
				return;
			}
		});

		$scope.removeItem = function(hide){
			hide();
			$scope.eventSelectDate.splice(i, 1);
		};

		var DialogModal = $modal({scope: $scope, title: "Xoá sự kiện", content: "Bạn có muốn xoá sự kiện này?", animation: "am-slide-top", templateUrl: "template/Dialog.html"});
	}

	$scope.openEditEventModal = function(event){
		EventModal.$promise.then(EventModal.show);

		$scope.eventSelectDate.forEach(function(obj, index){
			if(obj.time == event.time)
			{
				$scope.indexEvent = index;
				return;
			}
		});

		$scope.event = angular.copy(event);
		$scope.event.time = new Date($scope.event.time);
		$scope.modal = {
			title: "Chỉnh sửa sự kiện", isEdit: true
		};
	}

	$scope.editEvent = function(event, hide){
		$scope.eventSelectDate[$scope.indexEvent] = angular.copy(event);
		hide();
		$scope.event = null;
		$scope.modal = null;
	}
});

app.controller("EventController", function($scope){
});