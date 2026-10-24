import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Sparkles, MapPin, Search, X, ShieldAlert, Flame } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { TableSelectorModal } from '@/components/TableSelectorModal';
import { CartDrawerExpress } from '@/components/CartDrawerExpress';
import { MenuLangSwitch } from '@/components/MenuLangSwitch';
import { useLang } from '@/i18n/LanguageProvider';
import { pickLocalText } from '@/lib/venueContext';

interface MimenuHeaderProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export const MimenuHeader: React.FC<MimenuHeaderProps> = ({
  onSearchChange,
  searchValue = '',
  showSearch = true,
}) => {
  const navigate = useNavigate();
  const { venue, selectedTable, fulfillmentType } = useMimenu();
  const { getTotalItems, getTotalPrice } = useCart();
  const { lang } = useLang();
  const venueName = pickLocalText(venue.name_i18n, lang) || venue.name;
  const venueTagline = pickLocalText(venue.tagline_i18n, lang) || venue.tagline;
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const totalCartItems = getTotalItems();
  const totalCartPrice = getTotalPrice();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/80 shadow-xs">
        {/* Top Info Bar */}
        <div className="bg-slate-900 text-slate-200 text-[11px] font-medium py-1 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="font-semibold text-white">{venueName}</span>
            <span className="text-slate-400">• {venue.city}</span>
            <span className="text-slate-400 hidden md:inline">| {venue.opening_hours}</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <Link to="/admin/ai" className="hover:text-white flex items-center gap-1.5 transition-colors font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" /> Copiloto IA
            </Link>
            <Link to="/admin" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <ShieldAlert className="w-3 h-3 text-slate-400" aria-hidden="true" /> Panel Admin
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-amber-500" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-amber-500 transition-colors">
                  {venueName}
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                  SCZ
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {venueTagline}
              </p>
            </div>
          </Link>

          {/* Language Switcher */}
          <MenuLangSwitch />

          {/* Table / Fulfillment Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center gap-2 bg-muted/50 hover:bg-muted border border-border px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground transition-all hover:border-slate-400 shadow-xs"
              aria-label="Seleccionar o cambiar mesa"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>
                {fulfillmentType === 'dine_in'
                  ? selectedTable
                    ? `Mesa ${selectedTable}`
                    : 'Elegir Mesa'
                  : 'Retiro en Barra'}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal underline ml-0.5">
                Cambiar
              </span>
            </button>

            {/* Cart Button with Slide-Over Drawer */}
            <Button
              size="sm"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label={`Ver pedido actual: ${totalCartItems} ítems por ${venue.currency} ${totalCartPrice}`}
              className={`relative font-bold text-xs transition-all ${
                totalCartItems > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span className="tabular-nums">
                {totalCartItems > 0
                  ? `${venue.currency} ${totalCartPrice}`
                  : 'Comanda'}
              </span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-xs tabular-nums">
                  {totalCartItems}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search bar row if enabled */}
        {showSearch && onSearchChange && (
          <div className="max-w-6xl mx-auto px-4 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Buscar platos, entradas, postres en ${venueName}...`}
                aria-label="Buscar en la carta"
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-foreground placeholder:text-muted-foreground"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
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
