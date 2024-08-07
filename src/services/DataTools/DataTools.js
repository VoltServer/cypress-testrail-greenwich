const ColorConsole = require('../../services/ColorConsole');
// TODO use getTestRailStatusSkipped, getTestRailStatusFailed, and getTestRailStatusPassed Instead of it 2, 5, 1

class DataTools {

  
  sayHiCyTr() {
    ColorConsole.debug('Hi from DataTools.sayHiCyTr' );
  }

  /**
   *
   * @param {cytrPostData}
   * @returns {*}
   */
  caseDataAggregator(cytrPostData) {
    // Replace multiple occurrences of test cases with one output summarizing case, aggregation rules are;
    // Fail trumps all, anything with a failed leads to the first failed item is the one emitted
    // If no mixed outcome, the same result is passed through
    // Pass trumps skip
    // If all test pass. The last comment is the one emitted.
    // if all pass or skip modify the comment statement with the prefix of `Summarization of {n} Cypress tests` 
    const emitPostData = []
    let postDataInfo = {}

    cytrPostData.forEach((postData) => {
      const { case_id, status_id, comment, elapsed } = postData;
      if (Object.hasOwnProperty.call(postDataInfo, case_id)) {
        if (postDataInfo[case_id].status_id !== 5) { // If one case failed don't process additional cases, Fail trumps all
          postDataInfo[case_id].count += 1;
          if (status_id !== 2) { // If the current case is a skip then don't processing itFail trumps all, fail and pass Trump skip
                    
            postDataInfo[case_id].status_id = status_id;
            postDataInfo[case_id].comment = comment;
            postDataInfo[case_id].elapsed = elapsed;
          }
        }
      } else { // a new case to setup
        postDataInfo[case_id] = {}; // declare the object before populating it
        postDataInfo[case_id].count = 1;
        postDataInfo[case_id].status_id = status_id;
        postDataInfo[case_id].comment = comment;
        postDataInfo[case_id].elapsed = elapsed;
      }
    });
    //console.log('postDataInfo', postDataInfo);
    // ColorConsole.debug('TestRail >> postDataInfo:' +JSON.stringify(postDataInfo) );

    Object.keys(postDataInfo).forEach(case_id => {
      var newComment = postDataInfo[case_id].comment;
      // Preserved failed case comments, they contain screenshots 
      if (postDataInfo[case_id].count > 1 && postDataInfo[case_id].status_id != 5) {
        newComment = `Summarization of ${postDataInfo[case_id].count} Cypress tests\n\n${newComment}`;
      }
      var resultEntry = {
        case_id: case_id,
        status_id: postDataInfo[case_id].status_id,        
        comment: newComment,
        elapsed: postDataInfo[case_id].elapsed,
      };
      emitPostData.push(resultEntry);
      // ColorConsole.debug('caseDataAggregator >> resultEntry:' +JSON.stringify(resultEntry) );
    });
    return emitPostData
  }
}

module.exports = DataTools;

// ########### Test stuff follows ############### //


// const testData = [
//   {
//     case_id: 'C12345',
//     status_id: 1,
//     comment: 'name: can be turned off',
//   },
//   {
//     case_id: 'C12345',
//     status_id: 1,
//     comment: 'name: can be turned on',
//   },
//   {
//     case_id: 'C12345',
//     status_id: 1,
//     comment: 'name: can be turned off',
//   },
//   {
//     case_id: 'C66616',
//     status_id: 1,
//     comment: 'name: can be turned on',
//   },
//   {
//     case_id: 'C66616',
//     status_id: 1,
//     comment: 'name: can be turned off',
//   },
//   {
//     case_id: 'C66616',
//     status_id: 1,
//     comment: `C12345: only shows user account settings
// Spec: user_basic_role.cy.js
// Error: AssertionError: Timed out retrying after 4000ms: expected`,
//   },
//   {
//     case_id: 'C99199',
//     status_id: 5,
//     comment: `C12345: only shows user account settings
// Spec: user_basic_role.cy.js
// Error: AssertionError: Timed out retrying after 4000ms: expected`,
//   },
//   {
//     case_id: 'C76457',
//     status_id: 1,
//     comment: 'name: can be turned on',
//   },
//   {
//     case_id: 'C66616',
//     status_id: 5,
//     comment: `C12345: only shows user account settings
// Spec: user_basic_role.cy.js
// Error: AssertionError: Timed out retrying after 4000ms: expected`,
//   },
//   {
//     case_id: 'C66616',
//     status_id: 1,
//     comment: 'name: can be turned off',
//   },
//   {
//     case_id: 'C77877',
//     status_id: 2,
//     comment: 'name: can be turned off',
//   },
//   {
//     case_id: 'C77877',
//     status_id: 2,
//     comment: 'darkening only dark it',
//   },
//   {
//     case_id: 'C88788',
//     status_id: 2,
//     comment: 'darkening only dark over',
//   },
//   {
//     case_id: 'C88788',
//     status_id: 1,
//     comment: 'big turned over',
//   }
// ]


// const outputData = caseDataAggregator(testData)

// console.log('outputData', outputData)


