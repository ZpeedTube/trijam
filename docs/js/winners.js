$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/trijam/data/winners.csv",
        dataType: "text",
        success: function(_data) {
            let data = ProcessData(_data);
            // alert(data[0]);
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
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
            // lines.push(allTextLines[i]);

        }
    }
    // alert(lines);
    return lines;
}

// Column IDs for html&css
const colID = ["jam","name","game","theme"];

function LoadDataToTable(data) {
    let table = $("tbody")[0];
    for(var i=0; i<data.length; i++){
        // let tr = '<tr>';
        let tr = document.createElement("tr");;
        for(var col=0; col<data[i].length; col++){
            let splitD = data[i][col].split(">>>");
            const displayText = splitD[0];
            let link = "";
            let td = document.createElement("td");
            td.id = colID[col];
            tr.append(td);
            console.log(displayText);
            if (splitD.length>1) {
                link = splitD[1];
                let a = document.createElement("a");
                a.href = link;
                a.innerHTML = displayText;
                td.append(a);
                continue; // Skips to next loop (of this for loop)
            }
            td.prepend(displayText);
            
        }
        table.append(tr);
    }
}

