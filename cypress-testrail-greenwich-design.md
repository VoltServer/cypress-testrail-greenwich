# Purpose and intentions of project
The intentions of the cypress-testrail-greenwich project is to automate the transmission of Cyprus results to TestRail (TR), so that TR tests that have pass in Cypress, can be skipped by, TR validation, workers.

If a TR test it's noted as failing that test will need to be performed by TR workers and the results added to the validation, test report after the Cypress automated entries.

When investigating cypress failures to determine whether they are device failures, or Cypress test failures cypresses Mochawesome, the Cypress App or the Cypress test code Will be directly examined. 


# Design considerations and constraints
It is a common occurrence that TR test cases Will be implemented in Cypress by many individual Cypress test cases. It is the job of cypress-testrail-greenwich to aggregate these many individual Cypress test cases into one report entered automatically into TR against one TR test case.

# Rules on aggregation and reporting
TR and Cypress both use three test results that are recognized here which are pass, fail and skip
Given a number of heterogeneous Cyprus results for a single TR case the rules for aggregation or follow:

	1) One or many failures in set of heterogeneous results always leads to a report of a failure
    2) To pass all Cyprus test must pass
    3) Given a mixture of passing and skipping a report of passing will be given

On a failure, Cypress generates meaningful comments, and a screenshot. In the case of multiple failures, only the first failure is reporting.

A tally is kept of the number of passes, failures and skips the comment line is prefixed with an extra line, giving these results.

Summarization {case_id} has {m) passes {n} failures and {i} skips