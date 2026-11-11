import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  User,
  Settings,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  Search,
  AlertTriangle,
  Download,
  HelpCircle,
  Info,
  Eye,
  Trash2,
  RotateCcw,
} from 'lucide-react';

import {
  HazardPin,
  HazardStatus,
  SeverityLevel,
  HazardCategory,
} from './types/hazard';
import {
  FLOOR_PLAN_CONFIG,
  INITIAL_HAZARD_PINS,
  detectZone,
} from './data/initialData';
import { ReportModal } from './components/ReportModal';
import { DetailModal } from './components/DetailModal';
import { HelpGuideModal } from './components/HelpGuideModal';

export default function App() {
  // Pins state with LocalStorage persistence
  const [pins, setPins] = useState<HazardPin[]>(() => {
    const saved = localStorage.getItem('safety_hazard_pins_single');
    return saved ? JSON.parse(saved) : INITIAL_HAZARD_PINS;
  });

  // App Modes: 'user' (Report) or 'admin' (Management)
  const [currentMode, setCurrentMode] = useState<'user' | 'admin'>('user');

  // Canvas Pan & Zoom State
  const [zoomScale, setZoomScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected Pin & Modals
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [inspectingPin, setInspectingPin] = useState<HazardPin | null>(null);

  // New Pin Report Modal State
  const [newReportCoords, setNewReportCoords] = useState<{
    x: number;
    y: number;
    locationName: string;
  } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Help Modal State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Viewport & Canvas References
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('safety_hazard_pins_single', JSON.stringify(pins));
  }, [pins]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Zoom & Pan Handlers
  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 2.5));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoom(delta);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode) return;
    setIsDraggingPan(true);
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPan || !isPanMode) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDraggingPan(false);
  };

  // Canvas Click: Pin Creation
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isPanMode || isDraggingPan) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoomScale;
    const rawY = (e.clientY - rect.top) / zoomScale;

    const x = Math.round(Math.max(0, Math.min(FLOOR_PLAN_CONFIG.width, rawX)));
    const y = Math.round(Math.max(0, Math.min(FLOOR_PLAN_CONFIG.height, rawY)));

    const locationName = detectZone(x, y);

    setNewReportCoords({
      x,
      y,
      locationName,
    });
    setIsReportModalOpen(true);
  };

  // Add New Hazard Pin
  const handleAddPin = (pinData: Omit<HazardPin, 'id' | 'timestamp' | 'status'>) => {
    const newPin: HazardPin = {
      ...pinData,
      id: 'pin_' + Date.now(),
      status: 'รอแก้ไข',
      timestamp: new Date().toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };

    setPins((prev) => [newPin, ...prev]);
    setSelectedPinId(newPin.id);
    showToast(`ปักหมุดแจ้งจุดเสี่ยง "${newPin.title}" เรียบร้อยแล้ว`);
  };

  // Update Pin Status & Maintenance
  const handleUpdateStatus = (
    id: string,
    newStatus: HazardStatus,
    notes?: string,
    assignee?: string,
    resolvedPhoto?: string
  ) => {
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isNowResolved = newStatus === 'แก้ไขแล้ว';
          return {
            ...p,
            status: newStatus,
            resolutionNotes: notes !== undefined ? notes : p.resolutionNotes,
            assignedTo: assignee !== undefined ? assignee : p.assignedTo,
            resolvedPhotoUrl: resolvedPhoto !== undefined ? resolvedPhoto : p.resolvedPhotoUrl,
            resolvedAt: isNowResolved
              ? p.resolvedAt ||
                new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
              : undefined,
          };
        }
        return p;
      })
    );
    showToast(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อย`);
  };

  // Delete Pin
  const handleDeletePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    if (selectedPinId === id) setSelectedPinId(null);
    showToast('ลบรายการจุดเสี่ยงเรียบร้อยแล้ว');
  };

  // Focus Pin on Canvas
  const handleFocusPin = (pin: HazardPin) => {
    setSelectedPinId(pin.id);
    setZoomScale(1.3);
    setPanX(Math.round(230 - pin.x * 1.3));
    setPanY(Math.round(170 - pin.y * 1.3));
    showToast(`ไปยังตำแหน่ง "${pin.title}"`);
  };

  // Reset Sample Data
  const handleResetSampleData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลจุดเสี่ยงกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      setPins(INITIAL_HAZARD_PINS);
      setSelectedPinId(null);
      showToast('รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว');
    }
  };

  // Export CSV Report (with UTF-8 BOM for Thai support in Excel)
  const handleExportCSV = () => {
    const headers = [
      'รหัส',
      'ผังอาคาร',
      'หัวข้อจุดเสี่ยง',
      'หมวดหมู่',
      'ระดับความรุนแรง',
      'โซน/ตำแหน่ง',
      'พิกัด X',
      'พิกัด Y',
      'ผู้แจ้งเหตุ',
      'เบอร์ติดต่อ',
      'เวลาที่แจ้ง',
      'สถานะ',
      'ผู้รับผิดชอบ',
      'ผลการแก้ไข',
      'เวลาแก้ไขแล้วเสร็จ',
    ];

    const rows = pins.map((p) => [
      `"${p.id}"`,
      `"${FLOOR_PLAN_CONFIG.name}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.severity}"`,
      `"${p.locationName.replace(/"/g, '""')}"`,
      p.x,
      p.y,
      `"${p.author.replace(/"/g, '""')}"`,
      `"${p.contact || '-'}"`,
      `"${p.timestamp}"`,
      `"${p.status}"`,
      `"${p.assignedTo || '-'}"`,
      `"${(p.resolutionNotes || '-').replace(/"/g, '""')}"`,
      `"${p.resolvedAt || '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `safety_laundry_f1_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดรายงาน CSV สำเร็จ');
  };

  // Filtered Pins for Table
  const filteredPins = pins.filter((pin) => {
    const matchesSearch =
      pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pin.assignedTo && pin.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || pin.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || pin.severity === filterSeverity;
    const matchesCategory = filterCategory === 'ALL' || pin.category === filterCategory;

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
  });

  // Statistics
  const totalStats = pins.length;
  const pendingStats = pins.filter((p) => p.status === 'รอแก้ไข').length;
  const inProgressStats = pins.filter((p) => p.status === 'กำลังดำเนินการ').length;
  const resolvedStats = pins.filter((p) => p.status === 'แก้ไขแล้ว').length;
  const criticalStats = pins.filter((p) => p.severity === 'วิกฤต' && p.status !== 'แก้ไขแล้ว').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-rose-500 rounded-xl text-white shadow-sm flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
                  Safety & Hazard Management System
                </h1>
                <span className="hidden md:inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {FLOOR_PLAN_CONFIG.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบรับแจ้งและบริหารจัดการความปลอดภัยด้วยผังอาคารจริง
              </p>
            </div>
          </div>

          {/* Header Action Tools & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setCurrentMode('user')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentMode === 'user'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">โหมดแจ้งเหตุ (User)</span>
                <span className="xs:hidden">แจ้งเหตุ</span>
              </button>
              <button
                onClick={() => setCurrentMode('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentMode === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">จัดการงาน (Admin)</span>
                <span className="xs:hidden">Admin</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="คู่มือการใช้งาน"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition shadow-xs"
              title="ส่งออกรายงานเป็น CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stat Cards / Dashboard Summary */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">จุดเสี่ยงทั้งหมด</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalStats}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ในผังงานบริการผ้า</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 font-semibold">รอการแก้ไข</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingStats}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ยังไม่ดำเนินการ</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 font-semibold">กำลังดำเนินการ</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{inProgressStats}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ทีมช่างเข้าตรวจ</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 font-semibold">แก้ไขเสร็จสิ้น</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{resolvedStats}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ปลอดภัยแล้ว</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 shadow-xs border border-rose-200 bg-rose-50/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 font-bold flex items-center gap-1">
                <span>วิกฤตค้างอยู่</span>
                {criticalStats > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                )}
              </p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{criticalStats}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ต้องการแก้ไขทันที</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Floor Plan Interactive Canvas Section */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Floor Plan Top Control Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
            {/* Title */}
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
                  ผังอาคาร: {FLOOR_PLAN_CONFIG.name}
                </h2>
              </div>

              {/* Mode Badge Indicator */}
              {currentMode === 'user' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>โหมดผู้ใช้: คลิกปักหมุดเพื่อแจ้งเหตุ</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>โหมด Admin: คลิกหมุดเพื่อตรวจสอบและเปลี่ยนสถานะ</span>
                </span>
              )}
            </div>

            {/* Canvas Zoom & Tool Controls */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-2xs p-0.5 text-slate-700">
                <button
                  onClick={() => handleZoom(0.15)}
                  title="ซูมเข้า (+)"
                  className="p-1.5 hover:bg-slate-100 rounded text-xs transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom(-0.15)}
                  title="ซูมออก (-)"
                  className="p-1.5 hover:bg-slate-100 rounded text-xs transition"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="รีเซ็ตมุมมอง (100%)"
                  className="p-1.5 hover:bg-slate-100 rounded text-xs transition"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setIsPanMode(!isPanMode)}
                  title="สลับโหมดลากผังอาคาร (Pan Mode)"
                  className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                    isPanMode
                      ? 'bg-indigo-100 text-indigo-700 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {isPanMode ? 'กำลังลากผัง' : 'ลากผัง'}
                  </span>
                </button>
              </div>

              {/* Reset Sample Data Button */}
              <button
                onClick={handleResetSampleData}
                title="รีเซ็ตข้อมูลจุดเสี่ยงตัวอย่าง"
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">รีเซ็ตข้อมูล</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Body Area */}
          <div className="p-3 sm:p-4 relative">
            {/* Instruction Banner & Legend Hint */}
            <div className="mb-3 p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  {currentMode === 'user'
                    ? 'คลิกตำแหน่งใดก็ได้บนผังอาคารจริง เพื่อปักหมุดแจ้งจุดเสี่ยง/อันตราย (ระบบตรวจจับชื่อห้องอัตโนมัติ)'
                    : 'โหมดผู้ดูแลระบบ: คลิกหมุดเพื่อตรวจสอบ มอบหมายช่าง บันทึกผลซ่อม หรือเปลี่ยนสถานะ'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-[11px] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ต่ำ
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ปานกลาง
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> สูง
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span> วิกฤต
                </span>
              </div>
            </div>

            {/* Main Viewport Window */}
            <div
              ref={viewportRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative w-full h-[520px] sm:h-[620px] bg-slate-200/90 rounded-xl border-2 border-slate-300 overflow-hidden floor-grid select-none ${
                isPanMode
                  ? isDraggingPan
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : 'cursor-crosshair'
              }`}
            >
              {/* Transform Canvas Layer */}
              <div
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})`,
                  transformOrigin: '0 0',
                  transition: isDraggingPan ? 'none' : 'transform 0.1s ease-out',
                }}
                className="absolute inset-0"
              >
                {/* Fixed Dimension Blueprint Board matching exact PNG image */}
                <div
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    width: `${FLOOR_PLAN_CONFIG.width}px`,
                    height: `${FLOOR_PLAN_CONFIG.height}px`,
                  }}
                  className="relative bg-white shadow-xl mx-auto my-auto overflow-hidden border border-slate-300"
                >
                  {/* Real Building Blueprint PNG Image Layer */}
                  <img
                    src={FLOOR_PLAN_CONFIG.imageSrc}
                    alt={FLOOR_PLAN_CONFIG.name}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Pins Overlay Layer */}
                  <div className="absolute inset-0 pointer-events-none">
                    {pins.map((pin) => {
                      const isSelected = selectedPinId === pin.id;

                      let colorClass = 'bg-amber-500 text-white';
                      let pulseClass = '';
                      if (pin.severity === 'ต่ำ') colorClass = 'bg-emerald-500 text-white';
                      if (pin.severity === 'ปานกลาง') colorClass = 'bg-amber-500 text-white';
                      if (pin.severity === 'สูง') colorClass = 'bg-orange-500 text-white';
                      if (pin.severity === 'วิกฤต') {
                        colorClass = 'bg-rose-600 text-white';
                        if (pin.status !== 'แก้ไขแล้ว') {
                          pulseClass = 'animate-pin-pulse ring-4 ring-rose-400/50';
                        }
                      }

                      return (
                        <div
                          key={pin.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPinId(pin.id);
                            setInspectingPin(pin);
                          }}
                          style={{
                            left: `${pin.x}px`,
                            top: `${pin.y}px`,
                          }}
                          className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer pointer-events-auto transition-transform ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-20'
                          }`}
                        >
                          <div className="relative group">
                            {/* Pin Bubble */}
                            <div
                              className={`w-8 h-8 rounded-full ${colorClass} ${pulseClass} shadow-md flex items-center justify-center border-2 border-white`}
                            >
                              {pin.status === 'แก้ไขแล้ว' ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-white" />
                              )}
                            </div>

                            {/* Pin Status Dot Tag */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                              {pin.status === 'รอแก้ไข' && (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-1 ring-white"></span>
                              )}
                              {pin.status === 'กำลังดำเนินการ' && (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-1 ring-white"></span>
                              )}
                              {pin.status === 'แก้ไขแล้ว' && (
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-white"></span>
                              )}
                            </div>

                            {/* Hover Tooltip Popover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 bg-slate-900/95 text-white text-[11px] rounded-xl p-2.5 shadow-2xl z-40 pointer-events-none backdrop-blur-xs">
                              <div className="font-bold border-b border-slate-700 pb-1 mb-1 truncate text-white">
                                {pin.title}
                              </div>
                              <div className="text-slate-300">
                                โซน: <span className="text-white font-medium">{pin.locationName}</span>
                              </div>
                              <div className="text-slate-300">
                                ความรุนแรง: <span className="font-semibold text-amber-300">{pin.severity}</span>
                              </div>
                              <div className="text-slate-300 flex items-center justify-between mt-1 pt-1 border-t border-slate-800">
                                <span>สถานะ: {pin.status}</span>
                                <span className="text-[10px] text-slate-400">{pin.author}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Canvas Info Badge (Bottom Right) */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 text-[11px] text-slate-600 font-mono z-20 pointer-events-none flex items-center gap-2">
                <span>ซูม: {Math.round(zoomScale * 100)}%</span>
                <span>·</span>
                <span>จุดเสี่ยงบนผัง: {pins.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hazard Reports Table & Management Section */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-semibold text-base sm:text-lg text-slate-900">
                  ตารางบันทึกรายละเอียดการรับแจ้งและตำแหน่งจุดเสี่ยง (งานบริการผ้า ชั้น 1)
                </h2>
                <p className="text-xs text-slate-500">
                  คลิกที่รายการเพื่อไฮไลท์และเล็งตำแหน่งหมุดบนผังอาคาร หรือปรับปรุงสถานะงาน
                </p>
              </div>

              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาหัวข้อ / ผู้แจ้ง / โซน..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="ALL">สถานะทั้งหมด</option>
                  <option value="รอแก้ไข">⏳ รอแก้ไข</option>
                  <option value="กำลังดำเนินการ">🔧 กำลังดำเนินการ</option>
                  <option value="แก้ไขแล้ว">✅ แก้ไขแล้ว</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="ALL">ความรุนแรงทั้งหมด</option>
                  <option value="วิกฤต">🔴 วิกฤต</option>
                  <option value="สูง">🟠 สูง</option>
                  <option value="ปานกลาง">🟡 ปานกลาง</option>
                  <option value="ต่ำ">🟢 ต่ำ</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="ALL">ประเภททั้งหมด</option>
                  <option value="เครื่องจักร/อุปกรณ์">เครื่องจักร/อุปกรณ์</option>
                  <option value="ระบบไฟฟ้า/ความร้อน">ระบบไฟฟ้า/ความร้อน</option>
                  <option value="สารเคมี/ความปลอดภัย">สารเคมี/ความปลอดภัย</option>
                  <option value="พื้นลื่น/ทางเดิน">พื้นลื่น/ทางเดิน</option>
                  <option value="โครงสร้าง/อาคาร">โครงสร้าง/อาคาร</option>
                  <option value="ระบบป้องกันอัคคีภัย">ระบบป้องกันอัคคีภัย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
                  <th className="p-3.5 text-center w-12">ไอคอน</th>
                  <th className="p-3.5">หัวข้อจุดเสี่ยง / โซนผังอาคาร</th>
                  <th className="p-3.5">ประเภทความเสี่ยง</th>
                  <th className="p-3.5 text-center">ระดับความรุนแรง</th>
                  <th className="p-3.5">ผู้แจ้ง / เวลา</th>
                  <th className="p-3.5">ผู้รับผิดชอบ</th>
                  <th className="p-3.5 text-center">สถานะ</th>
                  <th className="p-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredPins.map((pin) => {
                  const isSelected = selectedPinId === pin.id;

                  // Severity badge UI
                  let sevBadge = null;
                  if (pin.severity === 'ต่ำ') {
                    sevBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700 font-medium">
                        ต่ำ
                      </span>
                    );
                  } else if (pin.severity === 'ปานกลาง') {
                    sevBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-700 font-medium">
                        ปานกลาง
                      </span>
                    );
                  } else if (pin.severity === 'สูง') {
                    sevBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-orange-100 text-orange-700 font-medium">
                        สูง
                      </span>
                    );
                  } else {
                    sevBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-700 font-bold">
                        วิกฤต
                      </span>
                    );
                  }

                  // Status badge UI
                  let statusBadge = null;
                  if (pin.status === 'รอแก้ไข') {
                    statusBadge = (
                      <span className="px-2 py-1 rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                        รอแก้ไข
                      </span>
                    );
                  } else if (pin.status === 'กำลังดำเนินการ') {
                    statusBadge = (
                      <span className="px-2 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        กำลังดำเนินการ
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="px-2 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        แก้ไขแล้ว
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={pin.id}
                      className={`hover:bg-slate-50 transition border-b border-slate-100 ${
                        isSelected ? 'bg-indigo-50/70' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <div
                          onClick={() => handleFocusPin(pin)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto cursor-pointer transition ${
                            pin.status === 'แก้ไขแล้ว'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-rose-100 text-rose-600 hover:scale-105'
                          }`}
                          title="คลิกเพื่อเล็งตำแหน่งบนผัง"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </td>

                      <td
                        className="p-3.5 cursor-pointer"
                        onClick={() => handleFocusPin(pin)}
                      >
                        <div className="font-semibold text-slate-900 hover:text-indigo-600 transition">
                          {pin.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{pin.locationName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            X:{pin.x}, Y:{pin.y}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600">{pin.category}</td>

                      <td className="p-3.5 text-center">{sevBadge}</td>

                      <td className="p-3.5">
                        <div className="text-slate-800 font-medium">{pin.author}</div>
                        <div className="text-[11px] text-slate-400">{pin.timestamp}</div>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {pin.assignedTo ? (
                          <span className="text-slate-700 font-medium flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-slate-400" />
                            <span>{pin.assignedTo}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">ยังไม่มอบหมาย</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {currentMode === 'admin' ? (
                          <select
                            value={pin.status}
                            onChange={(e) =>
                              handleUpdateStatus(pin.id, e.target.value as HazardStatus)
                            }
                            className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="รอแก้ไข">รอแก้ไข</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="แก้ไขแล้ว">แก้ไขแล้ว</option>
                          </select>
                        ) : (
                          statusBadge
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => setInspectingPin(pin)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="ดูรายละเอียด / บันทึกผลซ่อม"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleFocusPin(pin)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                          title="ชี้เป้าบนผัง"
                        >
                          <MapPin className="w-4 h-4 inline" />
                        </button>
                        {currentMode === 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm('คุณต้องการลบรายการจุดเสี่ยงนี้ใช่หรือไม่?')) {
                                handleDeletePin(pin.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPins.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium">ไม่พบรายการจุดเสี่ยงที่ตรงกับเงื่อนไขการค้นหา</p>
              <p className="text-xs text-slate-400">
                ลองปรับเปลี่ยนคำค้นหา หรือคลิกบนผังอาคารเพื่อเริ่มปักหมุดแจ้งเหตุใหม่
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © 2026 ระบบบริหารจัดการความปลอดภัยด้วยผังอาคารจริง — {FLOOR_PLAN_CONFIG.name}
          </div>
          <div className="flex items-center gap-4">
            <span>งานบริการผ้าและอาคารสถานที่</span>
            <span>·</span>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="text-slate-600 hover:underline"
            >
              ช่วยเหลือ
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Add New Hazard Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddPin}
        initialCoords={newReportCoords}
      />

      {/* MODAL 2: Hazard Detail & Admin Resolution Modal */}
      <DetailModal
        pin={inspectingPin}
        isOpen={inspectingPin !== null}
        onClose={() => setInspectingPin(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeletePin}
        onFocusPin={handleFocusPin}
      />

      {/* MODAL 3: User Guide & Instructions Modal */}
      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 transform transition-all duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 text-xs border border-slate-700 animate-bounce">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
