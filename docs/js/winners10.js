
let count = 10;
let startCount = count;
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/trijam/data/winners.csv",
        dataType: "text",
        success: function(_data) {
            let data = ProcessData(_data);
            LoadDataToTable(data);
        }
    });
});

/**
 * @param {Array} returns Array 
 */
function ProcessData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = []
    for (var i=1; i<allTextLines.length; i++) {
        if (count>0) {
            var data = allTextLines[i].split(',');
            if (data.length <= 1) continue;
            if (data.length == headers.length) {
                var tarr = [];
                for (var j=0; j<headers.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
                count--;      
            }        
        }
        else {
            break;
        }
    }
    return lines;
}

// Column IDs for html&css
const colID = ["jam","name","game","theme"];

function LoadDataToTable(data) {
    let table = $("tbody")[0];
    for(var i = 0; i < data.length; i++){
        // Create new row
        let tr = document.createElement("tr");
        // Create a new td for each cell
        for(var col = 0; col < data[i].length; col++){
            let splitU = data[i][col].split('&&&');
            // let displayText = "";
            let td = document.createElement("td");
            td.id = colID[col];
            tr.append(td);
            for (const user of splitU) {
                let userData = user.split(">>>");
                let userName = userData[0]; // Gets user name
                // displayText += userName;
                // Checks if it has link and adds cell with link
                if (userData.length > 1) {
                    const link = userData[1];
                    let a = document.createElement("a");
                    a.target = "_blank";
                    a.href = link;
                    a.innerHTML = userName;
                    td.append(a);
                    if (splitU.length > 0) {
                        td.innerHTML += " ";
                    }
                    continue; // Skips to next loop (of this for loop)
                } else {
                    // Add normal cell
                    td.prepend(userName);
                }
            }
        }
        table.append(tr);
    }
}


function OpenHOF(){
    window.open("winners.html");
}
function RedirectHOF(){
    window.location = "winners.html";
}
