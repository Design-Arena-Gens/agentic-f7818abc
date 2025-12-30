'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, Calendar, BookOpen, ClipboardList, TrendingUp, Download, Upload } from 'lucide-react'

interface Student {
  id: number
  name: string
  class: string
  rollNumber: string
  attendance: { [date: string]: 'present' | 'absent' | 'leave' }
}

interface Teacher {
  id: number
  name: string
  subject: string
  contact: string
  attendance: { [date: string]: 'present' | 'absent' | 'leave' }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'reports'>('dashboard')
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)

  useEffect(() => {
    const savedStudents = localStorage.getItem('students')
    const savedTeachers = localStorage.getItem('teachers')

    if (savedStudents) setStudents(JSON.parse(savedStudents))
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers))
  }, [])

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students))
  }, [students])

  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers))
  }, [teachers])

  const addStudent = (name: string, className: string, rollNumber: string) => {
    const newStudent: Student = {
      id: Date.now(),
      name,
      class: className,
      rollNumber,
      attendance: {}
    }
    setStudents([...students, newStudent])
    setShowAddStudent(false)
  }

  const addTeacher = (name: string, subject: string, contact: string) => {
    const newTeacher: Teacher = {
      id: Date.now(),
      name,
      subject,
      contact,
      attendance: {}
    }
    setTeachers([...teachers, newTeacher])
    setShowAddTeacher(false)
  }

  const markStudentAttendance = (studentId: number, status: 'present' | 'absent' | 'leave') => {
    setStudents(students.map(s =>
      s.id === studentId
        ? { ...s, attendance: { ...s.attendance, [selectedDate]: status } }
        : s
    ))
  }

  const markTeacherAttendance = (teacherId: number, status: 'present' | 'absent' | 'leave') => {
    setTeachers(teachers.map(t =>
      t.id === teacherId
        ? { ...t, attendance: { ...t.attendance, [selectedDate]: status } }
        : t
    ))
  }

  const calculateAttendancePercentage = (attendance: { [date: string]: string }) => {
    const days = Object.values(attendance)
    if (days.length === 0) return 0
    const presentDays = days.filter(d => d === 'present').length
    return Math.round((presentDays / days.length) * 100)
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const studentsPresent = students.filter(s => s.attendance[today] === 'present').length
    const teachersPresent = teachers.filter(t => t.attendance[today] === 'present').length
    const totalStudents = students.length
    const totalTeachers = teachers.length

    return { studentsPresent, teachersPresent, totalStudents, totalTeachers }
  }

  const stats = getTodayStats()

  const exportData = () => {
    const data = { students, teachers, exportDate: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rana-hazir-hai-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.students) setStudents(data.students)
          if (data.teachers) setTeachers(data.teachers)
          alert('Data imported successfully!')
        } catch (error) {
          alert('Error importing data')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">رانا حاضر ہے</h1>
                <p className="text-blue-100 text-sm">اسکول مینجمنٹ سسٹم</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">ڈیٹا محفوظ کریں</span>
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="text-sm">ڈیٹا لوڈ کریں</span>
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'ڈیش بورڈ', icon: TrendingUp },
              { id: 'students', label: 'طلباء', icon: Users },
              { id: 'teachers', label: 'اساتذہ', icon: BookOpen },
              { id: 'reports', label: 'رپورٹس', icon: ClipboardList }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-4 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">کل طلباء</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">آج موجود طلباء</p>
                    <p className="text-3xl font-bold text-green-600">{stats.studentsPresent}</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">کل اساتذہ</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalTeachers}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">آج موجود اساتذہ</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.teachersPresent}</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                آج کی حاضری
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">طلباء کی حاضری</h3>
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ابھی کوئی طالب علم شامل نہیں</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.class} - {student.rollNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            {['present', 'absent', 'leave'].map(status => (
                              <button
                                key={status}
                                onClick={() => markStudentAttendance(student.id, status as any)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                  student.attendance[selectedDate] === status
                                    ? status === 'present'
                                      ? 'bg-green-500 text-white'
                                      : status === 'absent'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-yellow-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {status === 'present' ? 'حاضر' : status === 'absent' ? 'غیر حاضر' : 'چھٹی'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">اساتذہ کی حاضری</h3>
                  {teachers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ابھی کوئی استاد شامل نہیں</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {teachers.map(teacher => (
                        <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-gray-600">{teacher.subject}</p>
                          </div>
                          <div className="flex gap-2">
                            {['present', 'absent', 'leave'].map(status => (
                              <button
                                key={status}
                                onClick={() => markTeacherAttendance(teacher.id, status as any)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                  teacher.attendance[selectedDate] === status
                                    ? status === 'present'
                                      ? 'bg-green-500 text-white'
                                      : status === 'absent'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-yellow-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {status === 'present' ? 'حاضر' : status === 'absent' ? 'غیر حاضر' : 'چھٹی'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                طلباء کی فہرست
              </h2>
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                + نیا طالب علم شامل کریں
              </button>
            </div>

            {showAddStudent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">نیا طالب علم شامل کریں</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    addStudent(
                      formData.get('name') as string,
                      formData.get('class') as string,
                      formData.get('rollNumber') as string
                    )
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">نام</label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">کلاس</label>
                        <input
                          type="text"
                          name="class"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">رول نمبر</label>
                        <input
                          type="text"
                          name="rollNumber"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        محفوظ کریں
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddStudent(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        منسوخ کریں
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-12">ابھی کوئی طالب علم شامل نہیں</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نام</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">کلاس</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رول نمبر</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">حاضری فیصد</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">کارروائی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.rollNumber}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            calculateAttendancePercentage(student.attendance) >= 75
                              ? 'bg-green-100 text-green-700'
                              : calculateAttendancePercentage(student.attendance) >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {calculateAttendancePercentage(student.attendance)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setStudents(students.filter(s => s.id !== student.id))}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            حذف کریں
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                اساتذہ کی فہرست
              </h2>
              <button
                onClick={() => setShowAddTeacher(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                + نیا استاد شامل کریں
              </button>
            </div>

            {showAddTeacher && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">نیا استاد شامل کریں</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    addTeacher(
                      formData.get('name') as string,
                      formData.get('subject') as string,
                      formData.get('contact') as string
                    )
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">نام</label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">مضمون</label>
                        <input
                          type="text"
                          name="subject"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">رابطہ نمبر</label>
                        <input
                          type="text"
                          name="contact"
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        محفوظ کریں
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTeacher(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        منسوخ کریں
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {teachers.length === 0 ? (
              <p className="text-gray-500 text-center py-12">ابھی کوئی استاد شامل نہیں</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نام</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">مضمون</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رابطہ</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">حاضری فیصد</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">کارروائی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teachers.map(teacher => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{teacher.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{teacher.subject}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{teacher.contact}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            calculateAttendancePercentage(teacher.attendance) >= 75
                              ? 'bg-green-100 text-green-700'
                              : calculateAttendancePercentage(teacher.attendance) >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {calculateAttendancePercentage(teacher.attendance)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setTeachers(teachers.filter(t => t.id !== teacher.id))}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            حذف کریں
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              حاضری کی رپورٹس
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">طلباء کی تفصیلی رپورٹ</h3>
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ابھی کوئی طالب علم شامل نہیں</p>
                ) : (
                  <div className="space-y-4">
                    {students.map(student => {
                      const totalDays = Object.keys(student.attendance).length
                      const presentDays = Object.values(student.attendance).filter(d => d === 'present').length
                      const absentDays = Object.values(student.attendance).filter(d => d === 'absent').length
                      const leaveDays = Object.values(student.attendance).filter(d => d === 'leave').length

                      return (
                        <div key={student.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{student.name}</h4>
                              <p className="text-sm text-gray-600">{student.class} - {student.rollNumber}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full font-bold text-lg ${
                              calculateAttendancePercentage(student.attendance) >= 75
                                ? 'bg-green-100 text-green-700'
                                : calculateAttendancePercentage(student.attendance) >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {calculateAttendancePercentage(student.attendance)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-semibold text-gray-700">{totalDays}</p>
                              <p className="text-gray-600">کل دن</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="font-semibold text-green-700">{presentDays}</p>
                              <p className="text-green-600">حاضر</p>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <p className="font-semibold text-red-700">{absentDays}</p>
                              <p className="text-red-600">غیر حاضر</p>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <p className="font-semibold text-yellow-700">{leaveDays}</p>
                              <p className="text-yellow-600">چھٹی</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">اساتذہ کی تفصیلی رپورٹ</h3>
                {teachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ابھی کوئی استاد شامل نہیں</p>
                ) : (
                  <div className="space-y-4">
                    {teachers.map(teacher => {
                      const totalDays = Object.keys(teacher.attendance).length
                      const presentDays = Object.values(teacher.attendance).filter(d => d === 'present').length
                      const absentDays = Object.values(teacher.attendance).filter(d => d === 'absent').length
                      const leaveDays = Object.values(teacher.attendance).filter(d => d === 'leave').length

                      return (
                        <div key={teacher.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{teacher.name}</h4>
                              <p className="text-sm text-gray-600">{teacher.subject}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full font-bold text-lg ${
                              calculateAttendancePercentage(teacher.attendance) >= 75
                                ? 'bg-green-100 text-green-700'
                                : calculateAttendancePercentage(teacher.attendance) >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {calculateAttendancePercentage(teacher.attendance)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-semibold text-gray-700">{totalDays}</p>
                              <p className="text-gray-600">کل دن</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="font-semibold text-green-700">{presentDays}</p>
                              <p className="text-green-600">حاضر</p>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <p className="font-semibold text-red-700">{absentDays}</p>
                              <p className="text-red-600">غیر حاضر</p>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <p className="font-semibold text-yellow-700">{leaveDays}</p>
                              <p className="text-yellow-600">چھٹی</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p className="font-semibold">رانا حاضر ہے - اسکول مینجمنٹ سسٹم</p>
          <p className="text-sm mt-1">© 2025 - تمام حقوق محفوظ ہیں</p>
        </div>
      </footer>
    </div>
  )
}
