function LectureStatisicEntry(afkVotes, dontGetItVotes, keepingUpVotes, tieVotes){
    //afk votes
    this._afk = afkVotes
    //dont get it votes
    this._dgi = dontGetItVotes
    //keeping up votes
    this._kup = keepingUpVotes
    //this is easy votes
    this._tie = tieVotes
}


function LectureStatistics(lectureName){
    this.lectureName = lectureName
    //map between time in millisecond and lecture statistic entry
    this.lectureStatisticEntryMap = {}

}

LectureStatistics.prototype = {
    constructor:LectureStatistics,

    addLectureStatisticEntry:function (timeInMillisecind, afkVotes, dontGetItVotes, keepingUpVotes, tieVotes) {

        this.lectureStatisticEntryMap[timeInMillisecind] = new LectureStatisicEntry(afkVotes, dontGetItVotes, keepingUpVotes, tieVotes)

    },
    printLecturesStatistic:function () {

        var ansStr = ""
        for(key in this.lectureStatisticEntryMap){
            var lectureStatisticEntry = this.lectureStatisticEntryMap[key]
            ansStr = ansStr + "the statistic in time " + key + " is :"  + "afk votes : " + lectureStatisticEntry._afk
            + " dontGetItVotes : " + lectureStatisticEntry._dgi
                +" keepingUpVotes : " +lectureStatisticEntry._kup
                + " this is easy votes : " + lectureStatisticEntry._tie + "\n"
        }

        return ansStr
    }
}


function LectureStatisticManager(){
    this.lectureStatisticsMap = {}
}

LectureStatisticManager.prototype = {

    constructor:LectureStatisticManager,
    
    addLectureStatistic:function (lectureName, timeInMillisecond, afkVotes, dontGetItVotes, keepingUpVotes, tieVotes) {

        lecureStatistic = this.lectureStatisticsMap[lectureName]

        if(lecureStatistic === undefined){

                lecureStatistic = new LectureStatistics(lectureName)

                this.lectureStatisticsMap[lectureName] = lecureStatistic

        }

        lecureStatistic.addLectureStatisticEntry(timeInMillisecond, afkVotes, dontGetItVotes, keepingUpVotes, tieVotes)
    },

    printStatistics:function () {
        var ansString = ""
        for(key in this.lectureStatisticsMap){
            if (key !== undefined) {
                var lectureStatistic = this.lectureStatisticsMap[key];
                ansString = ansString + "the statistic for lecture : " + lectureStatistic.lectureName + " is : " + lectureStatistic.printLecturesStatistic() + "\n"

            }
        }
        return ansString
    },
    
    getLectureStatisticMap:function (lectureName) {
        var lectureStatistic = this.lectureStatisticsMap[lectureName];

        if(lectureStatistic === undefined){
            throw Error("the lecture requested is null ! : " + lectureName)
        }
        else{
            return lectureStatistic.lectureStatisticEntryMap;
        }


    },
    removeLectureStatistic:function (lecture) {
        this.lectureStatisticsMap[lecture] = undefined
    }
}


var createStatisticManager = function () {
    return new  LectureStatisticManager()
}

module.exports.createStatisticManager = createStatisticManager;
