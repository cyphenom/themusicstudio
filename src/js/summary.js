import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchAttendance($("#start").val(), $("#end").val(), $("#email").val());
    fetchLessons();

    $("#start").on("input", function () {
        fetchAttendance($("#start").val(), $("#end").val(), $("#email").val());
    });

    $("#end").on("input", function () {
        fetchAttendance($("#start").val(), $("#end").val(), $("#email").val());
    });

    $("#email").on("input", function() {
        fetchAttendance($("#start").val(), $("#end").val(), $("#email").val());
    });

    function fetchAttendance(start, end, email) {
        Util.ajaxRequest("/teacher/process/fetchRangeHistory", "POST", { start: start, end: end, email: email }, function (response) {
            response = JSON.parse(response);
            let total = 0;
            let tuitionTotal = 0;
            let rentalTotal = 0;
            let specialTotal = 0;

            Util.generateTable(
                response,
                "#showIncome",
                [],
                ["name", "email", "grandTotal", "tuitionFee", "rentalFee", "specialFee", "time"]
            );
            
            if (response.length) {
                for (let i = 0; i < response.length; i++) {
                    total += Number(response[i].grandTotal.slice(1));
                    tuitionTotal += Number(response[i].tuitionFee.slice(1));
                    rentalTotal += Number(response[i].rentalFee.slice(1));
                    specialTotal += Number(response[i].specialFee.slice(1));
                }
    
                $("#incomeDesc").text(`Final Grand Total: ${total}, Tuition Total: ${tuitionTotal}, Rental Total: ${rentalTotal}, Special Total: ${specialTotal}`);
            }
        });
    }

    function fetchLessons() {
        Util.ajaxRequest("/teacher/process/fetchAllLessons", "POST", { }, function (response) {
            response = JSON.parse(response);
            // let total = 0;
            // let tuitionTotal = 0;
            // let rentalTotal = 0;
            // let specialTotal = 0;

            Util.generateTable(
                response,
                "#showLessons",
                [],
                ["name", "email", "lessons"]
            );
            
            // if (response.length) {
            //     for (let i = 0; i < response.length; i++) {
            //         total += Number(response[i].grandTotal.slice(1));
            //         tuitionTotal += Number(response[i].tuitionFee.slice(1));
            //         rentalTotal += Number(response[i].rentalFee.slice(1));
            //         specialTotal += Number(response[i].specialFee.slice(1));
            //     }
    
            //     $("#incomeDesc").text(`Final Grand Total: ${total}, Tuition Total: ${tuitionTotal}, Rental Total: ${rentalTotal}, Special Total: ${specialTotal}`);
            // }
        });
    }
});