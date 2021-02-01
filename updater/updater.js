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
let placement = 1;
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
        console.log(`No trijam number given..`);
    }
    try {
        if (argv.length === 4) {
            placement = parseInt(process.argv[3], 10);
            if (placement) {
                console.log(`Placement number ${placement} is used`);
            }
        }
    } catch (e) {
        console.log(`No placement number given..`);
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
            let data = findData(body,'<div class="game_rank first_place">','<div class="game_summary">', '</div>');
            if (data === undefined) throw new Error('Could not find any winner data...');
            switch(placement) {
                case 1: break;
                case 2: 
                    data = findData(body,'<div class="game_rank second_place">','<div class="game_summary">', '</div>');
                    break;
                case 3:                     
                    data = findData(body,'<div class="game_rank third_place">','<div class="game_summary">', '</div>');
                    break;
                default:
                    console.log(`Can't add ${placement} place, you must add it manually!`);
                    return;
            }
            console.log('data', data);
            const winners = getWinners(data);
            console.log(`Selected winners for #${jamNumber} are: \n`, winners, ``);
            const gameName = findData(data, '<h2>', '>', '<');
            const gameLink = findData(data, '<a href=', '"', '"');
            curlGet(jamlink, (body) => { 
                let data2 = body.split(new RegExp('<div class="jam_content user_formatted">', 'g'))[1];
                const jamTheme = findData(data2, '<h1>',':','<');
                let dataBasePath = "";
                 if (jamNumber >= 76 && jamNumber <= 100) {
                    dataBasePath = '../docs/data/winners_76-100.csv';
                } else if (jamNumber >= 101 && jamNumber <= 125) {
                    dataBasePath = '../docs/data/winners_101-125.csv';
                }
                const winnerRow = formatWinnersRow(winners, gameName, gameLink, jamTheme);
                console.log(`Winner row that is added to database: \n`,winnerRow);
                updateDatabase(dataBasePath, gameName, gameLink, winnerRow, jamTheme);
            });
        } catch (e) {
            console.log(`Can't find a winner for trijam ${jamNumber}? Has the winner been announced yet? \n`, e);
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
    var data;
    try {
        data = datain.split(term, 2);
        data = data[1].split(start, 2);
        data = data[1].split(end, 2);        
    } catch (e) {
        console.log(`Could not find anything with findData()`);
        return undefined;
    }
    return data[0].replace(new RegExp(',', 'g'), '.').replace(new RegExp('&nbsp;', 'g'), ' ');
}
/**
 * 
 * 
 * @param {string} datain 
 * @returns {[{name: string, link: string}]} winners array
 */
function getWinners (datain) {
    const winnersData = findData(datain, '<h3>', 'by', '</h3>');
    console.log('winnersData', winnersData);
    const winnersSplit = winnersData.split(new RegExp('<a', 'g'), 10);
    let winners = [];
    for(const winner of winnersSplit) {
        if (winner.trim() === "") continue;
        console.log('winner', winner);
        const winnerLink = findData(winner, 'href=', '"', '"');
        const winnerName = findData(winner, 'href=', '>', '</a');
        winners.push({name: winnerName, link: winnerLink});
    }
    return winners;
}

/**
 * Gives the winner(s) as a row
 * @param {[{name: string, link: string}]} winnersArray 
 * @returns {string} returns new row for database
 */
function formatWinnersRow(winnersArray, gameName, gameLink, jamTheme) {
    // Formats the new row
    let newRow = `${jamNumber},`;
    let i = 0;
    for (const winner of winnersArray) {
        newRow += `${winner.name}>>>${winner.link}`;
        if ((i + 1) < winnersArray.length) {
            newRow += `&&&`;
        }
        i++;
    }
    newRow += `,${gameName}>>>${gameLink},`;
    newRow += `${jamTheme}`;
    return newRow;
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
function updateDatabase(path, gameName, gameLink, winnerRow, jamTheme) {
    fs.readFile(path, 'utf8', async (err, datain) => {
        if (err) {
            console.log("updateDatabase error",err);
            return;
        }
        const rows = datain.split('\n');
        switch (rows.length) {
            case 1: 
                winnerRow = rows[0] + '\n' + winnerRow;
                fs.writeFile(path, winnerRow, 'utf8', () => {
                    console.log(`New data should have been written to ${path}.`);
                    setTimeout(() => {                        
                        gitCommitPush();
                    }, 500);
                });
                break;
            default:
                for (let i = 1; i < rows.length; i++) {
                    let row = rows[i].split(new RegExp(',','g'));
                    if (row.length === 4) {
                        if (parseInt(row[0], 10) === jamNumber) {
                            console.log(`Winner ${jamNumber} already in database file.`);
                            await gitPush();
                            console.log(`Atempted to push winner again!`);
                            return;
                        }
                    }
                }
                let returnData = "";
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if (i === 0) {
                        returnData += rows[0] + '\n';
                        returnData += winnerRow + '\n';
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
async function gitCommitPush() {
    await gitAdd();
    setTimeout(() => {
        let git = shell.exec('git commit -m "Auto-updated"', async (code,stderr,stdout) => {
            if (code === 0){
                setTimeout(async () => {
                    await gitPush();
                    console.log(`Atempted to push winner!`);
                }, 1000);
            }
            else {
                console.log('git commit failed. Please restart and try again!\n', stderr);
            }            
        });
    }, 500);
}
/** Does git push */
function gitPush() {
    return new Promise((resolve, reject) => {
        shell.exec('git push', (code,stderr,stdout) => {
            if (code === 0) {
                console.log('All seems ok! (Please check on github so it actually is uploaded!)');
                resolve();
            }
            else if (stderr){
                console.log('push got rejected\n', stderr);
                reject(stderr);
            }
        });
        // console.log('git pushed', gitPush.stdout, gitPush.stderr);
    });
}
/** Does git add . */
function gitAdd() {
    return new Promise((resolve, reject) => {
        shell.exec('git add .', (code,stderr,stdout) => {
            if (code === 0) {
                console.log('Added files.\n', stdout);
                resolve();
            }
            else if (stderr){
                console.log('add failed\n', stderr);
                reject(stderr);
            }
            else {                
                console.log('something went wrong with git add\n', code);
            }
        });
    });
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
