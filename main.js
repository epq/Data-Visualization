
const honeyFile = 'data/honey.csv';
const numbersFile = 'data/numbers.csv';
const stressorsFile = 'data/stressors.csv';

Promise.all([d3.csv(honeyFile), d3.csv(numbersFile), d3.csv(stressorsFile)]).then(files => {
    const [honey, data, stressors] = files;
    console.log(honey[0]);
    console.log(data[0]);
    console.log(stressors[0]);
}).catch(err => {
    console.log(err);
});
