const ColorConsole = require('../services/ColorConsole');
// const ConfigService = require('./services/Config/ConfigService');
// TODO use ConfigService getTestRailStatusSkipped, getTestRailStatusFailed,
//    and getTestRailStatusPassed Instead of it 2, 5, 1

// see: https://support.testrail.com/hc/en-us/articles/7077935129364-Statuses#getstatuses
const RESULT_STATUS_FAILED = 5;
const RESULT_STATUS_RETEST = 4;
const RESULT_STATUS_SKIP = 2;
const RESULT_STATUS_PASS = 1;

const RESULT_NAMES = {
  [RESULT_STATUS_PASS]: 'PASS',
  [RESULT_STATUS_SKIP]: 'SKIP',
  [RESULT_STATUS_RETEST]: 'RETEST',
  [RESULT_STATUS_FAILED]: 'FAIL',
};

function chooseStatus(newStatus, oldStatus) {
  if ( oldStatus === RESULT_STATUS_FAILED ||
    newStatus === RESULT_STATUS_FAILED
  ) return RESULT_STATUS_FAILED;

  if ( oldStatus === RESULT_STATUS_PASS ||
    newStatus === RESULT_STATUS_PASS
  ) return RESULT_STATUS_PASS;

  return newStatus;
}

function getComment(status_id, comment) {
  return `* [${RESULT_NAMES[status_id]}] ${comment}\n`;
}

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
        // already found one
        const mergedResult = mergedResults[case_id];
        mergedResult.status_id = chooseStatus(status_id, mergedResult.status_id);
        mergedResult.count += 1;
        mergedResult.comment += getComment(status_id, comment);
        mergedResult.screenshotPaths = mergedResult.screenshotPaths.concat(screenshotPaths);
        //mergedResult.elapsed += elapsed; // TODO this is a "duration string"
      } else { // a new case to setup
        mergedResults[case_id] = {
          ...postData,
          comment: getComment(status_id, comment),
          count: 1,
        };
      }
    });
    //console.log('mergedResults', mergedResults);
    // ColorConsole.debug('TestRail >> mergedResults:' +JSON.stringify(mergedResults) );

    Object.keys(mergedResults).forEach(case_id => {
      var newComment = mergedResults[case_id].comment;
      // Preserved failed case comments, they contain screenshots
      // TODO Always preserved if testrail.runIncludeAll is true << needs testing
      if (mergedResults[case_id].count > 1 && mergedResults[case_id].status_id != RESULT_STATUS_FAILED) {
        newComment = `Summarization of ${mergedResults[case_id].count} Cypress tests:\n\n${newComment}`;
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
