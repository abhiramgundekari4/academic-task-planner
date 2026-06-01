import { useEffect, useState } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const token = localStorage.getItem("token");

  // GET TASKS
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5002/api/tasks", {
      headers: {
        "x-auth-token": token
      }
    });

    const data = await res.json();
    setTasks(data);
  };

  // ADD TASK
  const addTask = async () => {
    await fetch("http://localhost:5002/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({ title })
    });

    setTitle("");
    fetchTasks();
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5002/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "x-auth-token": token
      }
    });

    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>My Tasks</h2>

      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={addTask}>Add</button>

      {tasks.map(task => (
        <div key={task._id}>
          {task.title}
          <button onClick={() => deleteTask(task._id)}>❌</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;