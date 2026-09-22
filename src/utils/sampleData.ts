import { Transaction } from '../types';
import { getTodayDateString } from './formatters';

export function generateSampleTransactions(userId: string = 'demo_user'): Transaction[] {
  const today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: 'demo-1',
      userId,
      type: 'income',
      amount: 45000,
      category: 'เงินเดือน',
      date: getPastDate(1),
      note: 'เงินเดือนประจำเดือน',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      userId,
      type: 'income',
      amount: 6500,
      category: 'รายได้เสริม',
      date: getPastDate(3),
      note: 'รับงานฟรีแลนซ์ออกแบบเว็บไซต์',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      userId,
      type: 'expense',
      amount: 12000,
      category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
      date: getPastDate(2),
      note: 'ค่าเช่าคอนโด + ค่าน้ำไฟ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      userId,
      type: 'expense',
      amount: 450,
      category: 'อาหารและเครื่องดื่ม',
      date: getPastDate(0),
      note: 'มื้อเที่ยงกับเพื่อนร่วมงาน',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      userId,
      type: 'expense',
      amount: 890,
      category: 'การเดินทาง/น้ำมัน',
      date: getPastDate(1),
      note: 'เติมน้ำมันรถยนต์',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-6',
      userId,
      type: 'expense',
      amount: 1590,
      category: 'ช้อปปิ้ง/ของใช้',
      date: getPastDate(4),
      note: 'ซื้อของใช้เข้าบ้าน',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-7',
      userId,
      type: 'income',
      amount: 3200,
      category: 'การลงทุน/ปันผล',
      date: getPastDate(5),
      note: 'เงินปันผลกองทุนรวม',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-8',
      userId,
      type: 'expense',
      amount: 520,
      category: 'บันเทิง/สังสรรค์',
      date: getPastDate(6),
      note: 'ดูภาพยนตร์รอบค่ำ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-9',
      userId,
      type: 'expense',
      amount: 350,
      category: 'อาหารและเครื่องดื่ม',
      date: getPastDate(7),
      note: 'กาแฟและขนมคาเฟ่',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-10',
      userId,
      type: 'expense',
      amount: 2500,
      category: 'ครอบครัว/พ่อแม่',
      date: getPastDate(8),
      note: 'โอนให้คุณแม่ประจำสัปดาห์',
      createdAt: new Date().toISOString(),
    },
  ];
}
