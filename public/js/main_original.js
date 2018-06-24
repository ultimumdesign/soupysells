var soupysells = angular.module('soupysells', ['ngRoute', 'ngTouch']);

soupysells.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "assets/main.html",
		controller : "indexController"
  }).when("/newitem", {
		templateUrl : "assets/item_add.html",
		controller : "itemController"
	}).when("/items", {
		templateUrl : "assets/item_view.html",
		controller : "itemController"
	});
});

soupysells.service('listService', function($http) {
	this.getCategory = function() {
		return $http.get("/api/list/category").then(function(response){
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

});

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

});

soupysells.controller('indexController', function($scope, $window) {
	$scope.messages = {};
	$scope.messages.welcome = "Welcome to Soupy Sells!";
});

soupysells.controller('itemController', function($scope, $window, $route,
   listService, itemService, $timeout) {
	$scope.messages = {};
	$scope.messages.titleAdd = "Add New Item";
	$scope.messages.titleView = "Items List";
	$scope.lists = {};
  $scope.items = {};
  $scope.states = {
    archiveModal: false
  };
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
    console.log(addName);
    listService.post(addName, type).then(function(data){
      if (data.error) {
        //do something
      }
      else {
        var postID = data.ID;
        console.log("post returned: " + postID)
        if (listType == 1) {
          listService.getPurchloc().then(function(data){
            if (data.error) {
              //do something
            }
            else {
              $timeout(function() {
                $scope.$apply(function() {
                  $scope.lists.purchaseloc = data;
                  let setObj = findObjectByKey($scope.lists.purchaseloc, 'ID', postID);
                  $scope.form.purchaseloc = setObj.ID;
                  console.log("my model: " + $scope.form.purchaseloc);
                })
              }, 0)
            }
          });
        }
        if (listType == 0) {
          listService.getCategory().then(function(data){
            if (data.error) {
              //do something
            }
            else {
              $timeout(function(){
                $scope.$apply(function() {
                  $scope.lists.categories = data;
                  let setObj = findObjectByKey($scope.lists.categories, 'ID', postID);
                  $scope.form.category = setObj.ID;
                  console.log("my model: " + $scope.form.category);
                })
              },0)
            }
          });
        }
      }
    });
  }
  $scope.toggleFilter = function(element) {
    element.toggle = !element.toggle;
  }
  $scope.toggleEditModal = function(element) {
    if (element) {
      $scope.edited = angular.copy(element);
      $scope.edited.purchasedate = new Date($scope.edited.purchasedate);
      $scope.editedCopy = angular.copy($scope.edited);
    }
    $('#editModal').modal("toggle");
  }
  $scope.toggleConfirmModal = function(element) {
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
