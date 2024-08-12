const DataTools = require('../../../src/services/DataTools');

const dataTools = new DataTools();

const testData =  [
    {"case_id":"00001",
    "status_id":1,
    "comment":"C00001: shows a history",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00001",
    "status_id":1,
    "comment":"46770: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00002",
    "status_id":2,
    "comment":"C00002: shows a history",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00002",
    "status_id":2,
    "comment":"00002: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00003",
    "status_id":5,
    "comment":"C00003: shows a history",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00003",
    "status_id":5,
    "comment":"00003: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00004",
    "status_id":5,
    "comment":"C00004: shows a history",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00004",
    "status_id":1,
    "comment":"00003: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00005",
    "status_id":1,
    "comment":"C00005: shows a history",
    "screenshotPaths":[],
    "elapsed":"4s"
    },
    {"case_id":"00005",
    "status_id":2,
    "comment":"00005: shows a history ",
    "screenshotPaths":[],
    "elapsed":"5s"
    },
    {"case_id":"00005",
    "status_id":5,
    "comment":"00005: shows a history ",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00005",
    "status_id":2,
    "comment":"00005: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00006",
    "status_id":1,
    "comment":"C00006: shows a history",
    "screenshotPaths":[],
    "elapsed":"5s"
    },
    {"case_id":"00006",
    "status_id":2,
    "comment":"00006: shows a history ",
    "screenshotPaths":[],
    "elapsed":"3s"
    },
    {"case_id":"00006",
    "status_id":2,
    "comment":"00006: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00007",
    "status_id":1,
    "comment":"C00007: shows a history",
    "screenshotPaths":[],
    "elapsed":"2s"
    },
    {"case_id":"00007",
    "status_id":7,
    "comment":"00007: shows a history ",
    "screenshotPaths":[],
    "elapsed":"1s"
    },
    {"case_id":"00007",
    "status_id":5,
    "comment":"00007: shows a history ",
    "screenshotPaths":[],
    "elapsed":"6s"
    },
]
// console.log('\nHi from DataTools.spec.js');


describe('aggregation property consistency', () => {
    test('emits one item for each unique case_id value', () => {
        const case_idList = [];
        let uniqueCase_idCount = 0;
        testData.forEach((testResult) => {
            if (case_idList.indexOf(testResult.case_id) < 0) { // in the list
            case_idList.push(testResult.case_id)
            uniqueCase_idCount += 1
            }
        });
        const results = dataTools.aggregateDuplicateResults(testData);
        expect(results.length).toBe(uniqueCase_idCount);        
    });

    test('all properties besides, status_id and comment get passed through', () => {
        // This may only work because of the simplicity of testData
        const results = dataTools.aggregateDuplicateResults(testData);
        results.forEach((cdaResult) => {
            testData.forEach((dataResult) => {
                if (cdaResult.case_id === dataResult.case_id 
                    && cdaResult.status_id === dataResult.status_id) { //
                        Object.keys(testData).forEach(key => {  
                            if (!key.includes['case_id', 'status_id', 'comment']) { // NOT 
                                // Expect results to be passed through unaltered from input
                                expect(cdaResult[key]).toBe(dataResult[key]); // the test
                            }
                        });
                }   
            });
        })
    });
});

describe('Status aggregation rules', () => {
    describe('All statuses are the same', () => {
        test('status of pass and pass gives, pass', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00001');
            expect(testCaseId.status_id).toBe(1); // pp => p
        });

        test('status of skip and skip gives, skip', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00002');
            expect(testCaseId.status_id).toBe(2); // ss => s
        });

        test('status of fail and fail gives, fail', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00003');
            expect(testCaseId.status_id).toBe(5); // ff => f
        });
    });
    describe('Triplet set of statuses', () => {
        // fail always dominate 
        test('status of fail, pass, and skip gives, fail', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00007');
            expect(testCaseId.status_id).toBe(5); // fsp => f
        });
        // fail always dominate 
        test('status of fail and skip gives, fail', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00004');
            expect(testCaseId.status_id).toBe(5); // fpp => f
        });
        // fail always dominate 
        test('status of fail and pass gives, fail', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00005');
            expect(testCaseId.status_id).toBe(5); // fss => f
        });
        // pass dominate skip
        test('status of pass and skip gives, pass', () => {
            const results = dataTools.aggregateDuplicateResults(testData);
            const testCaseId = results.find((r) => r.case_id === '00006');
            expect(testCaseId.status_id).toBe(1); // pss => p
        });
    });
});

