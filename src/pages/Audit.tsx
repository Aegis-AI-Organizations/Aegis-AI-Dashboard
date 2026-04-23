import React from "react";
import { AuditTrail } from "../components/AuditTrail";
import { pageTitle } from "styled-system/recipes";
import { css } from "styled-system/css";

export const Audit: React.FC = () => {
  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div>
        <h1 className={pageTitle()}>Logs d'Audit</h1>
        <p className={css({ color: "text.muted", fontSize: "sm" })}>
          Consultez l'historique complet des actions effectuées sur la
          plateforme.
        </p>
      </div>
      <AuditTrail />
    </div>
  );
};
