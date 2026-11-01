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
import { Edit, Plus, ShoppingBag, FolderOpen, Trash2, Camera, Sparkles, Box, Lock, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600 mt-1">Gestioná tu menú y categorías</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsPhotoIngesterOpen(true)}
              variant="outline"
              className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 font-bold gap-1.5 shadow-sm"
              size="lg"
            >
              <Camera className="h-5 w-5" />
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Escanear Menú con Foto / IA
            </Button>
            <Button
              onClick={openCreate}
              className="bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider rounded-lg shadow-lg"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo producto
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm p-1 text-muted-foreground shadow-lg border-2 border-gray-200 mb-6">
            <TabsTrigger
              value="products"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-6 py-2 text-sm font-display uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/50 data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-6 py-2 text-sm font-display uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/50 data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <FolderOpen className="w-4 h-4" />
              Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <p className="text-gray-600 font-body">
              {menuItems.length} productos cargados en {categories.length} categorías
            </p>

            {categories.map((category) => {
              const items = category.items;
              if (items.length === 0) return null;

              return (
                <div key={category.id} className="mb-8">
                  <h3 className="text-xl font-display uppercase tracking-wider text-gray-800 mb-4">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-lg ${
                          item.is_available ? "border-gray-200" : "border-red-200 opacity-70"
                        }`}
                      >
                        <div className="p-4 sm:p-6 space-y-3">
                          <div className="w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-10 h-10" />
                              </div>
                            )}
                            <Badge
                              className={`absolute top-2 right-2 ${
                                item.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.is_available ? "Disponible" : "Agotado"}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            )}
                            <p className="text-lg font-bold text-primary mt-2">
                              Bs {item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAvailability(item)}
                            >
                              {item.is_available ? "Marcar agotado" : "Marcar disponible"}
                            </Button>
                            {canUseAr ? (
                              <Button size="sm" variant="outline" onClick={() => setArItem(item)}>
                                <Box className="w-3.5 h-3.5 mr-1" />
                                3D
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/admin/upgrade?feature=ar_3d`)}
                                title={`Disponible en el plan ${requiredPlanFor("ar_3d")}`}
                              >
                                <Lock className="w-3.5 h-3.5 mr-1" />
                                3D
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {menuItems.length === 0 && (
              <Card className="p-12 text-center text-gray-500">
                No hay productos todavía. Creá el primero con “Nuevo producto”.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={categoryDraft}
                  onChange={(event) => setCategoryDraft(event.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  onKeyDown={(event) => event.key === "Enter" && addCategory()}
                />
                <Button onClick={addCategory}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.items.length} productos</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => renameCategory(category)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteCategory(category)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
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
