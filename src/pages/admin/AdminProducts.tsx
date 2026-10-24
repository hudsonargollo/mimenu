import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Plus, Upload, ArrowUpDown, ShoppingBag, FolderOpen, Trash2, Camera, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SortingDialog } from '@/components/SortingDialog';
import { CategoryManagement } from '@/components/CategoryManagement';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AdminLayout from '@/components/AdminLayout';
import { MenuPhotoIngesterModal } from '@/components/MenuPhotoIngesterModal';
import Admin3DModal from '@/components/admin/Admin3DModal';
import { Box } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  available: boolean;
  image_url: string | null;
  sort_order?: number;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [arItem, setArItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Sorting dialog state
  const [isSortingDialogOpen, setIsSortingDialogOpen] = useState(false);
  const [selectedCategoryForSorting, setSelectedCategoryForSorting] = useState<Category | null>(null);
  const [isPhotoIngesterOpen, setIsPhotoIngesterOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    available: true,
    image_url: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Debug: Check auth status
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Current user:', user?.email, 'ID:', user?.id);
      
      if (!user) {
        console.error('❌ No user logged in!');
        toast.error('Você precisa estar logado como admin');
        setLoading(false);
        return;
      }

      const [itemsResult, categoriesResult] = await Promise.all([
        supabase.from('menu_items').select('*').order('category_id').order('sort_order'),
        supabase.from('menu_categories').select('*').order('display_order'),
      ]);

      console.log('📊 Items result:', itemsResult.data?.length, 'items', 'Error:', itemsResult.error);
      console.log('📊 Categories result:', categoriesResult.data?.length, 'categories', 'Error:', categoriesResult.error);

      if (itemsResult.error) {
        console.error('❌ Items error:', itemsResult.error);
        throw itemsResult.error;
      }
      if (categoriesResult.error) {
        console.error('❌ Categories error:', categoriesResult.error);
        throw categoriesResult.error;
      }

      setMenuItems(itemsResult.data || []);
      setCategories(categoriesResult.data || []);
      
      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSortingDialog = (category: Category) => {
    setSelectedCategoryForSorting(category);
    setIsSortingDialogOpen(true);
  };

  const handleSortingSave = async () => {
    // Reload data to reflect the updated sort order
    await loadData();
    toast.success('Ordem atualizada no cardápio!');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      available: item.available,
      image_url: item.image_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ Imagem muito grande. Máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading image:', { name: file.name, size: file.size, type: file.type });
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `menu-items/${fileName}`;

      console.log('📤 Upload path:', filePath);

      // Try to create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'product-images');
      
      if (!bucketExists) {
        console.log('🪣 Creating product-images bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('product-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (bucketError) {
          console.error('❌ Bucket creation error:', bucketError);
          // Continue anyway, bucket might already exist
        }
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrl);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('✅ Imagem enviada com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      
      if (error.message?.includes('not found')) {
        toast.error('❌ Bucket de imagens não encontrado. Contacte o administrador.');
      } else if (error.message?.includes('permission')) {
        toast.error('❌ Sem permissão para enviar imagens.');
      } else {
        toast.error(`❌ Erro ao enviar imagem: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${itemName}"? Esta ação é irreversível.`)) {
      return;
    }

    try {
      setSaving(true);
      console.log('🗑️ Deleting product:', itemId);

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Product deleted successfully');
      toast.success('✅ Produto deletado com sucesso!');
      
      // Reload data to reflect changes
      await loadData();
      
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      toast.error(`❌ Erro ao deletar produto: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validate price
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error('Preço deve ser um número válido');
      return;
    }

    setSaving(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: price,
        category_id: formData.category_id,
        available: formData.available,
        image_url: formData.image_url?.trim() || null,
      };

      console.log('💾 Saving product:', { editingItem: !!editingItem, itemData });

      if (editingItem) {
        // Update existing item
        console.log('📝 Updating product:', editingItem.id);
        const { data, error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select();

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        
        console.log('✅ Product updated:', data);
        toast.success('✅ Produto atualizado com sucesso!');
      } else {
        // Create new item
        console.log('➕ Creating new product');
        const { data, error } = await supabase
          .from('menu_items')
          .insert(itemData)
          .select();

        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        
        console.log('✅ Product created:', data);
        toast.success('✅ Produto criado com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        available: true,
        image_url: '',
      });
      
      // Reload data to show changes
      await loadData();
      
    } catch (error: any) {
      console.error('❌ Error saving product:', error);
      
      // Provide specific error messages
      if (error.message?.includes('permission')) {
        toast.error('❌ Erro de permissão. Verifique se você tem acesso para editar produtos.');
      } else if (error.message?.includes('network')) {
        toast.error('❌ Erro de conexão. Verifique sua internet.');
      } else if (error.code === '23505') {
        toast.error('❌ Já existe um produto com este nome.');
      } else {
        toast.error(`❌ Erro ao salvar produto: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-1">Gerenciar cardápio e categorias</p>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category_id: categories[0]?.id || '',
                  available: true,
                  image_url: '',
                });
                setIsDialogOpen(true);
              }}
              className="bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider rounded-lg shadow-lg"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm p-1 text-muted-foreground shadow-lg border-2 border-gray-200 mb-6">
            <TabsTrigger 
              value="products" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-display uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/50 data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-primary/5 gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-display uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/50 data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-primary/5 gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-display uppercase tracking-wider text-gray-900 mb-2">Produtos do Cardápio</h2>
              <p className="text-gray-600 font-body">
                {menuItems.length} produtos cadastrados • Clique em "Editar" para modificar
              </p>
            </div>

            {/* Category-based sections with sorting buttons */}
            {categories.map((category) => {
          const categoryItems = menuItems.filter(item => item.category_id === category.id);
          
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display uppercase tracking-wider text-gray-800">{category.name}</h3>
                {isAdmin && (
                  <Button
                    onClick={() => handleOpenSortingDialog(category)}
                    variant="outline"
                    size="sm"
                    className="bg-white/80 hover:bg-white text-primary border-2 border-primary rounded-lg transition-all duration-300 shadow-lg"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Organizar Ordem no Menu
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {categoryItems.map((item) => (
                  <Card key={item.id} className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-lg">
                    <div className="p-4 sm:p-6">
                      {/* Image */}
                      <div className="w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-4 relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <Upload className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-xs">Sem foto</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Availability Badge */}
                        <div className="absolute top-2 right-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            item.available 
                              ? 'bg-green-500/20 text-green-700 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-700 border border-red-500/30'
                          }`}>
                            {item.available ? '✓ Disponível' : '✗ Indisponível'}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                            {item.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {getCategoryName(item.category_id)}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            R$ {item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="space-y-2 mt-4">
                        <Button
                          onClick={() => handleEdit(item)}
                          className="w-full bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider shadow-lg hover:shadow-xl rounded-lg transition-all"
                          size="sm"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => setArItem(item)}
                          variant="outline"
                          className="w-full border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-display uppercase tracking-wider shadow-lg hover:shadow-xl rounded-lg transition-all"
                          size="sm"
                        >
                          <Box className="mr-2 h-4 w-4" />
                          3D / AR
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id, item.name)}
                          variant="destructive"
                          className="w-full shadow-lg hover:shadow-xl rounded-lg transition-all"
                          size="sm"
                          disabled={saving}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
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
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro produto do cardápio</p>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category_id: categories[0]?.id || '',
                  available: true,
                  image_url: '',
                });
                setIsDialogOpen(true);
              }}
              className="bg-secondary hover:bg-secondary/90 text-foreground font-display uppercase tracking-wider rounded-lg shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Produto
            </Button>
          </div>
        )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement 
              categories={categories}
              onCategoriesChange={loadData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Foto do Produto</Label>
              {formData.image_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, WebP. Máximo 5MB.
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Açaí 500ml"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={4}
              />
            </div>

            {/* Available */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="available" className="cursor-pointer">
                Produto disponível para venda
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3D / AR Manager Dialog */}
      <Dialog open={!!arItem} onOpenChange={(open) => !open && setArItem(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>3D / AR Manager</DialogTitle>
          </DialogHeader>
          {arItem && (
            <Admin3DModal menuItem={arItem} />
          )}
        </DialogContent>
      </Dialog>

      {/* Sorting Dialog */}
      {selectedCategoryForSorting && (
        <SortingDialog
          open={isSortingDialogOpen}
          onOpenChange={setIsSortingDialogOpen}
          category={selectedCategoryForSorting}
          items={menuItems.filter(item => item.category_id === selectedCategoryForSorting.id)}
          onSave={handleSortingSave}
        />
      )}

      {/* Menu Photo Ingester Modal */}
      <MenuPhotoIngesterModal
        open={isPhotoIngesterOpen}
        onOpenChange={setIsPhotoIngesterOpen}
        onSuccess={() => loadData()}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
