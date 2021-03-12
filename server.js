const express = require('express');

const app = express();

const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const bodyParser = require('body-parser');

// https://express-validator.github.io/docs/index.html
const { body, validationResult } = require('express-validator');

const mysql = require('./helpers/dbcon.js');
const helpers = require('./helpers/helpers.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

///////////////////
// Frontend Page //
///////////////////

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
        res.json(rows.map(helpers.serializeWorkout));
    });
});

// Create workout
app.post(
    '/workouts/new',
    body('name').isLength({ min: 1, max: 255 }),
    body('reps').isInt(),
    body('weight').isInt(),
    body('date').isDate(),
    body('lbs').isBoolean(),
    (req, res, next) => {
        // Parameter validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
    }
);

// Update workout
app.put(
    '/workouts/:id',
    body('name').isLength({ min: 1, max: 255 }),
    body('reps').isInt(),
    body('weight').isInt(),
    body('date').isDate(),
    body('lbs').isBoolean(),
    (req,res,next) => {
        // Parameter validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;

        mysql.pool.query("SELECT * FROM workouts WHERE id=?", [id], (err, result) => {
            if(err) {
                next(err);
                return;
            }

            if(result.length == 1) {
                let workout = result[0];

                mysql.pool.query(
                    "UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
                    [
                        req.body.name || workout.name,
                        req.body.reps || workout.reps,
                        req.body.weight || workout.weight,
                        req.body.date || workout.date,
                        req.body.lbs || workout.lbs,
                        id
                    ],
                    (err, results) => {
                        if(err){
                            next(err);
                            return;
                        }
                        res.json(results);
                    }
                );
            }
        });
    }
);

// Delete workout
app.delete('/workouts/:id',function(req,res,next){
    mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.params.id], (err, result) => {
        if(err){
            next(err);
            return;
        }
        res.json(result);
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
    if(req.headers['content-type'] === 'application/json') {
        res.json({message: "Not found!"});
    }
    else {
        res.render('404');
    }
});

// 500
app.use(function(err, _req, res, _next){
    console.error(err.stack);
    res.status(500);
    if(req.headers['content-type'] === 'application/json') {
        res.json({message: "Yikes, an error!"});
    }
    else {
        res.render('500');
    }
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});