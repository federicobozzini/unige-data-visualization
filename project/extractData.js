const xlsx = require('xlsx');
const fs = require('fs');

function getNum(str) {
    if (!str)
        return 0;
    return +str.replace(',', '');
}

const rawDataFilename = 'rawData/01_ISTAT, Forze di lavoro per anno, 1959-2015.xls'
const workbook = xlsx.readFile(rawDataFilename);
const sheetName = workbook.SheetNames[0];
const ws = workbook.Sheets[sheetName];
const fullSheetData = xlsx.utils.sheet_to_json(ws, { header: 1 });
const marketJobData = fullSheetData.slice(8, 65).map(r => ({
    year: getNum(r[0]),
    maleOccupied: getNum(r[1]),
    maleNotOccupied: getNum(r[2]),
    maleNotWorkforce: getNum(r[4]),
    femaleOccupied: getNum(r[6]),
    femaleNotOccupied: getNum(r[7]),
    femaleNotWorkforce: getNum(r[9])
}));
const dataFilename = 'data/app1.json';
fs.writeFileSync(dataFilename, JSON.stringify(marketJobData));