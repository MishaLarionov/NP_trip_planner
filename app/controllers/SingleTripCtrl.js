"use strict";

app.controller('SingleTripCtrl', function($scope, $routeParams, TripFactory, TrailFactory, $route, NoteFactory, $uibModal){

  //This is where the trails that have been added to this trip are located.
  $scope.trails = [];

    TripFactory.getSingleTrip($routeParams.tripId)
    .then((tripData)=>{
      $scope.trip = tripData;
    });

    //Modal Views for user advice
    $scope.openTempModal = ()=>{
      let modalInstance = $uibModal.open({
      templateUrl: 'partials/AverageTempModal.html',
      controller: 'AverageTempModalCtrl',
      resolve: {
        trip: $scope.trip
      }
      });
    };

    $scope.openPackingModal = ()=>{
      let modalInstance = $uibModal.open({
      templateUrl: 'partials/PackingModal.html',
      controller: 'PackingModalCtrl',
      resolve: {
        trip: $scope.trip
      }
      });
    };

    $scope.openWarningsModal = ()=>{
      let modalInstance = $uibModal.open({
      templateUrl: 'partials/WarningsModal.html',
      controller: 'WarningsModalCtrl',
      resolve: {
        trip: $scope.trip
      }
      });
    };

    $scope.openEditTripModal = ()=>{
      let modalInstance = $uibModal.open({
      templateUrl: 'partials/EditTripModal.html',
      controller: 'EditTripModalCtrl',
      resolve: {
        trip: $scope.trip
      }
      });
    };

    //Opens a modal to make sure the user really wants to delete the trip
    $scope.openDeleteModal = ()=>{
      let modalInstance = $uibModal.open({
      templateUrl: 'partials/DeleteTrip.html',
      controller: 'DeleteTripModalCtrl'
      });
    };

    showNotes();
    showTrails();
    $scope.notes = [];

    function showNotes(){
      NoteFactory.getNotes($routeParams.tripId)
      .then((noteData)=>{
        Object.keys(noteData).forEach((key)=>{
          noteData[key].id =key;
          $scope.notes.push(noteData[key]);
        });
        addNotesToNotes($scope.notes);
      });
    }

    function addNotesToNotes(notes){
      Object.keys(notes).forEach((key)=>{
        $scope.notes.push({
          text: notes[key].text,
          day: notes[key].dayId,
          id: notes[key].id,
          wishlist: false
        });
      });
    }

    function showTrails(){
      TrailFactory.getTrailsInTrip($routeParams.tripId)
      .then((trailData)=>{
        let trails = [];
        Object.keys(trailData).forEach((key)=>{
          trailData[key].id =key;
          trails.push(trailData[key]);
        });
        addTrailsToTrailsArr(trails);
      });
    }

    function addTrailsToTrailsArr(trails){
      Object.keys(trails).forEach((key)=>{
        $scope.trails.push({
          name: trails[key].name,
          dayId: trails[key].dayId,
          id: trails[key].id,
          distance: trails[key].distance,
          estTime: trails[key].estTime,
          elevationGain: trails[key].elevationGain,
          difficulty: trails[key].difficulty,
          startTime: trails[key].startTime,
          endTime: trails[key].endTime,
          notes: trails[key].notes,
          wishlist: true
        });
      });
    }

    $scope.deleteTrailFromTrip = (trailId)=>{
      TripFactory.deleteTrailFromTrip(trailId)
      .then(()=>{
        console.log("successfully deleted");
        //For now, the only way I know how to get rid of the deleted item is to reload the page. Not ideal - want to fix later.
        $route.reload();
      });
    };

    $scope.deleteNoteFromTrip = (noteId)=>{
      NoteFactory.deleteNoteFromTrip(noteId)
      .then(()=>{
        console.log("successfully deleted");
        //For now, the only way I know how to get rid of the deleted item is to reload the page. Not ideal - want to fix later.
        $route.reload();
      });
    };

    $scope.updateTrailNote = (event, trailId, text)=>{
      if (event.charCode == 13) {
        let textPatch = { notes: text };
        TrailFactory.updateTrailNote(textPatch, trailId);
      }
    };

    $scope.addNote= (dayId)=>{
      //Need to create a noteObj to add to Firebase. Even though there is no text in this note the note instance needs to be added so that the user is updating the note when pressing enter rather than creating a whole new note everytime the enter key is pressed.
      var noteObj = {
        text: '',
        day: dayId,
        tripId: $routeParams.tripId
      };
      //A new note needs to be added to $scope.notes so that the user sees a card show up on the screen. This instance of the note will be replaced with the note in firebase when the user navigates away from this page.
      //The note is added to firebase
      NoteFactory.addNote(noteObj)
      .then((note)=>{
        let newNote = noteObj;
        newNote.id = note.name;
        $scope.notes.push(newNote);
      });
    };

    $scope.updateNote = (event, noteId, text)=>{
      if (event.charCode == 13) {
        let textPatch = { text };
        NoteFactory.updateNote(textPatch, noteId);
      }
    };

    //This takes the focus off of a note after hitting enter.
    $scope.blurInput = (event)=>{
      if (event.charCode == 13) {
        let target = event.target;
        target.blur();
      }
    };

});


