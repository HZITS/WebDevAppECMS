let express = require('express');
let router = express.Router();

// get page model
let Page = require('../models/page')

/*
 * GET pages index
 */
router.get('/', function (req, res) {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
           pages: pages
        });
    });
});

/*
 * GET add pages
 */
router.get('/add-page', function (req, res) {
    let title = "";
    let slug = "";
    let content = "";

    res.render('admin/add_page', ({
        title: title,
        slug: slug,
        content: content
    }));
})

/*
 * POST add pages
 */
router.post('/add-page', function (req, res) {

    req.checkBody('title', 'the title must have a value').notEmpty();
    req.checkBody('content', 'the content must have a value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;

    let errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/add_page', ({
            errors: errors,
            title: title,
            slug: slug,
            content: content
        }));
    } else {
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('danger', 'page slug exists, choose another one');
                res.render('admin/add_page', ({
                    title: title,
                    slug: slug,
                    content: content
                }));
            } else {
                let page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                page.save(function (err) {
                    if (err) return console.log(err);
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                })
            }
        });
    }
})

/*
 * POST reorder pages
 */
router.post('/reorder-page', function (req, res) {
    let ids = req.body['id[]'];

    let count = 0;

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) return console.log(err);
                })
            })
        }) (count);
    }
});

/*
 * GET edit page
 */
router.get('/edit-page/:id', function (req, res) {

    Page.findById(req.params.id, function (err, page) {
        if (err) return console.log(err);
        res.render('admin/edit_page', ({
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        }));
    });

});

/*
 * POST edit pages
 */
router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'the content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', ({
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        }));
    } else {
        Page.findOne({slug: slug, _id:{'$ne':id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'page slug already exists, choose another one');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {

                Page.findById(id, function (err, page) {
                    if (err)
                        return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err)
                            return console.log(err);

                        req.flash('success', 'Page edited');
                        res.redirect('/admin/pages/edit-page/'+id);
                    });

                });

            }
        });
    }
})

/*
 * GET delete page
 */
router.get('/delete-page/:id', function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);

        req.flash('success', 'Page deleted');
        res.redirect('/admin/pages/');
    });
});

// exports
module.exports = router;