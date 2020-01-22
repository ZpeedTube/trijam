
let count = 10;
let startCount = count;
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/trijam/data/winners_51-75.csv",
        dataType: "text",
        success: function(_data) {
            let data = ProcessData(_data);
            LoadDataToTable(data);
            $.ajax({
                type: "GET",
                url: "/trijam/data/winners_26-50.csv",
                dataType: "text",
                success: function(_data) {
                    let data = ProcessData(_data);
                    LoadDataToTable(data);
                }
            });
        }
    });
});

/**
 * @param {Array} returns Array 
 */
function ProcessData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];
    for (var i=1; i<allTextLines.length; i++) {
        if (count>0) {
            var data = allTextLines[i].split(',');
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
    for(var i=0; i<data.length; i++){
        // Create new row
        let tr = document.createElement("tr");
        // Create a new td for each cell
        for(var col=0; col<data[i].length; col++){
            let splitD = data[i][col].split(">>>");
            const displayText = splitD[0];
            let link = "";
            let td = document.createElement("td");
            td.id = colID[col];
            // Add normal cell
            tr.append(td);
            // Checks if it has link and adds cell with link
            if (splitD.length>1) {
                // Get's link data
                link = splitD[1];
                // Creates a link
                let a = document.createElement("a");
                a.href = link;
                a.innerHTML = displayText;
                // Adds text to td
                td.append(a);
                continue; // Skips to next loop (of this for loop)
            }
            // Adds text to td
            td.prepend(displayText);            
        }
        // Adds row to table
        table.append(tr);
    }
}

