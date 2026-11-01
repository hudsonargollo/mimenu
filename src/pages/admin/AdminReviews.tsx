import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Star, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const AdminReviews: React.FC = () => {
  const { venue, categories, reviews, approveReview, rejectReview } = useMimenu();

  const allItems = categories.flatMap(c => c.items);
  const getItemName = (itemId: string) => {
    return allItems.find(i => i.id === itemId)?.name || 'Plato / Bebida';
  };

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <AdminPageHeader
          index="07"
          eyebrow="Reseñas"
          title="Moderación de reseñas"
          description="Controla las opiniones de 1 a 5 estrellas antes o después de publicarlas en el menú."
          meta={
            <>
              <span className="noir-eyebrow text-amber-700">{pendingReviews.length} pendientes</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow text-emerald-700">{approvedReviews.length} aprobadas</span>
            </>
          }
        />

        {/* Reviews List */}
        <div>
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <p className="noir-eyebrow">Todas las opiniones registradas</p>
            <ShieldCheck className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 border-l border-border md:grid-cols-2">
            {reviews.length === 0 && (
              <div className="border-b border-r border-border p-8 md:col-span-2">
                <p className="font-display text-lg text-foreground">Sin reseñas todavía</p>
                <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
                  Cuando tus clientes califiquen platos desde el menú, las opiniones aparecerán acá para
                  aprobarlas o rechazarlas.
                </p>
              </div>
            )}
            {reviews.map((rev) => {
              const itemName = getItemName(rev.item_id);

              return (
                <article
                  key={rev.id}
                  className={`flex flex-col border-b border-r border-border p-5 transition-colors ${
                    rev.status === 'pending'
                      ? 'bg-amber-500/[0.06]'
                      : rev.status === 'rejected'
                      ? 'opacity-55'
                      : 'hover:bg-card/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="noir-eyebrow truncate">{itemName}</p>
                      <p className="mt-1 truncate font-display text-base text-foreground">{rev.customer_name}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/25'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 flex-1 border-l border-border pl-3 text-[12.5px] italic leading-relaxed text-foreground/85">
                    “{rev.comment}”
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-[10px]">
                    <span className="noir-num uppercase tracking-[0.1em] text-muted-foreground">
                      {new Date(rev.created_at).toLocaleString('es-BO')}
                    </span>

                    <div className="flex items-center gap-2">
                      {rev.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveReview(rev.id)}
                            className="inline-flex items-center gap-1 border-0 border-b border-emerald-600 bg-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 transition-colors hover:text-emerald-800"
                          >
                            <CheckCircle className="h-3 w-3" aria-hidden="true" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => rejectReview(rev.id)}
                            className="inline-flex items-center gap-1 border-0 border-b border-transparent bg-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" aria-hidden="true" />
                            Rechazar
                          </button>
                        </>
                      )}

                      {rev.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" /> Aprobada
                        </span>
                      )}

                      {rev.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">
                          <XCircle className="h-3 w-3" aria-hidden="true" /> Rechazada
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
