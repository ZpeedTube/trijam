const shell = require("shelljs");
const fs = require('fs');
const request = require("request");
// import { join } from "path";
const jamlinks = require("./jamlinks");
console.log(Date().toString()); // Just to see when copy was done


// shell.exec('git commit -am "Auto-updated"');

/**
 * Gets webpage and gives it in a callback
 * @param {string} url http://some-adress.com
 * @param {Function} callback (body) => { }
 */
function curlGet (url, callback, errorCallback = (error = undefined)=>{}) {
    console.log("curl",url);
    request.get({
        url: url
    }, (err, resp, body) => {
        if (err) {
            console.log("Error in curlGet",err)
            errorCallback(err)
        } else {
            callback(body);
        }
    });
}

let offsetNumber = 0;

curlGet((jamlinks.trijamLink(offsetNumber) + "/results"), (body) => {
    console.log("Response recived");
    let data = body.split(new RegExp('<div class="game_rank first_place">', 'g'));
    const gameName = findData(data, '<h2>', '>', '<');
    const gameLink = findData(data, '<a href=', '"', '"');
    const winnerLink = findData(data, '<h3>', 'href="', '"');
    const winnerName = findData(data, '<h3>', '>', '<');
    console.log(gameName, gameLink, winnerName, winnerLink);
    curlGet((jamlinks.trijamLink(offsetNumber)), (body) => { 
        let data2 = body.split(new RegExp('<div class="jam_content user_formatted">', 'g'));
        const jamTheme = findData(data2, '<h1>',':','<');
        updateDatabase('../docs/data/winners_76-100.csv', gameName, gameLink, winnerName, winnerLink, jamTheme);
    });
}, (error) => {
});

function findData(datain, term, start, end) {
    let data = datain[1].split(term, 2);
    data = data[1].split(start, 2);
    data = data[1].split(end, 2);
    return data[0].replace(new RegExp(',', 'g'), '.').replace(new RegExp('&nbsp;', 'g'), ' ');
}

function updateDatabase(path, gameName, gameLink, winnerName, winnerLink, jamTheme) {
    const jamNumber = (jamlinks.trijamNumber() + offsetNumber);
    fs.readFile(path, 'utf8', (err, datain) => {
        if (err) {
            console.log("updateDatabase error",err);
            return;
        }
        const rows = datain.split('\n');
        console.log(rows.length, rows);
        let newData = `${jamNumber},` + 
                `${winnerName}>>>${winnerLink},${gameName}>>>${gameLink},` + 
                `${jamTheme}`;
        switch (rows.length) {
            case 1: 
                newData = rows[0] + '\n' + newData;
                fs.writeFile(path, newData, 'utf8', () => {
                    console.log(`New data should have been written to ${path}.`);
                    let git = shell.exec('git commit -am "Auto-updated"');
                    console.log('git', git.stdout, git.stderr);
                    if (git.stdout) {
                        let gitPush = shell.exec('git push');
                        console.log('git pushed', gitPush.stdout, gitPush.stderr);
                        if (gitPush.stdout) {
                            console.log('All seems ok! You can close now.');
                        }
                    }
                });
                break;
            default:
                for (let i = 1; i < rows.length; i++) {
                    let row = rows[i].split(new RegExp(',','g'));
                    if (row.length === 4) {
                        if (row[0] === jamNumber) {
                            console.log(`Winner ${jamlinks} already in database file`)
                        }
                    }
                }
                let returnData = "";
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if (i === 0) {
                        returnData += rows[0] + '\n';
                        returnData += newData + '\n';
                    } else if ((i + 1) === rows.length) {
                        returnData += row;
                    } else {
                        returnData += row + '\n';
                    }       
                }
                fs.writeFile(path, returnData, 'utf8', () => {
                    console.log(`New data should have been written to ${path}.`);
                    let git = shell.exec('git commit -am "Auto-updated"');
                    console.log('git', git.stdout, git.stderr);
                    if (git.stdout) {
                        let gitPush = shell.exec('git push');
                        console.log('git pushed', gitPush.stdout, gitPush.stderr);
                        if (gitPush.stdout) {
                            console.log('All seems ok! You can close now.');
                        }
                    }
                });
                console.log('updateDatabase: case default');
                break;
        }
    });
}

