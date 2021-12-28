const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const moment = require('moment');
const mailer = require('nodemailer');

const config = require('../config.json');
const Students = require('./models/Students');
const Schedules = require('./models/Schedules');
const Tuitions = require('./models/Tuitions');
const Teachers = require('./models/Teachers');
const Invoices = require('./models/Invoices');

const app = express();
const router = express.Router();
const PORT = 5000;

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));
app.use('/', express.static(path.join(__dirname, 'js')));
app.use('/', express.static(path.join(__dirname, 'css')));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

db.connect(config.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log('Loaded database!'));

let transporter = mailer.createTransport({
    service: "gmail",
    auth: {
        user: "elleymusicstudio@gmail.com",
        pass: "sl8633226",
    }
});

router.route('/').get(function (req, res) {
    if (!req.session.teacher) {
        res.redirect('/teacher/login');
    } else {
        res.redirect('/teacher/dashboard');
    }
});

router.route('/teacher/login').get(function (req, res) {
    if (!req.session.teacher) {
        res.render('login');
    } else {
        res.redirect('/teacher/dashboard');
    }
});

router.route('/teacher/dashboard').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/dashboard', {
            pageName: "Dashboard",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/students').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/students', {
            pageName: "Students",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/schedules').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/schedules', {
            pageName: "Schedules",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/tuitions').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/tuitions', {
            pageName: "Tuitions",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/process/login').post(function (req, res) {
    Teachers.findOne({
        email: req.body.email
    }, async (err, data) => {
        if (err) throw err;

        if (!data) {
            res.send("failed");
        } else {
            if (await bcrypt.compare(req.body.password, data.password)) {
                req.session.teacher = {
                    email: req.body.email,
                    authorized: true
                };

                res.send("success");
            } else {
                res.send("failed");
            }
        }
    });
});

router.route('/teacher/process/logout').post(function (req, res) {
    if (req.session.teacher) {
        req.session.destroy(function (err) {
            if (err) throw err;
            res.redirect('/teacher/login');
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/process/createStudent').post(async function (req, res) {
    new Students({
        name: req.body.name,
        birthDate: req.body.birth_date,
        email: req.body.email,
        password: (req.body.password ? await bcrypt.hash(req.body.password, 10) : ""),
        phoneNumber: req.body.phone_number,
        gender: req.body.sex,
        address: req.body.address,
    }).save((err) => {
        if (err) throw err;

        new Schedules({
            name: req.body.name,
            email: req.body.email,
            day: "",
            start: "",
            end: "",
        }).save((err) => {
            if (err) throw err;

            new Tuitions({
                name: req.body.name,
                email: req.body.email,
                tuition: "",
                grandTotal: "",
                lessons: 0,
                rentalInstrument: "",
                rentalFee: "",
                special: "",
                specialFee: ""
            }).save((err) => {
                if (err) throw err;

                res.send("success");
            });
        });
    });
});

router.route('/teacher/process/fetchStudents').post(function (req, res) {
    Students.find((err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

router.route('/teacher/process/fetchStudent').post(function (req, res) {
    Students.findOne({
        _id: req.body.id
    }, (err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

router.route('/teacher/process/editStudent').post(function (req, res) {
    Students.findOneAndUpdate({
        _id: req.body.id
    }, {
        name: req.body.name,
        birthDate: req.body.birth_date,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phone_number,
        gender: req.body.sex,
        address: req.body.address,
    }, (err, data) => {
        if (err) throw err;

        if (data.name != req.body.name || data.email != req.body.email) {
            console.log(data);
            Schedules.findOneAndUpdate({
                email: data.email
            }, {
                name: req.body.name,
                email: req.body.email
            }, (err, result) => {
                if (err) throw err;

                Tuitions.findOneAndUpdate({
                    email: data.email
                }, {
                    name: req.body.name,
                    email: req.body.email
                }, (err, data) => {
                    if (err) throw err;

                    res.send("success");
                });
            });
        } else {
            res.send("success");
        }
    });
});

router.route('/teacher/process/deleteStudent').post(function (req, res) {
    Students.deleteOne({
        _id: req.body.id
    }, (err, data) => {
        if (err) throw err;

        Schedules.deleteOne({
            email: req.body.email
        }, (err, data) => {
            if (err) throw err;

            Tuitions.deleteOne({
                email: req.body.email
            }, (err, data) => {
                if (err) throw err;

                res.send("success");
            });
        });
    });
});

router.route('/teacher/process/fetchSchedules').post(function (req, res) {
    Schedules.find((err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });

});

router.route('/teacher/process/fetchSchedule').post(function (req, res) {
    Schedules.findOne({
        _id: req.body.id
    }, (err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

router.route('/teacher/process/editSchedule').post(function (req, res) {
    if (req.body.id) {
        Schedules.findOneAndUpdate({
            _id: req.body.id
        }, {
            name: req.body.name,
            email: req.body.email,
            day: req.body.day,
            start: moment(req.body.start, "HH:mm").format("hh:mm a"),
            end: moment(req.body.end, "HH:mm").format("hh:mm a"),
        }, (err, data) => {
            if (err) throw err;

            res.send("success");
        });
    } else {
        res.send("no_student");
    }
});

router.route('/teacher/process/fetchTuitions').post(function (req, res) {
    Tuitions.find((err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

router.route('/teacher/process/fetchTuition').post(function (req, res) {
    Tuitions.findOne({
        _id: req.body.id
    }, (err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

router.route('/teacher/process/editTuition').post(function (req, res) {
    if (req.body.id) {
        Tuitions.findOneAndUpdate({
            _id: req.body.id
        }, {
            name: req.body.name,
            email: req.body.email,
            tuition: `$${req.body.tuition.toString()}`,
            grandTotal: `$${req.body.grand_total.toString()}`,
            lessons: `${req.body.lessons.toString()} lessons`,
            lessonDuration: `${req.body.duration.toString()} minutes`,
            rentalInstrument: req.body.rental,
            rentalFee: `$${req.body.rental_fee.toString()}`,
            special: req.body.special,
            specialFee: `$${req.body.special_fee.toString()}`,
        }, (err, data) => {
            if (err) throw err;

            res.send("success");
        });
    } else {
        res.send("no_student");
    }
});

router.route('/teacher/process/sendInvoice').post(function (req, res) {
    const tuition = JSON.parse(req.body.response);

    Schedules.findOne({
        email: tuition.email
    }, (err, data) => {
        if (err) throw err;

        const message = {
            from: "elleymusicstudio@gmail.com",
            to: tuition.email,
            subject: "INVOICE from The Music Studio",
            html: `<h2><b>INVOICE</b></h2><br>Date: ${moment().format('MMMM Do YYYY')}<br><br><br><b>Name of student: </b>${tuition.name}<br><br>Suzuki Piano Class: ${tuition.lessonDuration} / ${tuition.lessons}<br>$${(Number(tuition.tuition.slice(1)) * Number(tuition.lessons.slice(0, -8))).toString()}</div><br><br>${tuition.lessons} on ${data.day} from ${data.start} to ${data.end}<br><br><br><br>** Other than emergency or illness, the change has to inform one day advance to reschedule the class.<br><b>Please kindly inform our studio at least on day in advance to reschedule the class.</b><br><br>** The Music Studio is not responsible for any personal injury, accident, or damage to personal property of any people occuring on the premises of the studio/house.<br><br><br>Thank You for choosing The Music Studio!<br><br><br><b>The Music Studio</b><br><b>447 NW 156th Lane</b><br><b>Pembroke Pines FL 33028</b><br><u>elleymusicstudio@gmail.com</u><br><b>786-374-5886</b>`
        }

        transporter.sendMail(message, function (err, response) {
            if (err) throw err;

            new Invoices({
                tuitionId: tuition._id,
                name: tuition.name,
                email: tuition.email,
                grandTotal: tuition.grandTotal,
                time: moment().format('MMMM Do YYYY, h:mm:ss a'),
            }).save((err) => {
                if (err) throw err;
        
                res.send("success")
            });
        });
    });
});

router.route('/teacher/process/fetchHistory').post(function (req, res) {
    Invoices.find((err, data) => {
        if (err) throw err;

        res.send(JSON.stringify(data));
    });
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server initialized on port: http://localhost:${PORT}`);
});