const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');
const User = require('../models/user');
let Appointment = require('../models/appointment');

router.get('/login', (req, res) => {
    res.render('login',{ layout: false });
});

router.get('/register', (req, res) => {
    res.render('register',{ layout: false });
});
router.get('/admin_dashboard', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTutors = await User.countDocuments({ role: 'tutor' });
        const activeAppointments = await Appointment.countDocuments(); 
        
        const allStudents = await User.find({ role: 'student' });
        const allTutors = await User.find({ role: 'tutor' });
        
        res.render('admin_dashboard', {
            totalStudents,
            totalTutors,
            activeAppointments,
            allStudents,
            allTutors,
            layout: false

        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to load admin dashboard metrics.');
        res.redirect('/dashboard');
    }
});

router.get('/tutor_dashboard', ensureAuthenticated, ensureRole('tutor'), (req, res) => {
    res.render('tutor_dashboard');  
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    if (req.user.role === 'admin') {
        return res.redirect('/admin_dashboard');
    } else if (req.user.role === 'tutor') {
        return res.redirect('/tutor_dashboard');
    }
    try {
        const tutorsList = await User.find({ role: 'tutor' });  
        res.render('dashboard/student_dashboard', { tutors: tutorsList, layout: false });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the tutors.');
        res.redirect('/some-error-page');  
    }
});



module.exports = router;
