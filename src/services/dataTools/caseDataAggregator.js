// const ConfigService = require('../../../src/services/Config/ConfigService');

function caseDataAggregator(cytrPostData) {
  // Replace multiple occurrences of test cases with one output summarizing case
  // If all case are skip the emitted case will be skip
  // If some, cases fail the emitted case will be fail, and receive the data from the first failing case
  // if all pass emitted case will be pass, with comment set to `Summarization of {n} Cypress tests` 
  const emitPostData = []
  let postDataInfo = {}

  cytrPostData.forEach((postData) => {
    const { case_id, status_id, comment } = postData;
    if (Object.hasOwnProperty.call(postDataInfo, case_id)) {
      if (postDataInfo[case_id].status_id !== 5) { // If one case failed don't process additional cases
        postDataInfo[case_id].count += 1;
        if (status_id !== 2) { // If the current case is a skip then don't processing it
          // Note Rule: skip + skip should give skip, pass + skip should give pass. Above statement gives this
          // replace the current case  with the incoming case, which could be either a pass or fail          
          postDataInfo[case_id].status_id = status_id;
          postDataInfo[case_id].comment = comment; 
        }
      }
    } else { // a new case to setup
      postDataInfo[case_id] = {}; // declare the object before populating it
      postDataInfo[case_id].count = 1;
      postDataInfo[case_id].status_id = status_id;
      postDataInfo[case_id].comment = comment;
    }
  });
  console.log('postDataInfo', postDataInfo);
  Object.keys(postDataInfo).forEach(case_id => {
    var newComment = postDataInfo[case_id].comment;
    // Preserved failed case comments, they contain screenshots 
    if (postDataInfo[case_id].count > 1 && postDataInfo[case_id].status_id != 5) {
      newComment = `Summarization of ${postDataInfo[case_id].count} Cypress tests`;
    }
    var resultEntry = {
      case_id: case_id,
      status_id: postDataInfo[case_id].status_id,
      comment: newComment,
    };
    emitPostData.push(resultEntry);
  });
  return emitPostData
}

// ########### Test stuff follows ############### //

const testData = [
  {
    case_id: 'C12345',
    status_id: 1,
    comment: 'name: can be turned off',
  },
  {
    case_id: 'C12345',
    status_id: 1,
    comment: 'name: can be turned on',
  },
  {
    case_id: 'C12345',
    status_id: 1,
    comment: 'name: can be turned off',
  },
  {
    case_id: 'C66616',
    status_id: 1,
    comment: 'name: can be turned on',
  },
  {
    case_id: 'C66616',
    status_id: 1,
    comment: 'name: can be turned off',
  },
  {
    case_id: 'C66616',
    status_id: 1,
    comment: 'name: can be turned salon',
  },
  {
    case_id: 'C99199',
    status_id: 5,
    comment: 'displays proposed groups',
  },
  {
    case_id: 'C76457',
    status_id: 1,
    comment: 'name: can be turned on',
  },
  {
    case_id: 'C66616',
    status_id: 5,
    comment: 'name: can be turned off',
  },
  {
    case_id: 'C66616',
    status_id: 1,
    comment: 'name: can be turned salon',
  },
  {
    case_id: 'C77877',
    status_id: 2,
    comment: 'name: can be turned off',
  },
  {
    case_id: 'C77877',
    status_id: 2,
    comment: 'darkening only dark it',
  },
  {
    case_id: 'C88788',
    status_id: 2,
    comment: 'darkening only dark over',
  },
  {
    case_id: 'C88788',
    status_id: 1,
    comment: 'big turned over',
  }
]



const outputData = caseDataAggregator(testData)

console.log('outputData', outputData)

// var x = 2;
// function and2more(myx) {
//   return myx + 2;
// }

// x = and2more(x);
// console.log('and2more', x) // >> 4