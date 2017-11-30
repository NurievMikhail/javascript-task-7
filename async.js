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
        let resultJobs = [];
        const emitFunction = (result) => (runJob(result, counter));
        let timeoutJobs = jobs.map(job =>
            () => new Promise((jobResolve, jobReject) => {
                job().then(jobResolve, jobReject);
                setTimeout(() => (jobReject(new Error('Promise timeout'))), timeout);
            })
        );
        let finish = 0;

        timeoutJobs
            .slice(0, parallelNum)
            .forEach((job) => {
                job().then(emitFunction, emitFunction);
                counter++;
            });

        function runJob(jobResult, index) {
            resultJobs[index] = jobResult;
            finish++;
            if (timeoutJobs.length > counter) {
                timeoutJobs[counter]().then(emitFunction, emitFunction);
                counter++;
            }
            if (timeoutJobs.length === finish) {
                resolve(resultJobs);
            }
        }
    });
}
