
const AFK = 0, DONTGETIT = 1, KEEPINGUP = 2, THISISEASY = 3

function Lecture(name){
    this.name = name
    this.afkVotes = 0
    this.dontGetItVotes = 0
    this.keepingUpVotes = 0
    this.thisIsEasyVotes = 0
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
                this.thisIsEasyVotes = func(this.thisIsEasyVotes)
                break

        }
    },
    showRes:function () {
        return "sleepy : " + this.afkVotes
        + " angry : " + this.dontGetItVotes
        + " following " + this.keepingUpVotes
    }

}

function LectureContainer() {
    this.lectures = {}

}

LectureContainer.prototype = {

    constructor:LectureContainer,


    addLectureIfNotExist:function (name) {

        if(this.lectures[name] === undefined ){
            this.lectures[name] = new Lecture(name)
        }
    },
    getLecture:function (name) {
        let lec =  this.lectures[name]

        if(lec == null){
            throw Error('trying to get lecture that is not exist')
        }
        return lec
    },
    changeCounter:function(lectureName, feelingToIncreament, feelingToDecrease){
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
    }
}




var makeLectContainer = function () {
    return new  LectureContainer()
}

module.exports.makeLectureContainer = makeLectContainer
