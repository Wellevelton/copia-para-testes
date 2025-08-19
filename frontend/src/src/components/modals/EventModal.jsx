import React, { useState } from 'react';
import { X } from 'lucide-react';

const EventModal = ({ selectedDate, setShowEventModal, setSelectedDate, addEvent }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventCategory, setEventCategory] = useState('Pessoal');

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      alert('Por favor, insira um título para o evento');
      return;
    }

    addEvent({
      title: eventTitle,
      description: eventDescription,
      startTime,
      endTime,
      category: eventCategory
    });

    // Reset form
    setEventTitle('');
    setEventDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setEventCategory('Pessoal');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">
            Novo Evento - {selectedDate?.toLocaleDateString('pt-BR')}
          </h3>
          <button 
            onClick={() => {
              setShowEventModal(false);
              setSelectedDate(null);
            }} 
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Título</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="Digite o título do evento"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Descrição</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 h-20 resize-none"
              placeholder="Descrição opcional"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Categoria</label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="Pessoal">Pessoal</option>
              <option value="Trabalho">Trabalho</option>
              <option value="Estudos">Estudos</option>
              <option value="Saúde">Saúde</option>
              <option value="Lazer">Lazer</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSaveEvent}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Salvar
          </button>
          <button
            onClick={() => {
              setShowEventModal(false);
              setSelectedDate(null);
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;


