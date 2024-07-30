const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { ensureAuthenticated } = require('../middleware/auth');
let User = require('../models/user');
let Appointment = require('../models/appointment');
const Message = require('../models/message');
const Rating = require('../models/rating');

// 1. Limit User Registration
const registeredUsernames = new Set();

// 2. Student's Search Page
router.get('/search-tutors', (req, res) => {
    // Implement the tutor search page...
    res.render('searchTutors', { layout: false });
});

// 3. Merge Sent and Received Messages
router.get('/messages', ensureAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        }).populate(['senderId', 'receiverId']);

        res.render('messages', { messages });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the messages.');
        res.redirect('/tutor_dashboard');
    }
});

// 4. Admin Registration
router.get('/register-admin', (req, res) => {
    res.render('registerAdmin', { layout: false });
});

router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, username, password, role } = req.body;

        // You can add a check here to ensure a specific value (e.g., an admin code) is required for role 'admin' registration.

        let newUser = new User({
            name,
            email,
            username,
            password,
            role,
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        req.flash('success_msg', 'Admin registered successfully.');
        res.redirect('/users/login');
    } catch (err) {
        console.error(err);
        // Handle the error appropriately
    }
});

// 8. Update User Information
router.get('/update-profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('updateProfile', { user });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the profile settings.');
        res.redirect('/dashboard');
    }
});

router.post('/update-profile', ensureAuthenticated, async (req, res) => {
    try {
        // Implement user profile update logic here...

        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/dashboard');
    }
});
   


        const selectedCourses = req.body.courses; 

        const updatedData = {
            name,
            phone,
            address,
            timezone,
            bio,
            experience,
            courses: selectedCourses, 
            teachingApproach,
            freeTimeSlots: freeTimeSlots // Here we add the time slot to the user's data
        };
        console.log(freeTimeSlots);
        console.log(req.body);  // log this just after entering the route function

        // The rest remains the same...
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, { new: true });
        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/users/profile');
        console.log(updatedUser);

     {
        console.error(error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/tutor_dashboard'); 
    }


router.get('/profile-settings', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('profileSettings', { user }); 
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the profile settings.');
        res.redirect('/dashboard');
    }
});
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login',{ layout: false });
});

router.post('/search-tutors', async (req, res) => {
    try {
        let filters = {};
        
        if (req.body.courses) {
            filters.courses = req.body.courses;
        }
        if (req.body.timezone) {
            filters.timezone = req.body.timezone;
        }
        // ... add other filters as needed

        const tutorsList = await User.find(filters).where('role').equals('tutor');
        console.log(filters);
        console.log(tutorsList);
        res.render('dashboard/student_dashboard', { tutors: tutorsList, layout: false });

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/dashboard');
    }
});

