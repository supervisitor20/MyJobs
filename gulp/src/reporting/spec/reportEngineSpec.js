import {
  Subscription,
  ReportFinder,
  ReportConfiguration,
} from '../reportEngine';

import {promiseTest} from '../../common/spec';


describe('Subscription', () => {
  let i;
  let j;
  let subscription;
  beforeEach(() => {
    i = 0;
    j = 0;
    subscription = new Subscription();
  });

  it('does nothing when called with no subscribers', () => {
    subscription.note(4);
    expect(i).toBe(0);
    expect(j).toBe(0);
  });

  it('can handle multiple subscribers', () => {
    subscription.subscribe(n => {i = n;});
    subscription.subscribe(n => {j = n;});
    subscription.note(4);
    expect(i).toBe(4);
    expect(j).toBe(4);
  });

  it('can handle multiple subscribers with similar callback identity', () => {
    function bumpI(n) {
      i += n;
    }
    subscription.subscribe(bumpI);
    subscription.subscribe(bumpI);
    subscription.note(4);
    expect(i).toBe(8);
  });

  it('can unsubscribe', () => {
    function bumpI(n) {
      i += n;
    }
    const unsubscribe = subscription.subscribe(bumpI);
    subscription.subscribe(bumpI);
    subscription.note(4);
    expect(i).toBe(8);
    unsubscribe();
    subscription.note(5);
    expect(i).toBe(13);
  });
});

class FakeBuilder {
  build(name, rpId, filters) {
    return {
      marker: 'report configuration here',
      runCallbacks: () => {},
      name: name,
    }
  }
}

function buildFakeApi() {
  return {
    getSetUpMenuChoices: () => ({report_data_id: 12}),
    getFilters: () => ({filters: {6: 6}}),
    getHelp: () =>
      [{'city': 'Indianapolis'}, {'city': 'Chicago'}],
    getDefaultReportName: () => ({'name': 'zzz'}),
    runReport: () => ({'ok': 7}),
  }
}

describe('ReportFinder', () => {
  const finder = new ReportFinder(
    buildFakeApi(),
    new FakeBuilder());

  it('can build a ReportConfiguration', promiseTest(async () => {
    let reportConfig;
    const nop = () => {};
    finder.subscribeToMenuChoices(
      (rits, rts, dts, rc) =>
        {reportConfig = rc});
    await finder.buildReportConfiguration('', '', '', 12, {}, '',
      nop, nop, nop, nop);
    expect(reportConfig.marker).toEqual('report configuration here');
  }));

  it('calls back if the reportDataId changes', promiseTest(async () => {
    let reportConfig;
    const nop = () => {};
    let reportDataId = 3;
    const onReportDataChanged = newId => {reportDataId = newId;};
    finder.subscribeToMenuChoices(
      (rits, rts, dts, rit, rt, dt, rc) =>
        {reportConfig = rc});
    await finder.buildReportConfiguration('', '', '', reportDataId, {}, '',
      nop, nop, nop, onReportDataChanged);
    expect(reportDataId).toEqual(12);
  }));

  it('sets a default name if it is blank', promiseTest(async () => {
    let reportConfig;
    const nop = () => {};
    finder.subscribeToMenuChoices(
      (rits, rts, dts, rc) =>
        {reportConfig = rc});
    await finder.buildReportConfiguration('', '', '', 12, {}, '',
      nop, nop, nop, nop);
    expect('zzz').toEqual(reportConfig.name);
  }));

  it('leaves nonblank names alone', promiseTest(async () => {
    let reportConfig;
    const nop = () => {};
    finder.subscribeToMenuChoices(
      (rits, rts, dts, rc) =>
        {reportConfig = rc});
    await finder.buildReportConfiguration('', '', '', 12, {}, 'aaa',
      nop, nop, nop, nop);
    expect('aaa').toEqual(reportConfig.name);
  }));
});

describe('ReportConfiguration', () => {
  let fakeApi;
  let config;
  let fakeComponent;
  let newReportEvents;

  class FakeComponent {
    newReportNote() {}
    newRunningReportNote() {}
    onNameChanged() {}
    onUpdateFilter() {}
    onErrorsChanged() {}
  }

  beforeEach(() => {
    fakeApi = buildFakeApi();

    fakeComponent = new FakeComponent();
    spyOn(fakeComponent, 'newReportNote').and.callThrough();
    spyOn(fakeComponent, 'newRunningReportNote').and.callThrough();
    spyOn(fakeComponent, 'onNameChanged').and.callThrough();
    spyOn(fakeComponent, 'onUpdateFilter').and.callThrough();
    spyOn(fakeComponent, 'onErrorsChanged').and.callThrough();

    config = new ReportConfiguration(
      'defaultName', 2, {}, {}, fakeApi,
      (id, report) => fakeComponent.newReportNote(id, report),
      report => fakeComponent.newRunningReportNote(report),
      name => {fakeComponent.onNameChanged(name)},
      f => {fakeComponent.onUpdateFilter(f)},
      errors => {fakeComponent.onErrorsChanged(errors)});
  });

  it('can get help', promiseTest(async () => {
    expect(await config.getHints('city', 'i')).toEqual(
      [{'city': 'Indianapolis'}, {'city': 'Chicago'}]);
  }));

  it('can visit callbacks to push initial state', () => {
    config.runCallbacks();
    expect(fakeComponent.onNameChanged).toHaveBeenCalledWith("defaultName");
    expect(fakeComponent.onErrorsChanged).toHaveBeenCalledWith({});
  });
});
