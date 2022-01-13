import Utils from './utils.js';
const Util = new Utils();

$(function () {
    fetchStudents(false);
    Util.resetBtn("#resetBtn", "#studentForm");

    $("#createUserBtn").click(function (e) {
        if ($("#studentForm")[0].checkValidity() && $(this).val() == "Create User") {
            e.preventDefault();

            Util.ajaxRequest("/teacher/process/createStudent", "POST", $("#studentForm").serialize(), function (response) {
                if (response == "success") {
                    $("#studentForm")[0].reset();
                    Util.sweetAlert("success", "Created!", "This student has successfully been created!");
                    fetchStudents(false);
                } else {
                    Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to create that student!");
                }
            });
        }
    });

    $(document).on('click', '#editUserBtn', function (e) {
        if ($("#studentForm")[0].checkValidity() && $(this).val() == "Edit User") {
            e.preventDefault();

            Util.ajaxRequest("/teacher/process/editStudent", "POST", $("#studentForm").serialize() + `&id=${$("#_id").val()}`, function (response) {
                if (response == "success") {
                    $("#studentForm")[0].reset();
                    $("#password").attr('type', 'text').attr('class', 'form-control').attr('value', '');
                    $("#editUserBtn").attr('id', 'createUserBtn').val("Create User").attr('class', 'btn btn-success btn-block');
                    Util.sweetAlert("success", "Edited!", "This student has successfully been edited!");
                    fetchStudents(false);
                } else {
                    Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to edit that student!");
                }
            });
        }
    });

    $(document).on('click', '.editUser', function (e) {
        e.preventDefault();
        $("#createUserBtn").attr('id', 'editUserBtn').val("Edit User").attr('class', 'btn btn-warning btn-block');

        Util.ajaxRequest("/teacher/process/fetchStudent", "POST", {
            id: $(this).attr('id')
        }, function (response) {
            response = JSON.parse(response);
            $("#_id").val(response._id);
            $("#name").val(response.name);
            $("#birth-date").val(response.birthDate.slice(0, 10));
            $("#password").attr('type', 'button').attr('class', 'btn btn-danger btn-block').attr('value', 'Change Password');
            $("#email").val(response.email);
            $(`#${response.gender}`).prop('selected', 'true');
            $("#phone-number").val(response.phoneNumber);
            $("#address").val(response.address);
        });
    });

    $(document).on('click', '.deleteUser', function (e) {
        e.preventDefault();

        Util.ajaxRequest("/teacher/process/fetchStudent", "POST", {
            id: $(this).attr('id')
        }, function (res) {
            res = JSON.parse(res);
            Util.ajaxRequest("/teacher/process/deleteStudent", "POST", {
                id: res._id,
                email: res.email
            }, function (response) {
                if (response == "success") {
                    Util.sweetAlert("success", "Deleted!", "This student has successfully been deleted!");
                    fetchStudents(false);
                } else {
                    Util.sweetAlert("error", "Operation Failed!", "Something went wrong while trying to delete that student!");
                }
            });
        });
    });

    $("#student-type").change(function () {
        if ($(this).val() === "students") {
            fetchStudents(false);
        } else {
            fetchStudents(true);
        }
    });

    function fetchStudents(type) {
        Util.ajaxRequest("/teacher/process/fetchStudents", "POST", { type: type }, function (response) {
            response = JSON.parse(response);
            // $("#showStudents").html("");

            // if (response.length) {
            //     for (let i = 0; i < response.length; i++) {
            //         $("#showStudents").append(
            //             $("<tr />").append(
            //                 $("<td />").html(`
            //                     <a href="#" id="${response[i]._id}" class="text-primary scheduleUser"><i class="fas fa-info-circle fa-lg"></i></a>
            //                     <a href="#" id="${response[i]._id}" class="text-warning editUser"><i class="fas fa-user-edit fa-lg"></i></a>
            //                     <a href="#" id="${response[i]._id}" class="text-danger deleteUser"><i class="fas fa-trash-alt fa-lg"></i></a>
            //                 `),
            //                 $("<td />").text(response[i].name),
            //                 $("<td />").text(response[i].birthDate.slice(0, 10)),
            //                 $("<td />").text(response[i].email),
            //                 $("<td />").text(response[i].gender),
            //                 $("<td />").text(response[i].phoneNumber),
            //                 $("<td />").text(response[i].address),
            //             )
            //         );
            //     }
            // } else {
            //     $("#studentsTable").html("");
            // }

            if (!type) {
                Util.generateTable(
                    response,
                    "#showStudents",
                    [
                        ["_id", "warning", "editUser", "edit"],
                        ["_id", "danger", "deleteUser", "trash"]
                    ],
                    ["name", "birthDate", "email", "gender", "phoneNumber", "address", "instrument"]
                );
            } else {
                Util.generateTable(
                    response,
                    "#showStudents",
                    [
                        ["_id", "warning", "editUser", "edit"],
                        ["_id", "danger", "restoreUser", "trash-restore"]
                    ],
                    ["name", "birthDate", "email", "gender", "phoneNumber", "address", "instrument"]
                );
            }
        });
    }
});