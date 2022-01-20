import Utils from './utils.js';
const Util = new Utils();

$(function () {
    const instruemntAmt = $(".instrument").length;
    
    $("#generalBtn").click(function (e) {
        let instrumentInputs = "";
        e.preventDefault();

        const emptyCheck = $(".instrument").filter(function () {
            return this.value != '';
        });

        for (let i = 0; i < emptyCheck.length; i++) {
            instrumentInputs += `&instrument${i}=${emptyCheck[i].value}`;
        }

        if ($("#site-name").val().length > 12) {
            Util.sweetAlert("error", "Operation Failed!", "Site's name maximum characters is 12");
        } else if ($(".instrument").length - emptyCheck.length !== 0) {
            Util.sweetAlert("error", "Operation Failed!", "You can't have an empty instrument input");
        } else {
            Util.sweetAlert("custom", "Are you sure?", `You're changing the site name to ${$("#site-name").val()} and adding ${$(".instrument").length - instruemntAmt} instruments`, 'Yes, save it!', 'Cancel', 'warning', function () {
                Util.ajaxRequest("/teacher/process/editGeneralSettings", "POST", `siteName=${$("#site-name").val()}` + instrumentInputs + `&instrumentLength=${$(".instrument").length}`, function (response) {
                    if (response == "success") {
                        Util.sweetAlert("custom", "Updated!", "Your general settings have successfully been updated!", "Ok", "", "success", function () {
                            location.reload();
                        });
                    } else {
                        Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to update your general settings!");
                    }
                });
            });
        }
    });

    $(document).on('click', '#addInstrumentBtn', function (e) {
        e.preventDefault();

        $(".instrumentBtns").parent().remove();
        $("#instruments").append(
            $('<div class="col-8 pb-2" />').html('<input type="text" class="form-control instrument" aria-describedby="instrumentsHelp"></input>'),
            $('<div class="col-2 pb-2" />').html('<button class="btn btn-success btn-block instrumentBtns" type="button" id="addInstrumentBtn">Add</button>'),
            $('<div class="col-2 pb-2" />').html('<button class="btn btn-danger btn-block instrumentBtns" type="button" id="delInstrumentBtn">Delete</button>'),
        );
    });

    $(document).on('click', '#delInstrumentBtn', function (e) {
        e.preventDefault();
        
        $(".tab").last().parent().remove();
    });
});