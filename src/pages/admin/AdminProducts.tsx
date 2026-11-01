import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, ShoppingBag, FolderOpen, Trash2, Camera, Box, Lock, Upload, Power } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { MenuPhotoIngesterModal } from "@/components/MenuPhotoIngesterModal";
import Admin3DModal from "@/components/admin/Admin3DModal";
import { hasEntitlement, requiredPlanFor } from "@/lib/plans";
import { useMimenu } from "@/lib/mimenuContext";
import type { MenuCategoryDetail, MenuItemDetail } from "@/types/mimenu";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  available: true,
  image_url: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminProducts = () => {
  const navigate = useNavigate();
  const { venue, categories, setCategories } = useMimenu();
  const canUseAr = hasEntitlement(venue?.slug, "ar_3d");

  const [formData, setFormData] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState<MenuItemDetail | null>(null);
  const [arItem, setArItem] = useState<MenuItemDetail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhotoIngesterOpen, setIsPhotoIngesterOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");

  const menuItems = useMemo(() => categories.flatMap((category) => category.items), [categories]);

  const persistCategories = (updater: (current: MenuCategoryDetail[]) => MenuCategoryDetail[]) => {
    setCategories((current) => updater(current));
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ ...emptyForm, category_id: categories[0]?.id || "" });
    setIsDialogOpen(true);
  };

  const openEdit = (item: MenuItemDetail) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category_id: item.category_id,
      available: item.is_available,
      image_url: item.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seleccioná una imagen válida");
      return;
    }

    if (file.size > 400 * 1024) {
      toast.error("La imagen es demasiado grande. Máximo 400 KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, image_url: String(reader.result || "") }));
      toast.success("Imagen cargada");
    };
    reader.onerror = () => toast.error("No se pudo leer la imagen");
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      toast.error("Completá todos los campos obligatorios");
      return;
    }

    const price = Number.parseFloat(formData.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price,
      category_id: formData.category_id,
      is_available: formData.available,
      image_url: formData.image_url.trim(),
    };

    persistCategories((current) => {
      if (editingItem) {
        return current.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === editingItem.id ? { ...item, ...data } : item
          ),
        }));
      }

      const newItem: MenuItemDetail = {
        ...data,
        id: `item-${Date.now()}`,
        venue_id: venue?.id || "",
        hotness_score: 1,
        velocity_24h: 0,
        baseline_14d: 0,
        reviews_count: 0,
        average_rating: 0,
      };

      return current.map((category) =>
        category.id === data.category_id
          ? { ...category, items: [...category.items, newItem] }
          : category
      );
    });

    toast.success(editingItem ? "Producto actualizado" : "Producto creado");
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleDelete = (item: MenuItemDetail) => {
    if (!window.confirm(`¿Seguro que querés eliminar "${item.name}"?`)) return;

    persistCategories((current) =>
      current.map((category) => ({
        ...category,
        items: category.items.filter((candidate) => candidate.id !== item.id),
      }))
    );
    toast.success("Producto eliminado");
  };

  const toggleAvailability = (item: MenuItemDetail) => {
    persistCategories((current) =>
      current.map((category) => ({
        ...category,
        items: category.items.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, is_available: !candidate.is_available }
            : candidate
        ),
      }))
    );
  };

  const addCategory = () => {
    const name = categoryDraft.trim();
    if (!name) return;

    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }

    const newCategory: MenuCategoryDetail = {
      id: `cat-${slugify(name)}-${Date.now()}`,
      venue_id: venue?.id || "",
      key: slugify(name),
      name,
      order_index: categories.length,
      items: [],
    };

    persistCategories((current) => [...current, newCategory]);
    setCategoryDraft("");
    toast.success("Categoría agregada");
  };

  const renameCategory = (category: MenuCategoryDetail) => {
    const name = window.prompt("Nuevo nombre de la categoría", category.name);
    if (!name || name.trim() === category.name) return;

    persistCategories((current) =>
      current.map((candidate) =>
        candidate.id === category.id ? { ...candidate, name: name.trim() } : candidate
      )
    );
    toast.success("Categoría actualizada");
  };

  const deleteCategory = (category: MenuCategoryDetail) => {
    if (category.items.length > 0) {
      toast.error("Movés o eliminás los productos antes de borrar la categoría");
      return;
    }
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;

    persistCategories((current) => current.filter((candidate) => candidate.id !== category.id));
    toast.success("Categoría eliminada");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminPageHeader
          index="02"
          eyebrow="Carta"
          title="Productos"
          description="Gestioná el menú, la disponibilidad y los assets 3D de cada plato."
          meta={
            <>
              <span className="noir-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {menuItems.length} productos
              </span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {categories.length} categorías
              </span>
            </>
          }
          actions={
            <>
              <button
                type="button"
                onClick={() => setIsPhotoIngesterOpen(true)}
                className="inline-flex items-center gap-2 rounded-[4px] border border-border bg-card px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground/40"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                Escanear carta
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Nuevo producto
              </button>
            </>
          }
        />

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-7 inline-flex h-auto items-center gap-7 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="products"
              className="-mb-px inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              Productos
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="-mb-px inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-9">
            {categories.map((category) => {
              const items = category.items;
              if (items.length === 0) return null;

              return (
                <section key={category.id}>
                  <div className="flex items-baseline justify-between border-b border-border pb-2">
                    <h3 className="font-display text-[1.15rem] leading-none tracking-[-0.02em] text-foreground">
                      {category.name}
                    </h3>
                    <span className="noir-num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {items.length} {items.length === 1 ? 'plato' : 'platos'}
                    </span>
                  </div>

                  <ul>
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={`group flex items-center gap-4 border-b border-border py-3.5 transition-colors hover:bg-card/70 ${
                          item.is_available ? '' : 'opacity-60'
                        }`}
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[3px] border border-border bg-muted">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[13.5px] font-semibold leading-tight text-foreground">
                              {item.name}
                            </p>
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                item.is_available ? 'bg-emerald-600' : 'bg-primary'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="hidden shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                              {item.is_available ? 'Disponible' : 'Agotado'}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                            {item.description || 'Sin descripción'}
                          </p>
                        </div>

                        <p className="noir-num shrink-0 text-right font-display text-[14px] text-foreground">
                          {venue?.currency} {item.price.toFixed(2)}
                        </p>

                        <div className="flex shrink-0 items-center gap-0.5 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            aria-label={`Editar ${item.name}`}
                            title="Editar"
                            className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
                          >
                            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAvailability(item)}
                            aria-label={item.is_available ? 'Marcar agotado' : 'Marcar disponible'}
                            title={item.is_available ? 'Marcar agotado' : 'Marcar disponible'}
                            className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
                          >
                            <Power className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              canUseAr ? setArItem(item) : navigate('/admin/upgrade?feature=ar_3d')
                            }
                            aria-label={canUseAr ? `Abrir 3D de ${item.name}` : 'Requiere plan superior'}
                            title={canUseAr ? '3D / AR' : `Disponible en el plan ${requiredPlanFor('ar_3d')}`}
                            className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
                          >
                            {canUseAr ? (
                              <Box className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            aria-label={`Eliminar ${item.name}`}
                            title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-transparent text-destructive/80 transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {menuItems.length === 0 && (
              <div className="border-y border-border py-12 text-center">
                <p className="text-[13px] text-muted-foreground">
                  No hay productos todavía. Creá el primero con “Nuevo producto”.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row">
              <Input
                value={categoryDraft}
                onChange={(event) => setCategoryDraft(event.target.value)}
                placeholder="Nombre de la nueva categoría"
                onKeyDown={(event) => event.key === "Enter" && addCategory()}
                className="h-10 rounded-[4px] border-border bg-card"
              />
              <Button onClick={addCategory} className="h-10 shrink-0 rounded-[4px]">
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Agregar
              </Button>
            </div>

            <section>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">{category.name}</p>
                    <p className="noir-num text-[11px] text-muted-foreground">
                      {category.items.length} productos
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => renameCategory(category)}
                      aria-label={`Renombrar ${category.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    >
                      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category)}
                      aria-label={`Eliminar ${category.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-[3px] text-destructive/80 transition-colors hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (Bs) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Imagen (URL o archivo)</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                  placeholder="https://..."
                />
                <label className="inline-flex items-center justify-center rounded-md border px-3 cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Vista previa"
                  className="h-28 w-full object-cover rounded-lg border mt-2"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(event) => setFormData({ ...formData, available: event.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="available" className="cursor-pointer">
                Producto disponible para la venta
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!arItem} onOpenChange={(open) => !open && setArItem(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>3D / AR Manager</DialogTitle>
          </DialogHeader>
          {arItem && <Admin3DModal menuItem={arItem} />}
        </DialogContent>
      </Dialog>

      <MenuPhotoIngesterModal
        open={isPhotoIngesterOpen}
        onOpenChange={setIsPhotoIngesterOpen}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