router.get('/get-tutor-slots/:tutorId?', async (req, res) => {
    try {
        const { tutorId } = req.params;
        let query = { role: 'tutor' };
        if (tutorId) {
            query._id = tutorId;
        }

        const tutors = await User.find(query);
        let events = [];
        tutors.forEach(tutor => {
            tutor.freeTimeSlots.forEach(slot => {
                events.push({
                    title: `${tutor.name} (${slot.from}-${slot.to})`,
                    start: `${slot.date.toISOString().split('T')[0]}T${slot.from}`, 
                    end: `${slot.date.toISOString().split('T')[0]}T${slot.to}`
                });
            });
        });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('profile', { user });  // Assuming 'profile.ejs' is the view template for the profile page.
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the profile.');
        res.redirect('/dashboard');
    }
});
router.post('/book-appointment', ensureAuthenticated, async (req, res) => {
    try {
        const { tutorId, fromTime, toTime } = req.body;

        
        let newAppointment = new Appointment({
            studentId: req.user._id,
            tutorId: tutorId,
            fromTime: fromTime,
            toTime: toTime
        });

        await newAppointment.save();

        res.json({ success: true, message: "Appointment booked successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});
router.get('/notifications', ensureAuthenticated, async (req, res) => {
    if (req.user.role === 'tutor') {
        try {
            const appointments = await Appointment.find({ tutorId: req.user._id }).populate('studentId').populate('tutorId');
            res.render('notifications', { appointments: appointments });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'An error occurred fetching the appointments.');
            res.redirect('/some-error-page');  
        }
    } else if(req.user.role === 'student') {
        try {
const appointments = await Appointment.find({ studentId: req.user._id }).populate('tutorId');
            res.render('student_appointments', { appointments: appointments, layout: false });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'An error occurred fetching your appointments.');
            res.redirect('/dashboard');  
        }
    } else {
        // Handle other roles or redirect them elsewhere
        res.redirect('/dashboard');
    }
});


router.get('/help', (req, res) => {
    res.render('help'); // This will render the help.ejs template
});


router.post('/send-message', ensureAuthenticated, async (req, res) => {
    try {
        let message = new Message({
            senderId: req.user._id,
            receiverId: req.body.receiverId,
            content: req.body.content
        });

        await message.save();

        res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});

router.get('/messages', ensureAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({ receiverId: req.user._id }).populate('senderId');
        res.render('messages', { messages });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the messages.');
        res.redirect('/tutor_dashboard');
    }
});
router.get('/sent-messages', ensureAuthenticated, async (req, res) => {
    try {
        const sentMessages = await Message.find({ senderId: req.user._id }).populate('receiverId');
        const receivedMessages = await Message.find({ receiverId: req.user._id }).populate('senderId');
        
        res.render('sent_messages', { sentMessages, receivedMessages, layout: false });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the messages.');
        res.redirect('/dashboard');
    }
});

router.post('/appointment/accept', async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.body.appointmentId, { status: 'Accepted' });

    

        res.json({ success: true, message: "Appointment accepted." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});

router.post('/appointment/reject', async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.body.appointmentId, { status: 'Rejected' });

        res.json({ success: true, message: "Appointment rejected." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});
router.post('/rate-tutor', ensureAuthenticated, async (req, res) => {
    try {
        const { tutorId, ratingValue } = req.body;
        if (!tutorId || !ratingValue) {
            return res.json({ success: false, message: "Please provide all necessary information." });
        }

        const existingRating = await Rating.findOne({ tutorId, studentId: req.user._id });
        if (existingRating) {
            existingRating.rating = ratingValue;
            await existingRating.save();
        } else {
            const rating = new Rating({
                tutorId,
                studentId: req.user._id,
                rating: ratingValue
            });
            await rating.save();
        }

        res.json({ success: true, message: "Thank you for your feedback!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});
router.get('/view-ratings', ensureAuthenticated, async (req, res) => {
    if (req.user.role !== 'tutor') {
        req.flash('error_msg', 'Access denied.');
        return res.redirect('/dashboard');
    }

    try {
        const ratings = await Rating.find({ tutorId: req.user._id }).populate('studentId');
        res.render('ratings', { ratings });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the ratings.');
        res.redirect('/dashboard');
    }
});
router.get('/edit-profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('editProfile', { user, layout: false });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred fetching the profile settings.');
        res.redirect('/dashboard');
    }
});
router.post('/edit-profile', ensureAuthenticated, async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const updatedData = {
            name,
            email,
            username
        };

        if(password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(password, salt);
        }

        await User.findByIdAndUpdate(req.user._id, updatedData);
        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/dashboard');

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/dashboard');
    }
});

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return done(null, false, { message: 'No user found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Wrong password' });
        }
    } catch (err) {
        return done(err);
    }
}));
router.post('/appointment/modify', async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.body.appointmentId, { fromTime: req.body.fromTime, toTime: req.body.toTime });

        res.json({ success: true, message: "Appointment modified." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred." });
    }
});
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});



router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;
