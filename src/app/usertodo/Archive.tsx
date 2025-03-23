import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css'; 

interface ArchivedTask {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  archived: number;
}

export default function Archive() {
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTask, setSelectedTask] = useState<ArchivedTask | null>(null);
  const tasksPerPage = 2; 

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/archived-tasks");
      setArchivedTasks(response.data);
    } catch (error) {
      setError("Failed to fetch archived tasks.");
      console.error("Error fetching archived tasks:", error);
      toast.error("Failed to fetch archived tasks.", { autoClose: 3000 }); // Show error toast with autoClose
    } finally {
      setLoading(false);
    }
  };

  const restoreTask = async (taskId: number) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/tasks/restore/${taskId}`);
      if (response.status === 200 && response.data.task.archived === 0) {
        setArchivedTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        toast.success("Task restored successfully!", { autoClose: 3000 }); // Show success toast with autoClose
      }
    } catch (error) {
      console.error("Error restoring task:", error);
      toast.error("Failed to restore task.", { autoClose: 3000 }); // Show error toast with autoClose
    }
  };

  const totalPages = Math.ceil(archivedTasks.length / tasksPerPage);
  const currentTasks = archivedTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  return (
    <section className="p-4 text-center bg-gray-700 text-white rounded-lg shadow-lg max-w-full mx-auto">
      <h3 className="text-lg font-bold bg-gray-800 p-3 rounded">Archived Tasks</h3>
      
      {loading ? (
        <p>Loading archived tasks...</p>
      ) : error ? (
        <p>{error}</p>
      ) : archivedTasks.length === 0 ? (
        <p>No archived tasks found.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
         <div className="overflow-x-auto">
  <table className="w-full min-w-[320px] md:min-w-[500px] border-collapse bg-gray-900 text-white border border-gray-600">
    <thead className="hidden md:table-header-group">
      <tr className="bg-gray-800 text-xs md:text-sm">
        <th className="p-2 border border-gray-600">ID</th>
        <th className="p-2 border border-gray-600">Title</th>
        <th className="p-2 border border-gray-600">Description</th>
        <th className="p-2 border border-gray-600">Status</th>
        <th className="p-2 border border-gray-600">Deadline</th>
        <th className="p-2 border border-gray-600">Action</th>
      </tr>
    </thead>
    <tbody>
      {currentTasks.map((task) => (
        <tr
          key={task.id}
          className="bg-gray-700 block md:table-row mb-2 md:mb-0 border border-gray-600 rounded-lg md:rounded-none md:border-none text-xs md:text-sm"
        >
          <td className="p-2 border border-gray-600 md:border-none block md:table-cell">{task.id}</td>
          <td
            className="p-2 border border-gray-600 md:border-none block md:table-cell font-bold cursor-pointer underline"
            onClick={() => setSelectedTask(task)}
          >
            {task.title}
          </td>
          <td className="p-2 border border-gray-600 md:border-none block md:table-cell">
            {task.description.length > 30 ? (
              <>
                {task.description.slice(0, 30)}...
                <button className="text-blue-400 ml-1 text-xs" onClick={() => setSelectedTask(task)}>
                  More
                </button>
              </>
            ) : (
              task.description
            )}
          </td>
          <td className="p-2 border border-gray-600 md:border-none block md:table-cell">{task.status}</td>
          <td className="p-2 border border-gray-600 md:border-none block md:table-cell">{task.deadline}</td>
          <td className="p-2 border border-gray-600 md:border-none block md:table-cell">
            <button
              onClick={() => restoreTask(task.id)}
              className="bg-green-600 text-white text-xs p-1 rounded hover:bg-green-500 w-full md:w-auto"
            >
              Restore
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
           
              }}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50 w-full md:w-auto">
              Previous
            </button>
            <span className="text-sm font-bold">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));

              }}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50 w-full md:w-auto">
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}