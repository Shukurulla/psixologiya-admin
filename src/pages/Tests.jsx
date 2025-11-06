import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { FileText, Plus, Edit2, Trash2, Power, X, Save, Minus } from 'lucide-react';
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
      // Format questions with proper IDs
      const formattedQuestions = formData.questions.map((q, idx) => ({
        id: idx + 1,
        text: q.text,
        options: q.options.map((opt, optIdx) => ({
          value: optIdx,
          label: opt.label,
          score: parseInt(opt.score) || 0,
        })),
      }));

      // Format interpretations
      const formattedInterpretations = formData.interpretation.map((interp) => ({
        minScore: parseInt(interp.minScore),
        maxScore: parseInt(interp.maxScore),
        level: interp.level,
        description: interp.description,
        severity: interp.severity || 'normal',
      }));

      const submitData = {
        ...formData,
        questions: formattedQuestions,
        interpretation: formattedInterpretations,
      };

      await adminApi.createTest(submitData);
      setShowCreateModal(false);
      fetchTests();
      resetForm();
      alert('Test muvaffaqiyatli yaratildi!');
    } catch (error) {
      console.error('Create error:', error);
      alert('Xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const formattedQuestions = formData.questions.map((q, idx) => ({
        id: q.id || idx + 1,
        text: q.text,
        options: q.options.map((opt, optIdx) => ({
          value: typeof opt.value !== 'undefined' ? opt.value : optIdx,
          label: opt.label,
          score: parseInt(opt.score) || 0,
        })),
      }));

      const formattedInterpretations = formData.interpretation.map((interp) => ({
        minScore: parseInt(interp.minScore),
        maxScore: parseInt(interp.maxScore),
        level: interp.level,
        description: interp.description,
        severity: interp.severity || 'normal',
      }));

      const submitData = {
        ...formData,
        questions: formattedQuestions,
        interpretation: formattedInterpretations,
      };

      await adminApi.updateTest(selectedTest._id, submitData);
      setShowEditModal(false);
      fetchTests();
      resetForm();
      alert('Test muvaffaqiyatli yangilandi!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = async (test) => {
    try {
      const response = await adminApi.getTestById(test._id);
      console.log('Full response:', response);
      console.log('Response data:', response.data);

      // Backend returns { success: true, data: testObject }
      const testData = response.data?.data || response.data;
      console.log('Test data extracted:', testData);

      if (!testData) {
        alert('Test ma\'lumotlari topilmadi');
        return;
      }

      // Convert old format (min/max) to new format (minScore/maxScore) if needed
      const interpretations = (testData.interpretation || []).map(interp => ({
        minScore: interp.minScore || interp.min || 0,
        maxScore: interp.maxScore || interp.max || 0,
        level: interp.level || '',
        description: interp.description || '',
        severity: interp.severity || 'normal',
      }));

      console.log('Formatted interpretations:', interpretations);
      console.log('Questions:', testData.questions);

      setSelectedTest(testData);
      setFormData({
        code: testData.code || '',
        name: testData.name || '',
        description: testData.description || '',
        instruction: testData.instruction || '',
        estimatedTime: testData.estimatedTime || 10,
        isActive: testData.isActive ?? true,
        isSensitive: testData.isSensitive ?? false,
        scoringMethod: testData.scoringMethod || 'sum',
        questions: testData.questions || [],
        interpretation: interpretations,
      });

      console.log('Form data set:', {
        code: testData.code,
        name: testData.name,
        questionsCount: testData.questions?.length,
        interpretationsCount: interpretations.length,
      });

      setShowEditModal(true);
    } catch (error) {
      console.error('Fetch test error:', error);
      alert('Xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
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
    });
    setSelectedTest(null);
  };

  // Question management
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          options: [
            { label: '', score: 0 },
            { label: '', score: 0 },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push({ label: '', score: 0 });
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  // Interpretation management
  const addInterpretation = () => {
    setFormData({
      ...formData,
      interpretation: [
        ...formData.interpretation,
        {
          minScore: 0,
          maxScore: 0,
          level: '',
          description: '',
          severity: 'normal',
        },
      ],
    });
  };

  const removeInterpretation = (index) => {
    const newInterpretation = formData.interpretation.filter((_, i) => i !== index);
    setFormData({ ...formData, interpretation: newInterpretation });
  };

  const updateInterpretation = (index, field, value) => {
    const newInterpretation = [...formData.interpretation];
    newInterpretation[index][field] = value;
    setFormData({ ...formData, interpretation: newInterpretation });
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
              className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
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

              {/* Form */}
              <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Asosiy ma'lumotlar</h3>

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
                  </div>

                  {/* Questions Section */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Savollar</h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <Plus size={18} />
                        <span className="text-sm font-medium">Savol qo'shish</span>
                      </button>
                    </div>

                    {formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Savol {qIndex + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus size={18} />
                          </button>
                        </div>

                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="2"
                          placeholder="Savol matni..."
                          required
                        />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Variantlar</label>
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              <Plus size={16} />
                              <span>Variant</span>
                            </button>
                          </div>

                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => updateOption(qIndex, oIndex, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Variant matni..."
                                required
                              />
                              <input
                                type="number"
                                value={option.score}
                                onChange={(e) => updateOption(qIndex, oIndex, 'score', e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ball"
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interpretation Section */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Natijalar tahlili</h3>
                      <button
                        type="button"
                        onClick={addInterpretation}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
                      >
                        <Plus size={18} />
                        <span className="text-sm font-medium">Tahlil qo'shish</span>
                      </button>
                    </div>

                    {formData.interpretation.map((interp, iIndex) => (
                      <div key={iIndex} className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Tahlil {iIndex + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeInterpretation(iIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Dan (ball)</label>
                            <input
                              type="number"
                              value={interp.minScore}
                              onChange={(e) => updateInterpretation(iIndex, 'minScore', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Gacha (ball)</label>
                            <input
                              type="number"
                              value={interp.maxScore}
                              onChange={(e) => updateInterpretation(iIndex, 'maxScore', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="10"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Daraja</label>
                            <select
                              value={interp.severity}
                              onChange={(e) => updateInterpretation(iIndex, 'severity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required
                            >
                              <option value="normal">Normal</option>
                              <option value="mild">Engil</option>
                              <option value="moderate">O'rtacha</option>
                              <option value="severe">Og'ir</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Sarlavha</label>
                          <input
                            type="text"
                            value={interp.level}
                            onChange={(e) => updateInterpretation(iIndex, 'level', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Masalan: Normal, Xavotir belgilari, va h.k."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tavsif / Xulosa</label>
                          <textarea
                            value={interp.description}
                            onChange={(e) => updateInterpretation(iIndex, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="3"
                            placeholder="Bu ball oralig'i uchun tahlil va tavsiyalar..."
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center space-x-3">
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
