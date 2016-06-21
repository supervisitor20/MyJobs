import {
  recordManagementReducer as reducer,
  initialRecords,
} from '../reducers/record-management-reducer';

import {getRecordsAction} from '../actions/record-actions';

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
      const result = reducer(initialRecords, getRecordsAction(outreach));
      expect(result).toEqual(outreach);
    });
  });
});
