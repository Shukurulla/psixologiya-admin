import { useState, useEffect } from "react";
import { adminApi } from "../services/adminApi";
import { AlertTriangle, Eye, X, FileText, User, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const NeedsAttention = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStudentsNeedingAttention();
  }, []);

  const fetchStudentsNeedingAttention = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStudents({
        needsAttention: "true",
        limit: 100,
      });
      const data = response.data?.data?.students || response.data?.students || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch students error:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const [detailsRes, resultsRes, statsRes] = await Promise.all([
        adminApi.getStudentById(student._id),
        adminApi.getStudentResults(student._id),
        adminApi.getStudentStatistics(student._id),
      ]);

      setStudentDetails({
        ...(detailsRes.data?.data || detailsRes.data),
        results: resultsRes.data?.data || resultsRes.data || [],
        statistics: statsRes.data?.data || statsRes.data || {},
      });
    } catch (error) {
      console.error("Student details error:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReview = async (resultId) => {
    try {
      await adminApi.reviewTestResult(resultId, {
        adminNotes: "Ko'rib chiqildi",
      });
      // Refresh the list
      await fetchStudentsNeedingAttention();
      // Close the modal if no more attention items
      if (selectedStudent) {
        await handleStudentClick(selectedStudent);
      }
    } catch (error) {
      console.error("Review error:", error);
    }
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
          <h1 className="text-3xl font-bold text-gray-800">
            E'tibor talab qiladigan talabalar
          </h1>
          <p className="text-gray-500 mt-1">
            Psixologik yordam talab qiluvchi talabalar ro'yxati
          </p>
        </div>
        <div className="bg-red-100 px-4 py-2 rounded-lg">
          <span className="text-red-600 font-semibold">
            {students.length} talaba
          </span>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <AlertTriangle className="text-gray-400 mx-auto mb-4" size={64} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            E'tibor talab qiladigan talabalar topilmadi
          </h2>
          <p className="text-gray-500">
            Hozircha barcha talabalar yaxshi holatda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleStudentClick(student)}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Attention Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {student.attentionCount || 1}
                </div>
              </div>

              {/* Student Image */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {student.image ? (
                    <img
                      src={student.image}
                      alt={student.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl font-bold">
                      {student.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    {student.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {student.student_id_number}
                  </p>
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fakultet:</span>
                  <span className="font-semibold text-gray-800 truncate ml-2">
                    {student.department?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Guruh:</span>
                  <span className="font-semibold text-gray-800">
                    {student.group?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Topshirgan:</span>
                  <span className="font-semibold text-purple-600">
                    {student.completedTests || 0} ta test
                  </span>
                </div>
              </div>

              {/* View Button */}
              <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                <Eye size={18} />
                Batafsil
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setSelectedStudent(null);
              setStudentDetails(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20">
                    {selectedStudent.image ? (
                      <img
                        src={selectedStudent.image}
                        alt={selectedStudent.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                        {selectedStudent.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedStudent.full_name}
                    </h2>
                    <p className="text-purple-100">
                      {selectedStudent.student_id_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentDetails(null);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="spinner border-purple-600"></div>
                  </div>
                ) : studentDetails ? (
                  <div className="space-y-6">
                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-800 mb-3">
                        Talaba ma'lumotlari
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Fakultet:</span>
                          <p className="font-semibold">
                            {typeof studentDetails.department === 'object'
                              ? studentDetails.department?.name
                              : studentDetails.department || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Guruh:</span>
                          <p className="font-semibold">
                            {typeof studentDetails.group === 'object'
                              ? studentDetails.group?.name
                              : studentDetails.group || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">O'rtacha GPA:</span>
                          <p className="font-semibold">
                            {studentDetails.avg_gpa || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Kurs:</span>
                          <p className="font-semibold">
                            {typeof studentDetails.level === 'object'
                              ? studentDetails.level?.name
                              : studentDetails.level || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Semestr:</span>
                          <p className="font-semibold">
                            {typeof studentDetails.semester === 'object'
                              ? studentDetails.semester?.name
                              : studentDetails.semester || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ta'lim shakli:</span>
                          <p className="font-semibold">
                            {typeof studentDetails.educationType === 'object'
                              ? studentDetails.educationType?.name
                              : studentDetails.educationType || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Test Results Needing Attention */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        E'tibor talab qiladigan natijalar
                      </h3>
                      <div className="space-y-3">
                        {studentDetails.results
                          .filter((r) => r.needsAttention && !r.isReviewed)
                          .map((result) => (
                            <div
                              key={result._id}
                              className="bg-red-50 border border-red-200 rounded-xl p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FileText size={18} />
                                    {result.test?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Ball: {result.scores?.total || 0}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleReview(result._id)}
                                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                                >
                                  Ko'rib chiqildi
                                </button>
                              </div>
                              {result.interpretation && (
                                <div className="bg-white rounded-lg p-3 mt-2">
                                  <p className="text-sm font-semibold text-red-600 mb-1">
                                    {result.interpretation.level}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {result.interpretation.description}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Calendar size={14} />
                                {format(
                                  new Date(result.completedAt),
                                  "dd.MM.yyyy HH:mm"
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* All Test Results */}
                    {studentDetails.results.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3">
                          Barcha natijalar
                        </h3>
                        <div className="space-y-2">
                          {studentDetails.results.map((result) => (
                            <div
                              key={result._id}
                              className={`rounded-xl p-4 ${
                                result.needsAttention && !result.isReviewed
                                  ? "bg-red-50 border border-red-200"
                                  : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800">
                                    {result.test?.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Ball: {result.scores?.total || 0}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                      result.needsAttention && !result.isReviewed
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {result.needsAttention && !result.isReviewed
                                      ? "E'tibor talab"
                                      : "Normal"}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format(
                                      new Date(result.completedAt),
                                      "dd.MM.yyyy"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Ma'lumot yuklanmadi</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeedsAttention;
