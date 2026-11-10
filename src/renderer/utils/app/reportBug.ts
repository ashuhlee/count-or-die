export const BUG_REPORT_URL =
  "https://github.com/ashuhlee/count-or-die/issues/new?template=bug_report.yml";

export function reportBug(): void {
  if (window.electron) {
    window.electron.reportBug();
  } else {
    window.open(BUG_REPORT_URL, "_blank", "noopener");
  }
}
