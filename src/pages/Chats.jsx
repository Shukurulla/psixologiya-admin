import { useState, useEffect, useRef } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Empty,
  Badge,
  Avatar,
  Tag,
  Spin,
  message as antdMessage,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { adminApi } from "../services/adminApi";

const { TextArea } = Input;

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => fetchChats(true), 5000); // Refresh every 5 seconds without loading spinner
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }

      const response = await adminApi.getChats();
      const chatData = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      // Ensure chats are sorted by lastMessageAt (most recent first)
      const sortedChats = chatData.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt);
        const dateB = new Date(b.lastMessageAt);
        return dateB - dateA; // Descending order
      });

      setChats(sortedChats);

      // Update selected chat if it exists (to show new messages in real-time)
      const currentSelectedChat = selectedChatRef.current;
      if (currentSelectedChat) {
        const updatedChat = sortedChats.find(c => c._id === currentSelectedChat._id);
        if (updatedChat) {
          // Check if there are new unread student messages
          const unreadCount = updatedChat.messages.filter(
            (msg) => msg.sender === "student" && !msg.read
          ).length;

          // If there are unread messages and chat is currently open, mark them as read
          if (unreadCount > 0) {
            try {
              await adminApi.markChatAsRead(updatedChat._id);
              // Fetch again to get updated data with read status
              const refreshResponse = await adminApi.getChats();
              const refreshData = Array.isArray(refreshResponse.data)
                ? refreshResponse.data
                : (refreshResponse.data?.data || []);
              const refreshedChats = refreshData.sort((a, b) => {
                const dateA = new Date(a.lastMessageAt);
                const dateB = new Date(b.lastMessageAt);
                return dateB - dateA;
              });
              setChats(refreshedChats);
              const refreshedChat = refreshedChats.find(c => c._id === currentSelectedChat._id);
              if (refreshedChat) {
                setSelectedChat(refreshedChat);
              }
            } catch (error) {
              console.error("Auto mark as read error:", error);
              setSelectedChat(updatedChat);
            }
          } else {
            setSelectedChat(updatedChat);
          }
        }
      }
    } catch (error) {
      console.error("Chatlarni yuklashda xatolik:", error);
      setChats([]);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    // Mark student messages as read
    const unreadCount = chat.messages.filter(
      (msg) => msg.sender === "student" && !msg.read
    ).length;

    if (unreadCount > 0) {
      try {
        await adminApi.markChatAsRead(chat._id);
        // Refresh chats to update badge counts (without loading spinner)
        fetchChats(true);
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await adminApi.sendChatMessage(selectedChat._id, {
        message: messageText.trim(),
      });
      const updatedChat = response.data?.data || response.data;
      setSelectedChat(updatedChat);
      setMessageText("");
      antdMessage.success("Xabar yuborildi");
      fetchChats(true); // Refresh list without loading spinner
    } catch (error) {
      console.error("Send message error:", error);
      antdMessage.error("Xabar yuborishda xatolik");
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await adminApi.updateChatStatus(chatId, { status: "closed" });
      antdMessage.success("Chat yopildi");
      fetchChats(true); // Refresh list without loading spinner
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      antdMessage.error("Xatolik yuz berdi");
    }
  };

  const handleReopenChat = async (chatId) => {
    try {
      await adminApi.updateChatStatus(chatId, { status: "active" });
      antdMessage.success("Chat qayta ochildi");
      fetchChats(true); // Refresh list without loading spinner
    } catch (error) {
      antdMessage.error("Xatolik yuz berdi");
    }
  };

  const getUnreadCount = (chat) => {
    return chat.messages.filter((msg) => msg.sender === "student" && !msg.read)
      .length;
  };

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
        <h1 className="text-3xl font-bold text-gray-800">Suhbatlar</h1>
        <p className="text-gray-500 mt-1">Talabalar bilan suhbatlarni boshqarish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chats List */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <MessageOutlined />
              <span>Talabalar ({chats.length})</span>
            </div>
          }
          className="lg:col-span-1"
          bodyStyle={{ padding: 0, maxHeight: "600px", overflowY: "auto" }}
        >
          {chats.length === 0 ? (
            <Empty description="Suhbatlar yo'q" className="py-8" />
          ) : (
            <List
              dataSource={chats}
              renderItem={(chat) => {
                const unreadCount = getUnreadCount(chat);
                return (
                  <List.Item
                    className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 ${
                      selectedChat?._id === chat._id ? "bg-purple-50" : ""
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={unreadCount} offset={[-5, 5]}>
                          <Avatar
                            src={chat.student?.image}
                            icon={!chat.student?.image && <UserOutlined />}
                          />
                        </Badge>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {chat.student?.full_name}
                          </span>
                          {chat.status === "closed" && (
                            <Tag color="default" className="text-xs">
                              Yopilgan
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            {chat.student?.student_id_number}
                          </p>
                          {chat.messages.length > 0 && (
                            <p className="text-xs text-gray-600 truncate">
                              {chat.messages[chat.messages.length - 1].message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {format(
                              new Date(chat.lastMessageAt),
                              "dd MMM, HH:mm",
                              { locale: uz }
                            )}
                          </p>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* Chat Messages */}
        <Card
          className="lg:col-span-2"
          title={
            selectedChat ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{selectedChat.student?.full_name}</h3>
                  <p className="text-xs text-gray-500 font-normal">
                    {selectedChat.student?.student_id_number} •{" "}
                    {selectedChat.student?.group?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedChat.status === "active" ? (
                    <Button
                      size="small"
                      onClick={() => handleCloseChat(selectedChat._id)}
                    >
                      Chatni yopish
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleReopenChat(selectedChat._id)}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Qayta ochish
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              "Suhbatni tanlang"
            )
          }
        >
          {!selectedChat ? (
            <Empty
              description="Suhbat tanlanmagan"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              {/* Messages */}
              <div
                className="space-y-3 mb-4 overflow-y-auto"
                style={{ maxHeight: "450px", minHeight: "300px" }}
              >
                {(selectedChat.messages || []).map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "psychologist"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.sender === "psychologist"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm mb-1 break-words">{msg.message}</p>
                      <div className="flex items-center justify-between space-x-2">
                        <p
                          className={`text-xs ${
                            msg.sender === "psychologist"
                              ? "text-purple-100"
                              : "text-gray-500"
                          }`}
                        >
                          {format(new Date(msg.timestamp), "HH:mm, dd MMM", {
                            locale: uz,
                          })}
                        </p>
                        {msg.sender === "psychologist" && msg.read && (
                          <CheckOutlined className="text-xs" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedChat.status === "active" && (
                <div className="flex gap-2">
                  <TextArea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onPressEnter={(e) => {
                      if (e.shiftKey) return;
                      e.preventDefault();
                      handleSend();
                    }}
                    placeholder="Xabaringizni yozing..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={sending}
                    disabled={!messageText.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Yuborish
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chats;
