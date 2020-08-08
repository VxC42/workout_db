var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3709);
app.get('/reset-table', function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date DATE,"+
        "lbs BOOLEAN)";
        mysql.pool.query(createString, function(err){
            context.results = "Table reset";
            res.render('DBchart',context);
        })
    });
});

app.get('/',function(req, res, next){
    var context = {};
    mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields){
        if (err){
            next(err);
            return;
        }
    context.results = JSON.stringify(rows);
    res.render('DBchart', context);
    });
});

app.post('/insert', function(req,res,next){
    if(req.body['Add Workout']){
        console.log(req.query.name, req.query.reps, req.query.weight, req.query.date. req.query.lbs)
    }
})

/*app.post('/insert', function(req, res, next){
    var context = {};
    if(req.query['Add Workout']){
        mysql.pool.query('INSERT INTO workouts(`name`,`reps`,`weight`,`date`,`lbs`) VALUES (?, ?, ?, ?, ?)', [req.query.name, req.query.reps, req.query.weight, req.query.date. req.query.lbs], function(err, result){
            if(err){
                next(err);
                return;
            };
        });
    };*/
    /*if(req.query['Delete']){
        mysql.pool.query('DELETE FROM workouts WHERE id = ?', [req.query.id], function(err, result){
            if(err){
                next(err);
                return;
            }
        });
    }*//*
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
        if(err){
           next(err);
           return;
        }
    context.results = result.insertId;
    res.render('DBchart',context);
    });
})
*/

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
