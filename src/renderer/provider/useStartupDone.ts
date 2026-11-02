import { useEffect, useState } from "react";

import { isStartupCovering, whenStartupDone } from "../utils/app/startup.ts";

export function useStartupDone() {
  const [done, setDone] = useState(() => !isStartupCovering());

  useEffect(() => {
    if (done) return;
    return whenStartupDone(() => setDone(true));
  }, [done]);

  return done;
}
