import React, { useState } from 'react';
import { SlidersHorizontal, X, Wifi, Armchair, WashingMachine, Snowflake, Trees } from 'lucide-react';
import { useListingsStore } from '@/store/listingsStore';
import { District, RoomType } from '@/types';

const DISTRICTS: District[] = ['Есиль', 'Алматы', 'Сарыарка', 'Байконур', 'Нура', 'Другой'];
const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'studio', label: 'Студия' },
  { value: '1', label: '1 комната' },
  { value: '2', label: '2 комнаты' },
  { value: '3', label: '3 комнаты' },
  { value: '4+', label: '4+ комнаты' },
];

const ListingFilters: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { filters, setFilters, resetFilters } = useListingsStore();
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || '');

  const applyPrice = () => {
    setFilters({
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    });
  };

  const toggleDistrict = (d: District) => {
    setFilters({ district: filters.district === d ? undefined : d });
  };

  const toggleRoom = (r: RoomType) => {
    setFilters({ rooms: filters.rooms === r ? undefined : r });
  };

  const toggleAmenity = (key: 'wifi' | 'furniture' | 'washer') => {
    setFilters({ [key]: filters[key] ? undefined : true });
  };

  const handleReset = () => {
    setPriceMin('');
    setPriceMax('');
    resetFilters();
  };

  return (
    <aside className="bg-white rounded-2xl p-5 shadow-card w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          <span className="font-semibold text-gray-900 text-sm">Фильтры</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="text-xs text-text hover:text-primary-600 transition-colors">
            Сбросить
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Цена, ₸/мес</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От 30 000"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            className="input-default text-xs"
          />
          <input
            type="number"
            placeholder="До 300 000"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            className="input-default text-xs"
          />
        </div>
      </div>

      {/* District */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Район</p>
        <div className="space-y-1.5">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDistrict(d)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                filters.district === d
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Комнаты</p>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((r) => (
            <button
              key={r.value}
              onClick={() => toggleRoom(r.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                filters.rooms === r.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-border text-gray-700 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Удобства</p>
        <div className="space-y-2">
          <AmenityToggle
            icon={<Wifi className="w-4 h-4" />}
            label="Wi-Fi"
            active={!!filters.wifi}
            onClick={() => toggleAmenity('wifi')}
          />
          <AmenityToggle
            icon={<Armchair className="w-4 h-4" />}
            label="Мебель"
            active={!!filters.furniture}
            onClick={() => toggleAmenity('furniture')}
          />
          <AmenityToggle
            icon={<WashingMachine className="w-4 h-4" />}
            label="Стиральная машина"
            active={!!filters.washer}
            onClick={() => toggleAmenity('washer')}
          />
        </div>
      </div>
    </aside>
  );
};

const AmenityToggle: React.FC<{
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
      active ? 'bg-primary-50 border-primary-200' : 'border-border hover:border-gray-300'
    }`}
  >
    <div className={`flex items-center gap-2.5 text-sm ${active ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
      <span className={active ? 'text-primary-600' : 'text-gray-400'}>{icon}</span>
      {label}
    </div>
    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
      active ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
    }`}>
      {active && <div className="w-2 h-2 bg-white rounded-sm" />}
    </div>
  </button>
);

export default ListingFilters;
