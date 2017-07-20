const xlsx = require('xlsx');
const fs = require('fs');


Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};


extractApp1Data();
extractApp2Data();

function getNum(str) {
    if (typeof str !== 'string') {
        if (typeof str === 'number')
            return str;
        return 0;
    }

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

    const cols = {
        year: 0,
        regSta: 2,
        regEnd: 22,
        total: 23
    }

    const years = [2013, 2014, 2015];

    const rawDataFilename = 'rawData/03_MINLAV, Avviamenti e cessazioni, Italia, 2013-2016 (elaborazioni).xlsx'
    const workbook = xlsx.readFile(rawDataFilename);

    const hiringsXls = workbook.Sheets[workbook.SheetNames[0]];
    const hiringsRaw = xlsx.utils.sheet_to_json(hiringsXls, { header: 1 });
    const hiringsRawWithTrentino = mergeTrentino(hiringsRaw);
    const hirings = hiringsRawWithTrentino.slice(43, 46).map(
        row => ({
            year: getNum(row[0].replace('-TOT', '')),
            data: row.slice(cols.regSta, cols.regEnd)
                .concat([row[cols.total]])
                .map(n => getNum(n))
        })
    );

    const terminationsXls = workbook.Sheets[workbook.SheetNames[1]];
    const terminationsRaw = xlsx.utils.sheet_to_json(terminationsXls, { header: 1 });
    const terminationsRawWithTrentino = mergeTrentino(terminationsRaw);
    const terminations = terminationsRawWithTrentino.slice(43, 46).map(
        row => ({
            year: getNum(row[0].replace('-TOT', '')),
            data: row.slice(cols.regSta, cols.regEnd)
                .concat([row[cols.total]])
                .map(n => getNum(n))
        })
    );

    const voucherXls = workbook.Sheets[workbook.SheetNames[3]]
    const voucherRaw = xlsx.utils.sheet_to_json(voucherXls, { header: 1 });

    voucherRaw.move(4, 8);
    
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
        years,
        hirings,
        terminations,
        voucher
    });
}

function mergeTrentino(raw) {
    return raw.map(
        row => row.slice(0, 5)
            .concat([getNum(row[5]) + getNum(row[6])])
            .concat(row.slice(7))
    );
}