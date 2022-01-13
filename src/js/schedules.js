import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchSchedules();
    Util.resetBtn("#resetBtn", "#scheduleForm");

    const convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'pm') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    }

    $(document).on('click', '#editScheduleBtn', function (e) {
        if ($("#scheduleForm")[0].checkValidity()) {
            e.preventDefault();

            Util.ajaxRequest("/teacher/process/editSchedule", "POST", $("#scheduleForm").serialize() + `&id=${$("#_id").val()}`, function (response) {
                if (response == "success") {
                    $("#scheduleForm")[0].reset();
                    Util.sweetAlert("success", "Edited!", "This schedule has successfully been edited!");
                    fetchSchedules();
                } else if (response == "no_student") {
                    Util.sweetAlert("error", "Operation Failed!", "Could not find and select student's schedule!")
                } else {
                    Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that schedule!");
                }
            });
        }
    });

    $(document).on('click', '.editSchedule', function (e) {
        e.preventDefault();

        Util.ajaxRequest("/teacher/process/fetchSchedule", "POST", {
            id: $(this).attr('id')
        }, function (response) {
            response = JSON.parse(response);
            
            $("#scheduleForm")[0].reset();
            $("#_id").val(response._id);
            $("#name").val(response.name);
            $("#email").val(response.email);
            $(`#${response.day}`).prop('selected', 'true');
            $("#start").val(convertTime12to24(response.start));
            $("#end").val(convertTime12to24(response.end));
        });
    });

    function fetchSchedules() {
        Util.ajaxRequest("/teacher/process/fetchSchedules", "POST", "", function (response) {
            response = JSON.parse(response);

            Util.generateTable(
                response,
                "#showSchedules",
                [
                    ["_id", "warning", "editSchedule", "edit"]
                ],
                ["name", "email", "day", "start", "end", "duration"]
            );
        });
    }
});