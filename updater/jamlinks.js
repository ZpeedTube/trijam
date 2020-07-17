/**
 * Returns current trijam number
 */
function trijamNumber(offsetDays=0) {
    const week = 7;
    const dayoffset = 1 + offsetDays; // Offsets days froward
    const weekoffset = 3 * week; // Offsets 3 weeks from first jam week
    // Tuesday of the first week of Trijam #1
    const dateStart = Date.UTC(2019, 0, 1 + weekoffset + dayoffset);
    const dateNow = Date.now();
    const dif = dateNow - dateStart;
    const calc = ((((dif / 1000) / 60) / 60) / 24) / 7;
    return Math.ceil(calc);
}

function trijamLink(offset=0,offsetDay=0){
    return "https://itch.io/jam/trijam-"+(trijamNumber(offsetDay)+offset);
}
module.exports.trijamLink = trijamLink;
module.exports.trijamNumber = trijamNumber;