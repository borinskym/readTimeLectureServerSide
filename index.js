const url = require('url');
const express = require('express');
const mysql = require('mysql');
const redis = require('redis');
const myL = require('./lecture.js');
const lectureStatisticJs = require('./lectureStatistic.js');


var redisClient = redis.createClient();



redisClient.on('connect', function() {
    console.log('connected to redis ');
});



const port = 3000;


var sqlConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'admin@123',
    database : 'lectures'
});


sqlConnection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected to mysql as id ' + sqlConnection.threadId);
});

var lectureContainer = myL.makeLectureContainer();

var lectureStatisticsManager = lectureStatisticJs.createStatisticManager();

var app = express();

setInterval(function () {
    addRunningLecturesToStatistics()
}, 1000);


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'null');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.listen(port);

app.get('/ping',function (req, res) {
    res.end('got ping !!!')
})

app.get('/showLecture', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    res.end(lectureContainer.showLectureDetails(queryData['lecture']))
})


app.get('/addLecture', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var user = queryData['user'];

    var lectureName = queryData['name'];

    var course = queryData['course'];

    var date = queryData['date'];

    var hour = queryData['hour'];

    var length = queryData['length'];

    var subjects = queryData['subjects'];

    var dateSplited = date.split("/");

    var year = dateSplited[2];

    var month = dateSplited[0];

    var day = dateSplited[1];

    var dateParsedForSQLInsertion = year + "-" + month + "-" + day + " " + hour +":00";

    var howManyLectureExistQuery = "select count(1) from lectures";


    var selectQuery = "select count(1) from lectures where name = " + "'" + lectureName + "'";

    sqlConnection.query(howManyLectureExistQuery, function (err, result, fields) {

        if(err) throw new Error("there is error in the second query : " + err);

        var numOfLectures = parseInt(result[0]['count(1)']);

        var codeOfLecture = numOfLectures +1;

        var valueOfInsertionQuery = "(" + "'" +lectureName +"'" +"," + "'" + user + "'" + "," +
            "'" + course + "'" + "," + "'" + subjects + "'" + "," +
            "'" + dateParsedForSQLInsertion + "'" + "," + length + "," + codeOfLecture + ")";

        var insertionQuery = "insert into lectures VALUES" + valueOfInsertionQuery

        sqlConnection.query(selectQuery, function (err, result, fields) {
            if(err) throw new Error("there is error in the second query : " + err);
            num = parseInt(result[0]['count(1)']);
            if(num > 0){
                res.end("exists")
            }else {
                sqlConnection.query(insertionQuery,
                    function (err, result, fields) {
                        if(err) throw Error("there is error in the third query : " + err);
                        res.end("true")
                    })
            }

        });


    })
});



app.get('/getCodeOfLecture', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lectureName = queryData['lecture']

    var selectQuery = "select code from lectures where name = " + "'" + lectureName + "'";

    sqlConnection.query(selectQuery, function (err, result, fields) {

        if(err) throw Error("there is error in the getCodeOfLecture query : " + err);

        res.end(String(result[0]['code']))
    })
})

app.get('/getLectureByCode', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var code = queryData['code']

    var selectQuery = "select name from lectures where code = " + "'" + code + "'";

    sqlConnection.query(selectQuery, function (err, result, fields) {

        if(err) throw Error("there is error in the getCodeOfLecture query : " + err);

        if(result.length === 0){
            res.end("fail")
        }else{
            res.end(String(result[0]['name']))
        }

    })
})


app.get('/getCourseOfLecture', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lectureName = queryData['lecture']

    var selectQuery = "select course from lectures where name = " + "'" + lectureName + "'";

    sqlConnection.query(selectQuery, function (err, result, fields) {

        if(err) throw Error("there is error in the getCodeOfLecture query : " + err);

        res.end(String(result[0]['course']))
    })
})

app.get('/verify', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    email = queryData['email'];

    password = queryData['password'];

    query = "select count(1) from users where email = " + "'" + email + "'" + "and password = " + "'" + password + "'"

   sqlConnection.query(query ,function (err, result, fields) {
           if(err) throw err;

           num = parseInt(result[0]['count(1)'])
           if(num == 0){
               res.end("false")
           }else{
               res.end("true")
           }
       })
})

app.get('/newUser', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    email = queryData['email'];

    password = queryData['password'];

    let values =  "(" + "'" +  email + "'" + "," + "'" + password + "'" + ")";

    firstQuery = "select count(1) from users where email = " + "'" + email + "'";

    secondQuery = "insert into users VALUES " + values;

    console.log(firstQuery);

     sqlConnection.query(firstQuery, function (err, result, fields) {
            if(err) throw new Error("there is error in the first query : " + err);
            num = parseInt(result[0]['count(1)']);

            if(num > 0){
                res.end("exists")
            }else {
               sqlConnection.query(secondQuery,
                  function (err, result, fields) {
                      if(err) throw Error("there is error in the second query : " + err);
                      res.end("true")
                  })
            }

    });
})

