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
    isi: {
        type: String,
        default: true
    },
    image1: {
        type: String,
        default: '',
        required: true
    },
    dateCreated: {
        type: String,
        default: Date,
    },
})

artikelSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

artikelSchema.set('toJSON', {
    virtuals: true,
});


exports.Artikel = mongoose.model('Artikel', artikelSchema);
