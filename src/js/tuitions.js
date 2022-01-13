import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchTuitions();
    fetchHistory();
    Util.resetBtn("#resetBtn", "#tuitionForm");

    $("#tuitionForm :input").change(function () {
        const grandTotal = (Number($("#tuition").val()) * Number($("#lessons").val()) + Number($("#rental-fee").val()) + Number($("#special-fee").val()));

        $("#grand-total").val(grandTotal);
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

    $(document).on('click', '.sendEmail', function (e) {
        const id = $(this).attr('id');
        e.preventDefault();

        Util.sweetAlert("custom", "Which email type?", `Are you sending an invoice or are you sending a receipt?`, 'Invoice', 'Receipt', 'info', function () {
            Util.ajaxRequest("/teacher/process/fetchTuition", "POST", {
                id: id
            }, function (response) {
                Util.sweetAlert("custom", "Are you sure?", `You're sending an invoice to ${JSON.parse(response).name}`, 'Yes, send it!', 'Cancel', 'warning', function () {
                    Util.ajaxRequest("/teacher/process/sendInvoice", "POST", {
                        response: response,
                    }, function (response) {
                        if (response == "success") {
                            Util.sweetAlert("custom", "Sent!", "This tuition has successfully been sent as an invoice!", "Ok", "", "success", function () {
                                location.reload();
                            });
                        } else if (response == "schedule") {
                            Util.sweetAlert("error", "Operation Failed!", "This student doesn't have a schedule set up!");
                        } else if (response == "tuition") {
                            Util.sweetAlert("error", "Operation Failed!", "This student's tuition isn't fully set up!");
                        } else {
                            Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that tuition as an invoice!");
                        }
                    });
                });
            });
        }, function () {
            Util.ajaxRequest("/teacher/process/fetchTuition", "POST", {
                id: id
            }, function (response) {
                Util.sweetAlert("custom", "Are you sure?", `You're sending an receipt to ${JSON.parse(response).name}`, 'Yes, send it!', 'Cancel', 'warning', function () {
                    Util.ajaxRequest("/teacher/process/sendReceipt", "POST", {
                        response: response,
                    }, function (response) {
                        if (response == "success") {
                            Util.sweetAlert("custom", "Sent!", "This tuition has successfully been sent as an receipt!", "Ok", "", "success", function () {
                                location.reload();
                            });
                            console.log('helo');
                        } else if (response == "schedule") {
                            Util.sweetAlert("error", "Operation Failed!", "This student doesn't have a schedule set up!");
                        } else if (response == "tuition") {
                            Util.sweetAlert("error", "Operation Failed!", "This student's tuition isn't fully set up!");
                        } else {
                            Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that tuition as an receipt!");
                        }
                    });
                });
            });
        });
    });

    $(document).on('click', '.showFullHistory', function (e) {
        e.preventDefault();

        Util.ajaxRequest("/teacher/process/fetchFullHistory", "POST", {
            id: $(this).attr('id')
        }, function (response) {
            response = JSON.parse(response);

            Util.sweetAlert("custom", `${response.name}'s Tuition`, `Total tuition cost: ${response.tuitionFee}<br>Total ${response.rentalInstrument} cost: ${response.rentalFee}<br>Total special fee: ${response.specialFee}`, 'Ok', '', 'info', function () {
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
                    ["_id", "primary", "sendEmail", "share-square"]
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
                    ["_id", "primary", "showFullHistory", "question-circle"]
                ],
                ["name", "email", "grandTotal", "time", "type"]
            );

            $('#initHistory').DataTable({
                "order": [[4, "desc"]],
                "columnDefs": [{ "targets": [4], "type": "date-eu" }],
            });
        });
    }
});