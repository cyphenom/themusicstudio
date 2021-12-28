import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchTuitions();
    fetchHistory();
    Util.resetBtn("#resetBtn", "#tuitionForm");

    $("#tuitionForm :input").change(function () {
        const grandTotal = (Number($("#tuition").val()) * Number($("#lessons").val()) + Number($("#rental-fee").val()) + Number($("#special-fee").val()));

        $("#grand-total").val(grandTotal);

        console.log(Number($("#tuition").val()) * Number($("#lessons").val()) + Number($("#rental-fee").val()) + Number($("#special-fee").val()));
        console.log(Number($("#lessons").val()));
        console.log(Number($("#rental-fee").val()));
        console.log(Number($("#special-fee").val()));

        console.log(grandTotal);
    });

    $(document).on('click', '#editTuitionBtn', function (e) {
        if ($("#tuitionForm")[0].checkValidity()) {
            e.preventDefault();

            Util.ajaxRequest("/teacher/process/editTuition", "POST", $("#tuitionForm").serialize() + `&id=${$("#_id").val()}`, function (response) {
                if (response == "success") {
                    $("#tuitionForm")[0].reset();
                    Util.sweetAlert("success", "Edited!", "This tuition has successfully been edited!");
                    fetchTuitions();
                } else if (response == "no_student") {
                    Util.sweetAlert("error", "Operation Failed!", "Could not find and select student's tuition!")
                } else {
                    Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that tuition!");
                }
            });
        }
    });

    $(document).on('click', '.editTuition', function (e) {
        e.preventDefault();

        Util.ajaxRequest("/teacher/process/fetchTuition", "POST", {
            id: $(this).attr('id')
        }, function (response) {
            response = JSON.parse(response);

            $("#_id").val(response._id);
            $("#name").val(response.name);
            $("#email").val(response.email);
            $("#tuition").val(Number(response.tuition.slice(1)));
            $("#grand-total").val(Number(response.grandTotal.slice(1)));
            $("#lessons").val(Number(response.lessons.slice(0, -8)));
            $("#duration").val(Number(response.lessonDuration.slice(0, -8)));
            $(`#${response.rentalInstrument}`).prop('selected', 'true');
            $("#rental-fee").val(Number(response.rentalFee.slice(1)));
            $("#special").val(response.special);
            $("#special-fee").val(Number(response.specialFee.slice(1)));
        });
    });

    $(document).on('click', '.sendInvoice', function (e) {
        e.preventDefault();

        Util.ajaxRequest("/teacher/process/fetchTuition", "POST", {
            id: $(this).attr('id')
        }, function (response) {
            Util.sweetAlert("warning", "Are you sure?", `You're sending an invoice to ${JSON.parse(response).name}`, 'Yes, send it!', function () {
                Util.ajaxRequest("/teacher/process/sendInvoice", "POST", {
                    response: response,
                }, function (response) {
                    if (response == "success") {
                        Util.sweetAlert("success", "Sent!", "This tuition has successfully been sent as an invoice!");
                        fetchHistory();
                    } else {
                        Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that tuition as an invoice!");
                    }
                });
            });
        });
    });

    function fetchTuitions() {
        Util.ajaxRequest("/teacher/process/fetchTuitions", "POST", "", function (response) {
            response = JSON.parse(response);

            Util.generateTable(
                response,
                "#showTuitions",
                [
                    ["_id", "warning", "editTuition", "edit"],
                    ["_id", "primary", "sendInvoice", "share-square"]
                ],
                ["name", "email", "tuition", "grandTotal", "lessons", "lessonDuration", "rentalInstrument", "rentalFee", "special", "specialFee"]
            );
        });
    }

    function fetchHistory() {
        Util.ajaxRequest("/teacher/process/fetchHistory", "POST", "", function (response) {
            response = JSON.parse(response);

            Util.generateTable(
                response,
                "#showHistory",
                [
                    ["_id", "primary", "sendInvoice", "question-circle"]
                ],
                ["name", "email", "grandTotal", "time"]
            );

            $("#initHistory").DataTable();
        });
    }
});