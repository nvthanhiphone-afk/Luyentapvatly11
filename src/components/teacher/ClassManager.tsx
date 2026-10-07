import React, { useState } from 'react';
import { School, Plus, Users, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ClassGroup } from '../../types';

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>(StorageService.getClasses());
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const students = StorageService.getStudents();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) return;

    const newGroup: ClassGroup = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      description: newDescription.trim(),
    };

    StorageService.saveClass(newGroup);
    setClasses(StorageService.getClasses());
    setNewClassName('');
    setNewClassCode('');
    setNewDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
      StorageService.deleteClass(id);
      setClasses(StorageService.getClasses());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Danh Sách Lớp Học</h2>
          <p className="text-xs text-slate-500">
            Tạo mã lớp để học sinh nhập khi làm bài, giúp lọc kết quả chính xác theo từng lớp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-sky-600" />
            <span>Thêm Lớp Mới</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên lớp (VD: 11A1, 11A4)</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Lớp 11A4"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã lớp (Học sinh nhập)</label>
              <input
                type="text"
                required
                value={newClassCode}
                onChange={e => setNewClassCode(e.target.value)}
                placeholder="PHY11A4"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-sky-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mô tả hoặc ghi chú</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Khối chuyên lý hoặc tự nhiên"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 py-2.5 font-bold text-white hover:bg-sky-700 transition-colors shadow-md shadow-sky-600/20"
            >
              TẠO LỚP HỌC MỚI
            </button>
          </form>
        </div>

        {/* Classes List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(c => {
              const studentCount = students.filter(
                s => s.class_id === c.id || s.class_name?.toLowerCase() === c.name.toLowerCase()
              ).length;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-slate-900">{c.name}</span>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Mã: {c.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.description || 'Không có mô tả'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{studentCount} học sinh đã tham gia</span>
                    </div>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Xóa lớp"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
