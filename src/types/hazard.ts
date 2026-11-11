export type SeverityLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'วิกฤต';

export type HazardCategory =
  | 'เครื่องจักร/อุปกรณ์'
  | 'ระบบไฟฟ้า/ความร้อน'
  | 'สารเคมี/ความปลอดภัย'
  | 'พื้นลื่น/ทางเดิน'
  | 'โครงสร้าง/อาคาร'
  | 'ระบบป้องกันอัคคีภัย'
  | 'อื่นๆ';

export type HazardStatus = 'รอแก้ไข' | 'กำลังดำเนินการ' | 'แก้ไขแล้ว';

export interface HazardPin {
  id: string;
  title: string;
  category: HazardCategory;
  severity: SeverityLevel;
  desc: string;
  author: string;
  contact?: string;
  status: HazardStatus;
  x: number;
  y: number;
  locationName: string;
  timestamp: string;
  photoUrl?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedPhotoUrl?: string;
}
