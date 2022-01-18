import Utils from './utils.js';
const Util = new Utils();

$(function () {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    fetchLessons(new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase());

    $("#date").val(`${yyyy}-${mm}-${dd}`);
    $(`#${new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase()}`).prop('selected', true);

    $("#day").change(function () {
        fetchLessons($("#day").val());
    });

    $(document).on('click', '.saveLesson', function (e) {
        const userId = $(this).attr('id');

        if ($(`#${userId}-input`).val()) {
            e.preventDefault();

            Util.sweetAlert("custom", "Are you sure?", `You're saving a lesson for ${$(`#${userId}-name`).val()}`, 'Yes, save it!', 'Cancel', 'warning', function () {
                Util.ajaxRequest("/teacher/process/fetchLesson", "POST", { id: userId }, function (result) {
                    result = JSON.parse(result);
                    Util.ajaxRequest("/teacher/process/saveLesson", "POST", { date: $(`#${userId}-date`).val(), lesson: $(`#${userId}-input`).val(), id: userId, lessons: JSON.stringify(result.prevLesson), dates: JSON.stringify(result.prevDate) }, function (response) {
                        if (response == "success") {
                            Util.sweetAlert("success", "Created!", "This lesson has successfully been created!");
                            fetchLessons($("#day").val());
                        } else {
                            Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to create that lesson!");
                        }
                    });
                });
            });
        } else {
            Util.sweetAlert("error", "Operation Failed!", "Lesson input cannot be blank!");
        }
    });

    $(document).on('click', '.deleteLesson', function (e) {
        const details = $(this).attr('id').split("-");

        e.preventDefault();

        Util.sweetAlert("custom", "Are you sure?", `You're deleting a lesson for ${$(`#${details[1]}-name`).val()}`, 'Yes, deletee it!', 'Cancel', 'warning', function () {
            Util.ajaxRequest("/teacher/process/fetchLesson", "POST", { id: details[1] }, function (result) {
                result = JSON.parse(result);
                Util.ajaxRequest("/teacher/process/deleteLesson", "POST", { index: result.prevLesson.indexOf(details[0]), id: details[1], lessons: JSON.stringify(result.prevLesson), dates: JSON.stringify(result.prevDate) }, function (response) {
                    if (response == "success") {
                        Util.sweetAlert("success", "Deleted!", "This lesson has successfully been deleted!");
                        fetchLessons($("#day").val());
                    } else {
                        Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to delete that lesson!");
                    }
                });
            });
        });

    });

    function fetchLessons(day) {
        Util.ajaxRequest("/teacher/process/fetchLessons", "POST", { day: day }, function (response) {
            response = JSON.parse(response);

            $("#accordion").html("");
            if (response.length) {
                for (let i = 0; i < response.length; i++) {
                    Util.ajaxRequest("/teacher/process/fetchLesson", "POST", { id: response[i].userId }, function (res) {
                        res = JSON.parse(res);
                        let prevContent = "";

                        for (let j = 0; j < res.prevLesson.length; j++) {
                            if (res.prevDate[j] !== "") {
                                prevContent += `<p>${res.prevDate[j]}&nbsp;&nbsp;&nbsp;${res.prevLesson[j]}<button class="btn btn-link deleteLesson" id="${res.prevLesson[j]}-${res.userId}">Delete</button></p>`;
                            } else {
                                prevContent += `<p>${res.prevLesson[j]}</p>`;
                            }
                        }

                        $("#accordion").append(
                            $(`<div class='card-header' id='heading${i}' />`).append(
                                $("<h5 class='mb-0' />").html(`
                                    <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}"> ${response[i].name}</button>
                                    <button class="btn btn-link float-right"> ${res.lessons} lessons</button>
                                `),
                            ),
                            $(`<div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">`).append(
                                $("<div class='card-body' />").html(`
                                    <p>${prevContent}</p>
                                    <div class="row">
                                        <input type="hidden" class="form-control pt-2" value="${res.name}" id="${res.userId}-name">
                                        <div class="col-2">
                                            <input type="date" class="form-control pt-2 date" name="date" id="${res.userId}-date" value="${yyyy}-${mm}-${dd}">
                                        </div>
                                        <div class="col-8">
                                            <input type="text" class="form-control pt-2" name="lesson" id="${res.userId}-input">
                                        </div>
                                        <div class="col-2">
                                            <button class="btn btn-success btn-block saveLesson" id="${res.userId}">Save</button>
                                        </div>
                                    </div>
                                `)
                            )
                        );
                    });
                }
            } else {
                $("#studentsTable").html("");
            }
        });
    }
});