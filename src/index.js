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
const History = require('./models/History');
const Attendance = require('./models/Attendance');
const Lessons = require('./models/Lessons');
const Settings = require('./models/Settings');

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

const fetchSettings = function (type) {
    return Settings.findOne({
        type: type
    });
}

let result;

fetchSettings("general").then(function (res) {
    result = res;
});

router.route('/teacher/dashboard').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/dashboard', {
            siteName: result.siteName,
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
            instruments: result.instruments,
            siteName: result.siteName,
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
            siteName: result.siteName,
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
            siteName: result.siteName,
            pageName: "Tuitions",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/lessons').get(function (req, res) {
    if (req.session.teacher) {
        res.render('teacher/lessons', {
            siteName: result.siteName,
            pageName: "Lessons",
            fs: fs,
            name: req.session.teacher.email
        });
    } else {
        res.redirect('/teacher/login');
    }
});

router.route('/teacher/settings').get(function (req, res) {
    if (req.session.teacher) {
        res.render('settings/settings', {
            instruments: result.instruments,
            siteName: result.siteName,
            pageName: "Settings",
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

router.route('/teacher/process/logout').get(function (req, res) {
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
    try {
        const student = new Students({
            name: req.body.name,
            birthDate: req.body.birth_date,
            email: req.body.email,
            password: (req.body.password ? await bcrypt.hash(req.body.password, 10) : ""),
            phoneNumber: req.body.phone_number,
            gender: req.body.sex,
            address: req.body.address,
            instrument: req.body.instrument || "none"
        });

        const schedule = new Schedules({
            userId: student._id,
            name: req.body.name,
            email: req.body.email,
            day: "",
            start: "",
            end: "",
            duration: ""
        });

        const tuition = new Tuitions({
            userId: student._id,
            name: req.body.name,
            email: req.body.email,
            tuition: "",
            grandTotal: "",
            lessons: 0,
            lessonDuration: "",
            rentalInstrument: "none",
            rentalFee: "$0",
            special: "",
            specialFee: "$0"
        });

        const lesson = new Lessons({
            userId: student._id,
            name: req.body.name,
            email: req.body.email,
            prevLesson: ["This student doesn't have a previous lesson", "This student doesn't have a previous lesson", "This student doesn't have a previous lesson", "This student doesn't have a previous lesson"],
            prevDate: ["", "", "", ""],
            lessons: 0
        });

        await student.save();
        await schedule.save();
        await tuition.save();
        await lesson.save();
        await res.send("success");
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchStudents').post(async function (req, res) {
    try {
        const students = await Students.find({
            deleted: req.body.type
        });
        await res.send(JSON.stringify(students));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchStudent').post(async function (req, res) {
    try {
        const student = await Students.findOne({
            _id: req.body.id
        });
        await res.send(JSON.stringify(student));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/editStudent').post(async function (req, res) {
    try {
        const student = await Students.findOneAndUpdate({
            _id: req.body.id
        }, {
            name: req.body.name,
            birthDate: req.body.birth_date,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phone_number,
            gender: req.body.sex,
            address: req.body.address,
        });

        if (student.name != req.body.name || student.email != req.body.email) {
            await Schedules.findOneAndUpdate({
                userId: req.body.id
            }, {
                name: req.body.name,
                email: req.body.email
            });

            await Tuitions.findOneAndUpdate({
                userId: req.body.id
            }, {
                name: req.body.name,
                email: req.body.email
            });

            await Lessons.findOneAndUpdate({
                userId: req.body.id
            }, {
                name: req.body.name,
                email: req.body.email
            });

            await res.send("success");
        } else {
            await res.send("success");
        }
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/deleteStudent').post(async function (req, res) {
    try {
        await Students.findOneAndUpdate({
            _id: req.body.id
        }, {
            deleted: true
        });

        await Schedules.findOneAndUpdate({
            userId: req.body.id
        }, {
            disabled: true
        });

        await Tuitions.findOneAndUpdate({
            userId: req.body.id
        }, {
            disabled: true
        });

        await Lessons.findOneAndUpdate({
            userId: req.body.id
        }, {
            disabled: true
        });

        await res.send("success");
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchSchedules').post(async function (req, res) {
    try {
        const schedules = await Schedules.find({
            disabled: false
        });

        await res.send(JSON.stringify(schedules));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchSchedule').post(async function (req, res) {
    try {
        const schedule = await Schedules.findOne({
            _id: req.body.id
        });

        await res.send(JSON.stringify(schedule));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/editSchedule').post(async function (req, res) {
    const duration = moment.duration(moment(req.body.end, "HH:mm").diff(moment(req.body.start, "HH:mm")))

    if (req.body.id) {
        try {
            const schedule = await Schedules.findOneAndUpdate({
                _id: req.body.id
            }, {
                name: req.body.name,
                email: req.body.email,
                day: req.body.day,
                start: moment(req.body.start, "HH:mm").format("hh:mm a"),
                end: moment(req.body.end, "HH:mm").format("hh:mm a"),
                duration: `${duration.hours()} hours ${duration.minutes()} minutes`
            });

            await Tuitions.findOneAndUpdate({
                userId: schedule.userId
            }, {
                lessonDuration: `${((Number(duration.hours()) * 60) + Number(duration.minutes())).toString()} minutes`
            });

            await res.send("success");
        } catch (err) {
            throw err;
        }
    } else {
        res.send("no_student");
    }
});

router.route('/teacher/process/fetchTuitions').post(async function (req, res) {
    try {
        const tuitions = await Tuitions.find({
            disabled: false
        });

        await res.send(JSON.stringify(tuitions));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchTuition').post(async function (req, res) {
    try {
        const tuition = await Tuitions.findOne({
            _id: req.body.id
        });

        await res.send(JSON.stringify(tuition));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/editTuition').post(async function (req, res) {
    if (req.body.id) {
        try {
            await Tuitions.findOneAndUpdate({
                _id: req.body.id
            }, {
                name: req.body.name,
                email: req.body.email,
                tuition: `$${req.body.tuition.toString()}`,
                grandTotal: `$${req.body.grand_total.toString()}`,
                lessons: `${req.body.lessons.toString()} lessons`,
                lessonDuration: `${req.body.duration.toString()} minutes`,
                rentalInstrument: req.body.rental,
                rentalFee: `$${req.body.rental_fee.toString() ? req.body.rental_fee.toString() : '0'}`,
                special: req.body.special,
                specialFee: `$${req.body.special_fee.toString() ? req.body.special_fee.toString() : '0'}`,
            });

            await res.send("success");
        } catch (err) {
            throw err;
        }

    } else {
        res.send("no_student");
    }
});

router.route('/teacher/process/sendInvoice').post(async function (req, res) {
    const tuition = JSON.parse(req.body.response);

    try {
        const student = await Students.findOne({
            _id: tuition.userId
        });
        const schedule = await Schedules.findOne({
            userId: tuition.userId
        });

        if (schedule.day === "" || schedule.start === "" || schedule.end === "") {
            await res.send("schedule");
        } else if (tuition.lessonDuration === "" || tuition.lessons === "" || tuition.tuition === "" || tuition.grandTotal === "") {
            await res.send("tuition");
        } else {
            const message = {
                from: "elleymusicstudio@gmail.com",
                to: tuition.email,
                subject: "INVOICE from The Music Studio",
                html: `<h2><b>INVOICE</b></h2><br>Date: ${moment().format('MMMM Do YYYY')}<br><br><br><b>Name of student: </b>${tuition.name}<br><br>Suzuki ${student.instrument} Class: ${tuition.lessonDuration} / ${tuition.lessons}<br>$${(Number(tuition.tuition.slice(1)) * Number(tuition.lessons.slice(0, -8))).toString()}</div><br><br>${tuition.lessons} on ${schedule.day} from ${schedule.start} to ${schedule.end}${(tuition.rentalInstrument != "none" ? `<br><br>Renting a ${tuition.rentalInstrument} for ${tuition.rentalFee}` : '')}${(tuition.specialFee != "$0" ? `<br><br>${tuition.special} for ${tuition.specialFee}` : '')}<br><br><b>Grand Total: ${tuition.grandTotal}</b><br><br><br><br>** Other than emergency or illness, the change has to inform one day advance to reschedule the class.<br><b>Please kindly inform our studio at least one day in advance to reschedule the class.</b><br><br>** The Music Studio is not responsible for any personal injury, accident, or damage to personal property of any people occuring on the premises of the studio/house.<br><br><br>Thank You for choosing The Music Studio!<br><br><br><b>The Music Studio</b><br><b>447 NW 156th Lane</b><br><b>Pembroke Pines FL 33028</b><br><u>elleymusicstudio@gmail.com</u><br><b>786-374-5886</b>`
            }
            await transporter.sendMail(message);

            const history = new History({
                userId: tuition.userId,
                tuitionId: tuition._id,
                name: tuition.name,
                email: tuition.email,
                grandTotal: tuition.grandTotal,
                rentalInstrument: tuition.rentalInstrument,
                rentalFee: tuition.rentalFee,
                tuitionFee: `$${Number(tuition.tuition.slice(1)) * Number(tuition.lessons.slice(0, -8))}`,
                specialFee: tuition.specialFee,
                time: moment().format('MM/DD/YY'),
                type: 'Invoice'
            });
            await history.save();

            await Lessons.findOneAndUpdate({
                userId: student._id
            }, {
                $inc: {
                    lessons: Number(tuition.lessons.slice(0, -8))
                }
            });

            await res.send("success");
        }
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/sendReceipt').post(async function (req, res) {
    const tuition = JSON.parse(req.body.response);

    try {
        const student = await Students.findOne({
            _id: tuition.userId
        });
        const schedule = await Schedules.findOne({
            userId: tuition.userId
        });

        if (schedule.day === "" || schedule.start === "" || schedule.end === "") {
            await res.send("schedule");
        } else if (tuition.lessonDuration === "" || tuition.lessons === "" || tuition.tuition === "" || tuition.grandTotal === "") {
            await res.send("tuition");
        } else {
            const message = {
                from: "elleymusicstudio@gmail.com",
                to: tuition.email,
                subject: "RECEIPT from The Music Studio",
                html: `<h2><b>RECEIPT</b></h2><br>Date: ${moment().format('MMMM Do YYYY')}<br><br><br><b>Name of student: </b>${tuition.name}<br><br>Suzuki ${student.instrument} Class: ${tuition.lessonDuration} / ${tuition.lessons}<br>$${(Number(tuition.tuition.slice(1)) * Number(tuition.lessons.slice(0, -8))).toString()}</div><br><br>${tuition.lessons} on ${schedule.day} from ${schedule.start} to ${schedule.end}${(tuition.rentalInstrument != "none" ? `<br><br>Renting a ${tuition.rentalInstrument} for ${tuition.rentalFee}` : '')}${(tuition.specialFee != "$0" ? `<br><br>${tuition.special} for ${tuition.specialFee}` : '')}<br><br><b>Grand Total: ${tuition.grandTotal}</b><br><br><br><br>** Other than emergency or illness, the change has to inform one day advance to reschedule the class.<br><b>Please kindly inform our studio at least one day in advance to reschedule the class.</b><br><br>** The Music Studio is not responsible for any personal injury, accident, or damage to personal property of any people occuring on the premises of the studio/house.<br><br><br>Thank You for choosing The Music Studio!<br><br><br><b>The Music Studio</b><br><b>447 NW 156th Lane</b><br><b>Pembroke Pines FL 33028</b><br><u>elleymusicstudio@gmail.com</u><br><b>786-374-5886</b>`
            }
            await transporter.sendMail(message);

            const history = new History({
                userId: tuition.userId,
                tuitionId: tuition._id,
                name: tuition.name,
                email: tuition.email,
                grandTotal: tuition.grandTotal,
                rentalInstrument: tuition.rentalInstrument,
                rentalFee: tuition.rentalFee,
                tuitionFee: `$${Number(tuition.tuition.slice(1)) * Number(tuition.lessons.slice(0, -8))}`,
                specialFee: tuition.specialFee,
                time: moment().format('MM/DD/YY'),
                type: 'Receipt'
            });
            await history.save();

            await Lessons.findOneAndUpdate({
                userId: student._id
            }, {
                $inc: {
                    lessons: Number(tuition.lessons.slice(0, -8))
                }
            });

            await res.send("success");
        }
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchHistory').post(async function (req, res) {
    try {
        const histories = await History.find();

        await res.send(JSON.stringify(histories));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchFullHistory').post(async function (req, res) {
    try {
        const history = await History.findOne({
            _id: req.body.id
        });

        await res.send(JSON.stringify(history));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchLessons').post(async function (req, res) {
    try {
        const schedules = await Schedules.find({
            day: req.body.day,
            disabled: false
        });

        await res.send(JSON.stringify(schedules));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchLesson').post(async function (req, res) {
    try {
        const lesson = await Lessons.findOne({
            userId: req.body.id
        });

        await res.send(JSON.stringify(lesson));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/saveLesson').post(async function (req, res) {
    let lessons = JSON.parse(req.body.lessons);
    let dates = JSON.parse(req.body.dates);

    function saveLesson(lessons, dates) {
        lessons.pop();
        lessons.unshift(req.body.lesson);
        dates.pop();
        dates.unshift(moment(req.body.date).format('L'));
    }

    try {
        saveLesson(lessons, dates);
        const lesson = await Lessons.findOneAndUpdate({
            userId: req.body.id
        }, {
            $inc: {
                lessons: -1
            },
            prevLesson: lessons,
            prevDate: dates
        });

        const attendance = new Attendance({
            userId: req.body.id,
            lessonId: lesson._id,
            name: lesson.name,
            email: lesson.email,
            lesson: req.body.lesson,
            time: moment(req.body.date).format('MM/DD/YY'),
        });

        await attendance.save();
        await res.send("success");
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/deleteLesson').post(async function (req, res) {
    let lessons = JSON.parse(req.body.lessons);
    let dates = JSON.parse(req.body.dates);

    function deleteLesson(lessons, dates) {
        lessons.splice(req.body.index, 1);
        lessons.push(" ");
        dates.splice(req.body.index, 1);
        dates.push(" ");
    }

    try {
        await Attendance.findOneAndDelete({
            userId: req.body.id,
            lesson: lessons[req.body.index]
        });

        deleteLesson(lessons, dates);
        const lesson = await Lessons.findOneAndUpdate({
            userId: req.body.id
        }, {
            $inc: {
                lessons: 1
            },
            prevLesson: lessons,
            prevDate: dates
        });

        await res.send("success");
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/fetchSettings').post(async function (req, res) {
    try {
        const settings = await Settings.findOne({
            type: req.body.type
        });

        await res.send(JSON.stringify(settings));
    } catch (err) {
        throw err;
    }
});

router.route('/teacher/process/editGeneralSettings').post(async function (req, res) {
    let instruments = [];

    function generateInstruments () {
        for (let i = 0; i < req.body.instrumentLength; i++) {
            instruments.push(req.body[`instrument${i}`]);
        }
    }

    try {
        generateInstruments();

        await Settings.findOneAndUpdate({
            type: "general"
        }, {
            siteName: req.body.siteName,
            instruments: instruments
        });

        await res.send("success");

        fetchSettings("general").then(function (res) {
            result = res;
        });
    } catch (err) {
        throw err;
    } 
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server initialized on port: http://localhost:${PORT}`);
});