let express = require('express');
let router = express.Router();
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;

// GET category model
let Category = require('../models/category')
const Page = require("../models/page");

/*
 * GET category index
 */
router.get('/', isAdmin, function (req, res) {
    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
 * GET add category
 */
router.get('/add-category', isAdmin, function (req, res) {
    let title = "";

    res.render('admin/add_category', ({
        title: title
    }));
});

/*
 * POST add category
 */
router.post('/add-category', function (req, res) {

    req.checkBody('title', 'the title must have a value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', ({
            errors: errors,
            title: title
        }));
    } else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                req.flash('danger', 'category title exists, choose another one');
                res.render('admin/add_category', ({
                    title: title
                }));
            } else {
                let category = new Category({
                    title: title,
                    slug: slug
                });

                category.save(function (err) {
                    if (err) return console.log(err);

                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success', 'Category added');
                    res.redirect('/admin/categories');
                })
            }
        });
    }
})

/*
 * GET edit category
 */
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err) return console.log(err);
        res.render('admin/edit_category', ({
            title: category.title,
            id: category._id
        }));
    });

});

/*
 * POST edit category
 */
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'title must have a value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_category', ({
            errors: errors,
            title: title,
            id: id
        }));
    } else {
        Category.findOne({slug: slug, _id:{'$ne':id}}, function (err, category) {
            if (category) {
                req.flash('danger', 'category title already exists, choose another one');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {

                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err)
                            return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'Category edited');
                        res.redirect('/admin/categories/edit-category/'+ id );
                    });

                });

            }
        });
    }
})

/*
 * GET delete category
 */
router.get('/delete-category/:id', isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);

        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'Category deleted');
        res.redirect('/admin/categories/');
    });
});

// exports
module.exports = router;