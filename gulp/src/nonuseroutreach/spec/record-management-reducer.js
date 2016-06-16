import {
  recordManagementReducer as reducer,
  recordState,
} from '../reducers/record-management-reducer';

import {getRecordsAction} from '../actions/record-actions';

const state = recordState.recordManagement;

describe('recordManagementReducer', () => {
  describe('getRecordsAction', () => {
    it('should assign records to the app state', () => {
      const outreach = [
        {
          outreachEmail: 'de_hr@prm.com',
          fromEmail: 'user@de.com',
          emailBody: 'prm email',
          workflowState: 'Reviewed',
        },
        {
          outreachEmail: 'de_hr@prm.com',
          fromEmail: 'anotherUser@de.com',
          emailBody: 'prm email',
          workflowState: 'Reviewed',
        },
      ];
      const result = reducer(state, getRecordsAction(outreach));
      expect(result.records).toEqual(outreach);
    });
  });
});
