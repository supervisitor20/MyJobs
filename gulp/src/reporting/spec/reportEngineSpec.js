import {
  ReportFinder,
  ReportConfiguration,
} from '../reportEngine';

import {promiseTest} from '../../common/spec';


class FakeBuilder {
  build(name, rpId, filters) {
    return {
      marker: 'report configuration here',
      runCallbacks: () => {},
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
    await finder.buildReportConfiguration('', '', '', 12, {}, nop, nop, nop, nop);
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
    await finder.buildReportConfiguration('', '', '', reportDataId, {}, nop, nop,
      nop, onReportDataChanged);
    expect(reportDataId).toEqual(12);
  }));

  describe('subscriptions', () => {
    let newId = null;
    let newRunningReport = null;
    const ref = finder.subscribeToNewReports(
      (id, r) => {
        newId = id;
        newRunningReport = r;
      },
      r => {newRunningReport = r;});

    it('can inform subscribers of new reports', () => {
      finder.noteNewReport(22, 23);
      expect(newId).toEqual(22);
      expect(newRunningReport).toEqual(23);
    });

    it('can inform subscribers of running reports', () => {
      finder.noteNewRunningReport(24);
      expect(newRunningReport).toEqual(24);
    });

    it('can unsubscribe', () => {
      finder.noteNewReport(22);
      finder.unsubscribeToNewReports(ref);
      finder.noteNewReport(33);
      expect(newId).toEqual(22);
    });
  });
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
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({});
    expect(fakeComponent.onErrorsChanged).toHaveBeenCalledWith({});
  });

  it('can set simple filters', () => {
    config.setFilter('city', 'Indianapolis');
    expect(config.getFilter()).toEqual({city: 'Indianapolis'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      city: 'Indianapolis',
    });
    config.setFilter('state', 'Indiana');
    expect(config.getFilter()).toEqual({
      city: 'Indianapolis',
      state: 'Indiana',
    });
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      city: 'Indianapolis',
      state: 'Indiana',
    });
  });

  it('can set simple filters to object values', () => {
    config.setFilter('locations', {'city': 'Indianapolis'});
    expect(config.getFilter()).toEqual({'locations': {city: 'Indianapolis'}});
  });

  it('treats null filter values as removal', () => {
    config.setFilter('city', 'Indianapolis');
    config.setFilter('city', null);
    expect(config.getFilter()).toEqual({});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({});
  });

  it('treats undefined filter values as removal', () => {
    config.setFilter('city', 'Indianapolis');
    config.setFilter('city', undefined);
    expect(config.getFilter()).toEqual({});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({});
  });

  it('can set changes to multifilters', () => {
    config.addToMultifilter('tag', {key: 'blue', display: 'Blue'});
    expect(config.getFilter()).toEqual({tag: ['blue']});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'blue', display: 'Blue'}],
    });
  });

  it("won't add dups in multifilters", () => {
    config.addToMultifilter('tag', {key: 'blue', display: 'Blue'});
    config.addToMultifilter('tag', {key: 'blue', display: 'Blue'});
    expect(config.getFilter()).toEqual({tag: ['blue']});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'blue', display: 'Blue'}],
    });
  });

  it('can remove items from multifilters', () => {
    config.addToMultifilter('tag', {key: 'red', display: 'Red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'red', display: 'Red'}],
    });
    config.addToMultifilter('tag', {key: 'blue', display: 'Blue'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'red', display: 'Red'}, {key: 'blue', display: 'Blue'}],
    });
    config.removeFromMultifilter('tag', {key: 'red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'blue', display: 'Blue'}],
    });
    config.removeFromMultifilter('tag', {key: 'red'});
    expect(config.getFilter()).toEqual({tag: ['blue']});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [{key: 'blue', display: 'Blue'}],
    });
  });

  it('can remember and/or filters', () => {
    config.addToAndOrFilter('tag', 0, {key: 'red', display: 'Red'});
    expect(config.getFilter()).toEqual({tag: [['red']]});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'red', display: 'Red'}]],
    });
  });

  it('can remove items from and/or filters', () => {
    config.addToAndOrFilter('tag', 0, {key: 'red', display: 'Red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'red', display: 'Red'}]],
    });
    config.addToAndOrFilter('tag', 0, {key: 'blue', display: 'Blue'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'red', display: 'Red'}, {key: 'blue', display: 'Blue'}]],
    });
    config.removeFromAndOrFilter('tag', 0, {key: 'red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'blue', display: 'Blue'}]],
    });
    config.removeFromAndOrFilter('tag', 0, {key: 'red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'blue', display: 'Blue'}]],
    });
    expect(config.getFilter()).toEqual({
      tag: [['blue']],
    });
  });

  it('removes empty tag lists on demand for and/or filters', () => {
    config.addToAndOrFilter('tag', 0, {key: 'red', display: 'Red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [[{key: 'red', display: 'Red'}]],
    });
    config.addToAndOrFilter('tag', 1, {key: 'red', display: 'Red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [
        [{key: 'red', display: 'Red'}],
        [{key: 'red', display: 'Red'}],
      ],
    });
    config.addToAndOrFilter('tag', 0, {key: 'blue', display: 'Blue'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [
        [{key: 'red', display: 'Red'}, {key: 'blue', display: 'Blue'}],
        [{key: 'red', display: 'Red'}],
      ],
    });
    config.removeFromAndOrFilter('tag', 0, {key: 'red'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [
        [{key: 'blue', display: 'Blue'}],
        [{key: 'red', display: 'Red'}],
      ],
    });
    config.removeFromAndOrFilter('tag', 0, {key: 'blue'});
    expect(fakeComponent.onUpdateFilter).toHaveBeenCalledWith({
      'tag': [
        [{key: 'red', display: 'Red'}],
      ],
    });
    expect(config.getFilter()).toEqual({tag: [['red']]});
  });

  it('can run the report', promiseTest(async () => {
    spyOn(fakeApi, 'runReport').and.callThrough();

    await config.run();

    expect(fakeApi.runReport).toHaveBeenCalledWith(2, 'defaultName', {});
    expect(fakeComponent.newReportNote).toHaveBeenCalled();
    expect(fakeComponent.newRunningReportNote).toHaveBeenCalled();
  }));

  it('can change the name of the report', promiseTest(async() => {
    spyOn(fakeApi, 'runReport').and.callThrough();

    config.changeReportName('bbb');
    expect(fakeComponent.onNameChanged).toHaveBeenCalledWith('bbb');
    await config.run();

    expect(fakeApi.runReport).toHaveBeenCalledWith(2, 'bbb', {});
  }));

  it('notes name errors from api', promiseTest(async() => {
    fakeApi.runReport = () => {
      const error = new Error();
      error.data = [
        {
          field: 'name',
          message: 'zzz',
        },
      ]
      throw error;
    };
    await config.run();

    expect(fakeComponent.onErrorsChanged).toHaveBeenCalledWith({
      name: ['zzz'],
    });
  }));

  it('notes generic errors from api', promiseTest(async() => {
    fakeApi.runReport = () => {
      const error = new Error();
      error.data = [
        {
          field: '',
          message: 'yyy',
        },
      ];
      throw error;
    };
    await config.run();

    expect(fakeComponent.onErrorsChanged).toHaveBeenCalledWith({
      '': ['yyy'],
    });
  }));

  it('clears errors after a successful run', promiseTest(async() => {
    await config.run();
    expect(fakeComponent.onErrorsChanged).toHaveBeenCalledWith({});
  }))

});
