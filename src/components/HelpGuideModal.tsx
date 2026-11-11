import React from 'react';
import { X, MousePointer, Hand, ZoomIn, ShieldAlert, AlertCircle } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">คู่มือการใช้งานระบบผังอาคาร</h3>
              <p className="text-xs text-slate-500">วิธีแจ้งเหตุและจัดการความปลอดภัย (งานบริการผ้า ชั้น 1)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">1. การปักหมุดแจ้งจุดเสี่ยง (User Mode)</div>
              <p className="mt-0.5 text-slate-500">
                เมื่ออยู่ในโหมดผู้ใช้ สามารถคลิกเมาส์ที่ตำแหน่งใดก็ได้บนผังอาคาร ระบบจะตรวจจับชื่อโซนอัตโนมัติ และเปิดแบบฟอร์มให้ระบุรายละเอียดจุดเสี่ยง
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">2. การซูมและการเลื่อนผัง (Zoom & Pan)</div>
              <p className="mt-0.5 text-slate-500">
                ใช้ปุ่ม <span className="font-mono bg-white px-1 py-0.5 border rounded">+ / -</span> หรือใช้ลูกกลิ้งเมาส์ (Scroll Wheel) เพื่อซูมเข้าออก และคลิกปุ่ม "ลากผัง (Pan Mode)" เพื่อจับเลื่อนดูพื้นที่ต่างๆ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">3. ระดับความรุนแรงของจุดเสี่ยง</div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 ต่ำ (เฝ้าระวัง)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 🟡 ปานกลาง (ควรแก้ไข)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 🟠 สูง (อันตราย)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span> 🔴 วิกฤต (ด่วนที่สุด)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
