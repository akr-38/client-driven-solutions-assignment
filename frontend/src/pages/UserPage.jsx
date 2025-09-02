import { useEffect, useState } from "react";

const UserPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending"); // default filter

  const auth = JSON.parse(localStorage.getItem("auth"));
  const uid = auth?.firebaseUid;
  const token = auth?.token;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/assigned/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to fetch tasks");
          setLoading(false);
          return;
        }

        const filteredTasks = data.filter(task => task.status === statusFilter);
        setTasks(filteredTasks);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error fetching tasks");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [uid, token, statusFilter]);

  if (loading) return <p className="text-gray-300 text-center mt-10">Loading tasks...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center md:text-left flex-1">My Tasks</h1>
        <button
          onClick={() => {
            localStorage.removeItem("auth");
            window.location.reload(); // or redirect to /login
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Status filter dropdown */}
      <div className="mb-6 flex justify-center">
        <label htmlFor="statusFilter" className="mr-2">Show tasks:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-400">
          No tasks with status "{statusFilter}" assigned to you.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="font-semibold text-lg mb-2">{task.title}</h2>
              <p className="mb-3">{task.description}</p>

              {/* Status update dropdown */}
              <div className="mb-2">
                <label className="mr-2">Status:</label>
                <select
                  value={task.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: newStatus }),
                      });

                      const updatedTask = await res.json();
                      if (!res.ok) {
                        alert(updatedTask.error || "Failed to update status");
                        return;
                      }

                      setTasks((prev) =>
                        prev
                          .map((t) => (t._id === updatedTask._id ? updatedTask : t))
                          .filter((t) => t.status === statusFilter)
                      );

                      alert(`Task "${updatedTask.title}" status updated to "${updatedTask.status}"`);
                    } catch (err) {
                      console.error(err);
                      alert("Error updating task status");
                    }
                  }}
                  className="bg-gray-700 text-gray-100 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {task.dueDate && (
                <p className="text-gray-400 text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserPage;
