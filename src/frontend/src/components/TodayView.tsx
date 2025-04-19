import React, { useState, useEffect } from 'react';
import { ClothingItem, WearLog, Weather } from '../types';
import { getClothingItems, createWearLog, getCurrentWeather } from '../api';
import ConfirmationModal from './ConfirmationModal';
import { CloudIcon, SunIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';
import { format } from 'date-fns';

const TodayView: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, weatherData] = await Promise.all([
          getClothingItems(),
          getCurrentWeather()
        ]);
        setItems(itemsData);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleItemSelect = (category: string, itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: itemId
    }));
  };

  const handleRemoveItem = (category: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[category];
      return newItems;
    });
  };

  const handleLogOutfit = async () => {
    const selectedItemIds = Object.values(selectedItems);
    if (selectedItemIds.length === 0) {
      setError('Please select at least one item');
      return;
    }

    try {
      const wearLogData: Omit<WearLog, 'id' | 'created_at'> = {
        items: [],  // This will be populated by the backend
        item_ids: selectedItemIds,
        date_worn: new Date().toISOString(),
        weather_log: weather ? {
          id: 0,  // This will be set by the backend
          date: weather.date,
          temp_high: weather.temp_high,
          temp_low: weather.temp_low,
          precipitation_chance: weather.precipitation_chance,
          humidity: weather.humidity,
          conditions: weather.conditions,
          created_at: new Date().toISOString()
        } : null,
        notes: ''
      };
      
      await createWearLog(wearLogData);
      setSelectedItems({});
      setError(null);
      setShowSuccessModal(true);
    } catch (err) {
      setError('Failed to log outfit');
      console.error(err);
    }
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const getSelectedItem = (category: string) => {
    const itemId = selectedItems[category];
    return items.find(item => item.id === itemId);
  };

  const categories = ['shirt', 'pants', 'shoes', 'jacket', 'accessory'];

  const getColorClass = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      white: 'bg-gray-100 border border-gray-300',
      black: 'bg-gray-900',
    };
    return colorMap[color] || 'bg-gray-200';
  };

  const getWeatherIcon = () => {
    if (!weather) return null;
    
    const conditions = weather.conditions.all;
    if (conditions.includes('rainy')) {
      return <CloudIcon className="h-8 w-8 text-blue-500" />;
    } else if (conditions.includes('humid')) {
      return <CloudIcon className="h-8 w-8 text-gray-500" />;
    } else {
      return <SunIcon className="h-8 w-8 text-yellow-500" />;
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/clothing-items/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load clothing items. Please try again later.');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/wear-logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: Object.values(selectedItems),
          date: new Date().toISOString().split('T')[0],
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSelectedItems({});
    } catch (err) {
      setError('Failed to save today\'s outfit. Please try again later.');
      console.error('Error saving outfit:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selected Items Panel */}
        <div className="lg:col-span-1 space-y-6 sticky top-4 h-fit">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {format(new Date(), 'EEEE, MMMM d')}
            </h2>
            
            {/* Weather Display */}
            {weather && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Weather</h3>
                  {getWeatherIcon()}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    {weather.conditions.metrics.temp_range}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {weather.conditions.all.join(', ')}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Rain: {weather.conditions.metrics.precipitation}</span>
                    <span>Humidity: {weather.conditions.metrics.humidity}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Items */}
            <div className="space-y-4">
              {categories.map(category => {
                const selectedItem = getSelectedItem(category);
                return selectedItem ? (
                  <div key={category} className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                      {category}
                    </h3>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        {selectedItem.image && (
                          <img
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {selectedItem.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${getColorClass(selectedItem.color)}`} />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedItem.color}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(category)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null;
              })}
            </div>

            {/* Log Outfit Button */}
            <button
              onClick={handleLogOutfit}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Log Today's Outfit
            </button>
          </div>
        </div>

        {/* Clothing Items Grid */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {getItemsByCategory(category).map(item => (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer ${
                        selectedItems[category] === item.id
                          ? 'ring-2 ring-indigo-500'
                          : 'hover:ring-2 hover:ring-gray-300'
                      } rounded-lg overflow-hidden`}
                      onClick={() => handleItemSelect(category, item.id)}
                    >
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${getColorClass(item.color)}`} />
                              <span className="text-white text-xs">{item.color}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4 text-center">
                          <span className="text-white text-lg font-medium mb-2">{item.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${getColorClass(item.color)}`} />
                            <span className="text-gray-200 text-sm capitalize">{item.color}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Outfit Logged Successfully"
        message="Your outfit has been logged for today."
      />
    </div>
  );
};

export default TodayView; 