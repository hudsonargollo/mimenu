import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, CheckCircle, User } from 'lucide-react';
import { MenuItemDetail } from '@/types/mimenu';
import { useMimenu } from '@/lib/mimenuContext';
import { useLang } from '@/i18n/LanguageProvider';
import { pickLocalText } from '@/lib/venueContext';
import { toast } from 'sonner';

interface ItemReviewDialogProps {
  item: MenuItemDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemReviewDialog: React.FC<ItemReviewDialogProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { getItemReviews, addReview, venue } = useMimenu();
  const { lang } = useLang();
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'write'>('view');

  if (!item) return null;

  const reviews = getItemReviews(item.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!comment.trim()) {
      toast.error('Por favor escribe un breve comentario sobre el plato o trago');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addReview(item.id, customerName.trim(), rating, comment.trim());
      setCustomerName('');
      setComment('');
      setRating(5);
      setIsSubmitting(false);
      setActiveTab('view');
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        {/* Header */}
        <div className="p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Reseñas de Clientes</span>
              <DialogTitle className="text-lg font-bold mt-0.5">{pickLocalText(item.name_i18n, lang) || item.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {venue.name} • Santa Cruz de la Sierra
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-bold px-2 py-1 rounded-md text-sm border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{item.average_rating || 5.0}</span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">({item.reviews_count} opiniones)</span>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 mt-4 bg-background/80 p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'view'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ver Opiniones ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'write'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              + Escribir Reseña
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'view' ? (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Aún no hay opiniones para este plato</p>
                  <p className="text-xs text-muted-foreground mt-1">¡Sé el primero en calificarlo!</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 text-xs"
                    onClick={() => setActiveTab('write')}
                  >
                    Dejar mi opinión
                  </Button>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-background/60 border border-border/70 shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {rev.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold flex items-center gap-1.5">
                            {rev.customer_name}
                            <span className="text-[10px] text-emerald-500 font-normal flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Pedido verificado
                            </span>
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(rev.created_at).toLocaleDateString('es-BO', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed pt-1">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Tu Calificación
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            starVal <= (hoverRating || rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-muted/50'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-amber-500 ml-2">
                    {rating === 5 && '¡Excelente! 🔥'}
                    {rating === 4 && 'Muy Bueno 👍'}
                    {rating === 3 && 'Bueno 👌'}
                    {rating === 2 && 'Regular'}
                    {rating === 1 && 'Malo'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Tu Nombre o Apodo
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Lucas SCZ"
                  className="text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  ¿Qué te pareció? (Sabor, porción, temperatura)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ej. Las papas súper crujientes y el queso cheddar bien caliente..."
                  className="text-xs min-h-[90px]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('view')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="flex-1 text-xs bg-primary text-primary-foreground font-semibold"
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
