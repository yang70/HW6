const express = require('express');
const mysql   = require('./helpers/dbcon.js');

const app = express();

const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.get('/',(_req,res,next) => {
    mysql.pool.query('SELECT * FROM workouts', (err, rows, _fields) => {
        if(err){
            next(err);
            return;
        }

        // res.json(rows);
        res.json({hello: 'world'});
    });
});

app.get('/new',function(req,res,next){
    mysql.pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.c], function(err, result){
        if(err){
            next(err);
            return;
        }

        context.results = "Inserted id " + result.insertId;
        res.render('home',context);
    });
});

app.get('/delete',function(req,res,next){
    var context = {};

    mysql.pool.query("DELETE FROM todo WHERE id=?", [req.query.id], function(err, result){
        if(err){
            next(err);
            return;
        }

        context.results = "Deleted " + result.changedRows + " rows.";
        res.render('home',context);
    });
});


///simple-update?id=2&name=The+Task&done=false&due=2015-12-5
app.get('/simple-update',function(req,res,next){
    var context = {};

    mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
        [
            req.query.name,
            req.query.done,
            req.query.due,
            req.query.id
        ],
        function(err, result){
            if(err){
                next(err);
                return;
            }

            context.results = "Updated " + result.changedRows + " rows.";
            res.render('home',context);
        }
    );
});

///safe-update?id=1&name=The+Task&done=false
app.get('/safe-update',function(req,res,next){
    var context = {};

    mysql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
        if(err){
            next(err);
            return;
        }

        if(result.length == 1){
            var curVals = result[0];
            mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
                [
                    req.query.name || curVals.name,
                    req.query.done || curVals.done,
                    req.query.due || curVals.due,
                    req.query.id
                ],

                function(err, result){
                    if(err){
                        next(err);
                        return;
                    }
                    context.results = "Updated " + result.changedRows + " rows.";
                    res.render('home',context);
                }
            );
        }
    });
});

app.get('/reset-table',function(_req,res,_next){
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(_err){
        var createString = "CREATE TABLE workouts("+
            "id INT PRIMARY KEY AUTO_INCREMENT,"+
            "name VARCHAR(255) NOT NULL,"+
            "reps INT,"+
            "weight INT,"+
            "date DATE,"+
            "lbs BOOLEAN)";

        mysql.pool.query(createString, function(_err){
            res.json({results: "Table created."});
        })
    });
});

app.use(function(_req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, _req, res, _next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});