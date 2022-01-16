export default class Util {
    ajaxRequest(url, method, data, success, type) {
        if (!type) {
            $.ajax({
                url: url,
                method: method,
                data: data,
                success: success
            });
        } else if (type == "image") {
            $.ajax({
                url: url,
                method: method,
                processType: false,
                contentType: false,
                cache: false,
                data: data,
                success: success
            });
        }
    }

    sweetAlert(type, title, description, confirmText, cancelText, icon, then, next) {
        if (type == "custom") {
            Swal.fire({
                title: title,
                html: description,
                icon: icon,
                showCancelButton: (cancelText != "" ? true : false),
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
            }).then((result) => {
                if (result.isConfirmed) {
                    then();
                } else {
                    if (typeof next === 'function') {
                        next();
                    }
                }
            });
        } else {
            Swal.fire({
                title: title,
                text: description,
                icon: type,
            });
        }
    }

    resetBtn(btnIdentifier, formIdentifier) {
        $(btnIdentifier).click(function (e) {
            e.preventDefault();

            $(formIdentifier)[0].reset();
        });
    }

    generateTable(response, tbodyId, actions, data) {
        $(tbodyId).html("");
        if (response.length) {
            for (let i = 0; i < response.length; i++) {
                let keys = [];
                let values = [];
                let action = [];

                for (let j = 0; j < actions.length; j++) {
                    if (actions.length == 1) {
                        action.push(`<a href="#" id="${response[i][actions[j][0]]}" class="text-${actions[j][1]} ${actions[j][2]}"><i class="fas fa-${actions[j][3]} fa-lg"></i></a>`);
                    } else {
                        action.push(`<a href="#" id="${response[i][actions[j][0]]}" class="text-${actions[j][1]} ${actions[j][2]}"><i class="fas fa-${actions[j][3]} fa-lg"></i></a>&nbsp;&nbsp;`);
                    }
                }
                for (let j = 0; j < Object.keys(response[i]).length; j++) {
                    keys.push(Object.keys(response[i])[j]);
                }
                for (let j = 0; j < keys.length; j++) {
                    if (keys.includes(data[j])) {
                        values.push(`<td>${response[i][data[j]]}</td>`);
                    }
                }

                $(tbodyId).append(
                    $("<tr />").append(
                        (action.length > 0 ? $("<td />").html($.each(action, function (index, obj) {})) : ''),
                        $.each(values, function (index, obj) {})
                    )
                );
            }
        } else {
            $(tbodyId).html("");
        }
    }
}