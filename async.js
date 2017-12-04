'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (jobs.length === 0 || parallelNum <= 0) {
            return resolve([]);
        }

        let counter = 0;
        let resultJobs = new Array(jobs.length);
        let timeoutJobs = jobs.map(job =>
            () => Promise.race([
                job(),
                new Promise((jobResolve) => {
                    setTimeout(jobResolve, timeout, new Error('Promise timeout'));
                })
            ]));
        let finish = 0;

        timeoutJobs
            .slice(0, parallelNum)
            .forEach((job) => createJob(job));

        function runJob(jobResult, index) {
            resultJobs[index] = jobResult;
            finish++;
            if (timeoutJobs.length > counter) {
                createJob(jobs[counter]);
            }
            if (timeoutJobs.length === finish) {
                resolve(resultJobs);
            }
        }

        function createJob(createdJob) {
            let index = counter;
            counter++;
            let emitFunction = (jobResult) => (runJob(jobResult, index));
            createdJob().then(emitFunction);
        }
    });
}
