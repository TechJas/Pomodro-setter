import React, { useState } from 'react';
import { Plus, Calendar, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { SecureUserData, saveSecureUserData } from '../utils/secureStorage';

interface ExamPlannerProps {
  userData: SecureUserData;
  sessionToken: string;
  onUserDataUpdate: (userData: SecureUserData) => void;
}

interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

const ExamPlanner: React.FC<ExamPlannerProps> = ({ userData: initialUserData, sessionToken, onUserDataUpdate }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const examData: Exam = {
      id: editingExam?.id || Date.now().toString(),
      subject: formData.subject,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      notes: formData.notes
    };

    let updatedExams;
    if (editingExam) {
      updatedExams = userData.exams.map(exam => 
        exam.id === editingExam.id ? examData : exam
      );
    } else {
      updatedExams = [...userData.exams, examData];
    }

    const updatedUserData = {
      ...userData,
      exams: updatedExams
    };

    const success = saveSecureUserData(updatedUserData, sessionToken);
    if (success) {
      setUserData(updatedUserData);
      onUserDataUpdate(updatedUserData);
    }
    
    setFormData({ subject: '', date: '', time: '', location: '', notes: '' });
    setShowAddForm(false);
    setEditingExam(null);
  };

  const handleEdit = (exam: Exam) => {
    setFormData({
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      location: exam.location || '',
      notes: exam.notes || ''
    });
    setEditingExam(exam);
    setShowAddForm(true);
  };

  const handleDelete = (examId: string) => {
    const updatedUserData = {
      ...userData,
      exams: userData.exams.filter(exam => exam.id !== examId)
    };
    
    const success = saveSecureUserData(updatedUserData, sessionToken);
    if (success) {
      setUserData(updatedUserData);
      onUserDataUpdate(updatedUserData);
    }
  };

  const getExamStatus = (exam: Exam) => {
    const examDate = new Date(`${exam.date} ${exam.time}`);
    const now = new Date();
    const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { status: 'passed', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (daysUntil === 0) return { status: 'today', color: 'text-red-600', bg: 'bg-red-100' };
    if (daysUntil <= 3) return { status: 'urgent', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (daysUntil <= 7) return { status: 'soon', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'upcoming', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getStatusText = (exam: Exam) => {
    const examDate = new Date(`${exam.date} ${exam.time}`);
    const now = new Date();
    const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'Passed';
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow';
    return `${daysUntil} days`;
  };

  const upcomingExams = userData.exams
    .filter(exam => new Date(`${exam.date} ${exam.time}`) >= new Date())
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const pastExams = userData.exams
    .filter(exam => new Date(`${exam.date} ${exam.time}`) < new Date())
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Exam Planner</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Exam</span>
          </button>
        </div>
        
        <p className="text-gray-600">
          Keep track of your upcoming exams and stay prepared, {userData.displayName}!
        </p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingExam ? 'Edit Exam' : 'Add New Exam'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Additional notes or reminders..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                {editingExam ? 'Update Exam' : 'Add Exam'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingExam(null);
                  setFormData({ subject: '', date: '', time: '', location: '', notes: '' });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Upcoming Exams</span>
          </h3>
          
          <div className="space-y-3">
            {upcomingExams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-emerald-200 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{exam.subject}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {getStatusText(exam)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{exam.time}</span>
                      </div>
                      {exam.location && (
                        <span>{exam.location}</span>
                      )}
                    </div>
                    
                    {exam.notes && (
                      <p className="text-sm text-gray-500 mt-2">{exam.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Exams</h3>
          
          <div className="space-y-3">
            {pastExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 opacity-75"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-700">{exam.subject}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Completed
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{exam.time}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userData.exams.length === 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-12 border border-emerald-100 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exams Scheduled</h3>
          <p className="text-gray-600 mb-4">
            Add your first exam to start planning your study schedule!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            Add Your First Exam
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamPlanner;