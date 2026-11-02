import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, ShieldAlert, ShoppingBag, Sparkles, UtensilsCrossed, X } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { hasEntitlement } from '@/lib/plans';
import { useCart } from '@/lib/cartContext';
import { TableSelectorModal } from '@/components/TableSelectorModal';
import { CartDrawerExpress } from '@/components/CartDrawerExpress';
import { MenuLangSwitch } from '@/components/MenuLangSwitch';
import { VenueLogo } from '@/components/VenueLogo';
import { useLang } from '@/i18n/LanguageProvider';
import { pickLocalText } from '@/lib/venueContext';

interface MimenuHeaderProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

const actionPill =
  'group inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-xs transition-all hover:border-amber-500/60 hover:bg-amber-500/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 active:scale-[0.97] sm:gap-2 sm:px-3';

export const MimenuHeader: React.FC<MimenuHeaderProps> = ({
  onSearchChange,
  searchValue = '',
  showSearch = true,
}) => {
  const { venue, selectedTable, fulfillmentType } = useMimenu();
  const { getTotalItems, getTotalPrice } = useCart();
  const { lang } = useLang();
  const venueName = pickLocalText(venue.name_i18n, lang) || venue.name;
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const totalCartItems = getTotalItems();
  const totalCartPrice = getTotalPrice();
  const fulfillmentLabel =
    fulfillmentType === 'dine_in'
      ? selectedTable
        ? `Mesa ${selectedTable}`
        : 'Elegir mesa'
      : fulfillmentType === 'delivery'
        ? 'Entrega'
        : 'Retiro';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 shadow-xs backdrop-blur-md">
        {/* Top info bar: venue context + language (the logo owns the centre slot). */}
        <div className="border-b border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 sm:px-4">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="truncate font-semibold text-white">{venueName}</span>
              <span className="hidden shrink-0 text-slate-400 sm:inline">• {venue.city}</span>
              {venue.opening_hours && (
                <span className="hidden shrink-0 text-slate-400 md:inline">| {venue.opening_hours}</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <MenuLangSwitch tone="dark" />
              <div className="hidden items-center gap-4 text-slate-300 lg:flex">
                {hasEntitlement(venue.slug, 'whatsapp_concierge') && (
                  <Link to="/admin/ai" className="flex items-center gap-1.5 font-medium transition-colors hover:text-white">
                    <Sparkles className="h-3 w-3 text-amber-400" aria-hidden="true" /> Copiloto IA
                  </Link>
                )}
                <Link to="/admin" className="flex items-center gap-1.5 transition-colors hover:text-white">
                  <ShieldAlert className="h-3 w-3 text-slate-400" aria-hidden="true" /> Panel Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main navbar: actions on the sides, tenant logo dead centre. */}
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            aria-haspopup="dialog"
            aria-label={`${fulfillmentLabel}. Elegir mesa, retiro o entrega`}
            title="Elegir mesa, retiro o entrega"
            className={`${actionPill} justify-self-start`}
          >
            <UtensilsCrossed className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <span className="hidden max-w-[9rem] truncate sm:inline">{fulfillmentLabel}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${isTableModalOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
              aria-hidden="true"
            />
          </button>

          <Link
            to={`/menu?v=${encodeURIComponent(venue.slug)}`}
            aria-label={`${venueName} — ir al inicio del menú`}
            className="min-w-0 justify-self-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          >
            <VenueLogo venue={venue} name={venueName} />
          </Link>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Abrir comanda: ${totalCartItems} ítems por ${venue.currency} ${totalCartPrice}`}
            title="Abrir comanda"
            className={`${actionPill} relative justify-self-end ${
              totalCartItems > 0
                ? 'border-amber-500 bg-amber-500 text-white shadow-sm hover:border-amber-600 hover:bg-amber-600'
                : ''
            }`}
          >
            <ShoppingBag
              className={`h-4 w-4 shrink-0 ${totalCartItems > 0 ? 'text-white' : 'text-amber-500'}`}
              aria-hidden="true"
            />
            <span className="hidden tabular-nums sm:inline">
              {totalCartItems > 0 ? `${venue.currency} ${totalCartPrice}` : 'Comanda'}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                totalCartItems > 0 ? 'text-white/80' : 'text-muted-foreground'
              } ${isCartDrawerOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
              aria-hidden="true"
            />
            {totalCartItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-rose-600 text-[10px] font-bold tabular-nums text-white shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

        {/* Search bar row if enabled */}
        {showSearch && onSearchChange && (
          <div className="mx-auto max-w-7xl px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Buscar platos, entradas, postres en ${venueName}...`}
                aria-label="Buscar en la carta"
                className="w-full rounded-xl border border-border bg-muted/40 py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Table Selector Modal */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      {/* Express Slide-Over Cart Drawer */}
      <CartDrawerExpress
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </>
  );
};
