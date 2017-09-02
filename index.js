const url = require('url')
const express = require('express')
const mysql = require('mysql')
const schedule = require('node-schedule')
const myL = require('./lecture.js')



const port = 3000


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


var lectureContainer = myL.makeLectureContainer()

var app = express()


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




app.listen(port)




var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 1);

// var j = schedule.scheduleJob(rule, function(){
//     var value = "lect2, 27, 3, 9, '2017-07-01 00:01:00'"
//     sqlConnection.query("INSERT INTO lects1  VALUES(\'lect2\', 27, 3, 9, \'2017-07-01 00:01:00\')")
//
//     console.log('got to the job part')
// });




app.get('/showLecture', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    res.end(lectureContainer.showLectureDetails(queryData['lecture']))
})

app.get('/addLecture', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var user = queryData['user']

    var lectureName = queryData['name']

    var course = queryData['course']

    var date = queryData['date']

    var hour = queryData['hour']

    var length = queryData['length']

    var subjects = queryData['subjects']

    var dateSplited = date.split("/")

    var year = dateSplited[2]

    var month = dateSplited[0]

    var day = dateSplited[1]

    var dateParsedForSQLInsertion = year + "-" + month + "-" + day + " " + hour +":00"

    var selectQuery = "select count(1) from lectures where name = " + "'" + lectureName + "'"


    var valueOfInsertionQuery = "(" + "'" +lectureName +"'" +"," + "'" + user + "'" + "," +
        "'" + course + "'" + "," + "'" + subjects + "'" + "," +
        "'" + dateParsedForSQLInsertion + "'" + "," + length + ")"


    var insertionQuery = "insert into lectures VALUES" + valueOfInsertionQuery

    sqlConnection.query(selectQuery, function (err, result, fields) {
        if(err) throw new Error("there is error in the first query : " + err);
        num = parseInt(result[0]['count(1)'])
        if(num > 0){
            res.end("exists")
        }else {
            sqlConnection.query(insertionQuery,
                function (err, result, fields) {
                    if(err) throw Error("there is error in the second query : " + err);
                    res.end("true")
                })
        }

    });
})

app.get('/verify', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    email = queryData['email']

    password = queryData['password']

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

    email = queryData['email']

    password = queryData['password']

    let values =  "(" + "'" +  email + "'" + "," + "'" + password + "'" + ")";

    firstQuery = "select count(1) from users where email = " + "'" + email + "'";

    secondQuery = "insert into users VALUES " + values;

    console.log(firstQuery)

     sqlConnection.query(firstQuery, function (err, result, fields) {
            if(err) throw new Error("there is error in the first query : " + err);
            num = parseInt(result[0]['count(1)'])

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

    var user = queryData['user']

    var sqlQuery = "select * from lectures where lecturer = " + "'" + user + "'"

    var json = {}

    sqlConnection.query(sqlQuery, function (err, result, fields) {

        result.forEach(function (res) {
            var lecture = res['name']

            var insideObj = {}
            insideObj['course'] = res['course']
            insideObj['subjects'] = res['subjects']
            insideObj['date'] = res['date']

            json[lecture]= insideObj

        })

       res.end(JSON.stringify(json))
    })
})

app.get('/startLecture', function (req, res) {
    var queryData = url.parse(req.url, true).query;

    var lectureName = queryData['lecture']

    lectureContainer.addLectureIfNotExist(lectureName)

    res.end("ok")

})

app.get('/addVote',  function (request, response) {

    var queryData = url.parse(request.url, true).query;

    let voteToIncrement = parseInt(String(queryData['vote']));

    let voteToDecrement = queryData['voteToDecrement'];

    let lectureName = queryData['lecture']
    if(voteToDecrement ==! null) {
        lectureContainer.changeCounter(lectureName, voteToIncrement,  voteToDecrement)

    }else{
        lectureContainer.changeCounter(lectureName, voteToIncrement)
    }
    response.end("vote succesfully added");
})


app.get('/getLectureData', function (req, res) {

    var queryData = url.parse(req.url, true).query;

    var lectureUrl = queryData['lecture']

    var lecture = lectureContainer.getLecture(lectureUrl)

    var json = {}

    json['afk'] = lecture.afkVotes

    json['dgi'] = lecture.dontGetItVotes

    json['ku'] = lecture.keepingUpVotes

    json['tie'] = lecture.thisIsEasyVotes

    res.end(JSON.stringify(json))

})

