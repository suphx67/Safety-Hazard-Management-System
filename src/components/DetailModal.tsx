import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  Trash2,
  Camera,
  ExternalLink,
  ShieldAlert,
  Phone,
} from 'lucide-react';
import { HazardPin, HazardStatus, SeverityLevel } from '../types/hazard';

interface DetailModalProps {
  pin: HazardPin | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: HazardStatus, notes?: string, assignee?: string, resolvedPhoto?: string) => void;
  onDelete: (id: string) => void;
  onFocusPin: (pin: HazardPin) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  pin,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
  onFocusPin,
}) => {
  if (!isOpen || !pin) return null;

  const [status, setStatus] = useState<HazardStatus>(pin.status);
  const [assignedTo, setAssignedTo] = useState(pin.assignedTo || '');
  const [resolutionNotes, setResolutionNotes] = useState(pin.resolutionNotes || '');
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | undefined>(pin.resolvedPhotoUrl);

  const handleResolvedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setResolvedPhotoUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveResolution = () => {
    onUpdateStatus(pin.id, status, resolutionNotes, assignedTo, resolvedPhotoUrl);
    onClose();
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'วิกฤต':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            🔴 วิกฤต (ด่วนที่สุด)
          </span>
        );
      case 'สูง':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
            🟠 สูง (อันตราย)
          </span>
        );
      case 'ปานกลาง':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            🟡 ปานกลาง
          </span>
        );
      case 'ต่ำ':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            🟢 ต่ำ (เฝ้าระวัง)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getSeverityBadge(pin.severity)}
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {pin.category}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
              {pin.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Details Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-slate-400">ตำแหน่ง: </span>
              <span className="font-semibold text-slate-800">{pin.locationName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400">เวลาที่แจ้ง: </span>
              <span className="text-slate-700">{pin.timestamp}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400">ผู้แจ้งเหตุ: </span>
              <span className="font-medium text-slate-800">{pin.author}</span>
            </div>
          </div>
          {pin.contact && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">ติดต่อ: </span>
                <span className="text-slate-700">{pin.contact}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hazard Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-700">รายละเอียดสภาพปัญหา</h4>
          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
            {pin.desc || 'ไม่มีรายละเอียดเพิ่มเติม'}
          </p>
        </div>

        {/* Photos (Reported Photo & Resolved Photo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pin.photoUrl ? (
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1">
                📸 รูปภาพประกอบขณะแจ้งเหตุ
              </span>
              <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img
                  src={pin.photoUrl}
                  alt="Hazard report"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {resolvedPhotoUrl ? (
            <div>
              <span className="text-xs font-semibold text-emerald-700 block mb-1">
                ✅ ภาพถ่ายหลังดำเนินการแก้ไข
              </span>
              <div className="w-full h-36 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50 flex items-center justify-center relative">
                <img
                  src={resolvedPhotoUrl}
                  alt="Resolved"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setResolvedPhotoUrl(undefined)}
                  className="absolute top-1 right-1 bg-slate-900/70 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Status & Maintenance Management Section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-slate-600" />
              <span>การบริหารจัดการและบันทึกผลการซ่อมบำรุง</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                onFocusPin(pin);
                onClose();
              }}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>ชี้เป้าบนผังอาคาร</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการดำเนินการ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as HazardStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="รอแก้ไข">⏳ รอแก้ไข (Pending)</option>
                <option value="กำลังดำเนินการ">🔧 กำลังดำเนินการ (In Progress)</option>
                <option value="แก้ไขแล้ว">✅ แก้ไขแล้ว (Resolved)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ช่างผู้รับผิดชอบ / หน่วยงาน
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="ระบุชื่อช่างหรือทีมงาน"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกผลการแก้ไข / มาตรการป้องกัน
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="ระบุผลการตรวจสอบ การซ่อมแซม อะไหล่ที่เปลี่ยน หรือมาตรการความปลอดภัย..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="cursor-pointer border border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 transition rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>แนบภาพถ่ายหลักฐานหลังซ่อมแซมเสร็จสิ้น</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleResolvedPhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('คุณแน่ใจว่าต้องการลบรายการจุดเสี่ยงนี้หรือไม่?')) {
                onDelete(pin.id);
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>ลบรายการนี้</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleSaveResolution}
              className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
