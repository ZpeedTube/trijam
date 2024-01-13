function TrijamNumber() {
    const week = 7;
    const dayoffset = 2; // Offsets days froward
    const weekoffset = 10 * week; // Offsets X weeks from first jam week
    // Tuesday of the first week of Trijam #1
    const dateStart = Date.UTC(2019, 0, 1 + weekoffset + dayoffset);
    const dateNow = Date.now();
    const dif = dateNow - dateStart;
    const calc = ((((dif / 1000) / 60) / 60) / 24) / 7;
    return Math.ceil(calc);
}

function OpenJamLink(offset=0){
    const link = "https://itch.io/jam/trijam-"+(TrijamNumber()+offset);
    window.open(link);
}

function OpenSpecialJamLink(url){
    const link = url;
    window.open(link);
}
