export const STATUS_DETAILS: Record<
  string,
  { label: string; description: string; color: string; progress: number }
> = {
  PENDING: {
    label: "En attente",
    description: "En file d'attente sur l'API Gateway.",
    color: "text-gray-400",
    progress: 5,
  },
  PROVISIONING: {
    label: "Provisionnement",
    description:
      "Le Brain déploie l'image Docker vulnérable sur Kubernetes (Création Pods).",
    color: "text-blue-400",
    progress: 15,
  },
  RECONNAISSANCE: {
    label: "Reconnaissance",
    description:
      "Phase d'analyse de surface (nmap, découverte des ports/services).",
    color: "text-indigo-400",
    progress: 30,
  },
  ATTACKING: {
    label: "Attaque",
    description:
      "Le Worker exécute agressivement les scripts offensifs (SQLi, XSS, etc.).",
    color: "text-orange-400",
    progress: 50,
  },
  ANALYZING: {
    label: "Analyse",
    description:
      "Traitement IA (optionnel) ou consolidation des évidences et des failles trouvées.",
    color: "text-purple-400",
    progress: 70,
  },
  GENERATING_REPORT: {
    label: "Génération Rapport",
    description:
      "Création du rapport final consolidé (PDF, structuration JSON pour le dashboard).",
    color: "text-cyan-400",
    progress: 85,
  },
  CLEANING_UP: {
    label: "Nettoyage",
    description:
      "Destruction du pod cible sur K8s pour ne rien laisser tourner.",
    color: "text-teal-400",
    progress: 95,
  },
  COMPLETED: {
    label: "Terminé",
    description:
      "Processus terminé avec succès, dashboard prêt à afficher 100%.",
    color: "text-green-500",
    progress: 100,
  },
  FAILED: {
    label: "Échec",
    description: "Erreur critique (image introuvable, script python crash).",
    color: "text-red-500",
    progress: 100,
  },
  CANCELED: {
    label: "Annulé",
    description: "L'utilisateur (ou l'admin) a stoppé le scan manuellement.",
    color: "text-gray-500",
    progress: 100,
  },
};
