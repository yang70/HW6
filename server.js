const express = require('express');

const app = express();

const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const mysql = require('./helpers/dbcon.js');
const helpers = require('./helpers.serializer.js)'

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

/////////////////
// Render page //
/////////////////

app.get('/', (_req, res, _next) => {
    res.render('home');
});

///////////////////
// API Endpoints //
///////////////////

// All workouts
app.get('/workouts',(_req, res, next) => {
    mysql.pool.query('SELECT * FROM workouts', (err, rows, _fields) => {
        if(err){
            next(err);
            return;
        }

        res.json(rows.map(serializeWorkout));
    });
});

// Create workout
app.post('/workouts/new',(req, res, next) => {
    mysql.pool.query(
        "INSERT INTO workouts (name, reps, weight, date, lbs) VALUES (?, ?, ?, ?, ?)",
        [
            req.body.name,
            req.body.reps,
            req.body.weight,
            req.body.date,
            req.body.lbs
        ],
        (err, result) => {
            if(err){
                next(err);
                return;
            }

            res.json(result);
        }
    );
});

// Edit workout
app.put('/workouts/:id',function(req,res,next){
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

// Delete workout
app.delete('/workouts/:id',function(req,res,next){
    mysql.pool.query("DELETE FROM todo WHERE id=?", [req.query.id], function(err, result){
        if(err){
            next(err);
            return;
        }

        context.results = "Deleted " + result.changedRows + " rows.";
        res.render('home',context);
    });
});

// Create/reset the 'workouts' table
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
            res.json({results: "Table (re)created."});
        })
    });
});

// 400
app.use(function(_req,res){
    res.status(404);
    res.render('404');
});

// 500
app.use(function(err, _req, res, _next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});