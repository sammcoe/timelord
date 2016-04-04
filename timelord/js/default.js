(function () {
	//"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var helper = new RuntimeComponent.CoreAppHelper();

	var data = [];
	var currentWork;
	var settings = {};
	var currentWindow;

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
			    data = loadData().done(function () { });

                // Load settings
			    loadSettings().done(function () {
			        // Start timer
			        startTimer();
			    });

			} else {
				// TODO: This application was suspended and then terminated.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
			}
			args.setPromise(WinJS.UI.processAll());

		    // Register event handlers
			var settingsButton = document.getElementById("settings");
			settingsButton.addEventListener("click", openSettings, false);

			var textbox = document.getElementById("currentInput");
			textbox.addEventListener("keydown", keysDown, false);
			textbox.addEventListener("keyup", keysUp, false);
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	var keys = Array.apply(null, Array(30)).map(function () { return false; }); // Global... this should probably be changed
	
	function keysDown(e) {
	    keys[e.keyCode] = true;
	    console.log("Key down: " + e.keyCode);
	    if (keys[13] && keys[16]) {
            console.log("Shift + Enter detected.")
	        submitHandler();
	    };
	}

	function keysUp(e) {
	    console.log("Resetting keys." + e.keyCode);
	    keys[e.keyCode] = false;
	}

	function startTimer() {
	    var interval;

	    if (settings.interval == "timing30") interval = 1800000;
	    else if (settings.interval == "timing15") interval = 915000;
	    else if (settings.interval == "timing60") interval = 3600000;
	    else if (settings.interval == "timingTest") interval = 15000;

	    console.log("Starting popup interval at " + interval + " ms.");

	    setTimeout(focus, interval);
	}

	function focus() {
	    console.log("Focusing...");

        // Save active window for recall
	    currentWindow = helper.getActiveWindowTitle();
	    helper.bringToFront("Timelord");

	    document.getElementById("currentInput").focus();

	    startTimer();
	}

	function openSettings() {
	    window.open("settings.html");
	}

	function submitHandler() {
	    var hours = 0;

	    currentWork = document.getElementById("currentInput").value;
	    addEntry(currentWork);
	    hours = getToday(currentWork) / 60;

	    var currentSubmitted = "Added 30 min to " + currentWork + ", for a total of " + hours + " hours today.";
	    document.getElementById("submitted").innerText = currentSubmitted;
	    document.getElementById("currentInput").value = "";

	    storeTimeEvent().done(function () {
	        //helper.hideWindow("Timelord");
	        // Reset keys
	        keys.fill(false);
	        helper.bringToFront(currentWindow);
	    })
	}

	function saveSettings() {
	    var appData = Windows.Storage.ApplicationData.current;
	    var localFolder = appData.localFolder;
	    var settingsFile = "settings.json";

	    return localFolder.createFileAsync(settingsFile,
            Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(settings));
        }).then(function () {

        });
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

	function loadSettings() {
	    var appData = Windows.Storage.ApplicationData.current;
	    var localFolder = appData.localFolder;
	    var settingsFile = "settings.json";

	    return localFolder.createFileAsync(settingsFile,
            Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            console.log("Opened Settings file...");
            return localFolder.getFileAsync(settingsFile)
            .then(function (file) {
                console.log("Read Settings file...");
                return Windows.Storage.FileIO.readTextAsync(file)
                .then(function (text) {
                    try {
                        settings = JSON.parse(text);
                    } catch (err) {
                        console.log("Unable to parse settings JSON: " + err);
                        console.log("No previous settings data.");
                    }
                });
            });
        });
	}

	function loadData() {
	    var appData = Windows.Storage.ApplicationData.current;
	    var localFolder = appData.localFolder;
	    var timeLog = "timelog.json";

	    return localFolder.createFileAsync(timeLog,
            Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            console.log("Opened Time file...");
            return localFolder.getFileAsync(timeLog)
            .then(function (file) {
                console.log("Read Time file...");
                return Windows.Storage.FileIO.readTextAsync(file)
                .then(function (text) {
                    try {
                        data = JSON.parse(text);
                    } catch(err) {
                        console.log("Unable to parse time JSON: " + err);
                        console.log("No previous time data.");
                        data = [];
                    }
                    console.log("Time file contains: " + JSON.stringify(data));
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

	    if (workToday != null && workToday != "null" && workToday != "undefined") {
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
