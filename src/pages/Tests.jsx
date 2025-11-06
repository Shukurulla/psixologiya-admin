import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { FileText, Plus, Edit2, Trash2, Eye, Power, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    instruction: '',
    estimatedTime: 10,
    isActive: true,
    isSensitive: false,
    scoringMethod: 'sum',
    questions: [],
    interpretation: [],
    categories: [],
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await adminApi.getTests();
      console.log('Tests response:', response);
      const data = response.data?.data || response.data || [];
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Tests error:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      await adminApi.toggleTestStatus(testId);
      fetchTests();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (testId, testName) => {
    if (window.confirm(`"${testName}" testni o'chirishga ishonchingiz komilmi?`)) {
      try {
        await adminApi.deleteTest(testId);
        fetchTests();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Xatolik yuz berdi');
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createTest(formData);
      setShowCreateModal(false);
      fetchTests();
      resetForm();
    } catch (error) {
      console.error('Create error:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateTest(selectedTest._id, formData);
      setShowEditModal(false);
      fetchTests();
      resetForm();
    } catch (error) {
      console.error('Update error:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const openEditModal = async (test) => {
    try {
      const response = await adminApi.getTestById(test._id);
      setSelectedTest(response.data);
      setFormData({
        code: response.data.code || '',
        name: response.data.name || '',
        description: response.data.description || '',
        instruction: response.data.instruction || '',
        estimatedTime: response.data.estimatedTime || 10,
        isActive: response.data.isActive ?? true,
        isSensitive: response.data.isSensitive ?? false,
        scoringMethod: response.data.scoringMethod || 'sum',
        questions: response.data.questions || [],
        interpretation: response.data.interpretation || [],
        categories: response.data.categories || [],
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Fetch test error:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      instruction: '',
      estimatedTime: 10,
      isActive: true,
      isSensitive: false,
      scoringMethod: 'sum',
      questions: [],
      interpretation: [],
      categories: [],
    });
    setSelectedTest(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Testlar</h1>
          <p className="text-gray-500 mt-1">Psixologik testlarni boshqarish</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 gradient-purple text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          <span className="font-medium">Yangi test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test, index) => (
          <motion.div
            key={test._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(test._id)}
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                    ${test.isActive
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title={test.isActive ? 'Faol' : 'Nofaol'}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
              {test.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {test.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Savollar:</span>
                <span className="font-semibold text-gray-800">
                  {test.questions?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vaqt:</span>
                <span className="font-semibold text-gray-800">
                  {test.estimatedTime} daqiqa
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Metod:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {test.scoringMethod}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {test.isActive && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                  Faol
                </span>
              )}
              {test.isSensitive && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-lg">
                  Maxfiy
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openEditModal(test)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 size={16} />
                <span className="text-sm font-medium">Tahrirlash</span>
              </button>
              <button
                onClick={() => handleDelete(test._id, test.name)}
                className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full my-8"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-800">
                  {showCreateModal ? 'Yangi test yaratish' : 'Testni tahrirlash'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test kodi *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="HADS"
                      required
                      disabled={showEditModal}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bajarilish vaqti (daqiqa) *
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Hospital Anxiety and Depression Scale"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Test haqida qisqacha ma'lumot..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ko'rsatma
                  </label>
                  <textarea
                    value={formData.instruction}
                    onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Testni bajarishdan oldin talabaga ko'rsatma..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hisoblash usuli *
                  </label>
                  <select
                    value={formData.scoringMethod}
                    onChange={(e) => setFormData({ ...formData, scoringMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="sum">Yig'indi (Sum)</option>
                    <option value="category">Kategoriya (Category)</option>
                    <option value="custom">Maxsus (Custom)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Faol</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSensitive}
                      onChange={(e) => setFormData({ ...formData, isSensitive: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Maxfiy test</span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Eslatma:</strong> Savollar, javoblar va interpretatsiyalarni qo'shish uchun
                    backend orqali to'liq API'dan foydalaning yoki JSON formatida import qiling.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 gradient-purple text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Save size={20} />
                    <span className="font-medium">{showCreateModal ? 'Yaratish' : 'Saqlash'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tests;
