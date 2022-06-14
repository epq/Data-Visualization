
const honeyFile = 'data/honey.csv';
const numbersFile = 'data/numbers.csv';
const stressorsFile = 'data/stressors.csv';

Promise.all([d3.csv(honeyFile), d3.csv(numbersFile), d3.csv(stressorsFile)]).then(files => {
    const [honeyData, numbersData, stressorsData] = files;
    const honey = honeyData.map(d => {
        for (prop in d) {
            if (prop !== 'State') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;
    });
    const numbers = numbersData.map(d => {
        for (prop in d) {
            if (prop !== 'State' && prop !== 'Year') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;
    });
    const stressors = stressorsData.map(d => {
        for (prop in d) {
            if (prop !== 'State' && prop !== 'Year' && prop !== 'Diseases') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;

    });
    console.log(honey[0]);
    console.log(numbers[0]);
    console.log(stressors[0]);
}).catch(err => {
    console.log(err);
});
