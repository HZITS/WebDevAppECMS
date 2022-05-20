const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const https = require('https');
const path = require("path");

router.use(bodyParser.urlencoded({extended:true}));

// get page model
let Page = require('../models/page');

router.get('/', function (req, res) {
    Page.findOne({slug: 'home'}, function (err, page) {
        if (err)
            console.log(err);

        res.render('index', {
            title: page.title,
            content: page.content
            // get a page
        });
    });
});

// get a page
router.get('/:slug', function (req, res) {

    let slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if (err)
            console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });


});

// router.post('/',(req, res) => {
//     let currency=req.body.currency;
//     let apikey="340778BF-C9A1-4289-AB24-E684707B4DC3"
//     let url="https://rest.coinapi.io/v1/exchangerate/"+currency+"/USD?apikey="+apikey;
//     https.get(url,(response)=>{
//         response.on('data', (d) => {
//             let json=JSON.parse(d);
//             let exchangeRate=json.rate;
//             console.log(exchangeRate);
//             res.render(path.resolve('./views/index.ejs'),{title: 'Home',
//                 content: "home", ans: currency, c: exchangeRate});
//         });
//     });
// });

// exports
module.exports = router;