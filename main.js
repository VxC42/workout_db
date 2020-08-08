var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(express.static('public'));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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
    mysql.pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") date, lbs FROM workouts', function (err, rows, fields){
        if (err){
            next(err);
            return;
        }

    context.results = rows;
    res.render('DBchart', context);
    });
});

app.get('/insert', urlencodedParser, function(req, res, next){
    var context={};
    lbs = true
    if(req.query.lbs == "kgs"){
        lbs = false;
    }

    date_str = req.query.date
    date = date_str.slice(6,11)+"-"+date_str.slice(0,2)+"-"+date_str.slice(3,5)

    mysql.pool.query('INSERT INTO workouts(name,reps,weight,date,lbs) VALUES (?, ?, ?, ?, ?)', [req.query.name, req.query.reps, req.query.weight, date, lbs], function(err, results){
        if(err){
            next(err);
            return;
        };
    });
    mysql.pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") date, lbs FROM workouts', function(err, rows, fields){
        if(err){
           next(err);
           return;
        }
    context.results = rows;
    res.render('DBchart',context);
    });
})

app.get('/edit', urlencodedParser, function(req, res, next){
    var context={};
    var q = req.query
    var key = [];
    for (var k in q) key.push(k);
    if (req.query[key]=="Delete"){
        mysql.pool.query('DELETE FROM workouts WHERE id = ?', [key[0]], function(err, result){
            if(err){
                next(err);
                return;
            };
        });
        mysql.pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") date, lbs FROM workouts', function(err, rows, fields){
            if(err){
               next(err);
               return;
            }
        context.results = rows;
        res.render('DBchart',context);
        });
    }
    else if (req.query[key]=="Update"){
        mysql.pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") date, lbs FROM workouts WHERE id=?', [key[0]], function(err, result){
            if(err){
                next(err);
                return;
            }
            context.result = result;
            res.render('update', context)
        })
    }

});

app.get('/update', function(req, res, next){
    var context={};
    console.log(req.query)
    /*mysql.pool.query('SELECT * FROM workouts WHERE id=?', [key[0]], function(err, result){
        if(err){
            next(err);
            return;
        }
        if(result.length==1){
            var curVals = result[0];
            mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=?', [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date || curVals.date, req.query.lbs || curVals.lbs], function(err, result){
                if(err){
                    next(err);
                    return;
                }
                mysql.pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") date, lbs FROM workouts', function(err, rows, fields){
                    if(err){
                       next(err);
                       return;
                    }
                context.results = rows;
                res.render('DBchart',context);
                });
            })
        }
    })*/
})


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
