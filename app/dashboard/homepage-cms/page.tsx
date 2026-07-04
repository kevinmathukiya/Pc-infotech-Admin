'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Input, Select } from '../../../components/ui';
import { FileUploadDropzone } from '../../../components/ui/FileUploadDropzone';
import { Home, Plus, Trash2, Save, Images, LayoutGrid, Check, Info, Sparkles, Star } from 'lucide-react';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  image: { url: string; publicId: string };
  link?: string;
  order: number;
}

interface WhyChooseUs {
  title: string;
  description: string;
  icon?: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
}

export default function HomepageCmsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'slider' | 'sections'>('slider');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Slider CMS states
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideLink, setSlideLink] = useState('');
  const [slideOrder, setSlideOrder] = useState('1');
  const [slideImage, setSlideImage] = useState<File | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  // Sections CMS states
  const [brandSectionTitle, setBrandSectionTitle] = useState('');
  const [servicesSectionTitle, setServicesSectionTitle] = useState('');
  const [testimonialsSectionTitle, setTestimonialsSectionTitle] = useState('');
  
  // Why Choose Us list
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [newWhyTitle, setNewWhyTitle] = useState('');
  const [newWhyDesc, setNewWhyDesc] = useState('');
  const [newWhyIcon, setNewWhyIcon] = useState('laptop');

  // Featured Products list
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const [cmsRes, productsRes] = await Promise.all([
        api.get('/cms'),
        api.get('/products?limit=100'),
      ]);

      const cmsData = cmsRes.data?.data?.cms || {};
      setSlides(cmsData.heroSlider || []);
      setBrandSectionTitle(cmsData.brandSectionTitle || '');
      setServicesSectionTitle(cmsData.servicesSectionTitle || '');
      setTestimonialsSectionTitle(cmsData.testimonialsSectionTitle || '');
      setWhyChooseUs(cmsData.whyChooseUs || []);
      
      const fpIds = cmsData.featuredProducts?.map((p: any) => typeof p === 'object' ? p._id : p) || [];
      setFeaturedProducts(fpIds);

      setProductsList(productsRes.data?.data?.products || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load homepage CMS settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  // Slide CRUD Actions
  const handleAddSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImage) {
      toast.error('Please upload an image for the hero slide.');
      return;
    }

    setIsAddingSlide(true);
    try {
      const formData = new FormData();
      formData.append('title', slideTitle);
      formData.append('subtitle', slideSubtitle);
      formData.append('link', slideLink);
      formData.append('order', slideOrder);
      formData.append('image', slideImage);

      const res = await api.post('/cms/hero-slider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Slide added successfully!');
      
      // Update state
      setSlides(res.data?.data?.cms?.heroSlider || []);
      
      // Clear inputs
      setSlideTitle('');
      setSlideSubtitle('');
      setSlideLink('');
      setSlideOrder('1');
      setSlideImage(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add slide.');
    } finally {
      setIsAddingSlide(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Are you sure you want to remove this hero slide?')) return;
    try {
      const res = await api.delete(`/cms/hero-slider/${slideId}`);
      toast.success('Hero slide deleted');
      setSlides(res.data?.data?.cms?.heroSlider || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete hero slide.');
    }
  };

  // Section Config Save
  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        brandSectionTitle,
        servicesSectionTitle,
        testimonialsSectionTitle,
        whyChooseUs,
        featuredProducts,
      };

      const res = await api.put('/cms', payload);
      toast.success('Homepage CMS text configured successfully!');
      
      const cmsData = res.data?.data?.cms || {};
      setBrandSectionTitle(cmsData.brandSectionTitle || '');
      setServicesSectionTitle(cmsData.servicesSectionTitle || '');
      setTestimonialsSectionTitle(cmsData.testimonialsSectionTitle || '');
      setWhyChooseUs(cmsData.whyChooseUs || []);
      setFeaturedProducts(cmsData.featuredProducts || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save configuration settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Why Choose Us list utilities
  const addWhyChooseUsItem = () => {
    if (!newWhyTitle.trim() || !newWhyDesc.trim()) {
      toast.error('Please enter card title and details.');
      return;
    }
    const updated = [...whyChooseUs, { title: newWhyTitle, description: newWhyDesc, icon: newWhyIcon }];
    setWhyChooseUs(updated);
    setNewWhyTitle('');
    setNewWhyDesc('');
    setNewWhyIcon('laptop');
  };

  const removeWhyChooseUsItem = (index: number) => {
    const updated = whyChooseUs.filter((_, i) => i !== index);
    setWhyChooseUs(updated);
  };

  // Featured Product checkboxes toggle
  const toggleFeaturedProduct = (id: string) => {
    if (featuredProducts.includes(id)) {
      setFeaturedProducts(featuredProducts.filter((fpId) => fpId !== id));
    } else {
      setFeaturedProducts([...featuredProducts, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="text-[#ff5e5b]" size={24} />
          Homepage CMS Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize slider animations, key selling points, section headings, and display catalog elements.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-primary-border gap-2 pb-[1px]">
        <button
          onClick={() => setActiveSubTab('slider')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'slider'
              ? 'border-[#ff5e5b] text-[#ff5e5b] bg-[#ff5e5b]/5'
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-foreground hover:bg-primary-card/50'
          }`}
        >
          <Images size={14} />
          Hero Slider Tab
        </button>
        <button
          onClick={() => setActiveSubTab('sections')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'sections'
              ? 'border-[#ff5e5b] text-[#ff5e5b] bg-[#ff5e5b]/5'
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-foreground hover:bg-primary-card/50'
          }`}
        >
          <LayoutGrid size={14} />
          Text & Sections Config
        </button>
      </div>

      {/* Slider View */}
      {activeSubTab === 'slider' && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left panel: Add Slide Form */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3 mb-2">
              <Plus size={16} className="text-[#ff5e5b]" />
              Add Hero Slide
            </h3>
            
            <form onSubmit={handleAddSlideSubmit} className="space-y-4">
              <Input
                label="Slide Title / Heading"
                placeholder="e.g. Premium Laptop Repairing Services"
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
                disabled={isAddingSlide}
                required
              />

              <Input
                label="Slide Subtitle"
                placeholder="e.g. Fast, reliable services at your doorstep"
                value={slideSubtitle}
                onChange={(e) => setSlideSubtitle(e.target.value)}
                disabled={isAddingSlide}
              />

              <div className="grid gap-4 grid-cols-3">
                <div className="col-span-2">
                  <Input
                    label="Action Button Link (URL)"
                    placeholder="e.g. /services"
                    value={slideLink}
                    onChange={(e) => setSlideLink(e.target.value)}
                    disabled={isAddingSlide}
                  />
                </div>
                <Input
                  label="Order Sort"
                  type="number"
                  placeholder="1"
                  value={slideOrder}
                  onChange={(e) => setSlideOrder(e.target.value)}
                  disabled={isAddingSlide}
                  required
                />
              </div>

              <FileUploadDropzone
                label="Slide Background Image File"
                onChange={(file) => setSlideImage(file as File | null)}
              />

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-1.5 glow-accent text-xs h-10 mt-2"
                disabled={isAddingSlide}
              >
                {isAddingSlide ? 'Uploading...' : 'Publish Hero Slide'}
              </button>
            </form>
          </div>

          {/* Right panel: Slides List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest px-1">
              Active Hero Slider Items ({slides.length})
            </h3>
            
            {slides.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {slides.sort((a,b) => a.order - b.order).map((slide) => (
                  <div
                    key={slide._id}
                    className="glass-card border border-primary-border rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-36 bg-primary-deep overflow-hidden border-b border-primary-border flex items-center justify-center">
                      <img src={slide.image.url} alt={slide.title} className="h-full w-full object-cover opacity-60" />
                      <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#ff5e5b]">
                        Sort Order: {slide.order}
                      </div>
                      <button
                        onClick={() => handleDeleteSlide(slide._id)}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors shadow-lg"
                        title="Delete Slide"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="p-4">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{slide.title}</h4>
                      {slide.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{slide.subtitle}</p>
                      )}
                      {slide.link && (
                        <span className="text-[10px] text-sky-400 font-semibold block mt-2 truncate">
                          Btn Link: {slide.link}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
                <p className="text-sm text-slate-550 font-medium">No slides uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sections View */}
      {activeSubTab === 'sections' && (
        <form onSubmit={handleSaveSections} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Headers Config */}
            <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3 mb-2">
                <Info size={16} className="text-[#ff5e5b]" />
                Section Headers Text
              </h3>
              
              <Input
                label="Brands Section Main Title"
                placeholder="e.g. AUTHORIZED BRAND PARTNERS"
                value={brandSectionTitle}
                onChange={(e) => setBrandSectionTitle(e.target.value)}
                disabled={isSaving}
              />

              <Input
                label="Services Section Main Title"
                placeholder="e.g. OUR COMPUTER SERVICES & REPAIRS"
                value={servicesSectionTitle}
                onChange={(e) => setServicesSectionTitle(e.target.value)}
                disabled={isSaving}
              />

              <Input
                label="Testimonials Section Title"
                placeholder="e.g. CLIENT REVIEWS & CASE STUDIES"
                value={testimonialsSectionTitle}
                onChange={(e) => setTestimonialsSectionTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {/* Why Choose Us Builder */}
            <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3 mb-2">
                <Sparkles size={16} className="text-sky-400" />
                Why Choose Us Card Builder
              </h3>
              
              {/* Existing List */}
              {whyChooseUs.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-2 scrollbar-thin">
                  {whyChooseUs.map((w, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 bg-primary-slate border border-primary-border p-2.5 rounded-lg text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-foreground block">{w.title}</span>
                        <span className="text-slate-500 dark:text-slate-400 line-clamp-1">{w.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWhyChooseUsItem(index)}
                        className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No marketing points configured.</p>
              )}

              {/* Inputs */}
              <div className="flex flex-col gap-3 border-t border-primary-border pt-3">
                <div className="grid gap-3 grid-cols-3">
                  <div className="col-span-2">
                    <Input
                      placeholder="Selling Point Title (e.g. Quick Service)"
                      value={newWhyTitle}
                      onChange={(e) => setNewWhyTitle(e.target.value)}
                    />
                  </div>
                  <Select
                    options={[
                      { label: 'Laptop Icon', value: 'laptop' },
                      { label: 'Shield Icon', value: 'shield' },
                      { label: 'Award Icon', value: 'award' },
                      { label: 'Settings Icon', value: 'settings' },
                    ]}
                    value={newWhyIcon}
                    onChange={(e) => setNewWhyIcon(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Details description..."
                      value={newWhyDesc}
                      onChange={(e) => setNewWhyDesc(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addWhyChooseUsItem}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5e5b] text-white hover:bg-[#ff3b38] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Products list - Multi select */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3 mb-2">
              <Star size={16} className="text-amber-400" />
              Homepage Featured Products Linker
            </h3>
            
            {productsList.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                {productsList.map((product) => {
                  const isChecked = featuredProducts.includes(product._id);
                  return (
                    <div
                      key={product._id}
                      onClick={() => toggleFeaturedProduct(product._id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-[#ff5e5b] bg-[#ff5e5b]/5 text-[#ff5e5b]'
                          : 'border-primary-border bg-primary-slate hover:border-primary-light text-foreground'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-xs font-semibold block truncate">{product.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">{product.sku}</span>
                      </div>
                      <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                        isChecked ? 'border-[#ff5e5b] bg-[#ff5e5b]' : 'border-primary-border bg-primary-deep'
                      }`}>
                        {isChecked && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No products recorded in inventory.</p>
            )}
          </div>

          {/* Save buttons */}
          <div className="flex justify-end pt-2 border-t border-primary-border">
            <button
              type="submit"
              className="btn-primary flex items-center gap-1.5 glow-accent text-xs h-11 px-6 font-semibold"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving Configurations...' : 'Save CMS Configurations'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
