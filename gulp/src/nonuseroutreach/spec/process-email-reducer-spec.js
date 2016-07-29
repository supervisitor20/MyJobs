import reducer, {defaultState} from '../reducers/process-email-reducer';

import {
  resetProcessAction,
  createNewPartnerAction,
} from '../actions/process-email-actions';

describe('processEmailReducer', () => {
  describe('handling resetProcessAction', () => {
    const email = {
      id: 2,
      summary: 'some title',
      body: 'some info',
    };
    const result = reducer({}, resetProcessAction(email));

    it('should set the default state.', () => {
      expect(result.state).toEqual('RESET');
    });

    it('should remember the given email', () => {
      expect(result.email).toDiffEqual(email);
    });
  });
});


