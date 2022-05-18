let mongoose = require('mongoose');

// page schema
let PageSchema = mongoose.Schema({

   title: {
       type: String,
       required: true
   },
    slug: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
});

let Page = module.exports = mongoose.model('Page', PageSchema);