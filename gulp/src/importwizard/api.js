import {MyJobsApi} from 'common/myjobs-api';
import {getCsrf} from 'common/cookie';

const myJobsApi = new MyJobsApi(getCsrf());

export default {
  importFiles: files => myJobsApi.upload('/prm/view/import/', files),
};
