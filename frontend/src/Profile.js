import React, { useEffect, useState } from "react";
import { API, getToken } from "./api";

function Profile() {
  const token = getToken();
  const isFaculty = token && (token.includes("admin") || token.includes("faculty"));

  // Faculty Admin Profile State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem("smart_task_manager_local_admin_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      dept: "",
      office: "",
      status: "Active Administrator"
    };
  });

  // Student Profile State (managed by student or admin)
  const [student, setStudent] = useState(() => {
    try {
      const stored = localStorage.getItem("smart_task_manager_local_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      course: "",
      year: "",
      branch: "",
      attendance: 0
    };
  });

  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [edit, setEdit] = useState(false);
  const [editAdmin, setEditAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states for Student Details (used by Student or Admin)
  const [studName, setStudName] = useState("");
  const [studCourse, setStudCourse] = useState("");
  const [studYear, setStudYear] = useState("");
  const [studBranch, setStudBranch] = useState("");
  const [studAttendance, setStudAttendance] = useState(0);

  // Form states for Admin Profile (used by Admin)
  const [admName, setAdmName] = useState("");
  const [admDept, setAdmDept] = useState("");
  const [admOffice, setAdmOffice] = useState("");

  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
    const selected = allStudents.find(s => s._id === studentId);
    if (selected) {
      setStudName(selected.name || "");
      setStudCourse(selected.course || "");
      setStudYear(selected.year || "");
      setStudBranch(selected.branch || "");
      setStudAttendance(selected.attendance || 0);
    }
  };

  const fetchProfile = () => {
    // If local mock demo mode, load from localStorage
    if (token === "mock-demo-token" || token === "mock-admin-token") {
      try {
        const stored = localStorage.getItem("smart_task_manager_local_profile");
        if (stored) {
          const currentStudent = JSON.parse(stored);
          setStudent(currentStudent);
          setStudName(currentStudent.name || "");
          setStudCourse(currentStudent.course || "");
          setStudYear(currentStudent.year || "");
          setStudBranch(currentStudent.branch || "");
          setStudAttendance(currentStudent.attendance || 0);
          setAllStudents([currentStudent]);
          setSelectedStudentId("student-mock");
        } else {
          const email = localStorage.getItem("userEmail") || "";
          const name = localStorage.getItem("userName") || "";
          const defaultProfile = {
            name: name || "Student User",
            email: email || "",
            course: "",
            year: "",
            branch: "",
            attendance: 0
          };
          setStudent(defaultProfile);
          setStudName(defaultProfile.name);
          setStudCourse(defaultProfile.course);
          setStudYear(defaultProfile.year);
          setStudBranch(defaultProfile.branch);
          setStudAttendance(defaultProfile.attendance);
          localStorage.setItem("smart_task_manager_local_profile", JSON.stringify(defaultProfile));
        }

        const storedAdmin = localStorage.getItem("smart_task_manager_local_admin_profile");
        if (storedAdmin) {
          const data = JSON.parse(storedAdmin);
          setAdminUser(data);
          setAdmName(data.name || "");
          setAdmDept(data.dept || "");
          setAdmOffice(data.office || "");
        } else {
          const email = localStorage.getItem("userEmail") || "";
          const name = localStorage.getItem("userName") || "";
          const defaultAdmin = {
            name: name || "Admin User",
            email: email || "",
            dept: "",
            office: "",
            status: "Active Administrator"
          };
          setAdminUser(defaultAdmin);
          setAdmName(defaultAdmin.name);
          setAdmDept(defaultAdmin.dept);
          setAdmOffice(defaultAdmin.office);
          localStorage.setItem("smart_task_manager_local_admin_profile", JSON.stringify(defaultAdmin));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // Otherwise hit backend profile endpoints
    fetch(`${API}/api/profile`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.msg) {
          setStudent(data);
          if (!isFaculty) {
            setStudName(data.name || "");
            setStudCourse(data.course || "");
            setStudYear(data.year || "");
            setStudBranch(data.branch || "");
            setStudAttendance(data.attendance || 0);
          }
        }
      })
      .catch((err) => console.log(err));

    // If faculty, fetch all students
    if (isFaculty) {
      fetch(`${API}/api/profile/students`, {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllStudents(data);
            if (data.length > 0) {
              const firstStudent = data[0];
              setSelectedStudentId(firstStudent._id);
              setStudName(firstStudent.name || "");
              setStudCourse(firstStudent.course || "");
              setStudYear(firstStudent.year || "");
              setStudBranch(firstStudent.branch || "");
              setStudAttendance(firstStudent.attendance || 0);
            }
          }
        })
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    fetchProfile();
    
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update student records (Attendance & enrollment details)
  const saveStudentProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (token === "mock-demo-token" || token === "mock-admin-token") {
      const updated = {
        ...student,
        name: studName,
        course: studCourse,
        year: studYear,
        branch: studBranch,
        attendance: Number(studAttendance) || 0
      };
      setStudent(updated);
      localStorage.setItem("smart_task_manager_local_profile", JSON.stringify(updated));
      setEdit(false);
      window.dispatchEvent(new Event("profileUpdated"));
      setLoading(false);
      alert("Student records & attendance updated in Mock Mode!");
      return;
    }

    try {
      const targetUrl = isFaculty && selectedStudentId
        ? `${API}/api/profile/student/${selectedStudentId}`
        : `${API}/api/profile`;

      const res = await fetch(targetUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: studName,
          course: studCourse,
          year: studYear,
          branch: studBranch,
          attendance: Number(studAttendance) || 0,
        }),
      });

      const data = await res.json();
      if (isFaculty) {
        setAllStudents(allStudents.map(s => s._id === selectedStudentId ? data : s));
        alert("Student records & attendance published successfully!");
      } else {
        setStudent(data);
        alert("Profile details updated successfully!");
      }
      setEdit(false);
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.log(err);
      alert("Failed to update student profile");
    } finally {
      setLoading(false);
    }
  };

  // Update admin details
  const saveAdminProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...adminUser,
      name: admName,
      dept: admDept,
      office: admOffice
    };
    setAdminUser(updated);
    localStorage.setItem("smart_task_manager_local_admin_profile", JSON.stringify(updated));
    setEditAdmin(false);
  };

  // ==========================================
  // FACULTY ADMIN VIEW
  // ==========================================
  if (isFaculty) {
    return (
      <div className="w-full text-gray-800 space-y-8">
        {/* Faculty Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {!editAdmin ? (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-sm shrink-0">
                <span className="text-2xl font-bold text-white">ADM</span>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-850">{adminUser.name}</h2>
                  <p className="text-sm text-red-500 font-semibold">{adminUser.email}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Department</span>
                    <span className="text-sm font-bold text-gray-800">{adminUser.dept}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Office Location</span>
                    <span className="text-sm font-bold text-gray-800">{adminUser.office}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditAdmin(true)}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                >
                  Edit Admin Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={saveAdminProfile} className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                Edit Admin Profile details
              </h3>

              <div className="grid grid-cols-1 gap-3.5 text-xs font-semibold">
                <div>
                  <label className="block text-gray-600 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                    value={admName}
                    onChange={(e) => setAdmName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 uppercase tracking-wider mb-1">Department</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                    value={admDept}
                    onChange={(e) => setAdmDept(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 uppercase tracking-wider mb-1">Office Location</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                    value={admOffice}
                    onChange={(e) => setAdmOffice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditAdmin(false)}
                  className="bg-gray-150 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Admin Profile
                </button>
              </div>
            </form>
          )}
        </div>

        {/* attendance Registrar & enrollment Manager Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-850">Student Attendance & Academic Registrar</h3>
            <p className="text-xs text-gray-500 mt-1">Review student academic records and slide to insert/adjust overall attendance.</p>
          </div>

          <form onSubmit={saveStudentProfile} className="space-y-4 max-w-lg border-t border-gray-100 pt-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 uppercase tracking-wider mb-1">Manage Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs text-gray-850 focus:outline-none"
                >
                  {allStudents.map((s) => (
                    <option key={s._id || "student-mock"} value={s._id || "student-mock"}>
                      {s.name || "Unnamed Student"} ({s.email || "No Email"})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-600 uppercase tracking-wider mb-1">Student Name</label>
                <input
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                  value={studName}
                  onChange={(e) => setStudName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 uppercase tracking-wider mb-1">Course</label>
                <input
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                  value={studCourse}
                  onChange={(e) => setStudCourse(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-600 uppercase tracking-wider mb-1">Branch / Spec.</label>
                <input
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-normal text-gray-800 focus:outline-none focus:border-red-500 transition"
                  value={studBranch}
                  onChange={(e) => setStudBranch(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5 pt-2">
                <label className="block text-gray-750 uppercase tracking-wider font-bold">
                  Overall Student Attendance (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="flex-1 accent-red-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    value={studAttendance}
                    onChange={(e) => setStudAttendance(e.target.value)}
                  />
                  <span className="border border-gray-350 text-gray-800 font-extrabold px-3 py-1.5 rounded-lg bg-gray-50 text-sm min-w-[50px] text-center shadow-sm">
                    {studAttendance}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-xs active:scale-[0.98] transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Updating..." : "Publish Student Attendance & Records"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT VIEW (DISTRACTION-FREE & CLEAN)
  // ==========================================
  return (
    <div className="w-full text-gray-800">
      {!edit ? (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-2">
          {/* Avatar and Attendance details */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mt-1">
               Attendance: {student.attendance || 0}%
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{student.name || "Student Name"}</h2>
              <p className="text-sm text-blue-500 font-medium">{student.email || "student@university.edu"}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs font-semibold">
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Course</span>
                <span className="text-sm font-bold text-gray-800">{student.course || "Not Set"}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Year</span>
                <span className="text-sm font-bold text-gray-800">{student.year || "Not Set"}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl col-span-2 md:col-span-1">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Branch</span>
                <span className="text-sm font-bold text-gray-800">{student.branch || "Not Set"}</span>
              </div>
            </div>

            <button
              onClick={() => setEdit(true)}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-semibold active:scale-[0.98] transition cursor-pointer"
            >
              ✏️ Edit Student Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={saveStudentProfile} className="space-y-4 p-2 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            ✏️ Update Student Records
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-gray-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 font-normal"
                value={studName}
                onChange={(e) => setStudName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 uppercase tracking-wider mb-1">
                Course (e.g., B.Tech, M.S.)
              </label>
              <input
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 font-normal"
                value={studCourse}
                onChange={(e) => setStudCourse(e.target.value)}
                placeholder="e.g. B.Tech"
              />
            </div>

            <div>
              <label className="block text-gray-600 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <input
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 font-normal"
                value={studYear}
                onChange={(e) => setStudYear(e.target.value)}
                placeholder="e.g. 3rd Year"
              />
            </div>

            <div>
              <label className="block text-gray-600 uppercase tracking-wider mb-1">
                Branch / Specialization
              </label>
              <input
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 font-normal"
                value={studBranch}
                onChange={(e) => setStudBranch(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setEdit(false)}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs font-semibold cursor-pointer transition active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;