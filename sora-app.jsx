import { useState, useEffect, useRef } from "react";

// ============================================================
// SORA - Application de Gestion Commerciale
// ============================================================

const INITIAL_ARTICLES = [
  { id: 1, nom: "Drap", prix: 40, unite: "pièce", categorie: "Literie" },
  { id: 2, nom: "Foulard", prix: 10, unite: "pièce", categorie: "Accessoires" },
  { id: 3, nom: "Rideaux", prix: 30, unite: "pièce", categorie: "Décoration" },
  { id: 4, nom: "Bazin", prix: 50, unite: "mètre", categorie: "Tissu" },
  { id: 5, nom: "Brodé", prix: 30, unite: "pièce", categorie: "Tissu" },
  { id: 6, nom: "Robe Khaska", prix: 25, unite: "pièce", categorie: "Vêtement" },
  { id: 7, nom: "Parfum", prix: 10, unite: "flacon", categorie: "Beauté" },
];

const TAUX_TVA = [0, 5.5, 10, 20];

function generateId(prefix) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${y}${m}-${rand}`;
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR");
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// ---- Logo SVG SORA ----
function SoraLogo({ size = 40 }) {
  return (
    <svg width={size * 2.8} height={size} viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icône étoile/tissu stylisé */}
      <g>
        <circle cx="25" cy="25" r="22" fill="url(#logoGrad)" />
        <path d="M25 8 L28 20 L40 17 L31 26 L37 38 L25 32 L13 38 L19 26 L10 17 L22 20 Z"
          fill="white" opacity="0.95" />
        <circle cx="25" cy="25" r="5" fill="url(#logoGrad2)" />
      </g>
      {/* Texte SORA */}
      <text x="54" y="33" fontFamily="'Playfair Display', Georgia, serif" fontSize="26"
        fontWeight="700" fill="url(#textGrad)" letterSpacing="2">SORA</text>
      <text x="55" y="44" fontFamily="Georgia, serif" fontSize="7.5"
        fill="#8B7355" letterSpacing="3">ENTREPRISE INDIVIDUELLE</text>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A96E" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E6C8" />
          <stop offset="100%" stopColor="#C9A96E" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#C9A96E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---- Calcul document ----
function calcLignes(lignes, remiseGlobale = 0, tva = 20) {
  const sousTotal = lignes.reduce((s, l) => {
    const base = (l.prixUnit || 0) * (l.qte || 0);
    const remLigne = base * ((l.remise || 0) / 100);
    return s + base - remLigne;
  }, 0);
  const remGlob = sousTotal * (remiseGlobale / 100);
  const htNet = sousTotal - remGlob;
  const tvaVal = htNet * (tva / 100);
  const ttc = htNet + tvaVal;
  return { sousTotal, remGlob, htNet, tvaVal, ttc };
}

// ============================================================
// COMPOSANTS UI
// ============================================================

function Badge({ type }) {
  const cfg = {
    devis: { bg: "#EFF6FF", color: "#1D4ED8", label: "Devis" },
    facture: { bg: "#F0FDF4", color: "#15803D", label: "Facture" },
    avoir: { bg: "#FFF7ED", color: "#C2410C", label: "Avoir" },
    "bon-commande": { bg: "#F5F3FF", color: "#7C3AED", label: "Bon de Commande" },
    brouillon: { bg: "#F9FAFB", color: "#6B7280", label: "Brouillon" },
    valide: { bg: "#F0FDF4", color: "#15803D", label: "Validé" },
    envoye: { bg: "#EFF6FF", color: "#1D4ED8", label: "Envoyé" },
    paye: { bg: "#F0FDF4", color: "#065F46", label: "Payé" },
    annule: { bg: "#FEF2F2", color: "#DC2626", label: "Annulé" },
    partiel: { bg: "#FFFBEB", color: "#D97706", label: "Partiel" },
  };
  const c = cfg[type] || cfg.brouillon;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px #0000000d", border: "1px solid #F0EDE8", padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style, icon }) {
  const styles = {
    primary: { background: "linear-gradient(135deg,#C9A96E,#8B6914)", color: "white", border: "none" },
    secondary: { background: "white", color: "#8B6914", border: "1.5px solid #C9A96E" },
    danger: { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" },
    success: { background: "#F0FDF4", color: "#15803D", border: "1.5px solid #BBF7D0" },
    ghost: { background: "transparent", color: "#6B7280", border: "1px solid #E5E7EB" },
  };
  const sizes = { sm: { padding: "4px 12px", fontSize: 12 }, md: { padding: "8px 18px", fontSize: 14 }, lg: { padding: "11px 24px", fontSize: 15 } };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s",
        opacity: disabled ? 0.5 : 1, ...styles[variant], ...sizes[size], ...style
      }}
    >
      {icon && <span style={{ fontSize: size === "sm" ? 13 : 15 }}>{icon}</span>}
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, min, max, step, style, readOnly }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>{label}{required && <span style={{ color: "#C9A96E" }}> *</span>}</label>}
      <input
        type={type} value={value} onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max} step={step} readOnly={readOnly}
        style={{
          border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 13px", fontSize: 14,
          outline: "none", background: readOnly ? "#F9FAFB" : "white", color: "#1F2937",
          transition: "border .15s", width: "100%", boxSizing: "border-box"
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = "#C9A96E"; }}
        onBlur={e => e.target.style.borderColor = "#E5E7EB"}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>{label}{required && <span style={{ color: "#C9A96E" }}> *</span>}</label>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 13px", fontSize: 14,
          outline: "none", background: "white", color: "#1F2937", cursor: "pointer", width: "100%"
        }}
        onFocus={e => e.target.style.borderColor = "#C9A96E"}
        onBlur={e => e.target.style.borderColor = "#E5E7EB"}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
          border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 13px", fontSize: 14,
          outline: "none", resize: "vertical", fontFamily: "inherit", width: "100%", boxSizing: "border-box"
        }}
        onFocus={e => e.target.style.borderColor = "#C9A96E"}
        onBlur={e => e.target.style.borderColor = "#E5E7EB"}
      />
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 700 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px #00000033" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #F0EDE8", position: "sticky", top: 0, background: "white", zIndex: 10, borderRadius: "20px 20px 0 0" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#1F2937", fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9CA3AF", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? "#065F46" : type === "error" ? "#DC2626" : "#1D4ED8";
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: bg, color: "white", padding: "13px 22px", borderRadius: 12, boxShadow: "0 8px 30px #00000044", zIndex: 9999, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}</span>
      {msg}
    </div>
  );
}

// ============================================================
// DOCUMENT EDITOR (Devis / Facture / Avoir / Bon de Commande)
// ============================================================

function DocEditor({ doc, clients, articles, onSave, onClose, type, config }) {
  const isAvoir = type === "avoir";
  const isFranchise = (config?.regimeTVA || "franchise") === "franchise";
  const [form, setForm] = useState(doc || {
    type, numero: generateId(type === "devis" ? "DEV" : type === "facture" ? "FAC" : type === "avoir" ? "AVO" : "BC"),
    date: new Date().toISOString().slice(0, 10),
    dateEcheance: "",
    clientId: "",
    lignes: [],
    tva: isFranchise ? 0 : (config?.tvaDef || 20),
    remiseGlobale: 0,
    notes: isFranchise ? "TVA non applicable — art. 293 B du CGI" : (config?.conditions || ""),
    statut: "brouillon",
    referencee: "",
    conditions: config?.conditions || "Paiement à réception de facture.",
  });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const client = clients.find(c => c.id === form.clientId);

  const addLigne = () => setF("lignes", [...form.lignes, { id: Date.now(), articleId: "", designation: "", qte: 1, prixUnit: 0, remise: 0, unite: "pièce" }]);

  const updLigne = (id, k, v) => setF("lignes", form.lignes.map(l => l.id === id ? { ...l, [k]: v } : l));

  const delLigne = id => setF("lignes", form.lignes.filter(l => l.id !== id));

  const selectArticle = (id, artId) => {
    const art = articles.find(a => a.id === Number(artId));
    if (art) updLigne(id, "articleId", art.id) || setF("lignes", form.lignes.map(l => l.id === id ? { ...l, articleId: art.id, designation: art.nom, prixUnit: isAvoir ? -art.prix : art.prix, unite: art.unite } : l));
    setF("lignes", form.lignes.map(l => l.id === id ? { ...l, articleId: art?.id || "", designation: art?.nom || "", prixUnit: isAvoir ? -(art?.prix || 0) : (art?.prix || 0), unite: art?.unite || "pièce" } : l));
  };

  const totaux = calcLignes(form.lignes, form.remiseGlobale, form.tva);

  const titleMap = { devis: "Devis", facture: "Facture", avoir: "Avoir", "bon-commande": "Bon de Commande" };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Input label="Numéro" value={form.numero} onChange={v => setF("numero", v)} required />
        <Input label="Date" type="date" value={form.date} onChange={v => setF("date", v)} required />
        {(type === "facture" || type === "avoir") && <Input label="Date d'échéance" type="date" value={form.dateEcheance} onChange={v => setF("dateEcheance", v)} />}
        {type === "avoir" && <Input label="Facture de référence" value={form.referencee} onChange={v => setF("referencee", v)} placeholder="FAC-2024-..." />}
      </div>

      {/* Client */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Select label="Client" value={form.clientId} onChange={v => setF("clientId", v)} required
          options={[{ value: "", label: "-- Sélectionner un client --" }, ...clients.map(c => ({ value: c.id, label: c.nom }))]} />
        {client && (
          <div style={{ background: "#FFFBF0", borderRadius: 10, padding: "10px 14px", border: "1px solid #F0EDE8", fontSize: 13, color: "#6B7280" }}>
            <div style={{ fontWeight: 700, color: "#1F2937" }}>{client.nom}</div>
            <div>{client.adresse}</div>
            <div>{client.email} · {client.tel}</div>
          </div>
        )}
      </div>

      {/* Lignes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0, color: "#1F2937" }}>Articles</h4>
          <Btn size="sm" onClick={addLigne} icon="➕">Ajouter une ligne</Btn>
        </div>

        {form.lignes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", background: "#F9FAFB", borderRadius: 12, border: "2px dashed #E5E7EB" }}>
            Aucun article. Cliquez sur "Ajouter une ligne"
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
              <thead>
                <tr style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ textAlign: "left", paddingBottom: 6, fontWeight: 600 }}>Article</th>
                  <th style={{ textAlign: "left", paddingBottom: 6, fontWeight: 600 }}>Désignation</th>
                  <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>Qté</th>
                  <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>P.U. HT</th>
                  <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>Remise%</th>
                  <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>Total HT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.lignes.map(l => {
                  const base = (l.prixUnit || 0) * (l.qte || 0);
                  const rem = base * ((l.remise || 0) / 100);
                  const total = base - rem;
                  return (
                    <tr key={l.id} style={{ background: "#FAFAF8" }}>
                      <td style={{ padding: "6px 4px" }}>
                        <select value={l.articleId} onChange={e => selectArticle(l.id, e.target.value)}
                          style={{ border: "1.5px solid #E5E7EB", borderRadius: 7, padding: "6px 10px", fontSize: 13, width: 130 }}>
                          <option value="">Choisir...</option>
                          {articles.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <input value={l.designation} onChange={e => updLigne(l.id, "designation", e.target.value)}
                          placeholder="Description" style={{ border: "1.5px solid #E5E7EB", borderRadius: 7, padding: "6px 10px", fontSize: 13, width: "100%" }} />
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <input type="number" value={l.qte} min="0.01" step="0.01" onChange={e => updLigne(l.id, "qte", Number(e.target.value))}
                          style={{ border: "1.5px solid #E5E7EB", borderRadius: 7, padding: "6px 10px", fontSize: 13, width: 70, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <input type="number" value={l.prixUnit} step="0.01" onChange={e => updLigne(l.id, "prixUnit", Number(e.target.value))}
                          style={{ border: "1.5px solid #E5E7EB", borderRadius: 7, padding: "6px 10px", fontSize: 13, width: 90, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <input type="number" value={l.remise} min="0" max="100" step="0.5" onChange={e => updLigne(l.id, "remise", Number(e.target.value))}
                          style={{ border: "1.5px solid #E5E7EB", borderRadius: 7, padding: "6px 10px", fontSize: 13, width: 70, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: isAvoir ? "#DC2626" : "#065F46", whiteSpace: "nowrap" }}>
                        {formatMoney(total)}
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <button onClick={() => delLigne(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 16 }}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totaux */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {!isFranchise && (
              <Select label="TVA (%)" value={form.tva} onChange={v => setF("tva", Number(v))}
                options={TAUX_TVA.map(t => ({ value: t, label: `${t}%` }))} />
            )}
            <Input label="Remise globale (%)" type="number" value={form.remiseGlobale} min="0" max="100" step="0.5"
              onChange={v => setF("remiseGlobale", Number(v))} style={{ gridColumn: isFranchise ? "1 / -1" : "auto" }} />
          </div>
          {isFranchise && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#065F46" }}>
              ✓ Franchise en base de TVA — art. 293 B du CGI
            </div>
          )}
          <Textarea label="Notes / Conditions" value={form.notes} onChange={v => setF("notes", v)}
            placeholder="Conditions de paiement, remarques..." rows={3} />
        </div>
        <div style={{ background: "#FFFBF0", borderRadius: 14, padding: 18, border: "1px solid #F0EDE8" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Sous-total", totaux.sousTotal],
              form.remiseGlobale > 0 && [`Remise globale (${form.remiseGlobale}%)`, -totaux.remGlob],
              !isFranchise && ["Total HT Net", totaux.htNet],
              !isFranchise && [`TVA (${form.tva}%)`, totaux.tvaVal],
            ].filter(Boolean).map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280" }}>
                <span>{lbl}</span><span style={{ color: val < 0 ? "#DC2626" : "#1F2937" }}>{formatMoney(val)}</span>
              </div>
            ))}
            <div style={{ borderTop: "2px solid #C9A96E", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: isAvoir ? "#DC2626" : "#1F2937" }}>
              <span>{isFranchise ? "TOTAL NET" : "TOTAL TTC"}</span>
              <span>{formatMoney(isFranchise ? totaux.htNet : totaux.ttc)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statut & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0EDE8", paddingTop: 20 }}>
        <Select label="" value={form.statut} onChange={v => setF("statut", v)} style={{ width: 160 }}
          options={[
            { value: "brouillon", label: "Brouillon" },
            { value: "valide", label: "Validé" },
            { value: "envoye", label: "Envoyé" },
            ...(type === "facture" ? [{ value: "paye", label: "Payé" }, { value: "partiel", label: "Partiel" }] : []),
            { value: "annule", label: "Annulé" },
          ]} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={() => onSave(form)} icon="💾">Enregistrer</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRINT VIEW
// ============================================================

function PrintView({ doc, client, config, onClose }) {
  const totaux = calcLignes(doc.lignes, doc.remiseGlobale, doc.tva);
  const isAvoir = doc.type === "avoir";
  const typeLabels = { devis: "DEVIS", facture: "FACTURE", avoir: "AVOIR", "bon-commande": "BON DE COMMANDE" };
  const cfg = config || {};
  const adresseFull = [cfg.adresse, cfg.codePostal && cfg.ville ? `${cfg.codePostal} ${cfg.ville}` : (cfg.ville || cfg.codePostal)].filter(Boolean).join(", ");
  const isFranchiseTVA = cfg.regimeTVA === "franchise";

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#1F2937", maxWidth: 800, margin: "0 auto" }}>
      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>← Retour</Btn>
        <Btn onClick={() => window.print()} icon="🖨️">Imprimer</Btn>
      </div>

      <div style={{ background: "white", padding: "40px 50px", boxShadow: "0 4px 20px #0000001a", borderRadius: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <SoraLogo size={44} />
            <div style={{ marginTop: 10, fontSize: 12, color: "#1F2937", fontWeight: 700 }}>
              {cfg.exploitant ? `${cfg.exploitant} — EI` : "SORA — Entreprise Individuelle"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#6B7280", lineHeight: 1.8 }}>
              {cfg.adresse && <div>{cfg.adresse}</div>}
              {(cfg.codePostal || cfg.ville) && <div>{[cfg.codePostal, cfg.ville].filter(Boolean).join(" ")}</div>}
              {cfg.email && <div>{cfg.email}</div>}
              {cfg.tel && <div>{cfg.tel}</div>}
              {cfg.siret && <div style={{ marginTop: 4 }}>SIRET : {cfg.siret}</div>}
              {cfg.regimeTVA === "franchise" ? (
                <div style={{ marginTop: 2, fontStyle: "italic", color: "#9CA3AF" }}>TVA non applicable — art. 293 B du CGI</div>
              ) : cfg.tvaIntra ? (
                <div>N° TVA : {cfg.tvaIntra}</div>
              ) : null}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: isAvoir ? "#DC2626" : "#8B6914", fontFamily: "'Playfair Display', Georgia, serif" }}>
              {typeLabels[doc.type]}
            </div>
            <div style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>N° {doc.numero}</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Date : {formatDate(doc.date)}</div>
            {doc.dateEcheance && <div style={{ fontSize: 13, color: "#9CA3AF" }}>Échéance : {formatDate(doc.dateEcheance)}</div>}
            {doc.referencee && <div style={{ fontSize: 13, color: "#9CA3AF" }}>Réf. facture : {doc.referencee}</div>}
          </div>
        </div>

        {/* Client */}
        {client && (
          <div style={{ background: "#FFFBF0", borderRadius: 12, padding: "16px 20px", marginBottom: 30, border: "1px solid #F0EDE8" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Client</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{client.nom}</div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>{client.adresse}</div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>{client.email} · {client.tel}</div>
          </div>
        )}

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 13 }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#8B6914,#C9A96E)", color: "white" }}>
              {["Désignation", "Qté", "P.U. HT", "Remise", "Total HT"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: h === "Désignation" ? "left" : "right", fontWeight: 700, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.lignes.map((l, i) => {
              const base = l.prixUnit * l.qte;
              const rem = base * (l.remise / 100);
              const tot = base - rem;
              return (
                <tr key={l.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAF8" }}>
                  <td style={{ padding: "10px 14px" }}>{l.designation}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>{l.qte} {l.unite}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>{formatMoney(l.prixUnit)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>{l.remise > 0 ? `${l.remise}%` : "—"}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: isAvoir ? "#DC2626" : "#065F46" }}>{formatMoney(tot)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totaux */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 30 }}>
          <div style={{ width: 300 }}>
            {[
              ["Sous-total HT", totaux.sousTotal],
              doc.remiseGlobale > 0 && [`Remise (${doc.remiseGlobale}%)`, -totaux.remGlob],
              !isFranchiseTVA && ["Total HT Net", totaux.htNet],
              !isFranchiseTVA && [`TVA ${doc.tva}%`, totaux.tvaVal],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F0EDE8", fontSize: 13, color: "#6B7280" }}>
                <span>{l}</span><span>{formatMoney(v)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: isAvoir ? "#FEF2F2" : "linear-gradient(135deg,#8B6914,#C9A96E)", color: "white", borderRadius: 10, marginTop: 8, fontWeight: 800, fontSize: 18 }}>
              <span>{isFranchiseTVA ? "TOTAL NET" : "TOTAL TTC"}</span><span>{formatMoney(isFranchiseTVA ? totaux.htNet : totaux.ttc)}</span>
            </div>
            {isFranchiseTVA && (
              <div style={{ textAlign: "right", fontSize: 11, color: "#9CA3AF", marginTop: 6, fontStyle: "italic" }}>
                TVA non applicable — art. 293 B du CGI
              </div>
            )}
          </div>
        </div>

        {doc.notes && (
          <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 16, fontSize: 12, color: "#6B7280" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Conditions & Notes :</div>
            <div>{doc.notes}</div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 30, fontSize: 11, color: "#C9A96E" }}>
          SORA — Entreprise Individuelle · {cfg.exploitant || ""} · Merci de votre confiance
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

function Dashboard({ docs, clients, articles, setPage }) {
  const factures = docs.filter(d => d.type === "facture");
  const devis = docs.filter(d => d.type === "devis");
  const avoirs = docs.filter(d => d.type === "avoir");
  const totalCA = factures.filter(d => d.statut === "paye").reduce((s, d) => s + calcLignes(d.lignes, d.remiseGlobale, d.tva).ttc, 0);
  const totalEnAttente = factures.filter(d => ["valide", "envoye"].includes(d.statut)).reduce((s, d) => s + calcLignes(d.lignes, d.remiseGlobale, d.tva).ttc, 0);
  const totalAvoirs = avoirs.reduce((s, d) => s + calcLignes(d.lignes, d.remiseGlobale, d.tva).ttc, 0);

  const stats = [
    { label: "Chiffre d'affaires", value: formatMoney(totalCA), icon: "💰", color: "#065F46", bg: "#F0FDF4", sub: `${factures.filter(d => d.statut === "paye").length} facture(s) payée(s)` },
    { label: "En attente", value: formatMoney(totalEnAttente), icon: "⏳", color: "#D97706", bg: "#FFFBEB", sub: `${factures.filter(d => ["valide", "envoye"].includes(d.statut)).length} facture(s)` },
    { label: "Devis", value: devis.length, icon: "📋", color: "#1D4ED8", bg: "#EFF6FF", sub: `${devis.filter(d => d.statut === "valide").length} validé(s)` },
    { label: "Clients", value: clients.length, icon: "👥", color: "#7C3AED", bg: "#F5F3FF", sub: "Clients actifs" },
  ];

  const recent = [...docs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", color: "#1F2937" }}>Tableau de bord</h1>
        <p style={{ margin: "4px 0 0", color: "#9CA3AF", fontSize: 14 }}>Bienvenue sur votre espace SORA</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{s.sub}</div>
              </div>
              <div style={{ background: s.bg, borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>Documents récents</h3>
          {recent.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: 24 }}>Aucun document encore</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map(d => {
                const cl = clients.find(c => c.id === d.clientId);
                const tot = calcLignes(d.lignes, d.remiseGlobale, d.tva).ttc;
                return (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#FAFAF8", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Badge type={d.type} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{d.numero}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>{cl?.nom || "—"} · {formatDate(d.date)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: d.type === "avoir" ? "#DC2626" : "#1F2937" }}>{formatMoney(tot)}</div>
                      <Badge type={d.statut} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>Accès rapide</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Nouveau devis", icon: "📋", page: "devis" },
              { label: "Nouvelle facture", icon: "🧾", page: "factures" },
              { label: "Nouvel avoir", icon: "↩️", page: "avoirs" },
              { label: "Bon de commande", icon: "📦", page: "bons-commande" },
              { label: "Nouveau client", icon: "👤", page: "clients" },
              { label: "Gérer les articles", icon: "🏷️", page: "articles" },
            ].map(a => (
              <button key={a.label} onClick={() => setPage(a.page)}
                style={{ background: "#FFFBF0", border: "1px solid #F0EDE8", borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontWeight: 600, color: "#8B6914", fontSize: 14, textAlign: "left", transition: "all .15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#FDF3DC"}
                onMouseOut={e => e.currentTarget.style.background = "#FFFBF0"}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DocumentsPage({ type, docs, clients, articles, onAdd, onEdit, onDelete, onPrint }) {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const typeLabels = { devis: "Devis", factures: "Factures", avoirs: "Avoirs", "bons-commande": "Bons de Commande" };
  const docType = { devis: "devis", factures: "facture", avoirs: "avoir", "bons-commande": "bon-commande" }[type];

  const filtered = docs.filter(d => {
    const cl = clients.find(c => c.id === d.clientId);
    const matchSearch = d.numero.toLowerCase().includes(search.toLowerCase()) || (cl?.nom || "").toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>{typeLabels[type]}</h1>
        <Btn onClick={() => onAdd(docType)} icon="➕">Nouveau {typeLabels[type].replace("Bons de Commande", "BC").toLowerCase()}</Btn>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
              style={{ border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
          </div>
          <Select value={filterStatut} onChange={setFilterStatut} options={[
            { value: "tous", label: "Tous statuts" },
            { value: "brouillon", label: "Brouillon" },
            { value: "valide", label: "Validé" },
            { value: "envoye", label: "Envoyé" },
            { value: "paye", label: "Payé" },
            { value: "annule", label: "Annulé" },
          ]} />
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Aucun document trouvé</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Créez votre premier document</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F0EDE8" }}>
                {["Numéro", "Date", "Client", "Montant TTC", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: h === "Montant TTC" ? "right" : "left", padding: "10px 14px", fontSize: 12, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const cl = clients.find(c => c.id === d.clientId);
                const tot = calcLignes(d.lignes, d.remiseGlobale, d.tva).ttc;
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid #F9F7F4" }}
                    onMouseOver={e => e.currentTarget.style.background = "#FAFAF8"}
                    onMouseOut={e => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#8B6914", fontSize: 14 }}>{d.numero}</td>
                    <td style={{ padding: "12px 14px", color: "#6B7280", fontSize: 14 }}>{formatDate(d.date)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 14 }}>{cl?.nom || <span style={{ color: "#9CA3AF" }}>—</span>}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: d.type === "avoir" ? "#DC2626" : "#1F2937" }}>{formatMoney(tot)}</td>
                    <td style={{ padding: "12px 14px" }}><Badge type={d.statut} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn size="sm" variant="ghost" onClick={() => onPrint(d)} icon="🖨️">Voir</Btn>
                        <Btn size="sm" variant="secondary" onClick={() => onEdit(d)} icon="✏️">Modifier</Btn>
                        <Btn size="sm" variant="danger" onClick={() => onDelete(d.id)} icon="🗑️">Supp.</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function ClientsPage({ clients, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>Clients</h1>
        <Btn onClick={onAdd} icon="➕">Nouveau client</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un client..."
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
      </Card>
      <Card>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Aucun client</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ background: "#FAFAF8", borderRadius: 14, padding: 18, border: "1px solid #F0EDE8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#C9A96E,#8B6914)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>
                    {c.nom[0]}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={() => onEdit(c)}>✏️</Btn>
                    <Btn size="sm" variant="danger" onClick={() => onDelete(c.id)}>🗑️</Btn>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>{c.nom}</div>
                {c.entreprise && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{c.entreprise}</div>}
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>{c.email}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{c.tel}</div>
                {c.adresse && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{c.adresse}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ClientForm({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || { nom: "", entreprise: "", email: "", tel: "", adresse: "", siret: "", notes: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Input label="Nom / Prénom" value={form.nom} onChange={v => setF("nom", v)} required />
        <Input label="Entreprise" value={form.entreprise} onChange={v => setF("entreprise", v)} />
        <Input label="Email" type="email" value={form.email} onChange={v => setF("email", v)} />
        <Input label="Téléphone" type="tel" value={form.tel} onChange={v => setF("tel", v)} />
        <Input label="SIRET" value={form.siret} onChange={v => setF("siret", v)} />
      </div>
      <Textarea label="Adresse" value={form.adresse} onChange={v => setF("adresse", v)} rows={2} />
      <Textarea label="Notes" value={form.notes} onChange={v => setF("notes", v)} rows={2} placeholder="Informations supplémentaires..." />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={() => { if (!form.nom) return; onSave(form); }} icon="💾">Enregistrer</Btn>
      </div>
    </div>
  );
}

function ArticlesPage({ articles, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const cats = [...new Set(articles.map(a => a.categorie))];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>Articles & Tarifs</h1>
        <Btn onClick={onAdd} icon="➕">Nouvel article</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un article..."
          style={{ border: "1.5px solid #E5E7EB", borderRadius: 9, padding: "9px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
      </Card>
      {cats.map(cat => {
        const catArts = articles.filter(a => a.categorie === cat && a.nom.toLowerCase().includes(search.toLowerCase()));
        if (catArts.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8B6914", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>{cat}</h3>
            <Card>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #F0EDE8" }}>
                    {["Article", "Catégorie", "Prix unitaire", "Unité", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: h === "Prix unitaire" ? "right" : "left", padding: "8px 14px", fontSize: 12, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catArts.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #F9F7F4" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1F2937" }}>{a.nom}</td>
                      <td style={{ padding: "12px 14px" }}><span style={{ background: "#FFFBF0", color: "#8B6914", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{a.categorie}</span></td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#065F46" }}>{formatMoney(a.prix)}</td>
                      <td style={{ padding: "12px 14px", color: "#6B7280", fontSize: 13 }}>{a.unite}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn size="sm" variant="secondary" onClick={() => onEdit(a)}>✏️ Modifier</Btn>
                          <Btn size="sm" variant="danger" onClick={() => onDelete(a.id)}>🗑️</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function ArticleForm({ article, onSave, onClose }) {
  const [form, setForm] = useState(article || { nom: "", prix: "", categorie: "", unite: "pièce", description: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["Literie", "Accessoires", "Décoration", "Tissu", "Vêtement", "Beauté", "Autre"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Input label="Nom de l'article" value={form.nom} onChange={v => setF("nom", v)} required />
        <Input label="Prix unitaire (€)" type="number" value={form.prix} step="0.01" min="0" onChange={v => setF("prix", v)} required />
        <Select label="Catégorie" value={form.categorie} onChange={v => setF("categorie", v)}
          options={cats.map(c => ({ value: c, label: c }))} />
        <Input label="Unité" value={form.unite} onChange={v => setF("unite", v)} placeholder="pièce, mètre, kg..." />
      </div>
      <Textarea label="Description" value={form.description} onChange={v => setF("description", v)} rows={2} placeholder="Description optionnelle..." />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={() => { if (!form.nom || !form.prix) return; onSave(form); }} icon="💾">Enregistrer</Btn>
      </div>
    </div>
  );
}

function ParametresPage({ config, onSave }) {
  const [form, setForm] = useState(config);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>Paramètres</h1>

      {/* Bandeau EI info */}
      <div style={{ background: "linear-gradient(135deg,#FFFBF0,#FDF3DC)", border: "1.5px solid #C9A96E", borderRadius: 14, padding: "14px 20px", marginBottom: 22, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 28 }}>🏪</span>
        <div>
          <div style={{ fontWeight: 700, color: "#8B6914", fontSize: 15 }}>Entreprise Individuelle (EI)</div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>Vos informations apparaîtront sur tous vos documents. Le nom de l'exploitant est obligatoire sur les factures.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>👤 Identité de l'exploitant</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Nom commercial" value={form.nom} onChange={v => setF("nom", v)} />
              <Input label="Nom & Prénom de l'exploitant" value={form.exploitant} onChange={v => setF("exploitant", v)}
                placeholder="Ex : Jean Dupont" required />
              <Input label="SIRET" value={form.siret} onChange={v => setF("siret", v)} placeholder="14 chiffres" />
            </div>
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>📍 Coordonnées</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Adresse" value={form.adresse} onChange={v => setF("adresse", v)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                <Input label="Code postal" value={form.codePostal} onChange={v => setF("codePostal", v)} />
                <Input label="Ville" value={form.ville} onChange={v => setF("ville", v)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Email" type="email" value={form.email} onChange={v => setF("email", v)} />
                <Input label="Téléphone" type="tel" value={form.tel} onChange={v => setF("tel", v)} />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>🧾 Régime TVA</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Select label="Régime de TVA" value={form.regimeTVA} onChange={v => setF("regimeTVA", v)}
                options={[
                  { value: "franchise", label: "Franchise en base (TVA non applicable)" },
                  { value: "reel", label: "Régime réel (TVA applicable)" },
                ]} />
              {form.regimeTVA === "franchise" ? (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#065F46" }}>
                  ✓ La mention <strong>"TVA non applicable — art. 293 B du CGI"</strong> sera automatiquement ajoutée sur vos documents.
                </div>
              ) : (
                <>
                  <Input label="N° TVA Intracommunautaire" value={form.tvaIntra} onChange={v => setF("tvaIntra", v)} placeholder="FRXX000000000" />
                  <Select label="Taux TVA par défaut" value={form.tvaDef} onChange={v => setF("tvaDef", Number(v))}
                    options={TAUX_TVA.map(t => ({ value: t, label: `${t}%` }))} />
                </>
              )}
            </div>
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1F2937" }}>📋 Conditions générales</h3>
            <Textarea value={form.conditions} onChange={v => setF("conditions", v)} rows={5}
              placeholder="Conditions de paiement, pénalités de retard, mentions légales..." />
            <div style={{ marginTop: 14 }}>
              <Btn onClick={() => onSave(form)} icon="💾">Sauvegarder les paramètres</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function SoraApp() {
  const [page, setPage] = useState("dashboard");
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [config, setConfig] = useState({ nom: "SORA", exploitant: "", adresse: "", ville: "", codePostal: "", email: "", tel: "", siret: "", tvaIntra: "", regimeTVA: "franchise", tvaDef: 0, conditions: "Paiement à réception de facture.", mentionEI: true });
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // {type, data}
  const [printDoc, setPrintDoc] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ---- Docs CRUD ----
  const saveDoc = (doc) => {
    if (doc.id) {
      setDocs(ds => ds.map(d => d.id === doc.id ? doc : d));
      showToast("Document mis à jour ✓");
    } else {
      setDocs(ds => [...ds, { ...doc, id: Date.now() }]);
      showToast("Document créé ✓");
    }
    setModal(null);
  };
  const deleteDoc = (id) => { setDocs(ds => ds.filter(d => d.id !== id)); showToast("Document supprimé", "error"); };

  // ---- Clients CRUD ----
  const saveClient = (cl) => {
    if (cl.id) { setClients(cs => cs.map(c => c.id === cl.id ? cl : c)); showToast("Client mis à jour ✓"); }
    else { setClients(cs => [...cs, { ...cl, id: Date.now() }]); showToast("Client créé ✓"); }
    setModal(null);
  };
  const deleteClient = (id) => { setClients(cs => cs.filter(c => c.id !== id)); showToast("Client supprimé", "error"); };

  // ---- Articles CRUD ----
  const saveArticle = (a) => {
    if (a.id) { setArticles(as => as.map(x => x.id === a.id ? { ...a, prix: Number(a.prix) } : x)); showToast("Article mis à jour ✓"); }
    else { setArticles(as => [...as, { ...a, id: Date.now(), prix: Number(a.prix) }]); showToast("Article créé ✓"); }
    setModal(null);
  };
  const deleteArticle = (id) => { setArticles(as => as.filter(a => a.id !== id)); showToast("Article supprimé", "error"); };

  const docsOfType = (t) => docs.filter(d => d.type === t);
  const pageDocType = { devis: "devis", factures: "facture", avoirs: "avoir", "bons-commande": "bon-commande" };

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "devis", label: "Devis", icon: "📋" },
    { id: "factures", label: "Factures", icon: "🧾" },
    { id: "avoirs", label: "Avoirs", icon: "↩️" },
    { id: "bons-commande", label: "Bons de commande", icon: "📦" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "articles", label: "Articles", icon: "🏷️" },
    { id: "parametres", label: "Paramètres", icon: "⚙️" },
  ];

  if (printDoc) {
    return (
      <div style={{ background: "#F5F2ED", minHeight: "100vh", padding: "28px 20px", fontFamily: "Georgia, serif" }}>
        <PrintView doc={printDoc} client={clients.find(c => c.id === printDoc.clientId)} config={config} onClose={() => setPrintDoc(null)} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F5F0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: "white", borderRight: "1px solid #F0EDE8", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #F0EDE8" }}>
          <SoraLogo size={34} />
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{
                width: "100%", textAlign: "left", border: "none", borderRadius: 10, padding: "10px 14px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14,
                background: page === n.id ? "linear-gradient(135deg,#FFFBF0,#FDF3DC)" : "transparent",
                color: page === n.id ? "#8B6914" : "#6B7280",
                borderLeft: page === n.id ? "3px solid #C9A96E" : "3px solid transparent",
                transition: "all .15s", marginBottom: 2
              }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid #F0EDE8", fontSize: 12, color: "#C9A96E", textAlign: "center" }}>
          SORA © {new Date().getFullYear()}
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1, padding: "28px 32px", maxWidth: "calc(100vw - 240px)" }}>
        {page === "dashboard" && <Dashboard docs={docs} clients={clients} articles={articles} setPage={setPage} />}

        {["devis", "factures", "avoirs", "bons-commande"].includes(page) && (
          <DocumentsPage
            type={page}
            docs={docsOfType(pageDocType[page])}
            clients={clients} articles={articles}
            onAdd={(t) => setModal({ type: "doc", data: null, docType: t })}
            onEdit={(d) => setModal({ type: "doc", data: d, docType: d.type })}
            onDelete={deleteDoc}
            onPrint={setPrintDoc}
          />
        )}

        {page === "clients" && (
          <ClientsPage clients={clients}
            onAdd={() => setModal({ type: "client", data: null })}
            onEdit={c => setModal({ type: "client", data: c })}
            onDelete={deleteClient} />
        )}

        {page === "articles" && (
          <ArticlesPage articles={articles}
            onAdd={() => setModal({ type: "article", data: null })}
            onEdit={a => setModal({ type: "article", data: a })}
            onDelete={deleteArticle} />
        )}

        {page === "parametres" && <ParametresPage config={config} onSave={c => { setConfig(c); showToast("Paramètres sauvegardés ✓"); }} />}
      </div>

      {/* Modals */}
      {modal?.type === "doc" && (
        <Modal open onClose={() => setModal(null)}
          title={`${modal.data ? "Modifier" : "Créer"} — ${({ devis: "Devis", facture: "Facture", avoir: "Avoir", "bon-commande": "Bon de Commande" })[modal.docType]}`}
          width={900}>
          <DocEditor doc={modal.data} clients={clients} articles={articles} type={modal.docType} config={config} onSave={saveDoc} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "client" && (
        <Modal open onClose={() => setModal(null)} title={modal.data ? "Modifier le client" : "Nouveau client"} width={580}>
          <ClientForm client={modal.data} onSave={saveClient} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "article" && (
        <Modal open onClose={() => setModal(null)} title={modal.data ? "Modifier l'article" : "Nouvel article"} width={520}>
          <ArticleForm article={modal.data} onSave={saveArticle} onClose={() => setModal(null)} />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
