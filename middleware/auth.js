module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/users/login');
    },
    ensureRole: function(role) {
        return function(req, res, next) {
            if (req.user && req.user.role === role) {
                return next();
            }
            req.flash('error_msg', 'Not authorized');
            res.redirect('/users/login');
        }
    }
}
