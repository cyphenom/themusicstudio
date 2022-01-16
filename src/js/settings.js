import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchSettings("general", function (result) {
        $("#site-name").val(result.siteName);
    });

    $("#generalBtn").click(function (e) {
        e.preventDefault();

        if ($("#site-name").val().length <= 12) {
            Util.sweetAlert("custom", "Are you sure?", `You're changing the site name to ${$("#site-name").val()}`, 'Yes, save it!', 'Cancel', 'warning', function () {
                Util.ajaxRequest("/teacher/process/editGeneralSettings", "POST", $("#generalForm").serialize(), function (response) {
                    if (response == "success") {
                        Util.sweetAlert("custom", "Updated!", "Your general settings have successfully been updated!", "Ok", "", "success", function () {
                            location.reload();
                        });
                    } else {
                        Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to update your general settings!");
                    }
                });
            });
        } else {
            Util.sweetAlert("error", "Operation Failed!", "Site's name maximum characters is 12");
        }
    });


    function fetchSettings(type, fn) {
        Util.ajaxRequest("/teacher/process/fetchSettings", "POST", { type: type }, function (response) {
            fn(JSON.parse(response))
        });
    }
});