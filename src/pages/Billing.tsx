import React from "react";
import { CreditCard, Receipt, TrendingUp, ShieldCheck } from "lucide-react";

export const Billing: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Facturation
        </h1>
        <p className="text-gray-400">
          Gérez votre abonnement, vos factures et vos méthodes de paiement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="md:col-span-2 bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">Plan Actuel</h2>
              <p className="text-gray-500 text-sm">
                Votre abonnement se renouvelle le 12 Mai 2026.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
              Premium Enterprise
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">
                  Usage Mensuel
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">1,248</span>
                  <span className="text-sm text-gray-500">/ 5,000 scans</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center text-amber-400">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">
                  Dernière Facture
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">499.00€</span>
                  <span className="text-sm text-gray-400">Payé</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg">
              Changer de Plan
            </button>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">
              Historique des Paiements
            </button>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">
              Méthode de Paiement
            </h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border-2 border-dashed border-gray-800/60 rounded-xl bg-gray-800/5 mb-6">
            <div className="w-16 h-10 bg-indigo-600/20 rounded-md border border-indigo-500/30 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xs uppercase">
                Visa
              </span>
            </div>
            <p className="text-sm text-white font-medium mb-1">
              •••• •••• •••• 4242
            </p>
            <p className="text-xs text-gray-500">Expire le 04/28</p>
          </div>

          <button className="w-full py-3 bg-gray-100 hover:bg-white text-gray-900 font-bold rounded-xl transition-all">
            Modifier la Carte
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <p className="text-xs text-emerald-500/80 font-medium">
          Vos informations de paiement sont sécurisées par chiffrement de bout
          en bout conforme aux normes PCI-DSS.
        </p>
      </div>
    </div>
  );
};
