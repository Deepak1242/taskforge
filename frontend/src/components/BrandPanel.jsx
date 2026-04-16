import React from "react";
import brandLogo from "../logo-removebg-preview.png";
import { PRODUCT_NAME } from "../utils/constants";

const BrandPanel = () => (
  <aside className="brand-panel" aria-label={`${PRODUCT_NAME} overview`}>
    <div className="brand-top">
      <div className="brand-mark" aria-hidden="true">
        <img className="brand-logo" src={brandLogo} alt="" />
      </div>
      <p className="eyebrow">Task operations workspace</p>
    </div>
    <div>
      <h1>{PRODUCT_NAME}</h1>
      <p className="brand-copy">
        Sign in, capture work, and keep every task moving through a clean operational flow.
      </p>
    </div>
    <div className="brand-rhythm" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  </aside>
);

export default BrandPanel;