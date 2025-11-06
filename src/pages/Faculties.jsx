import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { School, Users, BookOpen, BarChart3, Eye, X, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyGroups, setFacultyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await adminApi.getFaculties();
      console.log('Faculties response:', response);
      const data = response.data?.data || response.data || [];
      console.log('Faculties data:', data);
      setFaculties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Faculties error:', error);
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyClick = async (faculty) => {
    setSelectedFaculty(faculty);
    try {
      const response = await adminApi.getGroups(faculty.departmentId);
      console.log('Groups response:', response);
      const data = response.data?.data || response.data || [];
      setFacultyGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Groups error:', error);
      setFacultyGroups([]);
    }
  };

  const handleGroupClick = async (group) => {
    console.log('Group clicked:', group);
    setSelectedGroup(group);
    setLoadingStudents(true);
    setGroupStudents([]); // Clear previous students
    try {
      // Backend expects group.name as the "group" parameter
      console.log('Fetching students for group:', group.groupName);
      const response = await adminApi.getStudents({ group: group.groupName });
      console.log('Students response:', response);
      console.log('Response data:', response.data);

      const studentsData = response.data?.students || response.data?.data?.students || response.data?.data || response.data || [];
      console.log('Students data extracted:', studentsData);
      console.log('Is array?', Array.isArray(studentsData));
      console.log('Students count:', studentsData.length);

      setGroupStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Students error:', error);
      console.error('Error details:', error.response?.data);
      setGroupStudents([]);
    } finally {
      setLoadingStudents(false);
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
      console.error('Student details error:', error);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fakultetlar</h1>
        <p className="text-gray-500 mt-1">Fakultet, guruh va talabalar statistikasi</p>
      </div>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty, index) => (
          <motion.div
            key={faculty.departmentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <School className="text-white" size={24} />
              </div>
              <button
                onClick={() => handleFacultyClick(faculty)}
                className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                title="Statistika"
              >
                <BarChart3 size={18} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-2">
              {faculty.departmentName}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Talabalar</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {faculty.studentCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Guruhlar</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {faculty.groupCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Topshirganlar</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {faculty.studentsWithTests || 0} / {faculty.studentCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Bajarilish</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {faculty.completionRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>

            {/* Test stats preview */}
            {faculty.testStats?.slice(0, 3).map((test) => (
              <div key={test.testName} className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500 truncate flex-1">{test.testName}</span>
                <span className="text-gray-700 font-medium ml-2">{test.count}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Faculty Details Modal */}
      <AnimatePresence>
        {selectedFaculty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setSelectedFaculty(null);
              setSelectedGroup(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedFaculty.departmentName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFaculty.studentCount} ta talaba, {facultyGroups.length} ta guruh
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFaculty(null);
                    setSelectedGroup(null);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Faculty Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Test completion chart */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Testlar bo'yicha</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={selectedFaculty.testStats?.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="testName" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Groups pie chart */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Guruhlar taqsimoti</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={facultyGroups.slice(0, 6).map(g => ({
                            name: g.groupName,
                            value: g.students?.length || 0
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {facultyGroups.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Groups List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Guruhlar ro'yxati</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facultyGroups.map((group, index) => (
                      <motion.div
                        key={group.groupId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleGroupClick(group)}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 gradient-green rounded-lg flex items-center justify-center">
                              <BookOpen className="text-white" size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{group.groupName}</p>
                              <p className="text-xs text-gray-500">{group.educationLanguage}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Talabalar:</span>
                            <span className="font-semibold text-gray-800">
                              {group.students?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Topshirganlar:</span>
                            <span className="font-semibold text-purple-600">
                              {group.completionRate?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedGroup.groupName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {groupStudents.length} ta talaba
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {loadingStudents ? (
                  <div className="text-center py-12">
                    <div className="spinner border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Yuklanmoqda...</p>
                  </div>
                ) : groupStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-500">Talabalar topilmadi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupStudents.map((student, index) => (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleStudentClick(student)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={student.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center"
                          style={{ display: student.image ? 'none' : 'flex' }}
                        >
                          <span className="text-white font-semibold">
                            {student.full_name?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.full_name}</p>
                          <p className="text-xs text-gray-500">{student.student_id_number}</p>
                          <p className="text-xs text-gray-500">
                            GPA: {student.avg_gpa || 'N/A'} | Semestr: {student.semester || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            {student.completedTests || 0} test
                          </p>
                          <p className="text-xs text-gray-500">topshirgan</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors">
                            <BarChart3 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]"
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
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center"
                    style={{ display: studentDetails.image ? 'none' : 'flex' }}
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
                      {studentDetails.department?.name} - {studentDetails.group?.name}
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
                    Test natijalari
                  </h3>
                  {studentDetails.results && studentDetails.results.length > 0 ? (
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
                              {result.needsAttention ? "E'tibor talab" : "Normal"}
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
                      <FileText className="text-gray-400 mx-auto mb-2" size={48} />
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

export default Faculties;
