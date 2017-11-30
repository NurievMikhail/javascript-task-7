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

        let index = 0;
        let resultJobs = [];
        const timeoutJobs = jobs.map(job =>
            () => new Promise((jobResolve, jobReject) => {
                job().then(jobResolve, jobReject);
                setTimeout(() => (jobReject(new Error('Promise timeout'))), timeout);
            })
        );
        const emitFunction = (result) => {
            resultJobs[index] = result;
            if (timeoutJobs.length > index) {
                timeoutJobs[index]().then(emitFunction, emitFunction);
                index++;
            }
            if (timeoutJobs.length === resultJobs.filter((a) => (a !== undefined)).length) {
                resolve(resultJobs);
            }
        };

        timeoutJobs
            .slice(0, parallelNum)
            .forEach((job) => {
                job().then(emitFunction, emitFunction);
                index++;
            });
    });
}
