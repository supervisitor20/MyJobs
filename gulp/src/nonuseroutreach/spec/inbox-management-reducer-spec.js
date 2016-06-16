import {
  inboxManagementReducer as reducer,
  inboxState,
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

const state = inboxState.inboxManagement;

describe('inboxManagementReducer', () => {
  describe('validateInboxAction', () => {
    it('should mark blank emails as invalid', () => {
      const result = reducer(state, validateInboxAction({
        ...emptyInbox,
      }));

      expect(result.inboxes.filter(i => !i.valid)).toBeTruthy();
      expect(result.inboxes.filter(i => !!i.errors.length)).toBeTruthy();
    });

    it('should mark duplicate emails as invalid.', () => {
      const newInbox = {
        ...emptyInbox,
        email: 'testing',
      };
      const newState = {
        ...state,
        inboxes: [
          ...state.inboxes,
          newInbox,
        ],
      };
      const result = reducer(newState, validateInboxAction(newInbox));

      expect(result.inboxes.filter(i => !i.valid)).toBeTruthy();
      expect(result.inboxes.filter(i => !!i.errors.length)).toBeTruthy();
    });

    it('should mark emails with more than the local part as invalid', () => {
      const result = reducer(state, validateInboxAction({
        ...emptyInbox,
        email: 'foo@bar.com',
      }));

      expect(result.inboxes.filter(i => !i.valid)).toBeTruthy();
      expect(result.inboxes.filter(i => !!i.errors.length)).toBeTruthy();
    });
  });

  describe('addInboxAction', () => {
    it('should add one new inbox to the inboxes list', () => {
      const newState = {
        ...state,
        inboxes: [
          {...emptyInbox, email: 'something'},
        ]
      };
      const result = reducer(newState, addInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'something',
      }));

      expect(result.inboxes).toEqual([
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
      expect(result.inboxes).toContain({
        ...emptyInbox,
        pk: 1,
        email: 'first',
        originalEmail: 'first',
      });
      expect(result.inboxes).toEqual([
        emptyInbox,
        {...emptyInbox, pk: 1, email: 'first', originalEmail: 'first'},
        {...emptyInbox, pk: 2, email: 'second', originalEmail: 'second'},
      ]);
    });
  });

  describe('updateInboxAction', () => {
    it('should replace the inbox with the correct pk', () => {
      const newState = {
        ...state,
        inboxes: [
          {...emptyInbox, pk: 1, email: 'first'},
          {...emptyInbox, pk: 5, email: 'fifth'},
        ],
      };
      const result = reducer(newState, updateInboxAction({
        ...emptyInbox,
        pk: 5,
        email: 'still-fifth',
      }));

      expect(result.inboxes).toEqual([
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
      const newState = {
        ...state,
        inboxes: [
          {
            ...emptyInbox,
            pk: 1,
            email: 'new',
            originalEmail: 'old',
          }
        ],
      };
      const response = reducer(newState, resetInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'new',
        originalEmail: 'old',
      }));

      expect(response.inboxes).toEqual([
        {...emptyInbox, pk: 1, email: 'old', originalEmail: 'old'},
      ]);
    });
  });

  describe('deleteInboxAction', () => {
    it('should remove an inbox by pk.', () => {
      const newState = {
        ...state,
        inboxes: [{...emptyInbox, pk: 1, email: 'testing'}],
      };
      const result = reducer(newState, deleteInboxAction({
        ...emptyInbox,
        pk: 1,
        email: 'testing',
      }));

      expect(result.inboxes).toEqual([]);
    });
  });
});
