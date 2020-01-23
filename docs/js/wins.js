
let allNames = [];
let winnerData = [];


$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/trijam/data/winners_51-75.csv",
        dataType: "text",
        success: function(_data) {
            let data = ProcessDataNames(_data);
            allNames = allNames.concat(data);
            $.ajax({
                type: "GET",
                url: "/trijam/data/winners_26-50.csv",
                dataType: "text",
                success: async function(_data) {
                    let data = ProcessDataNames(_data);
                    allNames = allNames.concat(data);
                    $.ajax({
                        type: "GET",
                        url: "/trijam/data/winners_1-25.csv",
                        dataType: "text",
                        success: function(_data) {
                            let data = ProcessDataNames(_data);
                            allNames = allNames.concat(data);
                            winnerData = CountWins(allNames);
                            SortWins(winnerData).then((wd)=> {
                                LoadDataToTableWins(wd);

                            });
                        }
                    });
                }
            });
        }
    });
});

/**
 * @param {Array} returns Array of names
 */
function ProcessDataNames(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = 2;
    var names = [];
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length <= 1) continue;
        let splitD = data[1].split(">>>");
        let splitU = splitD[0].split('&');
        for (var j=0; j<splitU.length; j++) {
            let name = splitU[j].trim();
            names.push(name);
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

function CountWins(data) {
    let namesList = data.slice(); // Makes copy of array
    let winners = [];
    for (let i = 0; i < namesList.length; i++) {        
        let name = namesList.shift(); 
        let winner = new Winner(name);
        let skip = false;
        // console.log(winner);
        for (let n = 0; n < winners.length; n++) {
            if (name.trim() === winners[n].name.trim()) {   
                winners[n].AddWin();
                skip = true;
                break;
            }
        }
        if (skip) continue;
        for (let n = 0; n < namesList.length; n++) {
            if (name.trim() === namesList[n].trim()) {   
                namesList.splice(n,1); 
                winner.AddWin();
            }
        }
        winners.push(winner);
    }
    return winners;
}

/** Returns a promise of a array */
function SortWins(data){
    return new Promise((resolve, reject)=>{
        let sorted = data.slice();
        sorted.sort((a,b) => {
            if (a.wins > b.wins) return -1;
            if (a.wins < b.wins) return 1;
            return 0;
        });
        console.table(sorted);
        resolve(sorted);
    });
}

// Column IDs for html&css
const colID = ["name2","wins"];

function LoadDataToTableWins(data) {
    let table = $("tbody")[0];
    for(var i=0; i<data.length; i++){
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
        
        table.append(tr);
    }
}

