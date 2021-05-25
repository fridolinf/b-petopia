const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    
    pertanyaan: {
        type: String,
        required: true,
    },
    jawaban: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

faqSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

faqSchema.set('toJSON', {
    virtuals: true,
});


exports.Faq = mongoose.model('Faq', faqSchema);