app.get('/getLectures', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var user = queryData['user'];

    var sqlQuery = "select * from lectures where lecturer = " + "'" + user + "'"

    var json = {};

    sqlConnection.query(sqlQuery, function (err, result, fields) {

        result.forEach(function (res) {
            var lecture = res['name']

            var insideObj = {};
            insideObj['course'] = res['course']
            insideObj['subjects'] = res['subjects']
            insideObj['date'] = res['date']

            json[lecture]= insideObj

        });

       res.end(JSON.stringify(json))
    })
});

app.get('/startLecture', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lectureName = queryData['lecture'];

    var subject = queryData['subject']

    let time = new Date().getTime();

    lectureContainer.addLecture(lectureName, time, subject);

    res.end("ok")
});

app.get('/nextSubject', function (req, res) {
    const queryData = url.parse(req.url, true).query;

    let lectureName = queryData['lecture'];

    let subject = queryData['subject'];

    let nextSubject = queryData['nextSubject']

    let time = new Date().getTime();

    let lecture = lectureContainer.getLecture(lectureName);

    lecture.setCurrentSubject(nextSubject);

    lectureStatisticsManager.addSubjectStatistic(lectureName, subject, time, lecture.afkVotes, lecture.dontGetItVotes, lecture.keepingUpVotes, lecture.tieVotes)

    lecture.moveAllCountersToAFK();

    res.end("ok")

});

app.get('/currentSubject', function (req, res) {

    const queryData = url.parse(req.url, true).query;

    let lectureName = queryData['lecture'];

    let lect = lectureContainer.getLecture(lectureName);

    res.end(lect.currentSubject)
});

app.get('/addVote',  function (request, response) {

    let queryData = url.parse(request.url, true).query;

    let voteToIncrement = parseInt(String(queryData['vote']));

    let voteDownQ = queryData['voteDown'];

    let lectureName = queryData['lecture'];
    if(!(voteDownQ === undefined)) {
        lectureContainer.changeCounterDecrement(lectureName, voteToIncrement,  parseInt(String(voteDownQ)))
    }else{
        lectureContainer.changeCounter(lectureName, voteToIncrement)
    }
    response.end("ok");
});


app.get('/getLectureData', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var lectureUrl = queryData['lecture'];

    var lecture = lectureContainer.getLecture(lectureUrl);

    if(lecture === null || lecture === undefined){
        res.end("lectureNotExist")
    }else {

        var json = {};

        json['afk'] = lecture.afkVotes;

        json['dgi'] = lecture.dontGetItVotes;

        json['ku'] = lecture.keepingUpVotes;

        json['tie'] = lecture.tieVotes;

        res.end(JSON.stringify(json))
    }

})

app.get('/deleteLecture', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lecture = queryData['lecture'];

    var sqlQuery = "delete from lectures where name = " + "'" + lecture + "'" + ";";

    sqlConnection.query(sqlQuery, function (err, result, fields) {

        if(err) throw Error("there is error in the query : " + err);

        res.end("ok")

    })
});

app.get('/getLectureStatisticJsonFromCache', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lecture = queryData['lecture'];

    var json = getLectureStatisticJson(lecture);

    res.end(json)


});


app.get('/lectureStatisticDebug', function (req, res) {

    res.end(lectureStatisticsManager.printStatistics())

});

app.get('/collectStatisticManualTrigger', function (req, res) {
    addRunningLecturesToStatistics();
    res.end("ok")
});


app.get('/endLecture', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var lectureName = queryData['lecture'];

    lectureContainer.stopLecture(lectureName);

    var json = getLectureStatisticJson(lectureContainer.getLecture(lectureName));


    redisClient.set(lectureName, json, function(err, reply) {
        if(err){
            throw new Error("error occured in set to redis : "  + err );
        } else{
            // we succeeded on setting to redis, we can erase from cache

            //remove the lecture himself
            lectureContainer.removeLecture(lectureName);
            //remove the lecture statistics
            lectureStatisticsManager.removeLectureStatistic(lectureName);
        }
    });

    res.end("ok")
});

app.get('/getLectureStatisticFromRedis', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var lecture = queryData['lecture'];

    redisClient.get(lecture, function(err, reply) {
        if(err){
            throw new Error("error occured in get from redis : "  + err );
        } else if(reply === null){
            res.end("empty")
        } else {
            res.end(reply)
        }
    });

});


var getLectureStatisticJson = function (lect) {

    var json = {};

    json['startingTime'] = lect.creationTime;

    json['data'] = lectureStatisticsManager.getLectureStatisticMap(lect.name);

    json['subjects'] = lectureStatisticsManager.getLectureStatisticSubjects(lect.name);

    return JSON.stringify(json)
};


var addRunningLecturesToStatistics = function () {
    var timeInMillisecond = new Date().getTime();

    lectureContainer.forEach(lec =>{
        if( lec !== undefined && lec !== null) {
            if (lec.isRunning) {
                lectureStatisticsManager.addLectureStatistic(lec.name, timeInMillisecond, lec.afkVotes, lec.dontGetItVotes, lec.keepingUpVotes, lec.tieVotes)
            }
        }
    })
};
