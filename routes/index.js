module.exports = function(app, passport, jsondata, mongoose) {
    var fs = require('fs');
    // var url = require('url');

    var Entry = require('../app/models/entry');

    mongoose.connection.on("open", function() {
        console.log("mongodb is connected!!");
    });

    var createDate = function() {
        var d = new Date();
        var n = d.toLocaleString();
        return n;
    };

    /*Deletes an entry in the database*/
    app.get("/delete/:id", function(req, res) {
        Entry.find({ '_id': req.originalUrl.substr(8) }).remove(function(err, doc) {
            if (err){
                return res.send(500, { error: err });
         }  else{
            res.redirect('/profile');
         } 
        });
    });

    app.post("/create/:id", function(req, res) {
         var fstream;
        // var imageName;
        var foodDescription;
        var foodTitle;
        var loadedImages;
        var newImages =[];
        
        /*Retrieves the form data from the page*/
        req.pipe(req.busboy);
        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            if (key === 'foodDescription'){
             foodDescription = value;
            }
            if (key === 'title'){
             foodTitle = value;
            }
            if (key === 'imageDescription'){
             loadedImages = value;
             var images = loadedImages.split("\r");
             for(var i = 0; i < images.length; i++){
                if(images[i].length > 4){
                var image = images[i].trim();
                newImages.push({name: image});
            }
             }
             console.log(newImages);
            }
        });

        req.busboy.on('file', function(fieldname, file, filename) {
            if(fieldname){
             newImages.push({name: filename});
            }
           file.on('data', function(data){
            
            console.log(filename);
            fstream = fs.createWriteStream(__dirname + "/../public/images/" + filename);
            file.pipe(fstream);
            });
            file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      });
         
     
        });

        req.busboy.on('finish', function() {
            
            Entry.findOneAndUpdate({ '_id': req.originalUrl.substr(8) }, { "local.title": foodTitle, "local.entry": foodDescription, "local.image": newImages }, { upsert: true }, function(err, doc) {
                if (err) {
                    return res.send(500, { error: err });
                }else{ 
                    res.redirect('/profile');
                }
            });
        });
    });

    app.post("/create", function(req, res) {
        var fstream;
        var imageName = [];
        var foodDescription;
        var foodTitle;

        req.pipe(req.busboy);

        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            if (key === 'foodDescription'){
                foodDescription = value;
            }
            if (key === 'title'){
                foodTitle = value;
            }
        });

        req.busboy.on('file', function(fieldname, file, filename) {
            imageName.push({name: filename});
            console.log(filename);
            fstream = fs.createWriteStream(__dirname + "/../public/images/" + filename);
            file.pipe(fstream);
            // fstream.on('close', function() {

            //     var entry = new Entry({
            //         local: {
            //             title: foodTitle,
            //             entry: foodDescription,
            //             image: imageName,
            //             date: createDate(),

            //         }
            //     });

               
            //     entry.save(function(err, todo, count) {
            //         // console.log(todo);

            //         res.redirect('/');

            //     });
            // });
        });

        req.busboy.on('finish', function(){
          var entry = new Entry({
                            local: {
                                title: foodTitle,
                                entry: foodDescription,
                                image: imageName,
                                date: createDate(),

                            }
                        });

                       
                        entry.save(function(err, todo, count) {
                            // console.log(todo);

                            res.redirect('/');

                        });
                });
    });

    app.get('/', function(req, res, next) {
        Entry.find({}, function(err, blogEntries) {
                if (err) {
                    res.render('error', { status: 500 });
                } else {
                    console.log("These are the values it is getting " + blogEntries);
                    console.log("Test" + blogEntries[0]);
                    res.render('index', {
                        title: 'Yuni Foods',
                        items: jsondata,
                        entries: blogEntries
                    });
                }
            });

    });
    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/admin', function(req, res) {
        res.render('admin.ejs', { title: "Admin Page" });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        Entry
            .find({}, function(err, blogEntries) {
                if (err) {
                    res.render('error', { status: 500 });
                } else {
                    // console.log("These are the values it is getting " + blogEntries);
                    res.render('profile', {
                        title: 'Yuni Foods',
                        items: jsondata,
                        entries: blogEntries
                    });
                }
            });
    });



    app.get('/edit/:id', isLoggedIn, function(req, res) {
        Entry
            .findOne({ '_id': req.originalUrl.substr(6) }, function(err, blogEntries) {
                if (err) {
                    res.render('error', { status: 500 });
                } else {

                    console.log("These are the values it is getting " + blogEntries);
                    res.render('edit', {
                        title: 'Yuni Foods',
                        items: jsondata,
                        entries: blogEntries
                    });
                }
            });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            title: "Login Page"
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }
};
