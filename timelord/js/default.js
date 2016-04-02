// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	//"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var helper = new RuntimeComponent.CoreAppHelper();

	var data = [];
	var currentWork;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
			    // TODO: This application has been newly launched. Initialize your application here.

                // Set the window size
			    var v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
			    v.setPreferredMinSize({ height: 150, width: 400 });
			    v.tryResizeView({ height: 150, width: 500 });
                
			    // Set titlebar appearance
			    helper.extendViewIntoTitleBar(true);
			    v.titleBar.buttonBackgroundColor = Windows.UI.Colors.dimGray;
			    v.titleBar.buttonForegroundColor = Windows.UI.Colors.darkGray;
			    v.titleBar.buttonInactiveBackgroundColor = Windows.UI.Colors.dimGray;

			    // Get saved data
			    data = loadData().done(function () {});

			    // Start timer
			    startTimer();

			} else {
				// TODO: This application was suspended and then terminated.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
			}
			args.setPromise(WinJS.UI.processAll());

		    // Register event handlers
			var submitButton = document.getElementById("submit");
			submitButton.addEventListener("click", submitClickHandler, false);
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	function startTimer() {
	    setTimeout(focus, 10000);
	}

	function focus() {
	    console.log("Focusing...");
	    helper.bringToFront("timelord");

	    startTimer();
	}

	function submitClickHandler(eventInfo) {
	    currentWork = document.getElementById("currentInput").value;
	    addEntry(currentWork);
	    var currentSubmitted = "Added 30 min to " + currentWork + ", for a total of " + getToday(currentWork);
	    document.getElementById("submitted").innerText = currentSubmitted;
	    storeTimeEvent();
	}

	function storeTimeEvent() {
	    var appData = Windows.Storage.ApplicationData.current;
	    var localFolder = appData.localFolder;
	    var timeLog = "timelog.json";

	    return localFolder.createFileAsync(timeLog,
            Windows.Storage.CreationCollisionOption.replaceExisting)
        .then(function (file) {
            return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(data));
        }).then(function () {

        });
	}

	function loadData() {
	    var appData = Windows.Storage.ApplicationData.current;
	    var localFolder = appData.localFolder;
	    var timeLog = "timelog.json";

	    return localFolder.createFileAsync(timeLog,
            Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            console.log("Opened file...");
            return localFolder.getFileAsync(timeLog)
            .then(function (file) {
                console.log("Read file...");
                return Windows.Storage.FileIO.readTextAsync(file)
                .then(function (text) {
                    try {
                        data = JSON.parse(text);
                    } catch(err) {
                        console.log("Unable to parse JSON: " + err);
                        console.log("No previous data.");
                        data = [];
                    }
                    console.log("File contains: " + JSON.stringify(data));
                });
            });
        });
	}

	function addEntry(partner) {
	    var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth() + 1; //January is 0!
	    var yyyy = today.getFullYear();

	    today = mm + '/' + dd + '/' + yyyy;

	    var workToday = getToday(partner, true);

	    if (workToday != null) {
	        data[workToday.index][partner][today] = data[workToday.index][partner][today] + 30;
	        console.log("Adding time: " + JSON.stringify(data[workToday.index]));
	    } else {
	        var todayJSON = {};
	        todayJSON[today] = 30;
	        var partnerJSON = {};
	        partnerJSON[partner] = todayJSON
	        data.push(partnerJSON);
	        console.log("Adding new entry: " + JSON.stringify(partnerJSON));
	    }
	}

	function getToday(partner, getIndex) {
	    var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth() + 1; //January is 0!
	    var yyyy = today.getFullYear();

	    today = mm + '/' + dd + '/' + yyyy;

	    try {
	        if (data.length == 0) throw "No data yet."
	        for (var i = 0; i < data.length; i++) {
	            if (data[i].hasOwnProperty(partner)) {
	                console.log("Partner data found...")
	                if (getIndex == true)
	                    return { "index": i, "value": data[i][partner][today] };
                    else
	                    return data[i][partner][today];
	            }
	        }
	        return null;
	    } catch (err) {
	        return null;
	    }
	}

	app.start();
})();
