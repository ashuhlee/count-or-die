import { useState } from "react";

import { useGame } from "../../../provider/useGame.ts";
import { useStartupDone } from "../../../provider/useStartupDone.ts";
import {
  betaNoticeSeen,
  hideBetaNotice,
  markBetaNoticeSeen,
} from "../../../utils/storage/betaNotice.ts";
import AlertButton from "../../components/buttons/alert-button/AlertButton.tsx";
import PixelPanel from "../../components/hud/pixel-panel/PixelPanel.tsx";

export default function BetaNotice() {
  const { betaNotice, actions } = useGame();
  const loaded = useStartupDone();
  const [returning] = useState(betaNoticeSeen);

  return (
    <div
      id="beta-notice"
      className={`beta-notice${betaNotice ? "" : " beta-notice--leaving"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-notice-title"
    >
      {/*<h1 id="beta-notice-title" className="beta-notice-title">*/}
      {/*  Welcome to the beta!*/}
      {/*</h1>*/}

      <PixelPanel
        border="#69648a"
        shadowHeight={0.01}
        className={`beta-notice-card${loaded ? " beta-notice-card--in" : ""}`}
      >
        <p className="beta-notice-greeting">Hello!</p>
        <p>
          Thank you for trying the <strong>Count or Die</strong> beta!
        </p>
        <p>
          I&apos;m open to feedback, so don&apos;t hesitate to tell me what you
          think. The <strong>report a bug</strong> button on the main menu is
          the quickest way!
        </p>
        <p>
          Try to beat your high score, and see if you can finish the daily
          challenges.
        </p>
        <p className="beta-notice-warning">
          This doesn&apos;t represent the final state of the game and everything
          is subject to change.
        </p>
        <p>Enjoy the game!</p>

        <div className="beta-notice-actions">
          <AlertButton
            id="beta-notice-btn"
            tone="yes"
            label="Let's go!"
            click
            onClick={() => {
              markBetaNoticeSeen();
              actions.dismissBetaNotice();
            }}
          />
          {returning && (
            <AlertButton
              id="beta-notice-never-btn"
              tone="no"
              label="Don't show again"
              click
              onClick={() => {
                hideBetaNotice();
                actions.dismissBetaNotice();
              }}
            />
          )}
        </div>
      </PixelPanel>
    </div>
  );
}
