import React, { useEffect, useState } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import { api } from "../api/Axios";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  button as buttonRecipe,
  card,
  pageSubtitle,
  pageTitle,
} from "styled-system/recipes";

interface CurrentCompany {
  id: string;
  name: string;
  owner_email: string;
  member_count: number;
  org_size: string;
  org_type: string;
  token_balance: number;
}

const orgSizeOptions = [
  ["ORGANIZATION_SIZE_1", "1 personne"],
  ["ORGANIZATION_SIZE_2_10", "2 à 10"],
  ["ORGANIZATION_SIZE_11_50", "11 à 50"],
  ["ORGANIZATION_SIZE_51_200", "51 à 200"],
  ["ORGANIZATION_SIZE_201_500", "201 à 500"],
  ["ORGANIZATION_SIZE_501_1000", "501 à 1000"],
  ["ORGANIZATION_SIZE_1001_5000", "1001 à 5000"],
  ["ORGANIZATION_SIZE_5001_10000", "5001 à 10000"],
  ["ORGANIZATION_SIZE_10001_PLUS", "10001+"],
];

const orgTypeOptions = [
  ["ORGANIZATION_TYPE_IT_SERVICES_AND_CONSULTING", "Services IT et conseil"],
  ["ORGANIZATION_TYPE_SOFTWARE_DEVELOPMENT", "Développement logiciel"],
  ["ORGANIZATION_TYPE_FINANCIAL_SERVICES", "Services financiers"],
  ["ORGANIZATION_TYPE_HOSPITALS_AND_HEALTH_CARE", "Santé"],
  ["ORGANIZATION_TYPE_RETAIL", "Retail"],
  ["ORGANIZATION_TYPE_GOVERNMENT_ADMINISTRATION", "Administration publique"],
  ["ORGANIZATION_TYPE_MANUFACTURING", "Industrie"],
  ["ORGANIZATION_TYPE_OTHER", "Autre"],
];

const fieldClass = css({
  w: "full",
  px: "4",
  py: "3",
  bg: "bg.main",
  border: "1px solid",
  borderColor: "border.subtle",
  color: "white",
  outline: "none",
  _focus: {
    borderColor: "brand.primary",
    boxShadow: "0 0 0 1px token(colors.brand.primary)",
  },
});

export const CompanySettings: React.FC = () => {
  const [company, setCompany] = useState<CurrentCompany | null>(null);
  const [name, setName] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [orgType, setOrgType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadCompany = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get<CurrentCompany>("/companies/me");
      setCompany(data);
      setName(data.name || "");
      setOrgSize(data.org_size || "");
      setOrgType(data.org_type || "");
    } catch {
      setMessage({
        type: "error",
        text: "Impossible de charger l'entreprise.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Le nom est obligatoire." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put<CurrentCompany>("/companies/me", {
        name: name.trim(),
        org_size: orgSize,
        org_type: orgType,
      });
      setCompany(data);
      setName(data.name || "");
      setOrgSize(data.org_size || "");
      setOrgType(data.org_type || "");
      setMessage({ type: "success", text: "Entreprise mise à jour." });
    } catch {
      setMessage({
        type: "error",
        text: "Impossible de sauvegarder l'entreprise.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div
        className={flex({
          justify: "space-between",
          align: "flex-start",
          gap: "6",
          wrap: "wrap",
        })}
      >
        <div className={css({ "& > * + *": { mt: "2" } })}>
          <h1 className={pageTitle()}>Entreprise</h1>
          <p className={pageSubtitle()}>
            Gérez les informations de votre organisation.
          </p>
        </div>
      </div>

      <div className={grid({ columns: { base: 1, lg: 3 }, gap: "6" })}>
        <section
          className={cx(card(), css({ p: "6", lg: { gridColumn: "span 2" } }))}
        >
          {loading ? (
            <div
              className={flex({
                align: "center",
                gap: "3",
                color: "text.muted",
              })}
            >
              <Loader2 className={css({ w: "5", h: "5", animation: "spin" })} />
              Chargement...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={css({ "& > * + *": { mt: "5" } })}
            >
              <div>
                <label
                  htmlFor="company-name"
                  className={css({
                    display: "block",
                    mb: "2",
                    fontSize: "xs",
                    color: "text.muted",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  })}
                >
                  Nom de l'entreprise
                </label>
                <input
                  id="company-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className={grid({ columns: { base: 1, md: 2 }, gap: "4" })}>
                <div>
                  <label
                    htmlFor="company-org-size"
                    className={css({
                      display: "block",
                      mb: "2",
                      fontSize: "xs",
                      color: "text.muted",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    })}
                  >
                    Taille
                  </label>
                  <select
                    id="company-org-size"
                    value={orgSize}
                    onChange={(event) => setOrgSize(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Non renseignée</option>
                    {orgSizeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="company-org-type"
                    className={css({
                      display: "block",
                      mb: "2",
                      fontSize: "xs",
                      color: "text.muted",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    })}
                  >
                    Secteur
                  </label>
                  <select
                    id="company-org-type"
                    value={orgType}
                    onChange={(event) => setOrgType(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Non renseigné</option>
                    {orgTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {message && (
                <p
                  className={css({
                    color:
                      message.type === "success" ? "emerald.400" : "red.400",
                    fontSize: "sm",
                  })}
                >
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className={buttonRecipe({ variant: "primary" })}
              >
                {saving ? (
                  <Loader2
                    className={css({
                      w: "4",
                      h: "4",
                      mr: "2",
                      animation: "spin",
                    })}
                  />
                ) : (
                  <Save className={css({ w: "4", h: "4", mr: "2" })} />
                )}
                Sauvegarder
              </button>
            </form>
          )}
        </section>

        <aside className={cx(card(), css({ p: "6" }))}>
          <div className={flex({ align: "center", gap: "3", mb: "5" })}>
            <Building2
              className={css({ w: "5", h: "5", color: "brand.primary" })}
            />
            <h2 className={css({ color: "white", fontWeight: "bold" })}>
              Synthèse
            </h2>
          </div>
          <dl className={css({ "& > * + *": { mt: "4" } })}>
            <CompanyMetric label="ID" value={company?.id || "-"} />
            <CompanyMetric label="Owner" value={company?.owner_email || "-"} />
            <CompanyMetric
              label="Collaborateurs"
              value={String(company?.member_count ?? "-")}
            />
            <CompanyMetric
              label="Tokens"
              value={String(company?.token_balance ?? "-")}
            />
          </dl>
        </aside>
      </div>
    </div>
  );
};

const CompanyMetric: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <dt className={css({ color: "text.muted", fontSize: "xs", mb: "1" })}>
      {label}
    </dt>
    <dd
      className={css({
        color: "white",
        fontWeight: "medium",
        wordBreak: "break-word",
      })}
    >
      {value}
    </dd>
  </div>
);
