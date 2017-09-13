
const AFK = 0, DONTGETIT = 1, KEEPINGUP = 2, THISISEASY = 3

function Lecture(name, creationTime, subject) {
    this.creationTime = creationTime
    this.name = name;
    this.currentSubject = subject;
    this.isRunning = true;
    this.afkVotes = 0;
    this.dontGetItVotes = 0;
    this.keepingUpVotes = 0;
    this.tieVotes = 0
}

Lecture.prototype = {
    constructor:Lecture,
    changeCounter:function (feeling, func) {
        switch (feeling){
            case AFK :
                this.afkVotes = func(this.afkVotes)
                break
            case DONTGETIT :
                this.dontGetItVotes = func(this.dontGetItVotes)
                break
            case KEEPINGUP:
                this.keepingUpVotes = func(this.keepingUpVotes)
                break
            case THISISEASY:
                this.tieVotes = func(this.tieVotes)
                break

        }
    },
    showRes:function () {
        return "sleepy : " + this.afkVotes
        + " angry : " + this.dontGetItVotes
        + " following " + this.keepingUpVotes
    },
    moveAllCountersToAFK(){
        this.afkVotes = this.afkVotes + this.dontGetItVotes +  this.keepingUpVotes + this.tieVotes
        this.dontGetItVotes = 0;
        this.keepingUpVotes = 0;
        this.tieVotes = 0;

    },
    setCurrentSubject(subj){
        this.currentSubject = subj
    }
}

function LectureContainer() {
    this.lectures = {}

}

LectureContainer.prototype = {

    constructor:LectureContainer,


    addLecture:function (name, creationTime, subject) {
        this.lectures[name] = new Lecture(name, creationTime, subject)
    },
    getLecture:function (name) {
       return this.lectures[name]
    },
    changeCounterDecrement:function(lectureName, feelingToIncreament, feelingToDecrease){
        let lec = this.getLecture(lectureName)
        lec.changeCounter(feelingToIncreament, num => num + 1)
        lec.changeCounter(feelingToDecrease, num => num -1)

    },
    changeCounter:function(lectureName, feelingToIncreament) {
        let lec = this.getLecture(lectureName)

        lec.changeCounter(feelingToIncreament, num => num +1)
    },
    showLectureDetails(lectureName){
        let lect =  this.getLecture(lectureName)
        return lect.showRes()
    },
    stopLecture:function (lect) {
        this.lectures[lect].isRunning = false
    },
    removeLecture:function (lect) {
        this.lectures[lect] = undefined
    },
    forEach:function (f) {
       for (key in this.lectures){
           f(this.lectures[key])
       }
    }
}




var makeLectContainer = function () {
    return new  LectureContainer()
}

module.exports.makeLectureContainer = makeLectContainer
