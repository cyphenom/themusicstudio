import Utils from './utils.js';
const Util = new Utils();

$(function () {
    $("#loginBtn").click(function (e) {
        if ($("#loginForm")[0].checkValidity()) {
            e.preventDefault();

            Util.ajaxRequest("/teacher/process/login", "POST", $("#loginForm").serialize(), function (response) {
                if (response == 'success') {
                    location.href = '/teacher/lessons';
                } else {
                    alert("Username or password is incorrect!");
                }
            });
        }
    });
});