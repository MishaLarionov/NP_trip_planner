"use strict";

app.controller('SingleTripCtrl', function($scope, $routeParams, TripFactory, TrailFactory, $route){

    TripFactory.getSingleTrip($routeParams.tripId)
    .then((tripData)=>{
      console.log("trip data", tripData);
      $scope.trip = tripData;
    });

    TrailFactory.getTrailsInTrip($routeParams.tripId)
    .then((trailData)=>{
      console.log("trail data", trailData);
      addTrailsToActivities(trailData);
    });

    function addTrailsToActivities(trailData){
      $scope.activities = [];
      Object.keys(trailData).forEach((key)=>{
        $scope.activities.push({
          text: trailData[key].trailName,
          id: trailData[key].dayId
        });
      });
      console.log("activities", $scope.activities);
    };

    $scope.addNote = (event, dayId)=>{
      if (event.charCode == 13) {
        console.log("note will be added", dayId);
      }
    }

    $scope.cardAdded = false;

    $scope.createNote= (dayId)=>{
      console.log("day id", dayId);
      $scope.activities.push({
        text: '',
        id: dayId
      });
      $scope.cardAdded = true;
      console.log("activities?", $scope.activities);
    }
});


