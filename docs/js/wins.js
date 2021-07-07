let allNames = [];
let winnerData = [];

$(document).ready(function() {
    let data = [];
    $.ajax({
        type: "GET",
        url: "/trijam/data/winners.csv",
        dataType: "text",
        success: async function(_data) {
            data = ProcessDataNames(_data);
        }
    });
});

/**
 * Merge 2 arrays
 * @param {Array} array1 array to merge into
 * @param {Array} array2 take data from this array and add to array1
 */
function Concat(array1, array2){
    for (const key in array2) {
        array1.push(array2[key]);
    }
}

/**
 * Returns new array of names
 * @param {Array<Winner>} allText Array of names
 */
function ProcessDataNames(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = 2;
    var names = [];
    for (var i  =1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length <= 1) continue;
        let splitUser = data[1].split('&&&');
        if (splitUser.length > 0) {
            for (const user of splitUser) {
                let userData = user.split(">>>");                
                let name = userData[0].trim();
                names.push(name);
            }
        }
        else {
            let splitD = data[1].split(">>>");
            let splitU = splitD[0].split('&');
            for (var j = 0; j < splitU.length; j++) {
                let name = splitU[j].trim();
                names.push(name);
            }
        }
    }
    return names;
}

/** Data object for winner data */
class Winner {
    constructor(_name,_wins=1){
        this.name = _name;
        this.wins = _wins;
    }
    AddWin(){
        if (this.wins != null)
            this.wins++;
    }
    AddWins(wins){
        if (this.wins != null)
            this.wins+=wins;
    }
}

/** Count wins for each name */
function CountWins(data) {
    let namesList = data.slice(); // Makes copy of array
    let winners = [];
    const length = namesList.length;
    for (let i = 0; i < length; i++) {  
        if (namesList.length === 0) {
            console.log("No more wins, break loop.");
            break;
        }      
        let name = namesList.shift(); 
        let winner = new Winner(name);
        let skip = false;
        for (let n = 0; n < winners.length; n++) {
            if (name.trim() === winners[n].name.trim()) {   
                winners[n].AddWin();
                skip = true;
                break;
            }
        }
        if (skip) continue;
        winners.push(winner);
    }
    return winners;
}

/** Returns a promise of a sorted array */
function SortWins(data){
    return new Promise((resolve, reject)=>{
        let sorted = data.slice();
        sorted.sort((a,b) => {
            if (a.wins > b.wins) return -1;
            if (a.wins < b.wins) return 1;
            return 0;
        });
        resolve(sorted);
    });
}

// Column IDs for html&css
const colID = ["name2","wins"];

/** Takes data array of Winners and adds it to the table. */
function LoadDataToTableWins(data) {
    let table = $("tbody")[0];
    let count = 0;
    for(var i = 0; i < data.length; i++){
        // Create new row
        let tr = document.createElement("tr");
        // Create a new td for each cell
        let tdN = document.createElement("td");
        tdN.id = colID[0];
        tdN.prepend(data[i].name);   
        tr.append(tdN);

        let tdW = document.createElement("td");
        tdW.id = colID[1];
        tdW.prepend(data[i].wins);  
        tr.append(tdW);
        count += data[i].wins;
        
        table.append(tr);
    }
    console.log("Count: " + count);
}


/** Loops until all winner data has loaded */
var loop = setInterval(() => {
    if (winnerData.length > 0) {   
        SortWins(winnerData).then((wd)=> {
            LoadDataToTableWins(wd);
        });
        clearInterval(loop);
        console.log("Loop stopped!");
    }
    else if (allNames.length > 51) { 
        winnerData = CountWins(allNames);
    } 
    
}, 100);
