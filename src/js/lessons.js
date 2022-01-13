import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchLessons(new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase());

    document.getElementById('date').valueAsDate = new Date();
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
                    Util.ajaxRequest("/teacher/process/saveLesson", "POST", { lesson: $(`#${userId}-input`).val(), id: userId, lessons: JSON.stringify(result.prevLesson), dates: JSON.stringify(result.prevDate) }, function (response) {
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
                                prevContent += `<p>${res.prevDate[j]}&nbsp;&nbsp;&nbsp;${res.prevLesson[j]}</p>`;
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
                                        <div class="col-10">
                                            <input type="text" class="form-control pt-2 lesson" name="lesson" id="${res.userId}-input">
                                            <input type="hidden" class="form-control pt-2 lesson" value="${res.name}" id="${res.userId}-name">
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