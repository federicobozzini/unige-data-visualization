const xlsx = require('xlsx');
const fs = require('fs');

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
    const regions = getRegions();
    const population = getPopulation();

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

    const dismissedXls = workbook.Sheets[workbook.SheetNames[1]];
    const dismissedRaw = xlsx.utils.sheet_to_json(dismissedXls, { header: 1 });
    const dismissedRawWithTrentino = mergeTrentino(dismissedRaw);
    const dismissed = dismissedRawWithTrentino.slice(43, 46).map(
        row => ({
            year: getNum(row[0].replace('-TOT', '')),
            data: row.slice(cols.regSta, cols.regEnd)
                .concat([row[cols.total]])
                .map(n => getNum(n))
        })
    );

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
        years,
        regions,
        hirings,
        dismissed,
        voucher,
        population
    });
}


function mergeTrentino(raw) {
    return raw.map(
        row => row.slice(0, 5)
            .concat([getNum(row[5]) + getNum(row[6])])
            .concat(row.slice(7))
    );
}

function getPopulation() {
    return [
        {
            year: 2013,
            data: [
                4436798,
                128591,
                1591939,
                9973397,
                1051951,
                4926818,
                1229363,
                4446354,
                3750511,
                896742,
                1553138,
                5870451,
                1333939,
                314725,
                5869965,
                4090266,
                578391,
                1980533,
                5094937,
                1663859,
                60782668
            ]
        },
        {
            year: 2014,
            data: [
                4424467,
                128298,
                1583263,
                10002615,
                1055934,
                4927596,
                1227122,
                4450508,
                3752654,
                894762,
                1550796,
                5892425,
                1331574,
                313348,
                5861529,
                4090105,
                576619,
                1976631,
                5092080,
                1663286,
                60795612
            ]
        },
        {
            year: 2015,
            data: [
                4404246,
                127329,
                1571053,
                10008349,
                1059114,
                4915123,
                1221218,
                4448146,
                3744398,
                891181,
                1543752,
                5888472,
                1326513,
                312027,
                5850850,
                4077166,
                573694,
                1970521,
                5074261,
                1658138,
                60665551
            ]
        }
    ];
}

function getRegions() {
    return [
        {
            cod: 1,
            name: "PIEMONTE"
        },
        {
            cod: 2,
            name: "VALLE D'AOSTA"
        },
        {
            cod: 3,
            name: "LOMBARDIA"
        },
        {
            index: 4,
            cod: 4,
            name: "TRENTINO ALTO-ADIGE"
        },
        {
            cod: 5,
            name: "VENETO"
        },
        {
            cod: 6,
            name: "FRIULI-VENEZIA-GIULIA"
        },
        {
            cod: 7,
            name: "LIGURIA"
        },
        {
            cod: 8,
            name: "EMILIA-ROMAGNA"
        },
        {
            cod: 9,
            name: "TOSCANA"
        },
        {
            cod: 10,
            name: "UMBRIA"
        },
        {
            cod: 11,
            name: "MARCHE"
        },
        {
            cod: 12,
            name: "LAZIO"
        },
        {
            cod: 13,
            name: "ABRUZZO"
        },
        {
            cod: 14,
            name: "MOLISE"
        },
        {
            cod: 15,
            name: "CAMPANIA"
        },
        {
            cod: 16,
            name: "PUGLIA"
        },
        {
            cod: 17,
            name: "BASILICATA"
        },
        {
            cod: 18,
            name: "CALABRIA"
        },
        {
            cod: 19,
            name: "SICILIA"
        },
        {
            cod: 20,
            name: "SARDEGNA"
        },
        {
            cod: 21,
            name: "ITALIA"
        }
    ];
}