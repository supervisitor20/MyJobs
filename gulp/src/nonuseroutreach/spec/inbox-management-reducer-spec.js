import {
  inboxManagementReducer as reducer,
  initialInboxes as state,
  emptyInbox,
} from '../reducers/inbox-management-reducer';

import {
  validateInboxAction,
  addInboxAction,
  getInboxesAction,
  updateInboxAction,
  resetInboxAction,
  deleteInboxAction,
} from '../actions/inbox-actions';

describe('inboxManagementReducer', () => {
  describe('validateInboxAction', () => {
    it('should mark blank emails as invalid', () => {
      const result = reducer(state, validateInboxAction({
        ...emptyInbox,
      }));

      expect(result.filter(i => !i.valid)).toBeTruthy();
      expect(result.filter(i => !!i.errors.length)).toBeTruthy();
    });

    it('should mark duplicate emails as invalid.', () => {
      const newInbox = {
        ...emptyInbox,
        email: 'testing',
      };
      const newState = [...state, newInbox];
      const result = reducer(newState, validateInboxAction(newInbox));

      expect(result.filter(i => !i.valid)).toBeTruthy();
      expect(result.filter(i => !!i.errors.length)).toBeTruthy();
    });

    it('should mark emails with more than the local part as invalid', () => {
      const result = reducer(state, validateInboxAction({
        ...emptyInbox,
        email: 'foo@bar.com',
      }));

      expect(result.filter(i => !i.valid)).toBeTruthy();
      expect(result.filter(i => !!i.errors.length)).toBeTruthy();
    });
  });

  describe('addInboxAction', () => {
    it('should add one new inbox to the inboxes list', () => {
      const newState = [
        {...emptyInbox, email: 'something'},
      ];
      const result = reducer(newState, addInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'something',
      }));

      expect(result).toEqual([
        {...emptyInbox, pk: 1, email: 'something'}
      ]);
    });
  });

  describe('getInboxesAction', () => {
    it('should add props to each inbox.', () => {
      const result = reducer(state, getInboxesAction([
          {pk: 1, email: 'first'},
          {pk: 2, email: 'second'},
      ]));
      expect(result).toEqual([
        emptyInbox,
        {...emptyInbox, pk: 1, email: 'first', originalEmail: 'first'},
        {...emptyInbox, pk: 2, email: 'second', originalEmail: 'second'},
      ]);
    });
  });

  describe('updateInboxAction', () => {
    it('should replace the inbox with the correct pk', () => {
      const newState = [
        {...emptyInbox, pk: 1, email: 'first'},
        {...emptyInbox, pk: 5, email: 'fifth'},
      ];
      const result = reducer(newState, updateInboxAction({
        ...emptyInbox,
        pk: 5,
        email: 'still-fifth',
      }));

      expect(result).toEqual([
        {...emptyInbox, pk: 1, email: 'first'},
        {
          ...emptyInbox,
          pk: 5, email: 'still-fifth', 
          originalEmail: 'still-fifth'
        },
      ]);
    });
  });

  describe('resetInboxAction', () => {
    it('should set the inbox email to originalEmail', () => {
      const newState = [
        {
          ...emptyInbox,
          pk: 1,
          email: 'new',
          originalEmail: 'old',
        }
      ];
      const response = reducer(newState, resetInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'new',
        originalEmail: 'old',
      }));

      expect(response).toEqual([
        {...emptyInbox, pk: 1, email: 'old', originalEmail: 'old'},
      ]);
    });
  });

  describe('deleteInboxAction', () => {
    it('should remove an inbox by pk.', () => {
      const newState = [
        {...emptyInbox, pk: 1, email: 'testing'},
      ];
      const result = reducer(newState, deleteInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'testing',
      }));

      expect(result).toEqual([]);
    });
  });
});
