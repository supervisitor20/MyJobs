export function switchActiveTab(tabId) {
  return {
    type: 'SWITCH_ACTIVE_TAB',
    payload: tabId,
  };
}

export function removeSelectedTab(tabId) {
  return {
    type: 'REMOVE_SELECTED_TAB',
    payload: tabId,
  };
}
