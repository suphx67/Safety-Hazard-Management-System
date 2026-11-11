import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Camera, MapPin, ShieldAlert } from 'lucide-react';
import { HazardCategory, HazardPin, SeverityLevel } from '../types/hazard';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pinData: Omit<HazardPin, 'id' | 'timestamp' | 'status'>) => void;
  initialCoords: { x: number; y: number; locationName: string } | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCoords,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HazardCategory>('เครื่องจักร/อุปกรณ์');
  const [severity, setSeverity] = useState<SeverityLevel>('ปานกลาง');
  const [desc, setDesc] = useState('');
  const [author, setAuthor] = useState('');
  const [contact, setContact] = useState('');
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialCoords) {
      setLocationName(initialCoords.locationName);
      setTitle('');
      setCategory('เครื่องจักร/อุปกรณ์');
      setSeverity('ปานกลาง');
      setDesc('');
      setPhotoUrl(undefined);
    }
  }, [initialCoords]);

  if (!isOpen || !initialCoords) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhotoUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onSubmit({
      title: title.trim(),
      category,
      severity,
      desc: desc.trim(),
      author: author.trim(),
      contact: contact.trim(),
      x: initialCoords.x,
      y: initialCoords.y,
      locationName: locationName.trim() || initialCoords.locationName,
      photoUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-rose-600">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">แบบฟอร์มปักหมุดแจ้งจุดเสี่ยง/อันตราย</h3>
              <p className="text-xs text-slate-500">ผังอาคาร: งานบริการผ้า ชั้น 1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coordinates & Zone Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="text-slate-500">ตำแหน่งที่คลิกในผัง:</span>
                <span className="font-semibold text-slate-800 ml-1.5">{initialCoords.locationName}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
              X:{initialCoords.x}, Y:{initialCoords.y}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หัวข้อจุดเสี่ยง/อันตรายที่พบ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ท่อไอน้ำรั่ว, ปลั๊กไฟตู้ซักผ้าชำรุด, สารเคมีหกพื้นลื่น"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Category & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทความเสี่ยง
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="เครื่องจักร/อุปกรณ์">⚙️ เครื่องจักร/อุปกรณ์</option>
                <option value="ระบบไฟฟ้า/ความร้อน">⚡ ระบบไฟฟ้า/ความร้อน</option>
                <option value="สารเคมี/ความปลอดภัย">🧪 สารเคมี/ความปลอดภัย</option>
                <option value="พื้นลื่น/ทางเดิน">🪵 พื้นลื่น/สะดุดล้ม/ทางเดิน</option>
                <option value="โครงสร้าง/อาคาร">🏗️ โครงสร้าง/อาคาร</option>
                <option value="ระบบป้องกันอัคคีภัย">🧯 ระบบป้องกันอัคคีภัย</option>
                <option value="อื่นๆ">⚠️ อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความรุนแรง
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="ต่ำ">🟢 ต่ำ (เฝ้าระวัง / ไม่เร่งด่วน)</option>
                <option value="ปานกลาง">🟡 ปานกลาง (ควรแก้ไขตามรอบ)</option>
                <option value="สูง">🟠 สูง (อันตราย / ต้องรีบแก้ไข)</option>
                <option value="วิกฤต">🔴 วิกฤต (ด่วนที่สุด / หยุดใช้งานทันที)</option>
              </select>
            </div>
          </div>

          {/* Location Name Custom Edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อบริเวณ / ห้อง / จุดสังเกต
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="เช่น ห้องเครื่องอบผ้า บริเวณหลังเครื่องตัวที่ 2"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายละเอียดและสภาพปัญหา
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="อธิบายอาการที่พบ ลักษณะความเสียหาย หรือข้อควรระวังแก่ผู้ปฏิบัติงาน..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
            />
          </div>

          {/* Reporter Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้แจ้งเหตุ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="ชื่อ-นามสกุล หรือ รหัสพนักงาน"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ / แผนก
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="เช่น 081-xxx-xxxx / งานบริการผ้า"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แนบภาพถ่ายจุดเกิดเหตุ (ถ้ามี)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer border border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30 transition rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-slate-600 flex-1">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>คลิกเพื่อแนบรูปภาพ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>บันทึกแจ้งเหตุ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
