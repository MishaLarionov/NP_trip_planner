"use strict";

app.controller("ExploreCtrl", function($scope, ImportantKeys, uiGmapIsReady, uiGmapGoogleMapApi, ApiFactory, TrailFactory, WishlistFactory, AuthFactory, $uibModal){
  //The map that shows up when the user goes to the Yosemite view should be centered on Yosemite National Park. Below are the coordinates for Yosemite.
  $scope.map = {
    center: {latitude: 37.8651, longitude: -119.5383 },
    zoom: 10,
    bounds: {
      southwest: {
        latitude: 36.778259,
        longitude: -119.417931
      },
      northeast: {
        latitude: 39.2878,
        longitude: -118.0256
      }
    }
  };
  //The terrain view of the map should show up
  $scope.options = {mapTypeId: 'terrain'};
  //I want the sidebar to be closed when a marker hasn't been clicked
  $scope.beenClicked = false;
  $scope.campgroundBeenClicked = false;
  $scope.inWishlist = false;
  $scope.trailType = false;
  $scope.selectedCampground = false;

  //When a user navigates to the explore page they should be shown the top hikes on the map. Afterward they can navigate to other view using filters and the map and list view icons.
  getTrailInfo('bestHike');
  //When the page first loads the campgrounds should not be shown and the mapView should be true
  getCampgroundInfo(false);
  $scope.mapView = true;

  //Boolean values to change what is shown on the screen when the user clicks the map and list view icons
  $scope.showMap=()=>{
    $scope.mapView = true;
  };
  $scope.showList=()=>{
    $scope.mapView = false;
    $scope.closeSidebar();
    getWishlistTrails();
    inWishlist();
  };

  //The trail filters all call this function
  $scope.filterTrails = (event, trailType)=>{
    //The sidebar should close if a different view is being selected.
    $scope.closeSidebar();
    $scope.selectedCampground = false;
    let target = event.target;
    //Get rid of the selectedFilter class on all of the filter buttons before adding the selectedFilter class on the one that was clicked
    $('.filterBtn').removeClass('selectedFilter');
    $(target).addClass('selectedFilter');
    getTrailInfo(trailType);
    getCampgroundInfo(false);
  };

  //I need to get the trail information from firebase and create objects that will provide the necessary information to create a marker for each trail. I also want to print information in the sidebar about each trail so I need to create an object for each trail with that information.
  function getTrailInfo(trailType){
    TrailFactory.getTrailInfo()
    .then((trailData)=>{
      let trails = trailData.trails;
      setMarkers(trails, trailType);
      setTrailInfo(trails);
    });
  }

    //Creating objects with relevant information for each marker and pushing to an array
  function setMarkers(trails, trailType){
    $scope.markers = [];
    trails.forEach((trail)=>{
      $scope.markers.push({
        id: trail.id,
        latitude: trail.coords.latitude,
        longitude: trail.coords.longitude,
        icon: '../images/hikerLogo.png',
        name: trail.name,
        options: {
          visible: trail[trailType]
        }
      });
    });
  }

  //Putting the array of trails on the scope.
  function setTrailInfo(trails){
    $scope.trailsInfo = trails;
  }

  function getCampgroundInfo (showCampground){
  TrailFactory.getCampgroundInfo()
  .then((campgroundInfo)=>{
    Object.keys(campgroundInfo).forEach((key)=>{
      campgroundInfo[key].id = key;
      });
      setCampgroundMarkers(campgroundInfo.campgrounds, showCampground);
      setCampgroundInfo(campgroundInfo.campgrounds)
    });
  }

  function setCampgroundMarkers(campgrounds, showCampground){
    $scope.campgrounds = [];
    campgrounds.forEach((campground)=>{
      $scope.campgrounds.push({
        id: campground.id,
        latitude: campground.coords.latitude,
        longitude: campground.coords.longitude,
        icon: '../images/campgroundIcon.png',
        name: campground.name,
        options: {
          visible: showCampground
        }
      });
    });
  }

  function setCampgroundInfo(campgrounds){
    $scope.campgroundsInfo = campgrounds;
  }

  $scope.showCampgrounds = ()=>{
    $scope.closeSidebar();
    $('.filterBtn').removeClass('selectedFilter');
    $scope.selectedCampground = true;
    getTrailInfo('campground');
    getCampgroundInfo(true);
  };

  $scope.onClickCampgrounds = function(instance, event, marker) {
    console.log("marker", marker);
    console.log("camgrounds", $scope.campgrounds[marker.id]);
    $scope.campground = $scope.campgroundsInfo[marker.id];
    showCampgroundInformation();
  };

  function showCampgroundInformation(){
    $scope.campgroundBeenClicked = true;
    $scope.$apply();
  }

  $scope.trailNames = [];
  function getWishlistTrails () {
    TrailFactory.getTrailsFromWishlist(AuthFactory.getUserId())
    .then((trailData)=>{
      console.log("what are the wishlist trails?", trailData);
      //I want to create an array of trail names from the wishlist so that I can compare the names in the wishlist to the names on the markers and see if that trail has been added to the wishlist of not.
      Object.keys(trailData).forEach((key)=>{
        $scope.trailNames.push(trailData[key].name);
      });
    });
  }

  getWishlistTrails();

  //When a marker is clicked I want to make sure that the user does not add a trail to his/her wishlist when it has already been added.
  $scope.onClick = function(instance, event, marker) {
    $scope.trailInfo = $scope.trailsInfo[marker.id];
    $scope.inWishlist = inWishlist(marker.name);
    showInformation();
  };

  $scope.onListClick = (event, trail)=>{
    console.log("trail clicked", trail);
    $('.selectedListItem').removeClass('selectedListItem');
    $(event.currentTarget).addClass('selectedListItem');
    $scope.trailInfo = $scope.trailsInfo[trail.id];
    $scope.beenClicked = true;
    $scope.inWishlist = inWishlist(trail.name);
    console.log("trailInfo", $scope.trailInfo);
  }

  $scope.onListClickCampground = function(event, campground) {
    console.log("camgrounds", $scope.campgroundsInfo[campground.id]);
    $scope.campground = $scope.campgroundsInfo[campground.id];
    $scope.campgroundBeenClicked = true;
  };

  function inWishlist(trailName){
    let counter = 0;
    $scope.trailNames.forEach((trail)=>{
      if (trail == trailName) {
        counter++;
      }
    });
    if (counter){
      return true;
    } else {
      return false;
    }
  }

  //This function shows the sidebar when any marker is clicked. The appropriate information is shown in the sidebar
  function showInformation(){
    $scope.beenClicked = true;
    $scope.$apply();
  }
  //Since each marker calls the onClick function it is difficult to open and close the sidebar by resetting the beenClicked property using clicks. Therefore, I created a button that will make the beenClicked property false so that the user can close the sidebar when he/she is done looking at trail information.
  $scope.closeSidebar = ()=>{
    $scope.beenClicked = false;
    $scope.campgroundBeenClicked = false;
  };
  //The user should be able to add a trail to his/her wishlist if there are no trips planned
  $scope.addTrailToWishlist = (trailInfo)=>{
    let userId = AuthFactory.getUserId();
    trailInfo.uid = userId;
    console.log("trail info", trailInfo);
    WishlistFactory.addToWishlist(trailInfo)
    .then((trailData)=>{
      $scope.closeSidebar();
      getWishlistTrails();
    });
  };

  $scope.addTrailToTrip = (trailObj)=>{
    let modalInstance = $uibModal.open({
      templateUrl: 'partials/AddToTripModal.html',
      controller: 'AddToTripModalCtrl',
      resolve:{
        trailObj
      }
    });
  };

});