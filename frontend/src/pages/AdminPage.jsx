import { useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const AdminPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
  const [editTaskId, setEditTaskId] = useState(null);

  const [newUser, setNewUser] = useState({ email: "", password: "", role: "member" });

  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, userRes] = await Promise.all([
        fetch("http://localhost:5000/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/auth/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const tasksData = await taskRes.json();
      const usersData = await userRes.json();

      if (!taskRes.ok) alert(tasksData.error || "Failed to fetch tasks");
      if (!userRes.ok) alert(usersData.error || "Failed to fetch users");

      setTasks(tasksData);
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = tasks
    .filter(task => (statusFilter ? task.status === statusFilter : true))
    .filter(task => (assignedFilter ? task.assignedTo === assignedFilter : true))
    .filter(task =>
      searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editTaskId ? "PUT" : "POST";
      const url = editTaskId
        ? `http://localhost:5000/api/tasks/${editTaskId}`
        : "http://localhost:5000/api/tasks";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to save task");

      alert(editTaskId ? "Task updated" : "Task created");
      setNewTask({ title: "", description: "", assignedTo: "" });
      setEditTaskId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to delete task");

      alert("Task deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        newUser.email,
        newUser.password
      );

      const firebaseUid = userCredential.user.uid;

      const res = await fetch("http://localhost:5000/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firebaseUid,
          email: newUser.email,
          role: newUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to add user");

      alert("User successfully added!");
      setNewUser({ email: "", password: "", role: "member" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error adding user: " + err.message);
    }
  };

  if (loading) return <p className="text-gray-300 text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-center md:text-left flex-1">Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("auth");
            window.location.reload(); // or redirect to /login if you have one
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>

      <p className="text-center mb-6">Total tasks: {tasks.length}</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="bg-gray-800 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          {users
            .filter(user => user.role === "member")
            .map(user => (
              <option key={user.firebaseUid} value={user.firebaseUid}>{user.email}</option>
            ))}
        </select>

        <input
          type="text"
          placeholder="Search title/description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-800 text-gray-100 p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Task List */}
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {filteredTasks.map(task => (
          <li key={task._id} className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <strong className="text-lg">{task.title}</strong> - <span>{task.description}</span>
            <p className="mt-2 text-gray-400">
              Assigned to: {users.find(u => u.firebaseUid === task.assignedTo)?.email || "Unassigned"}
            </p>
            <p className="text-gray-400">Status: {task.status}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  setEditTaskId(task._id);
                  setNewTask({ title: task.title, description: task.description, assignedTo: task.assignedTo });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add Task & Add User side by side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Task Form */}
        <form
          onSubmit={handleTaskSubmit}
          className="flex-1 bg-gray-800 p-4 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4">{editTaskId ? "Edit Task" : "Add Task"}</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              required
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Assign to user</option>
              {users
                .filter(user => user.role === "member")
                .map(user => (
                  <option key={user.firebaseUid} value={user.firebaseUid}>{user.email}</option>
                ))}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors">
              {editTaskId ? "Update Task" : "Add Task"}
            </button>
          </div>
        </form>

        {/* Add User Form */}
        <form
          onSubmit={handleAddUser}
          className="flex-1 bg-gray-800 p-4 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="p-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
