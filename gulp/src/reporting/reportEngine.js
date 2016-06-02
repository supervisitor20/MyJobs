/**
 * DEPRECATED. Currently only used by export to call api.
 */
export class ReportFinder {
  constructor(api) {
    this.api = api;
  }

  /**
   * Get a set of report options for this report.
   */
  async getExportOptions(reportId) {
    return await this.api.getExportOptions(reportId);
  }
}
