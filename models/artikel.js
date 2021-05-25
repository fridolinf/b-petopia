const mongoose = require('mongoose');

const artikelSchema = mongoose.Schema({
    
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    isiBerita: {
        type: String,
        default: true
    },
    image1: {
        type: String,
        default: '',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

artikelSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

artikelSchema.set('toJSON', {
    virtuals: true,
});


exports.Artikel = mongoose.model('Artikel', artikelSchema);
