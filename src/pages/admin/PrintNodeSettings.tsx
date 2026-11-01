import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const PrintNodeSettings = () => {
  return (
    <AdminLayout>
      <div className="pb-12">
        <AdminPageHeader
          index="15"
          eyebrow="Impresión"
          title="PrintNode"
          description="Integración en la nube para impresoras térmicas."
        />
        <section className="border-y border-border px-5 py-6">
          <p className="noir-eyebrow">Sin configurar</p>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
            La integración con PrintNode todavía no está configurada para este local.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default PrintNodeSettings;
