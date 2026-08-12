import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, X, Check, Calendar, Tag, Layers, AlertCircle, Building, Plus } from 'lucide-react';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: InventoryItem) => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [code, setCode] = useState(`INS-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Medicamento');
  const [stockCurrent, setStockCurrent] = useState<number>(100);
  const [stockMinimum, setStockMinimum] = useState<number>(30);
  const [unit, setUnit] = useState('Comprimido');
  const [batchNumber, setBatchNumber] = useState(`L-${Math.floor(10000 + Math.random() * 90000)}`);
  const [expirationDate, setExpirationDate] = useState('12/2027');
  const [estimatedConsumptionDays, setEstimatedConsumptionDays] = useState<number>(20);
  const [suggestedPurchaseQty, setSuggestedPurchaseQty] = useState<number>(100);
  const [supplier, setSupplier] = useState('Distribuidora Eurofarma / EMS');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      code,
      name,
      category,
      stockCurrent: Number(stockCurrent),
      stockMinimum: Number(stockMinimum),
      unit,
      batchNumber,
      expirationDate,
      estimatedConsumptionDays: Number(estimatedConsumptionDays),
      suggestedPurchaseQty: Number(suggestedPurchaseQty)
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nova Entrada de Insumo & Controle de Lote</h3>
              <p className="text-xs text-slate-400">
                Cadastro inteligente com rastreabilidade de validade e gatilho de estoque mínimo.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Código do Item / SKU</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Categoria de Insumo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="Medicamento">Medicamento (Psicotrópico/Geral)</option>
                <option value="Material Médico">Material Médico / Curativo</option>
                <option value="Fralda">Fraldas & Higiene Geriátrica</option>
                <option value="EPI">EPI (Luvas, Máscaras, Jalecos)</option>
                <option value="Alimentação">Alimentação / Espessantes</option>
                <option value="Limpeza">Sanitização & Limpeza</option>
                <option value="Oxigênio">Oxigênio & Gases Medicinais</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Nome Completo do Produto / Medicamento</label>
            <input
              type="text"
              placeholder="Ex: Haloperidol 5mg/ml Ampola 1ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-zinc-900"
            />
          </div>

          {/* Lote e Validade */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
            <span className="font-bold text-teal-900 block text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Controle de Lote & Rastreabilidade ANVISA
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Número do Lote</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  required
                  placeholder="L-99201"
                  className="w-full p-2 bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Data de Validade (MM/AAAA)</label>
                <input
                  type="text"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                  placeholder="10/2027"
                  className="w-full p-2 bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quantidades e Estoque Mínimo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Estoque Inicial</label>
              <input
                type="number"
                min="1"
                value={stockCurrent}
                onChange={(e) => setStockCurrent(Number(e.target.value))}
                required
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Estoque Mínimo (Gatilho)</label>
              <input
                type="number"
                min="1"
                value={stockMinimum}
                onChange={(e) => setStockMinimum(Number(e.target.value))}
                required
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Unidade Medida</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Comprimido / Ampola"
                required
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Fornecedor Preferencial / Distribuidor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Salvar Entrada no Estoque
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
