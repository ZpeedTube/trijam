const shell = require("shelljs");
const fs = require('fs');
const request = require("request");
const jamlinks = require("./jamlinks");
const { argv, stderr } = require("process");
const { resolve } = require("path");
console.log("Started updater at", Date().toString()); // Just to see when copy was done


let manualFailed = false;
let offsetNumber = -1;
let jamNumber = (jamlinks.trijamNumber() + offsetNumber);
let jamlink = jamlinks.trijamLink(offsetNumber);
// Checks if manual number is given and sets jamNumber and jamlink to the manual number
if (argv.length > 2) {
    let num = 0;
    try {
        num = parseInt(process.argv[2], 10);
        if (num) {
            jamNumber = num;
            jamlink = jamlinks.trijamLinkNumber(num);
            console.log(`Manual number ${num} was given.`);
        } else {
            console.log(`Value given is not a number: ${process.argv[2]} = ${num}`);
            manualFailed = true;
        }
    } catch (e) {
        console.log(`No number given, continues automatically`);
    }
}

(async ()=> {
    const updated = await checkForUpdates();
    if (updated === "updated") { return; }
    console.log(updated);
    if (jamNumber <= 75) {
        console.log("Won't update winner for jam 75 or older.");
        return;
    } else if (manualFailed) {
        return;
    } else {
        console.log(`Check winnner for Trijam ${jamNumber}, ${jamlink}`);
    }

    curlGet(jamlink + "/results", (body) => {
        console.log("Response recived");
        try {
            let data = body.split(new RegExp('<div class="game_rank first_place">', 'g'))[1];
            const gameName = findData(data, '<h2>', '>', '<');
            const gameLink = findData(data, '<a href=', '"', '"');
            const winnerLink = findData(data, '<h3>', 'href="', '"');
            const winnerName = findData(data, '<h3>', '>', '<');
            console.log(`Fetched winner data for trijam #${jamNumber}:`, gameName, gameLink, winnerName, winnerLink);
            curlGet(jamlink, (body) => { 
                let data2 = body.split(new RegExp('<div class="jam_content user_formatted">', 'g'))[1];
                const jamTheme = findData(data2, '<h1>',':','<');
                let dataBasePath = "";
                 if (jamNumber >= 76 && jamNumber <= 100) {
                    dataBasePath = '../docs/data/winners_76-100.csv';
                } else if (jamNumber >= 101 && jamNumber <= 125) {
                    dataBasePath = '../docs/data/winners_101-125.csv';
                }
                updateDatabase(dataBasePath, gameName, gameLink, winnerName, winnerLink, jamTheme);
            });
        } catch (e) {
            console.log(`Can't find a winner for trijam ${jamNumber}? Has the winner been announced yet?`);
        }
    }, (error) => {
        console.log("Error in curlGet", error);
    });
    
})()

/**
 * Gets webpage and gives it in a callback
 * @param {string} url http://some-adress.com
 * @param {Function} callback (body) => { }
 */
function curlGet (url, callback, errorCallback = (error = undefined)=>{}) {
    // console.log("curl", url);
    request.get({
        url: url
    }, (err, resp, body) => {
        if (err) {
            errorCallback(err);
        } else if (body) {
            callback(body);
        } else {
            errorCallback("body undefined");
        }
    });
}

/**
 * Finds string data in a string, also cleans string
 * @param {string} datain 
 * @param {string} term 
 * @param {string} start 
 * @param {string} end 
 */
function findData(datain, term, start, end) {
    var data = datain.split(term, 2);
    data = data[1].split(start, 2);
    data = data[1].split(end, 2);
    return data[0].replace(new RegExp(',', 'g'), '.').replace(new RegExp('&nbsp;', 'g'), ' ');
}

/**
 * Updates database file by path given
 * @param {string} path 
 * @param {string} gameName 
 * @param {string} gameLink 
 * @param {string} winnerName 
 * @param {string} winnerLink 
 * @param {string} jamTheme
 */
function updateDatabase(path, gameName, gameLink, winnerName, winnerLink, jamTheme) {
    fs.readFile(path, 'utf8', (err, datain) => {
        if (err) {
            console.log("updateDatabase error",err);
            return;
        }
        const rows = datain.split('\n');
        // Formats the new row
        let newRow = `${jamNumber},` + 
                    `${winnerName}>>>${winnerLink},` +
                    `${gameName}>>>${gameLink},` + 
                    `${jamTheme}`;
        switch (rows.length) {
            case 1: 
                newRow = rows[0] + '\n' + newRow;
                fs.writeFile(path, newRow, 'utf8', () => {
                    console.log(`New data should have been written to ${path}.`);
                    gitCommitPush();
                });
                break;
            default:
                for (let i = 1; i < rows.length; i++) {
                    let row = rows[i].split(new RegExp(',','g'));
                    if (row.length === 4) {
                        if (parseInt(row[0], 10) === jamNumber) {
                            console.log(`Winner ${jamNumber} already in database file.`);
                            gitPush();
                            return;
                        }
                    }
                }
                let returnData = "";
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if (i === 0) {
                        returnData += rows[0] + '\n';
                        returnData += newRow + '\n';
                    } else if ((i + 1) === rows.length) {
                        returnData += row;
                    } else {
                        returnData += row + '\n';
                    }       
                }
                fs.writeFile(path, returnData, 'utf8', () => {
                    console.log(`New data should have been written to ${path}.`);
                    gitCommitPush();
                });
                console.log('updateDatabase: case default');
                break;
        }
    });
}

/** Does git commit and git push */
function gitCommitPush() {

    let git = shell.exec('git commit -am "Auto-updated"');
    // console.log('git', git.stdout, git.stderr);
    if (git.stderr) {
        console.log('git commit failed. Please restart and try again!');
    } else if (git.stdout) {
        let gitPush = shell.exec('git push');
        // console.log('git pushed', gitPush.stdout, gitPush.stderr);
        if (gitPush.stderr) {
            console.log('git push failed. Please restart and try again!');
        } else if (gitPush.stdout) {
            console.log('All seems ok! (Please check on github so it actually is uploaded!)');
        }
    }
}/** Does git push */
function gitPush() {
    let gitPush = shell.exec('git push');
    // console.log('git pushed', gitPush.stdout, gitPush.stderr);
    if (gitPush.stdout.trim() === "Everything up-to-date") {
        console.log('All seems ok! (Please check on github so it actually is uploaded!)');
    }
}

/** Checks for git repository updates. Returns promise. */
function checkForUpdates(){
    return new Promise((resolve, reject) => {
        console.log("Checking for updates on the trijam git..");
        shell.exec('git pull', (code,stderr,stdout) => {
            if (stdout) {
                console.log(code); 
                shell.exec('npm i', (code,stderr,stdout) => {                    
                    shell.exec(`node . ${jamNumber}`);
                });
                reject("updated");
            } else {
                resolve();
            }
        });
    });
}