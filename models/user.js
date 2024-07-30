const mongoose = require('mongoose');



const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'tutor'],
        required: true
    },
    phone:{type: String,},
    address:{type:String},
    timezone: {type:String},
    bio: {type:String},
    experience: {type:String},
    courses:{type:[String]},
    teachingApproach: {type:String},
    freeTimeSlots: [{
        date: { type: Date, required: true },
        from: { type: String, required: true },  
        to: { type: String, required: true }     
    }],
    
});

module.exports = mongoose.model('User', UserSchema);
