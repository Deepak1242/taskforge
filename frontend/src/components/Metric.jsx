import React from "react";

const Metric = ({ label, value }) => (
  <article className="metric">
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

export default Metric;