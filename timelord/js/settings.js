(function () {

    var helper = new RuntimeComponent.CoreAppHelper();

    var settings = {
        interval: "timing30"
    };

    // Set the window size
    var v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    v.setPreferredMinSize({ height: 150, width: 400 });
    v.tryResizeView({ height: 150, width: 500 });

    // Set titlebar appearance
    helper.extendViewIntoTitleBar(true);
    v.titleBar.buttonBackgroundColor = Windows.UI.Colors.dimGray;
    v.titleBar.buttonForegroundColor = Windows.UI.Colors.darkGray;
    v.titleBar.buttonInactiveBackgroundColor = Windows.UI.Colors.dimGray;
    
    window.onload = function () {

        // Load settings
        loadSettings().done( function () {
            console.log("Loaded settings.")
        });

        // Register even listeners
        var saveButton = document.getElementById("save");
        saveButton.addEventListener("click", saveSettings, false);

    }

    function updateSettingsJSON() {
        if (document.getElementById("timing15").checked) settings.interval = "timing15";
        if (document.getElementById("timing30").checked) settings.interval = "timing30";
        if (document.getElementById("timing60").checked) settings.interval = "timing60";
        // For development
        if (document.getElementById("timingTest").checked) settings.interval = "timingTest";

        console.log("Settings after update: " + JSON.stringify(settings));
    }
                
    function saveSettings() {
        console.log("Saving settings...")
        updateSettingsJSON();
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

    function loadSettings() {
        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var settingsFile = "settings.json";
        console.log("Loading settings...");
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

                        console.log("Loaded interval: " + settings.interval);
                        document.getElementById("timing").value = settings.interval;
                        document.getElementById(settings.interval).checked = true;
                    } catch (err) {
                        console.log("Unable to parse settings JSON: " + err);
                        console.log("No previous settings data.");
                    }
                });
            });
        });
    }

})();
