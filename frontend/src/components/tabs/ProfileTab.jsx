import React, { useState } from 'react';
import { User, Camera, Save, Edit } from 'lucide-react';

const ProfileTab = ({ careerPlanning, setCareerPlanning, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Wellevelton Silva',
    email: 'wellevelton@email.com',
    currentRole: careerPlanning?.currentRole || 'Desenvolvedor Frontend Jr',
    location: 'São Paulo, Brasil',
    bio: 'Desenvolvedor apaixonado por criar soluções inovadoras e experiências únicas.',
    photo: null
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Atualizar dados de carreira se o cargo mudou
    if (careerPlanning && setCareerPlanning) {
      setCareerPlanning(prev => ({
        ...prev,
        currentRole: profileData.currentRole
      }));
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Perfil</h2>
            <p className="text-gray-400">Gerencie suas informações pessoais</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-xl flex items-center gap-3">
            <User className="text-purple-400" size={24} />
            Informações do Perfil
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isEditing ? <Save size={20} /> : <Edit size={20} />}
            {isEditing ? 'Salvar' : 'Editar'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Foto do Perfil */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center overflow-hidden">
                  {profileData.photo ? (
                    <img 
                      src={profileData.photo} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-white" size={48} />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition-colors">
                    <Camera className="text-white" size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-gray-400 text-sm text-center">
                  Clique na câmera para alterar a foto
                </p>
              )}
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Cargo Atual</label>
                <input 
                  type="text" 
                  value={profileData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Esta informação será sincronizada com a aba Carreira
                </p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Localização</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Biografia</label>
              <textarea 
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50 resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-4 mt-8">
            <button 
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
