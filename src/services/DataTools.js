const ColorConsole = require('../services/ColorConsole');
// const ConfigService = require('./services/Config/ConfigService');
// TODO use ConfigService getTestRailStatusSkipped, getTestRailStatusFailed, 
//    and getTestRailStatusPassed Instead of it 2, 5, 1

const RESULT_STATUS_FAILED = 5;
const RESULT_STATUS_SKIP = 2;
// const RESULT_STATUS_PASS = 1;


class DataTools {

  
  sayHiCyTr() {
    ColorConsole.debug('Hi from DataTools.sayHiCyTr' );
  }

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
        if (mergedResults[case_id].status_id !== RESULT_STATUS_FAILED) { // If one case failed don't process additional cases, Fail trumps all
          mergedResults[case_id].count += 1;
          if (status_id !== RESULT_STATUS_SKIP) { // If the current case is a skip then don't processing itFail trumps all, fail and pass Trump skip
                    
            mergedResults[case_id].status_id = status_id;
            mergedResults[case_id].comment = comment;
            mergedResults[case_id].elapsed = elapsed;
            mergedResults[case_id].screenshotPaths = screenshotPaths;
          }
        }
      } else { // a new case to setup
        mergedResults[case_id] = {...postData, count: 1}; 
      }
    });
    //console.log('mergedResults', mergedResults);
    // ColorConsole.debug('TestRail >> mergedResults:' +JSON.stringify(mergedResults) );

    Object.keys(mergedResults).forEach(case_id => {
      var newComment = mergedResults[case_id].comment;
      // Preserved failed case comments, they contain screenshots 
      // TODO Always preserved if testrail.runIncludeAll is true << needs testing
      if (mergedResults[case_id].count > 1 && mergedResults[case_id].status_id != RESULT_STATUS_FAILED) {
        newComment = `Summarization of ${mergedResults[case_id].count} Cypress tests\n\n${newComment}`;
      }
      var resultEntry = {
        ...mergedResults[case_id],
        comment: newComment,
      };
      emitPostData.push(resultEntry);
    });
    return emitPostData
  }
}

module.exports = DataTools;
