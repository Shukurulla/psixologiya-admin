import { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Tabs,
  Empty,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { adminApi } from "../services/adminApi";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const AppointmentsAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await adminApi.getAppointments();
      const appointmentData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setAppointments(appointmentData);
    } catch (error) {
      console.error("Arizalarni yuklashda xatolik:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);

    if (appointment.status === "approved") {
      form.setFieldsValue({
        status: appointment.status,
        appointmentDate: appointment.appointmentDate
          ? dayjs(appointment.appointmentDate)
          : null,
        appointmentTime: appointment.appointmentTime
          ? dayjs(appointment.appointmentTime, "HH:mm")
          : null,
        psychologistNote: appointment.psychologistNote,
      });
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.updateAppointmentStatus(selectedAppointment._id, {
        status: values.status,
        appointmentDate:
          values.status === "approved" && values.appointmentDate
            ? values.appointmentDate.format("YYYY-MM-DD")
            : undefined,
        appointmentTime:
          values.status === "approved" && values.appointmentTime
            ? values.appointmentTime.format("HH:mm")
            : undefined,
        psychologistNote: values.psychologistNote,
        rejectionReason:
          values.status === "rejected" ? values.rejectionReason : undefined,
      });
      message.success("Ariza holati yangilandi");
      setShowModal(false);
      form.resetFields();
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      message.error(error?.response?.data?.error || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: {
        color: "gold",
        icon: <SyncOutlined spin />,
        text: "Kutilmoqda",
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Tasdiqlangan",
      },
      rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Rad etilgan",
      },
      completed: {
        color: "blue",
        icon: <CheckCircleOutlined />,
        text: "Yakunlangan",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const filterAppointmentsByStatus = (status) => {
    return appointments.filter((app) => app.status === status);
  };

  const AppointmentCards = ({ appointments: filteredAppointments }) => {
    if (filteredAppointments.length === 0) {
      return (
        <div className="py-12">
          <Empty description="Arizalar yo'q" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment, index) => (
          <motion.div
            key={appointment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="hover:shadow-lg transition-shadow h-full"
              actions={[
                <Button
                  key="review"
                  size="small"
                  type="primary"
                  onClick={() => handleUpdateStatus(appointment)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {appointment.status === "pending"
                    ? "Ko'rib chiqish"
                    : "Tahrirlash"}
                </Button>,
              ]}
            >
              <div className="space-y-3">
                {/* Student Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {appointment.student?.image ? (
                      <img
                        src={appointment.student.image}
                        alt={appointment.student.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserOutlined className="text-gray-400 text-lg" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {appointment.student?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.student?.student_id_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.student?.group?.name}
                      </p>
                    </div>
                  </div>
                  {getStatusTag(appointment.status)}
                </div>

                {/* Reason */}
                <div>
                  <p className="text-sm font-medium text-gray-600">Sabab:</p>
                  <p className="text-base font-semibold text-gray-800">
                    {appointment.reason}
                  </p>
                </div>

                {/* Description */}
                {appointment.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Batafsil:
                    </p>
                    <p className="text-sm text-gray-700">
                      {appointment.description}
                    </p>
                  </div>
                )}

                {/* Preferred Date/Time */}
                {appointment.preferredDate && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Taklif etilgan:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-1 text-gray-500" />
                        {format(
                          new Date(appointment.preferredDate),
                          "dd MMM yyyy",
                          { locale: uz }
                        )}
                      </div>
                      {appointment.preferredTime && (
                        <div className="flex items-center">
                          <ClockCircleOutlined className="mr-1 text-gray-500" />
                          {appointment.preferredTime}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Approved Date/Time */}
                {appointment.appointmentDate && (
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Tasdiqlangan:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-green-700">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-1" />
                        {format(
                          new Date(appointment.appointmentDate),
                          "dd MMM yyyy",
                          { locale: uz }
                        )}
                      </div>
                      {appointment.appointmentTime && (
                        <div className="flex items-center">
                          <ClockCircleOutlined className="mr-1" />
                          {appointment.appointmentTime}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                  Yaratilgan:{" "}
                  {format(
                    new Date(appointment.createdAt),
                    "dd MMM yyyy, HH:mm",
                    { locale: uz }
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const tabItems = [
    {
      key: "pending",
      label: `Kutilmoqda (${filterAppointmentsByStatus("pending").length})`,
      children: (
        <AppointmentCards
          appointments={filterAppointmentsByStatus("pending")}
        />
      ),
    },
    {
      key: "approved",
      label: `Tasdiqlangan (${
        filterAppointmentsByStatus("approved").length
      })`,
      children: (
        <AppointmentCards
          appointments={filterAppointmentsByStatus("approved")}
        />
      ),
    },
    {
      key: "completed",
      label: `Yakunlangan (${filterAppointmentsByStatus("completed").length})`,
      children: (
        <AppointmentCards
          appointments={filterAppointmentsByStatus("completed")}
        />
      ),
    },
    {
      key: "rejected",
      label: `Rad etilgan (${filterAppointmentsByStatus("rejected").length})`,
      children: (
        <AppointmentCards
          appointments={filterAppointmentsByStatus("rejected")}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Qabulga yozilishlar
        </h1>
        <p className="text-gray-500 mt-1">
          Talabalarning qabulga yozilish arizalarini boshqarish
        </p>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Update Status Modal */}
      <Modal
        title="Arizani ko'rib chiqish"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
          setSelectedAppointment(null);
        }}
        footer={null}
        width={700}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            {/* Student Info */}
            <Card size="small" className="bg-gray-50">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Talaba: </span>
                  {selectedAppointment.student?.full_name}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedAppointment.student?.student_id_number} •{" "}
                  {selectedAppointment.student?.group?.name}
                </div>
                <div>
                  <span className="font-semibold">Sabab: </span>
                  {selectedAppointment.reason}
                </div>
                {selectedAppointment.description && (
                  <div>
                    <span className="font-semibold">Batafsil: </span>
                    {selectedAppointment.description}
                  </div>
                )}
              </div>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Holat"
                name="status"
                rules={[{ required: true, message: "Holatni tanlang" }]}
                initialValue={selectedAppointment.status}
              >
                <Select>
                  <Option value="pending">Kutilmoqda</Option>
                  <Option value="approved">Tasdiqlash</Option>
                  <Option value="rejected">Rad etish</Option>
                  <Option value="completed">Yakunlangan</Option>
                </Select>
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  getFieldValue("status") === "approved" && (
                    <>
                      <Form.Item
                        label="Qabul sanasi"
                        name="appointmentDate"
                        rules={[
                          { required: true, message: "Sanani tanlang" },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          format="DD.MM.YYYY"
                          placeholder="Sanani tanlang"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Qabul vaqti"
                        name="appointmentTime"
                        rules={[
                          { required: true, message: "Vaqtni tanlang" },
                        ]}
                      >
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          placeholder="Vaqtni tanlang"
                          minuteStep={30}
                        />
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  getFieldValue("status") === "rejected" && (
                    <Form.Item
                      label="Rad etish sababi"
                      name="rejectionReason"
                      rules={[
                        { required: true, message: "Sabab kiriting" },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nima sababdan rad etildi..."
                      />
                    </Form.Item>
                  )
                }
              </Form.Item>

              <Form.Item label="Izoh (ixtiyoriy)" name="psychologistNote">
                <TextArea rows={3} placeholder="Qo'shimcha izoh..." />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowModal(false)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Saqlash
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentsAdmin;
