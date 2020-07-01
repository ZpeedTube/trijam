/**
 * Returns current trijam number
 */
function trijamNumber() {
    const week = 7;
    const dayoffset = 2; // Offsets days froward
    const weekoffset = 2 * week; // Offsets 2 weeks from first jam week
    // Tuesday of the first week of Trijam #1
    const dateStart = Date.UTC(2019, 0, 1 + weekoffset + dayoffset);
    const dateNow = Date.now();
    const dif = dateNow - dateStart;
    const calc = ((((dif / 1000) / 60) / 60) / 24) / 7;
    return Math.ceil(calc);
}

function trijamLink(offset=0){
    return "https://itch.io/jam/trijam-"+(trijamNumber()+offset);
}
module.exports.trijamLink = trijamLink;
module.exports.trijamNumber = trijamNumber;