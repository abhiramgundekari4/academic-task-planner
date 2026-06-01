import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import Profile from "./Profile";
import { API, getToken } from "./api";

function App() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isFaculty = userRole === "admin" || (token && (token.includes("admin") || token.includes("faculty")));

  // active tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  // state for form fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedFaculty, setAssignedFaculty] = useState("");

  // faculty state and add form input state values
  const [faculties, setFaculties] = useState([]);
  const [facName, setFacName] = useState("");
  const [facSubject, setFacSubject] = useState("");
  const [facEmail, setFacEmail] = useState("");
  const [facCabin, setFacCabin] = useState("");

  // state for task list and student details
  const [tasks, setTasks] = useState([]);
  const [student, setStudent] = useState({
    name: "Student",
    email: "",
    course: "",
    year: "",
    branch: "",

  });

  // class schedule state values
  const [scheduleClasses, setScheduleClasses] = useState([]);
  const [scheduleDay, setScheduleDay] = useState("Monday");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedSubject, setSchedSubject] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedRoom, setSchedRoom] = useState("");
  const [schedFaculty, setSchedFaculty] = useState("");

  // methods to load data from backend
  const fetchTasks = () => {
    if (!token) return;
    if (token.startsWith("mock-")) {
      try {
        const stored = localStorage.getItem("smart_task_manager_local_tasks");
        if (stored) {
          setTasks(JSON.parse(stored));
        } else {
          const defaultTasks = [
            { _id: "t1", title: "Review CS302 Database Lecture notes", type: "task", priority: "high", completed: false, dueDate: "2026-06-05", assignedFaculty: "Dr. K. Srinivas" },
            { _id: "t2", title: "Complete Machine Learning Lab 3 Assignment", type: "assignment", priority: "medium", completed: false, dueDate: "2026-06-10", assignedFaculty: "Dr. A. Reddy" }
          ];
          setTasks(defaultTasks);
          localStorage.setItem("smart_task_manager_local_tasks", JSON.stringify(defaultTasks));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    fetch(`${API}/api/tasks`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          setTasks([]);
        }
      })
      .catch((err) => console.log(err));
  };

  const fetchProfile = () => {
    if (!token) return;
    if (token.startsWith("mock-")) {
      try {
        const stored = localStorage.getItem("smart_task_manager_local_profile");
        if (stored) {
          setStudent(JSON.parse(stored));
        } else {
          const email = localStorage.getItem("userEmail") || "";
          const name = localStorage.getItem("userName") || "";
          const defaultProfile = {
            name: name || "Student User",
            email: email || "",
            course: "",
            year: "",
            branch: "",
          
          };
          setStudent(defaultProfile);
          localStorage.setItem("smart_task_manager_local_profile", JSON.stringify(defaultProfile));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    fetch(`${API}/api/profile`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.msg) {
          setStudent(data);
        }
      })
      .catch((err) => console.log(err));
  };

  const fetchFaculties = () => {
    if (!token) return;
    if (token.startsWith("mock-")) {
      try {
        const stored = localStorage.getItem("smart_task_manager_local_faculties");
        if (stored) {
          setFaculties(JSON.parse(stored));
        } else {
          const defaultFaculties = [
            { _id: "f1", name: "Dr. K. Srinivas", subject: "DBMS", email: "srinivas.k@gmail.com", cabin: "Block A - 304" },
            { _id: "f2", name: "Dr. A. Reddy", subject: "Machine Learning", email: "reddy.a@gmail.com", cabin: "Block C - 102" }
          ];
          setFaculties(defaultFaculties);
          localStorage.setItem("smart_task_manager_local_faculties", JSON.stringify(defaultFaculties));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    fetch(`${API}/api/faculty`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaculties(data);
        } else {
          setFaculties([]);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchProfile();
      fetchFaculties();
    }

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load schedule from localStorage or set timetable defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("smart_task_manager_schedule");
      if (stored) {
        setScheduleClasses(JSON.parse(stored));
      } else {
        const DEFAULT_CLASSES = [
          { id: "c1", subject: "Database Management Systems (DBMS)", timeSlot: "09:00 AM - 10:00 AM", room: "Room 304, Block-A", faculty: "Dr. K. Srinivas", day: "Monday" },
          { id: "c2", subject: "Design & Analysis of Algorithms", timeSlot: "10:15 AM - 11:15 AM", room: "Room 102, Block-B", faculty: "Prof. R. Sharma", day: "Monday" },
          { id: "c3", subject: "Machine Learning Fundamentals", timeSlot: "01:30 PM - 03:00 PM", room: "ML Lab, Block-C", faculty: "Dr. A. Reddy", day: "Tuesday" },
          { id: "c4", subject: "Data Structures & OOPs", timeSlot: "11:30 AM - 12:30 PM", room: "CS Lab 3, Block-A", faculty: "Mrs. S. Lakshmi", day: "Wednesday" },
          { id: "c5", subject: "Database Management Systems (DBMS)", timeSlot: "09:00 AM - 10:00 AM", room: "Room 304, Block-A", faculty: "Dr. K. Srinivas", day: "Thursday" },
          { id: "c6", subject: "Machine Learning Fundamentals", timeSlot: "01:30 PM - 03:00 PM", room: "ML Lab, Block-C", faculty: "Dr. A. Reddy", day: "Friday" }
        ];
        setScheduleClasses(DEFAULT_CLASSES);
        localStorage.setItem("smart_task_manager_schedule", JSON.stringify(DEFAULT_CLASSES));
      }
    } catch (e) {
      console.error("Failed to load schedule", e);
    }
  }, []);

  const saveScheduleToStorage = (updatedList) => {
    setScheduleClasses(updatedList);
    try {
      localStorage.setItem("smart_task_manager_schedule", JSON.stringify(updatedList));
    } catch (e) {
      console.error("Failed to save schedule", e);
    }
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!schedSubject || !schedTime || !schedRoom || !schedFaculty) return;

    const newClass = {
      id: "c-" + Date.now(),
      subject: schedSubject,
      timeSlot: schedTime,
      room: schedRoom,
      faculty: schedFaculty,
      day: scheduleDay,
    };

    const updated = [...scheduleClasses, newClass];
    saveScheduleToStorage(updated);

    setSchedSubject("");
    setSchedTime("");
    setSchedRoom("");
    setSchedFaculty("");
    setShowScheduleForm(false);
  };

  const handleDeleteClass = (id) => {
    const updated = scheduleClasses.filter((c) => c.id !== id);
    saveScheduleToStorage(updated);
  };

  // save new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    if (token.startsWith("mock-")) {
      const newTask = {
        _id: "task-" + Date.now(),
        title: taskTitle,
        type: taskType,
        priority: priority,
        dueDate: dueDate || null,
        assignedFaculty: assignedFaculty,
        completed: false
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem("smart_task_manager_local_tasks", JSON.stringify(updated));
      setTaskTitle("");
      setDueDate("");
      setAssignedFaculty("");
      setPriority("medium");
      return;
    }

    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          title: taskTitle,
          type: taskType,
          priority: priority,
          dueDate: dueDate || null,
          assignedFaculty: assignedFaculty
        }),
      });

      const data = await res.json();
      if (data && data._id) {
        setTasks([data, ...tasks]);
        setTaskTitle("");
        setDueDate("");
        setAssignedFaculty("");
        setPriority("medium");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // delete task
  const handleDeleteTask = async (id) => {
    if (token.startsWith("mock-")) {
      const updated = tasks.filter((t) => t._id !== id);
      setTasks(updated);
      localStorage.setItem("smart_task_manager_local_tasks", JSON.stringify(updated));
      return;
    }

    try {
      await fetch(`${API}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // toggle completion status
  const handleToggleTask = async (id) => {
    if (token.startsWith("mock-")) {
      const updated = tasks.map((t) =>
        t._id === id ? { ...t, completed: !t.completed } : t
      );
      setTasks(updated);
      localStorage.setItem("smart_task_manager_local_tasks", JSON.stringify(updated));
      return;
    }

    try {
      await fetch(`${API}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      });
      setTasks(
        tasks.map((t) =>
          t._id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // save new faculty member
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!facName) return;

    if (token.startsWith("mock-")) {
      const newFac = {
        _id: "fac-" + Date.now(),
        name: facName,
        subject: facSubject,
        email: facEmail,
        cabin: facCabin
      };
      const updated = [...faculties, newFac];
      setFaculties(updated);
      localStorage.setItem("smart_task_manager_local_faculties", JSON.stringify(updated));
      setFacName("");
      setFacSubject("");
      setFacEmail("");
      setFacCabin("");
      return;
    }

    try {
      const res = await fetch(`${API}/api/faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: facName,
          subject: facSubject,
          email: facEmail,
          cabin: facCabin
        }),
      });

      const data = await res.json();
      if (data && data._id) {
        setFaculties([...faculties, data]);
        setFacName("");
        setFacSubject("");
        setFacEmail("");
        setFacCabin("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // delete faculty member record
  const handleDeleteFaculty = async (id) => {
    if (token.startsWith("mock-")) {
      const updated = faculties.filter((f) => f._id !== id);
      setFaculties(updated);
      localStorage.setItem("smart_task_manager_local_faculties", JSON.stringify(updated));
      return;
    }

    try {
      await fetch(`${API}/api/faculty/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      });
      setFaculties(faculties.filter((f) => f._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // logout session
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  // auth gate
  if (!token) return <Auth />;

  // calculations for stats and dashboard widgets
  const totalItems = tasks.length;
  const completedItems = tasks.filter((t) => t.completed).length;
  const pendingItems = totalItems - completedItems;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const totalTasks = tasks.filter((t) => t.type !== "assignment").length;
  const completedTasks = tasks.filter((t) => t.type !== "assignment" && t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const totalAssignments = tasks.filter((t) => t.type === "assignment").length;
  const completedAssignments = tasks.filter((t) => t.type === "assignment" && t.completed).length;
  const pendingAssignments = totalAssignments - completedAssignments;

  // count prioritised items
  const highPriorityCount = tasks.filter((t) => t.priority === "high" && !t.completed).length;
  const medPriorityCount = tasks.filter((t) => t.priority === "medium" && !t.completed).length;
  const lowPriorityCount = tasks.filter((t) => t.priority === "low" && !t.completed).length;

  // get non-completed deadlines sorted by closeness
  const getUpcomingItems = () => {
    return tasks
      .filter((t) => !t.completed && t.dueDate)
      .map((t) => {
        const diffTime = new Date(t.dueDate) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...t, daysRemaining: diffDays };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const upcomingItems = getUpcomingItems();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col md:flex-row relative font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-800">
      {/* left sidebar panel */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 font-sans">
        <div className="space-y-8">
          {/* brand header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">STM</span>
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-gray-800 text-lg">
                Task Manager
              </h1>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">
                Academic Planner
              </span>
            </div>
          </div>

          {/* quick profile details */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center text-sm font-bold text-gray-700">
              S
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-gray-800 text-sm truncate">{student.name}</h4>
              <p className="text-[10px] text-blue-600 font-semibold truncate">
                {student.branch || "Academic Student"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {isFaculty ? (
                  <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Admin View</span>
                ) : (
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Student View</span>
                )}
              </div>
              
            </div>
          </div>

          {/* navigation buttons */}
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none text-gray-700">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "dashboard"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "tasks"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Task Manager</span>
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "assignments"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Assignments</span>
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "schedule"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Class Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab("faculty")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "faculty"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Faculty Directory</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="md:inline">Profile Settings</span>
            </button>
          </nav>
        </div>

        {/* sidebar bottom area */}
        <div className="pt-6 border-t border-gray-200 flex md:flex-col gap-4 justify-between items-center md:items-stretch">
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition cursor-pointer text-center active:scale-[0.98] border-none"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* right main panel */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        
        {/* dashboard tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* title */}
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Workspace Summary</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Student Dashboard</h2>
            </div>

            {/* cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-blue-300 transition">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Tasks</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-gray-800">{pendingTasks}</span>
                  <span className="text-xs text-gray-500">pending</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-blue-300 transition">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assignments</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-gray-800">{pendingAssignments}</span>
                  <span className="text-xs text-gray-500">active</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-blue-300 transition">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completion Rate</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-emerald-600">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-gray-500">overall</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-blue-300 transition">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Saved Classes</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-blue-600">{scheduleClasses.length}</span>
                  <span className="text-xs text-gray-500">weekly</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(scheduleClasses.length * 15, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* visual workload stats & deadlines */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* charts section */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Academic Analytics</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Visual workload & progress metric dashboards</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6">
                  {/* donut completion ring */}
                  <div className="relative w-40 h-40 flex items-center justify-center select-none">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      {/* track circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      {/* completed circle arc */}
                      {totalItems > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="12"
                          strokeDasharray={2 * Math.PI * 60}
                          strokeDashoffset={2 * Math.PI * 60 * (1 - (completedItems / totalItems))}
                          className="transition-all duration-1000 ease-out"
                        />
                      )}
                    </svg>
                    <div className="text-center">
                      <span className="block text-2xl font-black text-gray-800">{completionRate}%</span>
                      <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* legend keys */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded bg-blue-500"></div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Finished Tasks
                        </span>
                        <span className="text-sm font-bold text-gray-700">{completedItems} Items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded bg-gray-200 border border-gray-300"></div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Pending Tasks
                        </span>
                        <span className="text-sm font-bold text-gray-700">{pendingItems} Items</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* priority percentage bars */}
                <div className="border-t border-gray-200 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Priority Workload Distribution
                  </h4>
                  
                  {/* High priority */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-gray-600">High Priority</span>
                      <span className="font-bold text-red-500">{highPriorityCount} Tasks</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${totalItems > 0 ? (highPriorityCount / totalItems) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Med priority */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-gray-600">Medium Priority</span>
                      <span className="font-bold text-orange-500">{medPriorityCount} Tasks</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${totalItems > 0 ? (medPriorityCount / totalItems) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Low priority */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-gray-600">Low Priority</span>
                      <span className="font-bold text-green-500">{lowPriorityCount} Tasks</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${totalItems > 0 ? (lowPriorityCount / totalItems) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* upcoming submissions and deadlines */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-800">Upcoming Academic Deadlines</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Track assignments and tasks sorted by due dates</p>
                </div>

                <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                  {upcomingItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                      <h4 className="font-bold text-gray-600 text-sm mt-2">Zero Deadlines Approaching</h4>
                      <p className="text-xs text-gray-400 mt-1">Awesome! No tasks have upcoming schedules.</p>
                    </div>
                  ) : (
                    upcomingItems.map((item) => {
                      const isOverdue = item.daysRemaining < 0;
                      let daysText = "";
                      let alertColorClass = "";

                      if (isOverdue) {
                        daysText = "OVERDUE";
                        alertColorClass = "bg-red-50 text-red-600 border border-red-200";
                      } else if (item.daysRemaining === 0) {
                        daysText = "DUE TODAY";
                        alertColorClass = "bg-orange-50 text-orange-600 border border-orange-200 animate-pulse";
                      } else if (item.daysRemaining === 1) {
                        daysText = "Tomorrow";
                        alertColorClass = "bg-blue-50 text-blue-600 border border-blue-200";
                      } else {
                        daysText = `${item.daysRemaining} days left`;
                        alertColorClass = "bg-gray-100 text-gray-600 border border-gray-200";
                      }

                      return (
                        <div
                          key={item._id}
                          className="bg-white border border-gray-200 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition shadow-sm"
                        >
                          <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                  item.type === "assignment" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {item.type}
                              </span>
                              <h5 className="font-bold text-xs text-gray-800 truncate">{item.title}</h5>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                              {item.assignedFaculty && (
                                <span className="bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                  Faculty: {item.assignedFaculty}
                                </span>
                              )}
                              <span>Due: {item.dueDate.split("T")[0]}</span>
                            </div>
                          </div>

                          <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${alertColorClass} shrink-0`}>
                            {daysText}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* tasks manager tab */}
        {activeTab === "tasks" && (
          <div className="space-y-8 animate-fadeIn">
            {/* header section */}
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Academic Tasks</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">General Tasks</h2>
            </div>

            {/* create task form */}
            {isFaculty && (
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>➕</span> Create New Task Record
                </h3>
                
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end text-sm">
                  {/* input field */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Task Title
                    </label>
                    <input
                      required
                      value={taskTitle}
                      onChange={(e) => {
                        setTaskTitle(e.target.value);
                        setTaskType("task"); // force type task under tasks manager
                      }}
                      placeholder="E.g., Complete Mathematics Lab Record..."
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Priority */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-600 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Faculty */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Assigned Faculty (Optional)
                    </label>
                    <select
                      value={assignedFaculty}
                      onChange={(e) => setAssignedFaculty(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="">No Faculty</option>
                      {faculties.map((f) => (
                        <option key={f._id} value={f.name}>
                          {f.name} ({f.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-600 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    />
                  </div>

                  {/* Button */}
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* tasks checkboxes checklist */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-800">📋 Academic Task Checklist</h3>
              
              <div className="space-y-2 text-sm">
                {tasks.filter((t) => t.type !== "assignment").length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    <span className="text-4xl"></span>
                    <h4 className="font-bold text-gray-600 text-sm mt-3">Zero General Tasks Loaded</h4>
                    <p className="text-xs text-gray-400 mt-1">Ready to chill? Write a task in the builder to begin.</p>
                  </div>
                ) : (
                  tasks
                    .filter((t) => t.type !== "assignment")
                    .map((item) => (
                      <div
                        key={item._id}
                        className="bg-white border border-gray-250 p-4 rounded-xl flex items-center justify-between gap-4 transition hover:border-blue-300 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleTask(item._id)}
                            className="w-5 h-5 rounded border-gray-350 bg-white text-blue-500 focus:ring-0 focus:outline-none transition cursor-pointer shrink-0"
                          />
                          <div className="space-y-1.5 overflow-hidden">
                            <p
                              className={`text-sm font-bold text-gray-800 transition truncate ${
                                item.completed ? "line-through text-gray-400 font-semibold" : ""
                              }`}
                            >
                              {item.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-medium">
                              {/* Priority Badge */}
                              <span
                                className={`px-2 py-0.5 rounded font-bold uppercase ${
                                  item.priority === "high"
                                    ? "bg-red-50 text-red-600"
                                    : item.priority === "medium"
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-green-50 text-green-600"
                                }`}
                              >
                                {item.priority}
                              </span>

                              {/* Faculty Badge */}
                              {item.assignedFaculty && (
                                <span className="bg-gray-50 border border-gray-250 px-2 py-0.5 rounded text-gray-600 font-bold">
                                  👨‍🏫 {item.assignedFaculty}
                                </span>
                              )}

                              {/* Date */}
                              <span>📅 {item.dueDate ? item.dueDate.split("T")[0] : "No deadline"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {isFaculty && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteTask(item._id)}
                              className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 px-3 py-1.5 rounded-lg font-bold transition active:scale-[0.98] cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-8 animate-fadeIn">
            {/* subject header */}
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Academic Syllabus</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Course Assignments</h2>
            </div>

            {/* create new assignment */}
            {isFaculty && (
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  File New Academic Assignment
                </h3>
                
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end text-sm">
                  {/* title field */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Assignment Subject / Title
                    </label>
                    <input
                      required
                      value={taskTitle}
                      onChange={(e) => {
                        setTaskTitle(e.target.value);
                        setTaskType("assignment"); // force type assignment under assignments manager
                      }}
                      placeholder="E.g., Artificial Intelligence Term Sheet..."
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Priority */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-600 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Faculty */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Assigned Faculty
                    </label>
                    <select
                      required
                      value={assignedFaculty}
                      onChange={(e) => setAssignedFaculty(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="">Select Faculty...</option>
                      {faculties.map((f) => (
                        <option key={f._id} value={f.name}>
                          {f.name} ({f.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Submission Deadline
                    </label>
                    <input
                      required
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-600 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    />
                  </div>

                  {/* Button */}
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                    >
                      File
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* pending list */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-800">Pending Assignments & Term Works</h3>
              
              <div className="space-y-2 text-sm">
                {tasks.filter((t) => t.type === "assignment").length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    <h4 className="font-bold text-gray-600 text-sm mt-3">No Course Assignments</h4>
                    <p className="text-xs text-gray-400 mt-1">Excellent! All academic submissions are fully clear.</p>
                  </div>
                ) : (
                  tasks
                    .filter((t) => t.type === "assignment")
                    .map((item) => (
                      <div
                        key={item._id}
                        className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 transition hover:border-blue-300 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleTask(item._id)}
                            className="w-5 h-5 rounded border border-gray-300 bg-white text-blue-500 focus:ring-0 focus:outline-none transition cursor-pointer shrink-0"
                          />
                          <div className="space-y-1.5 overflow-hidden">
                            <p
                              className={`text-sm font-bold text-gray-800 transition truncate ${
                                item.completed ? "line-through text-gray-400 font-semibold" : ""
                              }`}
                            >
                              {item.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-medium">
                              {/* Priority Badge */}
                              <span
                                className={`px-2 py-0.5 rounded font-bold uppercase ${
                                  item.priority === "high"
                                    ? "bg-red-50 text-red-600"
                                    : item.priority === "medium"
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-green-50 text-green-600"
                                }`}
                              >
                                {item.priority}
                              </span>

                              {/* Faculty Badge */}
                              {item.assignedFaculty && (
                                <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-blue-500 font-bold">
                                  Faculty: {item.assignedFaculty}
                                </span>
                              )}

                              {/* Date */}
                              <span>Deadline: {item.dueDate ? item.dueDate.split("T")[0] : "No deadline"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {isFaculty && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteTask(item._id)}
                              className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg font-bold transition active:scale-[0.98] cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* class schedule tab */}
        {activeTab === "schedule" && (
          <div className="space-y-8 animate-fadeIn">
            {/* title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Timetable Planner</span>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Class Schedule</h2>
                <p className="text-xs text-gray-500 mt-2">Manage and view your weekly classroom schedule, room locations, and assigned faculty members.</p>
              </div>

              {isFaculty && !showScheduleForm && (
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition active:scale-[0.98]"
                >
                  ➕ Add Class
                </button>
              )}
            </div>

            {/* Day Selector */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto scrollbar-none gap-1 shadow-sm text-sm">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    setScheduleDay(day);
                    setShowScheduleForm(false);
                  }}
                  className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider transition-all text-center ${
                    scheduleDay === day
                      ? "bg-blue-500 text-white shadow-sm font-extrabold"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Timeline list */}
              <div className="lg:col-span-2 space-y-3">
                {scheduleClasses.filter((c) => c.day === scheduleDay).length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    <span className="text-4xl">📚</span>
                    <h4 className="font-bold text-gray-650 text-sm mt-3">No Classes Scheduled</h4>
                    <p className="text-xs text-gray-400 mt-1">No classes saved for {scheduleDay}. Click Add Class to begin.</p>
                  </div>
                ) : (
                  scheduleClasses
                    .filter((c) => c.day === scheduleDay)
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 p-4 rounded-xl flex items-start justify-between gap-4 transition hover:border-blue-300 shadow-sm"
                      >
                        <div className="space-y-2 overflow-hidden">
                          <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            <span className="text-blue-500 text-base">📘</span>
                            <span>{item.subject}</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">⏱️</span>
                              <span>{item.timeSlot}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-gray-400">🏢</span>
                              <span>Room: {item.room}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-gray-400">👨‍🏫</span>
                              <span>Prof: {item.faculty}</span>
                            </div>
                          </div>
                        </div>

                        {isFaculty && (
                          <button
                            onClick={() => handleDeleteClass(item.id)}
                            className="p-1.5 rounded-lg border border-gray-250 hover:bg-red-50 text-gray-400 hover:text-red-500 transition shrink-0"
                            title="Remove Class"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))
                )}
              </div>

              {/* Side Panel form or helper */}
              <div className="space-y-4">
                {isFaculty && showScheduleForm ? (
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Add {scheduleDay} Class</h4>
                      <button
                        onClick={() => setShowScheduleForm(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddClass} className="space-y-3.5 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-gray-600">Subject Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Database Management Systems"
                          value={schedSubject}
                          onChange={(e) => setSchedSubject(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition font-normal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-600">Time Slot</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 09:00 AM - 10:00 AM"
                          value={schedTime}
                          onChange={(e) => setSchedTime(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition font-normal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-600">Classroom Location</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Room 304, Block-A"
                          value={schedRoom}
                          onChange={(e) => setSchedRoom(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition font-normal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-600">Assigned Instructor</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. K. Srinivas"
                          value={schedFaculty}
                          onChange={(e) => setSchedFaculty(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition font-normal"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl mt-2 transition active:scale-[0.98] cursor-pointer text-center"
                      >
                        Save Entry
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Class schedule utility</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      Outline your daily classroom timeslots and coordinate your academic assignment deadlines with your schedule and teaching professors!
                    </p>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500 leading-normal">
                      Persists locally on your computer automatically. Fully type-safe and built to run offline.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* student profile tab */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
            {/* title header */}
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Student Identity</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Profile Configuration</h2>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
              <Profile />
            </div>
          </div>
        )}

        {/* faculty directory tab */}
        {activeTab === "faculty" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Faculty Directory</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Administrator Registry</h2>
            </div>

            {/* Add Faculty Form */}
            {isFaculty && (
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  Add New Faculty Member
                </h3>
                
                <form onSubmit={handleAddFaculty} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end text-sm">
                  {/* name */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Faculty Name
                    </label>
                    <input
                      required
                      value={facName}
                      onChange={(e) => setFacName(e.target.value)}
                      placeholder="E.g., Dr. Smith"
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-855 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* subject */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Subject / Department
                    </label>
                    <input
                      value={facSubject}
                      onChange={(e) => setFacSubject(e.target.value)}
                      placeholder="E.g., Artificial Intelligence"
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-855 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* email */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={facEmail}
                      onChange={(e) => setFacEmail(e.target.value)}
                      placeholder="E.g., smith@gmail.com"
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-855 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* cabin */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Cabin Location
                    </label>
                    <input
                      value={facCabin}
                      onChange={(e) => setFacCabin(e.target.value)}
                      placeholder="E.g., Block A - 302"
                      className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3.5 text-xs text-gray-855 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Faculty List Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-850">Saved Teachers</h3>
              
              {faculties.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                  <h4 className="font-bold text-gray-650 text-sm">Roster is Empty</h4>
                  <p className="text-xs text-gray-400 mt-1">No faculty records saved. Add teachers above to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faculties.map((f) => (
                    <div
                      key={f._id}
                      className="bg-white border border-gray-200 hover:border-blue-300 p-5 rounded-2xl transition duration-300 relative group flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-gray-800 text-base">{f.name}</h4>
                            {f.subject && (
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">{f.subject}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600">
                          {f.email && (
                            <p className="flex items-center gap-2 truncate">
                              <span className="text-gray-400">Email:</span>
                              <a href={`mailto:${f.email}`} className="hover:underline hover:text-blue-500 transition text-gray-700">
                                {f.email}
                              </a>
                            </p>
                          )}
                          {f.cabin && (
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">Cabin:</span>
                              <span>{f.cabin}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {isFaculty && (
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={() => handleDeleteFaculty(f._id)}
                            className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-655 px-3 py-1.5 rounded-lg font-bold transition active:scale-[0.98] cursor-pointer"
                          >
                            Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;