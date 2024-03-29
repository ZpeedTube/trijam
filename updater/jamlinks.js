/**
 * Returns current trijam number
 */
function trijamNumber(offsetDays=0) {
    const week = 7;
    const dayoffset = 1 + offsetDays; // Offsets days froward
    const weekoffset = 11 * week; // Offsets X weeks from first jam week
    // Tuesday of the first week of Trijam #1
    const dateStart = Date.UTC(2019, 0, 1 + weekoffset + dayoffset);
    const dateNow = Date.now();
    const dif = dateNow - dateStart;
    const calc = ((((dif / 1000) / 60) / 60) / 24) / 7;
    return Math.ceil(calc);
}
/**
 * Gets automatically a link based on trijamNumber().
 * Jam number offset and day offset can be given also.
 * @param {number} offset
 * @param {number} offsetDay
 */
function trijamLink(offset=0,offsetDay=0){
    return "https://itch.io/jam/trijam-"+(trijamNumber(offsetDay)+offset);
}
/** Returns link with given number at the end */
function trijamLinkNumber(num=0){
    return "https://itch.io/jam/trijam-"+(num);
}
module.exports.trijamNumber = trijamNumber;
module.exports.trijamLink = trijamLink;
module.exports.trijamLinkNumber = trijamLinkNumber;
