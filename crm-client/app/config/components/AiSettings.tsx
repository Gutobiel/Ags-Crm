import React, { useState } from 'react';
import { FiUpload, FiFileText, FiLink, FiEye, FiTrash2, FiPlus, FiCheckCircle, FiLoader, FiDatabase } from 'react-icons/fi';
import { useBranding } from '@/contexts/BrandingContext';

export default function AiSettings() {
  const { branding } = useBranding();
  const [activeCollection, setActiveCollection] = useState('Geral');
  
  // No futuro, estas coleções virão do banco de dados
  const [collections, setCollections] = useState<{ id: string, name: string, count: number }[]>([
    { id: '1', name: 'Geral', count: 0 }
  ]);

  // Sem dados mockados, inicia vazio
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; size: string; date: string; status: string; icon: string }[]>([]);

  return (
    <div className="bg-white rounded-xl overflow-hidden flex min-h-[600px] border border-gray-100 shadow-sm">
      
      {/* Sidebar - Coleções */}
      <div className="w-64 bg-gray-50 p-5 flex flex-col border-r border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-semibold text-lg">Coleções</h3>
          <button 
            className="text-sm flex items-center gap-1 font-medium transition-colors hover:opacity-80"
            style={{ color: branding.primaryColor }}
          >
            <FiPlus /> Nova
          </button>
        </div>

        <div className="space-y-1 flex-1">
          {collections.map(col => (
            <button 
              key={col.id}
              onClick={() => setActiveCollection(col.name)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeCollection === col.name 
                  ? 'text-white font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
              style={activeCollection === col.name ? { backgroundColor: branding.primaryColor } : {}}
            >
              {col.name}
              <span className={`text-xs ${activeCollection === col.name ? 'text-white opacity-80' : 'text-gray-400'}`}>
                {col.count}
              </span>
            </button>
          ))}
        </div>

        {/* Armazenamento */}
        <div className="mt-8 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-gray-900 text-sm font-semibold mb-3">Armazenamento</h4>
          <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
            <span>Usado</span>
            <span>0 MB / 1 GB</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-1.5 rounded-full" 
              style={{ width: '0%', backgroundColor: branding.primaryColor }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content - Documentos */}
      <div className="flex-1 p-8 flex flex-col relative bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FiDatabase style={{ color: branding.primaryColor }} />
              Base de Conhecimento
            </h2>
            <p className="text-gray-500 text-sm">Gerencie documentos e fontes de dados da IA para a coleção: <strong>{activeCollection}</strong></p>
          </div>
          <button 
            className="text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:opacity-90 active:scale-95"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <FiUpload className="text-lg" /> Upload
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <FiDatabase className="text-2xl text-gray-300" />
              </div>
              <p>Nenhum documento adicionado a esta coleção.</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm group">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                    doc.icon === 'pdf' ? 'bg-red-50 text-red-500 border-red-100' : 
                    doc.icon === 'link' ? 'bg-blue-50 text-blue-500 border-blue-100' : 
                    'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {doc.icon === 'link' ? <FiLink className="text-xl" /> : <FiFileText className="text-xl" />}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h4 className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="uppercase tracking-wider font-medium">{doc.type}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{doc.size}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>Adicionado em {doc.date}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-8">
                  <div className={`flex items-center gap-2 text-xs font-semibold tracking-wide ${
                    doc.status === 'Processado' ? 'text-emerald-600' : 'text-amber-500'
                  }`}>
                    {doc.status === 'Processado' ? <FiCheckCircle className="text-base" /> : <FiLoader className="animate-spin text-base" />}
                    {doc.status}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-md">
                      <FiEye className="text-lg" />
                    </button>
                    <button className="hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            {documents.length} documento(s) cadastrado(s)
          </p>
          <button 
            className="text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:opacity-90 active:scale-95"
            style={{ backgroundColor: branding.primaryColor }}
            disabled={documents.length === 0}
          >
            Treinar novamente
          </button>
        </div>
      </div>
      
    </div>
  );
}
