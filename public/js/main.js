var soupysells = angular.module('soupysells', ['ngRoute', 'ngTouch', 'chart.js']);
/** CONFIG **/
soupysells.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "assets/main.html",
		controller : "indexController"
  }).when("/newitem", {
		templateUrl : "assets/item_add.html",
		controller : "itemController"
	}).when("/newbulk", {
		templateUrl : "assets/item_addbulk.html",
		controller : "itemController"
	}).when("/items", {
		templateUrl : "assets/item_view.html",
		controller : "itemController"
	}).when("/sales", {
		templateUrl : "assets/sale_view.html",
		controller : "saleController"
	}).when("/newsale", {
		templateUrl : "assets/sale_add.html",
		controller : "saleController"
	}).when("/report", {
		templateUrl : "assets/sale_report.html",
		controller : "saleController"
	}).when("/metrics", {
		templateUrl : "assets/metrics.html",
		controller : "saleController"
	});
});
/** SERVICE **/
soupysells.service('listService', function($http) {
	this.getCategory = function() {
		return $http.get("/api/list/category").then(function(response){
			return response.data
		});
	}
  this.getSellingplat = function() {
    return $http.get("/api/list/sellingplat").then(function(response){
      return response.data
    });
  }
	this.getPurchloc = function() {
		return $http.get("/api/list/purchaseloc").then(function(response){
			return response.data
		});
	}
  this.post = function(string, type) {
    let dataObj = {
      name: string
    }
    let url = type == 0 ? "/api/lists/addcat":"/api/lists/addpurchloc";
    return $http.post(url, JSON.stringify(dataObj)).then(function(response){
      return response.data
    });
  }
  this.postPlat = function(string) {
    let dataObj = {
      name: string
    }
    let url = "/api/lists/addsellingplat";
    return $http.post(url, JSON.stringify(dataObj)).then(function(response){
      return response.data
    });
  }

});
/** SERVICE **/
soupysells.service('itemToSaleService', function($http) {
  this.data = [];
  this.get = function() {
    return $http.get("/api/sale/sales").then(function(response){
      return response.data
    });
  }
  this.post = function(data) {
    let url = "/api/sale/newsale";
    return $http.post(url, data).then(function(response){
      return response.data
    });
  }
  this.getReport = function(ID) {
    let url = "/api/sale/salesreport?ID=" + ID;
    return $http.get(url).then(function(response){
      return response.data
    });
  }
});
/** SERVICE **/
soupysells.service('itemService', function($http) {
	this.post = function(data) {
		let url = "/api/item/newitem";
		return $http.post(url, data).then(function(response){
			return response.data
		});
	}
	this.get = function() {
		return $http.get("/api/item/items").then(function(response){
			return response.data
		});
	}
  this.archive = function(id) {
		let url = "/api/item/archiveitem?ID="+id;
		return $http.get(url).then(function(response){
			return response.data
		});
	}
  this.update = function(data) {
    let url = "/api/item/updateitem";
    return $http.post(url, data).then(function(response){
      return response.data
    });
  }
  this.bulkItems = [];

});
/** SERVICE **/
soupysells.service('metricService', function($http) {
	this.getSalesReport = function(dateFilter) {
    let url = "/api/metric/salesreport?dateFilter="+dateFilter;
		return $http.get(url).then(function(response){
			return response.data
		});
	}
  this.getItemsReport = function(dateFilter) {
    let url = "/api/metric/itemsreport?dateFilter="+dateFilter;
    return $http.get(url).then(function(response){
      return response.data
    });
  }
});
/** CONTROLLER **/
soupysells.controller('saleController', function($scope, $window, $route,
  listService, itemService, $timeout, itemToSaleService, metricService,
  $location) {
  $scope.messages.titleView = "Sales List";
  $scope.messages.titleAdd= "Add New Sale";
  $scope.messages.titleReport= "Soupy Sells";
  $scope.messages.titleMetrics= "Metrics";

  $scope.lists = {};
  $scope.sales = {};
  $scope.states = {};
  $scope.reportOption = {};
  $scope.reports = {};

  $scope.testData = [2,5,7];
  $scope.testLabel = ['a','b','c'];

  listService.getSellingplat().then(function(data){
    if (data.error) {
      //do something
    }
    else {
      $scope.lists.sellingplat = data;
    }
  });

  $scope.invMetricServiceGet = function() {
    if ($scope.reportOption.typeFilter == "Sales") {
      metricService.getSalesReport($scope.reportOption.dateFilter)
      .then(function(data){
        if (data.error) {
          //do something
        }
        else {
          //assign something, do something
          $scope.reports.data = data;
        }
      });
    }
    else if ($scope.reportOption.typeFilter == "Items") {
      metricService.getItemsReport($scope.reportOption.dateFilter)
      .then(function(data){
        if (data.error) {
          //do something
        }
        else {
          //assign something, do something
          $scope.reports.data = data;
        }
      });
    }
  }
  $scope.invItemToSaleServiceGet = function() {
    itemToSaleService.get().then(function(data){
      if (data.error) {
        //do something
      }
      else {
        //assign something, do something
        $scope.sales.saleData = data;
      }
    });
  }
  $scope.invItemToSaleService = function() {
    if (itemToSaleService.data.length>0) {
      $scope.form = {
        itemID: itemToSaleService.data[0].itemID,
        name: itemToSaleService.data[0].name
      }
      itemToSaleService.data.splice(0,1);
    }
  }
  $scope.invItemToSaleServiceGetReport = function() {
    let searchObj = $location.search();
    if (searchObj.ID) {
      itemToSaleService.getReport(searchObj.ID).then(function(data){
        if (data.error) {
          //do something error like
        }
        else {
          $scope.data = data;
        }
      });
    }
  }
  $scope.viewSaleReport = function(ID) {
    $location.path('/report').search('ID', ID);
  }
  $scope.toggleAddSellingplat = function() {
    if ($scope.states.addSellingplat) {
      $scope.states.addSellingplat = false;
      $scope.addSellingplat.name = '';
    }
    else {
      $scope.states.addSellingplat = true;
      $scope.addSellingplat = {
        name: ''
      };
    }
  }
  $scope.invItemToSaleServicePost = function() {
    itemToSaleService.post($scope.form).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        //assign something, do something
        $scope.viewSaleReport(data.ID);
        $window.location.reload();
      }
    });
  }
  $scope.invListServicePostPlat = function() {
    var addName = $scope.addSellingplat.name;
    listService.postPlat(addName).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        var postID = data.ID;
        listService.getSellingplat().then(function(data){
          if (data.error) {
            //do something
          }
          else {
                $scope.lists.sellingplat = data;
                let setObj = findObjectByKey($scope.lists.sellingplat, 'ID', postID);
                $scope.form.platformID = setObj.ID;
                $scope.states.addSellingplat = false;
                delete $scope.addSellingplat
          }
        });
      }
    });
  }
  $scope.checkAddExist = function(testList) {
    var doesExist = false;
    angular.forEach(testList, function(value, key) {
      if ($scope.addSellingplat) {
        if ($scope.addSellingplat.name.toUpperCase() == value.name.toUpperCase()) {
          doesExist = true;
          return doesExist
        }
      }
    })
    return doesExist
  }
  $scope.checkAddLength = function() {
    if ($scope.addSellingplat) {
      return ($scope.addSellingplat.name.length>=1)
    }
  }
  $scope.toggleFilter = function(element) {
    element.toggle = !element.toggle;
  }
  function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
  }
});
/** CONTROLLER **/
soupysells.controller('indexController', function($scope, $window) {
	$scope.messages = {};
	$scope.messages.welcome = "Welcome to Soupy Sells!";
});
/** CONTROLLER **/
soupysells.controller('itemController', function($scope, $window, $route,
  listService, itemService, $timeout, itemToSaleService, $location,
  $rootScope) {
	$scope.messages = {};
	$scope.messages.titleAdd = "Add New Item";
	$scope.messages.titleAdd = "Add Bulk Items";
	$scope.messages.titleView = "Items List";
	$scope.lists = {};
  $scope.items = {};
  $scope.states = {
    archiveModal: false
  };
  $scope.logVar = function() {
    console.log(itemService.bulkItems);
  }


  $rootScope.$on('$routeChangeStart', function() {
    $('.modal').modal('hide'); // hides all modals
    $('.modal-backdrop').remove();
  });
	//get categories
	listService.getCategory().then(function(data){
		if (data.error) {
			//do something
		}
		else {
			$scope.lists.categories = data;
		}
	});
	//get purchase locations
	listService.getPurchloc().then(function(data){
		if (data.error) {
			//do something
		}
		else {
			$scope.lists.purchaseloc = data;
		}
	});
  //call transfer service
  $scope.invItemToSaleService = function() {
    itemToSaleService.data.push({
      itemID: $scope.edited.ID,
      name: $scope.edited.name
    });
    //$scope.toggleEditModal();
    //$('.modal-backdrop').remove();
    $location.path('/newsale');
  }
	//call post service
	$scope.invItemServicePost = function() {
		itemService.post($scope.form).then(function(data){
			if (data.error) {
				//do something
			}
			else {
				//assign something, do something
        $route.reload();
			}
		});
	}
  $scope.addBulkItem = function() {
    itemService.bulkItems.push($scope.form);
    $window.scrollTo(0,0);
    $route.reload();
  }
  $scope.invItemServiceGet = function() {
    itemService.get().then(function(data){
      if (data.error) {
        //do something
      }
      else {
        //assign something, do something
        $scope.items.itemData = data;
      }
    });
  }
  $scope.invItemServiceArc = function(id) {
    itemService.archive(id).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        //assign something, do something
        $window.location.reload();
      }
    });
  }
  $scope.invItemServiceUpdate = function(data) {
    itemService.update(data).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        //assign something, do something
        $window.location.reload();
      }
    });
  }
  $scope.invListServicePost = function(type) {
    var listType = type;
    var addName = type == 0 ? $scope.addcat.name : $scope.addpurchloc.name;
    listService.post(addName, type).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        var postID = data.ID;
        if (listType == 1) {
          listService.getPurchloc().then(function(data){
            if (data.error) {
              //do something
            }
            else {
                  $scope.lists.purchaseloc = data;
                  let setObj = findObjectByKey($scope.lists.purchaseloc, 'ID', postID);
                  $scope.form.purchaseloc = setObj.ID;
                  $scope.states.addpurchloc = false;
                  delete $scope.addpurchloc.name
            }
          });
        }
        if (listType == 0) {
          listService.getCategory().then(function(data){
            if (data.error) {
              //do something
            }
            else {
                  $scope.lists.categories = data;
                  let setObj = findObjectByKey($scope.lists.categories, 'ID', postID);
                  $scope.form.category = setObj.ID;
                  $scope.states.addcat = false;
                  delete $scope.addcat.name;
            }
          });
        }
      }
    });
  }
  $scope.toggleFilter = function(element) {
    element.toggle = !element.toggle;
  }
  $scope.toggleAddCat = function() {
    if ($scope.states.addcat) {
      $scope.states.addcat = false;
      $scope.addcat.name = '';
    }
    else {
      $scope.states.addcat = true;
      $scope.addcat = {
        name: ''
      };
    }
  }
  $scope.toggleAddPurchloc = function() {
    if ($scope.states.addpurchloc) {
      $scope.states.addpurchloc = false;
      $scope.addpurchloc.name = '';
    }
    else {
      $scope.states.addpurchloc = true;
      $scope.addpurchloc = {
        name: ''
      };
    }
  }
  $scope.toggleEditModal = function(element) {
    if (element) {
      $scope.edited = angular.copy(element);
      $scope.edited.purchasedate = new Date($scope.edited.purchasedate);
      $scope.editedCopy = angular.copy($scope.edited);
    }
    $('#editModal').modal("toggle");
  }
  $scope.toggleConfirmModal = function() {
    $('#confirmModal').modal("toggle");
  }
  $scope.isEditedChanged = function() {
    return angular.equals($scope.edited, $scope.editedCopy)
  }
  $scope.checkAddExist = function(testList, type) {
    var doesExist = false;
    if (type == 'purch') {
      angular.forEach(testList, function(value, key) {
        if ($scope.addpurchloc) {
          if ($scope.addpurchloc.name.toUpperCase() == value.name.toUpperCase()) {
            doesExist = true;
            return doesExist
          }
        }
      })
    }
    else if (type == 'cat') {
      angular.forEach(testList, function(value, key) {
        if ($scope.addcat) {
          if ($scope.addcat.name.toUpperCase() == value.name.toUpperCase()) {
            doesExist = true;
            return doesExist
          }
        }
      })
    }
    return doesExist
  }
  $scope.checkAddLength = function(type) {
    if (type == 'purchloc') {
      if ($scope.addpurchloc) {
        return ($scope.addpurchloc.name.length>=1)
      }
    }
    if (type == 'cat') {
      if ($scope.addcat) {
        return ($scope.addcat.name.length>=1)
      }
    }
  }
  function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
  }
});
// End controller
