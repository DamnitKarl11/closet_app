/** @jsxImportSource react */
import React, { ChangeEvent, useState, useEffect } from 'react';
import { getWearLogs, deleteWearLog } from '../api';
import { WearLog } from '../types';
import { MagnifyingGlassIcon, XMarkIcon, PencilIcon, PhotoIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { CloudIcon, SunIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';
import { API_BASE_URL } from '../config';

interface WearLogWithId extends WearLog {
  id: number;
}

const HistoryLog = (): JSX.Element => {
  const [logs, setLogs] = useState<WearLogWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (): Promise<void> => {
    try {
      const fetchedLogs = await getWearLogs();
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleDelete = async (logId: number): Promise<void> => {
    try {
      await deleteWearLog(logId);
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.items.some(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = categoryFilter === 'all' || log.items.some(item => item.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const toggleLog = (logId: number): void => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wear History</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
              </select>
              <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => toggleLog(log.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-500 dark:text-gray-400">
                    {expandedLogs.has(log.id) ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-lg font-semibold dark:text-white">
                    {format(new Date(log.date_worn), 'MMMM d, yyyy')}
                  </span>
                  {log.weather_log && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      {log.weather_log.conditions.primary.toLowerCase().includes('cloud') ? (
                        <CloudIcon className="h-5 w-5" />
                      ) : (
                        <SunIcon className="h-5 w-5" />
                      )}
                      <span className="ml-1">{Math.round(log.weather_log.conditions.metrics.avg_temp)}°F</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLogId(log.id);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              {expandedLogs.has(log.id) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {log.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      {item.image ? (
                        <img
                          src={`${API_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
                      </div>
                      <button 
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PencilIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => selectedLogId && handleDelete(selectedLogId)}
        title="Delete Log"
        message="Are you sure you want to delete this log? This action cannot be undone."
      />
    </div>
  );
};

export default HistoryLog; 