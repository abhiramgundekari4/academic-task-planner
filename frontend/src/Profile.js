import React, { useEffect, useState } from "react";
import { API, getToken } from "./api";

function Profile() {
  const token = getToken();
  const userRole = localStorage.getItem("userRole");
  const isFaculty = userRole === "admin" || (token && (token.includes("admin") || token.includes("faculty")));

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

  // Student Profile State
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
      branch: ""
    };
  });

  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [edit, setEdit] = useState(false);
  const [editAdmin, setEditAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states for Student Details
  const [studName, setStudName] = useState("");
  const [studCourse, setStudCourse] = useState("");
  const [studYear, setStudYear] = useState("");
  const [studBranch, setStudBranch] = useState("");

  // Form states for Admin Profile
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
    }
  };

  const fetchProfile = () => {
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
            branch: ""
          };
          setStudent(defaultProfile);
          setStudName(defaultProfile.name);
          setStudCourse(defaultProfile.course);
          setStudYear(defaultProfile.year);
          setStudBranch(defaultProfile.branch);
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

    fetch(`${API}/api/profile`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.msg) {
          if (isFaculty) {
            setAdminUser(data);
            setAdmName(data.name || "");
            setAdmDept(data.dept || "");
            setAdmOffice(data.office || "");
          } else {
            setStudent(data);
            setStudName(data.name || "");
            setStudCourse(data.course || "");
            setStudYear(data.year || "");
            setStudBranch(data.branch || "");
          }
        }
      })
      .catch((err) => console.log(err));

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

  const saveStudentProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (token === "mock-demo-token" || token === "mock-admin-token") {
      const updated = {
        ...student,
        name: studName,
        course: studCourse,
        year: studYear,
        branch: studBranch
      };
      setStudent(updated);
      localStorage.setItem("smart_task_manager_local_profile", JSON.stringify(updated));
      setEdit(false);
      window.dispatchEvent(new Event("profileUpdated"));
      setLoading(false);
      alert("Student profile updated in Mock Mode!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: studName,
          course: studCourse,
          year: studYear,
          branch: studBranch
        }),
      });

      const data = await res.json();
      setStudent(data);
      alert("Profile details updated successfully!");
      setEdit(false);
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.log(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const saveAdminProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (token === "mock-demo-token" || token === "mock-admin-token") {
      const updated = {
        ...adminUser,
        name: admName,
        dept: admDept,
        office: admOffice
      };
      setAdminUser(updated);
      localStorage.setItem("smart_task_manager_local_admin_profile", JSON.stringify(updated));
      setEditAdmin(false);
      setLoading(false);
      alert("Admin profile updated in Mock Mode!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: admName,
          dept: admDept,
          office: admOffice,
        }),
      });

      const data = await res.json();
      setAdminUser(data);
      setEditAdmin(false);
      alert("Faculty profile details updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to update faculty profile");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = allStudents.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.course || "").toLowerCase().includes(q) ||
      (s.branch || "").toLowerCase().includes(q) ||
      (s.year || "").toLowerCase().includes(q)
    );
  });

  const selectedStudentObj = allStudents.find(s => s._id === selectedStudentId);

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
                <span className="text-2xl font-bold text-white">FAC</span>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3.5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-850">{adminUser.name || "Faculty Member"}</h2>
                  <p className="text-sm text-red-500 font-semibold">{adminUser.email}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Department</span>
                    <span className="text-sm font-bold text-gray-800">{adminUser.dept || "Not Set"}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Office Location</span>
                    <span className="text-sm font-bold text-gray-800">{adminUser.office || "Not Set"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditAdmin(true)}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-655 px-5 py-2.5 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                >
                  Edit Faculty Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={saveAdminProfile} className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                Edit Faculty Profile Details
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
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-650 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Read-Only Student Academic Registry */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-855">Student Academic Registry</h3>
            <p className="text-xs text-gray-500 mt-1">
              Read-only view of students registered details. Students manage their own details under their respective profiles.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-gray-150 pt-4">
            {/* Search query */}
            <div className="w-full md:max-w-xs relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            
            {/* Selection Dropdown */}
            {allStudents.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto text-xs font-bold">
                <span className="text-gray-550 shrink-0">Selected Student Card:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 rounded-xl p-2 text-xs text-gray-800 focus:outline-none bg-white font-normal"
                >
                  {allStudents.map((s) => (
                    <option key={s._id || "student-mock"} value={s._id || "student-mock"}>
                      {s.name || "Unnamed Student"} ({s.email || "No Email"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Side-by-Side: Selected Student Details Card & Directory Table */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left/Main Column: Directory Table */}
            <div className="xl:col-span-2 overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Name</th>
                    <th className="p-3">Course / Branch</th>
                    <th className="p-3">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-gray-400 font-bold">
                        No student profiles match the search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr 
                        key={s._id} 
                        onClick={() => handleStudentChange(s._id)}
                        className={`cursor-pointer hover:bg-blue-50/50 transition ${selectedStudentId === s._id ? "bg-blue-50/60 font-medium" : ""}`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{s.name || "Unnamed Student"}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{s.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-700">{s.course || "N/A"}</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{s.branch || "N/A"}</span>
                        </td>
                        <td className="p-3 text-gray-600 font-semibold">{s.year || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Column: Selected Student Detailed Card */}
            <div>
              {selectedStudentObj ? (
                <div className="bg-gray-50 border border-gray-250 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      S
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-800">{selectedStudentObj.name || "Unnamed Student"}</h4>
                      <p className="text-[11px] text-gray-505 font-medium">{selectedStudentObj.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3.5 space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-lg">
                      <span className="text-gray-400 text-[10px] uppercase">Course</span>
                      <span className="text-gray-800 font-extrabold">{selectedStudentObj.course || "Not Set"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-lg">
                      <span className="text-gray-400 text-[10px] uppercase">Branch</span>
                      <span className="text-gray-800 font-extrabold">{selectedStudentObj.branch || "Not Set"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-lg">
                      <span className="text-gray-400 text-[10px] uppercase">Year</span>
                      <span className="text-gray-800 font-extrabold">{selectedStudentObj.year || "Not Set"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-250 border-dashed rounded-xl p-6 text-center text-gray-400 font-bold text-xs">
                  Select a student from the directory to view details.
                </div>
              )}
            </div>
          </div>
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
          {/* Avatar details */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{student.name || "Student Name"}</h2>
              <p className="text-sm text-blue-500 font-medium">{student.email || ""}</p>
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
              Edit Student Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={saveStudentProfile} className="space-y-4 p-2 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Update Student Records
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
                className="w-full border border-gray-350 rounded p-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 font-normal"
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