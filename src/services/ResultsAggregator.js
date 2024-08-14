const ColorConsole = require('./ColorConsole');
// const ConfigService = require('./services/Config/ConfigService');
// TODO use ConfigService getTestRailStatusSkipped, getTestRailStatusFailed, 
//    and getTestRailStatusPassed Instead of it 2, 5, 1

const RESULT_STATUS_FAILED = 5;
const RESULT_STATUS_SKIP = 2;
const RESULT_STATUS_PASS = 1;


class ResultsAggregator {


  /**
   *
   * @param {cytrPostData}
   * @returns {*}
   */
  aggregateDuplicateResults(cytrPostData) {
    // Replace multiple occurrences of test cases with one output summarizing case, aggregation rules are;
    // Fail trumps all, anything with a failed leads to the first failed item is the one emitted
    // If no mixed outcome, the same result is passed through
    // Pass trumps skip
    // If all test pass. The last comment is the one emitted.
    // if all pass or skip modify the comment statement with the prefix of `Summarization of {n} Cypress tests` 
    const emitPostData = []
    const mergedResults = {} // this is a map of case_id to merged result object

    cytrPostData.forEach((postData) => {
        const { case_id, status_id, comment, elapsed, screenshotPaths } = postData;
        if (Object.hasOwnProperty.call(mergedResults, case_id)) {
            // If one case failed don't process additional cases, Fail trumps all
            if (mergedResults[case_id].status_id !== RESULT_STATUS_FAILED) { 
                // If the current case is a skip then don't processing it
                if (status_id !== RESULT_STATUS_SKIP) { 
                    mergedResults[case_id].status_id = status_id;
                    mergedResults[case_id].comment = comment;
                    mergedResults[case_id].elapsed = elapsed;
                    mergedResults[case_id].screenshotPaths = screenshotPaths;
                    if (status_id === RESULT_STATUS_PASS) {
                        mergedResults[case_id].countP += 1;
                    } else {
                        mergedResults[case_id].countF += 1;
                    }
                    mergedResults[case_id].countS += 1;
                }
            }
        } else { // a new case to setup
            var ps = 0;
            var fl = 0;
            var sk = 0;
            if (status_id === RESULT_STATUS_PASS) {
                ps = 1;
            } else if (status_id === RESULT_STATUS_FAILED) {
                fl = 1;
            } else {
                sk = 1;
            }
            mergedResults[case_id] = {...postData, countP: ps, countF: fl, countS: sk}; 
        }
    });
    
    Object.keys(mergedResults).forEach(case_id => {
      var newComment = `Summarization C${case_id} has ` 
      + `${mergedResults[case_id].countP} Passing, ` 
      + `${mergedResults[case_id].countF} Failing, `
      + `and ${mergedResults[case_id].countS} Skipped `
      + `Cypress tests\n\n${mergedResults[case_id].comment}`;
    // TODO Always preserved if testrail.runIncludeAll is true << needs testing
    
      var resultEntry = {
        case_id: case_id,
        ...mergedResults[case_id],
        comment: newComment,
      };
      emitPostData.push(resultEntry);
    });
    return emitPostData
  }
}

module.exports = ResultsAggregator;
