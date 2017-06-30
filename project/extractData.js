const xlsx = require('xlsx');
const fs = require('fs');

function getNum(str) {
    if (!str)
        return 0;
    return +str.replace(/\D+/g, '');
}

function writeData(fileName, data) {
    fs.writeFileSync(fileName, JSON.stringify(data));
}

function extractApp1Data() {
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
    writeData('data/app1.json', marketJobData);
}


function extractApp2Data() {
    const rawDataFilename = 'rawData/03_MINLAV, Avviamenti e cessazioni, Italia, 2013-2016 (elaborazioni).xlsx'
    const workbook = xlsx.readFile(rawDataFilename);

    const startsXls = workbook.Sheets[workbook.SheetNames[0]]
    const startsRaw = xlsx.utils.sheet_to_json(startsXls, { header: 1 });
    const regions = startsRaw[0].slice(2, 23)
    const starts = startsRaw.slice(43, 47).map(a => ({
        year: getNum(a[0].replace('-TOT', '')),
        data: a.slice(2, 23).map(n => getNum(n))
    }));

    const voucherXls = workbook.Sheets[workbook.SheetNames[3]]
    const voucherRaw = xlsx.utils.sheet_to_json(voucherXls, { header: 1 });


    const voucher = [
        {
            year: 2013,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[1]))
        },
        {
            year: 2014,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[4]))

        },
        {
            year: 2015,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[7]))

        },
    ];

    writeData('data/app2.json', {
        regions,
        starts,
        voucher
    });
}

extractApp1Data();
extractApp2Data();