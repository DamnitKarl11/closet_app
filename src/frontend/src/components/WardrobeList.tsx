import React, { useState, useEffect, Fragment } from 'react';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon, EllipsisVerticalIcon, PencilSquareIcon, PhotoIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ClothingItem } from '../types';
import { getClothingItems, deleteClothingItem } from '../api';
import AddClothingModal from './AddClothingModal';
import EditClothingModal from './EditClothingModal';
import ConfirmationModal from './ConfirmationModal';
import { API_BASE_URL } from '../config';

interface WardrobeListProps {
  onAddItem?: () => void;
}

const WardrobeList: React.FC<WardrobeListProps> = ({ onAddItem }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    color: '',
    weather: ''
  });
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filterItems = (item: ClothingItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key as keyof ClothingItem] === value;
    });
    return matchesSearch && matchesFilters;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(filterItems);
    setFilteredItems(filtered);
  }, [items, filterItems]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClothingItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      setError('Failed to load clothing items. Please try again later.');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = (newItem: ClothingItem) => {
    setItems(prevItems => [...prevItems, newItem]);
  };

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const handleEdit = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item: ClothingItem) => {
    setItemToDelete(item.id);
    setIsConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteClothingItem(itemToDelete);
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    } catch (err) {
      setError('Failed to delete item. Please try again later.');
      console.error('Error deleting item:', err);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value // Toggle filter if clicking the same value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      color: '',
      weather: ''
    });
  };

  // Get unique values for filters
  const categories = Array.from(new Set(items.map(item => item.category)));
  const colors = Array.from(new Set(items.map(item => item.color)));
  const weatherTypes = Array.from(new Set(items.map(item => item.weather_suitability)));

  // Add active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const getColorClass = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500',
      black: 'bg-gray-900',
      white: 'bg-gray-100 border border-gray-300',
      brown: 'bg-amber-700',
      orange: 'bg-orange-500',
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-500';
  };

  useEffect(() => {
    let result = items;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    setFilteredItems(result);
  }, [searchTerm, categoryFilter, items]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Wardrobe</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in your collection
          </p>
        </div>
        <button
          onClick={() => onAddItem ? onAddItem() : setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, or brand..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDownIcon className="h-5 w-5" />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto px-4 py-3 rounded-xl border shadow-sm transition-all flex items-center justify-center gap-2 ${
              showFilters 
                ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/70' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            } relative`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="sm:hidden">Filter Items</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('category', category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.category === category
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('color', color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        filters.color === color
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${getColorClass(color)} shadow-sm border border-gray-200 dark:border-gray-600`} />
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Weather</h4>
                <div className="flex flex-wrap gap-2">
                  {weatherTypes.map(weather => (
                    <button
                      key={weather}
                      onClick={() => handleFilterChange('weather', weather)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.weather === weather
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {weather}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No items found. Try adjusting your filters or add a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleEdit(item)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${getColorClass(item.color)} bg-opacity-20`}>
                    <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand || 'No brand'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {item.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span className={`w-2 h-2 rounded-full ${getColorClass(item.color)} mr-1.5`} />
                    {item.color}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      {selectedItem && (
        <EditClothingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onUpdate={handleUpdateItem}
          onDelete={handleDelete}
          item={selectedItem}
        />
      )}

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default WardrobeList; 