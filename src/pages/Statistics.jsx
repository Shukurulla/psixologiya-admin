import { useState, useEffect } from "react";
import { adminApi } from "../services/adminApi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Users,
  School,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Eye,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Test -> Faculties modal
  const [selectedTest, setSelectedTest] = useState(null);
  const [testFaculties, setTestFaculties] = useState([]);

  // Faculty -> Groups modal
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyGroups, setFacultyGroups] = useState([]);

  // Group -> Students modal
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);

  // Student -> Details modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await adminApi.getTestStatistics();
      console.log("Statistics response:", response);
      const data = response.data?.data || response.data || [];
      setStatistics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Statistics error:", error);
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = async (test) => {
    setSelectedTest(test);
    try {
      // Get all test results for this test
      const response = await adminApi.getTestResults({ testId: test._id });
      console.log("Test results response:", response);
      const results =
        response.data?.results || response.data?.data?.results || [];

      // Group by faculty
      const facultyMap = {};
      results.forEach((result) => {
        const deptName = result.department?.name || "Noma'lum";
        if (!facultyMap[deptName]) {
          facultyMap[deptName] = {
            departmentName: deptName,
            departmentId: result.department?.id || result.department?.code,
            studentCount: 0,
            completedTests: 0,
            results: [],
          };
        }
        facultyMap[deptName].completedTests++;
        facultyMap[deptName].results.push(result);
      });

      // Count unique students per faculty
      Object.keys(facultyMap).forEach((key) => {
        const uniqueStudents = new Set(
          facultyMap[key].results.map((r) => r.student?._id)
        );
        facultyMap[key].studentCount = uniqueStudents.size;
      });

      setTestFaculties(Object.values(facultyMap));
    } catch (error) {
      console.error("Test results error:", error);
      setTestFaculties([]);
    }
  };

  const handleFacultyClick = async (faculty) => {
    setSelectedFaculty(faculty);
    try {
      // Group results by group
      const groupMap = {};
      faculty.results.forEach((result) => {
        const groupName = result.group?.name || "Noma'lum";
        if (!groupMap[groupName]) {
          groupMap[groupName] = {
            groupName: groupName,
            groupId: result.group?.id || result.group?.code,
            studentCount: 0,
            completedTests: 0,
            results: [],
          };
        }
        groupMap[groupName].completedTests++;
        groupMap[groupName].results.push(result);
      });

      // Count unique students per group
      Object.keys(groupMap).forEach((key) => {
        const uniqueStudents = new Set(
          groupMap[key].results.map((r) => r.student?._id)
        );
        groupMap[key].studentCount = uniqueStudents.size;
      });

      setFacultyGroups(Object.values(groupMap));
    } catch (error) {
      console.error("Faculty groups error:", error);
      setFacultyGroups([]);
    }
  };

  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    try {
      // Get unique students from results
      const studentMap = {};
      group.results.forEach((result) => {
        const studentId = result.student?._id;
        if (studentId && !studentMap[studentId]) {
          studentMap[studentId] = {
            ...result.student,
            completedTestsCount: 0,
            lastCompleted: result.completedAt,
          };
        }
        if (studentId) {
          studentMap[studentId].completedTestsCount++;
          if (
            new Date(result.completedAt) >
            new Date(studentMap[studentId].lastCompleted)
          ) {
            studentMap[studentId].lastCompleted = result.completedAt;
          }
        }
      });

      setGroupStudents(Object.values(studentMap));
    } catch (error) {
      console.error("Group students error:", error);
      setGroupStudents([]);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    try {
      const [detailsRes, resultsRes] = await Promise.all([
        adminApi.getStudentById(student._id),
        adminApi.getStudentResults(student._id),
      ]);
      setStudentDetails({
        ...(detailsRes.data?.data || detailsRes.data),
        results: resultsRes.data?.data || resultsRes.data,
      });
    } catch (error) {
      console.error("Student details error:", error);
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner border-purple-600"></div>
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileText className="text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Statistika topilmadi
        </h2>
        <p className="text-gray-500">
          Hozircha test statistikalari mavjud emas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Statistika</h1>
        <p className="text-gray-500 mt-1">Test bo'yicha batafsil statistika</p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statistics.map((test, index) => (
          <motion.div
            key={test._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleTestClick(test)}
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
              {test.testName}
            </h3>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jami topshirgan</span>
                <span className="text-sm font-semibold text-gray-800">
                  {test.completedCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">E'tibor talab</span>
                <span className="text-sm font-semibold text-red-600">
                  {test.needsAttentionCount || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Test Faculties Modal */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center  p-4 z-50"
            onClick={() => setSelectedTest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-7xl w-full h-[80vh] flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b rounded-xl border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedTest.testName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Fakultetlar bo'yicha statistika
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {testFaculties.length === 0 ? (
                  <div className="text-center py-12">
                    <School className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-500">
                      Bu test uchun ma'lumot topilmadi
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testFaculties.map((faculty) => (
                      <div
                        key={faculty.departmentName}
                        onClick={() => handleFacultyClick(faculty)}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <School className="text-purple-600" size={20} />
                            <h3 className="font-semibold text-gray-800">
                              {faculty.departmentName}
                            </h3>
                          </div>
                          <ChevronRight
                            className="text-purple-600 group-hover:translate-x-1 transition-transform"
                            size={20}
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Talabalar:</span>
                            <span className="font-semibold text-gray-800">
                              {faculty.studentCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Topshirgan:</span>
                            <span className="font-semibold text-purple-600">
                              {faculty.completedTests}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Faculty Groups Modal */}
      <AnimatePresence>
        {selectedFaculty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedFaculty(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-7xl w-full h-[80vh] flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedFaculty.departmentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Guruhlar bo'yicha statistika
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {facultyGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen
                      className="text-gray-400 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-gray-500">Guruhlar topilmadi</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facultyGroups.map((group) => (
                      <div
                        key={group.groupName}
                        onClick={() => handleGroupClick(group)}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="text-blue-600" size={20} />
                            <h3 className="font-semibold text-gray-800">
                              {group.groupName}
                            </h3>
                          </div>
                          <ChevronRight
                            className="text-purple-600 group-hover:translate-x-1 transition-transform"
                            size={20}
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Talabalar:</span>
                            <span className="font-semibold text-gray-800">
                              {group.studentCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Topshirgan:</span>
                            <span className="font-semibold text-blue-600">
                              {group.completedTests}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Students Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-7xl w-full h-[80vh] flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedGroup.groupName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Talabalar ro'yxati
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {groupStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-500">Talabalar topilmadi</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {groupStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentClick(student)}
                        className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col items-center space-y-1 mb-2">
                          {student.image ? (
                            <img
                              src={student.image}
                              alt={student.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center"
                            style={{ display: student.image ? "none" : "flex" }}
                          >
                            <span className="text-white font-semibold text-lg">
                              {student.full_name?.charAt(0) || "T"}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-800 text-xs line-clamp-1">
                              {student.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.student_id_number}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-purple-600">
                            {student.completedTestsCount || 0} test
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && studentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Talaba ma'lumotlari
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  {studentDetails.image ? (
                    <img
                      src={studentDetails.image}
                      alt={studentDetails.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center"
                    style={{ display: studentDetails.image ? "none" : "flex" }}
                  >
                    <span className="text-white font-bold text-2xl">
                      {studentDetails.full_name?.charAt(0) || "T"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {studentDetails.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {studentDetails.student_id_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {studentDetails.department?.name} -{" "}
                      {studentDetails.group?.name}
                    </p>
                  </div>
                </div>

                {/* HEMIS Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">GPA</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {studentDetails.avg_gpa || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Kurs</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {typeof studentDetails.level === "object" &&
                      studentDetails.level?.name
                        ? studentDetails.level.name
                        : typeof studentDetails.level === "string"
                        ? studentDetails.level
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Semestr</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {typeof studentDetails.semester === "object" &&
                      studentDetails.semester?.name
                        ? studentDetails.semester.name
                        : typeof studentDetails.semester === "number"
                        ? `${studentDetails.semester}-semestr`
                        : studentDetails.semester || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Ta'lim turi</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {typeof studentDetails.educationType === "object" &&
                      studentDetails.educationType?.name
                        ? studentDetails.educationType.name
                        : typeof studentDetails.educationType === "string"
                        ? studentDetails.educationType
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Test Results */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Barcha test natijalari
                  </h3>
                  {studentDetails.results &&
                  studentDetails.results.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetails.results.map((result) => (
                        <div
                          key={result._id}
                          className="bg-gray-50 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-800">
                              {result.test?.name}
                            </p>
                            <span
                              className={`
                                px-3 py-1 rounded-full text-xs font-medium
                                ${
                                  result.needsAttention
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }
                              `}
                            >
                              {result.needsAttention
                                ? "E'tibor talab"
                                : "Normal"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              Ball: {result.scores?.total || 0}
                            </span>
                            <span className="text-gray-500">
                              {format(
                                new Date(result.completedAt),
                                "dd.MM.yyyy"
                              )}
                            </span>
                          </div>
                          {result.interpretation && (
                            <p className="mt-2 text-xs text-gray-600">
                              {result.interpretation.level}:{" "}
                              {result.interpretation.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText
                        className="text-gray-400 mx-auto mb-2"
                        size={48}
                      />
                      <p className="text-gray-500">Test natijalari topilmadi</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Statistics;
